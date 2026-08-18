import { NextResponse } from "next/server";
import { mutate, publicPost, readDB } from "@/lib/db";
import { isValidPrompt, normalizeUsername } from "@/lib/validation";

export const runtime = "nodejs";

export async function DELETE(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const { searchParams } = new URL(req.url);
  const username = normalizeUsername(searchParams.get("username") ?? "");

  if (!username) {
    return NextResponse.json(
      { error: "Не указан пользователь (username)." },
      { status: 400 },
    );
  }

  const result = await mutate((db) => {
    const idx = db.posts.findIndex((p) => p.id === id);
    if (idx === -1) return { ok: false as const, code: 404 };
    const post = db.posts[idx];
    if (post.authorUsername !== username) {
      return { ok: false as const, code: 403 };
    }
    db.posts.splice(idx, 1);
    return { ok: true as const };
  });

  if (!result.ok) {
    return NextResponse.json(
      { error: result.code === 404 ? "Пост не найден." : "Чужие посты удалять нельзя." },
      { status: result.code },
    );
  }
  return NextResponse.json({ ok: true });
}

export async function PUT(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Невалидный JSON" }, { status: 400 });
  }

  const username = normalizeUsername(String(body.username ?? ""));
  const prompt = String(body.prompt ?? "");

  if (!username) {
    return NextResponse.json(
      { error: "Не указан пользователь (username)." },
      { status: 400 },
    );
  }
  if (!isValidPrompt(prompt)) {
    return NextResponse.json(
      { error: "Промт должен содержать от 1 до 1500 символов." },
      { status: 400 },
    );
  }

  const updated = await mutate((db) => {
    const p = db.posts.find((x) => x.id === id);
    if (!p) return null;
    if (p.authorUsername !== username) return "forbidden" as const;
    p.prompt = prompt.trim();
    return p;
  });

  if (updated === null) {
    return NextResponse.json({ error: "Пост не найден." }, { status: 404 });
  }
  if (updated === "forbidden") {
    return NextResponse.json(
      { error: "Редактировать можно только свои посты." },
      { status: 403 },
    );
  }

  const db = await readDB();
  return NextResponse.json({ post: publicPost(updated, db, username) });
}
