import { NextResponse } from "next/server"
import type { GasPriceData } from "@/types/car-service"

// ---- Thai Oil API (third-party, scrapes kapook.com) ----
interface ThaiOilEntry {
    name: string
    price: string
}
interface ThaiOilResponse {
    status: string
    response: {
        date: string
        stations: Record<string, Record<string, ThaiOilEntry>>
    }
}

// Fuels to show, in display order
const SELECTED: { key: string; label: string }[] = [
    { key: "gasohol_95", label: "แก๊สโซฮอล 95 E10" },
    { key: "gasohol_91", label: "แก๊สโซฮอล 91" },
    { key: "gasohol_e20", label: "แก๊สโซฮอล E20" },
    { key: "diesel", label: "ดีเซล B7" },
]

// Module-level price cache for computing daily change
let cachedPrices: Record<string, number> = {}
let cachedDate = ""

async function fetchLivePrices(): Promise<GasPriceData> {
    const res = await fetch("https://api.chnwt.dev/thai-oil-api/latest", {
        signal: AbortSignal.timeout(8000),
        next: { revalidate: 3600 },
    })
    if (!res.ok) throw new Error(`thai-oil-api ${res.status}`)

    const raw: ThaiOilResponse = await res.json()
    if (raw.status !== "success") throw new Error("API returned non-success")

    const ptt = raw.response.stations?.ptt
    if (!ptt) throw new Error("No PTT data")

    const date = raw.response.date
    const isNewDay = date !== cachedDate

    const prices = SELECTED.flatMap(({ key, label }) => {
        const entry = ptt[key]
        if (!entry) return []
        const price = parseFloat(entry.price)
        if (isNaN(price)) return []
        const prev = cachedPrices[key] ?? price
        const change = Math.round((price - prev) * 100) / 100
        if (isNewDay) cachedPrices[key] = price
        return [{ fuelType: label, pricePerLiter: price, change }]
    })

    if (isNewDay) cachedDate = date

    return {
        station: "PTT",
        date,
        prices,
        lastUpdated: new Date().toISOString(),
    }
}

// ---- Fallback: deterministic simulation (ใช้เมื่อ API ตอบไม่ได้) ----
const FALLBACK_BASE: Record<string, number> = {
    "แก๊สโซฮอล 95 E10": 43.04,
    "แก๊สโซฮอล 91": 39.38,
    "แก๊สโซฮอล E20": 37.04,
    "ดีเซล B7": 29.99,
}

function hashString(str: string): number {
    let h = 0
    for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0
    return Math.abs(h)
}

function getDailyVariation(label: string, date: Date): number {
    const seed =
        date.getFullYear() * 10000 +
        (date.getMonth() + 1) * 100 +
        date.getDate() +
        hashString(label)
    return Math.round(Math.sin(seed) * 50) / 100
}

function buildFallback(): GasPriceData {
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    const prices = Object.entries(FALLBACK_BASE).map(([label, base]) => {
        const price =
            Math.round((base + getDailyVariation(label, today)) * 100) / 100
        const prev =
            Math.round((base + getDailyVariation(label, yesterday)) * 100) / 100
        return {
            fuelType: label,
            pricePerLiter: price,
            change: Math.round((price - prev) * 100) / 100,
        }
    })

    return {
        station: "PTT (จำลอง)",
        date: today.toLocaleDateString("th-TH", {
            year: "numeric",
            month: "long",
            day: "numeric",
            timeZone: "Asia/Bangkok",
        }),
        prices,
        lastUpdated: new Date().toISOString(),
    }
}

// ---- Route ----
export async function GET() {
    try {
        const data = await fetchLivePrices()
        return NextResponse.json(data, {
            headers: {
                "Cache-Control":
                    "public, s-maxage=3600, stale-while-revalidate=7200",
            },
        })
    } catch {
        return NextResponse.json(buildFallback(), {
            headers: {
                "Cache-Control":
                    "public, s-maxage=1800, stale-while-revalidate=3600",
            },
        })
    }
}
