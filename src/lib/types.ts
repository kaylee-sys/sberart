export type PublicUser = {
  username: string;
  bio: string;
  avatar: string;
  joinedAt: string;
};

export type CommentDTO = {
  id: string;
  text: string;
  createdAt: string;
  authorUsername: string;
  author: PublicUser | null;
};

export type PostDTO = {
  id: string;
  authorUsername: string;
  author: PublicUser | null;
  image: string;
  prompt: string;
  createdAt: string;
  likesCount: number;
  likedByViewer: boolean;
  commentsCount: number;
  comments: CommentDTO[];
};

export type ProfileDTO = {
  user: PublicUser;
  stats: {
    posts: number;
    likes: number;
    followers: number;
    following: number;
  };
  isFollowing: boolean;
  isSelf: boolean;
  posts: PostDTO[];
};

export type MessageDTO = {
  id: string;
  from: string;
  to: string;
  text: string;
  createdAt: string;
};

export type ConversationDTO = {
  partnerUsername: string;
  partner: PublicUser | null;
  lastMessage: MessageDTO;
  unread: number;
};

export type Screen =
  | { kind: "feed" }
  | { kind: "create" }
  | { kind: "profile"; username: string }
  | { kind: "chat" }
  | { kind: "chat-thread"; partner: string };

export type ToastKind = "success" | "error" | "info";
export type Toast = { id: string; kind: ToastKind; text: string };
