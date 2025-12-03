// src/Services/auth.service.ts
import { api } from "./api";



export type LoggedUser = {
  id: string;
  name: string;
  email: string;
  role_id: string;       // o el tipo real si lo tienes populado
  currency_id: string;   // igual aquí
  balance: number;
  frozen_balance: number;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type LoginResponse = {
  success: boolean;
  token: string;
  user: LoggedUser;
};

// 👇 Ajusta la URL según tu back: "/login" o "/auth/login"
export async function loginService(
  payload: LoginPayload
): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>("/auth/login", payload);
  return data;
}


export type ForgotPasswordPayload = {
  email: string;
};

export type ForgotPasswordResponse = {
  message: string;
};

export async function forgotPasswordService(
  payload: ForgotPasswordPayload
): Promise<ForgotPasswordResponse> {
  // Ajusta la URL según tu ruta real en el back:
  // por ejemplo: "/auth/forgot-password"
  const { data } = await api.post<ForgotPasswordResponse>(
    "/auth/forgot-password",
    payload
  );
  return data;
}