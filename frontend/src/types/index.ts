// === Cliente ===
export interface Cliente {
  id: string;
  nome: string;
  cpfCnpj: string;
  telefone: string;
  email: string;
  dataNascimento: string | null;
  cep: string;
  cidade: string;
  estado: string;
  rua: string;
  numero: string;
  complemento: string;
  dataCadastro: string; // ISO date
}

// === Veículo ===
export interface Veiculo {
  id: string;
  clienteId: string;
  marca: string;
  modelo: string;
  ano: number | null;
  placa: string;
  cor: string;
  observacoes: string;
}

// === Ordem de Serviço ===
export type StatusOS =
  | 'aguardando_aprovacao'
  | 'aguardando_peca'
  | 'em_execucao'
  | 'pronto_retirada'
  | 'finalizado';

export const STATUS_OS_LABELS: Record<StatusOS, string> = {
  aguardando_aprovacao: 'Aguardando Aprovação',
  aguardando_peca: 'Aguardando Peça',
  em_execucao: 'Em Execução',
  pronto_retirada: 'Pronto para Retirada',
  finalizado: 'Finalizado',
};

export const STATUS_OS_COLORS: Record<StatusOS, string> = {
  aguardando_aprovacao: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  aguardando_peca: 'bg-orange-100 text-orange-800 border-orange-300',
  em_execucao: 'bg-blue-100 text-blue-800 border-blue-300',
  pronto_retirada: 'bg-green-100 text-green-800 border-green-300',
  finalizado: 'bg-gray-100 text-gray-800 border-gray-300',
};

export const STATUS_OS_COLUMN_COLORS: Record<StatusOS, string> = {
  aguardando_aprovacao: 'border-t-yellow-400',
  aguardando_peca: 'border-t-orange-400',
  em_execucao: 'border-t-blue-400',
  pronto_retirada: 'border-t-green-400',
  finalizado: 'border-t-gray-400',
};

export interface ItemOS {
  id: string;
  tipo: 'peca' | 'servico';
  pecaId?: string; // ref a Peca.id se tipo=peca
  descricao: string;
  quantidade: number;
  valorUnitario: number;
}

export interface ChecklistDano {
  zona: string;
  temDano: boolean;
  descricao: string;
}

export interface OrdemServico {
  id: string;
  numero: number;
  clienteId: string | null;
  veiculoId: string | null;
  nomeCliente: string;
  descricaoVeiculo: string;
  descontoPercentual: number;
  status: StatusOS;
  arquivado?: boolean;
  dataAbertura: string;
  dataFinalizacao?: string;
  previsaoEntrega?: string;
  descricao: string;
  itens: ItemOS[];
  checklistEntrada: ChecklistDano[];
  kmEntrada: number;
}

// === Anexos OS ===
export interface AnexoOS {
  id: string;
  ordemId: string;
  nomeOriginal: string;
  caminho: string;
  tipoMime: string;
  tamanho: number;
  criadoEm: string;
}

// === Estoque / Peça ===
export type CategoriaPeca =
  | 'motor'
  | 'freio'
  | 'suspensao'
  | 'eletrica'
  | 'filtro'
  | 'oleo'
  | 'transmissao'
  | 'carroceria'
  | 'acessorio'
  | 'outros';

export const CATEGORIA_PECA_LABELS: Record<CategoriaPeca, string> = {
  motor: 'Motor',
  freio: 'Freio',
  suspensao: 'Suspensão',
  eletrica: 'Elétrica',
  filtro: 'Filtro',
  oleo: 'Óleo',
  transmissao: 'Transmissão',
  carroceria: 'Carroceria',
  acessorio: 'Acessório',
  outros: 'Outros',
};

export interface HistoricoPreco {
  id: number;
  data: string;
  preco: number;
  fornecedor: string;
  quantidade: number;
  valorTotal: number;
  precoVenda: number;
}

export interface Peca {
  id: string;
  nome: string;
  categoria: CategoriaPeca;
  marca: string;
  quantidade: number;
  estoqueMinimo: number;
  precoCompra: number;
  precoVenda: number;
  localizacao: string;
  servicoVinculadoNome: string | null;
  servicoVinculadoValor: number | null;
  usoTotal: number;
  historicoPrecos: HistoricoPreco[];
}

// === Financeiro ===
export type TipoConta = 'receita' | 'despesa';
export type StatusConta = 'pendente' | 'pago' | 'atrasado';
export type CategoriaConta =
  | 'ordem_servico'
  | 'venda_peca'
  | 'compra_peca'
  | 'aluguel'
  | 'salario'
  | 'energia'
  | 'agua'
  | 'internet'
  | 'manutencao'
  | 'outros';

export const CATEGORIA_CONTA_LABELS: Record<CategoriaConta, string> = {
  ordem_servico: 'Ordem de Serviço',
  venda_peca: 'Venda de Peça',
  compra_peca: 'Compra de Peça',
  aluguel: 'Aluguel',
  salario: 'Salário',
  energia: 'Energia',
  agua: 'Água',
  internet: 'Internet',
  manutencao: 'Manutenção',
  outros: 'Outros',
};

export interface Conta {
  id: string;
  tipo: TipoConta;
  categoria: CategoriaConta;
  descricao: string;
  valor: number;
  dataVencimento: string;
  dataPagamento?: string;
  status: StatusConta;
  ordemServicoId?: string;
}

// === Despesas Recorrentes ===
export type CategoriaRecorrente =
  | 'aluguel'
  | 'salario'
  | 'energia'
  | 'agua'
  | 'internet'
  | 'manutencao'
  | 'outros';

export const CATEGORIA_RECORRENTE_LABELS: Record<CategoriaRecorrente, string> = {
  aluguel: 'Aluguel',
  salario: 'Salário',
  energia: 'Energia',
  agua: 'Água',
  internet: 'Internet',
  manutencao: 'Manutenção',
  outros: 'Outros',
};

export interface DespesaRecorrente {
  id: string;
  categoria: CategoriaRecorrente;
  descricao: string;
  valor: number;
  diaVencimento: number;
  ativo: boolean;
  observacoes: string;
}
