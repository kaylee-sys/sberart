import { NextResponse } from "next/server";
import { mutate, publicPost, readDB } from "@/lib/db";
import { normalizeUsername } from "@/lib/validation";

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
  if (!username) {
    return NextResponse.json(
      { error: "Не указан пользователь (username)." },
      { status: 400 },
    );
  }

  const result = await mutate((db) => {
    const p = db.posts.find((x) => x.id === id);
    if (!p) return null;
    const i = p.likes.indexOf(username);
    if (i >= 0) p.likes.splice(i, 1);
    else p.likes.push(username);
    return p;
  });

  if (!result) {
    return NextResponse.json({ error: "Пост не найден." }, { status: 404 });
  }

  const db = await readDB();
  return NextResponse.json({
    post: publicPost(result, db, username),
    liked: result.likes.includes(username),
    likesCount: result.likes.length,
  });
}
