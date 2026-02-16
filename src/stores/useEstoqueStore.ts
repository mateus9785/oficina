import { create } from 'zustand';
import type { Peca, HistoricoPreco } from '../types';
import { generateId } from '../lib/id';
import { pecasSeed } from '../data/pecas';

interface EstoqueStore {
  pecas: Peca[];
  adicionarPeca: (data: Omit<Peca, 'id' | 'usoTotal' | 'historicoPrecos'>) => Peca;
  editarPeca: (id: string, data: Partial<Peca>) => void;
  removerPeca: (id: string) => void;
  buscarPeca: (id: string) => Peca | undefined;
  deduzirEstoque: (pecaId: string, quantidade: number) => void;
  restaurarEstoque: (pecaId: string, quantidade: number) => void;
  adicionarHistoricoPreco: (pecaId: string, historico: Omit<HistoricoPreco, 'data'>) => void;
  pecasAbaixoMinimo: () => Peca[];
}

export const useEstoqueStore = create<EstoqueStore>((set, get) => ({
  pecas: pecasSeed,

  adicionarPeca: (data) => {
    const peca: Peca = {
      ...data,
      id: generateId('pec'),
      usoTotal: 0,
      historicoPrecos: [{ data: new Date().toISOString(), preco: data.precoCompra, fornecedor: 'Cadastro inicial' }],
    };
    set((s) => ({ pecas: [...s.pecas, peca] }));
    return peca;
  },

  editarPeca: (id, data) => {
    set((s) => ({
      pecas: s.pecas.map((p) => (p.id === id ? { ...p, ...data } : p)),
    }));
  },

  removerPeca: (id) => {
    set((s) => ({ pecas: s.pecas.filter((p) => p.id !== id) }));
  },

  buscarPeca: (id) => {
    return get().pecas.find((p) => p.id === id);
  },

  deduzirEstoque: (pecaId, quantidade) => {
    set((s) => ({
      pecas: s.pecas.map((p) =>
        p.id === pecaId
          ? { ...p, quantidade: Math.max(0, p.quantidade - quantidade), usoTotal: p.usoTotal + quantidade }
          : p
      ),
    }));
  },

  restaurarEstoque: (pecaId, quantidade) => {
    set((s) => ({
      pecas: s.pecas.map((p) =>
        p.id === pecaId
          ? { ...p, quantidade: p.quantidade + quantidade, usoTotal: Math.max(0, p.usoTotal - quantidade) }
          : p
      ),
    }));
  },

  adicionarHistoricoPreco: (pecaId, historico) => {
    set((s) => ({
      pecas: s.pecas.map((p) =>
        p.id === pecaId
          ? {
              ...p,
              precoCompra: historico.preco,
              historicoPrecos: [...p.historicoPrecos, { ...historico, data: new Date().toISOString() }],
            }
          : p
      ),
    }));
  },

  pecasAbaixoMinimo: () => {
    return get().pecas.filter((p) => p.quantidade <= p.estoqueMinimo);
  },
}));
