"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiJson } from "@/lib/api";
import type { Vehicle, CreateVehicleInput } from "@/types/car-service";

const VEHICLES_KEY = ["vehicles"] as const;

async function fetchVehicles(): Promise<Vehicle[]> {
  const data = await apiJson<{ vehicles: Vehicle[] }>("/api/vehicles");
  return data.vehicles;
}

async function createVehicle(input: CreateVehicleInput): Promise<Vehicle> {
  const data = await apiJson<{ vehicle: Vehicle }>("/api/vehicles", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return data.vehicle;
}

async function deleteVehicle(id: string): Promise<void> {
  await apiJson(`/api/vehicles/${id}`, { method: "DELETE" });
}

export function useVehicles() {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: VEHICLES_KEY,
    queryFn: fetchVehicles,
  });

  const createMutation = useMutation({
    mutationFn: createVehicle,
    onSuccess: () => qc.invalidateQueries({ queryKey: VEHICLES_KEY }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteVehicle,
    onSuccess: () => qc.invalidateQueries({ queryKey: VEHICLES_KEY }),
  });

  return {
    vehicles: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    addVehicle: (input: CreateVehicleInput) => createMutation.mutateAsync(input),
    removeVehicle: (id: string) => deleteMutation.mutate(id),
    isAdding: createMutation.isPending,
  };
}
