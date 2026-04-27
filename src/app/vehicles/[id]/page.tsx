"use client";

import { use } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { useVehicles } from "@/hooks/useVehicles";
import { useCarExpenses, useTravelExpenses } from "@/hooks/useCarExpenses";
import {
  ArrowLeft,
  Car,
  Wrench,
  Receipt,
  MapPin,
  Loader2,
} from "lucide-react";
import type { VehicleType, VehicleCondition } from "@/types/car-service";

const VEHICLE_TYPE_LABELS: Record<VehicleType, string> = {
  sedan: "เก๋ง",
  pickup: "กระบะ",
  ppv: "PPV",
  suv: "SUV",
  hatchback: "Hatchback",
  other: "อื่นๆ",
};

const CONDITION_LABELS: Record<VehicleCondition, string> = {
  new: "มือ 1",
  used: "มือ 2",
};

export default function VehicleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { vehicles, isLoading } = useVehicles();
  const { expenses: carExpenses } = useCarExpenses();
  const { expenses: travelExpenses } = useTravelExpenses();

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
  const totalCarExpense = vehicleCarExpenses.reduce((s, e) => s + e.amount, 0);
  const totalTravelExpense = vehicleTravelExpenses.reduce(
    (s, e) => s + e.amount,
    0,
  );

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
          <CardTitle className="text-base flex items-center gap-2">
            <Car className="h-4 w-4" /> ข้อมูลรถ
          </CardTitle>
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
                  <Badge variant="secondary">
                    {VEHICLE_TYPE_LABELS[vehicle.type]}
                  </Badge>
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
                  <Badge variant="outline">
                    {CONDITION_LABELS[vehicle.condition]}
                  </Badge>
                </dd>
              </div>
            )}
            {vehicle.purchaseDate && (
              <div className="col-span-2">
                <dt className="text-muted-foreground text-xs mb-0.5">วันที่ซื้อ</dt>
                <dd className="font-medium">
                  {new Date(vehicle.purchaseDate * 1000).toLocaleDateString(
                    "th-TH",
                    { year: "numeric", month: "long", day: "numeric" },
                  )}
                </dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Receipt className="h-4 w-4 text-blue-500" />
              <p className="text-xs text-muted-foreground">ค่าใช้จ่ายรถรวม</p>
            </div>
            <p className="text-xl font-bold">
              ฿
              {totalCarExpense.toLocaleString("th-TH", {
                minimumFractionDigits: 2,
              })}
            </p>
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
            <p className="text-xl font-bold">
              ฿
              {totalTravelExpense.toLocaleString("th-TH", {
                minimumFractionDigits: 2,
              })}
            </p>
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
              <Button variant="outline" size="sm">
                ดูประวัติ
              </Button>
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
                <Button variant="ghost" size="sm" className="text-xs h-7">
                  ดูทั้งหมด
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <ul className="divide-y">
              {vehicleCarExpenses.slice(0, 5).map((e) => (
                <li
                  key={e.id}
                  className="flex items-center justify-between py-2 text-sm"
                >
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
                <Button variant="ghost" size="sm" className="text-xs h-7">
                  ดูทั้งหมด
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <ul className="divide-y">
              {vehicleTravelExpenses.slice(0, 5).map((e) => (
                <li
                  key={e.id}
                  className="flex items-center justify-between py-2 text-sm"
                >
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
    </main>
  );
}
