"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme-toggle";
import { useVehicles } from "@/hooks/useVehicles";
import { ArrowLeft, Car } from "lucide-react";
import type { CreateVehicleInput, VehicleType, VehicleCondition } from "@/types/car-service";

const BRANDS = ["SUBARU", "TOYOTA", "HONDA", "MITSUBISHI", "FORD"] as const;

const VEHICLE_TYPES: { value: VehicleType; label: string }[] = [
  { value: "sedan", label: "เก๋ง" },
  { value: "pickup", label: "กระบะ" },
  { value: "ppv", label: "PPV" },
  { value: "suv", label: "SUV" },
  { value: "hatchback", label: "Hatchback" },
  { value: "other", label: "อื่นๆ" },
];

const CONDITIONS: { value: VehicleCondition; label: string }[] = [
  { value: "new", label: "มือ 1 (รถใหม่)" },
  { value: "used", label: "มือ 2 (รถมือสอง)" },
];

export default function NewVehiclePage() {
  const router = useRouter();
  const { addVehicle, isAdding } = useVehicles();
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    brand: "",
    model: "",
    licensePlate: "",
    type: "" as VehicleType | "",
    color: "",
    condition: "" as VehicleCondition | "",
    purchaseDateStr: "",
  });

  function patch<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((p) => ({ ...p, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.brand.trim() || !form.model.trim() || !form.licensePlate.trim()) {
      setError("กรุณากรอกยี่ห้อ รุ่น และเลขทะเบียน");
      return;
    }

    const input: CreateVehicleInput = {
      brand: form.brand.trim(),
      model: form.model.trim(),
      licensePlate: form.licensePlate.trim(),
      ...(form.type ? { type: form.type } : {}),
      ...(form.color.trim() ? { color: form.color.trim() } : {}),
      ...(form.condition ? { condition: form.condition } : {}),
      ...(form.purchaseDateStr
        ? {
            purchaseDate: Math.floor(
              new Date(form.purchaseDateStr).getTime() / 1000,
            ),
          }
        : {}),
    };

    try {
      await addVehicle(input);
      router.push("/vehicles");
    } catch {
      setError("บันทึกไม่สำเร็จ กรุณาลองใหม่");
    }
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-lg">
      <div className="flex items-start justify-between mb-6">
        <div>
          <Link href="/vehicles">
            <Button variant="ghost" size="sm" className="gap-1 -ml-2 mb-1">
              <ArrowLeft className="h-4 w-4" /> รถของฉัน
            </Button>
          </Link>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Car className="h-6 w-6" /> เพิ่มข้อมูลรถ
          </h1>
        </div>
        <ThemeToggle />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">ข้อมูลพื้นฐาน</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>ยี่ห้อ *</Label>
                <Select
                  value={form.brand}
                  onValueChange={(v) => patch("brand", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกยี่ห้อ" />
                  </SelectTrigger>
                  <SelectContent>
                    {BRANDS.map((b) => (
                      <SelectItem key={b} value={b}>
                        {b}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>รุ่น *</Label>
                <Input
                  placeholder="เช่น Fortuner"
                  value={form.model}
                  onChange={(e) => patch("model", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label>เลขทะเบียน *</Label>
              <Input
                placeholder="เช่น กข 1234 กรุงเทพมหานคร"
                value={form.licensePlate}
                onChange={(e) => patch("licensePlate", e.target.value)}
                required
              />
            </div>

            <Separator className="my-2" />
            <p className="text-xs text-muted-foreground">ข้อมูลเพิ่มเติม (ไม่จำเป็น)</p>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>ประเภทรถ</Label>
                <Select
                  value={form.type}
                  onValueChange={(v) => patch("type", v as VehicleType)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกประเภท" />
                  </SelectTrigger>
                  <SelectContent>
                    {VEHICLE_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>สีรถ</Label>
                <Input
                  placeholder="เช่น ขาวมุก"
                  value={form.color}
                  onChange={(e) => patch("color", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>ประวัติรถ</Label>
                <Select
                  value={form.condition}
                  onValueChange={(v) => patch("condition", v as VehicleCondition)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="มือ 1 / มือ 2" />
                  </SelectTrigger>
                  <SelectContent>
                    {CONDITIONS.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>วันที่ซื้อ</Label>
                <Input
                  type="date"
                  value={form.purchaseDateStr}
                  onChange={(e) => patch("purchaseDateStr", e.target.value)}
                />
              </div>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex justify-end gap-2 pt-2">
              <Link href="/vehicles">
                <Button type="button" variant="outline">
                  ยกเลิก
                </Button>
              </Link>
              <Button type="submit" disabled={isAdding}>
                {isAdding ? "กำลังบันทึก..." : "บันทึก"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
