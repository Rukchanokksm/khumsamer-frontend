"use client";

import { useRef, useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, Paperclip, Plus, Wrench, X } from "lucide-react";
import type { CarRepair, CreateCarRepairInput, RepairType } from "@/types/car-service";
import { VehicleSelector } from "@/components/car-service/VehicleSelector";
import { GarageSelector } from "@/components/car-service/GarageSelector";

export const REPAIR_TYPE_LABELS: Record<RepairType, string> = {
  oil_change: "เปลี่ยนถ่ายน้ำมันเครื่อง",
  tire: "ยาง",
  brake: "เบรก",
  battery: "แบตเตอรี่",
  filter: "กรอง / ไส้กรอง",
  inspection: "ตรวจสภาพรถ",
  body_repair: "ตัวถัง / สี",
  electrical: "ระบบไฟฟ้า",
  ac: "แอร์",
  transmission: "ระบบเกียร์",
  wash: "ล้างรถ / ดูแลรักษา",
  other: "อื่นๆ",
};

const REPAIR_TYPES: RepairType[] = [
  "oil_change", "tire", "brake", "battery", "filter",
  "inspection", "body_repair", "electrical", "ac", "transmission", "wash", "other",
];

interface CarRepairFormProps {
  onAdd: (input: CreateCarRepairInput, receiptFile?: File) => Promise<CarRepair>;
  isLoading?: boolean;
}

export function CarRepairForm({ onAdd, isLoading }: CarRepairFormProps) {
  const [open, setOpen] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [garageId, setGarageId] = useState("none");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<Partial<CreateCarRepairInput>>({
    date: new Date().toISOString().split("T")[0],
    repairType: "oil_change",
  });

  function set<K extends keyof CreateCarRepairInput>(k: K, v: CreateCarRepairInput[K]) {
    setForm((prev) => ({ ...prev, [k]: v }));
  }

  function reset() {
    setForm({ date: new Date().toISOString().split("T")[0], repairType: "oil_change" });
    setSelectedVehicleId("");
    setGarageId("none");
    setReceiptFile(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.carName || !form.licensePlate || !form.repairType || !form.date || !form.description || form.cost === undefined) return;
    setSubmitting(true);
    try {
      await onAdd(
        {
          carName: form.carName,
          licensePlate: form.licensePlate,
          repairType: form.repairType,
          date: form.date,
          cost: Number(form.cost),
          description: form.description,
          notes: form.notes || undefined,
          garageId: garageId !== "none" ? garageId : null,
        },
        receiptFile ?? undefined,
      );
      setOpen(false);
      reset();
    } catch {
      // handled by mutation
    } finally {
      setSubmitting(false);
    }
  }

  const busy = submitting || isLoading;

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!busy) { setOpen(v); if (!v) reset(); }
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1">
          <Plus className="h-4 w-4" /> บันทึกการซ่อม
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wrench className="h-4 w-4 text-orange-500" />
            บันทึกการซ่อมบำรุง
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Vehicle */}
          <div className="space-y-1">
            <Label>เลือกรถ</Label>
            <VehicleSelector
              value={selectedVehicleId}
              onChange={(id, carName, licensePlate) => {
                setSelectedVehicleId(id);
                set("carName", carName);
                set("licensePlate", licensePlate);
              }}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>ชื่อรถ *</Label>
              <Input
                placeholder="เช่น Subaru Forester"
                value={form.carName ?? ""}
                onChange={(e) => set("carName", e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <Label>ทะเบียนรถ *</Label>
              <Input
                placeholder="เช่น กข 1234"
                value={form.licensePlate ?? ""}
                onChange={(e) => set("licensePlate", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>ประเภทซ่อม *</Label>
              <Select
                value={form.repairType}
                onValueChange={(v) => set("repairType", v as RepairType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REPAIR_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {REPAIR_TYPE_LABELS[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>วันที่ *</Label>
              <Input
                type="date"
                value={form.date ?? ""}
                onChange={(e) => set("date", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label>รายละเอียด *</Label>
            <Input
              placeholder="เช่น เปลี่ยนน้ำมันเครื่อง + กรองน้ำมัน"
              value={form.description ?? ""}
              onChange={(e) => set("description", e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <Label>ค่าซ่อม (บาท) *</Label>
            <Input
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={form.cost ?? ""}
              onChange={(e) => set("cost", Number(e.target.value) as unknown as CreateCarRepairInput["cost"])}
              required
            />
          </div>

          {/* Garage selector */}
          <div className="space-y-1">
            <Label>สถานที่ซ่อม</Label>
            <GarageSelector
              value={garageId}
              onChange={setGarageId}
            />
          </div>

          <div className="space-y-1">
            <Label>หมายเหตุ</Label>
            <Textarea
              placeholder="หมายเหตุเพิ่มเติม เช่น เลขไมล์"
              rows={2}
              value={form.notes ?? ""}
              onChange={(e) => set("notes", e.target.value)}
            />
          </div>

          {/* Receipt file */}
          <div className="space-y-1">
            <Label>แนบใบเสร็จ (ไม่บังคับ)</Label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              className="hidden"
              onChange={(e) => {
                setReceiptFile(e.target.files?.[0] ?? null);
                e.target.value = "";
              }}
            />
            {receiptFile ? (
              <div className="flex items-center gap-2 rounded-md border border-border bg-muted/50 px-3 py-2 text-sm">
                <Paperclip className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <span className="min-w-0 flex-1 truncate text-xs">{receiptFile.name}</span>
                <button
                  type="button"
                  className="shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={() => setReceiptFile(null)}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs"
                onClick={() => fileInputRef.current?.click()}
              >
                <Paperclip className="h-3.5 w-3.5" />
                เลือกไฟล์รูปหรือ PDF
              </Button>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              disabled={busy}
              onClick={() => { setOpen(false); reset(); }}
            >
              ยกเลิก
            </Button>
            <Button type="submit" disabled={busy} className="gap-1.5">
              {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              บันทึก
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
