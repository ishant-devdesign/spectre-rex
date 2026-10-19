"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, FileText, Layers, Mail, Loader2 } from "lucide-react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { PixelLoader } from "@/components/admin/PixelLoader";

type TemplateKind = "signal" | "project" | "email";

interface Template {
  id: string;
  name: string;
  kind: TemplateKind;
  blocks: any[];
  updatedAt: string;
}

const KIND_ICON: Record<TemplateKind, any> = {
  signal: FileText,
  project: Layers,
  email: Mail,
};

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState<TemplateKind | null>(null);

  const load = () => {
    setLoading(true);
    fetch("/api/templates")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setTemplates(data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const create = async (kind: TemplateKind) => {
    setCreating(kind);
    try {
      const res = await fetch("/api/templates", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: `New ${kind} template`, kind }),
      });
      const data = await res.json();
      if (data.ok && data.id) {
        window.location.href = `/admin/templates/${data.id}`;
      } else {
        alert(data.error || "Failed to create template");
      }
    } catch (e) {
      alert("Failed to create template");
    } finally {
      setCreating(null);
    }
  };

  if (loading) {
    return (
      <main className="mx-auto max-w-[1240px] px-5 py-10 md:px-10 md:py-14">
        <AdminHeader current="templates" />
        <PixelLoader label="Loading templates..." />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-[1240px] px-5 py-10 md:px-10 md:py-14">
      <AdminHeader current="templates" />

      <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-[1.8rem] font-extrabold tracking-[-0.03em]">Templates</h1>
          <p className="mt-1.5 font-pixel text-[9.5px] tracking-[0.28em] text-paper/40 uppercase">
            {templates.length} total · reusable for signals, projects, emails
          </p>
        </div>
        <div className="flex gap-2">
          {(["signal", "project", "email"] as TemplateKind[]).map((kind) => (
            <button
              key={kind}
              onClick={() => create(kind)}
              disabled={creating === kind}
              className="inline-flex items-center gap-1.5 border border-paper/20 px-3 py-2 font-pixel text-[9px] tracking-[0.2em] text-paper/60 uppercase hover:border-spectre hover:text-spectre disabled:opacity-50"
            >
              {creating === kind ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />} {kind}
            </button>
          ))}
        </div>
      </div>

      {templates.length === 0 ? (
        <p className="mt-8 border border-paper/12 bg-white/[0.02] px-6 py-14 text-center text-[15px] text-paper/45">
          No templates yet. Create one for signals, projects, or emails.
        </p>
      ) : (
        <ul className="mt-8 border-t border-paper/12">
          {templates.map((t) => {
            const Icon = KIND_ICON[t.kind] ?? FileText;
            return (
              <li key={t.id} className="flex items-center justify-between gap-4 border-b border-paper/12 py-4">
                <Link href={`/admin/templates/${t.id}`} className="flex min-w-0 items-center gap-3">
                  <span className="grid h-8 w-8 place-items-center border border-paper/20 text-paper/50">
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-display text-[1.05rem] font-bold tracking-[-0.01em]">{t.name}</p>
                    <p className="font-pixel text-[9px] tracking-[0.2em] text-paper/40 uppercase">
                      {t.kind} · {t.blocks?.length ?? 0} blocks · {new Date(t.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </Link>
                <Link
                  href={`/admin/templates/${t.id}`}
                  className="shrink-0 border border-paper/20 px-3 py-1.5 font-pixel text-[9px] tracking-[0.2em] text-paper/60 uppercase hover:border-spectre"
                >
                  Edit
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
