import { create } from 'zustand';
import { api } from '../lib/api';

export interface Aniversariante {
  id: number;
  nome: string;
  telefone: string;
  dataNascimento: string;
}

export interface OrdemProxima {
  id: number;
  numero: number;
  previsaoEntrega: string;
  status: string;
  descricao: string;
  clienteNome: string;
  clienteTelefone: string;
  veiculo: string;
  placa: string;
  diasUteis: number;
}

export interface ContaAlerta {
  id: string;
  tipo: string;
  categoria: string;
  descricao: string;
  valor: number;
  dataVencimento: string;
  diasAtraso: number;
}

export interface EstoqueBaixoItem {
  id: string;
  nome: string;
  marca: string;
  quantidade: number;
  estoqueMinimo: number;
}

interface NotificacoesStore {
  aniversariantes: Aniversariante[];
  ordensProximas: OrdemProxima[];
  contasAlerta: ContaAlerta[];
  estoqueBaixo: EstoqueBaixoItem[];
  loading: boolean;
  fetchNotificacoes: () => Promise<void>;
  total: () => number;
}

export const useNotificacoesStore = create<NotificacoesStore>((set, get) => ({
  aniversariantes: [],
  ordensProximas: [],
  contasAlerta: [],
  estoqueBaixo: [],
  loading: false,

  fetchNotificacoes: async () => {
    set({ loading: true });
    try {
      const data = await api.get<{
        aniversariantes: Aniversariante[];
        ordensProximas: OrdemProxima[];
        contasAlerta: ContaAlerta[];
        estoqueBaixo: EstoqueBaixoItem[];
      }>('/notificacoes');
      set({
        aniversariantes: data.aniversariantes,
        ordensProximas: data.ordensProximas,
        contasAlerta: data.contasAlerta,
        estoqueBaixo: data.estoqueBaixo,
      });
    } finally {
      set({ loading: false });
    }
  },

  total: () =>
    get().aniversariantes.length +
    get().ordensProximas.length +
    get().contasAlerta.length +
    get().estoqueBaixo.length,
}));
