import { create } from 'zustand';
import { api, setToken, clearToken, getToken } from '../lib/api';

interface Usuario {
  id: string;
  nome: string;
  email: string;
  role: string;
}

interface AuthStore {
  usuario: Usuario | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => void;
  fetchMe: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  usuario: null,
  loading: false,
  error: null,
  isAuthenticated: !!getToken(),

  login: async (email, senha) => {
    set({ loading: true, error: null });
    try {
      const data = await api.post<{ token: string; usuario: Usuario }>('/auth/login', { email, senha });
      setToken(data.token);
      set({ usuario: data.usuario, isAuthenticated: true, loading: false });
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
      throw err;
    }
  },

  logout: () => {
    clearToken();
    set({ usuario: null, isAuthenticated: false, error: null });
  },

  fetchMe: async () => {
    if (!getToken()) return;
    try {
      const usuario = await api.get<Usuario>('/auth/me');
      set({ usuario, isAuthenticated: true });
    } catch {
      clearToken();
      set({ usuario: null, isAuthenticated: false });
    }
  },
}));
