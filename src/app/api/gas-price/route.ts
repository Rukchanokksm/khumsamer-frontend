import { NextResponse } from "next/server";
import type { GasPriceData } from "@/types/car-service";

// Shell Thailand fuel price baseline (THB/liter) — updated periodically
// Source simulation based on Department of Energy Business (กรมธุรกิจพลังงาน) reference
const BASE_PRICES: Record<string, number> = {
  "Shell V-Power Nitro+ 95": 44.95,
  "Shell FuelSave 91": 39.94,
  "Shell V-Power Diesel": 33.99,
  "Shell FuelSave Diesel": 29.99,
};

// Small deterministic daily variation (±0.5 THB) based on date seed
function getDailyVariation(fuelType: string, date: Date): number {
  const seed =
    date.getFullYear() * 10000 +
    (date.getMonth() + 1) * 100 +
    date.getDate() +
    fuelType.charCodeAt(0);
  const pseudo = Math.sin(seed) * 0.5;
  return Math.round(pseudo * 20) / 100; // ±0.20 THB
}

export async function GET() {
  try {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const prices = Object.entries(BASE_PRICES).map(([fuelType, base]) => {
      const todayVariation = getDailyVariation(fuelType, today);
      const yesterdayVariation = getDailyVariation(fuelType, yesterday);
      const price = Math.round((base + todayVariation) * 100) / 100;
      const prevPrice = Math.round((base + yesterdayVariation) * 100) / 100;
      const change = Math.round((price - prevPrice) * 100) / 100;

      return {
        fuelType,
        pricePerLiter: price,
        change,
      };
    });

    const dateStr = today.toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "Asia/Bangkok",
    });

    const data: GasPriceData = {
      station: "Shell",
      date: dateStr,
      prices,
      lastUpdated: new Date().toISOString(),
    };

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "ไม่สามารถดึงข้อมูลราคาน้ำมันได้" },
      { status: 500 }
    );
  }
}
