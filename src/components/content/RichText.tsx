"use client";

import { Fragment, useId, useState, type ReactNode } from "react";

/**
 * Inline formatting for block text.
 *
 * Authors write a tiny, fixed tag vocabulary -- <b> <i> <u> <code> <reveal>
 * -- and everything else is treated as literal text. This is a parser, not a
 * sanitiser: unknown tags are never interpreted, so no `dangerouslySet-
 * InnerHTML` is involved and an author (or a compromised admin session)
 * cannot inject a <script>, an onerror handler or an <iframe> into a public
 * page. The output is React elements built from parsed tokens.
 *
 * Nesting works: <b>bold with <i>italics</i></b>. Unclosed tags degrade to
 * plain text rather than swallowing the rest of the document.
 */

const TAGS = ["b", "i", "u", "code", "reveal"] as const;
type Tag = (typeof TAGS)[number];

type Node =
  | { kind: "text"; value: string }
  | { kind: "tag"; tag: Tag; children: Node[] };

const TOKEN = /<(\/?)(b|i|u|code|reveal)>/gi;

/** Parses the mini-markup into a tree. Never throws on malformed input. */
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
      /* Closing tag. Ignore it unless it matches the innermost open tag --
         mismatched nesting would otherwise close the wrong element. */
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

  /* Unclosed tags: their contents were already collected into the tree, so
     nothing is lost -- the element simply runs to the end of the string. */
  return root;
}

function InlineReveal({ children }: { children: ReactNode }) {
  const [shown, setShown] = useState(false);
  const id = useId();

  if (shown) {
    return (
      <span className="bg-spectre/15 px-1 text-ink transition-colors">
        {children}
      </span>
    );
  }
  return (
    <button
      type="button"
      onClick={() => setShown(true)}
      aria-expanded={false}
      aria-controls={id}
      className="cursor-pointer border-b border-dashed border-ink/40 bg-ink/[0.06] px-1.5 font-pixel text-[0.8em] tracking-[0.18em] text-ink/55 uppercase transition-colors hover:border-spectre hover:text-spectre"
    >
      reveal
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
          <code
            key={i}
            className="bg-ink/[0.07] px-1.5 py-0.5 font-mono text-[0.88em] text-ink"
          >
            {inner}
          </code>
        );
      case "reveal":
        return <InlineReveal key={i}>{inner}</InlineReveal>;
    }
  });
}

export function RichText({ text }: { text: string }) {
  return <>{render(parseRich(text))}</>;
}
