import { create } from 'zustand';
import { api } from '../lib/api';

interface ConfiguracoesStore {
  config: Record<string, string>;
  loading: boolean;
  fetchConfiguracoes: () => Promise<void>;
  atualizarConfiguracao: (chave: string, valor: string) => Promise<void>;
}

export const useConfiguracoes = create<ConfiguracoesStore>((set) => ({
  config: {},
  loading: false,

  fetchConfiguracoes: async () => {
    set({ loading: true });
    try {
      const data = await api.get<Record<string, string>>('/configuracoes');
      set({ config: data, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  atualizarConfiguracao: async (chave, valor) => {
    await api.put(`/configuracoes/${chave}`, { valor });
    set((s) => ({ config: { ...s.config, [chave]: valor } }));
  },
}));
