"use client";

import { ArrowLeft, MessageSquare, MoreVertical } from "lucide-react";
import type { Screen } from "@/lib/types";
import { Avatar } from "@/components/Avatar";
import { Logo } from "@/components/Logo";
import type { PublicUser } from "@/lib/types";

type Props = {
  screen: Screen;
  currentUser: PublicUser | null;
  profileUser?: PublicUser | null;
  onNavigate: (s: Screen) => void;
  onOpenMenu?: () => void;
};

function titleFor(screen: Screen): string {
  if (screen.kind === "feed") return "";
  if (screen.kind === "create") return "Создать";
  if (screen.kind === "profile") return "Профиль";
  if (screen.kind === "chat") return "Сообщения";
  if (screen.kind === "chat-thread") return "Диалог";
  return "";
}

export function Header({
  screen,
  currentUser,
  profileUser,
  onNavigate,
  onOpenMenu,
}: Props) {
  const isSelfProfile =
    screen.kind === "profile" &&
    !!currentUser &&
    (screen.username === "__self__" ||
      screen.username === currentUser.username);
  const showBack = screen.kind === "profile" && !isSelfProfile;
  const showLogo = screen.kind === "feed";

  const handleBack = () => {
    onNavigate({ kind: "feed" });
  };

  return (
    <header
      className="fixed inset-x-0 top-0 z-40 border-b border-[var(--sber-border)] bg-[var(--sber-bg)]/90 backdrop-blur"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="mx-auto flex h-14 max-w-2xl items-center gap-3 px-3">
        {showBack ? (
          <button
            onClick={handleBack}
            className="-ml-1 flex h-10 w-10 items-center justify-center rounded-2xl text-[var(--sber-text)] active:bg-[var(--sber-card-2)] no-select"
            aria-label="Назад"
          >
            <ArrowLeft size={22} />
          </button>
        ) : currentUser ? (
          <button
            onClick={() =>
              onNavigate({ kind: "profile", username: currentUser.username })
            }
            className="-ml-1 rounded-full p-0.5 active:scale-95 no-select"
            aria-label="Мой профиль"
          >
            <Avatar
              src={currentUser.avatar}
              name={currentUser.username}
              size={36}
            />
          </button>
        ) : null}

        {showLogo ? (
          <div className="flex flex-1 items-center justify-center">
            <Logo size={28} />
          </div>
        ) : (
          <h1 className="flex-1 truncate text-center text-[15px] font-semibold tracking-tight text-[var(--sber-text)] no-select">
            {titleFor(screen)}
          </h1>
        )}

        {currentUser && (
          <button
            onClick={() => onNavigate({ kind: "chat" })}
            className="-mr-1 flex h-10 w-10 items-center justify-center rounded-2xl text-[var(--sber-text)] active:bg-[var(--sber-card-2)] no-select"
            aria-label="Сообщения"
          >
            <MessageSquare size={22} />
          </button>
        )}

        {screen.kind === "profile" &&
          isSelfProfile &&
          onOpenMenu && (
            <button
              onClick={onOpenMenu}
              className="-mr-1 flex h-10 w-10 items-center justify-center rounded-2xl text-[var(--sber-text)] active:bg-[var(--sber-card-2)] no-select"
              aria-label="Меню"
            >
              <MoreVertical size={20} />
            </button>
          )}
      </div>
    </header>
  );
}
