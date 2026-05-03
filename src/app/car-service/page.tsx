"use client";

import { useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Wrench, Receipt, MapPin, CalendarDays, History } from "lucide-react";
import { GasPriceWidget } from "@/components/car-service/GasPriceWidget";
import { CarExpenseForm, TravelExpenseForm } from "@/components/car-service/ExpenseForm";
import { CarExpenseList, TravelExpenseList } from "@/components/car-service/ExpenseList";
import { CarExpenseDetailSheet, TravelExpenseDetailSheet } from "@/components/car-service/ExpenseDetailSheet";
import type { CarExpense, TravelExpense } from "@/types/car-service";
import { CarRepairForm } from "@/components/car-service/CarRepairForm";
import { CarRepairList } from "@/components/car-service/CarRepairList";
import { useCarExpenses, useTravelExpenses } from "@/hooks/useCarExpenses";
import { useCarRepairs } from "@/hooks/useCarRepairs";
import { ThemeToggle } from "@/components/theme-toggle";
import { BackButton } from "@/components/back-button";

const CURRENT_MONTH = new Date().toISOString().slice(0, 7);

const CAR_CATEGORY_LABELS: Record<string, string> = {
  fuel: "เติมน้ำมัน",
  parking: "จอดรถ",
  toll: "ทางด่วน",
  insurance: "ประกัน",
  tax: "ภาษีรถ",
  wash: "ล้างรถ",
  accessories: "อุปกรณ์เสริม",
  other: "อื่นๆ",
};

const TRAVEL_CATEGORY_LABELS: Record<string, string> = {
  accommodation: "ที่พัก",
  food: "อาหาร",
  ferry: "เรือ/เฟอร์รี่",
  other: "อื่นๆ",
};

function formatTHB(n: number) {
  return n.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatMonth(ym: string) {
  const [y, m] = ym.split("-");
  return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
  });
}

interface MonthFilterProps {
  month: string;
  onChange: (m: string) => void;
  options: string[];
  count: number;
  summary: [string, number][] | null;
  categoryLabels: Record<string, string>;
  total: number;
}

function MonthFilter({ month, onChange, options, count, summary, categoryLabels, total }: MonthFilterProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
          <Select value={month} onValueChange={onChange}>
            <SelectTrigger className="w-52 h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ทั้งหมด</SelectItem>
              {options.map((m) => (
                <SelectItem key={m} value={m}>{formatMonth(m)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {month !== "all" && (
          <span className="text-xs text-muted-foreground">
            {count} รายการ · รวม{" "}
            <span className="font-semibold text-foreground">฿{formatTHB(total)}</span>
          </span>
        )}
      </div>
      {summary && summary.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {summary.map(([cat, amt]) => (
            <div key={cat} className="flex items-center gap-1.5 rounded-lg border bg-muted/40 px-3 py-1 text-xs">
              <span className="text-muted-foreground">{categoryLabels[cat] ?? cat}</span>
              <span className="font-semibold">฿{formatTHB(amt)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---- Tab components (แยก hook ต่อ tab เพื่อ mount เฉพาะเมื่อ active) ----

function ServiceTab() {
  const repairs = useCarRepairs();
  return (
    <Card>
      <CardHeader className="space-y-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Wrench className="h-5 w-5 text-orange-500" />
            ประวัติการซ่อมบำรุง
          </CardTitle>
          <CarRepairForm
            onAdd={async (input, receiptFile) => {
              const repair = await repairs.addRepair(input);
              if (receiptFile) repairs.uploadReceipt(repair.id, receiptFile);
              return repair;
            }}
            isLoading={repairs.isCreating}
          />
        </div>
      </CardHeader>
      <CardContent>
        <CarRepairList
          repairs={repairs.repairs}
          isLoading={repairs.isLoading}
          onUpdate={repairs.updateRepair}
          onRemove={repairs.removeRepair}
          onUpload={repairs.uploadReceipt}
          onRemoveReceipt={repairs.removeReceipt}
          uploadingId={repairs.uploadingId}
        />
      </CardContent>
    </Card>
  );
}

function ExpensesTab() {
  const carExpenses = useCarExpenses();
  const [carMonth, setCarMonth] = useState(CURRENT_MONTH);
  const [detailExpense, setDetailExpense] = useState<CarExpense | null>(null);

  const carMonthOptions = useMemo(() => {
    const s = new Set([CURRENT_MONTH]);
    carExpenses.expenses.forEach((e) => s.add(e.date.slice(0, 7)));
    return Array.from(s).sort().reverse();
  }, [carExpenses.expenses]);

  const filteredCar = useMemo(
    () => carMonth === "all" ? carExpenses.expenses : carExpenses.expenses.filter((e) => e.date.startsWith(carMonth)),
    [carExpenses.expenses, carMonth],
  );
  const filteredCarTotal = useMemo(() => filteredCar.reduce((s, e) => s + e.amount, 0), [filteredCar]);
  const carSummary = useMemo<[string, number][] | null>(() => {
    if (carMonth === "all") return null;
    const s: Record<string, number> = {};
    filteredCar.forEach((e) => { s[e.category] = (s[e.category] ?? 0) + e.amount; });
    return Object.entries(s).sort(([, a], [, b]) => b - a);
  }, [filteredCar, carMonth]);

  return (
    <Card>
      <CardHeader className="space-y-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Receipt className="h-5 w-5 text-blue-500" />
            ค่าใช้จ่ายรถ
          </CardTitle>
          <CarExpenseForm onAdd={carExpenses.addExpense} />
        </div>
        <MonthFilter
          month={carMonth}
          onChange={setCarMonth}
          options={carMonthOptions}
          count={filteredCar.length}
          summary={carSummary}
          categoryLabels={CAR_CATEGORY_LABELS}
          total={filteredCarTotal}
        />
      </CardHeader>
      <CardContent>
        <CarExpenseList
          expenses={filteredCar}
          totalAmount={filteredCarTotal}
          onDetail={setDetailExpense}
          isLoading={carExpenses.isLoading}
        />
      </CardContent>
      <CarExpenseDetailSheet
        expense={detailExpense}
        open={!!detailExpense}
        onOpenChange={(v) => { if (!v) setDetailExpense(null); }}
        onUpdate={carExpenses.updateExpense}
        onRemove={carExpenses.removeExpense}
        isUpdating={carExpenses.isUpdating}
      />
    </Card>
  );
}

function TravelTab() {
  const travelExpenses = useTravelExpenses();
  const [travelMonth, setTravelMonth] = useState(CURRENT_MONTH);
  const [detailExpense, setDetailExpense] = useState<TravelExpense | null>(null);

  const travelMonthOptions = useMemo(() => {
    const s = new Set([CURRENT_MONTH]);
    travelExpenses.expenses.forEach((e) => s.add(e.date.slice(0, 7)));
    return Array.from(s).sort().reverse();
  }, [travelExpenses.expenses]);

  const filteredTravel = useMemo(
    () => travelMonth === "all" ? travelExpenses.expenses : travelExpenses.expenses.filter((e) => e.date.startsWith(travelMonth)),
    [travelExpenses.expenses, travelMonth],
  );
  const filteredTravelTotal = useMemo(() => filteredTravel.reduce((s, e) => s + e.amount, 0), [filteredTravel]);
  const travelSummary = useMemo<[string, number][] | null>(() => {
    if (travelMonth === "all") return null;
    const s: Record<string, number> = {};
    filteredTravel.forEach((e) => { s[e.category] = (s[e.category] ?? 0) + e.amount; });
    return Object.entries(s).sort(([, a], [, b]) => b - a);
  }, [filteredTravel, travelMonth]);

  return (
    <Card>
      <CardHeader className="space-y-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MapPin className="h-5 w-5 text-green-500" />
            ค่าเดินทาง
          </CardTitle>
          <TravelExpenseForm onAdd={travelExpenses.addExpense} />
        </div>
        <MonthFilter
          month={travelMonth}
          onChange={setTravelMonth}
          options={travelMonthOptions}
          count={filteredTravel.length}
          summary={travelSummary}
          categoryLabels={TRAVEL_CATEGORY_LABELS}
          total={filteredTravelTotal}
        />
      </CardHeader>
      <CardContent>
        <TravelExpenseList
          expenses={filteredTravel}
          totalAmount={filteredTravelTotal}
          onDetail={setDetailExpense}
          isLoading={travelExpenses.isLoading}
        />
      </CardContent>
      <TravelExpenseDetailSheet
        expense={detailExpense}
        open={!!detailExpense}
        onOpenChange={(v) => { if (!v) setDetailExpense(null); }}
        onUpdate={travelExpenses.updateExpense}
        onRemove={travelExpenses.removeExpense}
        isUpdating={travelExpenses.isUpdating}
      />
    </Card>
  );
}

// ---- Page ----
export default function CarHistoryPage() {
  const [activeTab, setActiveTab] = useState("expenses");
  // เก็บว่า tab ไหนถูกเปิดแล้วบ้าง เพื่อ mount เพียงครั้งเดียว (ไม่ unmount เมื่อสลับ tab)
  const [mounted, setMounted] = useState(() => new Set(["expenses"]));

  function handleTabChange(val: string) {
    setActiveTab(val);
    setMounted((prev) => { const next = new Set(prev); next.add(val); return next; });
  }

  return (
    <main className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <BackButton />
          <h1 className="text-3xl font-bold mt-2 flex items-center gap-2">
            <History className="h-7 w-7 text-orange-500" />
            Car History
          </h1>
          <p className="text-muted-foreground mt-1">ประวัติการดูแลและค่าใช้จ่ายรถยนต์</p>
        </div>
        <ThemeToggle />
      </div>

      <GasPriceWidget />

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="service" className="gap-1.5">
            <Wrench className="h-4 w-4" />
            <span className="hidden sm:inline">ประวัติซ่อมบำรุง</span>
            <span className="sm:hidden">ซ่อมบำรุง</span>
          </TabsTrigger>
          <TabsTrigger value="expenses" className="gap-1.5">
            <Receipt className="h-4 w-4" />
            <span className="hidden sm:inline">ค่าใช้จ่ายรถ</span>
            <span className="sm:hidden">ค่าใช้จ่าย</span>
          </TabsTrigger>
          <TabsTrigger value="travel" className="gap-1.5">
            <MapPin className="h-4 w-4" />
            <span className="hidden sm:inline">ค่าเดินทาง</span>
            <span className="sm:hidden">เดินทาง</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="service" className="mt-4">
          {mounted.has("service") && <ServiceTab />}
        </TabsContent>
        <TabsContent value="expenses" className="mt-4">
          {mounted.has("expenses") && <ExpensesTab />}
        </TabsContent>
        <TabsContent value="travel" className="mt-4">
          {mounted.has("travel") && <TravelTab />}
        </TabsContent>
      </Tabs>
    </main>
  );
}
