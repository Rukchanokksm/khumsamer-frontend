"use client";

import { use, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ThemeToggle } from "@/components/theme-toggle";
import { useVehicles } from "@/hooks/useVehicles";
import { useCarExpenses, useTravelExpenses } from "@/hooks/useCarExpenses";
import { useCarRepairs } from "@/hooks/useCarRepairs";
import {
  ArrowLeft,
  Car,
  Wrench,
  Receipt,
  MapPin,
  Loader2,
  Pencil,
} from "lucide-react";
import type {
  VehicleType,
  VehicleCondition,
  UpdateVehicleInput,
  Vehicle,
} from "@/types/car-service";

const VEHICLE_TYPE_LABELS: Record<VehicleType, string> = {
  sedan: "เก๋ง",
  pickup: "กระบะ",
  ppv: "PPV",
  suv: "SUV",
  hatchback: "Hatchback",
  other: "อื่นๆ",
};
const VEHICLE_TYPES = Object.keys(VEHICLE_TYPE_LABELS) as VehicleType[];

const CONDITION_LABELS: Record<VehicleCondition, string> = {
  new: "มือ 1",
  used: "มือ 2",
};

// ---- Edit Dialog ----
interface EditVehicleDialogProps {
  vehicle: Vehicle;
  open: boolean;
  onClose: () => void;
  onSave: (id: string, input: UpdateVehicleInput) => Promise<unknown>;
  isSaving: boolean;
}

function EditVehicleDialog({ vehicle, open, onClose, onSave, isSaving }: EditVehicleDialogProps) {
  const [form, setForm] = useState<UpdateVehicleInput>({
    brand: vehicle.brand,
    model: vehicle.model,
    licensePlate: vehicle.licensePlate,
    type: vehicle.type ?? undefined,
    color: vehicle.color ?? "",
    condition: vehicle.condition ?? undefined,
    purchaseDate: vehicle.purchaseDate ?? undefined,
  });

  function set<K extends keyof UpdateVehicleInput>(k: K, v: UpdateVehicleInput[K]) {
    setForm((prev) => ({ ...prev, [k]: v }));
  }

  const purchaseDateStr = form.purchaseDate
    ? new Date(form.purchaseDate * 1000).toISOString().slice(0, 10)
    : "";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await onSave(vehicle.id, {
      ...form,
      color: form.color || undefined,
      purchaseDate: form.purchaseDate || undefined,
    });
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!isSaving && !v) onClose(); }}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="h-4 w-4 text-blue-500" />
            แก้ไขข้อมูลรถ
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>ยี่ห้อ *</Label>
              <Input
                value={form.brand ?? ""}
                onChange={(e) => set("brand", e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <Label>รุ่น *</Label>
              <Input
                value={form.model ?? ""}
                onChange={(e) => set("model", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label>เลขทะเบียน *</Label>
            <Input
              value={form.licensePlate ?? ""}
              onChange={(e) => set("licensePlate", e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>ประเภทรถ</Label>
              <Select
                value={form.type ?? "none"}
                onValueChange={(v) => set("type", v === "none" ? undefined : (v as VehicleType))}
              >
                <SelectTrigger><SelectValue placeholder="เลือกประเภท" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">ไม่ระบุ</SelectItem>
                  {VEHICLE_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>{VEHICLE_TYPE_LABELS[t]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>ประวัติรถ</Label>
              <Select
                value={form.condition ?? "none"}
                onValueChange={(v) => set("condition", v === "none" ? undefined : (v as VehicleCondition))}
              >
                <SelectTrigger><SelectValue placeholder="เลือก" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">ไม่ระบุ</SelectItem>
                  <SelectItem value="new">มือ 1</SelectItem>
                  <SelectItem value="used">มือ 2</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1">
            <Label>สีรถ</Label>
            <Input
              value={form.color ?? ""}
              onChange={(e) => set("color", e.target.value)}
              placeholder="เช่น ขาว, ดำ, เทา"
            />
          </div>

          <div className="space-y-1">
            <Label>วันที่ซื้อ</Label>
            <Input
              type="date"
              value={purchaseDateStr}
              onChange={(e) => {
                const ts = e.target.value ? Math.floor(new Date(e.target.value).getTime() / 1000) : undefined;
                set("purchaseDate", ts);
              }}
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" disabled={isSaving} onClick={onClose}>
              ยกเลิก
            </Button>
            <Button type="submit" disabled={isSaving} className="gap-1.5">
              {isSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              บันทึก
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function formatTHB(n: number) {
  return n.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ---- Page ----
export default function VehicleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { vehicles, isLoading, updateVehicle, isUpdating } = useVehicles();
  const { expenses: carExpenses } = useCarExpenses();
  const { expenses: travelExpenses } = useTravelExpenses();
  const { repairs } = useCarRepairs();
  const [editOpen, setEditOpen] = useState(false);

  if (isLoading) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </main>
    );
  }

  const vehicle = vehicles.find((v) => v.id === id);

  if (!vehicle) {
    return (
      <main className="container mx-auto px-4 py-8 text-center space-y-4">
        <Car className="h-16 w-16 mx-auto text-muted-foreground opacity-30" />
        <p className="text-lg font-medium">ไม่พบข้อมูลรถ</p>
        <Link href="/vehicles">
          <Button variant="outline">กลับไปรายการรถ</Button>
        </Link>
      </main>
    );
  }

  const vehicleCarExpenses = carExpenses.filter(
    (e) => e.licensePlate === vehicle.licensePlate,
  );
  const vehicleTravelExpenses = travelExpenses.filter(
    (e) => e.licensePlate === vehicle.licensePlate,
  );
  const vehicleRepairs = repairs.filter(
    (r) => r.licensePlate === vehicle.licensePlate,
  );
  const totalCarExpense = vehicleCarExpenses.reduce((s, e) => s + e.amount, 0);
  const totalTravelExpense = vehicleTravelExpenses.reduce((s, e) => s + e.amount, 0);
  const totalRepairCost = vehicleRepairs.reduce((s, r) => s + r.cost, 0);

  return (
    <main className="container mx-auto px-4 py-8 max-w-2xl space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link href="/vehicles">
            <Button variant="ghost" size="sm" className="gap-1 -ml-2 mb-1">
              <ArrowLeft className="h-4 w-4" /> รถของฉัน
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">
            {vehicle.brand} {vehicle.model}
          </h1>
          <p className="text-muted-foreground font-mono text-sm mt-0.5">
            {vehicle.licensePlate}
          </p>
        </div>
        <ThemeToggle />
      </div>

      {/* Vehicle Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Car className="h-4 w-4" /> ข้อมูลรถ
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-blue-600"
              onClick={() => setEditOpen(true)}
            >
              <Pencil className="h-3.5 w-3.5" /> แก้ไข
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
            <div>
              <dt className="text-muted-foreground text-xs mb-0.5">ยี่ห้อ</dt>
              <dd className="font-medium">{vehicle.brand}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-xs mb-0.5">รุ่น</dt>
              <dd className="font-medium">{vehicle.model}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-xs mb-0.5">เลขทะเบียน</dt>
              <dd className="font-medium font-mono">{vehicle.licensePlate}</dd>
            </div>
            {vehicle.type && (
              <div>
                <dt className="text-muted-foreground text-xs mb-0.5">ประเภทรถ</dt>
                <dd>
                  <Badge variant="secondary">{VEHICLE_TYPE_LABELS[vehicle.type]}</Badge>
                </dd>
              </div>
            )}
            {vehicle.color && (
              <div>
                <dt className="text-muted-foreground text-xs mb-0.5">สีรถ</dt>
                <dd className="font-medium">{vehicle.color}</dd>
              </div>
            )}
            {vehicle.condition && (
              <div>
                <dt className="text-muted-foreground text-xs mb-0.5">ประวัติรถ</dt>
                <dd>
                  <Badge variant="outline">{CONDITION_LABELS[vehicle.condition]}</Badge>
                </dd>
              </div>
            )}
            {vehicle.purchaseDate && (
              <div className="col-span-2">
                <dt className="text-muted-foreground text-xs mb-0.5">วันที่ซื้อ</dt>
                <dd className="font-medium">
                  {new Date(vehicle.purchaseDate * 1000).toLocaleDateString("th-TH", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Wrench className="h-4 w-4 text-orange-500" />
              <p className="text-xs text-muted-foreground">ค่าซ่อมบำรุงรวม</p>
            </div>
            <p className="text-xl font-bold">฿{formatTHB(totalRepairCost)}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {vehicleRepairs.length} รายการ
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Receipt className="h-4 w-4 text-blue-500" />
              <p className="text-xs text-muted-foreground">ค่าใช้จ่ายรถรวม</p>
            </div>
            <p className="text-xl font-bold">฿{formatTHB(totalCarExpense)}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {vehicleCarExpenses.length} รายการ
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="h-4 w-4 text-green-500" />
              <p className="text-xs text-muted-foreground">ค่าเดินทางรวม</p>
            </div>
            <p className="text-xl font-bold">฿{formatTHB(totalTravelExpense)}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {vehicleTravelExpenses.length} รายการ
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Maintenance History Link */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium flex items-center gap-2 text-sm">
                <Wrench className="h-4 w-4 text-orange-500" />
                ประวัติซ่อมบำรุง
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                ดูและบันทึกประวัติการซ่อมและบำรุงรักษา
              </p>
            </div>
            <Link href="/car-service">
              <Button variant="outline" size="sm">ดูประวัติ</Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Recent Car Expenses */}
      {vehicleCarExpenses.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Receipt className="h-4 w-4 text-blue-500" />
                ค่าใช้จ่ายรถล่าสุด
              </CardTitle>
              <Link href="/car-service">
                <Button variant="ghost" size="sm" className="text-xs h-7">ดูทั้งหมด</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <ul className="divide-y">
              {vehicleCarExpenses.slice(0, 5).map((e) => (
                <li key={e.id} className="flex items-center justify-between py-2 text-sm">
                  <div>
                    <p>{e.description}</p>
                    <p className="text-xs text-muted-foreground">{e.date}</p>
                  </div>
                  <span className="font-medium">฿{e.amount.toLocaleString()}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Recent Travel Expenses */}
      {vehicleTravelExpenses.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <MapPin className="h-4 w-4 text-green-500" />
                ค่าเดินทางล่าสุด
              </CardTitle>
              <Link href="/car-service">
                <Button variant="ghost" size="sm" className="text-xs h-7">ดูทั้งหมด</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <ul className="divide-y">
              {vehicleTravelExpenses.slice(0, 5).map((e) => (
                <li key={e.id} className="flex items-center justify-between py-2 text-sm">
                  <div>
                    <p>{e.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {e.tripName} · {e.date}
                    </p>
                  </div>
                  <span className="font-medium">฿{e.amount.toLocaleString()}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Edit dialog */}
      <EditVehicleDialog
        vehicle={vehicle}
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSave={updateVehicle}
        isSaving={isUpdating}
      />
    </main>
  );
}
