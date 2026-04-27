"use client";

import { useState } from "react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Wrench, Receipt, MapPin, Car, ChevronRight, Plus } from "lucide-react";
import { GasPriceWidget } from "@/components/car-service/GasPriceWidget";
import { CarExpenseForm, TravelExpenseForm } from "@/components/car-service/ExpenseForm";
import { CarExpenseList, TravelExpenseList } from "@/components/car-service/ExpenseList";
import { VehicleSelector } from "@/components/car-service/VehicleSelector";
import { useCarExpenses, useTravelExpenses } from "@/hooks/useCarExpenses";
import { useVehicles } from "@/hooks/useVehicles";
import { ThemeToggle } from "@/components/theme-toggle";
import { BackButton } from "@/components/back-button";

export default function CarServicePage() {
  const carExpenses = useCarExpenses();
  const travelExpenses = useTravelExpenses();
  const { vehicles } = useVehicles();
  const [selectedVehicleId, setSelectedVehicleId] = useState("");

  return (
    <main className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <BackButton />
          <h1 className="text-3xl font-bold mt-2">Car Service</h1>
          <p className="text-muted-foreground mt-1">ประวัติการบำรุงรักษาและค่าใช้จ่ายรถยนต์</p>
        </div>
        <ThemeToggle />
      </div>

      {/* Gas Price Widget */}
      <GasPriceWidget />

      {/* Tabs */}
      <Tabs defaultValue="expenses">
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

        {/* ---- Car Service History ---- */}
        <TabsContent value="service" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Wrench className="h-5 w-5 text-orange-500" />
                  ประวัติการซ่อมบำรุง
                </CardTitle>
                <Link href="/vehicles/new">
                  <Button variant="outline" size="sm" className="gap-1">
                    <Plus className="h-4 w-4" /> เพิ่มรถ
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label className="text-sm">เลือกรถที่ต้องการดูประวัติ</Label>
                <VehicleSelector
                  value={selectedVehicleId}
                  onChange={(id) => setSelectedVehicleId(id)}
                />
              </div>

              {selectedVehicleId ? (() => {
                const v = vehicles.find((v) => v.id === selectedVehicleId);
                return v ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between rounded-lg border p-3 bg-muted/40">
                      <div className="flex items-center gap-3">
                        <Car className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-sm">{v.brand} {v.model}</p>
                          <p className="text-xs text-muted-foreground font-mono">{v.licensePlate}</p>
                        </div>
                      </div>
                      <Link href={`/vehicles/${v.id}`}>
                        <Button variant="ghost" size="sm" className="gap-1 text-xs h-7">
                          ดูข้อมูลรถ <ChevronRight className="h-3 w-3" />
                        </Button>
                      </Link>
                    </div>
                    <div className="text-center py-8 text-muted-foreground">
                      <Wrench className="h-8 w-8 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">ยังไม่มีประวัติซ่อมบำรุงสำหรับรถคันนี้</p>
                      <p className="text-xs mt-1">ฟีเจอร์บันทึกการซ่อมบำรุงจะเปิดให้ใช้เร็วๆ นี้</p>
                    </div>
                  </div>
                ) : null;
              })() : (
                vehicles.length > 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Car className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">เลือกรถเพื่อดูประวัติการซ่อมบำรุง</p>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground space-y-3">
                    <Car className="h-8 w-8 mx-auto opacity-30" />
                    <p className="text-sm">เพิ่มข้อมูลรถก่อนเพื่อเริ่มบันทึกประวัติซ่อมบำรุง</p>
                    <Link href="/vehicles/new">
                      <Button size="sm" className="gap-1">
                        <Plus className="h-4 w-4" /> เพิ่มรถ
                      </Button>
                    </Link>
                  </div>
                )
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---- Car Expenses ---- */}
        <TabsContent value="expenses" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Receipt className="h-5 w-5 text-blue-500" />
                  ค่าใช้จ่ายรถ
                </CardTitle>
                <CarExpenseForm onAdd={carExpenses.addExpense} />
              </div>
            </CardHeader>
            <CardContent>
              <CarExpenseList
                expenses={carExpenses.expenses}
                totalAmount={carExpenses.totalAmount}
                onRemove={carExpenses.removeExpense}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---- Travel Expenses ---- */}
        <TabsContent value="travel" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MapPin className="h-5 w-5 text-green-500" />
                  ค่าเดินทาง
                </CardTitle>
                <TravelExpenseForm onAdd={travelExpenses.addExpense} />
              </div>
            </CardHeader>
            <CardContent>
              <TravelExpenseList
                expenses={travelExpenses.expenses}
                totalAmount={travelExpenses.totalAmount}
                onRemove={travelExpenses.removeExpense}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
}
