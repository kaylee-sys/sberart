"use client";

import { CheckCircle2, Info, XCircle } from "lucide-react";
import type { Toast } from "@/lib/types";
import { cn } from "@/lib/utils";

type Props = {
  toasts: Toast[];
};

const ICONS = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
} as const;

const STYLES = {
  success: "border-[#10B981]/40",
  error: "border-[#ef4444]/40",
  info: "border-[#3b82f6]/40",
} as const;

export function ToastHost({ toasts }: Props) {
  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-3 z-[100] flex flex-col items-center gap-2 px-4"
      role="status"
      aria-live="polite"
    >
      {toasts.map((t) => {
        const Icon = ICONS[t.kind];
        return (
          <div
            key={t.id}
            className={cn(
              "animate-toast pointer-events-auto flex max-w-md items-center gap-2 rounded-2xl border bg-[var(--sber-card-2)]/95 px-4 py-3 text-sm text-[var(--sber-text)] shadow-2xl backdrop-blur",
              STYLES[t.kind],
            )}
            style={{ borderRadius: 16 }}
          >
            <Icon
              size={18}
              className={cn(
                t.kind === "success" && "text-[#10B981]",
                t.kind === "error" && "text-[#ef4444]",
                t.kind === "info" && "text-[#3b82f6]",
              )}
            />
            <span className="leading-snug">{t.text}</span>
          </div>
        );
      })}
    </div>
  );
}
