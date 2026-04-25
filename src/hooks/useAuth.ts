"use client";

import { useCallback, useEffect, useState } from "react";
import type { CreateUserInput, LoginInput, PublicUser } from "@/types/auth";
import { EMAIL_REGEX } from "@/types/auth";
import { apiFetch, apiJson } from "@/lib/api";

interface SessionResponse {
  user?: PublicUser;
  expires?: string;
}

async function getCsrfToken(): Promise<string> {
  const data = await apiJson<{ csrfToken: string }>("/api/auth/csrf");
  return data.csrfToken;
}

async function fetchSession(): Promise<PublicUser | null> {
  const res = await apiFetch("/api/auth/session");
  if (!res.ok) return null;
  const data = (await res.json().catch(() => null)) as SessionResponse | null;
  if (!data?.user?.id) return null;
  return data.user;
}

async function callCredentialsSignIn(email: string, password: string) {
  const csrfToken = await getCsrfToken();
  const body = new URLSearchParams({
    csrfToken,
    email,
    password,
    callbackUrl:
      typeof window !== "undefined" ? window.location.origin : "/",
    json: "true",
  });

  const res = await apiFetch("/api/auth/callback/credentials?json=true", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  const data = (await res.json().catch(() => null)) as
    | { url?: string; error?: string }
    | null;

  if (!res.ok || data?.error) {
    throw new Error("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
  }
}

async function callSignOut() {
  const csrfToken = await getCsrfToken();
  const body = new URLSearchParams({
    csrfToken,
    callbackUrl:
      typeof window !== "undefined" ? window.location.origin : "/",
    json: "true",
  });
  await apiFetch("/api/auth/signout?json=true", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
}

export function useAuth() {
  const [currentUser, setCurrentUser] = useState<PublicUser | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchSession()
      .then((user) => {
        if (!cancelled) setCurrentUser(user);
      })
      .finally(() => {
        if (!cancelled) setIsReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const signup = useCallback(async (input: CreateUserInput) => {
    const name = input.name.trim();
    const email = input.email.trim().toLowerCase();
    const password = input.password;

    if (!name) throw new Error("กรุณากรอกชื่อ");
    if (!EMAIL_REGEX.test(email)) throw new Error("รูปแบบอีเมลไม่ถูกต้อง");
    if (password.length < 6) throw new Error("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");

    const res = await apiFetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });
    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as
        | { error?: string }
        | null;
      if (res.status === 409) throw new Error("อีเมลนี้ถูกใช้งานแล้ว");
      throw new Error(data?.error ?? "สมัครสมาชิกไม่สำเร็จ");
    }

    await callCredentialsSignIn(email, password);
    const user = await fetchSession();
    if (!user) throw new Error("สมัครสำเร็จแต่เข้าสู่ระบบไม่ได้ กรุณาลองใหม่");
    setCurrentUser(user);
    return user;
  }, []);

  const login = useCallback(async (input: LoginInput) => {
    const email = input.email.trim().toLowerCase();
    const password = input.password;

    if (!EMAIL_REGEX.test(email)) throw new Error("รูปแบบอีเมลไม่ถูกต้อง");
    if (!password) throw new Error("กรุณากรอกรหัสผ่าน");

    await callCredentialsSignIn(email, password);
    const user = await fetchSession();
    if (!user) throw new Error("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
    setCurrentUser(user);
    return user;
  }, []);

  const logout = useCallback(async () => {
    await callSignOut().catch(() => {});
    setCurrentUser(null);
  }, []);

  return { currentUser, isReady, signup, login, logout };
}
