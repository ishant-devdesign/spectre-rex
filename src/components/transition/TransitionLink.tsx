"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  useCallback,
  type AnchorHTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from "react";
import { usePremiumNavigate } from "./PremiumLoader";

interface TransitionLinkProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  href: string;
  children: ReactNode;
}

export function TransitionLink({
  href,
  children,
  onClick,
  target,
  ...rest
}: TransitionLinkProps) {
  const router = useRouter();
  const pathname = usePathname();
  const navigate = usePremiumNavigate();
  const internal =
    !href.startsWith("http") &&
    !href.startsWith("mailto:") &&
    !href.startsWith("tel:") &&
    !href.startsWith("#");

  const warm = useCallback(() => {
    if (internal) router.prefetch(href);
  }, [internal, href, router]);

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (event.defaultPrevented) return;
    if (
      !internal ||
      target === "_blank" ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }
    event.preventDefault();
    if (href === pathname) return;
    navigate(href);
  };

  return (
    <Link
      href={href}
      target={target}
      onClick={handleClick}
      onPointerEnter={warm}
      onFocus={warm}
      {...rest}
    >
      {children}
    </Link>
  );
}
