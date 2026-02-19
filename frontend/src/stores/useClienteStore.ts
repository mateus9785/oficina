import { create } from 'zustand';
import type { Cliente } from '../types';
import { api } from '../lib/api';

interface PaginatedClientes {
  data: Cliente[];
  meta: { total: number; page: number; limit: number; pages: number };
}

interface ClienteStore {
  clientes: Cliente[];
  loading: boolean;
  error: string | null;
  fetchClientes: (q?: string) => Promise<void>;
  adicionarCliente: (data: Omit<Cliente, 'id' | 'dataCadastro'>) => Promise<Cliente>;
  editarCliente: (id: string, data: Partial<Cliente>) => Promise<void>;
  removerCliente: (id: string) => Promise<void>;
  buscarCliente: (id: string) => Cliente | undefined;
}

export const useClienteStore = create<ClienteStore>((set, get) => ({
  clientes: [],
  loading: false,
  error: null,

  fetchClientes: async (q = '') => {
    set({ loading: true, error: null });
    try {
      const res = await api.get<PaginatedClientes>(`/clientes?limit=200&q=${encodeURIComponent(q)}`);
      set({ clientes: res.data, loading: false });
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },

  adicionarCliente: async (data) => {
    const cliente = await api.post<Cliente>('/clientes', data);
    set((s) => ({ clientes: [...s.clientes, cliente] }));
    return cliente;
  },

  editarCliente: async (id, data) => {
    const atualizado = await api.put<Cliente>(`/clientes/${id}`, data);
    set((s) => ({
      clientes: s.clientes.map((c) => (c.id === id ? atualizado : c)),
    }));
  },

  removerCliente: async (id) => {
    await api.delete(`/clientes/${id}`);
    set((s) => ({ clientes: s.clientes.filter((c) => c.id !== id) }));
  },

  buscarCliente: (id) => get().clientes.find((c) => c.id === id),
}));
