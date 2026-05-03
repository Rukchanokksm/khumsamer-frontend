"use client"

import { useGasPrice } from "@/hooks/useGasPrice"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Fuel, RefreshCw, TrendingDown, TrendingUp, Minus } from "lucide-react"

function formatTHB(amount: number): string {
    return amount.toLocaleString("th-TH", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })
}

const FUEL_COLORS: Record<string, string> = {
    "แก๊สโซฮอล 95 E10":
        "bg-red-50 border-red-200 text-red-700 dark:bg-red-500/10 dark:border-red-500/30 dark:text-red-300",
    "แก๊สโซฮอล 91":
        "bg-yellow-50 border-yellow-200 text-yellow-700 dark:bg-yellow-500/10 dark:border-yellow-500/30 dark:text-yellow-300",
    "แก๊สโซฮอล E20":
        "bg-green-50 border-green-200 text-green-700 dark:bg-green-500/10 dark:border-green-500/30 dark:text-green-300",
    "ดีเซล B7":
        "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-500/10 dark:border-blue-500/30 dark:text-blue-300",
}

export function GasPriceWidget() {
    const { data, isLoading, isError, refetch, isFetching } = useGasPrice()

    if (isLoading) {
        return (
            <Card className="border-orange-200 dark:border-orange-500/30">
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                        <Fuel className="h-5 w-5" />
                        ราคาน้ำมัน PTT วันนี้
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[1, 2, 3, 4].map((i) => (
                            <div
                                key={i}
                                className="h-20 rounded-lg bg-muted animate-pulse"
                            />
                        ))}
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (isError || !data) {
        return (
            <Card className="border-red-200 dark:border-red-500/30">
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                        <Fuel className="h-5 w-5" />
                        ราคาน้ำมัน PTT
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        ไม่สามารถโหลดข้อมูลราคาน้ำมันได้
                    </p>
                    <button
                        onClick={() => refetch()}
                        className="mt-2 text-sm text-primary hover:underline flex items-center gap-1"
                    >
                        <RefreshCw className="h-3 w-3" /> ลองอีกครั้ง
                    </button>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="border-orange-200 dark:border-orange-500/30">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                        <Fuel className="h-5 w-5" />
                        ราคาน้ำมัน {data.station} วันนี้
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                            {data.date}
                        </span>
                        <button
                            onClick={() => refetch()}
                            disabled={isFetching}
                            className="text-muted-foreground hover:text-foreground transition-colors"
                            title="รีเฟรชราคา"
                        >
                            <RefreshCw
                                className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`}
                            />
                        </button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {data.prices.map((price) => (
                        <div
                            key={price.fuelType}
                            className={`rounded-lg border p-3 ${
                                FUEL_COLORS[price.fuelType] ??
                                "bg-gray-50 border-gray-200 text-gray-700 dark:bg-gray-500/10 dark:border-gray-500/30 dark:text-gray-300"
                            }`}
                        >
                            <p className="text-xs font-medium leading-tight mb-1">
                                {price.fuelType}
                            </p>
                            <p className="text-xl font-bold">
                                ฿{formatTHB(price.pricePerLiter)}
                            </p>
                            <p className="text-[10px] text-muted-foreground mb-1">
                                ต่อลิตร
                            </p>
                            <div className="flex items-center gap-0.5">
                                {price.change > 0 ? (
                                    <>
                                        <TrendingUp className="h-3 w-3 text-red-500 dark:text-red-400" />
                                        <span className="text-[10px] text-red-500 dark:text-red-400">
                                            +{formatTHB(price.change)}
                                        </span>
                                    </>
                                ) : price.change < 0 ? (
                                    <>
                                        <TrendingDown className="h-3 w-3 text-green-500 dark:text-green-400" />
                                        <span className="text-[10px] text-green-500 dark:text-green-400">
                                            {formatTHB(price.change)}
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <Minus className="h-3 w-3 text-muted-foreground" />
                                        <span className="text-[10px] text-muted-foreground">
                                            คงที่
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
                <p className="text-[10px] text-muted-foreground mt-3 text-right">
                    * ราคาขายปลีก กทม.และปริมณฑล — ที่มา: kapook.com
                    {data.station.includes("จำลอง") ? " (ข้อมูลจำลอง)" : ""}
                </p>
            </CardContent>
        </Card>
    )
}
