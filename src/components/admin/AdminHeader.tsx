import Link from "next/link";
import { LogOut } from "lucide-react";
import { LogoMark } from "@/components/svg/LogoMark";

const TABS = [
  { href: "/admin", label: "Inbox", key: "inbox" },
  { href: "/admin/entries", label: "Content", key: "entries" },
];

export function AdminHeader({ current }: { current: "inbox" | "entries" }) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-6 border-b border-paper/12 pb-8">
      <div className="flex items-center gap-6">
        <LogoMark className="h-[26px] w-auto" />
        <nav className="flex gap-1">
          {TABS.map((tab) => (
            <Link
              key={tab.key}
              href={tab.href}
              className={`px-3 py-2 font-pixel text-[10px] tracking-[0.24em] uppercase transition-colors duration-300 ${
                current === tab.key
                  ? "text-spectre"
                  : "text-paper/40 hover:text-paper"
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </nav>
      </div>
      <form action="/auth/signout" method="post">
        <button
          type="submit"
          className="inline-flex items-center gap-2 border border-paper/25 px-3.5 py-2 font-pixel text-[10px] tracking-[0.24em] text-paper/70 uppercase transition-colors duration-300 hover:border-spectre hover:bg-spectre hover:text-night"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign out
        </button>
      </form>
    </header>
  );
}
