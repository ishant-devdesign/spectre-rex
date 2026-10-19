/**
 * Editor content model — website-only, no classified.
 * Added: divider, callout, embed, button, stats, gallery
 */

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
  | "image"
  | "imageGroup"
  | "video"
  | "code"
  | "quote"
  | "divider"
  | "callout"
  | "embed"
  | "button"
  | "stats"
  | "gallery";

interface Base {
  id: string;
}

export type Block =
  | (Base & { type: "title"; text: string })
  | (Base & { type: "subtitle"; text: string })
  | (Base & { type: "paragraph"; text: string; size?: ParagraphSize })
  | (Base & { type: "list"; ordered: boolean; items: string[] })
  | (Base & { type: "table"; headers: string[]; rows: string[][] })
  | (Base & { type: "image"; src: string; alt: string; caption: string })
  | (Base & {
      type: "imageGroup";
      images: { src: string; alt: string }[];
      caption: string;
    })
  | (Base & { type: "video"; url: string; caption: string })
  | (Base & { type: "code"; text: string; label: string })
  | (Base & { type: "quote"; text: string; attribution: string })
  | (Base & { type: "divider" })
  | (Base & { type: "callout"; text: string; tone: "info" | "warning" | "success" })
  | (Base & { type: "embed"; url: string; caption: string })
  | (Base & { type: "button"; label: string; href: string; variant: "light" | "dark" | "outline" })
  | (Base & { type: "stats"; items: { label: string; value: string }[] })
  | (Base & { type: "gallery"; images: { src: string; alt: string; caption?: string }[] });

export const BLOCK_LABELS: Record<BlockType, string> = {
  title: "Title",
  subtitle: "Subtitle",
  paragraph: "Paragraph",
  list: "List",
  table: "Table",
  image: "Image",
  imageGroup: "Image group",
  video: "Video",
  code: "Highlighted",
  quote: "Quote",
  divider: "Divider",
  callout: "Callout",
  embed: "Embed",
  button: "Button",
  stats: "Stats",
  gallery: "Gallery",
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
    case "divider":
      return { id, type } as Block;
    case "callout":
      return { id, type, text: "", tone: "info" } as Block;
    case "embed":
      return { id, type, url: "", caption: "" } as Block;
    case "button":
      return { id, type, label: "Click me", href: "/", variant: "light" } as Block;
    case "stats":
      return { id, type, items: [{ label: "Label", value: "100" }] } as Block;
    case "gallery":
      return { id, type, images: [{ src: "", alt: "", caption: "" }] } as Block;
    default:
      return { id, type, text: "" } as Block;
  }
}

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

export function blocksToText(blocks: Block[], limit = 180): string {
  const first = blocks.find(
    (block) => block.type === "paragraph" && block.text.trim(),
  );
  const text = first && "text" in first ? first.text : "";
  return text.length > limit ? `${text.slice(0, limit).trimEnd()}…` : text;
}
