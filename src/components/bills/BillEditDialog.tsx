"use client";

import { useEffect, useState } from "react";
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
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import type { Bill, BillCategory, UpdateBillInput } from "@/types/bill";

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

interface FormState {
  name: string;
  category: BillCategory;
  amount: string;
  dueDate: string;
  paidDate: string;
  isInstallment: boolean;
  installmentNo: string;
  totalInstallments: string;
  notes: string;
}

function billToForm(bill: Bill): FormState {
  return {
    name: bill.name,
    category: bill.category,
    amount: String(bill.amount),
    dueDate: bill.dueDate.slice(0, 10),
    paidDate: bill.paidDate ? bill.paidDate.slice(0, 10) : "",
    isInstallment: bill.isInstallment,
    installmentNo: bill.installmentNo ? String(bill.installmentNo) : "",
    totalInstallments: bill.totalInstallments ? String(bill.totalInstallments) : "",
    notes: bill.notes ?? "",
  };
}

interface BillEditDialogProps {
  bill: Bill;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (id: string, input: UpdateBillInput) => Promise<Bill>;
}

export function BillEditDialog({ bill, open, onOpenChange, onUpdate }: BillEditDialogProps) {
  const [form, setForm] = useState<FormState>(() => billToForm(bill));
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) setForm(billToForm(bill));
  }, [open, bill]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.category || !form.amount || !form.dueDate) return;

    const input: UpdateBillInput = {
      name: form.name,
      category: form.category,
      amount: Number(form.amount),
      dueDate: form.dueDate,
      isInstallment: form.isInstallment,
      installmentNo:
        form.isInstallment && form.installmentNo ? Number(form.installmentNo) : null,
      totalInstallments:
        form.isInstallment && form.totalInstallments ? Number(form.totalInstallments) : null,
      notes: form.notes || null,
      paidDate: form.paidDate || null,
      // sync status with paidDate
      status: form.paidDate ? "paid" : "pending",
    };

    setSubmitting(true);
    try {
      await onUpdate(bill.id, input);
      onOpenChange(false);
    } catch {
      // handled by React Query
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!submitting) onOpenChange(v); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>แก้ไขรายการค่าใช้จ่าย</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1">
            <Label>ชื่อบิล *</Label>
            <Input
              placeholder="เช่น ค่าไฟฟ้าเดือน พ.ค. 68"
              value={form.name}
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
                value={form.amount}
                onChange={(e) => set("amount", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>วันครบกำหนด *</Label>
              <Input
                type="date"
                value={form.dueDate}
                onChange={(e) => set("dueDate", e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <Label>วันที่ชำระ</Label>
              <Input
                type="date"
                value={form.paidDate}
                onChange={(e) => set("paidDate", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-input accent-primary"
                checked={form.isInstallment}
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
                    value={form.installmentNo}
                    onChange={(e) => set("installmentNo", e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">จากทั้งหมด (งวด)</Label>
                  <Input
                    type="number"
                    min="1"
                    placeholder="60"
                    value={form.totalInstallments}
                    onChange={(e) => set("totalInstallments", e.target.value)}
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
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              disabled={submitting}
              onClick={() => onOpenChange(false)}
            >
              ยกเลิก
            </Button>
            <Button type="submit" disabled={submitting} className="gap-1.5">
              {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              บันทึก
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
