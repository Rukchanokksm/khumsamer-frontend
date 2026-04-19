"use client"

import { useState, useCallback } from "react"
import type {
    CarExpense,
    TravelExpense,
    CreateCarExpenseInput,
    CreateTravelExpenseInput,
} from "@/types/car-service"

function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

const now = () => new Date().toISOString()

export function useCarExpenses() {
    const [expenses, setExpenses] = useState<CarExpense[]>([])

    const addExpense = useCallback((input: CreateCarExpenseInput) => {
        const expense: CarExpense = {
            ...input,
            id: generateId(),
            createdAt: now(),
            updatedAt: now(),
        }
        setExpenses((prev) => [expense, ...prev])
        return expense
    }, [])

    const removeExpense = useCallback((id: string) => {
        setExpenses((prev) => prev.filter((e) => e.id !== id))
    }, [])

    const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0)

    return { expenses, addExpense, removeExpense, totalAmount }
}

export function useTravelExpenses() {
    const [expenses, setExpenses] = useState<TravelExpense[]>([])

    const addExpense = useCallback((input: CreateTravelExpenseInput) => {
        const expense: TravelExpense = {
            ...input,
            id: generateId(),
            createdAt: now(),
            updatedAt: now(),
        }
        setExpenses((prev) => [expense, ...prev])
        return expense
    }, [])

    const removeExpense = useCallback((id: string) => {
        setExpenses((prev) => prev.filter((e) => e.id !== id))
    }, [])

    const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0)

    return { expenses, addExpense, removeExpense, totalAmount }
}
