import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

/**
 * Admin shell. Deliberately free of the site chrome — no nav, footer,
 * smooth scroll, pixel transition or first-load intro. It shares the
 * palette and pixel type so it still feels like the same studio.
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-svh bg-night text-paper">{children}</div>;
}
