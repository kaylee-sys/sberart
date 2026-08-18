"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import type {
  PostDTO,
  PublicUser,
  Screen,
  Toast,
  ToastKind,
} from "@/lib/types";
import { AuthScreen } from "@/components/AuthScreen";
import { FeedScreen } from "@/components/FeedScreen";
import { CreateScreen } from "@/components/CreateScreen";
import { ProfileScreen } from "@/components/ProfileScreen";
import { ChatListScreen } from "@/components/ChatListScreen";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { ToastHost } from "@/components/ToastHost";
import { EditProfileDialog } from "@/components/EditProfileDialog";
import { EditPostDialog } from "@/components/EditPostDialog";
import { Confirm } from "@/components/Modal";

const STORAGE_KEY = "sber-art-lab:user";

export function AppShell() {
  const [currentUser, setCurrentUser] = useState<PublicUser | null>(null);
  const [screen, setScreen] = useState<Screen>({ kind: "feed" });
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [editingProfile, setEditingProfile] = useState(false);
  const [editingPost, setEditingPost] = useState<PostDTO | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<PostDTO | null>(null);
  const [bootstrapping, setBootstrapping] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const [profileUser, setProfileUser] = useState<PublicUser | null>(null);
  const [hasUnread, setHasUnread] = useState(false);
  const toastTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  // Bootstrap from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const u = JSON.parse(raw) as PublicUser;
        setCurrentUser(u);
      }
    } catch {
      /* ignore */
    }
    setBootstrapping(false);
  }, []);

  const pushToast = useCallback((kind: ToastKind, text: string) => {
    const id = `t_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    setToasts((prev) => [...prev, { id, kind, text }]);
    const handle = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
      delete toastTimers.current[id];
    }, 2600);
    toastTimers.current[id] = handle;
  }, []);

  const handleAuth = useCallback(
    (user: PublicUser, created: boolean) => {
      setCurrentUser(user);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      } catch {
        /* ignore */
      }
      setScreen({ kind: "feed" });
      pushToast(
        "success",
        created
          ? `Добро пожаловать, @${user.username}!`
          : `С возвращением, @${user.username}!`,
      );
    },
    [pushToast],
  );

  const handleLogout = useCallback(() => {
    setCurrentUser(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    setScreen({ kind: "feed" });
    pushToast("info", "Вы вышли из аккаунта");
  }, [pushToast]);

  const handleProfileSaved = useCallback((u: PublicUser) => {
    setCurrentUser(u);
    setProfileUser(u);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    } catch {
      /* ignore */
    }
    setReloadKey((k) => k + 1);
  }, []);

  const handleNavigate = useCallback((s: Screen) => {
    setScreen(s);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    }
  }, []);

  const openProfile = useCallback(
    (username: string) => {
      if (currentUser && currentUser.username === username) {
        handleNavigate({ kind: "profile", username });
      } else {
        handleNavigate({ kind: "profile", username });
      }
    },
    [currentUser, handleNavigate],
  );

  const openChatWith = useCallback(
    (partner: PublicUser) => {
      if (!currentUser) return;
      if (partner.username === currentUser.username) return;
      handleNavigate({ kind: "chat-thread", partner: partner.username });
    },
    [currentUser, handleNavigate],
  );

  // Track profile target user
  useEffect(() => {
    if (screen.kind !== "profile" || !currentUser) {
      setProfileUser(null);
      return;
    }
    const username =
      screen.username === "__self__" ? currentUser.username : screen.username;
    if (username === currentUser.username) {
      setProfileUser(currentUser);
      return;
    }
    let cancelled = false;
    api
      .getProfile(username)
      .then((p) => {
        if (!cancelled) setProfileUser(p.user);
      })
      .catch(() => {
        if (!cancelled) setProfileUser(null);
      });
    return () => {
      cancelled = true;
    };
  }, [screen, currentUser]);

  const handleEditPost = useCallback((post: PostDTO) => {
    setEditingPost(post);
  }, []);

  const handlePostSaved = useCallback((updated: PostDTO) => {
    setReloadKey((k) => k + 1);
  }, []);

  const handleDeletePost = useCallback((post: PostDTO) => {
    setConfirmDelete(post);
  }, []);

  const confirmDeleteAction = useCallback(async () => {
    if (!confirmDelete || !currentUser) return;
    const target = confirmDelete;
    setConfirmDelete(null);
    try {
      await api.deletePost(target.id, currentUser.username);
      pushToast("success", "Пост удалён");
      setReloadKey((k) => k + 1);
      if (screen.kind === "profile" && screen.username !== currentUser.username) {
        handleNavigate({ kind: "feed" });
      }
    } catch (e) {
      pushToast(
        "error",
        e instanceof Error ? e.message : "Не удалось удалить",
      );
    }
  }, [confirmDelete, currentUser, pushToast, screen, handleNavigate]);

  const handleCreated = useCallback(
    (_post: PostDTO) => {
      pushToast("success", "Опубликовано в Sber Art Lab ✨");
      setReloadKey((k) => k + 1);
      handleNavigate({ kind: "feed" });
    },
    [pushToast, handleNavigate],
  );

  if (bootstrapping) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--sber-bg)]">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#10B981]/40 border-t-[#10B981]" />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <>
        <ToastHost toasts={toasts} />
        <AuthScreen onAuth={handleAuth} />
      </>
    );
  }

  const isSelfProfile =
    screen.kind === "profile" &&
    (screen.username === "__self__" || screen.username === currentUser.username);

  const profileTarget =
    screen.kind === "profile" && screen.username !== "__self__"
      ? screen.username
      : currentUser.username;

  return (
    <div className="min-h-screen bg-[var(--sber-bg)] text-[var(--sber-text)]">
      <ToastHost toasts={toasts} />

      <Header
        screen={screen}
        currentUser={currentUser}
        profileUser={profileUser}
        onNavigate={handleNavigate}
        onOpenMenu={isSelfProfile ? handleLogout : undefined}
      />

      <main className="pt-header pb-nav mx-auto w-full max-w-2xl">
        {screen.kind === "feed" && (
          <FeedScreen
            currentUser={currentUser}
            onNavigate={handleNavigate}
            onToast={pushToast}
            onEditPost={handleEditPost}
            onDeletePost={handleDeletePost}
            reloadKey={reloadKey}
          />
        )}

        {screen.kind === "create" && (
          <CreateScreen
            currentUser={currentUser}
            onCreated={handleCreated}
            onToast={pushToast}
          />
        )}

        {screen.kind === "profile" && (
          <ProfileScreen
            key={profileTarget + ":" + reloadKey}
            username={profileTarget}
            isSelf={isSelfProfile}
            currentUser={currentUser}
            onBack={() => handleNavigate({ kind: "feed" })}
            onOpenChatWith={openChatWith}
            onToast={pushToast}
            onEditPost={handleEditPost}
            onDeletePost={handleDeletePost}
            onNavigate={handleNavigate}
            reloadKey={reloadKey}
            onRequestEditProfile={() => setEditingProfile(true)}
          />
        )}

        {(screen.kind === "chat" || screen.kind === "chat-thread") && (
          <ChatListScreen
            currentUser={currentUser}
            onNavigate={handleNavigate}
            onToast={pushToast}
            reloadKey={reloadKey}
            onUnreadChange={setHasUnread}
            activePartner={
              screen.kind === "chat-thread" ? screen.partner : undefined
            }
          />
        )}
      </main>

      <BottomNav
        screen={screen}
        onNavigate={handleNavigate}
        hasUnread={hasUnread}
      />

      <EditProfileDialog
        open={editingProfile}
        user={currentUser}
        onClose={() => setEditingProfile(false)}
        onSaved={handleProfileSaved}
        onToast={pushToast}
      />

      <EditPostDialog
        open={!!editingPost}
        post={editingPost}
        onClose={() => setEditingPost(null)}
        onSaved={handlePostSaved}
        onToast={pushToast}
      />

      <Confirm
        open={!!confirmDelete}
        title="Удалить пост?"
        description={
          confirmDelete
            ? `Пост от @${confirmDelete.authorUsername} будет удалён без возможности восстановления.`
            : ""
        }
        confirmText="Удалить"
        destructive
        onConfirm={confirmDeleteAction}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}
