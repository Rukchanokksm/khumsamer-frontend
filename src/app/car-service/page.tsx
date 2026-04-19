"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wrench, Receipt, MapPin } from "lucide-react";
import { GasPriceWidget } from "@/components/car-service/GasPriceWidget";
import { CarExpenseForm, TravelExpenseForm } from "@/components/car-service/ExpenseForm";
import { CarExpenseList, TravelExpenseList } from "@/components/car-service/ExpenseList";
import { useCarExpenses, useTravelExpenses } from "@/hooks/useCarExpenses";
import { ThemeToggle } from "@/components/theme-toggle";

export default function CarServicePage() {
  const carExpenses = useCarExpenses();
  const travelExpenses = useTravelExpenses();

  return (
    <main className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Car Service</h1>
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
        <TabsContent value="service" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Wrench className="h-5 w-5 text-orange-500" />
                  ประวัติการซ่อมบำรุง
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Wrench className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p>ยังไม่มีประวัติการซ่อมบำรุง</p>
                <p className="text-sm mt-1">ฟีเจอร์นี้จะเปิดให้ใช้เร็วๆ นี้</p>
              </div>
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
