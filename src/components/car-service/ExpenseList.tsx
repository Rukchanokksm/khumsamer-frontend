"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { ChevronRight } from "lucide-react"
import type { CarExpense, TravelExpense } from "@/types/car-service"

function TableSkeleton({ cols, rows = 4 }: { cols: number; rows?: number }) {
    return (
        <div className="rounded-md border overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        {Array.from({ length: cols }).map((_, i) => (
                            <TableHead key={i}>
                                <Skeleton className="h-4 w-16" />
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {Array.from({ length: rows }).map((_, i) => (
                        <TableRow key={i}>
                            {Array.from({ length: cols }).map((_, j) => (
                                <TableCell key={j}>
                                    <Skeleton className="h-4 w-full" />
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}

function formatTHB(amount: number): string {
    return amount.toLocaleString("th-TH", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })
}

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString("th-TH", {
        year: "numeric",
        month: "short",
        day: "numeric",
    })
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
}

const TRAVEL_CATEGORY_LABELS: Record<string, string> = {
    fuel: "เติมน้ำมัน",
    toll: "ทางด่วน/ทางหลวง",
    parking: "จอดรถ",
    accommodation: "ที่พัก",
    food: "อาหาร",
    ferry: "เรือ/เฟอร์รี่",
    other: "อื่นๆ",
}

const CATEGORY_COLORS: Record<string, string> = {
    fuel: "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300",
    parking: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
    toll: "bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300",
    insurance:
        "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300",
    tax: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300",
    wash: "bg-cyan-100 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-300",
    accessories:
        "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/15 dark:text-yellow-300",
    accommodation:
        "bg-pink-100 text-pink-700 dark:bg-pink-500/15 dark:text-pink-300",
    food: "bg-lime-100 text-lime-700 dark:bg-lime-500/15 dark:text-lime-300",
    ferry: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300",
    other: "bg-gray-100 text-gray-700 dark:bg-gray-500/15 dark:text-gray-300",
}

// ---- Car Expense List ----
interface CarExpenseListProps {
    expenses: CarExpense[]
    totalAmount: number
    onDetail: (expense: CarExpense) => void
    isLoading?: boolean
}

export function CarExpenseList({
    expenses,
    totalAmount,
    onDetail,
    isLoading,
}: CarExpenseListProps) {
    if (isLoading) return <TableSkeleton cols={5} />

    if (expenses.length === 0) {
        return (
            <div className="text-center py-12 text-muted-foreground">
                <p>ยังไม่มีรายการค่าใช้จ่าย</p>
                <p className="text-sm mt-1">กดปุ่ม &quot;เพิ่มรายจ่าย&quot; เพื่อเริ่มบันทึก</p>
            </div>
        )
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
                            <TableHead className="max-w-[160px]">รายละเอียด</TableHead>
                            <TableHead className="text-right">จำนวนเงิน</TableHead>
                            <TableHead className="w-8" />
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {expenses.map((expense) => (
                            <TableRow key={expense.id} className="cursor-pointer hover:bg-muted/50"
                                onClick={() => onDetail(expense)}>
                                <TableCell className="whitespace-nowrap text-sm">
                                    {formatDate(expense.date)}
                                </TableCell>
                                <TableCell>
                                    <div className="text-sm font-medium">{expense.carName}</div>
                                    <div className="text-xs text-muted-foreground">{expense.licensePlate}</div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="secondary"
                                        className={`text-xs ${CATEGORY_COLORS[expense.category] ?? ""}`}>
                                        {CAR_CATEGORY_LABELS[expense.category] ?? expense.category}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-sm max-w-[160px] truncate text-muted-foreground">
                                    {expense.description}
                                </TableCell>
                                <TableCell className="text-right font-semibold text-sm">
                                    ฿{formatTHB(expense.amount)}
                                </TableCell>
                                <TableCell>
                                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
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
    )
}

// ---- Travel Expense List ----
interface TravelExpenseListProps {
    expenses: TravelExpense[]
    totalAmount: number
    onDetail: (expense: TravelExpense) => void
    isLoading?: boolean
}

export function TravelExpenseList({
    expenses,
    totalAmount,
    onDetail,
    isLoading,
}: TravelExpenseListProps) {
    if (isLoading) return <TableSkeleton cols={5} />

    if (expenses.length === 0) {
        return (
            <div className="text-center py-12 text-muted-foreground">
                <p>ยังไม่มีรายการค่าเดินทาง</p>
                <p className="text-sm mt-1">กดปุ่ม &quot;เพิ่มค่าเดินทาง&quot; เพื่อเริ่มบันทึก</p>
            </div>
        )
    }

    return (
        <div>
            <div className="rounded-md border overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>วันที่</TableHead>
                            <TableHead>ทริป / รถ</TableHead>
                            <TableHead>ประเภท</TableHead>
                            <TableHead className="max-w-[140px]">รายละเอียด</TableHead>
                            <TableHead className="text-right">จำนวนเงิน</TableHead>
                            <TableHead className="w-8" />
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {expenses.map((expense) => (
                            <TableRow key={expense.id} className="cursor-pointer hover:bg-muted/50"
                                onClick={() => onDetail(expense)}>
                                <TableCell className="whitespace-nowrap text-sm">
                                    {formatDate(expense.date)}
                                </TableCell>
                                <TableCell>
                                    <div className="text-sm font-medium max-w-[120px] truncate">{expense.tripName}</div>
                                    <div className="text-xs text-muted-foreground">{expense.carName}</div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="secondary"
                                        className={`text-xs ${CATEGORY_COLORS[expense.category] ?? ""}`}>
                                        {TRAVEL_CATEGORY_LABELS[expense.category] ?? expense.category}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-sm max-w-[140px] truncate text-muted-foreground">
                                    {expense.description}
                                </TableCell>
                                <TableCell className="text-right font-semibold text-sm">
                                    ฿{formatTHB(expense.amount)}
                                </TableCell>
                                <TableCell>
                                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
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
    )
}
