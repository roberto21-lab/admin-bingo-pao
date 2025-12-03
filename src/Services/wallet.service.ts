// src/Services/wallet.service.ts
import { api } from "./api";

export interface Currency {
  _id: string;
  name?: string;
  code?: string;
  symbol?: string;
}

export interface TransactionStatus {
  _id: string;
  name: string;
}

export interface TransactionType {
  _id: string;
  name: string;
  description?: string;
}

export interface Transaction {
  _id: string;
  wallet_id: string;
  amount: number;
  status_id: TransactionStatus;
  transaction_type_id: TransactionType;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, any>;
}

export interface WalletResponse {
  _id: string;
  user_id: string;
  currency_id: Currency;
  created_at: string;
  updated_at: string;
  balance: number;
  frozen_balance: number;
  transactions: Transaction[];
}

/**
 * Obtiene la wallet de un usuario por su userId
 * Pega al controlador getWalletByUser (GET /wallet/user/:userId)
 *
 * OJO: ajusta la ruta "/wallet/user" si en tu backend
 * la definiste como "/wallets/user" o similar.
 */
export async function getWalletByUser(userId: string): Promise<WalletResponse> {
  const { data } = await api.get<WalletResponse>(`/wallets/user/${userId}`);
  // Tu controlador devuelve el objeto plano (no viene envuelto en { success, data })
  return data;
}
