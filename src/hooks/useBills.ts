"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch, apiJson } from "@/lib/api";
import type { Bill, CreateBillInput, UpdateBillInput } from "@/types/bill";

const KEY = ["bills"] as const;

export function useBills() {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: KEY,
    queryFn: () =>
      apiJson<{ bills: Bill[] }>("/api/bills").then((d) => d.bills),
  });

  const createMutation = useMutation({
    mutationFn: (input: CreateBillInput) =>
      apiJson<{ bill: Bill }>("/api/bills", {
        method: "POST",
        body: JSON.stringify(input),
      }).then((d) => d.bill),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...input }: UpdateBillInput & { id: string }) =>
      apiJson<{ bill: Bill }>(`/api/bills/${id}`, {
        method: "PATCH",
        body: JSON.stringify(input),
      }).then((d) => d.bill),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      apiJson(`/api/bills/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });

  const uploadReceiptMutation = useMutation({
    mutationFn: async ({ id, file }: { id: string; file: File }) => {
      const form = new FormData();
      form.append("receipt", file);
      const res = await apiFetch(`/api/bills/${id}/receipt`, {
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
      apiJson(`/api/bills/${id}/receipt`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });

  return {
    bills: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    addBill: (input: CreateBillInput) => createMutation.mutate(input),
    updateBill: (id: string, input: UpdateBillInput) =>
      updateMutation.mutate({ id, ...input }),
    markPaid: (id: string) =>
      updateMutation.mutate({ id, status: "paid" }),
    removeBill: (id: string) => deleteMutation.mutate(id),
    uploadReceipt: (id: string, file: File) =>
      uploadReceiptMutation.mutate({ id, file }),
    removeReceipt: (id: string) => removeReceiptMutation.mutate(id),
    isUploading: uploadReceiptMutation.isPending,
    isUpdating: updateMutation.isPending,
  };
}
