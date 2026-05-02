"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiJson } from "@/lib/api";
import type { CreateGarageInput, Garage, UpdateGarageInput } from "@/types/car-service";

const KEY = ["garages"] as const;

export function useGarages() {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: KEY,
    queryFn: () => apiJson<{ garages: Garage[] }>("/api/garages").then((d) => d.garages),
  });

  const createMutation = useMutation({
    mutationFn: (input: CreateGarageInput) =>
      apiJson<{ garage: Garage }>("/api/garages", {
        method: "POST",
        body: JSON.stringify(input),
      }).then((d) => d.garage),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...input }: UpdateGarageInput & { id: string }) =>
      apiJson<{ garage: Garage }>(`/api/garages/${id}`, {
        method: "PATCH",
        body: JSON.stringify(input),
      }).then((d) => d.garage),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiJson(`/api/garages/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });

  return {
    garages: query.data ?? [],
    isLoading: query.isLoading,
    addGarage: (input: CreateGarageInput) => createMutation.mutateAsync(input),
    updateGarage: (id: string, input: UpdateGarageInput) =>
      updateMutation.mutate({ id, ...input }),
    removeGarage: (id: string) => deleteMutation.mutate(id),
    isAdding: createMutation.isPending,
  };
}
