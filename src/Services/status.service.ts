// src/Services/status.service.ts
import { api } from "./api";

// OJO: base con /api


export type Status = {
  _id: string;
  name: string;
  category: string;
};
let url = `/statuses`;

export async function getStatusesService(): Promise<Status[]> {
const { data } = await api.get<Status[]>(`${url}`);
  return data;
}
