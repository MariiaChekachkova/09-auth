import api from "./api";
import { cookies } from "next/headers";
import type { User } from "@//types/user";
import type { Note } from "@/types/note";

interface FetchNotesResponse {
  notes: Note[];
  totalPages: number;
}

export const checkSession = async (): Promise<boolean> => {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  try {
    const response = await api.get<{ success: boolean }>("/auth/session", {
      headers: { Cookie: cookieHeader },
    });
    return response.data.success;
  } catch {
    return false;
  }
};

export const getMe = async (): Promise<User> => {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  const response = await api.get<User>("/users/me", {
    headers: {
      Cookie: cookieHeader,
    },
  });
  return response.data;
};

export const fetchNotes = async (
  page: number,
  search: string,
  tag?: string,
): Promise<FetchNotesResponse> => {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  const response = await api.get<FetchNotesResponse>("/notes", {
    headers: {
      Cookie: cookieHeader,
    },
    params: {
      page,
      perPage: 12,
      search,
      ...(tag ? { tag } : {}),
    },
  });
  return response.data;
};
export const fetchNoteById = async (noteId: string): Promise<Note> => {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  const response = await api.get<Note>(`/notes/${noteId}`, {
    headers: {
      Cookie: cookieHeader,
    },
  });
  return response.data;
};
