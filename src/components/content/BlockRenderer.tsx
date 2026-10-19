import Image from "next/image";
import type { Block } from "@/lib/blocks";
import { RichText } from "@/components/content/RichText";

/**
 * Renders editor blocks for the public site. Shared by the live pages and
 * the admin preview, so what an editor sees is what ships.
 */
export function BlockRenderer({ blocks }: { blocks: Block[] }) {
  if (blocks.length === 0) return null;
  return (
    <div className="space-y-8">
      {blocks.map((block) => (
        <BlockView key={block.id} block={block} />
      ))}
    </div>
  );
}

function BlockView({ block }: { block: Block }) {
  switch (block.type) {
    case "title":
      return (
        <h2 className="mt-4 font-display text-[2rem] leading-tight font-extrabold tracking-[-0.03em] md:text-[2.6rem]">
          <RichText text={block.text} />
        </h2>
      );

    case "subtitle":
      return (
        <h3 className="mt-2 font-display text-[1.35rem] leading-snug font-bold tracking-[-0.02em] md:text-[1.6rem]">
          <RichText text={block.text} />
        </h3>
      );

    case "paragraph": {
      /* Size is per-block so an author can open with a lead paragraph
         without reaching for a heading, which would lie to screen readers
         about the document outline. */
      const scale = {
        sm: "text-[14.5px] leading-relaxed text-ink/60",
        base: "text-[16.5px] leading-relaxed text-ink/75",
        lg: "text-[18.5px] leading-relaxed text-ink/80",
        lead: "text-[21px] leading-[1.55] text-ink/85 md:text-[23px]",
      }[block.size ?? "base"];
      return (
        <p className={scale}>
          <RichText text={block.text} />
        </p>
      );
    }

    case "list": {
      const List = block.ordered ? "ol" : "ul";
      return (
        <List
          className={`space-y-2.5 pl-1 text-[16px] leading-relaxed text-ink/75 ${
            block.ordered ? "list-decimal pl-5" : ""
          }`}
        >
          {block.items.filter(Boolean).map((item, index) => (
            <li key={index} className="flex gap-3">
              {!block.ordered && (
                <span
                  aria-hidden
                  className="mt-[0.55em] h-1.5 w-1.5 shrink-0 bg-spectre"
                />
              )}
              <span>{item}</span>
            </li>
          ))}
        </List>
      );
    }

    case "table":
      return (
        <div className="overflow-x-auto border border-ink/12">
          <table className="w-full border-collapse text-left text-[14.5px]">
            <thead>
              <tr className="bg-ink/[0.04]">
                {block.headers.map((header, index) => (
                  <th
                    key={index}
                    className="border-b border-ink/12 px-4 py-3 font-pixel text-[10px] tracking-[0.24em] text-ink/50 uppercase"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, rowIndex) => (
                <tr key={rowIndex} className="border-b border-ink/8 last:border-0">
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} className="px-4 py-3 text-ink/75">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case "divider":
      return (
        <div className="flex items-center gap-4 py-2">
          <span className="h-px flex-1 bg-ink/10" />
          <span className="h-1.5 w-1.5 bg-spectre" />
          <span className="h-px flex-1 bg-ink/10" />
        </div>
      );

    case "callout":
      return (
        <div
          className={`border-l-2 px-5 py-4 text-[15px] leading-relaxed ${
            block.tone === "warning"
              ? "border-amber-500 bg-amber-500/10 text-amber-900"
              : block.tone === "success"
                ? "border-emerald-500 bg-emerald-500/10 text-emerald-900"
                : "border-spectre bg-ghost text-ink/80"
          }`}
        >
          <RichText text={block.text} />
        </div>
      );

    case "embed":
      return (
        <figure>
          <div className="relative aspect-video overflow-hidden bg-night">
            {block.url ? (
              <iframe
                src={toEmbed(block.url)}
                title={block.caption || "Embed"}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 h-full w-full"
              />
            ) : null}
          </div>
          {block.caption ? (
            <figcaption className="mt-3 font-pixel text-[10px] tracking-[0.26em] text-ink/40 uppercase">
              {block.caption}
            </figcaption>
          ) : null}
        </figure>
      );

    case "button":
      return (
        <div className="py-2">
          <a
            href={block.href || "#"}
            className={`inline-flex items-center gap-2 px-6 py-3 font-pixel text-[11px] tracking-[0.24em] uppercase transition-colors ${
              block.variant === "dark"
                ? "bg-night text-paper hover:bg-ink"
                : block.variant === "outline"
                  ? "border border-ink/20 bg-transparent text-ink hover:border-ink hover:bg-ink hover:text-paper"
                  : "bg-paper text-night hover:bg-spectre"
            }`}
          >
            {block.label}
          </a>
        </div>
      );

    case "stats":
      return (
        <div className="grid gap-px border border-ink/12 bg-ink/12 sm:grid-cols-3">
          {block.items.map((item, i) => (
            <div key={i} className="bg-paper px-6 py-8">
              <p className="font-display text-[2rem] font-extrabold leading-none tracking-[-0.02em]">{item.value}</p>
              <p className="mt-2 font-pixel text-[10px] tracking-[0.24em] text-ink/50 uppercase">{item.label}</p>
            </div>
          ))}
        </div>
      );

    case "gallery":
      return (
        <figure>
          <div className="grid gap-3 sm:grid-cols-2">
            {block.images
              .filter((img) => img.src)
              .map((img, i) => (
                <div key={i} className="relative aspect-[4/3] overflow-hidden bg-night">
                  <Image src={img.src} alt={img.alt} fill sizes="(min-width:640px) 50vw, 100vw" className="object-cover" />
                  {img.caption ? (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-night/80 to-transparent p-3">
                      <p className="font-pixel text-[9px] tracking-[0.2em] text-paper/70 uppercase">{img.caption}</p>
                    </div>
                  ) : null}
                </div>
              ))}
          </div>
        </figure>
      );

    case "image":
      return (
        <figure>
          <div className="relative aspect-[16/9] overflow-hidden bg-night">
            {block.src ? (
              <Image
                src={block.src}
                alt={block.alt}
                fill
                sizes="(min-width: 1024px) 760px, 100vw"
                className="object-cover"
              />
            ) : null}
          </div>
          {block.caption ? (
            <figcaption className="mt-3 font-pixel text-[10px] tracking-[0.26em] text-ink/40 uppercase">
              {block.caption}
            </figcaption>
          ) : null}
        </figure>
      );

    case "imageGroup":
      return (
        <figure>
          <div className="grid gap-3 sm:grid-cols-2">
            {block.images
              .filter((image) => image.src)
              .map((image, index) => (
                <div
                  key={index}
                  className="relative aspect-[4/3] overflow-hidden bg-night"
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    sizes="(min-width: 640px) 380px, 100vw"
                    className="object-cover"
                  />
                </div>
              ))}
          </div>
          {block.caption ? (
            <figcaption className="mt-3 font-pixel text-[10px] tracking-[0.26em] text-ink/40 uppercase">
              {block.caption}
            </figcaption>
          ) : null}
        </figure>
      );

    case "video":
      return (
        <figure>
          <div className="relative aspect-video overflow-hidden bg-night">
            {block.url ? (
              <iframe
                src={toEmbed(block.url)}
                title={block.caption || "Video"}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 h-full w-full"
              />
            ) : null}
          </div>
          {block.caption ? (
            <figcaption className="mt-3 font-pixel text-[10px] tracking-[0.26em] text-ink/40 uppercase">
              {block.caption}
            </figcaption>
          ) : null}
        </figure>
      );

    case "code":
      return (
        <div className="border border-ink/12 bg-night text-paper">
          {block.label ? (
            <p className="border-b border-paper/12 px-5 py-2.5 font-pixel text-[9.5px] tracking-[0.3em] text-paper/45 uppercase">
              {block.label}
            </p>
          ) : null}
          <pre className="overflow-x-auto px-5 py-5">
            <code className="font-pixel text-[13px] leading-relaxed whitespace-pre-wrap">
              {block.text}
            </code>
          </pre>
        </div>
      );

    case "quote":
      return (
        <figure className="border-l-2 border-spectre pl-6">
          <blockquote className="font-display text-[1.5rem] leading-snug font-semibold tracking-[-0.02em] text-ink md:text-[1.85rem]">
            “<RichText text={block.text} />”
          </blockquote>
          {block.attribution ? (
            <figcaption className="mt-4 font-pixel text-[10px] tracking-[0.3em] text-ink/45 uppercase">
              — {block.attribution}
            </figcaption>
          ) : null}
        </figure>
      );

    default:
      return null;
  }
}

/** Accepts a watch URL or an embed URL and returns something embeddable. */
function toEmbed(url: string): string {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtu.be")) {
      return `https://www.youtube.com/embed${parsed.pathname}`;
    }
    if (parsed.hostname.includes("youtube.com")) {
      const id = parsed.searchParams.get("v");
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
    if (parsed.hostname.includes("vimeo.com") && !parsed.pathname.startsWith("/video")) {
      return `https://player.vimeo.com/video${parsed.pathname}`;
    }
    return url;
  } catch {
    return url;
  }
}
