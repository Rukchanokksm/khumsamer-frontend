"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BackButton } from "@/components/back-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { useVehicles } from "@/hooks/useVehicles";
import { Skeleton } from "@/components/ui/skeleton";
import { Car, Plus, ChevronRight } from "lucide-react";
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

export default function VehiclesPage() {
  const { vehicles, isLoading } = useVehicles();

  return (
    <main className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <BackButton />
          <h1 className="text-3xl font-bold mt-2">รถของฉัน</h1>
          <p className="text-muted-foreground mt-1">จัดการข้อมูลรถยนต์</p>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link href="/vehicles/new">
            <Button size="sm" className="gap-1">
              <Plus className="h-4 w-4" /> เพิ่มรถ
            </Button>
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/3" />
                <div className="flex gap-1.5 pt-1">
                  <Skeleton className="h-5 w-14" />
                  <Skeleton className="h-5 w-14" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : vehicles.length === 0 ? (
        <div className="text-center py-20 space-y-4">
          <Car className="h-16 w-16 mx-auto text-muted-foreground opacity-30" />
          <div>
            <p className="text-lg font-medium">ยังไม่มีข้อมูลรถ</p>
            <p className="text-sm text-muted-foreground mt-1">
              เพิ่มรถของคุณเพื่อเริ่มบันทึกค่าใช้จ่ายและประวัติซ่อมบำรุง
            </p>
          </div>
          <Link href="/vehicles/new">
            <Button className="gap-1">
              <Plus className="h-4 w-4" /> เพิ่มรถคันแรก
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {vehicles.map((vehicle) => (
            <Link key={vehicle.id} href={`/vehicles/${vehicle.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer group">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 min-w-0">
                      <p className="font-semibold text-base leading-tight">
                        {vehicle.brand} {vehicle.model}
                      </p>
                      <p className="text-sm text-muted-foreground font-mono">
                        {vehicle.licensePlate}
                      </p>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {vehicle.type && (
                          <Badge variant="secondary" className="text-xs">
                            {VEHICLE_TYPE_LABELS[vehicle.type]}
                          </Badge>
                        )}
                        {vehicle.condition && (
                          <Badge variant="outline" className="text-xs">
                            {CONDITION_LABELS[vehicle.condition]}
                          </Badge>
                        )}
                        {vehicle.color && (
                          <Badge variant="outline" className="text-xs">
                            {vehicle.color}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
