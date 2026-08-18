"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import type { PostDTO, PublicUser, Screen } from "@/lib/types";
import { api } from "@/lib/api";
import { PostCard } from "@/components/PostCard";

type Props = {
  currentUser: PublicUser;
  onNavigate: (s: Screen) => void;
  onToast: (kind: "success" | "error" | "info", text: string) => void;
  onEditPost: (post: PostDTO) => void;
  onDeletePost: (post: PostDTO) => void;
  reloadKey: number;
};

export function FeedScreen({
  currentUser,
  onNavigate,
  onToast,
  onEditPost,
  onDeletePost,
  reloadKey,
}: Props) {
  const [posts, setPosts] = useState<PostDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      try {
        const { posts } = await api.listPosts(currentUser.username);
        setPosts(posts);
      } catch (e) {
        onToast(
          "error",
          e instanceof Error ? e.message : "Не удалось загрузить ленту",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [currentUser.username, onToast],
  );

  useEffect(() => {
    void load();
  }, [load, reloadKey]);

  const handleRefresh = () => {
    setRefreshing(true);
    void load(true);
  };

  const handleLike = async (post: PostDTO) => {
    try {
      const res = await api.toggleLike(post.id, currentUser.username);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === post.id
            ? {
                ...p,
                likedByViewer: res.liked,
                likesCount: res.likesCount,
              }
            : p,
        ),
      );
    } catch (e) {
      onToast(
        "error",
        e instanceof Error ? e.message : "Ошибка лайка",
      );
    }
  };

  const handleComment = async (post: PostDTO, text: string) => {
    try {
      const { post: updated } = await api.addComment(
        post.id,
        currentUser.username,
        text,
      );
      setPosts((prev) => prev.map((p) => (p.id === post.id ? updated : p)));
      onToast("success", "Комментарий добавлен");
    } catch (e) {
      onToast(
        "error",
        e instanceof Error ? e.message : "Ошибка комментария",
      );
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-3 px-3 pb-6">
      <div className="flex items-center justify-between px-1 pt-1">
        <div className="text-[12px] uppercase tracking-[0.16em] text-[var(--sber-text-muted)]">
          Лента · {posts.length}
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex h-8 w-8 items-center justify-center rounded-xl text-[var(--sber-text-muted)] active:bg-[var(--sber-card-2)] no-select"
          aria-label="Обновить"
        >
          <RefreshCw
            size={16}
            className={refreshing ? "animate-spin" : ""}
          />
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="sber-card overflow-hidden"
              style={{ borderRadius: 16 }}
            >
              <div className="flex items-center gap-3 p-3">
                <div
                  className="sber-shimmer h-10 w-10 rounded-full"
                  style={{ borderRadius: "50%" }}
                />
                <div className="flex-1 space-y-2">
                  <div className="sber-shimmer h-3 w-24 rounded" />
                  <div className="sber-shimmer h-2 w-16 rounded" />
                </div>
              </div>
              <div className="sber-shimmer aspect-[4/5] w-full" />
              <div className="space-y-2 p-3">
                <div className="sber-shimmer h-3 w-32 rounded" />
                <div className="sber-shimmer h-2 w-full rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div
          className="sber-card flex flex-col items-center gap-2 p-10 text-center"
          style={{ borderRadius: 16 }}
        >
          <div className="text-4xl">🎨</div>
          <div className="text-[15px] font-semibold">Лента пуста</div>
          <div className="text-[12px] text-[var(--sber-text-muted)]">
            Будь первым — нажми «Создать» внизу
          </div>
        </div>
      ) : (
        posts.map((p) => (
          <PostCard
            key={p.id}
            post={p}
            currentUser={currentUser}
            onToggleLike={handleLike}
            onAddComment={handleComment}
            onOpenProfile={(u) => onNavigate({ kind: "profile", username: u })}
            onEdit={
              p.authorUsername === currentUser.username
                ? onEditPost
                : undefined
            }
            onDelete={
              p.authorUsername === currentUser.username
                ? onDeletePost
                : undefined
            }
          />
        ))
      )}
    </div>
  );
}
