import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { pool } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { getPagination, paginatedResponse } from '../utils/pagination';
import { PoolConnection } from 'mysql2/promise';

// ---------- Mappers ----------

function mapItem(r: any) {
  return {
    id: r.id,
    tipo: r.tipo,
    pecaId: r.peca_id ?? undefined,
    descricao: r.descricao,
    quantidade: r.quantidade,
    valorUnitario: parseFloat(r.valor_unitario),
  };
}

function mapChecklist(r: any) {
  return {
    zona: r.zona,
    temDano: !!r.tem_dano,
    descricao: r.descricao,
  };
}

function mapOrdem(r: any, itens: any[] = [], checklist: any[] = []) {
  return {
    id: r.id,
    numero: r.numero,
    clienteId: r.cliente_id,
    veiculoId: r.veiculo_id,
    status: r.status,
    dataAbertura: r.data_abertura,
    dataFinalizacao: r.data_finalizacao ?? undefined,
    previsaoEntrega: r.previsao_entrega ?? undefined,
    descricao: r.descricao,
    kmEntrada: r.km_entrada,
    itens: itens.map(mapItem),
    checklistEntrada: checklist.map(mapChecklist),
  };
}

async function fetchOrdemCompleta(id: string, conn?: PoolConnection) {
  const exec = conn ? conn.execute.bind(conn) : pool.execute.bind(pool);
  const [rows] = await exec('SELECT * FROM ordens_servico WHERE id = ?', [id]);
  const ordem = (rows as any[])[0];
  if (!ordem) return null;
  const [itens] = await exec('SELECT * FROM itens_os WHERE ordem_id = ? ORDER BY criado_em', [id]);
  const [checklist] = await exec('SELECT * FROM checklist_entrada WHERE ordem_id = ? ORDER BY id', [id]);
  return mapOrdem(ordem, itens as any[], checklist as any[]);
}

// ---------- Controllers ----------

export async function listar(req: Request, res: Response): Promise<void> {
  const { page, limit, offset, sqlLimit, sqlOffset } = getPagination(req);
  const status = (req.query.status as string) || '';
  const clienteId = (req.query.clienteId as string) || '';

  let where = 'WHERE 1=1';
  const params: any[] = [];
  if (status) { where += ' AND status = ?'; params.push(status); }
  if (clienteId) { where += ' AND cliente_id = ?'; params.push(clienteId); }

  const [countRows] = await pool.execute(`SELECT COUNT(*) as total FROM ordens_servico ${where}`, params);
  const total = Number((countRows as any[])[0].total);

  const [rows] = await pool.execute(
    `SELECT * FROM ordens_servico ${where} ORDER BY data_abertura DESC LIMIT ? OFFSET ?`,
    [...params, sqlLimit, sqlOffset]
  );

  const ordens = await Promise.all(
    (rows as any[]).map(r => fetchOrdemCompleta(r.id))
  );

  res.json(paginatedResponse(ordens.filter(Boolean), total, { page, limit, offset }));
}

export async function criar(req: Request, res: Response): Promise<void> {
  const { clienteId, veiculoId, descricao, kmEntrada = 0, previsaoEntrega } = req.body;
  const id = uuidv4();
  await pool.execute(
    'INSERT INTO ordens_servico (id, cliente_id, veiculo_id, descricao, km_entrada, previsao_entrega) VALUES (?,?,?,?,?,?)',
    [id, clienteId, veiculoId, descricao, kmEntrada, previsaoEntrega ?? null]
  );
  const ordem = await fetchOrdemCompleta(id);
  res.status(201).json(ordem);
}

export async function buscar(req: Request, res: Response): Promise<void> {
  const ordem = await fetchOrdemCompleta(req.params.id);
  if (!ordem) throw new AppError(404, 'Ordem de serviço não encontrada.');
  res.json(ordem);
}

export async function editar(req: Request, res: Response): Promise<void> {
  const { descricao, kmEntrada, clienteId, veiculoId, previsaoEntrega } = req.body;
  const sets: string[] = [];
  const vals: any[] = [];
  if (descricao !== undefined) { sets.push('descricao=?'); vals.push(descricao); }
  if (kmEntrada !== undefined) { sets.push('km_entrada=?'); vals.push(kmEntrada); }
  if (clienteId !== undefined) { sets.push('cliente_id=?'); vals.push(clienteId); }
  if (veiculoId !== undefined) { sets.push('veiculo_id=?'); vals.push(veiculoId); }
  if (previsaoEntrega !== undefined) { sets.push('previsao_entrega=?'); vals.push(previsaoEntrega || null); }
  if (sets.length === 0) { res.status(400).json({ error: 'Nenhum campo para atualizar.' }); return; }
  vals.push(req.params.id);
  const [result] = await pool.execute(`UPDATE ordens_servico SET ${sets.join(',')} WHERE id=?`, vals);
  if ((result as any).affectedRows === 0) throw new AppError(404, 'Ordem não encontrada.');
  res.json(await fetchOrdemCompleta(req.params.id));
}

export async function remover(req: Request, res: Response): Promise<void> {
  // Restaurar estoque antes de remover
  const [itens] = await pool.execute(
    "SELECT * FROM itens_os WHERE ordem_id = ? AND tipo = 'peca'",
    [req.params.id]
  );
  for (const item of itens as any[]) {
    if (item.peca_id) {
      await pool.execute(
        'UPDATE pecas SET quantidade = quantidade + ?, uso_total = GREATEST(0, uso_total - ?) WHERE id = ?',
        [item.quantidade, item.quantidade, item.peca_id]
      );
    }
  }
  const [result] = await pool.execute('DELETE FROM ordens_servico WHERE id = ?', [req.params.id]);
  if ((result as any).affectedRows === 0) throw new AppError(404, 'Ordem não encontrada.');
  res.status(204).send();
}

export async function moverStatus(req: Request, res: Response): Promise<void> {
  const { status: novoStatus } = req.body as { status: string };
  const [rows] = await pool.execute('SELECT * FROM ordens_servico WHERE id = ?', [req.params.id]);
  const ordem = (rows as any[])[0];
  if (!ordem) throw new AppError(404, 'Ordem não encontrada.');

  if (novoStatus === 'finalizado' && ordem.status !== 'finalizado') {
    // Transação: finalizar OS + criar conta receita
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      await conn.execute(
        "UPDATE ordens_servico SET status='finalizado', data_finalizacao=NOW() WHERE id=?",
        [req.params.id]
      );

      // Calcular total dos itens
      const [itens] = await conn.execute(
        'SELECT quantidade, valor_unitario FROM itens_os WHERE ordem_id = ?',
        [req.params.id]
      );
      const total = (itens as any[]).reduce(
        (sum: number, i: any) => sum + i.quantidade * parseFloat(i.valor_unitario),
        0
      );

      if (total > 0) {
        const contaId = uuidv4();
        await conn.execute(
          `INSERT INTO contas (id, tipo, categoria, descricao, valor, data_vencimento, data_pagamento, status, ordem_servico_id, observacoes)
           VALUES (?, 'receita', 'ordem_servico', ?, ?, NOW(), NOW(), 'pago', ?, 'Gerado automaticamente ao finalizar OS')`,
          [contaId, `OS #${ordem.numero}`, total, req.params.id]
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
    await pool.execute('UPDATE ordens_servico SET status=? WHERE id=?', [novoStatus, req.params.id]);
  }

  res.json(await fetchOrdemCompleta(req.params.id));
}

export async function adicionarItem(req: Request, res: Response): Promise<void> {
  const { tipo, descricao, quantidade, valorUnitario, pecaId } = req.body;
  const itemId = uuidv4();

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    await conn.execute(
      'INSERT INTO itens_os (id, ordem_id, tipo, peca_id, descricao, quantidade, valor_unitario) VALUES (?,?,?,?,?,?,?)',
      [itemId, req.params.id, tipo, pecaId ?? null, descricao, quantidade, valorUnitario]
    );

    // Deduzir estoque se for peça
    if (tipo === 'peca' && pecaId) {
      await conn.execute(
        'UPDATE pecas SET quantidade = quantidade - ?, uso_total = uso_total + ? WHERE id = ?',
        [quantidade, quantidade, pecaId]
      );
    }

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }

  res.status(201).json(await fetchOrdemCompleta(req.params.id));
}

export async function editarItem(req: Request, res: Response): Promise<void> {
  const { descricao, quantidade, valorUnitario } = req.body;
  const sets: string[] = [];
  const vals: any[] = [];
  if (descricao !== undefined) { sets.push('descricao=?'); vals.push(descricao); }
  if (quantidade !== undefined) { sets.push('quantidade=?'); vals.push(quantidade); }
  if (valorUnitario !== undefined) { sets.push('valor_unitario=?'); vals.push(valorUnitario); }
  if (sets.length === 0) { res.status(400).json({ error: 'Nenhum campo.' }); return; }
  vals.push(req.params.itemId);
  await pool.execute(`UPDATE itens_os SET ${sets.join(',')} WHERE id=?`, vals);
  res.json(await fetchOrdemCompleta(req.params.id));
}

export async function removerItem(req: Request, res: Response): Promise<void> {
  const [rows] = await pool.execute('SELECT * FROM itens_os WHERE id = ?', [req.params.itemId]);
  const item = (rows as any[])[0];
  if (!item) throw new AppError(404, 'Item não encontrado.');

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    await conn.execute('DELETE FROM itens_os WHERE id = ?', [req.params.itemId]);

    // Restaurar estoque
    if (item.tipo === 'peca' && item.peca_id) {
      await conn.execute(
        'UPDATE pecas SET quantidade = quantidade + ?, uso_total = GREATEST(0, uso_total - ?) WHERE id = ?',
        [item.quantidade, item.quantidade, item.peca_id]
      );
    }

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }

  res.json(await fetchOrdemCompleta(req.params.id));
}

export async function atualizarChecklist(req: Request, res: Response): Promise<void> {
  const checklist = req.body.checklist as Array<{ zona: string; temDano: boolean; descricao: string }>;
  if (!Array.isArray(checklist)) throw new AppError(400, 'checklist deve ser um array.');

  await pool.execute('DELETE FROM checklist_entrada WHERE ordem_id = ?', [req.params.id]);

  for (const item of checklist) {
    await pool.execute(
      'INSERT INTO checklist_entrada (ordem_id, zona, tem_dano, descricao) VALUES (?,?,?,?)',
      [req.params.id, item.zona, item.temDano ? 1 : 0, item.descricao ?? '']
    );
  }

  res.json(await fetchOrdemCompleta(req.params.id));
}
