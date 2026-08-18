"use client";

import {
  Heart,
  MessageCircle,
  Send,
  Trash2,
  Pencil,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
} from "lucide-react";
import { useState } from "react";
import type { PostDTO, PublicUser } from "@/lib/types";
import { Avatar } from "@/components/Avatar";
import { formatRelative } from "@/lib/format";
import { cn } from "@/lib/utils";

type Props = {
  post: PostDTO;
  currentUser: PublicUser | null;
  onToggleLike: (post: PostDTO) => void;
  onAddComment: (post: PostDTO, text: string) => void;
  onOpenProfile: (username: string) => void;
  onEdit?: (post: PostDTO) => void;
  onDelete?: (post: PostDTO) => void;
};

export function PostCard({
  post,
  currentUser,
  onToggleLike,
  onAddComment,
  onOpenProfile,
  onEdit,
  onDelete,
}: Props) {
  const [showPrompt, setShowPrompt] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const isMine = currentUser?.username === post.authorUsername;
  const canComment = !!currentUser;

  const submitComment = () => {
    const t = commentText.trim();
    if (!t || !currentUser) return;
    onAddComment(post, t);
    setCommentText("");
  };

  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(post.prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      /* no-op */
    }
  };

  return (
    <article
      className="sber-card overflow-hidden animate-slide-up no-select"
      style={{ borderRadius: 16 }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-3 py-3">
        <button
          onClick={() => onOpenProfile(post.authorUsername)}
          className="rounded-full active:scale-95"
          aria-label={`Открыть профиль @${post.authorUsername}`}
        >
          <Avatar
            src={post.author?.avatar}
            name={post.authorUsername}
            size={40}
          />
        </button>
        <div className="min-w-0 flex-1">
          <button
            onClick={() => onOpenProfile(post.authorUsername)}
            className="block max-w-full truncate text-left text-[14px] font-semibold text-[var(--sber-text)] active:opacity-70"
          >
            @{post.authorUsername}
          </button>
          <div className="text-[11px] text-[var(--sber-text-muted)]">
            {formatRelative(post.createdAt)}
          </div>
        </div>

        {isMine && (onEdit || onDelete) && (
          <div className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-[var(--sber-text-muted)] active:bg-[var(--sber-card-2)]"
              aria-label="Меню поста"
            >
              <Pencil size={16} />
            </button>
            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setMenuOpen(false)}
                />
                <div
                  className="absolute right-0 top-10 z-40 w-44 overflow-hidden rounded-2xl border border-[var(--sber-border)] bg-[var(--sber-card-2)] py-1 shadow-2xl"
                  style={{ borderRadius: 16 }}
                >
                  {onEdit && (
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onEdit(post);
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-[13px] text-[var(--sber-text)] active:bg-[var(--sber-card)]"
                    >
                      <Pencil size={15} />
                      Редактировать
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onDelete(post);
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-[13px] text-[#ef4444] active:bg-[var(--sber-card)]"
                    >
                      <Trash2 size={15} />
                      Удалить
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Image */}
      <button
        onClick={() => setShowPrompt((v) => !v)}
        className="block w-full bg-black"
        aria-label="Показать промт"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={post.image}
          alt={`Арт от @${post.authorUsername}`}
          className="mx-auto block max-h-[640px] w-full object-cover"
          loading="lazy"
        />
      </button>

      {/* Actions */}
      <div className="flex items-center gap-1 px-2 py-2">
        <button
          onClick={() => onToggleLike(post)}
          disabled={!currentUser}
          className={cn(
            "flex items-center gap-1.5 rounded-2xl px-3 py-2 text-[13px] font-medium transition-colors no-select active:scale-95",
            post.likedByViewer
              ? "text-[#ef4444]"
              : "text-[var(--sber-text)]",
            "active:bg-[var(--sber-card-2)]",
          )}
        >
          <Heart
            size={20}
            fill={post.likedByViewer ? "#ef4444" : "transparent"}
            strokeWidth={2}
          />
          <span className="tabular-nums">{post.likesCount}</span>
        </button>

        <button
          onClick={() => setShowComments((v) => !v)}
          className="flex items-center gap-1.5 rounded-2xl px-3 py-2 text-[13px] font-medium text-[var(--sber-text)] active:bg-[var(--sber-card-2)] no-select active:scale-95"
        >
          <MessageCircle size={20} />
          <span className="tabular-nums">{post.commentsCount}</span>
        </button>

        <button
          onClick={() => setShowPrompt((v) => !v)}
          className="ml-auto flex items-center gap-1.5 rounded-2xl px-3 py-2 text-[12px] font-medium text-[var(--sber-text-muted)] active:bg-[var(--sber-card-2)] no-select active:scale-95"
          aria-expanded={showPrompt}
        >
          <span className="sber-chip !py-0.5 !text-[10px]">
            <span className="sber-gradient-text font-semibold">PROMPT</span>
          </span>
          {showPrompt ? (
            <ChevronUp size={16} />
          ) : (
            <ChevronDown size={16} />
          )}
        </button>
      </div>

      {/* Prompt panel */}
      {showPrompt && (
        <div
          className="mx-3 mb-3 rounded-2xl border border-[var(--sber-border)] bg-[var(--sber-card-2)] p-3"
          style={{ borderRadius: 16 }}
        >
          <div className="mb-1 flex items-center justify-between">
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--sber-text-muted)]">
              Промт / описание
            </div>
            <button
              onClick={copyPrompt}
              className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] text-[var(--sber-text-muted)] active:bg-[var(--sber-card)] no-select"
            >
              {copied ? (
                <>
                  <Check size={13} className="text-[#10B981]" />
                  Скопировано
                </>
              ) : (
                <>
                  <Copy size={13} />
                  Копировать
                </>
              )}
            </button>
          </div>
          <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-[var(--sber-text)]">
            {post.prompt}
          </p>
        </div>
      )}

      {/* Comments */}
      {showComments && (
        <div
          className="border-t border-[var(--sber-border)] px-3 py-3"
          style={{ borderTopLeftRadius: 0, borderTopRightRadius: 0 }}
        >
          {post.comments.length === 0 ? (
            <div className="py-3 text-center text-[12px] text-[var(--sber-text-muted)]">
              Пока нет комментариев — будь первым ✨
            </div>
          ) : (
            <ul className="mb-2 space-y-2">
              {post.comments.map((c) => (
                <li key={c.id} className="flex items-start gap-2">
                  <button
                    onClick={() => onOpenProfile(c.authorUsername)}
                    className="shrink-0 active:scale-95"
                    aria-label={`Профиль @${c.authorUsername}`}
                  >
                    <Avatar
                      src={c.author?.avatar}
                      name={c.authorUsername}
                      size={28}
                    />
                  </button>
                  <div className="min-w-0 flex-1">
                    <div
                      className="rounded-2xl bg-[var(--sber-card-2)] px-3 py-2"
                      style={{ borderRadius: 16 }}
                    >
                      <button
                        onClick={() => onOpenProfile(c.authorUsername)}
                        className="block text-left text-[12px] font-semibold text-[var(--sber-text)] active:opacity-70"
                      >
                        @{c.authorUsername}
                      </button>
                      <p className="break-words text-[13px] leading-snug text-[var(--sber-text)]">
                        {c.text}
                      </p>
                    </div>
                    <div className="ml-3 mt-0.5 text-[10px] text-[var(--sber-text-muted)]">
                      {formatRelative(c.createdAt)}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {canComment ? (
            <div className="flex items-center gap-2">
              <Avatar
                src={currentUser?.avatar}
                name={currentUser?.username ?? ""}
                size={30}
              />
              <div className="flex flex-1 items-center gap-1 rounded-2xl bg-[var(--sber-card-2)] px-3 py-1.5">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      submitComment();
                    }
                  }}
                  placeholder="Комментарий…"
                  maxLength={500}
                  className="flex-1 bg-transparent text-[13px] text-[var(--sber-text)] outline-none placeholder:text-[var(--sber-text-muted)]"
                />
                <button
                  onClick={submitComment}
                  disabled={!commentText.trim()}
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-xl transition-opacity",
                    commentText.trim()
                      ? "sber-gradient text-black"
                      : "text-[var(--sber-text-muted)] opacity-50",
                  )}
                  aria-label="Отправить"
                >
                  <Send size={15} />
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center text-[12px] text-[var(--sber-text-muted)]">
              Войдите, чтобы оставить комментарий
            </div>
          )}
        </div>
      )}
    </article>
  );
}
