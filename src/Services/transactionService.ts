// src/services/transactionService.ts
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// Ajusta el tipo según tu modelo de Transaction en el backend
export type Transaction = {
  _id: string;
  wallet_id: any;              // aquí puedes poner el tipo real de wallet si lo tienes
  transaction_type_id: any;    // igual para tipo de transacción
  amount: number;
  currency_id: any;
  status_id: any;
  metadata?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
};

// 🔹 Tipo de la respuesta del controlador updateTransactionStatus
export type UpdateTransactionStatusResponse = {
  transaction: Transaction;
  wallet: {
    id: string;
    user_id: any;
    currency: any;
    balance: number;
    frozen_balance: number;
  };
};

export async function getTransactionsService(): Promise<Transaction[]> {
  const url = `${API_URL}/transactions`; // esta ruta debe estar montada sobre router.get("/")

  const response = await axios.get<Transaction[]>(url, {
    // Si usas auth, aquí agregas el token:
    // headers: {
    //   Authorization: `Bearer ${token}`,
    // },
  });

  return response.data;
}

// 🔹 Solo recargas (recharge)
export async function getRechargeTransactionsService(): Promise<Transaction[]> {
  const all = await getTransactionsService();
  return all.filter(
    (t) => t.transaction_type_id?.name?.toLowerCase() === "recharge"
  );
}

// 🔹 Solo retiros (withdraw / withdrawal)
export async function getWithdrawTransactionsService(): Promise<Transaction[]> {
  const all = await getTransactionsService();
  return all.filter((t) => {
    const name = t.transaction_type_id?.name?.toLowerCase();
    return name === "withdraw" || name === "withdrawal";
  });
}


// 🔹 Obtener UNA transacción por ID
export async function getTransactionByIdService(id: string): Promise<Transaction> {
  const url = `${API_URL}/transactions/${id}`;

  const response = await axios.get<Transaction>(url, {
    // headers: { Authorization: `Bearer ${token}` },
  });

  return response.data;
}


// 🔹 Obtener status de transacciones
export async function getTransactionStatusesService(): Promise<Array<{ _id: string; name: string; category: string }>> {
  const url = `${API_URL}/statuses?category=transaction`;

  const response = await axios.get<Array<{ _id: string; name: string; category: string }>>(url);

  return response.data;
}

// 🔹 Actualizar el status de una transacción
export async function updateTransactionStatusService(
  id: string,
  status_id: string
): Promise<UpdateTransactionStatusResponse> {
  // OJO: ajusta la ruta a como la tengas definida en tu router:
  // por ejemplo: router.patch("/transactions/:id/status", updateTransactionStatus);
  const url = `${API_URL}/transactions/${id}/status`;

  const response = await axios.put<UpdateTransactionStatusResponse>(url, {
    status_id,
  });

  return response.data;
}