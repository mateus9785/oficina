import { create } from 'zustand';
import type { OrdemServico, ItemOS, StatusOS, ChecklistDano } from '../types';
import { api } from '../lib/api';

interface PaginatedOrdens {
  data: OrdemServico[];
  meta: { total: number; page: number; limit: number; pages: number };
}

interface OrdemServicoStore {
  ordens: OrdemServico[];
  loading: boolean;
  error: string | null;
  fetchOrdens: (filtros?: { status?: string; clienteId?: string }) => Promise<void>;
  adicionarOrdem: (data: Omit<OrdemServico, 'id' | 'numero' | 'itens' | 'checklistEntrada' | 'dataFinalizacao'>) => Promise<OrdemServico>;
  editarOrdem: (id: string, data: Partial<OrdemServico>) => Promise<void>;
  removerOrdem: (id: string) => Promise<void>;
  buscarOrdem: (id: string) => OrdemServico | undefined;
  moverOrdem: (id: string, novoStatus: StatusOS) => Promise<void>;
  adicionarItem: (ordemId: string, item: Omit<ItemOS, 'id'>) => Promise<void>;
  editarItem: (ordemId: string, itemId: string, data: Partial<ItemOS>) => Promise<void>;
  removerItem: (ordemId: string, itemId: string) => Promise<void>;
  atualizarChecklist: (ordemId: string, checklist: ChecklistDano[]) => Promise<void>;
  ordensDoVeiculo: (veiculoId: string) => OrdemServico[];
  ordensDoCliente: (clienteId: string) => OrdemServico[];
}

export const useOrdemServicoStore = create<OrdemServicoStore>((set, get) => ({
  ordens: [],
  loading: false,
  error: null,

  fetchOrdens: async (filtros = {}) => {
    set({ loading: true, error: null });
    try {
      const params = new URLSearchParams({ limit: '500' });
      if (filtros.status) params.set('status', filtros.status);
      if (filtros.clienteId) params.set('clienteId', filtros.clienteId);
      const res = await api.get<PaginatedOrdens>(`/ordens?${params}`);
      set({ ordens: res.data, loading: false });
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },

  adicionarOrdem: async (data) => {
    const ordem = await api.post<OrdemServico>('/ordens', data);
    set((s) => ({ ordens: [...s.ordens, ordem] }));
    return ordem;
  },

  editarOrdem: async (id, data) => {
    const atualizada = await api.put<OrdemServico>(`/ordens/${id}`, data);
    set((s) => ({
      ordens: s.ordens.map((o) => (o.id === id ? atualizada : o)),
    }));
  },

  removerOrdem: async (id) => {
    await api.delete(`/ordens/${id}`);
    set((s) => ({ ordens: s.ordens.filter((o) => o.id !== id) }));
  },

  buscarOrdem: (id) => get().ordens.find((o) => o.id === id),

  moverOrdem: async (id, novoStatus) => {
    const atualizada = await api.patch<OrdemServico>(`/ordens/${id}/status`, { status: novoStatus });
    set((s) => ({
      ordens: s.ordens.map((o) => (o.id === id ? atualizada : o)),
    }));
  },

  adicionarItem: async (ordemId, item) => {
    const atualizada = await api.post<OrdemServico>(`/ordens/${ordemId}/itens`, item);
    set((s) => ({
      ordens: s.ordens.map((o) => (o.id === ordemId ? atualizada : o)),
    }));
  },

  editarItem: async (ordemId, itemId, data) => {
    const atualizada = await api.put<OrdemServico>(`/ordens/${ordemId}/itens/${itemId}`, data);
    set((s) => ({
      ordens: s.ordens.map((o) => (o.id === ordemId ? atualizada : o)),
    }));
  },

  removerItem: async (ordemId, itemId) => {
    const atualizada = await api.delete<OrdemServico>(`/ordens/${ordemId}/itens/${itemId}`);
    set((s) => ({
      ordens: s.ordens.map((o) => (o.id === ordemId ? atualizada : o)),
    }));
  },

  atualizarChecklist: async (ordemId, checklist) => {
    const atualizada = await api.put<OrdemServico>(`/ordens/${ordemId}/checklist`, { checklist });
    set((s) => ({
      ordens: s.ordens.map((o) => (o.id === ordemId ? atualizada : o)),
    }));
  },

  ordensDoVeiculo: (veiculoId) => get().ordens.filter((o) => o.veiculoId === veiculoId),
  ordensDoCliente: (clienteId) => get().ordens.filter((o) => o.clienteId === clienteId),
}));
