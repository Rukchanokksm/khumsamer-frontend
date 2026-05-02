"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { BackButton } from "@/components/back-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Skeleton } from "@/components/ui/skeleton";
import { BillForm } from "@/components/bills/BillForm";
import { BillCard } from "@/components/bills/BillCard";
import { useBills } from "@/hooks/useBills";
import { Receipt, TrendingDown, AlertCircle, CalendarClock } from "lucide-react";
import type { BillStatus, CreateBillInput } from "@/types/bill";

function formatTHB(amount: number) {
  return amount.toLocaleString("th-TH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function BillListSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardContent className="p-4 space-y-3">
            <div className="flex justify-between items-start">
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-1/4" />
              </div>
              <Skeleton className="h-6 w-20" />
            </div>
            <Skeleton className="h-3 w-1/3" />
            <div className="flex gap-2 pt-1 border-t border-border/60">
              <Skeleton className="h-7 w-20" />
              <Skeleton className="h-7 w-28" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

const TAB_FILTERS: { value: "all" | BillStatus; label: string }[] = [
  { value: "all", label: "ทั้งหมด" },
  { value: "pending", label: "ยังไม่จ่าย" },
  { value: "overdue", label: "เกินกำหนด" },
  { value: "paid", label: "จ่ายแล้ว" },
];

export default function BillsPage() {
  const { bills, isLoading, addBill, markPaid, removeBill, uploadReceipt, removeReceipt, isCreating, isUploading, isUpdating } = useBills();
  const [activeTab, setActiveTab] = useState<"all" | BillStatus>("all");
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const sevenDaysLater = useMemo(() => {
    const d = new Date(today);
    d.setDate(d.getDate() + 7);
    return d;
  }, [today]);

  const thisMonthStart = useMemo(
    () => new Date(today.getFullYear(), today.getMonth(), 1),
    [today],
  );
  const thisMonthEnd = useMemo(
    () => new Date(today.getFullYear(), today.getMonth() + 1, 0),
    [today],
  );

  const totalUnpaid = useMemo(
    () =>
      bills
        .filter((b) => b.status === "pending" || b.status === "overdue")
        .reduce((sum, b) => sum + b.amount, 0),
    [bills],
  );

  const paidThisMonth = useMemo(
    () =>
      bills
        .filter((b) => {
          if (b.status !== "paid" || !b.paidDate) return false;
          const d = new Date(b.paidDate);
          return d >= thisMonthStart && d <= thisMonthEnd;
        })
        .reduce((sum, b) => sum + b.amount, 0),
    [bills, thisMonthStart, thisMonthEnd],
  );

  const dueSoonCount = useMemo(
    () =>
      bills.filter((b) => {
        if (b.status !== "pending") return false;
        const due = new Date(b.dueDate);
        return due >= today && due <= sevenDaysLater;
      }).length,
    [bills, today, sevenDaysLater],
  );

  const filtered = useMemo(
    () => (activeTab === "all" ? bills : bills.filter((b) => b.status === activeTab)),
    [bills, activeTab],
  );

  const counts = useMemo(() => {
    const pending = bills.filter((b) => b.status === "pending").length;
    const overdue = bills.filter((b) => b.status === "overdue").length;
    const paid = bills.filter((b) => b.status === "paid").length;
    return { all: bills.length, pending, overdue, paid };
  }, [bills]);

  useEffect(() => {
    if (!isUploading) setUploadingId(null);
  }, [isUploading]);

  async function handleAdd(input: CreateBillInput, receiptFile?: File) {
    const bill = await addBill(input);
    if (receiptFile) {
      setUploadingId(bill.id);
      uploadReceipt(bill.id, receiptFile);
    }
  }

  function handleUpload(id: string, file: File) {
    setUploadingId(id);
    uploadReceipt(id, file);
  }

  return (
    <main className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <BackButton />
          <h1 className="text-3xl font-bold mt-2">ค่าใช้จ่ายประจำ</h1>
          <p className="text-muted-foreground mt-1">ติดตามและจัดการการชำระค่าใช้จ่าย</p>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <BillForm onAdd={handleAdd} isLoading={isCreating} />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-full p-2 bg-red-100 dark:bg-red-500/15">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">ยอดค้างชำระ</p>
              {isLoading ? (
                <Skeleton className="h-6 w-24 mt-1" />
              ) : (
                <p className="text-lg font-bold text-red-600 dark:text-red-400">
                  ฿{formatTHB(totalUnpaid)}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-full p-2 bg-green-100 dark:bg-green-500/15">
              <TrendingDown className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">จ่ายแล้วเดือนนี้</p>
              {isLoading ? (
                <Skeleton className="h-6 w-24 mt-1" />
              ) : (
                <p className="text-lg font-bold text-green-600 dark:text-green-400">
                  ฿{formatTHB(paidThisMonth)}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-full p-2 bg-yellow-100 dark:bg-yellow-500/15">
              <CalendarClock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">ใกล้ครบกำหนด (7 วัน)</p>
              {isLoading ? (
                <Skeleton className="h-6 w-12 mt-1" />
              ) : (
                <p className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                  {dueSoonCount} รายการ
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs + Bill List */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
        <TabsList className="grid w-full grid-cols-4">
          {TAB_FILTERS.map((t) => (
            <TabsTrigger key={t.value} value={t.value} className="gap-1 text-xs sm:text-sm">
              {t.label}
              {!isLoading && counts[t.value] > 0 && (
                <span className="ml-1 rounded-full bg-muted px-1.5 py-0 text-[10px] font-semibold">
                  {counts[t.value]}
                </span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        {TAB_FILTERS.map((t) => (
          <TabsContent key={t.value} value={t.value} className="mt-4">
            {isLoading ? (
              <BillListSkeleton />
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <Receipt className="h-12 w-12 mx-auto text-muted-foreground opacity-30" />
                <div>
                  <p className="font-medium">
                    {activeTab === "all" ? "ยังไม่มีรายการบิล" : "ไม่มีรายการในหมวดนี้"}
                  </p>
                  {activeTab === "all" && (
                    <p className="text-sm text-muted-foreground mt-1">
                      กดปุ่ม &quot;เพิ่มบิล&quot; เพื่อเริ่มบันทึกค่าใช้จ่ายประจำ
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map((bill) => (
                  <BillCard
                    key={bill.id}
                    bill={bill}
                    onMarkPaid={markPaid}
                    onRemove={removeBill}
                    onUploadReceipt={handleUpload}
                    onRemoveReceipt={removeReceipt}
                    isUploading={isUploading && uploadingId === bill.id}
                    isUpdating={isUpdating}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </main>
  );
}
