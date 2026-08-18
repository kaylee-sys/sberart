import { NextResponse } from "next/server";
import {
  findUser,
  mutate,
  publicUser,
  readDB,
  type User,
} from "@/lib/db";
import {
  isValidBio,
  isValidUsername,
  normalizeUsername,
} from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Невалидный JSON" }, { status: 400 });
  }

  const username = normalizeUsername(String(body.username ?? ""));
  if (!isValidUsername(username)) {
    return NextResponse.json(
      {
        error:
          "Никнейм должен содержать 3–20 символов (латиница, цифры, _), без пробелов.",
      },
      { status: 400 },
    );
  }

  const db = await readDB();
  const existing = findUser(db, username);
  if (existing) {
    return NextResponse.json({ user: publicUser(existing), created: false });
  }

  const bio = typeof body.bio === "string" ? body.bio : "";
  if (!isValidBio(bio)) {
    return NextResponse.json(
      { error: "Описание слишком длинное (макс. 280)." },
      { status: 400 },
    );
  }

  const avatar =
    typeof body.avatar === "string" && body.avatar.length > 0
      ? body.avatar
      : "/avatars/sber_pioneer.webp";

  const newUser: User = {
    username,
    bio,
    avatar,
    joinedAt: new Date().toISOString(),
  };

  await mutate(async (d) => {
    d.users.push(newUser);
  });

  return NextResponse.json({ user: publicUser(newUser), created: true });
}
