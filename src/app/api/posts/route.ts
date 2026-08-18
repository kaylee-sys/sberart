import { NextResponse } from "next/server";
import { publicPost, readDB } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const viewer = searchParams.get("viewer") ?? undefined;

  const db = await readDB();
  const sorted = [...db.posts].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  const posts = sorted.map((p) => publicPost(p, db, viewer));
  return NextResponse.json({ posts });
}
