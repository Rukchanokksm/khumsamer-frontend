export type BillCategory =
  | "water"
  | "electricity"
  | "rent"
  | "food"
  | "car_installment"
  | "item_installment"
  | "internet"
  | "mobile"
  | "insurance"
  | "other";

export type BillStatus = "pending" | "paid" | "overdue";

export interface Bill {
  id: string;
  name: string;
  category: BillCategory;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: BillStatus;
  isInstallment: boolean;
  installmentNo?: number;
  totalInstallments?: number;
  notes?: string;
  receiptUrl?: string;
  receiptPath?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBillInput {
  name: string;
  category: BillCategory;
  amount: number;
  dueDate: string;
  isInstallment?: boolean;
  installmentNo?: number;
  totalInstallments?: number;
  notes?: string;
}

export interface UpdateBillInput {
  name?: string;
  category?: BillCategory;
  amount?: number;
  dueDate?: string;
  status?: "pending" | "paid";
  paidDate?: string | null;
  isInstallment?: boolean;
  installmentNo?: number | null;
  totalInstallments?: number | null;
  notes?: string | null;
}
