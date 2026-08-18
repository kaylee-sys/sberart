"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, MessageSquare, Send } from "lucide-react";
import type {
  ConversationDTO,
  MessageDTO,
  PublicUser,
  Screen,
} from "@/lib/types";
import { api } from "@/lib/api";
import { Avatar } from "@/components/Avatar";
import { formatRelative, formatTime } from "@/lib/format";

type Props = {
  currentUser: PublicUser;
  onNavigate: (s: Screen) => void;
  onToast: (kind: "success" | "error" | "info", text: string) => void;
  reloadKey: number;
  activePartner?: string;
  onUnreadChange?: (hasUnread: boolean) => void;
};

export function ChatListScreen({
  currentUser,
  onNavigate,
  onToast,
  reloadKey,
  activePartner,
  onUnreadChange,
}: Props) {
  const [conversations, setConversations] = useState<ConversationDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [quickTo, setQuickTo] = useState("");

  const load = useCallback(async () => {
    try {
      const { conversations } = await api.listConversations(currentUser.username);
      setConversations(conversations);
      onUnreadChange?.(false);
    } catch (e) {
      onToast(
        "error",
        e instanceof Error ? e.message : "Не удалось загрузить чаты",
      );
    } finally {
      setLoading(false);
    }
  }, [currentUser.username, onToast, onUnreadChange]);

  useEffect(() => {
    void load();
  }, [load, reloadKey]);

  const startNew = async () => {
    const username = quickTo.trim().toLowerCase().replace(/^@/, "");
    if (!username) return;
    try {
      await api.getProfile(username);
      onNavigate({ kind: "chat-thread", partner: username });
      setQuickTo("");
    } catch {
      onToast("error", "Пользователь не найден");
    }
  };

  if (activePartner) {
    return (
      <ChatThread
        currentUser={currentUser}
        partnerUsername={activePartner}
        onBack={() => onNavigate({ kind: "chat" })}
        onToast={onToast}
      />
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-3 px-3 pb-6 pt-1">
      {/* New conversation */}
      <div
        className="rounded-2xl border border-[var(--sber-border)] bg-[var(--sber-card)] p-3"
        style={{ borderRadius: 16 }}
      >
        <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--sber-text-muted)]">
          Новое сообщение
        </div>
        <div className="flex items-center gap-2 rounded-2xl bg-[var(--sber-card-2)] px-3 py-2">
          <span className="text-[14px] text-[var(--sber-text-muted)]">@</span>
          <input
            type="text"
            value={quickTo}
            onChange={(e) =>
              setQuickTo(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") startNew();
            }}
            placeholder="никнейм получателя"
            className="flex-1 bg-transparent text-[14px] text-[var(--sber-text)] outline-none placeholder:text-[var(--sber-text-muted)]"
            maxLength={20}
          />
          <button
            onClick={startNew}
            disabled={!quickTo.trim()}
            className="sber-gradient flex h-8 w-8 items-center justify-center rounded-xl text-black disabled:opacity-40 active:scale-95 no-select"
            aria-label="Открыть диалог"
          >
            <Send size={14} />
          </button>
        </div>
      </div>

      {/* Conversations */}
      <div>
        <div className="mb-2 px-1 text-[12px] font-semibold uppercase tracking-[0.16em] text-[var(--sber-text-muted)]">
          Диалоги · {conversations.length}
        </div>

        {loading ? (
          <div className="space-y-2">
            {[0, 1].map((i) => (
              <div
                key={i}
                className="sber-card-2 flex items-center gap-3 p-3"
                style={{ borderRadius: 16 }}
              >
                <div className="sber-shimmer h-11 w-11 rounded-full" style={{ borderRadius: "50%" }} />
                <div className="flex-1 space-y-2">
                  <div className="sber-shimmer h-3 w-24 rounded" />
                  <div className="sber-shimmer h-2 w-40 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div
            className="flex flex-col items-center gap-2 rounded-2xl border border-[var(--sber-border)] bg-[var(--sber-card)] p-8 text-center"
            style={{ borderRadius: 16 }}
          >
            <MessageSquare size={26} className="text-[var(--sber-text-muted)]" />
            <div className="text-[14px] font-semibold">Пока нет диалогов</div>
            <div className="text-[12px] text-[var(--sber-text-muted)]">
              Введите никнейм выше, чтобы написать первому
            </div>
          </div>
        ) : (
          <ul className="space-y-2">
            {conversations.map((c) => (
              <li key={c.partnerUsername}>
                <button
                  onClick={() =>
                    onNavigate({ kind: "chat-thread", partner: c.partnerUsername })
                  }
                  className="sber-card-2 flex w-full items-center gap-3 p-3 text-left active:scale-[0.99] no-select"
                  style={{ borderRadius: 16 }}
                >
                  <Avatar
                    src={c.partner?.avatar}
                    name={c.partnerUsername}
                    size={44}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className="truncate text-[14px] font-semibold">
                        @{c.partnerUsername}
                      </span>
                      <span className="ml-auto shrink-0 text-[10px] text-[var(--sber-text-muted)]">
                        {formatRelative(c.lastMessage.createdAt)}
                      </span>
                    </div>
                    <p
                      className={
                        "mt-0.5 truncate text-[12px] " +
                        (c.lastMessage.from === currentUser.username
                          ? "text-[var(--sber-text-muted)]"
                          : "text-[var(--sber-text)]")
                      }
                    >
                      {c.lastMessage.from === currentUser.username ? "Вы: " : ""}
                      {c.lastMessage.text}
                    </p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function ChatThread({
  currentUser,
  partnerUsername,
  onBack,
  onToast,
}: {
  currentUser: PublicUser;
  partnerUsername: string;
  onBack: () => void;
  onToast: (kind: "success" | "error" | "info", text: string) => void;
}) {
  const [messages, setMessages] = useState<MessageDTO[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [partner, setPartner] = useState<PublicUser | null>(null);
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    try {
      const [{ messages }, profile] = await Promise.all([
        api.listThread(currentUser.username, partnerUsername),
        api.getProfile(partnerUsername).catch(() => null),
      ]);
      setMessages(messages);
      setPartner(profile?.user ?? null);
    } catch (e) {
      onToast("error", e instanceof Error ? e.message : "Ошибка чата");
    } finally {
      setLoading(false);
    }
  }, [currentUser.username, partnerUsername, onToast]);

  useEffect(() => {
    void load();
  }, [load]);

  const send = async () => {
    const t = text.trim();
    if (!t || sending) return;
    setSending(true);
    try {
      const { message } = await api.sendMessage(
        currentUser.username,
        partnerUsername,
        t,
      );
      setMessages((m) => [...m, message]);
      setText("");
    } catch (e) {
      onToast("error", e instanceof Error ? e.message : "Не отправилось");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mx-auto flex h-[calc(100dvh-56px-72px)] w-full max-w-2xl flex-col px-3">
      <div
        className="flex items-center gap-3 border-b border-[var(--sber-border)] py-2.5"
      >
        <button
          onClick={onBack}
          className="-ml-1 flex h-9 w-9 items-center justify-center rounded-xl text-[var(--sber-text)] active:bg-[var(--sber-card-2)]"
          aria-label="Назад"
        >
          <ArrowLeft size={20} />
        </button>
        <Avatar src={partner?.avatar} name={partnerUsername} size={36} />
        <div className="min-w-0 flex-1">
          <div className="truncate text-[14px] font-semibold">
            @{partnerUsername}
          </div>
          {partner?.bio && (
            <div className="truncate text-[11px] text-[var(--sber-text-muted)]">
              {partner.bio}
            </div>
          )}
        </div>
      </div>

      <div className="momentum-scroll scrollbar-hide flex-1 overflow-y-auto py-3">
        {loading ? (
          <div className="flex h-full items-center justify-center text-[12px] text-[var(--sber-text-muted)]">
            Загрузка…
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-1 text-center text-[var(--sber-text-muted)]">
            <MessageSquare size={26} />
            <div className="text-[13px]">Нет сообщений</div>
            <div className="text-[11px]">Напишите первым 👋</div>
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {messages.map((m) => {
              const mine = m.from === currentUser.username;
              return (
                <li
                  key={m.id}
                  className={
                    "flex " + (mine ? "justify-end" : "justify-start")
                  }
                >
                  <div
                    className={
                      "max-w-[78%] rounded-2xl px-3 py-2 text-[13px] leading-snug no-select " +
                      (mine
                        ? "sber-gradient text-black"
                        : "bg-[var(--sber-card-2)] text-[var(--sber-text)] border border-[var(--sber-border)]")
                    }
                    style={{ borderRadius: 16 }}
                  >
                    <p className="whitespace-pre-wrap break-words">
                      {m.text}
                    </p>
                    <div
                      className={
                        "mt-0.5 text-[10px] " +
                        (mine
                          ? "text-black/60"
                          : "text-[var(--sber-text-muted)]")
                      }
                    >
                      {formatTime(m.createdAt)}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="flex items-center gap-2 border-t border-[var(--sber-border)] py-2.5">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") send();
          }}
          placeholder="Сообщение…"
          maxLength={1000}
          className="sber-input text-[14px]"
        />
        <button
          onClick={send}
          disabled={!text.trim() || sending}
          className="sber-gradient flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-black disabled:opacity-40 active:scale-95 no-select"
          aria-label="Отправить"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
