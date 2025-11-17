import { api } from "./api";
export type ApiDecimal = { $numberDecimal: string };


export type Room = {
  _id: string;
  name: string;
  ticketPrice?: number;
  capacity?: number;
  sold?: number;
  startsAt?: string;
  isPublic?: boolean;
  status?: "abierta" | "programada" | "cerrada" | string;
  // agrega aquí cualquier campo real de tu IRoom
};


export type ApiRoom = {
  _id: string;
  name: string;
  price_per_card?: ApiDecimal;
  min_players?: number;
  max_rounds?: number;
  status?: "waiting_players" | "preparing" | "in_progress" | "finished" | string;
  total_pot?: ApiDecimal;
  admin_fee?: ApiDecimal;
  players?: any[];
  rewards?: any[];
  created_at?: string;
  updated_at?: string;
  capacity?: number;
  starts_at?: string;
};

export async function getRooms(): Promise<Room[]> {
  // si tu ruta real es /api/rooms, cámbiala aquí:
  const { data } = await api.get<Room[]>("/rooms");
  return data;
}

export async function getRoomById(id: string): Promise<ApiRoom> {
  const { data } = await api.get<{ success: boolean; data: ApiRoom }>(`/rooms/${id}`);
  return data.data; // ← desenrolla `data`
}
