"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch, apiJson } from "@/lib/api";
import type { CarRepair, CreateCarRepairInput, UpdateCarRepairInput } from "@/types/car-service";

const KEY = ["car-repairs"] as const;

export function useCarRepairs() {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: KEY,
    queryFn: () =>
      apiJson<{ repairs: CarRepair[] }>("/api/car-repairs").then((d) => d.repairs),
  });

  const createMutation = useMutation({
    mutationFn: (input: CreateCarRepairInput) =>
      apiJson<{ repair: CarRepair }>("/api/car-repairs", {
        method: "POST",
        body: JSON.stringify(input),
      }).then((d) => d.repair),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...input }: UpdateCarRepairInput & { id: string }) =>
      apiJson<{ repair: CarRepair }>(`/api/car-repairs/${id}`, {
        method: "PATCH",
        body: JSON.stringify(input),
      }).then((d) => d.repair),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiJson(`/api/car-repairs/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });

  const uploadReceiptMutation = useMutation({
    mutationFn: async ({ id, file }: { id: string; file: File }) => {
      const form = new FormData();
      form.append("receipt", file);
      const res = await apiFetch(`/api/car-repairs/${id}/receipt`, {
        method: "POST",
        body: form,
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error ?? `Upload failed (${res.status})`);
      return data as { receiptUrl: string; receiptPath: string };
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });

  const removeReceiptMutation = useMutation({
    mutationFn: (id: string) =>
      apiJson(`/api/car-repairs/${id}/receipt`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });

  return {
    repairs: query.data ?? [],
    isLoading: query.isLoading,
    addRepair: (input: CreateCarRepairInput) => createMutation.mutateAsync(input),
    updateRepair: (id: string, input: UpdateCarRepairInput) =>
      updateMutation.mutateAsync({ id, ...input }),
    removeRepair: (id: string) => deleteMutation.mutate(id),
    uploadReceipt: (id: string, file: File) =>
      uploadReceiptMutation.mutate({ id, file }),
    removeReceipt: (id: string) => removeReceiptMutation.mutate(id),
    isCreating: createMutation.isPending,
    isUploading: uploadReceiptMutation.isPending,
    uploadingId: uploadReceiptMutation.variables?.id ?? null,
  };
}
