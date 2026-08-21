import { RowDataPacket } from 'mysql2/promise';

// mysql2 returns DECIMAL columns as strings (no `decimalNumbers: true` set on
// the pool -- see src/config/database.ts) and TINYINT(1) columns as 0/1
// numbers, not booleans. The existing mappers already call parseFloat()/!!
// on these; keep doing that, don't assume the driver coerces them for you.

export interface ClienteRow extends RowDataPacket {
  id: string;
  usuario_id: string;
  nome: string;
  cpf_cnpj: string | null;
  telefone: string;
  email: string;
  endereco: string;
  data_nascimento: Date | null;
  cep: string;
  cidade: string;
  estado: string;
  rua: string;
  numero: string;
  complemento: string;
  observacoes: string;
  data_cadastro: Date;
  criado_em: Date;
  atualizado_em: Date;
}

export interface VeiculoRow extends RowDataPacket {
  id: string;
  usuario_id: string;
  cliente_id: string;
  marca: string;
  modelo: string;
  ano: number | null;
  placa: string;
  cor: string;
  km: number;
  observacoes: string;
  criado_em: Date;
  atualizado_em: Date;
}

export interface OrdemServicoRow extends RowDataPacket {
  id: string;
  usuario_id: string;
  numero: number;
  cliente_id: string | null;
  veiculo_id: string | null;
  nome_cliente: string;
  descricao_veiculo: string;
  desconto_percentual: string;
  status: string;
  arquivado: number;
  data_abertura: Date;
  data_finalizacao: Date | null;
  descricao: string;
  km_entrada: number;
  previsao_entrega: Date | null;
  criado_em: Date;
  atualizado_em: Date;
}

export interface ItemOsRow extends RowDataPacket {
  id: string;
  ordem_id: string;
  tipo: string;
  peca_id: string | null;
  descricao: string;
  quantidade: number;
  valor_unitario: string;
  criado_em: Date;
}

export interface ChecklistEntradaRow extends RowDataPacket {
  id: number;
  ordem_id: string;
  zona: string;
  tem_dano: number;
  descricao: string;
}
