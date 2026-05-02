"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiJson } from "@/lib/api";
import type {
  CarWashPlace,
  CreateCarWashPlaceInput,
  UpdateCarWashPlaceInput,
} from "@/types/car-service";

const KEY = ["car-wash-places"] as const;

export function useCarWashPlaces() {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: KEY,
    queryFn: () =>
      apiJson<{ places: CarWashPlace[] }>("/api/car-wash-places").then(
        (d) => d.places,
      ),
  });

  const createMutation = useMutation({
    mutationFn: (input: CreateCarWashPlaceInput) =>
      apiJson<{ place: CarWashPlace }>("/api/car-wash-places", {
        method: "POST",
        body: JSON.stringify(input),
      }).then((d) => d.place),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...input }: UpdateCarWashPlaceInput & { id: string }) =>
      apiJson<{ place: CarWashPlace }>(`/api/car-wash-places/${id}`, {
        method: "PATCH",
        body: JSON.stringify(input),
      }).then((d) => d.place),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      apiJson(`/api/car-wash-places/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });

  return {
    places: query.data ?? [],
    isLoading: query.isLoading,
    addPlace: (input: CreateCarWashPlaceInput) =>
      createMutation.mutateAsync(input),
    updatePlace: (id: string, input: UpdateCarWashPlaceInput) =>
      updateMutation.mutateAsync({ id, ...input }),
    removePlace: (id: string) => deleteMutation.mutateAsync(id),
    isAdding: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
