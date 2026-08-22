import Image from "next/image";
import { Clip } from "@/components/motion/bits";
import { ArrowSquare, Chip } from "@/components/ui/chrome";

/**
 * Concept card. Presentational only.
 *
 * This used to wrap itself in a TransitionLink pointing at /projects. Once
 * callers began wrapping it in a link to the entry, that produced nested
 * anchors -- which is invalid HTML, and browsers resolve it by splitting the
 * element, so only the part after the inner anchor stayed clickable. Hence
 * "only the lower part is clickable". Linking is the caller's job now.
 */
export function ConceptCard({
  index,
  image,
  title,
  caption = "Not a game reveal",
  dark = true,
  className = "",
}: {
  index: string;
  image: string;
  /** Already redacted by the read layer when the entry is classified. */
  title: string;
  caption?: string;
  dark?: boolean;
  className?: string;
}) {
  return (
    <div className={`group block ${className}`}>
      <Clip className={`relative aspect-[4/3] ${dark ? "bg-night" : "bg-ghost"}`}>
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ transform: "scale(1.28)" }}
        >
          <Image
            src={image}
            alt={title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
          />
          <div
            aria-hidden
            className={`absolute inset-0 transition-opacity duration-500 ${
              dark
                ? "bg-night/25 opacity-0 group-hover:opacity-100"
                : "bg-ink/10 opacity-0 group-hover:opacity-100"
            }`}
          />
          <span
            className={`absolute top-3 left-3 border px-2 py-1 font-pixel text-[9px] tracking-[0.26em] uppercase backdrop-blur-sm ${
              dark
                ? "border-paper/25 bg-night/40 text-paper/80"
                : "border-ink/20 bg-paper/50 text-ink/70"
            }`}
          >
            Concept {index}
          </span>
        </div>
      </Clip>

      <div
        className={`mt-5 flex items-start justify-between gap-4 border-t pt-4 ${
          dark ? "border-paper/12" : "border-ink/10"
        }`}
      >
        {/* min-w-0: a flex item defaults to min-width:auto, so this column
            refused to shrink below its content and shoved the (shrink-0)
            arrow past the card edge onto the next one. */}
        <div className="min-w-0">
          <div
            className={`flex flex-wrap items-center gap-x-1.5 font-display text-lg font-bold tracking-[-0.01em] ${
              dark ? "text-paper" : "text-ink"
            }`}
          >
            <span className="truncate">{title}</span>
          </div>
          <div className="mt-2.5 flex flex-wrap items-center gap-2.5">
            <Chip tone={dark ? "paper" : "ink"}>Abstract exploration</Chip>
            <span
              className={`font-pixel text-[9px] tracking-[0.24em] uppercase ${
                dark ? "text-paper/35" : "text-ink/40"
              }`}
            >
              {caption}
            </span>
          </div>
        </div>
        <ArrowSquare tone={dark ? "paper" : "ink"} />
      </div>
    </div>
  );
}
