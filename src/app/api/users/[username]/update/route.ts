import { NextResponse } from "next/server";
import { findUser, mutate, publicUser, type User } from "@/lib/db";
import { isValidBio, normalizeUsername } from "@/lib/validation";
import { saveUpload } from "@/lib/uploads";

export const runtime = "nodejs";

export async function POST(
  req: Request,
  ctx: { params: Promise<{ username: string }> },
) {
  const { username: rawUsername } = await ctx.params;
  const target = normalizeUsername(rawUsername);

  const contentType = req.headers.get("content-type") ?? "";
  let viewer = "";
  let bio: string | undefined;
  let avatarFile: File | undefined;
  let avatarUrl: string | undefined;

  if (contentType.includes("multipart/form-data")) {
    const form = await req.formData();
    viewer = normalizeUsername(String(form.get("viewer") ?? ""));
    const b = form.get("bio");
    if (typeof b === "string") bio = b;
    const f = form.get("avatar");
    if (f instanceof File && f.size > 0) avatarFile = f;
  } else {
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    viewer = normalizeUsername(String(body.viewer ?? ""));
    if (typeof body.bio === "string") bio = body.bio;
    if (typeof body.avatar === "string" && body.avatar.length > 0)
      avatarUrl = body.avatar;
  }

  if (viewer !== target) {
    return NextResponse.json(
      { error: "Редактировать можно только свой профиль." },
      { status: 403 },
    );
  }
  if (bio !== undefined && !isValidBio(bio)) {
    return NextResponse.json(
      { error: "Описание слишком длинное (макс. 280)." },
      { status: 400 },
    );
  }

  if (avatarFile) {
    try {
      const saved = await saveUpload(avatarFile, "avatars");
      avatarUrl = saved.url;
    } catch (e) {
      return NextResponse.json(
        { error: e instanceof Error ? e.message : "Ошибка загрузки" },
        { status: 400 },
      );
    }
  }

  let updated: User | null = null;
  await mutate((db) => {
    const u = findUser(db, target);
    if (!u) return;
    if (bio !== undefined) u.bio = bio;
    if (avatarUrl) u.avatar = avatarUrl;
    updated = u;
  });

  if (!updated) {
    return NextResponse.json(
      { error: "Пользователь не найден." },
      { status: 404 },
    );
  }

  return NextResponse.json({ user: publicUser(updated) });
}
