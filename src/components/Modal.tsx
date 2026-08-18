"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
};

export function Modal({ open, onClose, title, children, className }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className={cn(
          "relative w-full max-w-md overflow-hidden rounded-t-3xl border border-[var(--sber-border)] bg-[var(--sber-card)] shadow-2xl sm:rounded-3xl",
          className,
        )}
        style={{ borderRadius: 16 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[var(--sber-border)] px-4 py-3">
          <div className="text-[14px] font-semibold">{title}</div>
          <button
            onClick={onClose}
            className="-mr-1 flex h-9 w-9 items-center justify-center rounded-xl text-[var(--sber-text-muted)] active:bg-[var(--sber-card-2)]"
            aria-label="Закрыть"
          >
            <X size={18} />
          </button>
        </div>
        <div className="max-h-[80vh] overflow-y-auto momentum-scroll scrollbar-hide">
          {children}
        </div>
      </div>
    </div>
  );
}

type ConfirmProps = {
  open: boolean;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function Confirm({
  open,
  title,
  description,
  confirmText = "Подтвердить",
  cancelText = "Отмена",
  destructive,
  onConfirm,
  onCancel,
}: ConfirmProps) {
  return (
    <Modal open={open} onClose={onCancel} title={title}>
      <div className="px-4 py-4">
        {description && (
          <p className="mb-4 text-[13px] leading-relaxed text-[var(--sber-text-muted)]">
            {description}
          </p>
        )}
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="sber-btn-ghost px-4 py-2 text-[13px] no-select active:scale-95"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={
              destructive
                ? "flex items-center justify-center rounded-2xl bg-[#ef4444] px-4 py-2 text-[13px] font-semibold text-white active:scale-95 no-select"
                : "sber-btn-primary px-4 py-2 text-[13px] no-select active:scale-95"
            }
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}
