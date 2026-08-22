"use client";

import { useId, useRef, useState } from "react";
import { ImageUp, Loader2, X } from "lucide-react";
import { createClient } from "@/lib/supabase/browser";
import { SUPABASE_URL } from "@/lib/supabase/config";
import {
  ACCEPT_ATTRIBUTE,
  MEDIA_BUCKET,
  storageKey,
  validateImage,
} from "@/lib/media";

const FIELD =
  "w-full border border-paper/20 bg-white/[0.03] px-3.5 py-2.5 font-body text-[14.5px] text-paper placeholder:text-paper/25 outline-none transition-colors duration-300 focus:border-spectre";

/**
 * Path or URL input with an attached uploader.
 *
 * The file goes from the browser straight to Supabase Storage. It never
 * passes through the Next server, which matters on Vercel: serverless
 * function request bodies are capped at 4.5 MB, so routing a 10 MB image
 * through an API route or a server action would fail at exactly the sizes
 * people upload photographs at.
 *
 * The text input stays editable. Committed files under public/ are still
 * valid values, and being able to paste a path is the quickest way to reuse
 * artwork that already ships with the repo.
 */
export function ImageField({
  value,
  onChange,
  placeholder = "/assets/img/example.jpg",
}: {
  value: string;
  onChange: (src: string) => void;
  placeholder?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();

  const configured = Boolean(SUPABASE_URL);

  async function upload(file: File) {
    setError(null);

    const problem = validateImage(file);
    if (problem) {
      setError(problem);
      return;
    }

    setBusy(true);
    try {
      const supabase = createClient();
      const key = storageKey(file.name);

      const { error: uploadError } = await supabase.storage
        .from(MEDIA_BUCKET)
        .upload(key, file, {
          cacheControl: "31536000",
          upsert: false,
          contentType: file.type,
        });

      if (uploadError) {
        // The two failures worth naming, because the generic message for
        // both is "new row violates row-level security policy".
        const message = uploadError.message.toLowerCase();
        if (message.includes("row-level security") || message.includes("jwt")) {
          setError(
            "Upload refused. Your sign-in may have expired — reload the page, or check that supabase/storage.sql has been run.",
          );
        } else if (message.includes("bucket not found")) {
          setError(
            `Bucket "${MEDIA_BUCKET}" does not exist. Run supabase/storage.sql in the SQL editor.`,
          );
        } else {
          setError(uploadError.message);
        }
        return;
      }

      const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(key);
      onChange(data.publicUrl);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Upload failed.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="grid gap-2">
      <div className="flex gap-2">
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className={FIELD}
        />

        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={ACCEPT_ATTRIBUTE}
          className="sr-only"
          disabled={!configured || busy}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void upload(file);
          }}
        />

        <label
          htmlFor={inputId}
          title={
            configured
              ? "Upload an image"
              : "Set NEXT_PUBLIC_SUPABASE_URL to enable uploads"
          }
          onDragOver={(event) => {
            event.preventDefault();
            if (configured && !busy) setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            if (!configured || busy) return;
            const file = event.dataTransfer.files?.[0];
            if (file) void upload(file);
          }}
          className={`flex shrink-0 cursor-pointer items-center gap-2 border px-3.5 font-pixel text-[9.5px] tracking-[0.24em] uppercase transition-colors duration-300 ${
            dragging
              ? "border-spectre bg-spectre/10 text-spectre"
              : "border-paper/20 text-paper/50 hover:border-paper/45 hover:text-paper"
          } ${!configured || busy ? "pointer-events-none opacity-40" : ""}`}
        >
          {busy ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <ImageUp className="h-3.5 w-3.5" />
          )}
          <span className="hidden sm:inline">
            {busy ? "Sending" : "Upload"}
          </span>
        </label>
      </div>

      {value ? (
        <div className="flex items-center gap-3">
          {/* Deliberately not next/image: this is a preview of an arbitrary
              user-entered path, and an unconfigured host would throw. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt=""
            className="h-12 w-20 shrink-0 border border-paper/15 bg-night object-cover"
            onError={(event) => {
              event.currentTarget.style.opacity = "0.15";
            }}
          />
          <span className="truncate font-body text-[12px] text-paper/35">
            {value.startsWith("http") ? "Uploaded" : "From public/"}
          </span>
          <button
            type="button"
            onClick={() => onChange("")}
            aria-label="Clear image"
            className="ml-auto shrink-0 text-paper/35 transition-colors duration-300 hover:text-paper"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : null}

      {error ? (
        <p className="font-body text-[12.5px] leading-relaxed text-spectre">
          {error}
        </p>
      ) : null}

      {!configured ? (
        <p className="font-body text-[12.5px] text-paper/35">
          Uploads need NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.
          You can still type a path to a file in public/.
        </p>
      ) : null}
    </div>
  );
}
