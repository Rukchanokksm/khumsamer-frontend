"use client";

import { useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Droplets, Zap, Home, UtensilsCrossed, Car,
  ShoppingCart, Wifi, Smartphone, Shield, Receipt,
  CheckCircle2, Upload, Trash2, ExternalLink, X, Loader2,
  RefreshCw, Eye, FileText,
} from "lucide-react";
import type { Bill, BillCategory, BillStatus } from "@/types/bill";

const CATEGORY_ICONS: Record<BillCategory, React.ElementType> = {
  water: Droplets,
  electricity: Zap,
  rent: Home,
  food: UtensilsCrossed,
  car_installment: Car,
  item_installment: ShoppingCart,
  internet: Wifi,
  mobile: Smartphone,
  insurance: Shield,
  other: Receipt,
};

const CATEGORY_LABELS: Record<BillCategory, string> = {
  water: "ค่าน้ำ",
  electricity: "ค่าไฟ",
  rent: "ค่าที่พัก",
  food: "ค่ากิน",
  car_installment: "ผ่อนรถ",
  item_installment: "ผ่อนของ",
  internet: "อินเตอร์เน็ต",
  mobile: "ค่ามือถือ",
  insurance: "ค่าประกัน",
  other: "อื่นๆ",
};

const ICON_COLORS: Record<BillCategory, string> = {
  water: "text-blue-500",
  electricity: "text-yellow-500",
  rent: "text-purple-500",
  food: "text-green-500",
  car_installment: "text-orange-500",
  item_installment: "text-pink-500",
  internet: "text-cyan-500",
  mobile: "text-indigo-500",
  insurance: "text-emerald-500",
  other: "text-gray-500",
};

const STATUS_STYLES: Record<BillStatus, string> = {
  pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/15 dark:text-yellow-300",
  paid: "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300",
  overdue: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300",
};

const STATUS_LABELS: Record<BillStatus, string> = {
  pending: "ยังไม่จ่าย",
  paid: "จ่ายแล้ว",
  overdue: "เกินกำหนด",
};

function formatTHB(amount: number) {
  return amount.toLocaleString("th-TH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

interface BillCardProps {
  bill: Bill;
  onMarkPaid: (id: string) => void;
  onRemove: (id: string) => void;
  onUploadReceipt: (id: string, file: File) => void;
  onRemoveReceipt: (id: string) => void;
  isUploading?: boolean;
  isUpdating?: boolean;
}

export function BillCard({
  bill,
  onMarkPaid,
  onRemove,
  onUploadReceipt,
  onRemoveReceipt,
  isUploading,
  isUpdating,
}: BillCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const Icon = CATEGORY_ICONS[bill.category];

  const isPdf =
    bill.receiptPath?.toLowerCase().endsWith(".pdf") ||
    bill.receiptUrl?.toLowerCase().includes(".pdf") ||
    false;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      onUploadReceipt(bill.id, file);
      e.target.value = "";
    }
  }

  const cardBorder =
    bill.status === "overdue"
      ? "border-red-200 dark:border-red-500/30"
      : bill.status === "paid"
      ? "border-green-200 dark:border-green-500/20"
      : "";

  return (
    <>
      <Card className={cardBorder}>
        <CardContent className="p-4 space-y-3">
          {/* Top row: icon + name + amount */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0">
              <div className={`mt-0.5 shrink-0 ${ICON_COLORS[bill.category]}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm leading-snug truncate">
                  {bill.name}
                </p>
                <div className="flex flex-wrap items-center gap-1.5 mt-1">
                  <Badge variant="secondary" className="text-xs px-1.5 py-0">
                    {CATEGORY_LABELS[bill.category]}
                  </Badge>
                  {bill.isInstallment && bill.installmentNo && bill.totalInstallments && (
                    <Badge variant="outline" className="text-xs px-1.5 py-0">
                      งวด {bill.installmentNo}/{bill.totalInstallments}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="font-bold text-base">฿{formatTHB(bill.amount)}</p>
              <Badge variant="secondary" className={`text-xs mt-1 ${STATUS_STYLES[bill.status]}`}>
                {STATUS_LABELS[bill.status]}
              </Badge>
            </div>
          </div>

          {/* Date row */}
          <div className="text-xs text-muted-foreground flex flex-wrap gap-x-4 gap-y-0.5">
            <span>ครบกำหนด: {formatDate(bill.dueDate)}</span>
            {bill.paidDate && (
              <span className="text-green-600 dark:text-green-400">
                จ่ายเมื่อ: {formatDate(bill.paidDate)}
              </span>
            )}
          </div>

          {/* Notes */}
          {bill.notes && (
            <p className="text-xs text-muted-foreground line-clamp-2">{bill.notes}</p>
          )}

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-border/60">
            {bill.status !== "paid" && (
              <Button
                variant="outline"
                size="sm"
                className="h-7 gap-1 text-xs text-green-600 border-green-300 hover:bg-green-50 dark:text-green-400 dark:border-green-700 dark:hover:bg-green-950"
                onClick={() => onMarkPaid(bill.id)}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-3 w-3" />
                )}
                จ่ายแล้ว
              </Button>
            )}

            {/* Hidden file input — shared for both upload and replace */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              className="hidden"
              onChange={handleFileChange}
            />

            {bill.receiptUrl ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 gap-1 text-xs"
                  onClick={() => setPreviewOpen(true)}
                >
                  <Eye className="h-3 w-3" />
                  ดูใบเสร็จ
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 gap-1 text-xs"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <RefreshCw className="h-3 w-3" />
                  )}
                  เปลี่ยนรูป
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 gap-1 text-xs text-muted-foreground hover:text-destructive"
                  onClick={() => onRemoveReceipt(bill.id)}
                >
                  <X className="h-3 w-3" />
                  ลบรูป
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="h-7 gap-1 text-xs"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Upload className="h-3 w-3" />
                )}
                อัพโหลดใบเสร็จ
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 ml-auto text-muted-foreground hover:text-destructive"
              onClick={() => onRemove(bill.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Receipt preview dialog */}
      {bill.receiptUrl && (
        <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="truncate pr-6">
                ใบเสร็จ — {bill.name}
              </DialogTitle>
            </DialogHeader>
            <div className="mt-1">
              {isPdf ? (
                <div className="flex flex-col items-center gap-4 py-10">
                  <FileText className="h-14 w-14 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">ไฟล์ PDF</p>
                  <Button asChild variant="outline">
                    <a
                      href={bill.receiptUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      เปิดในแท็บใหม่
                    </a>
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-full overflow-auto rounded-md bg-muted/30">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={bill.receiptUrl}
                      alt="ใบเสร็จ"
                      className="max-h-[60vh] w-full object-contain"
                    />
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <a
                      href={bill.receiptUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                      เปิดขนาดเต็ม
                    </a>
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
