import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { Magnetic } from "@/components/motion/Magnetic";
import { TransitionLink } from "@/components/transition/TransitionLink";

/**
 * Signature button — square corners, pixel tag on the corner,
 * magnetic hover. Variants tuned for light and dark sections.
 */
export function Button({
  href,
  children,
  variant = "light",
  className = "",
  arrow = true,
  external = false,
}: {
  href: string;
  children: ReactNode;
  variant?: "light" | "outline-dark" | "dark";
  className?: string;
  arrow?: boolean;
  external?: boolean;
}) {
  const variants: Record<string, string> = {
    /* paper pill on night sections */
    light:
      "bg-paper text-night hover:bg-spectre hover:text-night",
    /* ghost outline on night sections */
    "outline-dark":
      "border border-paper/25 text-paper hover:border-paper hover:bg-paper hover:text-night",
    /* ink pill on paper sections */
    dark: "bg-ink text-paper hover:bg-spectre hover:text-night",
  };

  return (
    <Magnetic className={`inline-block ${className}`}>
      <TransitionLink
        href={href}
        {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
        className={`group relative inline-flex items-center gap-3 px-7 py-4 font-body text-[15px] font-semibold tracking-[-0.01em] transition-colors duration-300 ${variants[variant]}`}
      >
        {/* pixel tag */}
        <span
          aria-hidden="true"
          className="absolute -top-1 -right-1 h-2 w-2 bg-spectre transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-[.hover-light]:bg-paper"
        />
        <span className="inline-flex items-center gap-2">{children}</span>
        {arrow && (
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        )}
      </TransitionLink>
    </Magnetic>
  );
}
