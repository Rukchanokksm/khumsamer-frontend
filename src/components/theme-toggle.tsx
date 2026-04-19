"use client"

import { Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "@/providers/theme-provider"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function ThemeToggle({ className }: { className?: string }) {
    const { theme, setTheme } = useTheme()

    const options: {
        value: "light" | "dark" | "system"
        icon: typeof Sun
        label: string
    }[] = [
        { value: "light", icon: Sun, label: "สว่าง" },
        { value: "dark", icon: Moon, label: "มืด" },
        { value: "system", icon: Monitor, label: "ตามระบบ" },
    ]

    return (
        <div
            className={cn(
                "inline-flex items-center gap-0.5 rounded-lg border border-border bg-card p-0.5",
                className,
            )}
            role="radiogroup"
            aria-label="เลือกธีม"
        >
            {options.map(({ value, icon: Icon, label }) => {
                const active = theme === value
                return (
                    <Button
                        key={value}
                        type="button"
                        variant="ghost"
                        size="icon"
                        role="radio"
                        aria-checked={active}
                        aria-label={label}
                        title={label}
                        onClick={() => setTheme(value)}
                        className={cn(
                            "h-7 w-7 rounded-md transition-colors",
                            active
                                ? "bg-accent text-accent-foreground"
                                : "text-muted-foreground hover:text-foreground",
                        )}
                    >
                        <Icon className="h-3.5 w-3.5" />
                    </Button>
                )
            })}
        </div>
    )
}
