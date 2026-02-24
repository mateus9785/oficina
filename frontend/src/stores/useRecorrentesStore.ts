import { create } from 'zustand';
import type { DespesaRecorrente, CategoriaRecorrente } from '../types';
import { api } from '../lib/api';

interface RecorrentesStore {
  recorrentes: DespesaRecorrente[];
  loading: boolean;
  error: string | null;
  fetchRecorrentes: () => Promise<void>;
  adicionarRecorrente: (data: Omit<DespesaRecorrente, 'id' | 'ativo'>) => Promise<void>;
  editarRecorrente: (id: string, data: Omit<DespesaRecorrente, 'id' | 'ativo'>) => Promise<void>;
  removerRecorrente: (id: string) => Promise<void>;
  toggleAtivo: (id: string) => Promise<void>;
}

export const useRecorrentesStore = create<RecorrentesStore>((set) => ({
  recorrentes: [],
  loading: false,
  error: null,

  fetchRecorrentes: async () => {
    set({ loading: true, error: null });
    try {
      const data = await api.get<DespesaRecorrente[]>('/recorrentes');
      set({ recorrentes: data, loading: false });
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },

  adicionarRecorrente: async (data) => {
    const nova = await api.post<DespesaRecorrente>('/recorrentes', {
      categoria: data.categoria,
      descricao: data.descricao,
      valor: data.valor,
      diaVencimento: data.diaVencimento,
      observacoes: data.observacoes,
    });
    set((s) => ({ recorrentes: [...s.recorrentes, nova] }));
  },

  editarRecorrente: async (id, data) => {
    const atualizada = await api.put<DespesaRecorrente>(`/recorrentes/${id}`, {
      categoria: data.categoria,
      descricao: data.descricao,
      valor: data.valor,
      diaVencimento: data.diaVencimento,
      observacoes: data.observacoes,
    });
    set((s) => ({
      recorrentes: s.recorrentes.map((r) => (r.id === id ? atualizada : r)),
    }));
  },

  removerRecorrente: async (id) => {
    await api.delete(`/recorrentes/${id}`);
    set((s) => ({ recorrentes: s.recorrentes.filter((r) => r.id !== id) }));
  },

  toggleAtivo: async (id) => {
    const atualizada = await api.patch<DespesaRecorrente>(`/recorrentes/${id}/toggle`);
    set((s) => ({
      recorrentes: s.recorrentes.map((r) => (r.id === id ? atualizada : r)),
    }));
  },
}));

export const CATEGORIAS_RECORRENTE: { value: CategoriaRecorrente; label: string }[] = [
  { value: 'aluguel', label: 'Aluguel' },
  { value: 'salario', label: 'Salário' },
  { value: 'energia', label: 'Energia' },
  { value: 'agua', label: 'Água' },
  { value: 'internet', label: 'Internet' },
  { value: 'manutencao', label: 'Manutenção' },
  { value: 'outros', label: 'Outros' },
];
