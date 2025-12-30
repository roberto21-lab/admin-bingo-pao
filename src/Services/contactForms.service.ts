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


export type UpdateContactFormStatusResponse = {
  message: string;
  contactForm: ContactFormDetail & {
    admin_note?: string;
    created_at: string;
    updated_at: string;
    status_id: string;
  };
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


export async function getContactFormById(
  id: string
): Promise<ContactFormDetail> {
  const { data } = await api.get<ContactFormDetail>(`/contacts/${id}`);
  return data;
}


export async function updateContactFormStatus(
  id: string,
  status_id: string
): Promise<ContactFormDetail & {
  admin_note?: string;
  created_at: string;
  updated_at: string;
  status_id: string;
}> {
  const { data } = await api.patch<UpdateContactFormStatusResponse>(
    `/contacts/${id}`,
    { status_id }
  );

  return data.contactForm;
}
