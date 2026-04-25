"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiJson } from "@/lib/api";
import type {
  CarExpense,
  TravelExpense,
  CreateCarExpenseInput,
  CreateTravelExpenseInput,
} from "@/types/car-service";

const CAR_KEY = ["car-expenses"] as const;
const TRAVEL_KEY = ["travel-expenses"] as const;

async function fetchCarExpenses(): Promise<CarExpense[]> {
  const data = await apiJson<{ expenses: CarExpense[] }>("/api/car-expenses");
  return data.expenses;
}

async function createCarExpense(
  input: CreateCarExpenseInput,
): Promise<CarExpense> {
  const data = await apiJson<{ expense: CarExpense }>("/api/car-expenses", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return data.expense;
}

async function deleteCarExpense(id: string): Promise<void> {
  await apiJson(`/api/car-expenses/${id}`, { method: "DELETE" });
}

async function fetchTravelExpenses(): Promise<TravelExpense[]> {
  const data = await apiJson<{ expenses: TravelExpense[] }>(
    "/api/travel-expenses",
  );
  return data.expenses;
}

async function createTravelExpense(
  input: CreateTravelExpenseInput,
): Promise<TravelExpense> {
  const data = await apiJson<{ expense: TravelExpense }>(
    "/api/travel-expenses",
    { method: "POST", body: JSON.stringify(input) },
  );
  return data.expense;
}

async function deleteTravelExpense(id: string): Promise<void> {
  await apiJson(`/api/travel-expenses/${id}`, { method: "DELETE" });
}

export function useCarExpenses() {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: CAR_KEY,
    queryFn: fetchCarExpenses,
  });

  const createMutation = useMutation({
    mutationFn: createCarExpense,
    onSuccess: () => qc.invalidateQueries({ queryKey: CAR_KEY }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCarExpense,
    onSuccess: () => qc.invalidateQueries({ queryKey: CAR_KEY }),
  });

  const expenses = query.data ?? [];
  const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);

  return {
    expenses,
    totalAmount,
    isLoading: query.isLoading,
    isError: query.isError,
    addExpense: (input: CreateCarExpenseInput) => createMutation.mutate(input),
    removeExpense: (id: string) => deleteMutation.mutate(id),
  };
}

export function useTravelExpenses() {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: TRAVEL_KEY,
    queryFn: fetchTravelExpenses,
  });

  const createMutation = useMutation({
    mutationFn: createTravelExpense,
    onSuccess: () => qc.invalidateQueries({ queryKey: TRAVEL_KEY }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTravelExpense,
    onSuccess: () => qc.invalidateQueries({ queryKey: TRAVEL_KEY }),
  });

  const expenses = query.data ?? [];
  const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);

  return {
    expenses,
    totalAmount,
    isLoading: query.isLoading,
    isError: query.isError,
    addExpense: (input: CreateTravelExpenseInput) =>
      createMutation.mutate(input),
    removeExpense: (id: string) => deleteMutation.mutate(id),
  };
}
