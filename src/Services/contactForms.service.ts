// src/Services/contactForms.service.ts
import { api } from "./api";

// --- Tipos auxiliares ---

export type ContactFormUserSummary = {
  _id: string;
  name: string;
  email: string;
};

// Lo que devuelve getAllContactForms (listado)
export type ContactFormListItem = {
  _id: string;
  title: string;
  email: string;
  status: string; // puedes refinarlo a 'pending' | 'resolved' | etc si quieres
  user_id: ContactFormUserSummary | null;
};

// Lo que devuelve getContactFormById (detalle)
export type ContactFormDetail = ContactFormListItem & {
  description: string;
};

/**
 * Obtiene el listado de formularios de contacto.
 * El backend devuelve un array plano con objetos como:
 * {
 *   _id, title, email, status,
 *   user_id: { _id, name, email } | null
 * }
 *
 * Controller: getAllContactForms
 * Ruta asumida: GET /contact-forms
 * Query params: page, limit
 */
export async function getContactForms(params?: {
  page?: number;
  limit?: number;
}): Promise<ContactFormListItem[]> {
  const { page = 1, limit = 20 } = params ?? {};

  const { data } = await api.get<ContactFormListItem[]>("/contacts", {
    params: { page, limit },
  });

  return data; // el controlador ya devuelve [] directo
}

/**
 * Obtiene el detalle de un formulario de contacto por ID.
 *
 * Controller: getContactFormById
 * Ruta asumida: GET /contact-forms/:id
 *
 * Respuesta:
 * {
 *   _id, title, email, description, status,
 *   user_id: { _id, name, email } | null
 * }
 */
export async function getContactFormById(
  id: string
): Promise<ContactFormDetail> {
  const { data } = await api.get<ContactFormDetail>(`/contacts/${id}`);
  return data;
}
