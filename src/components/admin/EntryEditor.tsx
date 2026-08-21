"use client";

import { useState, useTransition } from "react";
import {
  ChevronDown,
  ChevronUp,
  Eye,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import {
  BLOCK_LABELS,
  emptyBlock,
  type Block,
  type BlockType,
} from "@/lib/blocks";
import { saveEntry, type Entry } from "@/app/(admin)/admin/entries/actions";

const FIELD =
  "w-full border border-paper/20 bg-white/[0.03] px-3.5 py-2.5 font-body text-[14.5px] text-paper placeholder:text-paper/25 outline-none transition-colors duration-300 focus:border-spectre";
const LABEL =
  "mb-2 block font-pixel text-[9.5px] tracking-[0.28em] text-paper/40 uppercase";

export function EntryEditor({ entry }: { entry: Entry }) {
  const [title, setTitle] = useState(entry.title);
  const [subtitle, setSubtitle] = useState(entry.subtitle);
  const [slug, setSlug] = useState(entry.slug);
  const [code, setCode] = useState(entry.code);
  const [summary, setSummary] = useState(entry.summary);
  const [classified, setClassified] = useState(entry.classified);
  const [status, setStatus] = useState(entry.status);
  const [blocks, setBlocks] = useState<Block[]>(entry.blocks);
  const [adding, setAdding] = useState(false);
  const [saved, setSaved] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const update = (id: string, patch: Partial<Block>) =>
    setBlocks((list) =>
      list.map((block) =>
        block.id === id ? ({ ...block, ...patch } as Block) : block,
      ),
    );
  const remove = (id: string) =>
    setBlocks((list) => list.filter((block) => block.id !== id));
  const move = (index: number, delta: number) =>
    setBlocks((list) => {
      const next = [...list];
      const target = index + delta;
      if (target < 0 || target >= next.length) return list;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });

  function persist(nextStatus: "draft" | "published") {
    setStatus(nextStatus);
    startTransition(async () => {
      await saveEntry({
        kind: entry.kind,
        id: entry.id,
        title,
        subtitle,
        slug,
        code,
        summary,
        classified,
        status: nextStatus,
        blocks,
      });
      setSaved(
        nextStatus === "published" ? "Published" : "Draft saved",
      );
      setTimeout(() => setSaved(null), 2600);
    });
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
      {/* ------------------------------- blocks ------------------------ */}
      <div>
        <div className="grid gap-4 border border-paper/12 bg-white/[0.02] p-5 md:p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className={LABEL} htmlFor="title">
                Title
              </label>
              <input
                id="title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className={FIELD}
              />
            </div>
            <div>
              <label className={LABEL} htmlFor="subtitle">
                Subtitle
              </label>
              <input
                id="subtitle"
                value={subtitle}
                onChange={(event) => setSubtitle(event.target.value)}
                className={FIELD}
              />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-[100px_1fr]">
            <div>
              <label className={LABEL} htmlFor="code">
                Code
              </label>
              <input
                id="code"
                value={code}
                onChange={(event) => setCode(event.target.value)}
                className={FIELD}
              />
            </div>
            <div>
              <label className={LABEL} htmlFor="slug">
                Slug
              </label>
              <input
                id="slug"
                value={slug}
                onChange={(event) => setSlug(event.target.value)}
                className={FIELD}
              />
            </div>
          </div>
          <div>
            <label className={LABEL} htmlFor="summary">
              Summary
            </label>
            <textarea
              id="summary"
              rows={2}
              value={summary}
              onChange={(event) => setSummary(event.target.value)}
              className={`${FIELD} resize-y`}
            />
          </div>
        </div>

        <ul className="mt-6 space-y-4">
          {blocks.map((block, index) => (
            <li
              key={block.id}
              className="border border-paper/12 bg-white/[0.02]"
            >
              <header className="flex items-center justify-between border-b border-paper/10 px-4 py-2.5">
                <span className="font-pixel text-[9.5px] tracking-[0.28em] text-spectre uppercase">
                  {BLOCK_LABELS[block.type]}
                </span>
                <div className="flex items-center gap-1">
                  <IconButton
                    label="Move up"
                    onClick={() => move(index, -1)}
                    disabled={index === 0}
                  >
                    <ChevronUp className="h-3.5 w-3.5" />
                  </IconButton>
                  <IconButton
                    label="Move down"
                    onClick={() => move(index, 1)}
                    disabled={index === blocks.length - 1}
                  >
                    <ChevronDown className="h-3.5 w-3.5" />
                  </IconButton>
                  <IconButton label="Delete" onClick={() => remove(block.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </IconButton>
                </div>
              </header>
              <div className="p-4">
                <BlockFields block={block} update={update} />
              </div>
            </li>
          ))}
        </ul>

        {/* ---------------------------- add block ---------------------- */}
        <div className="mt-5">
          {adding ? (
            <div className="border border-paper/12 bg-white/[0.02] p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="font-pixel text-[9.5px] tracking-[0.28em] text-paper/40 uppercase">
                  Add block
                </span>
                <IconButton label="Close" onClick={() => setAdding(false)}>
                  <X className="h-3.5 w-3.5" />
                </IconButton>
              </div>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(BLOCK_LABELS) as BlockType[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      setBlocks((list) => [...list, emptyBlock(type)]);
                      setAdding(false);
                    }}
                    className="border border-paper/20 px-3 py-2 font-pixel text-[9.5px] tracking-[0.22em] text-paper/70 uppercase transition-colors duration-300 hover:border-spectre hover:bg-spectre hover:text-night"
                  >
                    {BLOCK_LABELS[type]}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setAdding(true)}
              className="inline-flex items-center gap-2 border border-paper/25 px-4 py-2.5 font-pixel text-[10px] tracking-[0.24em] text-paper/70 uppercase transition-colors duration-300 hover:border-spectre hover:bg-spectre hover:text-night"
            >
              <Plus className="h-3.5 w-3.5" />
              Add block
            </button>
          )}
        </div>
      </div>

      {/* ------------------------------ sidebar ------------------------ */}
      <aside className="lg:sticky lg:top-8">
        <div className="border border-paper/12 bg-white/[0.02] p-5">
          <p className="font-pixel text-[9.5px] tracking-[0.28em] text-paper/40 uppercase">
            Status
          </p>
          <p
            className={`mt-3 inline-flex items-center border px-3 py-1.5 font-pixel text-[10px] tracking-[0.24em] uppercase ${
              status === "published"
                ? "border-spectre bg-spectre text-night"
                : "border-paper/30 text-paper/70"
            }`}
          >
            {status}
          </p>

          <label className="mt-6 flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={classified}
              onChange={(event) => setClassified(event.target.checked)}
              className="h-4 w-4 accent-[#35AEE4]"
            />
            <span className="font-pixel text-[9.5px] tracking-[0.24em] text-paper/60 uppercase">
              Classified
            </span>
          </label>

          <div className="mt-7 grid gap-2.5">
            <button
              type="button"
              disabled={pending}
              onClick={() => persist("draft")}
              className="inline-flex items-center justify-center gap-2 border border-paper/25 px-4 py-3 font-pixel text-[10px] tracking-[0.24em] text-paper/80 uppercase transition-colors duration-300 hover:border-paper disabled:opacity-50"
            >
              <Save className="h-3.5 w-3.5" />
              Save draft
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => persist("published")}
              className="inline-flex items-center justify-center gap-2 bg-paper px-4 py-3 font-pixel text-[10px] tracking-[0.24em] text-night uppercase transition-colors duration-300 hover:bg-spectre disabled:opacity-50"
            >
              Publish
            </button>
            <a
              href={`/admin/entries/${entry.kind}/${entry.id}/preview`}
              className="inline-flex items-center justify-center gap-2 border border-paper/25 px-4 py-3 font-pixel text-[10px] tracking-[0.24em] text-paper/80 uppercase transition-colors duration-300 hover:border-spectre"
            >
              <Eye className="h-3.5 w-3.5" />
              Preview
            </a>
          </div>

          {saved ? (
            <p className="mt-5 font-pixel text-[9.5px] tracking-[0.24em] text-spectre uppercase">
              {saved}
            </p>
          ) : null}
          <p className="mt-5 font-pixel text-[9px] tracking-[0.22em] text-paper/25 uppercase">
            {blocks.length} block{blocks.length === 1 ? "" : "s"}
          </p>
        </div>
      </aside>
    </div>
  );
}

function IconButton({
  children,
  label,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="grid h-7 w-7 place-items-center border border-transparent text-paper/45 transition-colors duration-200 hover:border-paper/25 hover:text-paper disabled:opacity-25 disabled:hover:border-transparent"
    >
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Per-type fields                                                     */
/* ------------------------------------------------------------------ */

function BlockFields({
  block,
  update,
}: {
  block: Block;
  update: (id: string, patch: Partial<Block>) => void;
}) {
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
        <textarea
          rows={4}
          value={block.text}
          onChange={(event) => update(block.id, { text: event.target.value })}
          placeholder="Body copy"
          className={`${FIELD} resize-y`}
        />
      );

    case "classified":
      return (
        <div className="grid gap-3 md:grid-cols-[1fr_120px]">
          <input
            value={block.text}
            onChange={(event) => update(block.id, { text: event.target.value })}
            placeholder="Visible lead-in (optional)"
            className={FIELD}
          />
          <input
            type="number"
            min={1}
            max={40}
            value={block.blocks}
            onChange={(event) =>
              update(block.id, { blocks: Number(event.target.value) || 1 })
            }
            className={FIELD}
          />
        </div>
      );

    case "reveal":
      return (
        <div className="grid gap-3">
          <input
            value={block.label}
            onChange={(event) => update(block.id, { label: event.target.value })}
            placeholder="Button label"
            className={FIELD}
          />
          <textarea
            rows={3}
            value={block.text}
            onChange={(event) => update(block.id, { text: event.target.value })}
            placeholder="Hidden text"
            className={`${FIELD} resize-y`}
          />
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
              <IconButton
                label="Remove item"
                onClick={() =>
                  update(block.id, {
                    items: block.items.filter((_, i) => i !== index),
                  })
                }
              >
                <X className="h-3.5 w-3.5" />
              </IconButton>
            </div>
          ))}
          <AddRow
            label="Add item"
            onClick={() => update(block.id, { items: [...block.items, ""] })}
          />
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
            <AddRow
              label="Column"
              onClick={() =>
                update(block.id, {
                  headers: [...block.headers, ""],
                  rows: block.rows.map((row) => [...row, ""]),
                })
              }
            />
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
              <IconButton
                label="Remove row"
                onClick={() =>
                  update(block.id, {
                    rows: block.rows.filter((_, i) => i !== rowIndex),
                  })
                }
              >
                <X className="h-3.5 w-3.5" />
              </IconButton>
            </div>
          ))}
          <AddRow
            label="Row"
            onClick={() =>
              update(block.id, {
                rows: [...block.rows, block.headers.map(() => "")],
              })
            }
          />
        </div>
      );

    case "image":
      return (
        <div className="grid gap-3">
          <input
            value={block.src}
            onChange={(event) => update(block.id, { src: event.target.value })}
            placeholder="/assets/img/example.jpg"
            className={FIELD}
          />
          <div className="grid gap-3 md:grid-cols-2">
            <input
              value={block.alt}
              onChange={(event) => update(block.id, { alt: event.target.value })}
              placeholder="Alt text"
              className={FIELD}
            />
            <input
              value={block.caption}
              onChange={(event) =>
                update(block.id, { caption: event.target.value })
              }
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
            <div key={index} className="flex gap-2">
              <input
                value={image.src}
                onChange={(event) => {
                  const images = block.images.map((item, i) =>
                    i === index ? { ...item, src: event.target.value } : item,
                  );
                  update(block.id, { images });
                }}
                placeholder="/assets/img/example.jpg"
                className={FIELD}
              />
              <input
                value={image.alt}
                onChange={(event) => {
                  const images = block.images.map((item, i) =>
                    i === index ? { ...item, alt: event.target.value } : item,
                  );
                  update(block.id, { images });
                }}
                placeholder="Alt"
                className={`${FIELD} max-w-[150px]`}
              />
              <IconButton
                label="Remove image"
                onClick={() =>
                  update(block.id, {
                    images: block.images.filter((_, i) => i !== index),
                  })
                }
              >
                <X className="h-3.5 w-3.5" />
              </IconButton>
            </div>
          ))}
          <AddRow
            label="Add image"
            onClick={() =>
              update(block.id, {
                images: [...block.images, { src: "", alt: "" }],
              })
            }
          />
          <input
            value={block.caption}
            onChange={(event) =>
              update(block.id, { caption: event.target.value })
            }
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
            onChange={(event) =>
              update(block.id, { caption: event.target.value })
            }
            placeholder="Caption"
            className={FIELD}
          />
        </div>
      );

    default:
      return null;
  }
}

function AddRow({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex w-fit items-center gap-1.5 font-pixel text-[9px] tracking-[0.24em] text-paper/45 uppercase transition-colors hover:text-spectre"
    >
      <Plus className="h-3 w-3" />
      {label}
    </button>
  );
}
