"use client"

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react"
import type { CreateUserInput, LoginInput, PublicUser } from "@/types/auth"
import { EMAIL_REGEX } from "@/types/auth"
import { apiFetch, apiJson } from "@/lib/api"

interface SessionResponse {
    user?: PublicUser
    expires?: string
}

interface AuthContextValue {
    currentUser: PublicUser | null
    isReady: boolean
    loginTime: Date | null
    signup: (input: CreateUserInput) => Promise<PublicUser>
    login: (input: LoginInput) => Promise<PublicUser>
    logout: () => Promise<void>
    updateName: (name: string) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

async function getCsrfToken(): Promise<string> {
    const data = await apiJson<{ csrfToken: string }>("/api/auth/csrf")
    return data.csrfToken
}

async function fetchSession(): Promise<PublicUser | null> {
    const res = await apiFetch("/api/auth/session")
    if (!res.ok) return null
    const data = (await res.json().catch(() => null)) as SessionResponse | null
    if (!data?.user?.id) return null
    return data.user
}

async function callCredentialsSignIn(email: string, password: string) {
    const csrfToken = await getCsrfToken()
    const body = new URLSearchParams({
        csrfToken,
        email,
        password,
        callbackUrl: "/",
        json: "true",
    })
    const res = await apiFetch("/api/auth/callback/credentials?json=true", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
    })
    const data = (await res.json().catch(() => null)) as {
        url?: string
        error?: string
    } | null
    if (!res.ok || data?.error) throw new Error("อีเมลหรือรหัสผ่านไม่ถูกต้อง")
}

async function callSignOut() {
    const csrfToken = await getCsrfToken()
    const body = new URLSearchParams({
        csrfToken,
        callbackUrl: "/",
        json: "true",
    })
    await apiFetch("/api/auth/signout?json=true", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
    })
}

const LOGIN_TIME_KEY = "family-hub-login-time"
function saveLoginTime(d: Date) {
    try {
        localStorage.setItem(LOGIN_TIME_KEY, d.toISOString())
    } catch {}
}
function readLoginTime(): Date | null {
    try {
        const v = localStorage.getItem(LOGIN_TIME_KEY)
        return v ? new Date(v) : null
    } catch {
        return null
    }
}
function clearLoginTime() {
    try {
        localStorage.removeItem(LOGIN_TIME_KEY)
    } catch {}
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [currentUser, setCurrentUser] = useState<PublicUser | null>(null)
    const [isReady, setIsReady] = useState(false)
    const [loginTime, setLoginTime] = useState<Date | null>(null)

    useEffect(() => {
        let cancelled = false
        fetchSession()
            .then((user) => {
                if (!cancelled) {
                    setCurrentUser(user)
                    if (user) {
                        const stored = readLoginTime()
                        const t = stored ?? new Date()
                        if (!stored) saveLoginTime(t)
                        setLoginTime(t)
                    }
                }
            })
            .finally(() => {
                if (!cancelled) setIsReady(true)
            })
        return () => {
            cancelled = true
        }
    }, [])

    const signup = useCallback(async (input: CreateUserInput) => {
        const name = input.name.trim()
        const email = input.email.trim().toLowerCase()
        const { password } = input
        if (!name) throw new Error("กรุณากรอกชื่อ")
        if (!EMAIL_REGEX.test(email)) throw new Error("รูปแบบอีเมลไม่ถูกต้อง")
        if (password.length < 6)
            throw new Error("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร")
        const res = await apiFetch("/api/auth/register", {
            method: "POST",
            body: JSON.stringify({ name, email, password }),
        })
        if (!res.ok) {
            const data = (await res.json().catch(() => null)) as {
                error?: string
            } | null
            if (res.status === 409) throw new Error("อีเมลนี้ถูกใช้งานแล้ว")
            throw new Error(data?.error ?? "สมัครสมาชิกไม่สำเร็จ")
        }
        await callCredentialsSignIn(email, password)
        const user = await fetchSession()
        if (!user)
            throw new Error("สมัครสำเร็จแต่เข้าสู่ระบบไม่ได้ กรุณาลองใหม่")
        const t = new Date()
        saveLoginTime(t)
        setLoginTime(t)
        setCurrentUser(user)
        return user
    }, [])

    const login = useCallback(async (input: LoginInput) => {
        const email = input.email.trim().toLowerCase()
        const { password } = input
        if (!EMAIL_REGEX.test(email)) throw new Error("รูปแบบอีเมลไม่ถูกต้อง")
        if (!password) throw new Error("กรุณากรอกรหัสผ่าน")
        await callCredentialsSignIn(email, password)
        const user = await fetchSession()
        if (!user) throw new Error("อีเมลหรือรหัสผ่านไม่ถูกต้อง")
        const t = new Date()
        saveLoginTime(t)
        setLoginTime(t)
        setCurrentUser(user)
        return user
    }, [])

    const logout = useCallback(async () => {
        await callSignOut().catch(() => {})
        clearLoginTime()
        setLoginTime(null)
        setCurrentUser(null)
    }, [])

    const updateName = useCallback(async (name: string) => {
        const trimmed = name.trim()
        if (!trimmed) throw new Error("กรุณากรอกชื่อ")
        const res = await apiFetch("/api/auth/me", {
            method: "PATCH",
            body: JSON.stringify({ name: trimmed }),
        })
        if (!res.ok) throw new Error("แก้ไขชื่อไม่สำเร็จ")
        const data = (await res.json()) as { user: { name: string } }
        setCurrentUser((prev) =>
            prev ? { ...prev, name: data.user.name } : prev,
        )
    }, [])

    return (
        <AuthContext.Provider
            value={{
                currentUser,
                isReady,
                loginTime,
                signup,
                login,
                logout,
                updateName,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth(): AuthContextValue {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error("useAuth must be used within AuthProvider")
    return ctx
}
