"use client";

import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useVehicles } from "@/hooks/useVehicles";
import { Car, Plus, Loader2 } from "lucide-react";

interface VehicleSelectorProps {
  value: string; // vehicle id หรือ ""
  onChange: (vehicleId: string, carName: string, licensePlate: string) => void;
  className?: string;
}

export function VehicleSelector({ value, onChange, className }: VehicleSelectorProps) {
  const { vehicles, isLoading } = useVehicles();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>กำลังโหลดข้อมูลรถ...</span>
      </div>
    );
  }

  if (vehicles.length === 0) {
    return (
      <div className="flex items-center justify-between rounded-md border border-dashed p-3 bg-muted/40">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Car className="h-4 w-4" />
          <span>ยังไม่มีรถที่บันทึกไว้</span>
        </div>
        <Link href="/vehicles/new">
          <Button variant="outline" size="sm" className="gap-1 h-7 text-xs">
            <Plus className="h-3 w-3" /> เพิ่มรถ
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <Select
      value={value}
      onValueChange={(id) => {
        const v = vehicles.find((v) => v.id === id);
        if (v) onChange(id, `${v.brand} ${v.model}`, v.licensePlate);
      }}
    >
      <SelectTrigger className={className}>
        <SelectValue placeholder="เลือกรถ..." />
      </SelectTrigger>
      <SelectContent>
        {vehicles.map((v) => (
          <SelectItem key={v.id} value={v.id}>
            <span className="font-medium">
              {v.brand} {v.model}
            </span>
            <span className="ml-2 text-muted-foreground font-mono text-xs">
              {v.licensePlate}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
