import type {
  CommentDTO,
  ConversationDTO,
  MessageDTO,
  PostDTO,
  ProfileDTO,
  PublicUser,
} from "@/lib/types";

async function request<T>(
  input: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(input, init);
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    const msg =
      typeof data.error === "string"
        ? data.error
        : `Ошибка ${res.status}`;
    throw new Error(msg);
  }
  return data as T;
}

export const api = {
  async auth(username: string, bio?: string, avatar?: string) {
    return request<{ user: PublicUser; created: boolean }>("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, bio, avatar }),
    });
  },

  async listPosts(viewer?: string) {
    const q = viewer ? `?viewer=${encodeURIComponent(viewer)}` : "";
    return request<{ posts: PostDTO[] }>(`/api/posts${q}`);
  },

  async createPost(input: {
    authorUsername: string;
    prompt: string;
    file: File;
  }) {
    const form = new FormData();
    form.append("authorUsername", input.authorUsername);
    form.append("prompt", input.prompt);
    form.append("file", input.file);
    return request<{ post: PostDTO }>("/api/posts/create", {
      method: "POST",
      body: form,
    });
  },

  async deletePost(id: string, username: string) {
    return request<{ ok: true }>(
      `/api/posts/${encodeURIComponent(id)}?username=${encodeURIComponent(username)}`,
      { method: "DELETE" },
    );
  },

  async updatePost(id: string, username: string, prompt: string) {
    return request<{ post: PostDTO }>(
      `/api/posts/${encodeURIComponent(id)}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, prompt }),
      },
    );
  },

  async toggleLike(id: string, username: string) {
    return request<{ post: PostDTO; liked: boolean; likesCount: number }>(
      `/api/posts/${encodeURIComponent(id)}/like`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      },
    );
  },

  async addComment(id: string, username: string, text: string) {
    return request<{ post: PostDTO }>(
      `/api/posts/${encodeURIComponent(id)}/comment`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, text }),
      },
    );
  },

  async getProfile(username: string, viewer?: string) {
    const q = viewer ? `?viewer=${encodeURIComponent(viewer)}` : "";
    return request<ProfileDTO>(
      `/api/users/${encodeURIComponent(username)}${q}`,
    );
  },

  async toggleFollow(target: string, follower: string) {
    return request<{ following: boolean }>(
      `/api/users/${encodeURIComponent(target)}/follow`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ follower }),
      },
    );
  },

  async updateProfile(
    target: string,
    input: { viewer: string; bio?: string; avatarFile?: File },
  ) {
    const form = new FormData();
    form.append("viewer", input.viewer);
    if (input.bio !== undefined) form.append("bio", input.bio);
    if (input.avatarFile) form.append("avatar", input.avatarFile);
    return request<{ user: PublicUser }>(
      `/api/users/${encodeURIComponent(target)}/update`,
      { method: "POST", body: form },
    );
  },

  async listConversations(user: string) {
    return request<{ conversations: ConversationDTO[] }>(
      `/api/messages?user=${encodeURIComponent(user)}`,
    );
  },

  async listThread(user: string, partner: string) {
    return request<{ messages: MessageDTO[] }>(
      `/api/messages?user=${encodeURIComponent(user)}&partner=${encodeURIComponent(partner)}`,
    );
  },

  async sendMessage(from: string, to: string, text: string) {
    return request<{ message: MessageDTO }>("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ from, to, text }),
    });
  },
};

export function commentPreview(c: CommentDTO, fallback: string): string {
  const author = c.authorUsername || fallback;
  return `@${author}: ${c.text}`;
}
