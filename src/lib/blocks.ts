/**
 * Editor content model.
 *
 * Entries store an ordered array of typed blocks as JSONB. Keeping the
 * shape here means the editor, the renderer and the server actions all
 * agree on one definition — add a variant once and every consumer is
 * type-checked against it.
 */

/** Paragraph scale. `lead` is the oversized opener under a headline. */
export type ParagraphSize = "sm" | "base" | "lg" | "lead";

export const PARAGRAPH_SIZES: { value: ParagraphSize; label: string }[] = [
  { value: "sm", label: "Small" },
  { value: "base", label: "Normal" },
  { value: "lg", label: "Large" },
  { value: "lead", label: "Lead" },
];

export type BlockType =
  | "title"
  | "subtitle"
  | "paragraph"
  | "list"
  | "table"
  | "classified"
  | "reveal"
  | "image"
  | "imageGroup"
  | "video"
  | "code"
  | "quote";

interface Base {
  id: string;
}

export type Block =
  | (Base & { type: "title"; text: string })
  | (Base & { type: "subtitle"; text: string })
  | (Base & { type: "paragraph"; text: string; size?: ParagraphSize })
  | (Base & { type: "list"; ordered: boolean; items: string[] })
  | (Base & { type: "table"; headers: string[]; rows: string[][] })
  | (Base & { type: "classified"; text: string; blocks: number })
  | (Base & { type: "reveal"; label: string; text: string })
  | (Base & { type: "image"; src: string; alt: string; caption: string })
  | (Base & {
      type: "imageGroup";
      images: { src: string; alt: string }[];
      caption: string;
    })
  | (Base & { type: "video"; url: string; caption: string })
  | (Base & { type: "code"; text: string; label: string })
  | (Base & { type: "quote"; text: string; attribution: string });

export const BLOCK_LABELS: Record<BlockType, string> = {
  title: "Title",
  subtitle: "Subtitle",
  paragraph: "Paragraph",
  list: "List",
  table: "Table",
  classified: "Classified",
  reveal: "Click to reveal",
  image: "Image",
  imageGroup: "Image group",
  video: "Video",
  code: "Highlighted",
  quote: "Quote",
};

export function newId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function emptyBlock(type: BlockType): Block {
  const id = newId();
  switch (type) {
    case "list":
      return { id, type, ordered: false, items: [""] };
    case "table":
      return { id, type, headers: ["", ""], rows: [["", ""]] };
    case "classified":
      return { id, type, text: "", blocks: 8 };
    case "reveal":
      return { id, type, label: "Reveal", text: "" };
    case "image":
      return { id, type, src: "", alt: "", caption: "" };
    case "imageGroup":
      return { id, type, images: [{ src: "", alt: "" }], caption: "" };
    case "video":
      return { id, type, url: "", caption: "" };
    case "code":
      return { id, type, text: "", label: "" };
    case "quote":
      return { id, type, text: "", attribution: "" };
    default:
      return { id, type, text: "" } as Block;
  }
}

/**
 * Blocks arrive from JSONB, so they are `unknown` until proven otherwise.
 * Anything malformed is dropped rather than crashing a page render.
 */
export function parseBlocks(value: unknown): Block[] {
  if (!Array.isArray(value)) return [];
  const out: Block[] = [];
  for (const raw of value) {
    if (!raw || typeof raw !== "object") continue;
    const item = raw as Record<string, unknown>;
    const type = item.type;
    if (typeof type !== "string" || !(type in BLOCK_LABELS)) continue;
    out.push({
      ...(item as object),
      id: typeof item.id === "string" ? item.id : newId(),
    } as Block);
  }
  return out;
}

/** Plain-text summary, used for excerpts and list previews. */
export function blocksToText(blocks: Block[], limit = 180): string {
  const first = blocks.find(
    (block) => block.type === "paragraph" && block.text.trim(),
  );
  const text = first && "text" in first ? first.text : "";
  return text.length > limit ? `${text.slice(0, limit).trimEnd()}…` : text;
}
