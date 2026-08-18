export const USERNAME_RE = /^[a-z0-9_]{3,20}$/;

export function normalizeUsername(raw: string): string {
  return raw.trim().toLowerCase().replace(/^@/, "");
}

export function isValidUsername(s: string): boolean {
  return USERNAME_RE.test(s);
}

export function isValidBio(s: string): boolean {
  return s.length <= 280;
}

export function isValidPrompt(s: string): boolean {
  const t = s.trim();
  return t.length > 0 && t.length <= 1500;
}

export function isValidComment(s: string): boolean {
  const t = s.trim();
  return t.length > 0 && t.length <= 500;
}
