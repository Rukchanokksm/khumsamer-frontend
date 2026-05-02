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
import { Loader2, Paperclip, Plus, X } from "lucide-react";
import type { BillCategory, CreateBillInput } from "@/types/bill";

const CATEGORIES: { value: BillCategory; label: string }[] = [
  { value: "water", label: "ค่าน้ำ" },
  { value: "electricity", label: "ค่าไฟ" },
  { value: "rent", label: "ค่าที่พัก / ค่าเช่า" },
  { value: "food", label: "ค่ากิน" },
  { value: "car_installment", label: "ค่าผ่อนรถ" },
  { value: "item_installment", label: "ค่าผ่อนของ" },
  { value: "internet", label: "ค่าอินเตอร์เน็ต" },
  { value: "mobile", label: "ค่ามือถือ" },
  { value: "insurance", label: "ค่าประกัน" },
  { value: "other", label: "อื่นๆ" },
];

const DEFAULT_FORM: Partial<CreateBillInput> = {
  category: "electricity",
  dueDate: "",
  isInstallment: false,
};

interface BillFormProps {
  onAdd: (input: CreateBillInput, receiptFile?: File) => Promise<void>;
  isLoading?: boolean;
}

export function BillForm({ onAdd, isLoading }: BillFormProps) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<CreateBillInput>>(DEFAULT_FORM);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function set<K extends keyof CreateBillInput>(key: K, value: CreateBillInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setReceiptFile(file);
    e.target.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.category || !form.amount || !form.dueDate) return;
    setSubmitting(true);
    try {
      await onAdd(
        {
          name: form.name,
          category: form.category,
          amount: Number(form.amount),
          dueDate: form.dueDate,
          isInstallment: form.isInstallment ?? false,
          installmentNo:
            form.isInstallment && form.installmentNo
              ? Number(form.installmentNo)
              : undefined,
          totalInstallments:
            form.isInstallment && form.totalInstallments
              ? Number(form.totalInstallments)
              : undefined,
          notes: form.notes || undefined,
        },
        receiptFile ?? undefined,
      );
      setOpen(false);
      setForm(DEFAULT_FORM);
      setReceiptFile(null);
    } catch {
      // mutation error is handled by React Query
    } finally {
      setSubmitting(false);
    }
  }

  const busy = submitting || isLoading;

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!busy) {
          setOpen(v);
          if (!v) {
            setForm(DEFAULT_FORM);
            setReceiptFile(null);
          }
        }
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1">
          <Plus className="h-4 w-4" /> เพิ่มบิล
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>เพิ่มรายการค่าใช้จ่าย</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1">
            <Label>ชื่อบิล *</Label>
            <Input
              placeholder="เช่น ค่าไฟฟ้าเดือน พ.ค. 68"
              value={form.name ?? ""}
              onChange={(e) => set("name", e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>ประเภท *</Label>
              <Select
                value={form.category}
                onValueChange={(v) => set("category", v as BillCategory)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>จำนวนเงิน (บาท) *</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={form.amount ?? ""}
                onChange={(e) =>
                  set(
                    "amount",
                    Number(
                      e.target.value,
                    ) as unknown as CreateBillInput["amount"],
                  )
                }
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label>วันครบกำหนด *</Label>
            <Input
              type="date"
              value={form.dueDate ?? ""}
              onChange={(e) => set("dueDate", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-input accent-primary"
                checked={form.isInstallment ?? false}
                onChange={(e) => set("isInstallment", e.target.checked)}
              />
              <span className="text-sm font-medium">เป็นการผ่อนชำระ</span>
            </label>

            {form.isInstallment && (
              <div className="grid grid-cols-2 gap-3 pl-6">
                <div className="space-y-1">
                  <Label className="text-xs">งวดที่</Label>
                  <Input
                    type="number"
                    min="1"
                    placeholder="1"
                    value={form.installmentNo ?? ""}
                    onChange={(e) =>
                      set(
                        "installmentNo",
                        Number(
                          e.target.value,
                        ) as unknown as CreateBillInput["installmentNo"],
                      )
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">จากทั้งหมด (งวด)</Label>
                  <Input
                    type="number"
                    min="1"
                    placeholder="60"
                    value={form.totalInstallments ?? ""}
                    onChange={(e) =>
                      set(
                        "totalInstallments",
                        Number(
                          e.target.value,
                        ) as unknown as CreateBillInput["totalInstallments"],
                      )
                    }
                  />
                </div>
              </div>
            )}
          </div>

          <div className="space-y-1">
            <Label>หมายเหตุ</Label>
            <Textarea
              placeholder="หมายเหตุเพิ่มเติม"
              rows={2}
              value={form.notes ?? ""}
              onChange={(e) => set("notes", e.target.value)}
            />
          </div>

          {/* Receipt upload */}
          <div className="space-y-1">
            <Label>แนบใบเสร็จ (ไม่บังคับ)</Label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              className="hidden"
              onChange={handleFileChange}
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
              onClick={() => {
                setOpen(false);
                setForm(DEFAULT_FORM);
                setReceiptFile(null);
              }}
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
