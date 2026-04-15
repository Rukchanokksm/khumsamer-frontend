"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash2 } from "lucide-react";
import type { CarExpense, TravelExpense } from "@/types/car-service";

function formatTHB(amount: number): string {
  return amount.toLocaleString("th-TH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

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
  fuel: "เติมน้ำมัน",
  toll: "ทางด่วน/ทางหลวง",
  parking: "จอดรถ",
  accommodation: "ที่พัก",
  food: "อาหาร",
  ferry: "เรือ/เฟอร์รี่",
  other: "อื่นๆ",
};

const CATEGORY_COLORS: Record<string, string> = {
  fuel: "bg-orange-100 text-orange-700",
  parking: "bg-blue-100 text-blue-700",
  toll: "bg-purple-100 text-purple-700",
  insurance: "bg-green-100 text-green-700",
  tax: "bg-red-100 text-red-700",
  wash: "bg-cyan-100 text-cyan-700",
  accessories: "bg-yellow-100 text-yellow-700",
  accommodation: "bg-pink-100 text-pink-700",
  food: "bg-lime-100 text-lime-700",
  ferry: "bg-indigo-100 text-indigo-700",
  other: "bg-gray-100 text-gray-700",
};

// ---- Car Expense List ----
interface CarExpenseListProps {
  expenses: CarExpense[];
  totalAmount: number;
  onRemove: (id: string) => void;
}

export function CarExpenseList({ expenses, totalAmount, onRemove }: CarExpenseListProps) {
  if (expenses.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>ยังไม่มีรายการค่าใช้จ่าย</p>
        <p className="text-sm mt-1">กดปุ่ม &quot;เพิ่มรายจ่าย&quot; เพื่อเริ่มบันทึก</p>
      </div>
    );
  }

  return (
    <div>
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>วันที่</TableHead>
              <TableHead>รถ</TableHead>
              <TableHead>ประเภท</TableHead>
              <TableHead>รายละเอียด</TableHead>
              <TableHead>ลิตร</TableHead>
              <TableHead className="text-right">จำนวนเงิน</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.map((expense) => (
              <TableRow key={expense.id}>
                <TableCell className="whitespace-nowrap text-sm">
                  {formatDate(expense.date)}
                </TableCell>
                <TableCell>
                  <div className="text-sm font-medium">{expense.carName}</div>
                  <div className="text-xs text-muted-foreground">{expense.licensePlate}</div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={`text-xs ${CATEGORY_COLORS[expense.category] ?? ""}`}
                  >
                    {CAR_CATEGORY_LABELS[expense.category] ?? expense.category}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm max-w-[180px] truncate">
                  {expense.description}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {expense.liters ? `${expense.liters} ล.` : "-"}
                  {expense.pricePerLiter ? (
                    <div className="text-xs">฿{formatTHB(expense.pricePerLiter)}/ล.</div>
                  ) : null}
                </TableCell>
                <TableCell className="text-right font-semibold text-sm">
                  ฿{formatTHB(expense.amount)}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => onRemove(expense.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex justify-end mt-3 px-1">
        <p className="text-sm font-semibold">
          รวมทั้งหมด:{" "}
          <span className="text-primary text-base">฿{formatTHB(totalAmount)}</span>
        </p>
      </div>
    </div>
  );
}

// ---- Travel Expense List ----
interface TravelExpenseListProps {
  expenses: TravelExpense[];
  totalAmount: number;
  onRemove: (id: string) => void;
}

export function TravelExpenseList({ expenses, totalAmount, onRemove }: TravelExpenseListProps) {
  if (expenses.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>ยังไม่มีรายการค่าเดินทาง</p>
        <p className="text-sm mt-1">กดปุ่ม &quot;เพิ่มค่าเดินทาง&quot; เพื่อเริ่มบันทึก</p>
      </div>
    );
  }

  return (
    <div>
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>วันที่</TableHead>
              <TableHead>ทริป</TableHead>
              <TableHead>รถ</TableHead>
              <TableHead>ประเภท</TableHead>
              <TableHead>รายละเอียด</TableHead>
              <TableHead>ระยะทาง</TableHead>
              <TableHead className="text-right">จำนวนเงิน</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.map((expense) => (
              <TableRow key={expense.id}>
                <TableCell className="whitespace-nowrap text-sm">
                  {formatDate(expense.date)}
                </TableCell>
                <TableCell className="text-sm font-medium max-w-[120px] truncate">
                  {expense.tripName}
                </TableCell>
                <TableCell>
                  <div className="text-sm">{expense.carName}</div>
                  <div className="text-xs text-muted-foreground">{expense.licensePlate}</div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={`text-xs ${CATEGORY_COLORS[expense.category] ?? ""}`}
                  >
                    {TRAVEL_CATEGORY_LABELS[expense.category] ?? expense.category}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm max-w-[160px] truncate">
                  {expense.description}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {expense.distance ? `${expense.distance} กม.` : "-"}
                </TableCell>
                <TableCell className="text-right font-semibold text-sm">
                  ฿{formatTHB(expense.amount)}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => onRemove(expense.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex justify-end mt-3 px-1">
        <p className="text-sm font-semibold">
          รวมค่าเดินทางทั้งหมด:{" "}
          <span className="text-primary text-base">฿{formatTHB(totalAmount)}</span>
        </p>
      </div>
    </div>
  );
}
