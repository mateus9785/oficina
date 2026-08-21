import { RowDataPacket, PoolConnection } from 'mysql2/promise';
import { v4 as uuidv4 } from 'uuid';
import { pool } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { paginatedResponse } from '../utils/pagination';
import * as ordemRepository from '../repositories/ordemRepository';
import * as itemOsRepository from '../repositories/itemOsRepository';
import * as checklistRepository from '../repositories/checklistRepository';
import * as contaRepository from '../repositories/contaRepository';
import * as pecaRepository from '../repositories/pecaRepository';

function mapItem(r: RowDataPacket) {
  return {
    id: r.id,
    tipo: r.tipo,
    pecaId: r.peca_id ?? undefined,
    descricao: r.descricao,
    quantidade: r.quantidade,
    valorUnitario: parseFloat(r.valor_unitario),
  };
}

function mapChecklist(r: RowDataPacket) {
  return {
    zona: r.zona,
    temDano: !!r.tem_dano,
    descricao: r.descricao,
  };
}

function mapOrdem(
  r: RowDataPacket,
  itens: RowDataPacket[] = [],
  checklist: RowDataPacket[] = []
) {
  return {
    id: r.id,
    numero: r.numero,
    clienteId: r.cliente_id ?? null,
    veiculoId: r.veiculo_id ?? null,
    nomeCliente: r.nome_cliente ?? '',
    descricaoVeiculo: r.descricao_veiculo ?? '',
    descontoPercentual: parseFloat(r.desconto_percentual ?? 0),
    status: r.status,
    arquivado: !!r.arquivado,
    dataAbertura: r.data_abertura,
    dataFinalizacao: r.data_finalizacao ?? undefined,
    previsaoEntrega: r.previsao_entrega ?? undefined,
    descricao: r.descricao,
    kmEntrada: r.km_entrada,
    itens: itens.map(mapItem),
    checklistEntrada: checklist.map(mapChecklist),
  };
}

export async function buscarCompleta(id: string, conn?: PoolConnection) {
  const ordem = await ordemRepository.findById(id, conn);
  if (!ordem) return null;
  const itens = await itemOsRepository.findByOrdemId(id, conn);
  const checklist = await checklistRepository.findByOrdemId(id, conn);
  return mapOrdem(ordem, itens, checklist);
}

export interface OrdemInput {
  clienteId?: string | null;
  veiculoId?: string | null;
  nomeCliente?: string;
  descricaoVeiculo?: string;
  descricao: string;
  kmEntrada?: number;
  previsaoEntrega?: string | null;
  descontoPercentual?: number;
}

export async function listar(query: {
  page: number;
  limit: number;
  offset: number;
  sqlLimit: bigint;
  sqlOffset: bigint;
  status: string;
  clienteId: string;
  somenteArquivadas: boolean;
}) {
  const filter = {
    status: query.status,
    clienteId: query.clienteId,
    somenteArquivadas: query.somenteArquivadas,
  };
  const total = await ordemRepository.count(filter);
  const rows = await ordemRepository.findAll(filter, {
    sqlLimit: query.sqlLimit,
    sqlOffset: query.sqlOffset,
  });
  const ordens = await Promise.all(rows.map((r) => buscarCompleta(r.id)));
  return paginatedResponse(
    ordens.filter((o): o is NonNullable<typeof o> => o !== null),
    total,
    { page: query.page, limit: query.limit, offset: query.offset }
  );
}

export async function criar(input: OrdemInput) {
  const id = uuidv4();
  await ordemRepository.create(id, {
    clienteId: input.clienteId ?? null,
    veiculoId: input.veiculoId ?? null,
    nomeCliente: input.nomeCliente ?? '',
    descricaoVeiculo: input.descricaoVeiculo ?? '',
    descricao: input.descricao,
    kmEntrada: input.kmEntrada ?? 0,
    previsaoEntrega: input.previsaoEntrega ?? null,
    descontoPercentual: input.descontoPercentual ?? 0,
  });
  return buscarCompleta(id);
}

export async function buscar(id: string) {
  const ordem = await buscarCompleta(id);
  if (!ordem) throw new AppError(404, 'Ordem de serviço não encontrada.');
  return ordem;
}

export async function editar(
  id: string,
  input: Partial<OrdemInput>
) {
  const sets: string[] = [];
  const vals: unknown[] = [];
  if (input.descricao !== undefined) {
    sets.push('descricao=?');
    vals.push(input.descricao);
  }
  if (input.kmEntrada !== undefined) {
    sets.push('km_entrada=?');
    vals.push(input.kmEntrada);
  }
  if (input.clienteId !== undefined) {
    sets.push('cliente_id=?');
    vals.push(input.clienteId || null);
  }
  if (input.veiculoId !== undefined) {
    sets.push('veiculo_id=?');
    vals.push(input.veiculoId || null);
  }
  if (input.previsaoEntrega !== undefined) {
    sets.push('previsao_entrega=?');
    vals.push(input.previsaoEntrega || null);
  }
  if (input.nomeCliente !== undefined) {
    sets.push('nome_cliente=?');
    vals.push(input.nomeCliente);
  }
  if (input.descricaoVeiculo !== undefined) {
    sets.push('descricao_veiculo=?');
    vals.push(input.descricaoVeiculo);
  }
  if (input.descontoPercentual !== undefined) {
    sets.push('desconto_percentual=?');
    vals.push(input.descontoPercentual);
  }
  if (sets.length === 0) {
    throw new AppError(400, 'Nenhum campo para atualizar.');
  }
  const updated = await ordemRepository.update(id, sets, vals);
  if (!updated) throw new AppError(404, 'Ordem não encontrada.');
  return buscarCompleta(id);
}

/**
 * Fix vs. the original inline controller: restoring stock and deleting the
 * order now happen in one transaction. Previously stock was restored in a
 * loop with no transaction at all, then the order was deleted separately --
 * if the DELETE failed after the loop, stock was already mutated but the
 * order still existed (data inconsistency). Confirmed with the user as the
 * one intentional behavior change in this refactor pass.
 */
export async function remover(id: string): Promise<void> {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const itens = await itemOsRepository.findByOrdemIdETipo(id, 'peca', conn);
    for (const item of itens) {
      if (item.peca_id) {
        await pecaRepository.restaurarEstoque(item.peca_id, item.quantidade, conn);
      }
    }
    const removed = await ordemRepository.remove(id, conn);
    if (!removed) throw new AppError(404, 'Ordem não encontrada.');
    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

function calcularTotalComDesconto(
  itens: RowDataPacket[],
  descontoPercentual: unknown
): number {
  const subtotal = itens.reduce(
    (sum, i) => sum + i.quantidade * parseFloat(i.valor_unitario),
    0
  );
  const desconto = parseFloat(String(descontoPercentual ?? 0));
  return subtotal * (1 - desconto / 100);
}

export async function moverStatus(id: string, novoStatus: string) {
  const ordem = await ordemRepository.findById(id);
  if (!ordem) throw new AppError(404, 'Ordem não encontrada.');

  if (novoStatus === 'finalizado' && ordem.status !== 'finalizado') {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      await ordemRepository.finalizar(id, conn);
      const itens = await itemOsRepository.findByOrdemId(id, conn);
      const total = calcularTotalComDesconto(itens, ordem.desconto_percentual);
      if (total > 0) {
        await contaRepository.createReceita(
          {
            id: uuidv4(),
            descricao: `OS #${ordem.numero}`,
            valor: total,
            ordemServicoId: id,
          },
          conn
        );
      }
      await conn.commit();
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  } else {
    await ordemRepository.updateStatus(id, novoStatus);
  }

  return buscarCompleta(id);
}

export interface NovoItemInput {
  tipo: string;
  descricao: string;
  quantidade: number;
  valorUnitario: number;
  pecaId?: string | null;
}

export async function adicionarItem(ordemId: string, input: NovoItemInput) {
  const itemId = uuidv4();
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await itemOsRepository.create(
      itemId,
      ordemId,
      {
        tipo: input.tipo,
        pecaId: input.pecaId ?? null,
        descricao: input.descricao,
        quantidade: input.quantidade,
        valorUnitario: input.valorUnitario,
      },
      conn
    );
    if (input.tipo === 'peca' && input.pecaId) {
      await pecaRepository.ajustarConsumo(input.pecaId, input.quantidade, conn);
    }
    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
  return buscarCompleta(ordemId);
}

export interface EditarItemInput {
  descricao?: string;
  quantidade?: number;
  valorUnitario?: number;
}

export async function editarItem(
  ordemId: string,
  itemId: string,
  input: EditarItemInput
) {
  const item = await itemOsRepository.findById(itemId);
  if (!item) throw new AppError(404, 'Item não encontrado.');

  const sets: string[] = [];
  const vals: unknown[] = [];
  if (input.descricao !== undefined) {
    sets.push('descricao=?');
    vals.push(input.descricao);
  }
  if (input.quantidade !== undefined) {
    sets.push('quantidade=?');
    vals.push(input.quantidade);
  }
  if (input.valorUnitario !== undefined) {
    sets.push('valor_unitario=?');
    vals.push(input.valorUnitario);
  }
  if (sets.length === 0) {
    throw new AppError(400, 'Nenhum campo.');
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await itemOsRepository.update(itemId, sets, vals, conn);

    if (item.tipo === 'peca' && item.peca_id && input.quantidade !== undefined) {
      const diff = input.quantidade - item.quantidade;
      if (diff !== 0) {
        await pecaRepository.ajustarConsumo(item.peca_id, diff, conn);
      }
    }

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
  return buscarCompleta(ordemId);
}

export async function removerItem(ordemId: string, itemId: string) {
  const item = await itemOsRepository.findById(itemId);
  if (!item) throw new AppError(404, 'Item não encontrado.');

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await itemOsRepository.remove(itemId, conn);
    if (item.tipo === 'peca' && item.peca_id) {
      await pecaRepository.restaurarEstoque(item.peca_id, item.quantidade, conn);
    }
    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
  return buscarCompleta(ordemId);
}

export async function arquivar(id: string): Promise<void> {
  const ordem = await ordemRepository.findById(id);
  if (!ordem) throw new AppError(404, 'Ordem não encontrada.');
  if (ordem.status !== 'finalizado') {
    throw new AppError(400, 'Apenas ordens finalizadas podem ser arquivadas.');
  }
  await ordemRepository.setArquivado(id, true);
}

export async function desarquivar(id: string) {
  const updated = await ordemRepository.setArquivado(id, false);
  if (!updated) {
    throw new AppError(404, 'Ordem não encontrada ou não está arquivada.');
  }
  return buscarCompleta(id);
}

export async function atualizarChecklist(
  id: string,
  checklist: Array<{ zona: string; temDano: boolean; descricao: string }>
) {
  if (!Array.isArray(checklist)) {
    throw new AppError(400, 'checklist deve ser um array.');
  }
  await checklistRepository.deleteByOrdemId(id);
  await checklistRepository.insertMany(id, checklist);
  return buscarCompleta(id);
}
