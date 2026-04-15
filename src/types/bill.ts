export type BillStatus = "pending" | "paid" | "overdue";
export type BillCategory =
  | "electricity"
  | "water"
  | "internet"
  | "phone"
  | "insurance"
  | "rent"
  | "other";

export interface Bill {
  id: string;
  name: string;
  category: BillCategory;
  amount: number;
  dueDate: string;
  status: BillStatus;
  paidDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type CreateBillInput = Omit<Bill, "id" | "createdAt" | "updatedAt">;
export type UpdateBillInput = Partial<CreateBillInput>;
