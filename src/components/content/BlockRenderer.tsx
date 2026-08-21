import Image from "next/image";
import type { Block } from "@/lib/blocks";
import { Redacted } from "@/components/ui/chrome";
import { RevealBlock } from "@/components/content/RevealBlock";

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
          {block.text}
        </h2>
      );

    case "subtitle":
      return (
        <h3 className="mt-2 font-display text-[1.35rem] leading-snug font-bold tracking-[-0.02em] md:text-[1.6rem]">
          {block.text}
        </h3>
      );

    case "paragraph":
      return (
        <p className="text-[16.5px] leading-relaxed text-ink/75">
          {block.text}
        </p>
      );

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

    case "classified":
      return (
        <p className="flex flex-wrap items-center gap-x-2 gap-y-3 text-[16.5px] leading-relaxed text-ink/75">
          {block.text ? <span>{block.text}</span> : null}
          <Redacted count={block.blocks} />
        </p>
      );

    case "reveal":
      return <RevealBlock label={block.label} text={block.text} />;

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
            “{block.text}”
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
