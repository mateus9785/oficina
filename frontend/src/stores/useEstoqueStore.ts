import { create } from 'zustand';
import type { Peca, HistoricoPreco } from '../types';
import { api } from '../lib/api';

interface PaginatedPecas {
  data: Peca[];
  meta: { total: number; page: number; limit: number; pages: number };
}

export interface EntradaData {
  quantidade: number;
  valorTotal: number;
  precoCompra: number;
  precoVenda: number;
  fornecedor?: string;
}

interface EstoqueStore {
  pecas: Peca[];
  loading: boolean;
  error: string | null;
  fetchPecas: (q?: string) => Promise<void>;
  adicionarPeca: (data: Omit<Peca, 'id' | 'usoTotal' | 'historicoPrecos'>) => Promise<Peca>;
  editarPeca: (id: string, data: Partial<Peca>) => Promise<void>;
  removerPeca: (id: string) => Promise<void>;
  buscarPeca: (id: string) => Peca | undefined;
  fetchPecaById: (id: string) => Promise<void>;
  adicionarHistoricoPreco: (pecaId: string, historico: Omit<HistoricoPreco, 'data'>) => Promise<void>;
  editarHistoricoPreco: (pecaId: string, historicoId: number, data: Omit<HistoricoPreco, 'id' | 'data'>) => Promise<void>;
  darEntrada: (pecaId: string, data: EntradaData) => Promise<void>;
  pecasAbaixoMinimo: () => Peca[];
}

export const useEstoqueStore = create<EstoqueStore>((set, get) => ({
  pecas: [],
  loading: false,
  error: null,

  fetchPecas: async (q = '') => {
    set({ loading: true, error: null });
    try {
      const res = await api.get<PaginatedPecas>(`/estoque?limit=200&q=${encodeURIComponent(q)}`);
      set({ pecas: res.data, loading: false });
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },

  adicionarPeca: async (data) => {
    const peca = await api.post<Peca>('/estoque', data);
    set((s) => ({ pecas: [...s.pecas, peca] }));
    return peca;
  },

  editarPeca: async (id, data) => {
    const atualizada = await api.put<Peca>(`/estoque/${id}`, data);
    set((s) => ({
      pecas: s.pecas.map((p) => (p.id === id ? atualizada : p)),
    }));
  },

  removerPeca: async (id) => {
    await api.delete(`/estoque/${id}`);
    set((s) => ({ pecas: s.pecas.filter((p) => p.id !== id) }));
  },

  buscarPeca: (id) => get().pecas.find((p) => p.id === id),

  fetchPecaById: async (id) => {
    const peca = await api.get<Peca>(`/estoque/${id}`);
    set((s) => {
      const existe = s.pecas.find((p) => p.id === id);
      return {
        pecas: existe
          ? s.pecas.map((p) => (p.id === id ? peca : p))
          : [...s.pecas, peca],
      };
    });
  },

  adicionarHistoricoPreco: async (pecaId, historico) => {
    const atualizada = await api.post<Peca>(`/estoque/${pecaId}/historico-preco`, historico);
    set((s) => ({
      pecas: s.pecas.map((p) => (p.id === pecaId ? atualizada : p)),
    }));
  },

  editarHistoricoPreco: async (pecaId, historicoId, data) => {
    const atualizada = await api.put<Peca>(`/estoque/${pecaId}/historico-preco/${historicoId}`, data);
    set((s) => ({
      pecas: s.pecas.map((p) => (p.id === pecaId ? atualizada : p)),
    }));
  },

  darEntrada: async (pecaId, data) => {
    const atualizada = await api.post<Peca>(`/estoque/${pecaId}/entrada`, data);
    set((s) => ({
      pecas: s.pecas.map((p) => (p.id === pecaId ? atualizada : p)),
    }));
  },

  pecasAbaixoMinimo: () => get().pecas.filter((p) => p.estoqueMinimo > 0 && p.quantidade <= p.estoqueMinimo),
}));
