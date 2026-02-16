import { create } from 'zustand';
import type { OrdemServico, ItemOS, StatusOS, ChecklistDano } from '../types';
import { generateId } from '../lib/id';
import { ordensSeed } from '../data/ordens';
import { useEstoqueStore } from './useEstoqueStore';
import { useFinanceiroStore } from './useFinanceiroStore';
import { calcularTotalOS } from '../lib/calculators';

interface OrdemServicoStore {
  ordens: OrdemServico[];
  proximoNumero: number;
  adicionarOrdem: (data: Omit<OrdemServico, 'id' | 'numero' | 'itens' | 'checklistEntrada' | 'dataFinalizacao'>) => OrdemServico;
  editarOrdem: (id: string, data: Partial<OrdemServico>) => void;
  removerOrdem: (id: string) => void;
  buscarOrdem: (id: string) => OrdemServico | undefined;
  moverOrdem: (id: string, novoStatus: StatusOS) => void;
  adicionarItem: (ordemId: string, item: Omit<ItemOS, 'id'>) => void;
  removerItem: (ordemId: string, itemId: string) => void;
  atualizarChecklist: (ordemId: string, checklist: ChecklistDano[]) => void;
  ordensDoVeiculo: (veiculoId: string) => OrdemServico[];
  ordensDoCliente: (clienteId: string) => OrdemServico[];
}

export const useOrdemServicoStore = create<OrdemServicoStore>((set, get) => ({
  ordens: ordensSeed,
  proximoNumero: 1021,

  adicionarOrdem: (data) => {
    const numero = get().proximoNumero;
    const ordem: OrdemServico = {
      ...data,
      id: generateId('os'),
      numero,
      itens: [],
      checklistEntrada: [],
    };
    set((s) => ({ ordens: [...s.ordens, ordem], proximoNumero: s.proximoNumero + 1 }));
    return ordem;
  },

  editarOrdem: (id, data) => {
    set((s) => ({
      ordens: s.ordens.map((o) => (o.id === id ? { ...o, ...data } : o)),
    }));
  },

  removerOrdem: (id) => {
    set((s) => ({ ordens: s.ordens.filter((o) => o.id !== id) }));
  },

  buscarOrdem: (id) => get().ordens.find((o) => o.id === id),

  moverOrdem: (id, novoStatus) => {
    const ordem = get().ordens.find((o) => o.id === id);
    if (!ordem) return;

    const updates: Partial<OrdemServico> = { status: novoStatus };

    if (novoStatus === 'finalizado' && ordem.status !== 'finalizado') {
      updates.dataFinalizacao = new Date().toISOString();
      // Cross-store: criar conta receita
      const total = calcularTotalOS(ordem);
      if (total > 0) {
        useFinanceiroStore.getState().registrarReceitaOrdem(ordem.id, ordem.numero, total);
      }
    }

    set((s) => ({
      ordens: s.ordens.map((o) => (o.id === id ? { ...o, ...updates } : o)),
    }));
  },

  adicionarItem: (ordemId, itemData) => {
    const item: ItemOS = { ...itemData, id: generateId('item') };
    // Cross-store: deduzir estoque se for peça
    if (item.tipo === 'peca' && item.pecaId) {
      useEstoqueStore.getState().deduzirEstoque(item.pecaId, item.quantidade);
    }
    set((s) => ({
      ordens: s.ordens.map((o) =>
        o.id === ordemId ? { ...o, itens: [...o.itens, item] } : o
      ),
    }));
  },

  removerItem: (ordemId, itemId) => {
    const ordem = get().ordens.find((o) => o.id === ordemId);
    if (!ordem) return;
    const item = ordem.itens.find((i) => i.id === itemId);
    // Cross-store: restaurar estoque se for peça
    if (item && item.tipo === 'peca' && item.pecaId) {
      useEstoqueStore.getState().restaurarEstoque(item.pecaId, item.quantidade);
    }
    set((s) => ({
      ordens: s.ordens.map((o) =>
        o.id === ordemId ? { ...o, itens: o.itens.filter((i) => i.id !== itemId) } : o
      ),
    }));
  },

  atualizarChecklist: (ordemId, checklist) => {
    set((s) => ({
      ordens: s.ordens.map((o) =>
        o.id === ordemId ? { ...o, checklistEntrada: checklist } : o
      ),
    }));
  },

  ordensDoVeiculo: (veiculoId) => get().ordens.filter((o) => o.veiculoId === veiculoId),
  ordensDoCliente: (clienteId) => get().ordens.filter((o) => o.clienteId === clienteId),
}));
