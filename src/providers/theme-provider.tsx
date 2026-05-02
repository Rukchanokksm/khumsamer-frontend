"use client"

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react"

type Theme = "light" | "dark" | "system"
type ResolvedTheme = "light" | "dark"

interface ThemeContextValue {
    theme: Theme
    resolvedTheme: ResolvedTheme
    setTheme: (theme: Theme) => void
    toggleTheme: () => void
}

const STORAGE_KEY = "family-hub-theme"

const ThemeContext = createContext<ThemeContextValue | null>(null)

function getSystemTheme(): ResolvedTheme {
    if (typeof window === "undefined") return "light"
    return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
}

function applyTheme(resolved: ResolvedTheme) {
    const root = document.documentElement
    root.classList.toggle("dark", resolved === "dark")
    root.style.colorScheme = resolved
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setThemeState] = useState<Theme>("system")
    const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("light")

    useEffect(() => {
        const stored =
            (localStorage.getItem(STORAGE_KEY) as Theme | null) ?? "system"
        setThemeState(stored)
    }, [])

    useEffect(() => {
        const resolved: ResolvedTheme =
            theme === "system" ? getSystemTheme() : theme
        setResolvedTheme(resolved)
        applyTheme(resolved)
    }, [theme])

    useEffect(() => {
        if (theme !== "system") return
        const mq = window.matchMedia("(prefers-color-scheme: dark)")
        const handler = () => {
            const resolved: ResolvedTheme = mq.matches ? "dark" : "light"
            setResolvedTheme(resolved)
            applyTheme(resolved)
        }
        mq.addEventListener("change", handler)
        return () => mq.removeEventListener("change", handler)
    }, [theme])

    const setTheme = useCallback((next: Theme) => {
        localStorage.setItem(STORAGE_KEY, next)
        setThemeState(next)
    }, [])

    const toggleTheme = useCallback(() => {
        setTheme(resolvedTheme === "dark" ? "light" : "dark")
    }, [resolvedTheme, setTheme])

    const value = useMemo<ThemeContextValue>(
        () => ({ theme, resolvedTheme, setTheme, toggleTheme }),
        [theme, resolvedTheme, setTheme, toggleTheme],
    )

    return (
        <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
    )
}

export function useTheme(): ThemeContextValue {
    const ctx = useContext(ThemeContext)
    if (!ctx) throw new Error("useTheme must be used within ThemeProvider")
    return ctx
}
