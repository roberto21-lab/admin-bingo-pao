// src/services/transactionService.ts
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

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


// payload extra opcional
type UpdateTxExtraPayload = {
  wallet_id?: string;
  amount?: number;
  note?: string;
  operation?: "sumar" | "restar";
  // cualquier otro campo que tu backend espere
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



export async function getTransactionByIdService(id: string): Promise<Transaction> {
  const url = `${API_URL}/transactions/${id}`;
  const token = localStorage.getItem("token");

  const response = await axios.get<Transaction>(url, {
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

  const response = await axios.put<UpdateTransactionStatusResponse>(url, body);

  return response.data;
}


export type CreateAdminTransactionPayload = {
  wallet_id: string;
  transaction_type_id: string;
  amount: number;              // número, en el back lo conviertes a Decimal128
  currency_id: string;
  isAdminTransaction: boolean; // para que el backend sepa que es admin
  metadata?: Record<string, any>;
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

  const response = await axios.post<CreateAdminTransactionResponse>(url, payload, {
    headers: token
      ? { Authorization: `Bearer ${token}` }
      : undefined,
  });

  return response.data;
}

