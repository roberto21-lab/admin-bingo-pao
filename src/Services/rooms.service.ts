// src/Services/rooms.service.ts
import { api } from "./api";

export type ApiDecimal = { $numberDecimal: string };

// 🔹 Tipo EXACTO de lo que manda el backend (según el JSON que pasaste)
export type ApiRoom = {
  id: string;
  name: string;
  price_per_card: number;         // viene como number
  min_players: number;
  max_rounds: number;
  currency_id: {
    _id: string;
    code: string;
    name: string;
    symbol: string;
  };
  status_id: {
    _id: string;
    name: "waiting_players" | "preparing" | "in_progress" | "finished" | string;
    category: "room";
  };
  status: "waiting_players" | "preparing" | "in_progress" | "finished" | string;
  is_public: boolean;
  scheduled_at: string | null;
  total_prize: number;
  admin_fee: number;
  description: string;
  players: any[];
  rewards: any[];
  created_at: string;
  updated_at: string;
  __v?: number;
};

// 👉 Este es el DTO que usas para crear
export type CreateRoomDto = {
  name: string;
  price_per_card: number;
  min_players: number;
  max_rounds: number;
  currency_id: string;
  description?: string | null;
  rounds: Array<{
    round: number;
    pattern: string;
    percent: number;
  }>;
};

export type CreateRoomResponse = {
  success: boolean;
  message: string;
  room: ApiRoom;
};

// ✅ AHORA getRooms devuelve directamente ApiRoom[]
export async function getRooms(): Promise<ApiRoom[]> {
  // si tu endpoint es /api/rooms cámbialo aquí
  const { data } = await api.get<ApiRoom[]>("/rooms");
  return data; // <– aquí estaba el problema, antes hacías data.data
}

export async function getRoomById(id: string): Promise<ApiRoom> {
  const { data } = await api.get<ApiRoom>(`/rooms/${id}`);
  return data;
}

export async function createRoom(payload: CreateRoomDto): Promise<CreateRoomResponse> {
  const { data } = await api.post<CreateRoomResponse>("/rooms", payload);
  return data;
}
