import { create } from 'zustand';
import type { Veiculo } from '../types';
import { api } from '../lib/api';

interface PaginatedVeiculos {
  data: Veiculo[];
  meta: { total: number; page: number; limit: number; pages: number };
}

interface VeiculoStore {
  veiculos: Veiculo[];
  loading: boolean;
  error: string | null;
  fetchVeiculos: (q?: string) => Promise<void>;
  fetchVeiculosDoCliente: (clienteId: string) => Promise<Veiculo[]>;
  adicionarVeiculo: (data: Omit<Veiculo, 'id'>) => Promise<Veiculo>;
  editarVeiculo: (id: string, data: Partial<Veiculo>) => Promise<void>;
  removerVeiculo: (id: string) => Promise<void>;
  buscarVeiculo: (id: string) => Veiculo | undefined;
  veiculosDoCliente: (clienteId: string) => Veiculo[];
}

export const useVeiculoStore = create<VeiculoStore>((set, get) => ({
  veiculos: [],
  loading: false,
  error: null,

  fetchVeiculos: async (q = '') => {
    set({ loading: true, error: null });
    try {
      const res = await api.get<PaginatedVeiculos>(`/veiculos?limit=200&q=${encodeURIComponent(q)}`);
      set({ veiculos: res.data, loading: false });
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },

  fetchVeiculosDoCliente: async (clienteId) => {
    const veiculos = await api.get<Veiculo[]>(`/clientes/${clienteId}/veiculos`);
    set((s) => {
      const outros = s.veiculos.filter((v) => v.clienteId !== clienteId);
      return { veiculos: [...outros, ...veiculos] };
    });
    return veiculos;
  },

  adicionarVeiculo: async (data) => {
    const veiculo = await api.post<Veiculo>('/veiculos', data);
    set((s) => ({ veiculos: [...s.veiculos, veiculo] }));
    return veiculo;
  },

  editarVeiculo: async (id, data) => {
    const atualizado = await api.put<Veiculo>(`/veiculos/${id}`, data);
    set((s) => ({
      veiculos: s.veiculos.map((v) => (v.id === id ? atualizado : v)),
    }));
  },

  removerVeiculo: async (id) => {
    await api.delete(`/veiculos/${id}`);
    set((s) => ({ veiculos: s.veiculos.filter((v) => v.id !== id) }));
  },

  buscarVeiculo: (id) => get().veiculos.find((v) => v.id === id),
  veiculosDoCliente: (clienteId) => get().veiculos.filter((v) => v.clienteId === clienteId),
}));
