import { NextResponse } from "next/server";
import {
  findUser,
  mutate,
  newId,
  publicPost,
  readDB,
  type Post,
} from "@/lib/db";
import { isValidPrompt, normalizeUsername } from "@/lib/validation";
import { saveUpload } from "@/lib/uploads";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json(
      { error: "Ожидается multipart/form-data" },
      { status: 400 },
    );
  }

  const authorUsername = normalizeUsername(
    String(form.get("authorUsername") ?? ""),
  );
  const prompt = String(form.get("prompt") ?? "");
  const file = form.get("file");

  if (!authorUsername) {
    return NextResponse.json(
      { error: "Не указан автор (authorUsername)." },
      { status: 400 },
    );
  }
  if (!isValidPrompt(prompt)) {
    return NextResponse.json(
      { error: "Промт должен содержать от 1 до 1500 символов." },
      { status: 400 },
    );
  }
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json(
      { error: "Прикрепите изображение." },
      { status: 400 },
    );
  }

  let saved;
  try {
    saved = await saveUpload(file, "posts");
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Ошибка загрузки файла" },
      { status: 400 },
    );
  }

  const before = await readDB();
  if (!findUser(before, authorUsername)) {
    return NextResponse.json(
      { error: "Пользователь не найден. Войдите в аккаунт." },
      { status: 404 },
    );
  }

  const post: Post = {
    id: newId("p"),
    authorUsername,
    image: saved.url,
    prompt: prompt.trim(),
    createdAt: new Date().toISOString(),
    likes: [],
    comments: [],
  };

  await mutate(async (d) => {
    d.posts.unshift(post);
  });

  const after = await readDB();
  return NextResponse.json({
    post: publicPost(post, after, authorUsername),
  });
}
