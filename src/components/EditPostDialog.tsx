"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import type { PostDTO } from "@/lib/types";
import { api } from "@/lib/api";
import { Modal } from "@/components/Modal";

type Props = {
  open: boolean;
  post: PostDTO | null;
  onClose: () => void;
  onSaved: (post: PostDTO) => void;
  onToast: (kind: "success" | "error" | "info", text: string) => void;
};

export function EditPostDialog({
  open,
  post,
  onClose,
  onSaved,
  onToast,
}: Props) {
  const [prompt, setPrompt] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open && post) setPrompt(post.prompt);
  }, [open, post]);

  const save = async () => {
    if (!post) return;
    const t = prompt.trim();
    if (!t) {
      onToast("error", "Промт не может быть пустым");
      return;
    }
    setBusy(true);
    try {
      const { post: updated } = await api.updatePost(
        post.id,
        post.authorUsername,
        t,
      );
      onSaved(updated);
      onToast("success", "Пост обновлён");
      onClose();
    } catch (e) {
      onToast("error", e instanceof Error ? e.message : "Ошибка сохранения");
    } finally {
      setBusy(false);
    }
  };

  if (!post) return null;

  return (
    <Modal open={open} onClose={onClose} title="Редактировать пост">
      <div className="space-y-4 px-4 py-4">
        <div
          className="overflow-hidden rounded-2xl border border-[var(--sber-border)] bg-black"
          style={{ borderRadius: 16 }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.image}
            alt="Превью"
            className="mx-auto block max-h-[260px] w-full object-contain"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--sber-text-muted)]">
            Промт / описание
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={6}
            maxLength={1500}
            className="sber-input resize-none text-[14px] leading-relaxed"
          />
          <div className="mt-1 text-right text-[10px] text-[var(--sber-text-muted)]">
            {prompt.length}/1500
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
