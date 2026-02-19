import { create } from 'zustand';
import type { Conta, TipoConta, StatusConta } from '../types';
import { api } from '../lib/api';

interface PaginatedContas {
  data: Conta[];
  meta: { total: number; page: number; limit: number; pages: number };
}

interface FinanceiroStore {
  contas: Conta[];
  loading: boolean;
  error: string | null;
  fetchContas: (filtros?: { tipo?: string; status?: string }) => Promise<void>;
  adicionarConta: (data: Omit<Conta, 'id'>) => Promise<Conta>;
  editarConta: (id: string, data: Partial<Conta>) => Promise<void>;
  removerConta: (id: string) => Promise<void>;
  buscarConta: (id: string) => Conta | undefined;
  pagarConta: (id: string) => Promise<void>;
  contasPorTipo: (tipo: TipoConta) => Conta[];
  contasPorStatus: (status: StatusConta) => Conta[];
  totalReceitas: (mes?: number, ano?: number) => number;
  totalDespesas: (mes?: number, ano?: number) => number;
}

export const useFinanceiroStore = create<FinanceiroStore>((set, get) => ({
  contas: [],
  loading: false,
  error: null,

  fetchContas: async (filtros = {}) => {
    set({ loading: true, error: null });
    try {
      const params = new URLSearchParams({ limit: '500' });
      if (filtros.tipo) params.set('tipo', filtros.tipo);
      if (filtros.status) params.set('status', filtros.status);
      const res = await api.get<PaginatedContas>(`/financeiro?${params}`);
      set({ contas: res.data, loading: false });
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },

  adicionarConta: async (data) => {
    const conta = await api.post<Conta>('/financeiro', data);
    set((s) => ({ contas: [...s.contas, conta] }));
    return conta;
  },

  editarConta: async (id, data) => {
    const atualizada = await api.put<Conta>(`/financeiro/${id}`, data);
    set((s) => ({
      contas: s.contas.map((c) => (c.id === id ? atualizada : c)),
    }));
  },

  removerConta: async (id) => {
    await api.delete(`/financeiro/${id}`);
    set((s) => ({ contas: s.contas.filter((c) => c.id !== id) }));
  },

  buscarConta: (id) => get().contas.find((c) => c.id === id),

  pagarConta: async (id) => {
    const atualizada = await api.patch<Conta>(`/financeiro/${id}/pagar`);
    set((s) => ({
      contas: s.contas.map((c) => (c.id === id ? atualizada : c)),
    }));
  },

  contasPorTipo: (tipo) => get().contas.filter((c) => c.tipo === tipo),
  contasPorStatus: (status) => get().contas.filter((c) => c.status === status),

  totalReceitas: (mes, ano) => {
    return get().contas
      .filter((c) => {
        if (c.tipo !== 'receita') return false;
        if (mes !== undefined && ano !== undefined) {
          const d = new Date(c.dataVencimento);
          return d.getMonth() === mes && d.getFullYear() === ano;
        }
        return true;
      })
      .reduce((sum, c) => sum + c.valor, 0);
  },

  totalDespesas: (mes, ano) => {
    return get().contas
      .filter((c) => {
        if (c.tipo !== 'despesa') return false;
        if (mes !== undefined && ano !== undefined) {
          const d = new Date(c.dataVencimento);
          return d.getMonth() === mes && d.getFullYear() === ano;
        }
        return true;
      })
      .reduce((sum, c) => sum + c.valor, 0);
  },
}));
