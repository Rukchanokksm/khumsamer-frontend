"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Plus } from "lucide-react"
import type {
    CreateCarExpenseInput,
    CreateTravelExpenseInput,
    ExpenseCategory,
    TravelExpenseCategory,
} from "@/types/car-service"
import { VehicleSelector } from "@/components/car-service/VehicleSelector"
import { CarWashPlaceSelector } from "@/components/car-service/CarWashPlaceSelector"

// ---- Car Expense Form ----
const CAR_EXPENSE_CATEGORIES: { value: ExpenseCategory; label: string }[] = [
    { value: "fuel", label: "เติมน้ำมัน" },
    { value: "parking", label: "ค่าจอดรถ" },
    { value: "toll", label: "ค่าทางด่วน" },
    { value: "insurance", label: "ค่าประกัน" },
    { value: "tax", label: "ค่าภาษีรถ" },
    { value: "wash", label: "ค่าล้างรถ" },
    { value: "accessories", label: "อุปกรณ์เสริม" },
    { value: "other", label: "อื่นๆ" },
]

const FUEL_PRESETS = [
    "SHELL GASOHOL V-POWER 95",
    "SHELL FUELSAVE GASOHOL FUELSAVE 95",
    "CALTEX TECHRON 95",
    "CALTEX GOLD TECHRON 95",
    "BANGCHAK GASOHOL EVO 95",
    "PT MAX GASOHOL 95",
] as const

interface CarExpenseFormProps {
    onAdd: (input: CreateCarExpenseInput) => void
}

export function CarExpenseForm({ onAdd }: CarExpenseFormProps) {
    const [open, setOpen] = useState(false)
    const [selectedVehicleId, setSelectedVehicleId] = useState("")
    const [selectedWashPlaceId, setSelectedWashPlaceId] = useState("")
    const [form, setForm] = useState<Partial<CreateCarExpenseInput>>({
        date: new Date().toISOString().split("T")[0],
        category: "fuel",
    })

    function set<K extends keyof CreateCarExpenseInput>(
        key: K,
        value: CreateCarExpenseInput[K],
    ) {
        setForm((prev) => ({ ...prev, [key]: value }))
    }

    function handleCategoryChange(v: ExpenseCategory) {
        setForm((prev) => ({
            ...prev,
            category: v,
            description: "",
        }))
        if (v !== "wash") setSelectedWashPlaceId("")
    }

    function handleAmountChange(val: string) {
        const num = Number(val)
        set("amount", num as unknown as CreateCarExpenseInput["amount"])
        if (form.category === "fuel" && form.pricePerLiter && num > 0) {
            const pl = Number(form.pricePerLiter)
            if (pl > 0) {
                set("liters", +((num / pl).toFixed(2)) as unknown as CreateCarExpenseInput["liters"])
            }
        }
    }

    function handlePricePerLiterChange(val: string) {
        const num = Number(val)
        set("pricePerLiter", num as unknown as CreateCarExpenseInput["pricePerLiter"])
        if (form.category === "fuel" && form.amount && num > 0) {
            const amt = Number(form.amount)
            if (amt > 0) {
                set("liters", +((amt / num).toFixed(2)) as unknown as CreateCarExpenseInput["liters"])
            }
        }
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        const isWash = form.category === "wash"
        if (
            !form.carName ||
            !form.licensePlate ||
            !form.amount ||
            !form.date ||
            !form.category
        )
            return
        if (!form.description && !(isWash && selectedWashPlaceId)) return

        onAdd({
            carName: form.carName,
            licensePlate: form.licensePlate,
            category: form.category,
            amount: Number(form.amount),
            date: form.date,
            description: form.description ?? "",
            liters: form.liters ? Number(form.liters) : undefined,
            pricePerLiter: form.pricePerLiter ? Number(form.pricePerLiter) : undefined,
            notes: form.notes,
        })

        setOpen(false)
        setSelectedVehicleId("")
        setSelectedWashPlaceId("")
        setForm({ date: new Date().toISOString().split("T")[0], category: "fuel" })
    }

    const isFuel = form.category === "fuel"
    const isWash = form.category === "wash"

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" className="gap-1">
                    <Plus className="h-4 w-4" /> เพิ่มรายจ่าย
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>บันทึกค่าใช้จ่ายรถ</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                    <div className="space-y-1">
                        <Label>เลือกรถ</Label>
                        <VehicleSelector
                            value={selectedVehicleId}
                            onChange={(id, carName, licensePlate) => {
                                setSelectedVehicleId(id)
                                set("carName", carName)
                                set("licensePlate", licensePlate)
                            }}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <Label>ชื่อรถ *</Label>
                            <Input
                                placeholder="เช่น Subaru Forester"
                                value={form.carName ?? ""}
                                onChange={(e) => set("carName", e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-1">
                            <Label>ทะเบียนรถ *</Label>
                            <Input
                                placeholder="เช่น กข 1234"
                                value={form.licensePlate ?? ""}
                                onChange={(e) => set("licensePlate", e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <Label>ประเภท *</Label>
                            <Select
                                value={form.category}
                                onValueChange={(v) => handleCategoryChange(v as ExpenseCategory)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {CAR_EXPENSE_CATEGORIES.map((c) => (
                                        <SelectItem key={c.value} value={c.value}>
                                            {c.label}
                                        </SelectItem>
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

                    {/* Description — varies by category */}
                    {isFuel ? (
                        <div className="space-y-1">
                            <Label>ประเภทน้ำมัน / ปั้ม *</Label>
                            <Select
                                value={form.description ?? ""}
                                onValueChange={(v) => set("description", v)}
                                required
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="เลือกประเภทน้ำมัน" />
                                </SelectTrigger>
                                <SelectContent>
                                    {FUEL_PRESETS.map((f) => (
                                        <SelectItem key={f} value={f}>
                                            {f}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    ) : isWash ? (
                        <div className="space-y-1">
                            <Label>สถานที่ล้างรถ *</Label>
                            <CarWashPlaceSelector
                                value={selectedWashPlaceId}
                                onChange={(id, description) => {
                                    setSelectedWashPlaceId(id)
                                    set("description", description as CreateCarExpenseInput["description"])
                                }}
                            />
                        </div>
                    ) : (
                        <div className="space-y-1">
                            <Label>รายละเอียด *</Label>
                            <Input
                                placeholder="เช่น ต่อพ.ร.บ., เปลี่ยนล้อ, ค่าจอดรถ"
                                value={form.description ?? ""}
                                onChange={(e) => set("description", e.target.value)}
                                required
                            />
                        </div>
                    )}

                    <div className="space-y-1">
                        <Label>จำนวนเงิน (บาท) *</Label>
                        <Input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            value={form.amount ?? ""}
                            onChange={(e) => handleAmountChange(e.target.value)}
                            required
                        />
                    </div>

                    {isFuel && (
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label>ราคา/ลิตร (บาท)</Label>
                                <Input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={form.pricePerLiter ?? ""}
                                    onChange={(e) => handlePricePerLiterChange(e.target.value)}
                                />
                            </div>
                            <div className="space-y-1">
                                <Label>
                                    จำนวนลิตร
                                    {form.pricePerLiter && form.amount
                                        ? <span className="ml-1 text-xs text-muted-foreground font-normal">(คำนวณอัตโนมัติ)</span>
                                        : null}
                                </Label>
                                <Input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={form.liters ?? ""}
                                    onChange={(e) =>
                                        set("liters", Number(e.target.value) as unknown as CreateCarExpenseInput["liters"])
                                    }
                                />
                            </div>
                        </div>
                    )}

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
    )
}

// ---- Travel Expense Form ----
// fuel / toll / parking ย้ายไปอยู่ใน CarExpense แล้ว
const TRAVEL_CATEGORIES: { value: TravelExpenseCategory; label: string }[] = [
    { value: "accommodation", label: "ค่าที่พัก" },
    { value: "food", label: "ค่าอาหาร" },
    { value: "ferry", label: "ค่าเรือ/เฟอร์รี่" },
    { value: "other", label: "อื่นๆ" },
]

interface TravelExpenseFormProps {
    onAdd: (input: CreateTravelExpenseInput) => void
}

export function TravelExpenseForm({ onAdd }: TravelExpenseFormProps) {
    const [open, setOpen] = useState(false)
    const [selectedVehicleId, setSelectedVehicleId] = useState("")
    const [form, setForm] = useState<Partial<CreateTravelExpenseInput>>({
        date: new Date().toISOString().split("T")[0],
        category: "accommodation",
    })

    function set<K extends keyof CreateTravelExpenseInput>(
        key: K,
        value: CreateTravelExpenseInput[K],
    ) {
        setForm((prev) => ({ ...prev, [key]: value }))
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (
            !form.tripName ||
            !form.carName ||
            !form.licensePlate ||
            !form.amount ||
            !form.date ||
            !form.description ||
            !form.category
        )
            return

        onAdd({
            tripName: form.tripName,
            carName: form.carName,
            licensePlate: form.licensePlate,
            category: form.category,
            amount: Number(form.amount),
            date: form.date,
            description: form.description,
            distance: form.distance ? Number(form.distance) : undefined,
            notes: form.notes,
        })

        setOpen(false)
        setSelectedVehicleId("")
        setForm({ date: new Date().toISOString().split("T")[0], category: "accommodation" })
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" className="gap-1">
                    <Plus className="h-4 w-4" /> เพิ่มค่าเดินทาง
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>บันทึกค่าเดินทาง</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                    <div className="space-y-1">
                        <Label>ชื่อทริป *</Label>
                        <Input
                            placeholder="เช่น เที่ยวเชียงใหม่ มี.ค. 68"
                            value={form.tripName ?? ""}
                            onChange={(e) => set("tripName", e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-1">
                        <Label>เลือกรถ</Label>
                        <VehicleSelector
                            value={selectedVehicleId}
                            onChange={(id, carName, licensePlate) => {
                                setSelectedVehicleId(id)
                                set("carName", carName)
                                set("licensePlate", licensePlate)
                            }}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <Label>ชื่อรถ *</Label>
                            <Input
                                placeholder="เช่น Subaru Forester"
                                value={form.carName ?? ""}
                                onChange={(e) => set("carName", e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-1">
                            <Label>ทะเบียนรถ *</Label>
                            <Input
                                placeholder="เช่น กข 1234"
                                value={form.licensePlate ?? ""}
                                onChange={(e) => set("licensePlate", e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <Label>ประเภท *</Label>
                            <Select
                                value={form.category}
                                onValueChange={(v) => set("category", v as TravelExpenseCategory)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {TRAVEL_CATEGORIES.map((c) => (
                                        <SelectItem key={c.value} value={c.value}>
                                            {c.label}
                                        </SelectItem>
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
                            placeholder="เช่น โรงแรม A, ร้านข้าวต้ม, เฟอร์รี่ขาไป"
                            value={form.description ?? ""}
                            onChange={(e) => set("description", e.target.value)}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <Label>จำนวนเงิน (บาท) *</Label>
                            <Input
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                                value={form.amount ?? ""}
                                onChange={(e) =>
                                    set("amount", Number(e.target.value) as unknown as CreateTravelExpenseInput["amount"])
                                }
                                required
                            />
                        </div>
                        <div className="space-y-1">
                            <Label>ระยะทาง (กม.)</Label>
                            <Input
                                type="number"
                                min="0"
                                placeholder="0"
                                value={form.distance ?? ""}
                                onChange={(e) =>
                                    set("distance", Number(e.target.value) as unknown as CreateTravelExpenseInput["distance"])
                                }
                            />
                        </div>
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
    )
}
