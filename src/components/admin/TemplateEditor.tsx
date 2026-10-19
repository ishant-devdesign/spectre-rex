"use client";

import { useState, useTransition } from "react";
import { ChevronDown, ChevronUp, Plus, Save, Trash2, X, ArrowLeft } from "lucide-react";
import { BLOCK_LABELS, emptyBlock, type Block, type BlockType, PARAGRAPH_SIZES } from "@/lib/blocks";
import { saveTemplate, deleteTemplate } from "@/app/(admin)/admin/templates/actions";
import { ImageField } from "./ImageField";
import { ConfirmDialog } from "./ConfirmDialog";
import type { Template } from "@/lib/templates";
import Link from "next/link";

const FIELD =
  "w-full border border-paper/20 bg-white/[0.03] px-3.5 py-2.5 font-body text-[14.5px] text-paper placeholder:text-paper/25 outline-none transition-colors duration-300 focus:border-spectre";
const LABEL =
  "mb-2 block font-pixel text-[9.5px] tracking-[0.28em] text-paper/40 uppercase";

export function TemplateEditor({ template }: { template: Template }) {
  const [name, setName] = useState(template.name);
  const [kind, setKind] = useState(template.kind);
  const [title, setTitle] = useState(template.title ?? "");
  const [subtitle, setSubtitle] = useState(template.subtitle ?? "");
  const [summary, setSummary] = useState(template.summary ?? "");
  const [heroImage, setHeroImage] = useState(template.heroImage ?? "");
  const [blocks, setBlocks] = useState<Block[]>(template.blocks);
  const [emailOptions, setEmailOptions] = useState<Record<string, any>>(template.emailOptions ?? {});
  const [adding, setAdding] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingBlockId, setPendingBlockId] = useState<string | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [saved, setSaved] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const update = (id: string, patch: Partial<Block>) =>
    setBlocks((list) => list.map((b) => (b.id === id ? ({ ...b, ...patch } as Block) : b)));
  const remove = (id: string) => {
    setPendingBlockId(id);
    setConfirmOpen(true);
  };
  const move = (index: number, delta: number) =>
    setBlocks((list) => {
      const next = [...list];
      const target = index + delta;
      if (target < 0 || target >= next.length) return list;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });

  function persist() {
    startTransition(async () => {
      await saveTemplate({ id: template.id, name, kind, title, subtitle, summary, heroImage, blocks, emailOptions });
      setSaved("Saved");
      setTimeout(() => setSaved(null), 2000);
    });
  }

  return (
    <div className="min-h-svh bg-night text-paper">
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-paper/12 bg-night px-5 py-3 md:px-10">
        <Link href="/admin/templates" className="inline-flex items-center gap-2 font-pixel text-[10px] tracking-[0.28em] text-paper/60 uppercase hover:text-spectre">
          <ArrowLeft className="h-3.5 w-3.5" /> Templates
        </Link>
        <div className="flex items-center gap-2">
          <span className="font-pixel text-[9px] tracking-[0.2em] text-paper/40 uppercase">{kind}</span>
          {saved ? <span className="font-pixel text-[9px] tracking-[0.2em] text-spectre uppercase">{saved}</span> : null}
        </div>
      </div>

      <div className="mx-auto grid max-w-[1240px] gap-10 px-5 py-8 md:grid-cols-[1fr_300px] md:px-10">
        <div>
          <div className="grid gap-4 border border-paper/12 bg-white/[0.02] p-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className={LABEL}>Template name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} className={FIELD} placeholder="My signal template" />
              </div>
              <div>
                <label className={LABEL}>Kind</label>
                <select value={kind} onChange={(e) => setKind(e.target.value as any)} className={FIELD}>
                  <option value="signal">Signal</option>
                  <option value="project">Project</option>
                  <option value="email">Email</option>
                </select>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className={LABEL}>Title (optional)</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} className={FIELD} />
              </div>
              <div>
                <label className={LABEL}>Subtitle</label>
                <input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} className={FIELD} />
              </div>
            </div>
            <div>
              <label className={LABEL}>Summary</label>
              <textarea rows={2} value={summary} onChange={(e) => setSummary(e.target.value)} className={`${FIELD} resize-y`} />
            </div>
            <div>
              <span className={LABEL}>Hero image</span>
              <ImageField value={heroImage} onChange={setHeroImage} />
            </div>

            {kind === "email" ? (
              <div className="grid gap-4 border-t border-paper/10 pt-5">
                <p className="font-pixel text-[9.5px] tracking-[0.28em] text-spectre uppercase">Email options</p>
                <div className="grid gap-3 md:grid-cols-2">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={!!emailOptions.includeLatestProjects} onChange={(e) => setEmailOptions({ ...emailOptions, includeLatestProjects: e.target.checked })} className="h-4 w-4 accent-[#35AEE4]" />
                    <span className="font-pixel text-[9px] uppercase text-paper/60">Include latest projects</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={!!emailOptions.includeLatestSignals} onChange={(e) => setEmailOptions({ ...emailOptions, includeLatestSignals: e.target.checked })} className="h-4 w-4 accent-[#35AEE4]" />
                    <span className="font-pixel text-[9px] uppercase text-paper/60">Include latest signals</span>
                  </label>
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                  <div>
                    <span className={LABEL}>Latest count</span>
                    <input type="number" min={1} max={6} value={emailOptions.latestCount ?? 3} onChange={(e) => setEmailOptions({ ...emailOptions, latestCount: Number(e.target.value) })} className={FIELD} />
                  </div>
                  <div>
                    <span className={LABEL}>CTA label</span>
                    <input value={emailOptions.ctaLabel ?? ""} onChange={(e) => setEmailOptions({ ...emailOptions, ctaLabel: e.target.value })} className={FIELD} placeholder="Read full" />
                  </div>
                  <div>
                    <span className={LABEL}>CTA URL</span>
                    <input value={emailOptions.ctaUrl ?? ""} onChange={(e) => setEmailOptions({ ...emailOptions, ctaUrl: e.target.value })} className={FIELD} placeholder="https://..." />
                  </div>
                </div>
                <div>
                  <span className={LABEL}>Custom footer</span>
                  <input value={emailOptions.customFooter ?? ""} onChange={(e) => setEmailOptions({ ...emailOptions, customFooter: e.target.value })} className={FIELD} placeholder="Extra footer text" />
                </div>
              </div>
            ) : null}
          </div>

          <ul className="mt-6 space-y-4">
            {blocks.map((block, index) => (
              <li key={block.id} className="border border-paper/12 bg-white/[0.02]">
                <header className="flex items-center justify-between border-b border-paper/10 px-4 py-2.5">
                  <span className="font-pixel text-[9.5px] tracking-[0.28em] text-spectre uppercase">{BLOCK_LABELS[block.type]}</span>
                  <div className="flex items-center gap-1">
                    <button onClick={() => move(index, -1)} disabled={index === 0} className="grid h-7 w-7 place-items-center text-paper/45 hover:text-paper disabled:opacity-25">
                      <ChevronUp className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => move(index, 1)} disabled={index === blocks.length - 1} className="grid h-7 w-7 place-items-center text-paper/45 hover:text-paper disabled:opacity-25">
                      <ChevronDown className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => remove(block.id)} className="grid h-7 w-7 place-items-center text-paper/45 hover:text-paper">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </header>
                <div className="p-4">
                  <BlockFields block={block} update={update} />
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-5">
            {adding ? (
              <div className="border border-paper/12 bg-white/[0.02] p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="font-pixel text-[9.5px] tracking-[0.28em] text-paper/40 uppercase">Add block</span>
                  <button onClick={() => setAdding(false)} className="grid h-7 w-7 place-items-center text-paper/45">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(BLOCK_LABELS) as BlockType[]).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => {
                        setBlocks((l) => [...l, emptyBlock(type)]);
                        setAdding(false);
                      }}
                      className="border border-paper/20 px-3 py-2 font-pixel text-[9.5px] tracking-[0.22em] text-paper/70 uppercase hover:border-spectre hover:bg-spectre hover:text-night"
                    >
                      {BLOCK_LABELS[type]}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <button onClick={() => setAdding(true)} className="inline-flex items-center gap-2 border border-paper/25 px-4 py-2.5 font-pixel text-[10px] tracking-[0.24em] text-paper/70 uppercase hover:border-spectre hover:bg-spectre hover:text-night">
                <Plus className="h-3.5 w-3.5" /> Add block
              </button>
            )}
          </div>
        </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete block?"
        message="This block will be permanently removed. This cannot be undone."
        confirmLabel="Delete"
        onConfirm={() => {
          if (pendingBlockId) {
            setBlocks((list) => list.filter((b) => b.id !== pendingBlockId));
          }
          setConfirmOpen(false);
          setPendingBlockId(null);
        }}
        onCancel={() => {
          setConfirmOpen(false);
          setPendingBlockId(null);
        }}
      />

        <aside className="lg:sticky lg:top-20">
          <div className="border border-paper/12 bg-white/[0.02] p-5">
            <p className="font-pixel text-[9.5px] tracking-[0.28em] text-paper/40 uppercase">Actions</p>
            <div className="mt-5 grid gap-2.5">
              <button
                onClick={persist}
                disabled={pending}
                className="inline-flex items-center justify-center gap-2 bg-paper px-4 py-3 font-pixel text-[10px] tracking-[0.24em] text-night uppercase hover:bg-spectre disabled:opacity-50"
              >
                <Save className="h-3.5 w-3.5" /> Save template
              </button>
              <button
                type="button"
                onClick={() => setConfirmDeleteOpen(true)}
                className="w-full border border-red-500/30 px-4 py-3 font-pixel text-[10px] tracking-[0.24em] text-red-400 uppercase hover:border-red-500 hover:bg-red-500/10"
              >
                Delete template
              </button>

              <ConfirmDialog
                open={confirmDeleteOpen}
                title="Delete template?"
                message={`Template "${name}" will be permanently deleted. This cannot be undone.`}
                confirmLabel="Delete template"
                onConfirm={async () => {
                  try {
                    await deleteTemplate(template.id);
                  } catch {}
                }}
                onCancel={() => setConfirmDeleteOpen(false)}
                variant="danger"
              />
            </div>
            <p className="mt-4 text-[11px] leading-relaxed text-paper/30">
              Templates are reusable starters for signals, projects, and emails. Load them from the editor dropdown.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function BlockFields({
  block,
  update,
}: {
  block: Block;
  update: (id: string, patch: Partial<Block>) => void;
}) {
  const FIELD =
    "w-full border border-paper/20 bg-white/[0.03] px-3.5 py-2.5 font-body text-[14.5px] text-paper placeholder:text-paper/25 outline-none transition-colors duration-300 focus:border-spectre";
  switch (block.type) {
    case "title":
    case "subtitle":
      return <input value={block.text} onChange={(e) => update(block.id, { text: e.target.value })} className={FIELD} />;
    case "paragraph":
      return (
        <div className="grid gap-2.5">
          <textarea rows={4} value={block.text} onChange={(e) => update(block.id, { text: e.target.value })} className={`${FIELD} resize-y`} placeholder="Body — supports <b> <i> <u> <code> <reveal>" />
          <div className="flex flex-wrap gap-2">
            {PARAGRAPH_SIZES.map((opt) => (
              <button
                key={opt.value}
                onClick={() => update(block.id, { size: opt.value as any })}
                className={`border px-2.5 py-1 font-pixel text-[9px] tracking-[0.2em] uppercase ${ (block.size ?? "base") === opt.value ? "border-spectre bg-spectre text-night" : "border-paper/20 text-paper/50"}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      );
    case "divider":
      return <p className="font-pixel text-[9px] text-paper/30 uppercase">Divider — no settings</p>;
    case "callout":
      return (
        <div className="grid gap-3">
          <textarea rows={3} value={block.text} onChange={(e) => update(block.id, { text: e.target.value })} className={`${FIELD} resize-y`} placeholder="Callout — supports <b> <i> <reveal>" />
          <div className="flex gap-2">
            {(["info", "warning", "success"] as const).map((tone) => (
              <button key={tone} onClick={() => update(block.id, { tone })} className={`border px-3 py-1.5 font-pixel text-[9px] uppercase ${block.tone === tone ? "border-spectre bg-spectre text-night" : "border-paper/20 text-paper/50"}`}>{tone}</button>
            ))}
          </div>
        </div>
      );
    case "embed":
      return (
        <div className="grid gap-3">
          <input value={block.url} onChange={(e) => update(block.id, { url: e.target.value })} className={FIELD} placeholder="https://..." />
          <input value={block.caption} onChange={(e) => update(block.id, { caption: e.target.value })} className={FIELD} placeholder="Caption" />
        </div>
      );
    case "button":
      return (
        <div className="grid gap-3 md:grid-cols-3">
          <input value={block.label} onChange={(e) => update(block.id, { label: e.target.value })} className={FIELD} placeholder="Label" />
          <input value={block.href} onChange={(e) => update(block.id, { href: e.target.value })} className={FIELD} placeholder="Href" />
          <select value={block.variant} onChange={(e) => update(block.id, { variant: e.target.value as any })} className={FIELD}>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="outline">Outline</option>
          </select>
        </div>
      );
    case "stats":
      return (
        <div className="grid gap-2">
          {block.items.map((it, idx) => (
            <div key={idx} className="flex gap-2">
              <input value={it.value} onChange={(e) => { const items = [...block.items]; items[idx] = { ...items[idx], value: e.target.value }; update(block.id, { items }); }} className={FIELD} placeholder="Value" />
              <input value={it.label} onChange={(e) => { const items = [...block.items]; items[idx] = { ...items[idx], label: e.target.value }; update(block.id, { items }); }} className={FIELD} placeholder="Label" />
              <button onClick={() => update(block.id, { items: block.items.filter((_, i) => i !== idx) })} className="grid h-10 w-10 place-items-center border border-paper/20 text-paper/45">✕</button>
            </div>
          ))}
          <button onClick={() => update(block.id, { items: [...block.items, { label: "Label", value: "100" }] })} className="text-[11px] uppercase text-paper/50 hover:text-spectre">+ Add stat</button>
        </div>
      );
    case "gallery":
      return (
        <div className="grid gap-2">
          {block.images.map((img, idx) => (
            <div key={idx} className="flex gap-2">
              <input value={img.src} onChange={(e) => { const images = [...block.images]; images[idx] = { ...images[idx], src: e.target.value }; update(block.id, { images }); }} className={FIELD} placeholder="Src" />
              <input value={img.alt} onChange={(e) => { const images = [...block.images]; images[idx] = { ...images[idx], alt: e.target.value }; update(block.id, { images }); }} className={FIELD} placeholder="Alt" />
              <button onClick={() => update(block.id, { images: block.images.filter((_, i) => i !== idx) })} className="grid h-10 w-10 place-items-center border border-paper/20">✕</button>
            </div>
          ))}
          <button onClick={() => update(block.id, { images: [...block.images, { src: "", alt: "" }] })} className="text-[11px] uppercase text-paper/50 hover:text-spectre">+ Add image</button>
        </div>
      );
    case "quote":
      return (
        <div className="grid gap-3">
          <textarea rows={2} value={block.text} onChange={(e) => update(block.id, { text: e.target.value })} className={`${FIELD} resize-y`} />
          <input value={block.attribution} onChange={(e) => update(block.id, { attribution: e.target.value })} className={FIELD} placeholder="Attribution" />
        </div>
      );
    case "code":
      return (
        <div className="grid gap-3">
          <input value={block.label} onChange={(e) => update(block.id, { label: e.target.value })} className={FIELD} placeholder="Label" />
          <textarea rows={4} value={block.text} onChange={(e) => update(block.id, { text: e.target.value })} className={`${FIELD} resize-y font-mono`} />
        </div>
      );
    case "list":
      return (
        <div className="grid gap-2">
          {block.items.map((it, idx) => (
            <div key={idx} className="flex gap-2">
              <input value={it} onChange={(e) => { const items = [...block.items]; items[idx] = e.target.value; update(block.id, { items }); }} className={FIELD} />
              <button onClick={() => update(block.id, { items: block.items.filter((_, i) => i !== idx) })} className="grid h-7 w-7 place-items-center border border-paper/20">✕</button>
            </div>
          ))}
          <button onClick={() => update(block.id, { items: [...block.items, ""] })} className="text-[11px] uppercase text-paper/50">+ Add item</button>
        </div>
      );
    case "table":
      return <p className="text-[12px] text-paper/40">Table editing in full editor — use EntryEditor for tables</p>;
    case "image":
    case "imageGroup":
    case "video":
      return <p className="text-[12px] text-paper/40">Use main EntryEditor for {block.type}</p>;
    default:
      return null;
  }
}
