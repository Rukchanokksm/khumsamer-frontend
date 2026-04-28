"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Car, CreditCard, LogIn, LogOut, Map, Settings, User as UserIcon, UserCircle } from "lucide-react";
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
  },
  {
    icon: CreditCard,
    title: "Bill Payment",
    description: "ติดตามและจัดการการชำระค่าใช้จ่ายต่างๆ",
    href: "/bills",
    color: "bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400",
  },
  {
    icon: Car,
    title: "Car Service",
    description: "บันทึกประวัติการบำรุงรักษารถยนต์",
    href: "/car-service",
    color: "bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400",
  },
  {
    icon: Settings,
    title: "อื่นๆ",
    description: "ข้อมูลอื่นๆ ของครอบครัว",
    href: "/others",
    color: "bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400",
  },
];

export default function Home() {
  const router = useRouter();
  const { currentUser, isReady, loginTime, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const formattedLoginTime = loginTime
    ? loginTime.toLocaleString("th-TH", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/60 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <span className="font-semibold text-sm tracking-tight">Family Hub</span>

          <div className="flex items-center gap-2">
            {isReady && currentUser ? (
              <>
                <div className="hidden sm:flex items-center gap-2 text-right">
                  <UserIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-sm font-medium leading-none">
                      {currentUser.name ?? currentUser.email}
                    </p>
                    {formattedLoginTime && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        เข้าสู่ระบบ {formattedLoginTime}
                      </p>
                    )}
                  </div>
                </div>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/profile">
                    <UserCircle className="h-4 w-4" />
                    ข้อมูลส่วนตัว
                  </Link>
                </Button>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                  ออกจากระบบ
                </Button>
              </>
            ) : isReady ? (
              <Button asChild variant="outline" size="sm">
                <Link href="/login">
                  <LogIn className="h-4 w-4" />
                  เข้าสู่ระบบ
                </Link>
              </Button>
            ) : (
              <div className="w-24 h-8 rounded-md bg-muted animate-pulse" />
            )}
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-3">Family Hub</h1>
          <p className="text-muted-foreground text-lg">ศูนย์รวมข้อมูลสำหรับครอบครัว</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {features.map((feature) => {
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
                <h2 className="text-lg font-semibold text-card-foreground mb-1 group-hover:text-primary transition-colors">
                  {feature.title}
                </h2>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}
