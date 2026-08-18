"use client";

import { cn } from "@/lib/utils";

type Props = {
  src?: string | null;
  name: string;
  size?: number;
  className?: string;
  onClick?: () => void;
};

function initials(name: string): string {
  const clean = name.replace(/^@/, "").trim();
  if (!clean) return "?";
  const parts = clean.split(/[_\s]+/);
  if (parts.length >= 2 && parts[1]) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return clean.slice(0, 2).toUpperCase();
}

export function Avatar({ src, name, size = 40, className, onClick }: Props) {
  const dim = `${size}px`;
  const fontSize = Math.max(11, Math.round(size * 0.38));
  const isClickable = !!onClick;

  if (!src) {
    return (
      <div
        onClick={onClick}
        role={isClickable ? "button" : undefined}
        tabIndex={isClickable ? 0 : undefined}
        className={cn(
          "sber-gradient flex shrink-0 items-center justify-center font-semibold text-black no-select",
          isClickable && "cursor-pointer active:scale-95 transition-transform",
          className,
        )}
        style={{
          width: dim,
          height: dim,
          borderRadius: "50%",
          fontSize,
          letterSpacing: 0.5,
        }}
        aria-label={name}
      >
        {initials(name)}
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={name}
      onClick={onClick}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      className={cn(
        "shrink-0 border border-[var(--sber-border)] bg-[var(--sber-card-2)] object-cover no-select",
        isClickable && "cursor-pointer active:scale-95 transition-transform",
        className,
      )}
      style={{ width: dim, height: dim, borderRadius: "50%" }}
    />
  );
}
