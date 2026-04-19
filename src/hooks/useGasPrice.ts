"use client"

import { useQuery } from "@tanstack/react-query"
import type { GasPriceData } from "@/types/car-service"

async function fetchGasPrice(): Promise<GasPriceData> {
    const res = await fetch("/api/gas-price")
    if (!res.ok) throw new Error("ไม่สามารถดึงข้อมูลราคาน้ำมัน Shell ได้")
    return res.json()
}

export function useGasPrice() {
    return useQuery<GasPriceData>({
        queryKey: ["gas-price", "shell"],
        queryFn: fetchGasPrice,
        staleTime: 1000 * 60 * 60, // 1 hour
        refetchOnWindowFocus: false,
    })
}
