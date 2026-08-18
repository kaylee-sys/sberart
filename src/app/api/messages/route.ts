import { NextResponse } from "next/server";
import { findUser, mutate, newId, readDB, type Message } from "@/lib/db";
import { normalizeUsername } from "@/lib/validation";

export const runtime = "nodejs";

type Conversation = {
  partnerUsername: string;
  partner: ReturnType<typeof toPublic> | null;
  lastMessage: Message;
  unread: number;
};

function toPublic(u: NonNullable<ReturnType<typeof findUser>>) {
  return {
    username: u.username,
    bio: u.bio,
    avatar: u.avatar,
    joinedAt: u.joinedAt,
  };
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const user = normalizeUsername(searchParams.get("user") ?? "");
  const partner = searchParams.get("partner");

  const db = await readDB();
  if (!user) {
    return NextResponse.json(
      { error: "Не указан пользователь (user)." },
      { status: 400 },
    );
  }

  if (partner) {
    const partnerName = normalizeUsername(partner);
    const thread = db.messages
      .filter(
        (m) =>
          (m.from === user && m.to === partnerName) ||
          (m.from === partnerName && m.to === user),
      )
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
    return NextResponse.json({ messages: thread });
  }

  const partners = new Set<string>();
  for (const m of db.messages) {
    if (m.from === user) partners.add(m.to);
    if (m.to === user) partners.add(m.from);
  }

  const conversations: Conversation[] = [];
  for (const p of partners) {
    const thread = db.messages
      .filter(
        (m) =>
          (m.from === user && m.to === p) || (m.from === p && m.to === user),
      )
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    if (thread.length === 0) continue;
    const u = findUser(db, p);
    conversations.push({
      partnerUsername: p,
      partner: u ? toPublic(u) : null,
      lastMessage: thread[0],
      unread: 0,
    });
  }

  conversations.sort(
    (a, b) =>
      new Date(b.lastMessage.createdAt).getTime() -
      new Date(a.lastMessage.createdAt).getTime(),
  );

  return NextResponse.json({ conversations });
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const from = normalizeUsername(String(body.from ?? ""));
  const to = normalizeUsername(String(body.to ?? ""));
  const text = String(body.text ?? "").trim();

  if (!from || !to) {
    return NextResponse.json(
      { error: "Нужны поля from и to." },
      { status: 400 },
    );
  }
  if (text.length === 0 || text.length > 1000) {
    return NextResponse.json(
      { error: "Сообщение должно содержать 1–1000 символов." },
      { status: 400 },
    );
  }
  if (from === to) {
    return NextResponse.json(
      { error: "Нельзя отправить сообщение самому себе." },
      { status: 400 },
    );
  }

  const result = await mutate((db) => {
    if (!findUser(db, from) || !findUser(db, to)) return null;
    const msg: Message = {
      id: newId("m"),
      from,
      to,
      text,
      createdAt: new Date().toISOString(),
    };
    db.messages.push(msg);
    return msg;
  });

  if (!result) {
    return NextResponse.json(
      { error: "Пользователь не найден." },
      { status: 404 },
    );
  }
  return NextResponse.json({ message: result });
}
