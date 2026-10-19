"use client";

import { useEffect } from "react";

export function ConfirmDialog({
  open,
  title = "Are you sure?",
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  variant = "danger",
}: {
  open: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: "danger" | "default";
}) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      const onEsc = (e: KeyboardEvent) => {
        if (e.key === "Escape") onCancel();
      };
      window.addEventListener("keydown", onEsc);
      return () => {
        document.body.style.overflow = "";
        window.removeEventListener("keydown", onEsc);
      };
    }
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] grid place-items-center bg-night/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-[440px] border border-paper/15 bg-night shadow-2xl">
        <div className="h-[3px] w-full bg-spectre" />
        <div className="p-6">
          <p className="font-pixel text-[10px] tracking-[0.3em] text-spectre uppercase">Confirm action</p>
          <h3 className="mt-3 font-display text-[1.4rem] font-bold leading-tight tracking-[-0.02em] text-paper">
            {title}
          </h3>
          <p className="mt-3 text-[14px] leading-relaxed text-paper/60">{message}</p>

          <div className="mt-6 flex gap-3">
            <button
              onClick={onConfirm}
              className={`px-5 py-2.5 font-pixel text-[10px] tracking-[0.24em] uppercase transition-colors ${
                variant === "danger"
                  ? "bg-red-500 text-night hover:bg-red-400"
                  : "bg-paper text-night hover:bg-spectre"
              }`}
            >
              {confirmLabel}
            </button>
            <button
              onClick={onCancel}
              className="border border-paper/20 px-5 py-2.5 font-pixel text-[10px] tracking-[0.24em] text-paper/60 uppercase hover:border-paper/40 hover:text-paper"
            >
              {cancelLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
