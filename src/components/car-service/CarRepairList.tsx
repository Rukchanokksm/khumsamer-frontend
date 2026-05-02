"use client";

import { useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Wrench, Trash2, ExternalLink, Eye, Upload,
  RefreshCw, X, Loader2, FileText, Phone, MapPin,
  Pencil, Lock, AlertTriangle,
} from "lucide-react";
import type { CarRepair, RepairType, UpdateCarRepairInput } from "@/types/car-service";
import { REPAIR_TYPE_LABELS } from "@/components/car-service/CarRepairForm";
import { GarageSelector } from "@/components/car-service/GarageSelector";
import { apiJson } from "@/lib/api";

const REPAIR_TYPES: RepairType[] = [
  "oil_change", "tire", "brake", "battery", "filter",
  "inspection", "body_repair", "electrical", "ac", "transmission", "wash", "other",
];

function formatTHB(n: number) {
  return n.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function formatDate(s: string) {
  return new Date(s).toLocaleDateString("th-TH", { year: "numeric", month: "short", day: "numeric" });
}

const TYPE_COLORS: Record<string, string> = {
  oil_change: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  tire: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
  brake: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300",
  battery: "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/15 dark:text-yellow-300",
  filter: "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300",
  inspection: "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300",
  body_repair: "bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300",
  electrical: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300",
  ac: "bg-cyan-100 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-300",
  transmission: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
  wash: "bg-teal-100 text-teal-700 dark:bg-teal-500/15 dark:text-teal-300",
  other: "bg-gray-100 text-gray-700 dark:bg-gray-500/15 dark:text-gray-300",
};

// ---- Edit Dialog ----
interface EditDialogProps {
  repair: CarRepair;
  open: boolean;
  onClose: () => void;
  onSave: (id: string, input: UpdateCarRepairInput) => Promise<unknown>;
}

function EditDialog({ repair, open, onClose, onSave }: EditDialogProps) {
  const [form, setForm] = useState<UpdateCarRepairInput>({
    repairType: repair.repairType,
    date: repair.date,
    cost: repair.cost,
    description: repair.description,
    notes: repair.notes ?? "",
    garageId: repair.garageId ?? null,
  });
  const [garageId, setGarageId] = useState(repair.garageId ?? "none");
  const [saving, setSaving] = useState(false);

  function set<K extends keyof UpdateCarRepairInput>(k: K, v: UpdateCarRepairInput[K]) {
    setForm((prev) => ({ ...prev, [k]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(repair.id, {
        ...form,
        garageId: garageId !== "none" ? garageId : null,
      });
      onClose();
    } catch {
      // error handled upstream
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!saving && !v) onClose(); }}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="h-4 w-4 text-blue-500" />
            แก้ไขรายการซ่อม
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* read-only car info */}
          <div className="rounded-md bg-muted/50 px-3 py-2 text-sm">
            <span className="font-medium">{repair.carName}</span>
            <span className="ml-2 font-mono text-xs text-muted-foreground">{repair.licensePlate}</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>ประเภทซ่อม *</Label>
              <Select
                value={form.repairType}
                onValueChange={(v) => set("repairType", v as RepairType)}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {REPAIR_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>{REPAIR_TYPE_LABELS[t]}</SelectItem>
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
              value={form.cost ?? ""}
              onChange={(e) => set("cost", Number(e.target.value) as unknown as UpdateCarRepairInput["cost"])}
              required
            />
          </div>

          <div className="space-y-1">
            <Label>สถานที่ซ่อม</Label>
            <GarageSelector value={garageId} onChange={setGarageId} />
          </div>

          <div className="space-y-1">
            <Label>หมายเหตุ</Label>
            <Textarea
              rows={2}
              value={form.notes ?? ""}
              onChange={(e) => set("notes", e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" disabled={saving} onClick={onClose}>
              ยกเลิก
            </Button>
            <Button type="submit" disabled={saving} className="gap-1.5">
              {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              บันทึก
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ---- Delete-with-password Dialog ----
interface DeleteDialogProps {
  repair: CarRepair;
  open: boolean;
  onClose: () => void;
  onConfirm: (id: string) => void;
}

function DeleteDialog({ repair, open, onClose, onConfirm }: DeleteDialogProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [verifying, setVerifying] = useState(false);

  async function handleConfirm() {
    if (!password) { setError("กรุณาใส่รหัสผ่าน"); return; }
    setVerifying(true);
    setError("");
    try {
      const res = await apiJson<{ ok: boolean }>("/api/auth/verify-password", {
        method: "POST",
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        onConfirm(repair.id);
        handleClose();
      } else {
        setError("รหัสผ่านไม่ถูกต้อง");
      }
    } catch {
      setError("เกิดข้อผิดพลาด ลองใหม่อีกครั้ง");
    } finally {
      setVerifying(false);
    }
  }

  function handleClose() {
    setPassword("");
    setError("");
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!verifying && !v) handleClose(); }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-4 w-4" />
            ยืนยันการลบรายการ
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-1">
          <div className="rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm space-y-0.5">
            <p className="font-medium">{repair.carName} · {repair.licensePlate}</p>
            <p className="text-muted-foreground text-xs">
              {REPAIR_TYPE_LABELS[repair.repairType]} — {formatDate(repair.date)} — ฿{formatTHB(repair.cost)}
            </p>
          </div>

          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5 text-sm">
              <Lock className="h-3.5 w-3.5 text-muted-foreground" />
              รหัสผ่านของคุณ
            </Label>
            <Input
              type="password"
              placeholder="ใส่รหัสผ่านเพื่อยืนยัน"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(""); }}
              onKeyDown={(e) => { if (e.key === "Enter") handleConfirm(); }}
              autoFocus
            />
            {error && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <X className="h-3 w-3" /> {error}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" disabled={verifying} onClick={handleClose}>
              ยกเลิก
            </Button>
            <Button
              variant="destructive"
              disabled={verifying || !password}
              onClick={handleConfirm}
              className="gap-1.5"
            >
              {verifying && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              ลบรายการ
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ---- Repair Card Row ----
interface RepairRowProps {
  repair: CarRepair;
  onUpdate: (id: string, input: UpdateCarRepairInput) => Promise<unknown>;
  onRemove: (id: string) => void;
  onUpload: (id: string, file: File) => void;
  onRemoveReceipt: (id: string) => void;
  isUploading: boolean;
}

function RepairRow({ repair, onUpdate, onRemove, onUpload, onRemoveReceipt, isUploading }: RepairRowProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const isPdf = repair.receiptUrl?.toLowerCase().includes(".pdf") ?? false;

  return (
    <>
      <div className="rounded-lg border bg-card p-4 space-y-3">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="mt-0.5 shrink-0 text-orange-500">
              <Wrench className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm leading-snug">
                {repair.carName}
                <span className="ml-2 font-mono text-xs text-muted-foreground">
                  {repair.licensePlate}
                </span>
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{repair.description}</p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="font-bold text-sm">฿{formatTHB(repair.cost)}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{formatDate(repair.date)}</p>
          </div>
        </div>

        {/* Tags row */}
        <div className="flex flex-wrap gap-1.5">
          <Badge
            variant="secondary"
            className={`text-xs px-1.5 py-0 ${TYPE_COLORS[repair.repairType] ?? ""}`}
          >
            {REPAIR_TYPE_LABELS[repair.repairType] ?? repair.repairType}
          </Badge>
          {repair.garage && (
            <Badge variant="outline" className="text-xs px-1.5 py-0 gap-1">
              <MapPin className="h-2.5 w-2.5" />
              {repair.garage.name}
              {repair.garage.phones.length > 0 && (
                <span className="text-muted-foreground">· {repair.garage.phones[0]}</span>
              )}
              {repair.garage.mapsUrl && (
                <a
                  href={repair.garage.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-700"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="h-2.5 w-2.5" />
                </a>
              )}
            </Badge>
          )}
        </div>

        {repair.notes && (
          <p className="text-xs text-muted-foreground line-clamp-1">{repair.notes}</p>
        )}

        {repair.garage && repair.garage.phones.length > 1 && (
          <div className="flex flex-wrap gap-x-3 gap-y-0.5">
            {repair.garage.phones.map((p, i) => (
              <a key={i} href={`tel:${p}`} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                <Phone className="h-2.5 w-2.5" />{p}
              </a>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-border/60">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) { onUpload(repair.id, file); e.target.value = ""; }
            }}
          />

          {repair.receiptUrl ? (
            <>
              <Button variant="outline" size="sm" className="h-7 gap-1 text-xs"
                onClick={() => setPreviewOpen(true)}>
                <Eye className="h-3 w-3" /> ดูใบเสร็จ
              </Button>
              <Button variant="outline" size="sm" className="h-7 gap-1 text-xs"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}>
                {isUploading
                  ? <Loader2 className="h-3 w-3 animate-spin" />
                  : <RefreshCw className="h-3 w-3" />}
                เปลี่ยนรูป
              </Button>
              <Button variant="ghost" size="sm"
                className="h-7 gap-1 text-xs text-muted-foreground hover:text-destructive"
                onClick={() => onRemoveReceipt(repair.id)}>
                <X className="h-3 w-3" /> ลบรูป
              </Button>
            </>
          ) : (
            <Button variant="outline" size="sm" className="h-7 gap-1 text-xs"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}>
              {isUploading
                ? <Loader2 className="h-3 w-3 animate-spin" />
                : <Upload className="h-3 w-3" />}
              อัพโหลดใบเสร็จ
            </Button>
          )}

          {/* Edit + Delete */}
          <div className="ml-auto flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-muted-foreground hover:text-blue-600"
              onClick={() => setEditOpen(true)}
              title="แก้ไข"
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
              onClick={() => setDeleteOpen(true)}
              title="ลบ"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Receipt preview */}
      {repair.receiptUrl && (
        <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="truncate pr-6">
                ใบเสร็จ — {repair.carName} · {REPAIR_TYPE_LABELS[repair.repairType]}
              </DialogTitle>
            </DialogHeader>
            <div className="mt-1">
              {isPdf ? (
                <div className="flex flex-col items-center gap-4 py-10">
                  <FileText className="h-14 w-14 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">ไฟล์ PDF</p>
                  <Button asChild variant="outline">
                    <a href={repair.receiptUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" /> เปิดในแท็บใหม่
                    </a>
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-full overflow-auto rounded-md bg-muted/30">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={repair.receiptUrl} alt="ใบเสร็จ" className="max-h-[60vh] w-full object-contain" />
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <a href={repair.receiptUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-3.5 w-3.5 mr-1.5" /> เปิดขนาดเต็ม
                    </a>
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit dialog */}
      {editOpen && (
        <EditDialog
          repair={repair}
          open={editOpen}
          onClose={() => setEditOpen(false)}
          onSave={onUpdate}
        />
      )}

      {/* Delete confirmation dialog */}
      <DeleteDialog
        repair={repair}
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={onRemove}
      />
    </>
  );
}

// ---- Main List ----
interface CarRepairListProps {
  repairs: CarRepair[];
  isLoading?: boolean;
  onUpdate: (id: string, input: UpdateCarRepairInput) => Promise<unknown>;
  onRemove: (id: string) => void;
  onUpload: (id: string, file: File) => void;
  onRemoveReceipt: (id: string) => void;
  uploadingId: string | null;
}

export function CarRepairList({
  repairs, isLoading, onUpdate, onRemove, onUpload, onRemoveReceipt, uploadingId,
}: CarRepairListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-lg border p-4 space-y-3">
            <div className="flex justify-between">
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-1/3" />
              </div>
              <Skeleton className="h-8 w-20" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-5 w-24 rounded-full" />
              <Skeleton className="h-5 w-32 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (repairs.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Wrench className="h-10 w-10 mx-auto mb-3 opacity-25" />
        <p>ยังไม่มีประวัติการซ่อม</p>
        <p className="text-sm mt-1">กดปุ่ม &quot;บันทึกการซ่อม&quot; เพื่อเริ่มบันทึก</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {repairs.map((r) => (
        <RepairRow
          key={r.id}
          repair={r}
          onUpdate={onUpdate}
          onRemove={onRemove}
          onUpload={onUpload}
          onRemoveReceipt={onRemoveReceipt}
          isUploading={uploadingId === r.id}
        />
      ))}
    </div>
  );
}
