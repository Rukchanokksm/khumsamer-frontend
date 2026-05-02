"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GarageForm } from "@/components/car-service/GarageForm";
import { useGarages } from "@/hooks/useGarages";
import { MapPin } from "lucide-react";

interface GarageSelectorProps {
  value: string;
  onChange: (id: string) => void;
  className?: string;
}

export function GarageSelector({ value, onChange, className }: GarageSelectorProps) {
  const { garages, isLoading, addGarage, isAdding } = useGarages();

  return (
    <div className={`flex gap-2 ${className ?? ""}`}>
      <Select
        value={value}
        onValueChange={onChange}
        disabled={isLoading}
      >
        <SelectTrigger className="flex-1">
          <SelectValue placeholder={isLoading ? "กำลังโหลด..." : "เลือกสถานที่ซ่อม (ไม่บังคับ)"} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">— ไม่ระบุ —</SelectItem>
          {garages.map((g) => (
            <SelectItem key={g.id} value={g.id}>
              <div className="flex items-center gap-1.5">
                <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
                <span>{g.name}</span>
                {g.phones.length > 0 && (
                  <span className="text-xs text-muted-foreground">· {g.phones[0]}</span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <GarageForm
        onAdd={async (input) => {
          const garage = await addGarage(input);
          onChange(garage.id);
          return garage;
        }}
        isLoading={isAdding}
        trigger={
          <button
            type="button"
            className="shrink-0 rounded-md border border-input bg-background px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            + อู่ใหม่
          </button>
        }
      />
    </div>
  );
}
