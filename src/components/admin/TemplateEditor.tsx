"use client";

import { useState, useTransition } from "react";
import { ChevronDown, ChevronUp, Plus, Save, Trash2, X } from "lucide-react";
import { BLOCK_LABELS, emptyBlock, type Block, type BlockType, PARAGRAPH_SIZES } from "@/lib/blocks";
import { saveTemplate, deleteTemplate } from "@/app/(admin)/admin/templates/actions";
import { ImageField } from "./ImageField";
import type { Template } from "@/lib/templates";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

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
  const [adding, setAdding] = useState(false);
  const [saved, setSaved] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const update = (id: string, patch: Partial<Block>) =>
    setBlocks((list) => list.map((b) => (b.id === id ? ({ ...b, ...patch } as Block) : b)));
  const remove = (id: string) => setBlocks((list) => list.filter((b) => b.id !== id));
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
      await saveTemplate({ id: template.id, name, kind, title, subtitle, summary, heroImage, blocks });
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
              <form action={deleteTemplate.bind(null, template.id)}>
                <button
                  type="submit"
                  className="w-full border border-red-500/30 px-4 py-3 font-pixel text-[10px] tracking-[0.24em] text-red-400 uppercase hover:border-red-500 hover:bg-red-500/10"
                >
                  Delete template
                </button>
              </form>
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
  const LABEL =
    "mb-2 block font-pixel text-[9.5px] tracking-[0.28em] text-paper/40 uppercase";
  switch (block.type) {
    case "title":
    case "subtitle":
      return (
        <input
          value={block.text}
          onChange={(event) => update(block.id, { text: event.target.value })}
          placeholder="Heading text"
          className={FIELD}
        />
      );

    case "paragraph":
      return (
        <div className="grid gap-2.5">
          <textarea
            rows={4}
            value={block.text}
            onChange={(event) => update(block.id, { text: event.target.value })}
            placeholder="Body copy"
            className={`${FIELD} resize-y`}
          />
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-pixel text-[9px] tracking-[0.24em] text-paper/35 uppercase">
              Size
            </span>
            {PARAGRAPH_SIZES.map((option) => {
              const active = (block.size ?? "base") === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => update(block.id, { size: option.value })}
                  className={`border px-2.5 py-1 font-pixel text-[9px] tracking-[0.2em] uppercase transition-colors duration-300 ${
                    active
                      ? "border-spectre bg-spectre text-night"
                      : "border-paper/20 text-paper/50 hover:text-paper"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      );

    case "divider":
      return <p className="font-pixel text-[9px] tracking-[0.24em] text-paper/30 uppercase">Divider — no settings</p>;

    case "callout":
      return (
        <div className="grid gap-3">
          <textarea
            rows={3}
            value={block.text}
            onChange={(event) => update(block.id, { text: event.target.value })}
            placeholder="Callout text — supports <b> <i> <reveal> inline"
            className={`${FIELD} resize-y`}
          />
          <div className="flex gap-2">
            {(["info", "warning", "success"] as const).map((tone) => (
              <button
                key={tone}
                type="button"
                onClick={() => update(block.id, { tone })}
                className={`border px-3 py-1.5 font-pixel text-[9px] tracking-[0.2em] uppercase ${block.tone === tone ? "border-spectre bg-spectre text-night" : "border-paper/20 text-paper/50"}`}
              >
                {tone}
              </button>
            ))}
          </div>
        </div>
      );

    case "quote":
      return (
        <div className="grid gap-3">
          <textarea
            rows={2}
            value={block.text}
            onChange={(event) => update(block.id, { text: event.target.value })}
            placeholder="Quote"
            className={`${FIELD} resize-y`}
          />
          <input
            value={block.attribution}
            onChange={(event) =>
              update(block.id, { attribution: event.target.value })
            }
            placeholder="Attribution"
            className={FIELD}
          />
        </div>
      );

    case "code":
      return (
        <div className="grid gap-3">
          <input
            value={block.label}
            onChange={(event) => update(block.id, { label: event.target.value })}
            placeholder="Label (optional)"
            className={FIELD}
          />
          <textarea
            rows={5}
            value={block.text}
            onChange={(event) => update(block.id, { text: event.target.value })}
            placeholder="Highlighted text"
            className={`${FIELD} resize-y font-pixel`}
          />
        </div>
      );

    case "list":
      return (
        <div className="grid gap-3">
          <label className="flex cursor-pointer items-center gap-2.5">
            <input
              type="checkbox"
              checked={block.ordered}
              onChange={(event) =>
                update(block.id, { ordered: event.target.checked })
              }
              className="h-4 w-4 accent-[#35AEE4]"
            />
            <span className="font-pixel text-[9.5px] tracking-[0.24em] text-paper/55 uppercase">
              Numbered
            </span>
          </label>
          {block.items.map((item, index) => (
            <div key={index} className="flex gap-2">
              <input
                value={item}
                onChange={(event) => {
                  const items = [...block.items];
                  items[index] = event.target.value;
                  update(block.id, { items });
                }}
                placeholder={`Item ${index + 1}`}
                className={FIELD}
              />
              <button
                type="button"
                onClick={() =>
                  update(block.id, {
                    items: block.items.filter((_, i) => i !== index),
                  })
                }
                className="grid h-7 w-7 place-items-center border border-paper/20 text-paper/45 hover:text-paper"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => update(block.id, { items: [...block.items, ""] })}
            className="inline-flex w-fit items-center gap-1.5 font-pixel text-[9px] tracking-[0.24em] text-paper/45 uppercase hover:text-spectre"
          >
            <Plus className="h-3 w-3" /> Add item
          </button>
        </div>
      );

    case "table":
      return (
        <div className="grid gap-3">
          <div className="flex flex-wrap gap-2">
            {block.headers.map((header, index) => (
              <input
                key={index}
                value={header}
                onChange={(event) => {
                  const headers = [...block.headers];
                  headers[index] = event.target.value;
                  update(block.id, { headers });
                }}
                placeholder={`Header ${index + 1}`}
                className={`${FIELD} max-w-[190px]`}
              />
            ))}
            <button
              type="button"
              onClick={() =>
                update(block.id, {
                  headers: [...block.headers, ""],
                  rows: block.rows.map((row) => [...row, ""]),
                })
              }
              className="inline-flex w-fit items-center gap-1.5 font-pixel text-[9px] tracking-[0.24em] text-paper/45 uppercase hover:text-spectre"
            >
              <Plus className="h-3 w-3" /> Column
            </button>
          </div>
          {block.rows.map((row, rowIndex) => (
            <div key={rowIndex} className="flex flex-wrap gap-2">
              {row.map((cell, cellIndex) => (
                <input
                  key={cellIndex}
                  value={cell}
                  onChange={(event) => {
                    const rows = block.rows.map((r) => [...r]);
                    rows[rowIndex][cellIndex] = event.target.value;
                    update(block.id, { rows });
                  }}
                  className={`${FIELD} max-w-[190px]`}
                />
              ))}
              <button
                type="button"
                onClick={() =>
                  update(block.id, {
                    rows: block.rows.filter((_, i) => i !== rowIndex),
                  })
                }
                className="grid h-7 w-7 place-items-center border border-paper/20 text-paper/45 hover:text-paper"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              update(block.id, {
                rows: [...block.rows, block.headers.map(() => "")],
              })
            }
            className="inline-flex w-fit items-center gap-1.5 font-pixel text-[9px] tracking-[0.24em] text-paper/45 uppercase hover:text-spectre"
          >
            <Plus className="h-3 w-3" /> Row
          </button>
        </div>
      );

    case "image":
      return (
        <div className="grid gap-3">
          <ImageField value={block.src} onChange={(src) => update(block.id, { src })} />
          <div className="grid gap-3 md:grid-cols-2">
            <input
              value={block.alt}
              onChange={(event) => update(block.id, { alt: event.target.value })}
              placeholder="Alt text"
              className={FIELD}
            />
            <input
              value={block.caption}
              onChange={(event) => update(block.id, { caption: event.target.value })}
              placeholder="Caption"
              className={FIELD}
            />
          </div>
        </div>
      );

    case "imageGroup":
      return (
        <div className="grid gap-3">
          {block.images.map((image, index) => (
            <div key={index} className="grid gap-2 border border-paper/10 p-3">
              <ImageField
                value={image.src}
                onChange={(src) => {
                  const images = block.images.map((item, i) =>
                    i === index ? { ...item, src } : item,
                  );
                  update(block.id, { images });
                }}
              />
              <div className="flex gap-2">
                <input
                  value={image.alt}
                  onChange={(event) => {
                    const images = block.images.map((item, i) =>
                      i === index ? { ...item, alt: event.target.value } : item,
                    );
                    update(block.id, { images });
                  }}
                  placeholder="Alt text"
                  className={FIELD}
                />
                <button
                  type="button"
                  onClick={() =>
                    update(block.id, {
                      images: block.images.filter((_, i) => i !== index),
                    })
                  }
                  className="grid h-7 w-7 place-items-center border border-paper/20 text-paper/45 hover:text-paper"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              update(block.id, {
                images: [...block.images, { src: "", alt: "" }],
              })
            }
            className="inline-flex w-fit items-center gap-1.5 font-pixel text-[9px] tracking-[0.24em] text-paper/45 uppercase hover:text-spectre"
          >
            <Plus className="h-3 w-3" /> Add image
          </button>
          <input
            value={block.caption}
            onChange={(event) => update(block.id, { caption: event.target.value })}
            placeholder="Caption"
            className={FIELD}
          />
        </div>
      );

    case "video":
      return (
        <div className="grid gap-3">
          <input
            value={block.url}
            onChange={(event) => update(block.id, { url: event.target.value })}
            placeholder="https://youtube.com/watch?v=…"
            className={FIELD}
          />
          <input
            value={block.caption}
            onChange={(event) => update(block.id, { caption: event.target.value })}
            placeholder="Caption"
            className={FIELD}
          />
        </div>
      );

    default:
      return null;
  }
}

