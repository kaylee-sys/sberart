"use client";

import { useState } from "react";
import { LogIn, UserPlus } from "lucide-react";
import { Logo } from "@/components/Logo";
import { api } from "@/lib/api";
import { isValidUsername } from "@/lib/validation";
import type { PublicUser } from "@/lib/types";

type Props = {
  onAuth: (user: PublicUser, created: boolean) => void;
};

export function AuthScreen({ onAuth }: Props) {
  const [nickname, setNickname] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (mode: "login" | "register") => {
    const clean = nickname.trim().toLowerCase().replace(/^@/, "");
    if (!isValidUsername(clean)) {
      setError(
        "Никнейм: 3–20 символов, латиница/цифры/_",
      );
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const { user, created } = await api.auth(clean);
      if (mode === "login" && !user) {
        throw new Error("Пользователь не найден");
      }
      onAuth(user, created);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка входа");
    } finally {
      setBusy(false);
    }
  };

  const tryDemo = (name: string) => {
    setNickname(name);
    setTimeout(() => submit("login"), 50);
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center gap-8 px-6 py-10 no-select">
      <div className="flex flex-col items-center gap-4">
        <Logo size={56} withText={false} />
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">
            <span className="sber-gradient-text">Sber</span> Art Lab
          </h1>
          <p className="mt-1 text-sm text-[var(--sber-text-muted)]">
            Создавай искусство вместе с искусственным интеллектом
          </p>
        </div>
      </div>

      <div
        className="w-full rounded-2xl border border-[var(--sber-border)] bg-[var(--sber-card)] p-5"
        style={{ borderRadius: 16 }}
      >
        <label className="mb-2 block text-[12px] font-medium uppercase tracking-[0.14em] text-[var(--sber-text-muted)]">
          Никнейм
        </label>
        <div className="mb-3 flex items-center gap-2 rounded-2xl bg-[var(--sber-card-2)] px-3 py-2.5">
          <span className="text-[15px] text-[var(--sber-text-muted)]">@</span>
          <input
            type="text"
            inputMode="text"
            autoComplete="username"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            value={nickname}
            onChange={(e) => {
              setNickname(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "_"));
              setError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") submit("login");
            }}
            placeholder="например, sber_pioneer"
            maxLength={20}
            className="flex-1 bg-transparent text-[15px] text-[var(--sber-text)] outline-none placeholder:text-[var(--sber-text-muted)]"
          />
        </div>

        {error && (
          <div className="mb-3 rounded-2xl border border-[#ef4444]/40 bg-[#ef4444]/10 px-3 py-2 text-[12px] text-[#ef4444]">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => submit("login")}
            disabled={busy || !nickname.trim()}
            className="sber-btn-ghost flex items-center justify-center gap-1.5 py-3 text-[14px] font-medium no-select active:scale-[0.98]"
          >
            <LogIn size={16} />
            Войти
          </button>
          <button
            onClick={() => submit("register")}
            disabled={busy || !nickname.trim()}
            className="sber-btn-primary flex items-center justify-center gap-1.5 py-3 text-[14px] no-select active:scale-[0.98]"
          >
            <UserPlus size={16} />
            Регистрация
          </button>
        </div>
      </div>

      <div className="w-full">
        <div className="mb-2 text-center text-[11px] uppercase tracking-[0.16em] text-[var(--sber-text-muted)]">
          Демо-аккаунты
        </div>
        <div className="grid grid-cols-1 gap-2">
          {[
            { name: "sber_pioneer", label: "Команда Sber Art Lab" },
            { name: "ai_dreamer", label: "AI-художник" },
            { name: "code_artist", label: "Dev & нейросети" },
          ].map((d) => (
            <button
              key={d.name}
              onClick={() => tryDemo(d.name)}
              disabled={busy}
              className="sber-card-2 flex items-center justify-between px-3 py-2.5 text-left no-select active:scale-[0.99]"
            >
              <div>
                <div className="text-[13px] font-semibold text-[var(--sber-text)]">
                  @{d.name}
                </div>
                <div className="text-[11px] text-[var(--sber-text-muted)]">
                  {d.label}
                </div>
              </div>
              <LogIn size={14} className="text-[var(--sber-text-muted)]" />
            </button>
          ))}
        </div>
      </div>

      <div className="text-center text-[11px] leading-relaxed text-[var(--sber-text-muted)]">
        Вход по никнейму — без пароля.
        <br />
        Аккаунт сохраняется на устройстве.
      </div>
    </div>
  );
}
