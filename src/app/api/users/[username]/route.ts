import { NextResponse } from "next/server";
import { findUser, publicPost, publicUser, readDB } from "@/lib/db";
import { normalizeUsername } from "@/lib/validation";

export const runtime = "nodejs";

export async function GET(
  req: Request,
  ctx: { params: Promise<{ username: string }> },
) {
  const { username: rawUsername } = await ctx.params;
  const username = normalizeUsername(rawUsername);
  const { searchParams } = new URL(req.url);
  const viewer = normalizeUsername(searchParams.get("viewer") ?? "");

  const db = await readDB();
  const user = findUser(db, username);
  if (!user) {
    return NextResponse.json(
      { error: "Пользователь не найден." },
      { status: 404 },
    );
  }

  const userPosts = db.posts
    .filter((p) => p.authorUsername === username)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .map((p) => publicPost(p, db, viewer || undefined));

  const totalLikes = userPosts.reduce((sum, p) => sum + p.likesCount, 0);

  const followers = db.follows.filter((f) => f.following === username).length;
  const following = db.follows.filter((f) => f.follower === username).length;

  const isFollowing = viewer
    ? db.follows.some(
        (f) => f.follower === viewer && f.following === username,
      )
    : false;

  return NextResponse.json({
    user: publicUser(user),
    stats: {
      posts: userPosts.length,
      likes: totalLikes,
      followers,
      following,
    },
    isFollowing,
    isSelf: viewer === username,
    posts: userPosts,
  });
}
