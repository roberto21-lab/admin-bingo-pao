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


// export type ApiRoom = {
//   _id: string;
//   name: string;
//   price_per_card?: ApiDecimal;
//   min_players?: number;
//   max_rounds?: number;
//   status?: "waiting_players" | "preparing" | "in_progress" | "finished" | string;
//   total_pot?: ApiDecimal;
//   admin_fee?: ApiDecimal;
//   players?: any[];
//   rewards?: any[];
//   created_at?: string;
//   updated_at?: string;
//   capacity?: number;
//   starts_at?: string;
//   currency_id?: {
//     _id: string;
//     code: string;
//     name: string;
//     symbol: string;
//   };
// };
// Respuesta del back según tu controlador
export type CreateRoomResponse = {
  success: boolean;
  message: string;
  room: ApiRoom;
};


// 👇 DTO para crear sala: EXACTO a lo que espera el controlador
export type CreateRoomDto = {
  name: string;
  price_per_card: number;
  min_players: number;
  max_rounds: number;
  currency_id: string;
  description?: string | null;
  rounds: Array<{
    round: number;
    pattern: string; // o Pattern si lo importas del front
    percent: number;
  }>;
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
  const { data } = await api.get<{ success: boolean; data: Room[] }>("/rooms");
  return data.data;
}

export async function getRoomById(id: string): Promise<ApiRoom> {
  const { data } = await api.get<{ success: boolean; data: ApiRoom }>(`/rooms/${id}`);
  return data.data; // ← desenrolla `data`
}


export async function createRoom(payload: CreateRoomDto): Promise<CreateRoomResponse> {
  const { data } = await api.post<CreateRoomResponse>("/rooms", payload);
  return data;
}