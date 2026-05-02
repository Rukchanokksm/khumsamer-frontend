"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Car, CreditCard, LogOut, Map, Settings, ShieldCheck, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/hooks/useAuth";

const features = [
  {
    icon: Map,
    title: "Road Trip",
    description: "วางแผนและบันทึกการเดินทางของครอบครัว",
    href: "/road-trip",
    color: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
    roles: ["admin", "user"] as const,
  },
  {
    icon: CreditCard,
    title: "Bill Payment",
    description: "ติดตามและจัดการการชำระค่าใช้จ่ายต่างๆ",
    href: "/bills",
    color: "bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400",
    roles: ["admin", "user"] as const,
  },
  {
    icon: Car,
    title: "Car History",
    description: "ประวัติการดูแลและค่าใช้จ่ายรถยนต์รายเดือน",
    href: "/car-service",
    color: "bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400",
    roles: ["admin", "user"] as const,
  },
  {
    icon: Settings,
    title: "อื่นๆ",
    description: "ข้อมูลอื่นๆ ของครอบครัว (เฉพาะแอดมิน)",
    href: "/others",
    color: "bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400",
    roles: ["admin"] as const,
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const { currentUser, isReady, logout } = useAuth();
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    if (isReady && !currentUser) {
      router.replace("/login");
    }
  }, [isReady, currentUser, router]);

  if (!isReady || !currentUser) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">กำลังโหลด...</p>
      </main>
    );
  }

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const visibleFeatures = features.filter((f) =>
    (f.roles as readonly string[]).includes(currentUser.role)
  );

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
            ← กลับหน้าแรก
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              ออกจากระบบ
            </Button>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 mb-8 shadow-sm">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-primary/10 p-3 text-primary">
                {currentUser.role === "admin" ? (
                  <ShieldCheck className="h-6 w-6" />
                ) : (
                  <UserIcon className="h-6 w-6" />
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold">
                  สวัสดี, {currentUser.name ?? currentUser.email}
                </h1>
                <p className="text-sm text-muted-foreground">{currentUser.email}</p>
              </div>
            </div>
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                currentUser.role === "admin"
                  ? "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
                  : "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"
              }`}
            >
              Role: {currentUser.role}
            </span>
          </div>

          <div className="mt-6 rounded-lg bg-muted/40 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground mb-1">Access Key</p>
                <p className="font-mono text-sm break-all">
                  {showKey
                    ? currentUser.accessKey
                    : "•".repeat(Math.min(currentUser.accessKey.length, 32))}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowKey((v) => !v)}
              >
                {showKey ? "ซ่อน" : "แสดง"}
              </Button>
            </div>
          </div>
        </div>

        <h2 className="text-lg font-semibold mb-4">ฟีเจอร์ที่ใช้ได้</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleFeatures.map((feature) => {
            const Icon = feature.icon;
            return (
              <Link
                key={feature.href}
                href={feature.href}
                className="group block rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div
                  className={`inline-flex items-center justify-center rounded-xl p-3 mb-4 ${feature.color}`}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold mb-1 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}
