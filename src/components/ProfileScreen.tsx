"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Heart,
  Image as ImageIcon,
  Loader2,
  MessageCircle,
  Pencil,
  UserMinus,
  UserPlus,
  X,
} from "lucide-react";
import type {
  PostDTO,
  ProfileDTO,
  PublicUser,
  Screen,
} from "@/lib/types";
import { api } from "@/lib/api";
import { Avatar } from "@/components/Avatar";
import { formatRelative } from "@/lib/format";
import { cn } from "@/lib/utils";

type Props = {
  username: string;
  isSelf: boolean;
  currentUser: PublicUser;
  onBack: () => void;
  onOpenChatWith: (u: PublicUser) => void;
  onToast: (kind: "success" | "error" | "info", text: string) => void;
  onEditPost: (post: PostDTO) => void;
  onDeletePost: (post: PostDTO) => void;
  onNavigate: (s: Screen) => void;
  reloadKey: number;
  onRequestEditProfile: () => void;
};

export function ProfileScreen({
  username,
  isSelf,
  currentUser,
  onToast,
  onOpenChatWith,
  onEditPost,
  onDeletePost,
  onNavigate,
  reloadKey,
  onRequestEditProfile,
}: Props) {
  const [profile, setProfile] = useState<ProfileDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState<PostDTO | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getProfile(username, currentUser.username);
      setProfile(data);
    } catch (e) {
      onToast(
        "error",
        e instanceof Error ? e.message : "Не удалось загрузить профиль",
      );
    } finally {
      setLoading(false);
    }
  }, [username, currentUser.username, onToast]);

  useEffect(() => {
    void load();
  }, [load, reloadKey]);

  const toggleFollow = async () => {
    if (!profile || isSelf || busy) return;
    setBusy(true);
    try {
      const res = await api.toggleFollow(profile.user.username, currentUser.username);
      setProfile((p) =>
        p
          ? {
              ...p,
              isFollowing: res.following,
              stats: {
                ...p.stats,
                followers: p.stats.followers + (res.following ? 1 : -1),
              },
            }
          : p,
      );
      onToast(
        "success",
        res.following ? `Подписка на @${profile.user.username} оформлена` : `Отписались от @${profile.user.username}`,
      );
    } catch (e) {
      onToast(
        "error",
        e instanceof Error ? e.message : "Ошибка подписки",
      );
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col items-center justify-center gap-3 px-3 py-20 text-[var(--sber-text-muted)]">
        <Loader2 size={28} className="animate-spin" />
        <div className="text-[13px]">Загружаем профиль…</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-3 px-3 py-20 text-center">
        <div className="text-4xl">😕</div>
        <div className="text-[15px] font-semibold">Профиль не найден</div>
        <button
          onClick={onBack}
          className="sber-btn-ghost px-4 py-2 text-[13px] no-select"
        >
          Назад
        </button>
      </div>
    );
  }

  const { user, stats, isFollowing, posts } = profile;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-3 pb-6 pt-1">
      {/* Profile card */}
      <div
        className="relative rounded-2xl border border-[var(--sber-border)] bg-[var(--sber-card)] p-4"
        style={{ borderRadius: 16 }}
      >
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#10B981]/10 blur-3xl" />
        <div className="relative flex items-start gap-3">
          <Avatar src={user.avatar} name={user.username} size={72} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <div className="truncate text-[17px] font-bold tracking-tight">
                @{user.username}
              </div>
            </div>
            {user.bio ? (
              <p className="mt-1 text-[13px] leading-snug text-[var(--sber-text-muted)]">
                {user.bio}
              </p>
            ) : (
              <p className="mt-1 text-[12px] italic text-[var(--sber-text-muted)]">
                Описание не заполнено
              </p>
            )}
            <div className="mt-1 text-[11px] text-[var(--sber-text-muted)]">
              с {formatRelative(user.joinedAt)}
            </div>
          </div>
        </div>

        <div className="relative mt-4 grid grid-cols-3 gap-2 text-center">
          <Stat label="Посты" value={stats.posts} />
          <Stat label="Лайки" value={stats.likes} />
          <Stat
            label="Подписчики"
            value={stats.followers}
            sub={stats.following > 0 ? `подписок: ${stats.following}` : undefined}
          />
        </div>

        <div className="relative mt-4 flex gap-2">
          {isSelf ? (
            <button
              onClick={onRequestEditProfile}
              className="sber-btn-ghost flex flex-1 items-center justify-center gap-1.5 py-2.5 text-[13px] font-medium no-select active:scale-[0.98]"
            >
              <Pencil size={14} />
              Редактировать профиль
            </button>
          ) : (
            <>
              <button
                onClick={toggleFollow}
                disabled={busy}
                className={cn(
                  "flex flex-1 items-center justify-center gap-1.5 py-2.5 text-[13px] font-medium no-select active:scale-[0.98]",
                  isFollowing ? "sber-btn-ghost" : "sber-btn-primary",
                )}
              >
                {busy ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : isFollowing ? (
                  <UserMinus size={14} />
                ) : (
                  <UserPlus size={14} />
                )}
                {isFollowing ? "Отписаться" : "Подписаться"}
              </button>
              <button
                onClick={() => onOpenChatWith(user)}
                className="sber-btn-ghost flex items-center justify-center gap-1.5 px-4 py-2.5 text-[13px] no-select active:scale-[0.98]"
                aria-label="Сообщение"
              >
                <MessageCircle size={14} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Posts grid */}
      <div>
        <div className="mb-2 flex items-center justify-between px-1">
          <div className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[var(--sber-text-muted)]">
            Работы · {posts.length}
          </div>
        </div>

        {posts.length === 0 ? (
          <div
            className="flex flex-col items-center gap-2 rounded-2xl border border-[var(--sber-border)] bg-[var(--sber-card)] p-10 text-center"
            style={{ borderRadius: 16 }}
          >
            <ImageIcon size={28} className="text-[var(--sber-text-muted)]" />
            <div className="text-[14px] font-semibold">Пока нет работ</div>
            {isSelf && (
              <button
                onClick={() => onNavigate({ kind: "create" })}
                className="sber-btn-primary mt-1 px-4 py-2 text-[13px] no-select"
              >
                Создать первый пост
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {posts.map((p) => (
              <div
                key={p.id}
                className="group relative overflow-hidden rounded-2xl border border-[var(--sber-border)] bg-[var(--sber-card-2)] active:scale-[0.98] no-select"
                style={{ borderRadius: 16 }}
              >
                <button
                  onClick={() => setLightbox(p)}
                  className="block w-full"
                  aria-label={`Открыть пост`}
                >
                  <div className="aspect-square w-full overflow-hidden bg-black">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.image}
                      alt="Пост"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                </button>
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/80 via-black/30 to-transparent px-2.5 py-2">
                  <div className="flex items-center gap-2 text-[11px] text-white">
                    <span className="inline-flex items-center gap-1">
                      <Heart size={12} fill="#ef4444" strokeWidth={0} />
                      {p.likesCount}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MessageCircle size={12} />
                      {p.commentsCount}
                    </span>
                  </div>
                  {isSelf && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditPost(p);
                        }}
                        className="flex h-7 w-7 items-center justify-center rounded-lg bg-black/50 text-white backdrop-blur active:scale-95"
                        aria-label="Редактировать"
                      >
                        <Pencil size={12} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeletePost(p);
                        }}
                        className="flex h-7 w-7 items-center justify-center rounded-lg bg-black/50 text-white backdrop-blur active:scale-95"
                        aria-label="Удалить"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <PostLightbox
          post={lightbox}
          currentUser={currentUser}
          onClose={() => setLightbox(null)}
          onNavigate={onNavigate}
          onEdit={isSelf ? () => { setLightbox(null); onEditPost(lightbox); } : undefined}
          onDelete={isSelf ? () => { setLightbox(null); onDeletePost(lightbox); } : undefined}
        />
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  sub,
}: {
  label: string;
  value: number;
  sub?: string;
}) {
  return (
    <div
      className="rounded-2xl border border-[var(--sber-border)] bg-[var(--sber-card-2)] py-2"
      style={{ borderRadius: 16 }}
    >
      <div className="text-[16px] font-bold tabular-nums text-[var(--sber-text)]">
        {value}
      </div>
      <div className="text-[10px] uppercase tracking-[0.12em] text-[var(--sber-text-muted)]">
        {label}
      </div>
      {sub && (
        <div className="text-[9px] text-[var(--sber-text-muted)]">{sub}</div>
      )}
    </div>
  );
}

function PostLightbox({
  post,
  currentUser,
  onClose,
  onNavigate,
  onEdit,
  onDelete,
}: {
  post: PostDTO;
  currentUser: PublicUser;
  onClose: () => void;
  onNavigate: (s: Screen) => void;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  const isMine = post.authorUsername === currentUser.username;
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-sm sm:items-center"
      onClick={onClose}
      role="dialog"
    >
      <div
        className="relative max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-3xl border border-[var(--sber-border)] bg-[var(--sber-card)] sm:rounded-3xl"
        style={{ borderRadius: 16 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--sber-border)] bg-[var(--sber-card)]/95 px-3 py-2.5 backdrop-blur">
          <button
            onClick={() => onNavigate({ kind: "profile", username: post.authorUsername })}
            className="flex items-center gap-2 active:opacity-70 no-select"
          >
            <Avatar
              src={post.author?.avatar}
              name={post.authorUsername}
              size={28}
            />
            <span className="text-[13px] font-semibold">
              @{post.authorUsername}
            </span>
          </button>
          <div className="flex items-center gap-1">
            {isMine && onEdit && (
              <button
                onClick={onEdit}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-[var(--sber-text-muted)] active:bg-[var(--sber-card-2)]"
                aria-label="Редактировать"
              >
                <Pencil size={15} />
              </button>
            )}
            {isMine && onDelete && (
              <button
                onClick={onDelete}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-[#ef4444] active:bg-[var(--sber-card-2)]"
                aria-label="Удалить"
              >
                <X size={16} />
              </button>
            )}
            <button
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-[var(--sber-text-muted)] active:bg-[var(--sber-card-2)]"
              aria-label="Закрыть"
            >
              <X size={18} />
            </button>
          </div>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={post.image}
          alt="Пост"
          className="block w-full bg-black"
        />
        <div className="space-y-2 p-4">
          <div className="flex items-center gap-3 text-[13px]">
            <span className="inline-flex items-center gap-1">
              <Heart size={15} fill={post.likedByViewer ? "#ef4444" : "transparent"} stroke={post.likedByViewer ? "#ef4444" : "currentColor"} />
              {post.likesCount}
            </span>
            <span className="inline-flex items-center gap-1">
              <MessageCircle size={15} />
              {post.commentsCount}
            </span>
            <span className="ml-auto text-[11px] text-[var(--sber-text-muted)]">
              {formatRelative(post.createdAt)}
            </span>
          </div>
          <div className="rounded-2xl border border-[var(--sber-border)] bg-[var(--sber-card-2)] p-3" style={{ borderRadius: 16 }}>
            <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--sber-text-muted)]">
              Промт
            </div>
            <p className="whitespace-pre-wrap text-[13px] leading-relaxed">
              {post.prompt}
            </p>
          </div>
          {post.comments.length > 0 && (
            <div>
              <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--sber-text-muted)]">
                Комментарии ({post.commentsCount})
              </div>
              <ul className="space-y-2">
                {post.comments.map((c) => (
                  <li key={c.id} className="flex items-start gap-2">
                    <button
                      onClick={() => onNavigate({ kind: "profile", username: c.authorUsername })}
                      className="shrink-0"
                    >
                      <Avatar src={c.author?.avatar} name={c.authorUsername} size={26} />
                    </button>
                    <div
                      className="flex-1 rounded-2xl bg-[var(--sber-card-2)] px-3 py-2"
                      style={{ borderRadius: 16 }}
                    >
                      <div className="text-[11px] font-semibold">@{c.authorUsername}</div>
                      <p className="text-[13px] leading-snug">{c.text}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
