import { promises as fs } from "node:fs";
import path from "node:path";

const UPLOADS_ROOT = path.join(process.cwd(), "public", "uploads");

export type SavedFile = {
  url: string;
  filename: string;
  size: number;
};

const ALLOWED_IMAGE_EXT: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

const MAX_BYTES = 12 * 1024 * 1024;

export async function saveUpload(
  file: File,
  folder: "posts" | "avatars",
): Promise<SavedFile> {
  if (!ALLOWED_IMAGE_EXT[file.type]) {
    throw new Error(
      `Недопустимый формат файла: ${file.type || "unknown"}. Разрешены: JPEG, PNG, WebP, GIF.`,
    );
  }
  if (file.size > MAX_BYTES) {
    throw new Error("Файл слишком большой (макс. 12 МБ).");
  }

  const dir = path.join(UPLOADS_ROOT, folder);
  await fs.mkdir(dir, { recursive: true });

  const safeName =
    `${folder}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}` +
    ALLOWED_IMAGE_EXT[file.type];
  const fullPath = path.join(dir, safeName);

  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(fullPath, buffer);

  return {
    url: `/uploads/${folder}/${safeName}`,
    filename: safeName,
    size: file.size,
  };
}
