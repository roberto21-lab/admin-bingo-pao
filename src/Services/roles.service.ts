// src/Services/roles.service.ts
import { api } from "./api";

export type Role = {
  _id: string;
  name: string;
  // por si en el futuro agregas más campos
  description?: string;
  permissions?: string[];
};

const url = "/roles";

export async function getRolesService(): Promise<Role[]> {
  const { data } = await api.get<Role[]>(url);
  return data;
}
