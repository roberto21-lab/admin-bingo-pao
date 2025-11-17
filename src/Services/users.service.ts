// src/Services/users.service.ts
import { api } from "./api";

export type CreateUserPayload = {
  name: string;
  email: string;
  password: string;
};

export type User = {
  _id: string;
  name: string;
  email: string;
  created_at?: string;
  updated_at?: string;
};

export async function createUser(payload: CreateUserPayload): Promise<User> {
  const { data } = await api.post<{ success: boolean; data: User; message?: string }>(
    "/users",
    payload
  );
  if (data?.success && data?.data) return data.data;
  // si el backend llega a devolver solo message
  throw new Error(data?.message || "No se pudo crear el usuario");
}


export async function getUsers(): Promise<User[]> {
  const { data } = await api.get<User[]>("/users"); // tu back devuelve [] plano
  return data;
}

export async function getUserById(id: string): Promise<User> {
  const { data } = await api.get<{ success: boolean; data: User; message?: string }>(`/users/${id}`);
  if (data?.success && data?.data) return data.data;
  throw new Error(data?.message || "No se pudo obtener el usuario");
}
