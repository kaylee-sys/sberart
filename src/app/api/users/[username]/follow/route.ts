import { NextResponse } from "next/server";
import { findUser, mutate } from "@/lib/db";
import { normalizeUsername } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(
  req: Request,
  ctx: { params: Promise<{ username: string }> },
) {
  const { username: targetUsername } = await ctx.params;
  const target = normalizeUsername(targetUsername);

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Невалидный JSON" }, { status: 400 });
  }
  const follower = normalizeUsername(String(body.follower ?? ""));

  if (!follower) {
    return NextResponse.json(
      { error: "Не указан подписчик (follower)." },
      { status: 400 },
    );
  }
  if (follower === target) {
    return NextResponse.json(
      { error: "Нельзя подписаться на самого себя." },
      { status: 400 },
    );
  }

  const result = await mutate((db) => {
    if (!findUser(db, target) || !findUser(db, follower)) return null;
    const i = db.follows.findIndex(
      (f) => f.follower === follower && f.following === target,
    );
    if (i >= 0) {
      db.follows.splice(i, 1);
      return { following: false };
    }
    db.follows.push({ follower, following: target });
    return { following: true };
  });

  if (!result) {
    return NextResponse.json(
      { error: "Пользователь не найден." },
      { status: 404 },
    );
  }
  return NextResponse.json(result);
}
