"use client";

import { useState } from "react";
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
import { Plus } from "lucide-react";
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
  onAdd: (input: CreateBillInput) => void;
}

export function BillForm({ onAdd }: BillFormProps) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<CreateBillInput>>(DEFAULT_FORM);

  function set<K extends keyof CreateBillInput>(key: K, value: CreateBillInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.category || !form.amount || !form.dueDate) return;

    onAdd({
      name: form.name,
      category: form.category,
      amount: Number(form.amount),
      dueDate: form.dueDate,
      isInstallment: form.isInstallment ?? false,
      installmentNo: form.isInstallment && form.installmentNo ? Number(form.installmentNo) : undefined,
      totalInstallments: form.isInstallment && form.totalInstallments ? Number(form.totalInstallments) : undefined,
      notes: form.notes || undefined,
    });

    setOpen(false);
    setForm(DEFAULT_FORM);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
                onChange={(e) => set("amount", Number(e.target.value) as unknown as CreateBillInput["amount"])}
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
                    onChange={(e) => set("installmentNo", Number(e.target.value) as unknown as CreateBillInput["installmentNo"])}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">จากทั้งหมด (งวด)</Label>
                  <Input
                    type="number"
                    min="1"
                    placeholder="60"
                    value={form.totalInstallments ?? ""}
                    onChange={(e) => set("totalInstallments", Number(e.target.value) as unknown as CreateBillInput["totalInstallments"])}
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

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              ยกเลิก
            </Button>
            <Button type="submit">บันทึก</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
