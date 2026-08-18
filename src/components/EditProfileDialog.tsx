"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, Check } from "lucide-react";
import type { PublicUser } from "@/lib/types";
import { Avatar } from "@/components/Avatar";
import { api } from "@/lib/api";
import { Modal } from "@/components/Modal";

type Props = {
  open: boolean;
  user: PublicUser;
  onClose: () => void;
  onSaved: (user: PublicUser) => void;
  onToast: (kind: "success" | "error" | "info", text: string) => void;
};

export function EditProfileDialog({
  open,
  user,
  onClose,
  onSaved,
  onToast,
}: Props) {
  const [bio, setBio] = useState(user.bio);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setBio(user.bio);
      setAvatarFile(null);
      setAvatarPreview(null);
    }
  }, [open, user]);

  const onFile = (f: File | null) => {
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      onToast("error", "Только изображения");
      return;
    }
    if (f.size > 12 * 1024 * 1024) {
      onToast("error", "Файл больше 12 МБ");
      return;
    }
    setAvatarFile(f);
    const r = new FileReader();
    r.onload = () => setAvatarPreview(r.result as string);
    r.readAsDataURL(f);
  };

  const save = async () => {
    setBusy(true);
    try {
      const { user: updated } = await api.updateProfile(user.username, {
        viewer: user.username,
        bio: bio.trim(),
        avatarFile: avatarFile ?? undefined,
      });
      onSaved(updated);
      onToast("success", "Профиль обновлён");
      onClose();
    } catch (e) {
      onToast("error", e instanceof Error ? e.message : "Ошибка сохранения");
    } finally {
      setBusy(false);
    }
  };

  const previewSrc = avatarPreview ?? user.avatar;

  return (
    <Modal open={open} onClose={onClose} title="Редактировать профиль">
      <div className="space-y-4 px-4 py-4">
        <div className="flex flex-col items-center gap-2">
          <div className="relative">
            <Avatar src={previewSrc} name={user.username} size={88} />
            <button
              onClick={() => fileRef.current?.click()}
              className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-[var(--sber-card)] bg-[var(--sber-card-2)] text-[var(--sber-text)] active:scale-95 no-select"
              aria-label="Сменить фото"
            >
              <Camera size={14} />
            </button>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => onFile(e.target.files?.[0] ?? null)}
          />
          <div className="text-[12px] text-[var(--sber-text-muted)]">
            Нажмите на иконку камеры, чтобы сменить фото
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--sber-text-muted)]">
            О себе
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Расскажите о себе: стиль, инструменты, что вдохновляет…"
            rows={4}
            maxLength={280}
            className="sber-input resize-none text-[14px] leading-relaxed"
          />
          <div className="mt-1 text-right text-[10px] text-[var(--sber-text-muted)]">
            {bio.length}/280
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <button
            onClick={onClose}
            disabled={busy}
            className="sber-btn-ghost px-4 py-2.5 text-[13px] no-select active:scale-95"
          >
            Отмена
          </button>
          <button
            onClick={save}
            disabled={busy}
            className="sber-btn-primary flex items-center gap-1.5 px-4 py-2.5 text-[13px] no-select active:scale-95"
          >
            {busy ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/40 border-t-black" />
            ) : (
              <Check size={14} />
            )}
            Сохранить
          </button>
        </div>
      </div>
    </Modal>
  );
}
