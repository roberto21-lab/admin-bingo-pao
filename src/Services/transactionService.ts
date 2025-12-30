// src/services/transactionService.ts
import { api } from "./api";

const API_URL = import.meta.env.VITE_API_URL;

// Ajusta el tipo según tu modelo de Transaction en el backend
export type Transaction = {
  id: string;
  wallet_id: string;
  user_name: string;
  user_email: string;
  transaction_type: string; // 👈 ahora es string
  currency: string;
  amount: number;
  status: string;
  created_at: string;
};


export type PaginatedResponse<T> = {
  docs: T[];
  totalDocs: number;
  limit: number;
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  nextPage?: number | null;
  prevPage?: number | null;
};


// 🔹 Tipo de la respuesta del controlador updateTransactionStatus
export type UpdateTransactionStatusResponse = {
  transaction: Transaction;
  wallet: {
    id: string;
    user_id: string;
    currency: string;
    balance: number;
    frozen_balance: number;
  };
};


// payload extra opcional
type UpdateTxExtraPayload = {
  wallet_id?: string;
  amount?: number;
  note?: string;
  operation?: "sumar" | "restar";
  // cualquier otro campo que tu backend espere
};

export async function getTransactionsService(params?: {
  page?: number;   // 1-based
  limit?: number;
}): Promise<PaginatedResponse<Transaction>> {
  const url = `${API_URL}/transactions`;

  const response = await api.get<PaginatedResponse<Transaction>>(url, {
    params: {
      page: params?.page ?? 1,
      limit: params?.limit ?? 10,
    },
  });

  return response.data;
}

// 🔹 Solo recargas (recharge)
export async function getRechargeTransactionsService(params?: {
  page?: number;
  limit?: number;
}): Promise<Transaction[]> {
  const data = await createTransactionRecharge(params);
  return (data.docs ?? []).filter(
    (t) => (t.transaction_type || "").toLowerCase() === "recharge"
  );
}


// 🔹 Solo retiros (withdraw / withdrawal)

// 🔹 Solo retiros (withdraw / withdrawal)

export async function getWithdrawTransactionsService(params?: {
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<Transaction>> {
  const data = await getTransactionsService(params);

  const docs = (data.docs ?? []).filter((t) => {
    const tt = (t.transaction_type || "").toLowerCase();
    return tt === "withdraw" || tt === "withdrawal";
  });

  // 👇 devolvemos lo mismo que devuelve getTransactionsService
  return { ...data, docs };
}



export async function getTransactionByIdService(id: string): Promise<Transaction> {
  const url = `${API_URL}/transactions/${id}`;
  const token = localStorage.getItem("token");

  const response = await api.get<Transaction>(url, {
    headers: token
      ? { Authorization: `Bearer ${token}` }
      : undefined,
  });

  return response.data;
}



// 🔹 Actualizar el status de una transacción
export async function updateTransactionStatusService(
  id: string,
  status_id: string,
  extra?: UpdateTxExtraPayload
): Promise<UpdateTransactionStatusResponse> {
  const url = `${API_URL}/transactions/${id}/status`;

  const body = {
    status_id,
    ...(extra || {}), 
  };

  const response = await api.put<UpdateTransactionStatusResponse>(url, body);

  return response.data;
}


export type CreateAdminTransactionPayload = {
  wallet_id: string;
  transaction_type_id: string;
  amount: number;              // número, en el back lo conviertes a Decimal128
  currency_id: string;
  isAdminTransaction: boolean; // para que el backend sepa que es admin
  metadata?: Record<string, unknown>;
};

// Tipo de respuesta del controlador createAdminTransaction
export type CreateAdminTransactionResponse = {
  success: boolean;
  transaction: Transaction;
};


// 👇 tipo del payload para crear transacción admin


// 👇 servicio que llama al endpoint createAdminTransaction
export async function createAdminTransactionService(
  payload: CreateAdminTransactionPayload
): Promise<CreateAdminTransactionResponse> {
  const url = `${API_URL}/transactions/admin`;
  const token = localStorage.getItem("token");

  const response = await api.post<CreateAdminTransactionResponse>(url, payload, {
    headers: token
      ? { Authorization: `Bearer ${token}` }
      : undefined,
  });

  return response.data;
}

function createTransactionRecharge(params: { page?: number; limit?: number; } | undefined) {
  throw new Error("Function not implemented.");
}

