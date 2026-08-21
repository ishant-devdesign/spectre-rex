import type { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import { TransitionLink } from "@/components/transition/TransitionLink";

/**
 * Editorial list row — the shared skeleton behind the contact channels,
 * the signal archive and the studio's operating principles, so they all
 * read as one component family: meta column, title (plus optional line),
 * action square, and a hover state that bleeds the full width of the
 * section with the content still aligned to the grid.
 *
 * Omit `href` for a static row: it renders a div, drops the arrow and the
 * accent bar, and loses the hover highlight — a hover affordance on
 * something you cannot click is a lie.
 *
 * Rows carry only a top border; the list that renders them closes the
 * stack with its own `border-b`, which avoids the doubled hairline you
 * get from `last:border-b` inside a wrapper element.
 */
export function ListRow({
  href,
  external = false,
  meta,
  title,
  description,
  breakTitle = false,
  ariaLabel,
}: {
  /** omit for a non-interactive row */
  href?: string;
  external?: boolean;
  meta: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  breakTitle?: boolean;
  ariaLabel?: string;
}) {
  const interactive = Boolean(href);

  const body = (
    <>
      {interactive ? (
        <span
          aria-hidden
          className="absolute top-1/2 left-0 h-0 w-[3px] -translate-y-1/2 bg-spectre transition-all duration-300 group-hover:h-[62%]"
        />
      ) : null}
      <div className="mx-auto grid max-w-[1440px] items-center gap-5 px-5 py-8 md:grid-cols-12 md:gap-6 md:px-10 md:py-10">
        {/* Stacked, not inline: the identifier row reads first, tags sit
            under it. items-start keeps chips at their content width. */}
        <div className="flex flex-col items-start gap-2.5 transition-transform duration-300 group-hover:translate-x-1 md:col-span-3">
          {meta}
        </div>

        <div className={interactive ? "md:col-span-7" : "md:col-span-9"}>
          <h3
            className={`font-display text-[1.45rem] leading-tight font-bold tracking-[-0.02em] text-ink md:text-[2rem] ${
              interactive
                ? "transition-colors duration-300 group-hover:text-spectre"
                : ""
            } ${breakTitle ? "break-all" : ""}`}
          >
            {title}
          </h3>
          {description ? (
            <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-ink/55">
              {description}
            </p>
          ) : null}
        </div>

        {interactive ? (
          <div className="hidden md:col-span-2 md:block md:justify-self-end">
            <span className="grid h-11 w-11 place-items-center border border-ink/20 transition-colors duration-300 group-hover:border-spectre group-hover:bg-spectre group-hover:text-night">
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </span>
          </div>
        ) : null}
      </div>
    </>
  );

  const className = `group relative block border-t border-ink/10 ${
    interactive ? "transition-colors duration-300 hover:bg-ghost/70" : ""
  }`;

  if (!href) {
    return <div className={className}>{body}</div>;
  }

  if (external) {
    return (
      <a href={href} aria-label={ariaLabel} className={className}>
        {body}
      </a>
    );
  }

  return (
    <TransitionLink href={href} aria-label={ariaLabel} className={className}>
      {body}
    </TransitionLink>
  );
}
