"use client";

import { Fragment, useId, useState, type ReactNode } from "react";

/**
 * Inline formatting — <b> <i> <u> <code> <reveal>
 * <reveal> is now full-sentence length, not a small button.
 */

const TAGS = ["b", "i", "u", "code", "reveal"] as const;
type Tag = (typeof TAGS)[number];

type Node =
  | { kind: "text"; value: string }
  | { kind: "tag"; tag: Tag; children: Node[] };

const TOKEN = /<(\/?)(b|i|u|code|reveal)>/gi;

export function parseRich(input: string): Node[] {
  const root: Node[] = [];
  const stack: Node[][] = [root];
  const open: Tag[] = [];
  let last = 0;

  const push = (node: Node) => stack[stack.length - 1].push(node);
  const text = (value: string) => {
    if (value) push({ kind: "text", value });
  };

  TOKEN.lastIndex = 0;
  for (let m = TOKEN.exec(input); m; m = TOKEN.exec(input)) {
    text(input.slice(last, m.index));
    last = m.index + m[0].length;

    const tag = m[2].toLowerCase() as Tag;
    if (m[1]) {
      if (open[open.length - 1] === tag) {
        open.pop();
        stack.pop();
      } else {
        text(m[0]);
      }
    } else {
      const node: Node = { kind: "tag", tag, children: [] };
      push(node);
      open.push(tag);
      stack.push(node.children);
    }
  }
  text(input.slice(last));
  return root;
}

function getText(nodes: Node[]): string {
  return nodes
    .map((n) => (n.kind === "text" ? n.value : getText(n.children)))
    .join("");
}

function InlineReveal({ children, nodes }: { children: ReactNode; nodes: Node[] }) {
  const [shown, setShown] = useState(false);
  const id = useId();
  const rawText = getText(nodes);

  if (shown) {
    return (
      <span className="rounded bg-spectre/15 px-1 py-0.5 text-ink transition-colors">
        {children}
      </span>
    );
  }

  // Full-sentence redacted placeholder — same length as content, blurred
  return (
    <button
      type="button"
      onClick={() => setShown(true)}
      aria-expanded={false}
      aria-controls={id}
      className="group relative inline cursor-pointer select-none rounded bg-ink/[0.06] px-1 py-0.5 text-transparent transition-colors hover:bg-spectre/10"
      title="Click to reveal"
      style={{ minWidth: `${Math.max(4, rawText.length * 0.6)}ch` }}
    >
      <span className="absolute inset-0 grid place-items-center font-pixel text-[9px] tracking-[0.2em] text-ink/60 uppercase opacity-0 transition-opacity group-hover:opacity-100">
        reveal
      </span>
      <span className="blur-[4px]">{children}</span>
    </button>
  );
}

function render(nodes: Node[]): ReactNode {
  return nodes.map((node, i) => {
    if (node.kind === "text") return <Fragment key={i}>{node.value}</Fragment>;
    const inner = render(node.children);
    switch (node.tag) {
      case "b":
        return (
          <strong key={i} className="font-semibold text-ink">
            {inner}
          </strong>
        );
      case "i":
        return <em key={i}>{inner}</em>;
      case "u":
        return (
          <u key={i} className="underline decoration-ink/30 underline-offset-4">
            {inner}
          </u>
        );
      case "code":
        return (
          <code key={i} className="bg-ink/[0.07] px-1.5 py-0.5 font-mono text-[0.88em] text-ink">
            {inner}
          </code>
        );
      case "reveal":
        return (
          <InlineReveal key={i} nodes={node.children}>
            {inner}
          </InlineReveal>
        );
    }
  });
}

export function RichText({ text }: { text: string }) {
  return <>{render(parseRich(text))}</>;
}
