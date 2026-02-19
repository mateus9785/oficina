import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { pool } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { getPagination, paginatedResponse } from '../utils/pagination';

function mapConta(r: any) {
  return {
    id: r.id,
    tipo: r.tipo,
    categoria: r.categoria,
    descricao: r.descricao,
    valor: parseFloat(r.valor),
    dataVencimento: r.data_vencimento,
    dataPagamento: r.data_pagamento ?? undefined,
    status: r.status,
    ordemServicoId: r.ordem_servico_id ?? undefined,
    observacoes: r.observacoes,
  };
}

export async function listar(req: Request, res: Response): Promise<void> {
  const { page, limit, offset } = getPagination(req);
  const tipo = (req.query.tipo as string) || '';
  const status = (req.query.status as string) || '';

  let where = 'WHERE 1=1';
  const params: any[] = [];
  if (tipo) { where += ' AND tipo = ?'; params.push(tipo); }
  if (status) { where += ' AND status = ?'; params.push(status); }

  const [countRows] = await pool.execute(`SELECT COUNT(*) as total FROM contas ${where}`, params);
  const total = (countRows as any[])[0].total as number;

  const [rows] = await pool.execute(
    `SELECT * FROM contas ${where} ORDER BY data_vencimento DESC LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  res.json(paginatedResponse((rows as any[]).map(mapConta), total, { page, limit, offset }));
}

export async function criar(req: Request, res: Response): Promise<void> {
  const { tipo, categoria, descricao, valor, dataVencimento, status = 'pendente', ordemServicoId, observacoes = '' } = req.body;
  const id = uuidv4();
  await pool.execute(
    'INSERT INTO contas (id, tipo, categoria, descricao, valor, data_vencimento, status, ordem_servico_id, observacoes) VALUES (?,?,?,?,?,?,?,?,?)',
    [id, tipo, categoria, descricao, valor, dataVencimento, status, ordemServicoId ?? null, observacoes]
  );
  const [rows] = await pool.execute('SELECT * FROM contas WHERE id = ?', [id]);
  res.status(201).json(mapConta((rows as any[])[0]));
}

export async function buscar(req: Request, res: Response): Promise<void> {
  const [rows] = await pool.execute('SELECT * FROM contas WHERE id = ?', [req.params.id]);
  const conta = (rows as any[])[0];
  if (!conta) throw new AppError(404, 'Conta não encontrada.');
  res.json(mapConta(conta));
}

export async function editar(req: Request, res: Response): Promise<void> {
  const { tipo, categoria, descricao, valor, dataVencimento, status, ordemServicoId, observacoes } = req.body;
  const [result] = await pool.execute(
    'UPDATE contas SET tipo=?, categoria=?, descricao=?, valor=?, data_vencimento=?, status=?, ordem_servico_id=?, observacoes=? WHERE id=?',
    [tipo, categoria, descricao, valor, dataVencimento, status ?? 'pendente', ordemServicoId ?? null, observacoes ?? '', req.params.id]
  );
  if ((result as any).affectedRows === 0) throw new AppError(404, 'Conta não encontrada.');
  const [rows] = await pool.execute('SELECT * FROM contas WHERE id = ?', [req.params.id]);
  res.json(mapConta((rows as any[])[0]));
}

export async function remover(req: Request, res: Response): Promise<void> {
  const [result] = await pool.execute('DELETE FROM contas WHERE id = ?', [req.params.id]);
  if ((result as any).affectedRows === 0) throw new AppError(404, 'Conta não encontrada.');
  res.status(204).send();
}

export async function pagar(req: Request, res: Response): Promise<void> {
  const [result] = await pool.execute(
    "UPDATE contas SET status='pago', data_pagamento=NOW() WHERE id=?",
    [req.params.id]
  );
  if ((result as any).affectedRows === 0) throw new AppError(404, 'Conta não encontrada.');
  const [rows] = await pool.execute('SELECT * FROM contas WHERE id = ?', [req.params.id]);
  res.json(mapConta((rows as any[])[0]));
}
