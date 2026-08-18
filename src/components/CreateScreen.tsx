"use client";

import { useRef, useState } from "react";
import { ExternalLink, ImagePlus, Sparkles, X } from "lucide-react";
import type { PostDTO, PublicUser } from "@/lib/types";
import { api } from "@/lib/api";

type Props = {
  currentUser: PublicUser;
  onCreated: (post: PostDTO) => void;
  onToast: (kind: "success" | "error" | "info", text: string) => void;
};

export function CreateScreen({ currentUser, onCreated, onToast }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const onFile = (f: File | null) => {
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      onToast("error", "Можно загружать только изображения");
      return;
    }
    if (f.size > 12 * 1024 * 1024) {
      onToast("error", "Файл больше 12 МБ");
      return;
    }
    setFile(f);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(f);
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setPrompt("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const submit = async () => {
    if (!file) {
      onToast("error", "Прикрепите изображение");
      return;
    }
    const trimmed = prompt.trim();
    if (!trimmed) {
      onToast("error", "Опишите арт (промт)");
      return;
    }
    setBusy(true);
    try {
      const { post } = await api.createPost({
        authorUsername: currentUser.username,
        prompt: trimmed,
        file,
      });
      onCreated(post);
      reset();
      onToast("success", "Опубликовано в Sber Art Lab ✨");
    } catch (e) {
      onToast(
        "error",
        e instanceof Error ? e.message : "Не удалось опубликовать",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-3 pb-6 pt-1">
      {/* Coming-soon banner */}
      <div
        className="relative overflow-hidden rounded-2xl border border-[#10B981]/30 bg-gradient-to-br from-[#10B981]/15 via-[#04D361]/10 to-transparent p-4"
        style={{ borderRadius: 16 }}
      >
        <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-[#10B981]/15 blur-2xl" />
        <div className="absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-[#04D361]/15 blur-2xl" />
        <div className="relative flex items-start gap-3">
          <div className="sber-gradient flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl">
            <Sparkles size={18} className="text-black" strokeWidth={2.4} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="sber-chip border-[#10B981]/40 bg-[#10B981]/10 text-[#10B981]">
                Скоро появится
              </span>
            </div>
            <div className="mt-1.5 text-[14px] font-semibold text-[var(--sber-text)]">
              Встроенная генерация арта
            </div>
            <p className="mt-1 text-[12px] leading-relaxed text-[var(--sber-text-muted)]">
              Прямо из приложения скоро можно будет генерировать арт по промту.
              Пока публикуйте готовые работы вручную 👇
            </p>
            <a
              href="https://giga.chat"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 rounded-2xl bg-[var(--sber-card-2)] px-3 py-2 text-[12px] font-medium text-[var(--sber-text)] active:scale-95 no-select"
            >
              Для генерации арта перейдите в GigaChat
              <ExternalLink size={13} />
            </a>
          </div>
        </div>
      </div>

      {/* Manual form */}
      <div
        className="rounded-2xl border border-[var(--sber-border)] bg-[var(--sber-card)] p-4"
        style={{ borderRadius: 16 }}
      >
        <div className="mb-3 text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--sber-text-muted)]">
          Ручная публикация
        </div>

        {/* Image picker */}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => onFile(e.target.files?.[0] ?? null)}
        />

        {preview ? (
          <div className="relative mb-3 overflow-hidden rounded-2xl border border-[var(--sber-border)] bg-black">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Превью"
              className="mx-auto block max-h-[420px] w-full object-contain"
            />
            <button
              onClick={reset}
              className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-xl bg-black/60 text-white backdrop-blur active:scale-95 no-select"
              aria-label="Убрать файл"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => fileRef.current?.click()}
            className="mb-3 flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[var(--sber-border)] bg-[var(--sber-card-2)] py-10 text-center text-[var(--sber-text-muted)] active:bg-[var(--sber-card)] no-select"
          >
            <div className="sber-gradient flex h-12 w-12 items-center justify-center rounded-2xl">
              <ImagePlus size={22} className="text-black" />
            </div>
            <div className="text-[14px] font-medium text-[var(--sber-text)]">
              Выбрать изображение
            </div>
            <div className="text-[11px]">
              JPEG · PNG · WebP · GIF · до 12 МБ
            </div>
          </button>
        )}

        <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--sber-text-muted)]">
          Промт / описание
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Опишите арт: стиль, палитра, настроение, детали…"
          rows={5}
          maxLength={1500}
          className="sber-input resize-none text-[14px] leading-relaxed"
        />
        <div className="mt-1 text-right text-[10px] text-[var(--sber-text-muted)]">
          {prompt.length}/1500
        </div>

        <button
          onClick={submit}
          disabled={busy || !file || !prompt.trim()}
          className="sber-btn-primary mt-3 flex w-full items-center justify-center gap-2 py-3.5 text-[14px] no-select active:scale-[0.99]"
        >
          {busy ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/40 border-t-black" />
              Публикация…
            </>
          ) : (
            <>
              <Sparkles size={16} strokeWidth={2.4} />
              Опубликовать в Sber Art Lab
            </>
          )}
        </button>
      </div>
    </div>
  );
}
