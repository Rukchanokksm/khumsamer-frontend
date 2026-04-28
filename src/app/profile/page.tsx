"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Car, Check, Edit2, ShieldCheck, User as UserIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/hooks/useAuth";

export default function ProfilePage() {
  const router = useRouter();
  const { currentUser, isReady, updateName } = useAuth();
  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isReady && !currentUser) router.replace("/login");
  }, [isReady, currentUser, router]);

  if (!isReady || !currentUser) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">กำลังโหลด...</p>
      </main>
    );
  }

  const startEdit = () => {
    setNameInput(currentUser.name ?? "");
    setError(null);
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditing(false);
    setError(null);
  };

  const handleSave = async () => {
    setError(null);
    setSaving(true);
    try {
      await updateName(nameInput);
      setEditing(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "แก้ไขไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="container mx-auto px-4 py-8 max-w-lg">
      <div className="flex items-center justify-between mb-6">
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-1 -ml-2">
            <ArrowLeft className="h-4 w-4" /> หน้าแรก
          </Button>
        </Link>
        <ThemeToggle />
      </div>

      <div className="flex items-center gap-3 mb-6">
        <div className="rounded-full bg-primary/10 p-3 text-primary">
          {currentUser.role === "admin" ? (
            <ShieldCheck className="h-6 w-6" />
          ) : (
            <UserIcon className="h-6 w-6" />
          )}
        </div>
        <div>
          <h1 className="text-2xl font-bold">ข้อมูลส่วนตัว</h1>
          <p className="text-sm text-muted-foreground">{currentUser.email}</p>
        </div>
      </div>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-base">ข้อมูลบัญชี</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-1.5">
            <Label>ชื่อ</Label>
            {editing ? (
              <div className="flex gap-2">
                <Input
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSave();
                    if (e.key === "Escape") cancelEdit();
                  }}
                />
                <Button size="icon" variant="ghost" onClick={handleSave} disabled={saving}>
                  <Check className="h-4 w-4 text-green-600" />
                </Button>
                <Button size="icon" variant="ghost" onClick={cancelEdit} disabled={saving}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <p className="text-sm">{currentUser.name ?? "—"}</p>
                <Button variant="ghost" size="sm" className="gap-1" onClick={startEdit}>
                  <Edit2 className="h-3.5 w-3.5" /> แก้ไข
                </Button>
              </div>
            )}
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>อีเมล</Label>
            <p className="text-sm text-muted-foreground">{currentUser.email}</p>
          </div>

          <div className="space-y-1.5">
            <Label>บทบาท</Label>
            <div>
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                  currentUser.role === "admin"
                    ? "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
                    : "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"
                }`}
              >
                {currentUser.role}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Link href="/vehicles">
        <Button variant="outline" className="w-full gap-2">
          <Car className="h-4 w-4" />
          ดูรถของฉัน
        </Button>
      </Link>
    </main>
  );
}
