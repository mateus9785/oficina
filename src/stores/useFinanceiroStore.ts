import { create } from 'zustand';
import type { Conta, TipoConta, StatusConta, CategoriaConta } from '../types';
import { generateId } from '../lib/id';
import { contasSeed } from '../data/financeiro';

interface FinanceiroStore {
  contas: Conta[];
  adicionarConta: (data: Omit<Conta, 'id'>) => Conta;
  editarConta: (id: string, data: Partial<Conta>) => void;
  removerConta: (id: string) => void;
  buscarConta: (id: string) => Conta | undefined;
  pagarConta: (id: string) => void;
  registrarReceitaOrdem: (ordemId: string, numero: number, valor: number) => void;
  contasPorTipo: (tipo: TipoConta) => Conta[];
  contasPorStatus: (status: StatusConta) => Conta[];
  totalReceitas: (mes?: number, ano?: number) => number;
  totalDespesas: (mes?: number, ano?: number) => number;
}

export const useFinanceiroStore = create<FinanceiroStore>((set, get) => ({
  contas: contasSeed,

  adicionarConta: (data) => {
    const conta: Conta = { ...data, id: generateId('fin') };
    set((s) => ({ contas: [...s.contas, conta] }));
    return conta;
  },

  editarConta: (id, data) => {
    set((s) => ({
      contas: s.contas.map((c) => (c.id === id ? { ...c, ...data } : c)),
    }));
  },

  removerConta: (id) => {
    set((s) => ({ contas: s.contas.filter((c) => c.id !== id) }));
  },

  buscarConta: (id) => get().contas.find((c) => c.id === id),

  pagarConta: (id) => {
    set((s) => ({
      contas: s.contas.map((c) =>
        c.id === id ? { ...c, status: 'pago' as StatusConta, dataPagamento: new Date().toISOString() } : c
      ),
    }));
  },

  registrarReceitaOrdem: (ordemId, numero, valor) => {
    const conta: Conta = {
      id: generateId('fin'),
      tipo: 'receita',
      categoria: 'ordem_servico' as CategoriaConta,
      descricao: `OS #${numero}`,
      valor,
      dataVencimento: new Date().toISOString(),
      dataPagamento: new Date().toISOString(),
      status: 'pago',
      ordemServicoId: ordemId,
      observacoes: 'Gerado automaticamente ao finalizar OS',
    };
    set((s) => ({ contas: [...s.contas, conta] }));
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
