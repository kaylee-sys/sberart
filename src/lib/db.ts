import { promises as fs } from "node:fs";
import path from "node:path";

export type User = {
  username: string;
  bio: string;
  avatar: string;
  joinedAt: string;
};

export type Comment = {
  id: string;
  authorUsername: string;
  text: string;
  createdAt: string;
};

export type Post = {
  id: string;
  authorUsername: string;
  image: string;
  prompt: string;
  createdAt: string;
  likes: string[];
  comments: Comment[];
};

export type Follow = {
  follower: string;
  following: string;
};

export type Message = {
  id: string;
  from: string;
  to: string;
  text: string;
  createdAt: string;
};

export type DB = {
  users: User[];
  posts: Post[];
  follows: Follow[];
  messages: Message[];
};

const DB_PATH = path.join(process.cwd(), "data", "db.json");

let writeLock: Promise<void> = Promise.resolve();

async function ensureDB(): Promise<void> {
  try {
    await fs.access(DB_PATH);
  } catch {
    await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
    await fs.writeFile(DB_PATH, JSON.stringify(emptyDB(), null, 2), "utf8");
  }
}

function emptyDB(): DB {
  return { users: [], posts: [], follows: [], messages: [] };
}

export async function readDB(): Promise<DB> {
  await ensureDB();
  const raw = await fs.readFile(DB_PATH, "utf8");
  try {
    const parsed = JSON.parse(raw) as Partial<DB>;
    return {
      users: parsed.users ?? [],
      posts: parsed.posts ?? [],
      follows: parsed.follows ?? [],
      messages: parsed.messages ?? [],
    };
  } catch {
    return emptyDB();
  }
}

export async function writeDB(db: DB): Promise<void> {
  const next = writeLock.then(async () => {
    await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
    await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), "utf8");
  });
  writeLock = next.catch(() => undefined);
  await next;
}

export async function mutate<T>(fn: (db: DB) => Promise<T> | T): Promise<T> {
  const db = await readDB();
  const result = await fn(db);
  await writeDB(db);
  return result;
}

export function newId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

export function findUser(db: DB, username: string): User | undefined {
  return db.users.find((u) => u.username === username);
}

export function publicUser(u: User) {
  return {
    username: u.username,
    bio: u.bio,
    avatar: u.avatar,
    joinedAt: u.joinedAt,
  };
}

export function publicPost(p: Post, db: DB, viewer?: string) {
  const author = findUser(db, p.authorUsername);
  return {
    id: p.id,
    authorUsername: p.authorUsername,
    author: author ? publicUser(author) : null,
    image: p.image,
    prompt: p.prompt,
    createdAt: p.createdAt,
    likesCount: p.likes.length,
    likedByViewer: viewer ? p.likes.includes(viewer) : false,
    commentsCount: p.comments.length,
    comments: p.comments.map((c) => {
      const a = findUser(db, c.authorUsername);
      return {
        id: c.id,
        text: c.text,
        createdAt: c.createdAt,
        authorUsername: c.authorUsername,
        author: a ? publicUser(a) : null,
      };
    }),
  };
}
