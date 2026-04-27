// ใช้ "" (same-origin) เพื่อให้ Next.js proxy ผ่าน rewrites ใน next.config.ts
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export function apiUrl(path: string): string {
  return `${API_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

export async function apiFetch(path: string, init: RequestInit = {}) {
  const res = await fetch(apiUrl(path), {
    credentials: "include",
    ...init,
    headers: {
      ...(init.body && !(init.body instanceof FormData)
        ? { "Content-Type": "application/json" }
        : {}),
      ...init.headers,
    },
  });
  return res;
}

export async function apiJson<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await apiFetch(path, init);
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const message =
      (data && typeof data === "object" && "error" in data && typeof data.error === "string"
        ? data.error
        : null) ?? `Request failed with ${res.status}`;
    throw new Error(message);
  }
  return data as T;
}
