/**
 * Server-side redaction for classified entries.
 *
 * The point of this module is that the real title and summary of a
 * classified entry must never reach the browser -- not in the HTML, not in
 * the RSC payload, not in a JSON island. Scrambling in a client component
 * would ship the plaintext and then hide it, which is theatre: view-source
 * defeats it in one keystroke. Everything here runs on the server, and the
 * public entry types simply do not carry the original strings.
 *
 * Scrambling is deterministic, seeded from the entry id and the field name.
 * Two reasons: a value that changed between the server render and a
 * subsequent request would flicker on navigation, and stable output means a
 * classified entry looks like the same redacted thing every time rather than
 * an obviously random mask.
 */

/* Glyphs chosen to read as ciphertext rather than as censorship bars, while
   staying inside the fonts the site actually loads -- box-drawing and
   dingbats would fall back and change the metrics. */
const CIPHER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&$@?!*+=/\\<>~^";

/** Deterministic 32-bit hash. Same string in, same number out. */
function hash(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Replaces every visible character with a cipher glyph, preserving length
 * and word boundaries.
 *
 * Word shape is kept on purpose: "████████ ██" reads as redaction, whereas
 * a solid run of the same width reads as a rendering bug. Punctuation that
 * carries no information -- spaces, newlines -- passes through; everything
 * else is replaced, including digits, so a date or a version number cannot
 * be inferred.
 */
export function scramble(value: string, seed: string): string {
  if (!value) return "";
  const rand = mulberry32(hash(`${seed}:${value.length}`));
  let out = "";
  for (const char of value) {
    if (char === " " || char === "\n" || char === "\t") {
      out += char;
      continue;
    }
    out += CIPHER[Math.floor(rand() * CIPHER.length)];
  }
  return out;
}

/**
 * Opaque slug for a classified entry.
 *
 * Auto-generating a slug from the title would make the scrambling
 * pointless -- /projects/dragon-reborn tells you exactly what
 * /projects/[scrambled title] was hiding. Classified entries therefore get
 * a slug derived only from their kind and code, both of which are already
 * public.
 */
export function classifiedSlug(kind: string, code: string): string {
  return `${kind === "project" ? "project" : "signal"}-${code}`;
}

/** Slug from arbitrary text. Used for entries that are not classified. */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
