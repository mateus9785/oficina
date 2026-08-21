import { PoolConnection } from 'mysql2/promise';

export interface NovaReceitaData {
  id: string;
  usuarioId: string;
  descricao: string;
  valor: number;
  ordemServicoId: string;
}

export async function createReceita(
  data: NovaReceitaData,
  conn: PoolConnection
): Promise<void> {
  await conn.execute(
    `INSERT INTO contas (id, usuario_id, tipo, categoria, descricao, valor, data_vencimento, data_pagamento, status, ordem_servico_id)
     VALUES (?, ?, 'receita', 'ordem_servico', ?, ?, NOW(), NOW(), 'pago', ?)`,
    [data.id, data.usuarioId, data.descricao, data.valor, data.ordemServicoId]
  );
}
