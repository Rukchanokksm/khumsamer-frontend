"use client"

import { useState } from "react"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Loader2, Pencil, Trash2 } from "lucide-react"
import type {
    CarExpense,
    TravelExpense,
    ExpenseCategory,
    TravelExpenseCategory,
    UpdateCarExpenseInput,
    UpdateTravelExpenseInput,
} from "@/types/car-service"
import { TollPlazaSelector } from "@/components/car-service/TollPlazaSelector"
import { CarWashPlaceSelector } from "@/components/car-service/CarWashPlaceSelector"
import { TOLL_HIGHWAYS, TOLL_PLAZAS } from "@/data/toll-plazas"

// ─── shared helpers ────────────────────────────────────────────────────────────

const CAR_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
    fuel: "เติมน้ำมัน",
    parking: "จอดรถ",
    toll: "ทางด่วน",
    insurance: "ประกัน",
    tax: "ภาษีรถ",
    wash: "ล้างรถ",
    accessories: "อุปกรณ์เสริม",
    other: "อื่นๆ",
}

const TRAVEL_CATEGORY_LABELS: Record<TravelExpenseCategory, string> = {
    accommodation: "ที่พัก",
    food: "อาหาร",
    ferry: "เรือ/เฟอร์รี่",
    fuel: "เติมน้ำมัน",
    toll: "ทางด่วน",
    parking: "จอดรถ",
    other: "อื่นๆ",
}

const FUEL_PRESETS = [
    "SHELL GASOHOL V-POWER 95",
    "SHELL FUELSAVE GASOHOL FUELSAVE 95",
    "CALTEX TECHRON 95",
    "CALTEX GOLD TECHRON 95",
    "BANGCHAK GASOHOL EVO 95",
    "PT MAX GASOHOL 95",
]

function formatTHB(n: number) {
    return n.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatDate(d: string) {
    return new Date(d).toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" })
}

// ─── ค้นหา plaza จาก description string "เฉลิมมหานคร · ดินแดง" ────────────────
function plazaIdFromDescription(desc: string): string {
    const [hwShort, plazaName] = desc.split(" · ")
    if (!hwShort || !plazaName) return ""
    const hw = TOLL_HIGHWAYS.find((h) => h.nameShort === hwShort)
    if (!hw) return ""
    const plaza = TOLL_PLAZAS.find((p) => p.highwayId === hw.id && p.name === plazaName)
    return plaza ? String(plaza.id) : ""
}

// ─── Delete confirm ─────────────────────────────────────────────────────────────

interface DeleteConfirmProps {
    open: boolean
    onOpenChange: (v: boolean) => void
    name: string
    onConfirm: () => Promise<void>
}

function DeleteConfirm({ open, onOpenChange, name, onConfirm }: DeleteConfirmProps) {
    const [busy, setBusy] = useState(false)
    async function handle() {
        setBusy(true)
        try { await onConfirm() } finally { setBusy(false) }
    }
    return (
        <Dialog open={open} onOpenChange={(v) => { if (!busy) onOpenChange(v) }}>
            <DialogContent className="max-w-sm">
                <DialogHeader><DialogTitle>ลบรายการ</DialogTitle></DialogHeader>
                <p className="text-sm text-muted-foreground">
                    ต้องการลบ <span className="font-semibold text-foreground">{name}</span> ออกจากประวัติ?
                </p>
                <div className="flex justify-end gap-2 pt-2">
                    <Button variant="outline" disabled={busy} onClick={() => onOpenChange(false)}>ยกเลิก</Button>
                    <Button variant="destructive" disabled={busy} className="gap-1.5" onClick={handle}>
                        {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />} ลบ
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

// ─── Row ────────────────────────────────────────────────────────────────────────

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-0.5">
            <span className="text-xs text-muted-foreground">{label}</span>
            <span className="text-sm">{children}</span>
        </div>
    )
}

// ══════════════════════════════════════════════════════════════════════════════
//  Car Expense Detail Sheet
// ══════════════════════════════════════════════════════════════════════════════

interface CarExpenseDetailSheetProps {
    expense: CarExpense | null
    open: boolean
    onOpenChange: (v: boolean) => void
    onUpdate: (id: string, input: UpdateCarExpenseInput) => Promise<unknown>
    onRemove: (id: string) => void
    isUpdating?: boolean
}

export function CarExpenseDetailSheet({
    expense,
    open,
    onOpenChange,
    onUpdate,
    onRemove,
    isUpdating,
}: CarExpenseDetailSheetProps) {
    const [mode, setMode] = useState<"view" | "edit">("view")
    const [deleteOpen, setDeleteOpen] = useState(false)
    const [form, setForm] = useState<Partial<UpdateCarExpenseInput>>({})
    const [selectedTollPlazaId, setSelectedTollPlazaId] = useState("")
    const [selectedWashPlaceId, setSelectedWashPlaceId] = useState("")

    if (!expense) return null

    const merged = { ...expense, ...form }
    const isFuel = merged.category === "fuel"
    const isToll = merged.category === "toll"
    const isWash = merged.category === "wash"

    function startEdit() {
        setForm({})
        setSelectedTollPlazaId(expense!.category === "toll" ? plazaIdFromDescription(expense!.description) : "")
        setSelectedWashPlaceId("")
        setMode("edit")
    }

    function cancelEdit() {
        setForm({})
        setSelectedTollPlazaId("")
        setSelectedWashPlaceId("")
        setMode("view")
    }

    function set<K extends keyof UpdateCarExpenseInput>(key: K, value: UpdateCarExpenseInput[K]) {
        setForm((prev) => ({ ...prev, [key]: value }))
    }

    function handleCategoryChange(v: ExpenseCategory) {
        setForm((prev) => ({ ...prev, category: v, description: "" }))
        if (v !== "toll") setSelectedTollPlazaId("")
        if (v !== "wash") setSelectedWashPlaceId("")
    }

    async function handleSave() {
        if (!merged.description) return
        await onUpdate(expense!.id, {
            carName: merged.carName,
            licensePlate: merged.licensePlate,
            category: merged.category,
            amount: Number(merged.amount),
            date: merged.date,
            description: merged.description,
            liters: merged.liters ?? undefined,
            pricePerLiter: merged.pricePerLiter ?? undefined,
            notes: merged.notes ?? undefined,
        })
        setMode("view")
        setForm({})
    }

    async function handleDelete() {
        onRemove(expense!.id)
        onOpenChange(false)
    }

    const categoryLabel = CAR_CATEGORY_LABELS[expense.category] ?? expense.category

    return (
        <>
            <Sheet open={open} onOpenChange={(v) => { if (!v) { cancelEdit() } onOpenChange(v) }}>
                <SheetContent className="w-full sm:max-w-md overflow-y-auto">
                    <SheetHeader className="pb-4">
                        <SheetTitle className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-sm px-2 py-0.5">
                                {categoryLabel}
                            </Badge>
                            <span className="text-lg font-bold text-primary">฿{formatTHB(expense.amount)}</span>
                        </SheetTitle>
                    </SheetHeader>

                    {mode === "view" ? (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <InfoRow label="วันที่">{formatDate(expense.date)}</InfoRow>
                                <InfoRow label="รถ">
                                    {expense.carName}
                                    <span className="ml-1 text-xs text-muted-foreground">({expense.licensePlate})</span>
                                </InfoRow>
                            </div>
                            <InfoRow label="รายละเอียด">{expense.description}</InfoRow>
                            {(expense.liters || expense.pricePerLiter) && (
                                <div className="grid grid-cols-2 gap-3">
                                    {expense.liters && <InfoRow label="จำนวนลิตร">{expense.liters} ล.</InfoRow>}
                                    {expense.pricePerLiter && <InfoRow label="ราคา/ลิตร">฿{formatTHB(expense.pricePerLiter)}</InfoRow>}
                                </div>
                            )}
                            {expense.notes && <InfoRow label="หมายเหตุ">{expense.notes}</InfoRow>}
                            <div className="flex justify-between pt-4 border-t">
                                <Button variant="outline" size="sm" className="gap-1.5 text-destructive hover:text-destructive"
                                    onClick={() => setDeleteOpen(true)}>
                                    <Trash2 className="h-3.5 w-3.5" /> ลบ
                                </Button>
                                <Button size="sm" className="gap-1.5" onClick={startEdit}>
                                    <Pencil className="h-3.5 w-3.5" /> แก้ไข
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <Label>ชื่อรถ *</Label>
                                    <Input value={merged.carName ?? ""} onChange={(e) => set("carName", e.target.value)} />
                                </div>
                                <div className="space-y-1">
                                    <Label>ทะเบียน *</Label>
                                    <Input value={merged.licensePlate ?? ""} onChange={(e) => set("licensePlate", e.target.value)} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <Label>ประเภท *</Label>
                                    <Select value={merged.category} onValueChange={(v) => handleCategoryChange(v as ExpenseCategory)}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {(Object.entries(CAR_CATEGORY_LABELS) as [ExpenseCategory, string][]).map(([v, l]) => (
                                                <SelectItem key={v} value={v}>{l}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1">
                                    <Label>วันที่ *</Label>
                                    <Input type="date" value={merged.date ?? ""} onChange={(e) => set("date", e.target.value)} />
                                </div>
                            </div>

                            {isFuel ? (
                                <div className="space-y-1">
                                    <Label>ประเภทน้ำมัน *</Label>
                                    <Select value={merged.description ?? ""} onValueChange={(v) => set("description", v)}>
                                        <SelectTrigger><SelectValue placeholder="เลือกประเภทน้ำมัน" /></SelectTrigger>
                                        <SelectContent>
                                            {FUEL_PRESETS.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            ) : isToll ? (
                                <div className="space-y-1">
                                    <Label>ด่านทางด่วน *</Label>
                                    <TollPlazaSelector
                                        value={selectedTollPlazaId}
                                        onChange={(id, desc) => {
                                            setSelectedTollPlazaId(id)
                                            set("description", desc)
                                        }}
                                    />
                                </div>
                            ) : isWash ? (
                                <div className="space-y-1">
                                    <Label>สถานที่ล้างรถ *</Label>
                                    <CarWashPlaceSelector
                                        value={selectedWashPlaceId}
                                        onChange={(id, desc) => {
                                            setSelectedWashPlaceId(id)
                                            set("description", desc)
                                        }}
                                    />
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    <Label>รายละเอียด *</Label>
                                    <Input value={merged.description ?? ""} onChange={(e) => set("description", e.target.value)} />
                                </div>
                            )}

                            <div className="space-y-1">
                                <Label>จำนวนเงิน (บาท) *</Label>
                                <Input type="number" min="0" step="0.01"
                                    value={merged.amount ?? ""}
                                    onChange={(e) => set("amount", Number(e.target.value) as unknown as UpdateCarExpenseInput["amount"])} />
                            </div>

                            {isFuel && (
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <Label>ราคา/ลิตร</Label>
                                        <Input type="number" min="0" step="0.01"
                                            value={merged.pricePerLiter ?? ""}
                                            onChange={(e) => set("pricePerLiter", Number(e.target.value) as unknown as UpdateCarExpenseInput["pricePerLiter"])} />
                                    </div>
                                    <div className="space-y-1">
                                        <Label>จำนวนลิตร</Label>
                                        <Input type="number" min="0" step="0.01"
                                            value={merged.liters ?? ""}
                                            onChange={(e) => set("liters", Number(e.target.value) as unknown as UpdateCarExpenseInput["liters"])} />
                                    </div>
                                </div>
                            )}

                            <div className="space-y-1">
                                <Label>หมายเหตุ</Label>
                                <Textarea rows={2} value={merged.notes ?? ""}
                                    onChange={(e) => set("notes", e.target.value)} />
                            </div>

                            <div className="flex justify-between pt-4 border-t">
                                <Button variant="outline" size="sm" onClick={cancelEdit}>ยกเลิก</Button>
                                <Button size="sm" disabled={isUpdating} className="gap-1.5" onClick={handleSave}>
                                    {isUpdating && <Loader2 className="h-3.5 w-3.5 animate-spin" />} บันทึก
                                </Button>
                            </div>
                        </div>
                    )}
                </SheetContent>
            </Sheet>

            <DeleteConfirm
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
                name={`${categoryLabel} - ${expense.carName} ${formatDate(expense.date)}`}
                onConfirm={handleDelete}
            />
        </>
    )
}

// ══════════════════════════════════════════════════════════════════════════════
//  Travel Expense Detail Sheet
// ══════════════════════════════════════════════════════════════════════════════

interface TravelExpenseDetailSheetProps {
    expense: TravelExpense | null
    open: boolean
    onOpenChange: (v: boolean) => void
    onUpdate: (id: string, input: UpdateTravelExpenseInput) => Promise<unknown>
    onRemove: (id: string) => void
    isUpdating?: boolean
}

export function TravelExpenseDetailSheet({
    expense,
    open,
    onOpenChange,
    onUpdate,
    onRemove,
    isUpdating,
}: TravelExpenseDetailSheetProps) {
    const [mode, setMode] = useState<"view" | "edit">("view")
    const [deleteOpen, setDeleteOpen] = useState(false)
    const [form, setForm] = useState<Partial<UpdateTravelExpenseInput>>({})
    const [selectedTollPlazaId, setSelectedTollPlazaId] = useState("")

    if (!expense) return null

    const merged = { ...expense, ...form }
    const isToll = merged.category === "toll"

    function startEdit() {
        setForm({})
        setSelectedTollPlazaId(expense!.category === "toll" ? plazaIdFromDescription(expense!.description) : "")
        setMode("edit")
    }

    function cancelEdit() {
        setForm({})
        setSelectedTollPlazaId("")
        setMode("view")
    }

    function set<K extends keyof UpdateTravelExpenseInput>(key: K, value: UpdateTravelExpenseInput[K]) {
        setForm((prev) => ({ ...prev, [key]: value }))
    }

    async function handleSave() {
        if (!merged.description) return
        await onUpdate(expense!.id, {
            tripName: merged.tripName,
            carName: merged.carName,
            licensePlate: merged.licensePlate,
            category: merged.category,
            amount: Number(merged.amount),
            date: merged.date,
            description: merged.description,
            distance: merged.distance ?? undefined,
            notes: merged.notes ?? undefined,
        })
        setMode("view")
        setForm({})
    }

    async function handleDelete() {
        onRemove(expense!.id)
        onOpenChange(false)
    }

    const categoryLabel = TRAVEL_CATEGORY_LABELS[expense.category] ?? expense.category

    return (
        <>
            <Sheet open={open} onOpenChange={(v) => { if (!v) cancelEdit(); onOpenChange(v) }}>
                <SheetContent className="w-full sm:max-w-md overflow-y-auto">
                    <SheetHeader className="pb-4">
                        <SheetTitle className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-sm px-2 py-0.5">
                                {categoryLabel}
                            </Badge>
                            <span className="text-lg font-bold text-primary">฿{formatTHB(expense.amount)}</span>
                        </SheetTitle>
                    </SheetHeader>

                    {mode === "view" ? (
                        <div className="space-y-4">
                            <InfoRow label="ทริป">{expense.tripName}</InfoRow>
                            <div className="grid grid-cols-2 gap-3">
                                <InfoRow label="วันที่">{formatDate(expense.date)}</InfoRow>
                                <InfoRow label="รถ">
                                    {expense.carName}
                                    <span className="ml-1 text-xs text-muted-foreground">({expense.licensePlate})</span>
                                </InfoRow>
                            </div>
                            <InfoRow label="รายละเอียด">{expense.description}</InfoRow>
                            {expense.distance && <InfoRow label="ระยะทาง">{expense.distance} กม.</InfoRow>}
                            {expense.notes && <InfoRow label="หมายเหตุ">{expense.notes}</InfoRow>}
                            <div className="flex justify-between pt-4 border-t">
                                <Button variant="outline" size="sm" className="gap-1.5 text-destructive hover:text-destructive"
                                    onClick={() => setDeleteOpen(true)}>
                                    <Trash2 className="h-3.5 w-3.5" /> ลบ
                                </Button>
                                <Button size="sm" className="gap-1.5" onClick={startEdit}>
                                    <Pencil className="h-3.5 w-3.5" /> แก้ไข
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <Label>ชื่อทริป *</Label>
                                <Input value={merged.tripName ?? ""} onChange={(e) => set("tripName", e.target.value)} />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <Label>ชื่อรถ *</Label>
                                    <Input value={merged.carName ?? ""} onChange={(e) => set("carName", e.target.value)} />
                                </div>
                                <div className="space-y-1">
                                    <Label>ทะเบียน *</Label>
                                    <Input value={merged.licensePlate ?? ""} onChange={(e) => set("licensePlate", e.target.value)} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <Label>ประเภท *</Label>
                                    <Select value={merged.category}
                                        onValueChange={(v) => setForm((p) => ({ ...p, category: v as TravelExpenseCategory, description: "" }))}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {(Object.entries(TRAVEL_CATEGORY_LABELS) as [TravelExpenseCategory, string][]).map(([v, l]) => (
                                                <SelectItem key={v} value={v}>{l}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1">
                                    <Label>วันที่ *</Label>
                                    <Input type="date" value={merged.date ?? ""} onChange={(e) => set("date", e.target.value)} />
                                </div>
                            </div>

                            {isToll ? (
                                <div className="space-y-1">
                                    <Label>ด่านทางด่วน *</Label>
                                    <TollPlazaSelector
                                        value={selectedTollPlazaId}
                                        onChange={(id, desc) => { setSelectedTollPlazaId(id); set("description", desc) }}
                                    />
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    <Label>รายละเอียด *</Label>
                                    <Input value={merged.description ?? ""} onChange={(e) => set("description", e.target.value)} />
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <Label>จำนวนเงิน (บาท) *</Label>
                                    <Input type="number" min="0" step="0.01"
                                        value={merged.amount ?? ""}
                                        onChange={(e) => set("amount", Number(e.target.value) as unknown as UpdateTravelExpenseInput["amount"])} />
                                </div>
                                <div className="space-y-1">
                                    <Label>ระยะทาง (กม.)</Label>
                                    <Input type="number" min="0"
                                        value={merged.distance ?? ""}
                                        onChange={(e) => set("distance", Number(e.target.value) as unknown as UpdateTravelExpenseInput["distance"])} />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <Label>หมายเหตุ</Label>
                                <Textarea rows={2} value={merged.notes ?? ""}
                                    onChange={(e) => set("notes", e.target.value)} />
                            </div>

                            <div className="flex justify-between pt-4 border-t">
                                <Button variant="outline" size="sm" onClick={cancelEdit}>ยกเลิก</Button>
                                <Button size="sm" disabled={isUpdating} className="gap-1.5" onClick={handleSave}>
                                    {isUpdating && <Loader2 className="h-3.5 w-3.5 animate-spin" />} บันทึก
                                </Button>
                            </div>
                        </div>
                    )}
                </SheetContent>
            </Sheet>

            <DeleteConfirm
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
                name={`${expense.tripName} - ${categoryLabel}`}
                onConfirm={handleDelete}
            />
        </>
    )
}
