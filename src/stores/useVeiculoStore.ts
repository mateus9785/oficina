import { create } from 'zustand';
import type { Veiculo } from '../types';
import { generateId } from '../lib/id';
import { veiculosSeed } from '../data/veiculos';

interface VeiculoStore {
  veiculos: Veiculo[];
  adicionarVeiculo: (data: Omit<Veiculo, 'id'>) => Veiculo;
  editarVeiculo: (id: string, data: Partial<Veiculo>) => void;
  removerVeiculo: (id: string) => void;
  buscarVeiculo: (id: string) => Veiculo | undefined;
  veiculosDoCliente: (clienteId: string) => Veiculo[];
}

export const useVeiculoStore = create<VeiculoStore>((set, get) => ({
  veiculos: veiculosSeed,

  adicionarVeiculo: (data) => {
    const veiculo: Veiculo = { ...data, id: generateId('vei') };
    set((s) => ({ veiculos: [...s.veiculos, veiculo] }));
    return veiculo;
  },

  editarVeiculo: (id, data) => {
    set((s) => ({
      veiculos: s.veiculos.map((v) => (v.id === id ? { ...v, ...data } : v)),
    }));
  },

  removerVeiculo: (id) => {
    set((s) => ({ veiculos: s.veiculos.filter((v) => v.id !== id) }));
  },

  buscarVeiculo: (id) => {
    return get().veiculos.find((v) => v.id === id);
  },

  veiculosDoCliente: (clienteId) => {
    return get().veiculos.filter((v) => v.clienteId === clienteId);
  },
}));
