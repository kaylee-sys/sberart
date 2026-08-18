import { NextResponse } from "next/server";
import {
  findUser,
  mutate,
  newId,
  publicPost,
  readDB,
  type Comment,
} from "@/lib/db";
import { isValidComment, normalizeUsername } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(
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
  const text = String(body.text ?? "");

  if (!username) {
    return NextResponse.json(
      { error: "Не указан пользователь (username)." },
      { status: 400 },
    );
  }
  if (!isValidComment(text)) {
    return NextResponse.json(
      { error: "Комментарий должен содержать от 1 до 500 символов." },
      { status: 400 },
    );
  }

  const result = await mutate((db) => {
    if (!findUser(db, username)) return "no_user" as const;
    const p = db.posts.find((x) => x.id === id);
    if (!p) return null;
    const comment: Comment = {
      id: newId("c"),
      authorUsername: username,
      text: text.trim(),
      createdAt: new Date().toISOString(),
    };
    p.comments.push(comment);
    return p;
  });

  if (result === null) {
    return NextResponse.json({ error: "Пост не найден." }, { status: 404 });
  }
  if (result === "no_user") {
    return NextResponse.json(
      { error: "Пользователь не найден. Войдите в аккаунт." },
      { status: 404 },
    );
  }

  const db = await readDB();
  return NextResponse.json({ post: publicPost(result, db, username) });
}
