/**
 * Media uploads.
 *
 * Images live in a public Supabase Storage bucket and are referenced from
 * blocks by absolute URL. Two shapes are valid in an image block's `src`:
 *
 *   /assets/img/hero.jpg                 a file committed to public/
 *   https://<ref>.supabase.co/storage/…  an upload
 *
 * Both work. Uploading is the convenient path; committed files stay
 * supported so the seed content and any art shipped with the repo keep
 * rendering.
 *
 * Video is deliberately absent. Video blocks embed YouTube/Vimeo, so no
 * bandwidth is ever billed to the studio.
 */

export const MEDIA_BUCKET = "media";

/** Mirrors `allowed_mime_types` on the bucket in supabase/storage.sql. */
export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
  "image/svg+xml",
];

/** Mirrors `file_size_limit` on the bucket. */
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

export const ACCEPT_ATTRIBUTE = ACCEPTED_IMAGE_TYPES.join(",");

/**
 * Storage keys have to survive being put in a URL, so the original filename
 * is reduced to a safe slug and given a random prefix. The prefix also stops
 * two uploads of `screenshot.png` from colliding, which matters because the
 * upload runs with `upsert: false` -- a collision would otherwise fail the
 * upload rather than silently overwrite someone's artwork.
 */
export function storageKey(filename: string): string {
  const dot = filename.lastIndexOf(".");
  const stem = dot > 0 ? filename.slice(0, dot) : filename;
  const ext = dot > 0 ? filename.slice(dot + 1).toLowerCase() : "bin";

  const safeStem =
    stem
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || "image";

  const safeExt = ext.replace(/[^a-z0-9]/g, "").slice(0, 8) || "bin";
  const stamp = new Date().toISOString().slice(0, 7); // YYYY-MM
  const rand = Math.random().toString(36).slice(2, 8);

  return `uploads/${stamp}/${rand}-${safeStem}.${safeExt}`;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Client-side pre-flight. The bucket enforces the same two rules, but
 * catching them here turns a cryptic Storage error into a sentence.
 */
export function validateImage(file: File): string | null {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return `${file.type || "That file type"} is not an image the site accepts. Use JPG, PNG, WebP, AVIF, GIF or SVG.`;
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return `That file is ${formatBytes(file.size)}. The limit is ${formatBytes(MAX_UPLOAD_BYTES)}.`;
  }
  return null;
}
