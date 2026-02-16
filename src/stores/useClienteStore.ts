import { create } from 'zustand';
import type { Cliente } from '../types';
import { generateId } from '../lib/id';
import { clientesSeed } from '../data/clientes';

interface ClienteStore {
  clientes: Cliente[];
  adicionarCliente: (data: Omit<Cliente, 'id' | 'dataCadastro'>) => Cliente;
  editarCliente: (id: string, data: Partial<Cliente>) => void;
  removerCliente: (id: string) => void;
  buscarCliente: (id: string) => Cliente | undefined;
}

export const useClienteStore = create<ClienteStore>((set, get) => ({
  clientes: clientesSeed,

  adicionarCliente: (data) => {
    const cliente: Cliente = {
      ...data,
      id: generateId('cli'),
      dataCadastro: new Date().toISOString(),
    };
    set((s) => ({ clientes: [...s.clientes, cliente] }));
    return cliente;
  },

  editarCliente: (id, data) => {
    set((s) => ({
      clientes: s.clientes.map((c) => (c.id === id ? { ...c, ...data } : c)),
    }));
  },

  removerCliente: (id) => {
    set((s) => ({ clientes: s.clientes.filter((c) => c.id !== id) }));
  },

  buscarCliente: (id) => {
    return get().clientes.find((c) => c.id === id);
  },
}));
