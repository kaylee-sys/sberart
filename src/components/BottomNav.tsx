"use client";

import { Home, MessageSquare, Plus, User } from "lucide-react";
import type { Screen } from "@/lib/types";
import { cn } from "@/lib/utils";

type Props = {
  screen: Screen;
  onNavigate: (s: Screen) => void;
  hasUnread: boolean;
};

const TABS: Array<{
  key: "feed" | "create" | "chat" | "profile";
  label: string;
  Icon: typeof Home;
  screen: Screen;
}> = [
  { key: "feed", label: "Лента", Icon: Home, screen: { kind: "feed" } },
  {
    key: "create",
    label: "Создать",
    Icon: Plus,
    screen: { kind: "create" },
  },
  {
    key: "chat",
    label: "Чат",
    Icon: MessageSquare,
    screen: { kind: "chat" },
  },
  {
    key: "profile",
    label: "Профиль",
    Icon: User,
    screen: { kind: "profile", username: "__self__" },
  },
];

export function BottomNav({ screen, onNavigate, hasUnread }: Props) {
  const activeKey =
    screen.kind === "feed"
      ? "feed"
      : screen.kind === "create"
        ? "create"
        : screen.kind === "chat" || screen.kind === "chat-thread"
          ? "chat"
          : "profile";

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--sber-border)] bg-[var(--sber-bg)]/95 backdrop-blur"
      style={{
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <div className="mx-auto flex max-w-2xl items-stretch justify-around px-2 py-1.5">
        {TABS.map(({ key, label, Icon, screen: target }) => {
          const isActive = key === activeKey;
          const isCreate = key === "create";
          return (
            <button
              key={key}
              onClick={() => onNavigate(target)}
              className={cn(
                "relative flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-2 py-1.5 text-[11px] font-medium transition-colors no-select active:scale-95",
                isActive
                  ? "text-[var(--sber-text)]"
                  : "text-[var(--sber-text-muted)]",
              )}
              aria-label={label}
              aria-current={isActive ? "page" : undefined}
            >
              {isCreate ? (
                <span
                  className={cn(
                    "flex h-11 w-11 items-center justify-center rounded-2xl shadow-lg",
                    isActive
                      ? "sber-gradient text-black"
                      : "bg-[var(--sber-card-2)] text-[var(--sber-text)] border border-[var(--sber-border)]",
                  )}
                >
                  <Icon size={22} strokeWidth={2.4} />
                </span>
              ) : (
                <span className="relative">
                  <Icon size={22} strokeWidth={isActive ? 2.4 : 2} />
                  {key === "chat" && hasUnread && (
                    <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-[#ef4444] ring-2 ring-[var(--sber-bg)]" />
                  )}
                </span>
              )}
              <span className={cn(isCreate && "mt-0.5")}>{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
