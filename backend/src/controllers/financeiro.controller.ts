import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { pool } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { getPagination, paginatedResponse } from '../utils/pagination';

/** Data de hoje no fuso horário do Brasil (America/Sao_Paulo), formato YYYY-MM-DD. */
function hojeLocal(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date());
}

function mapConta(r: any) {
  const hojeStr = hojeLocal();
  const vencStr = new Date(r.data_vencimento).toISOString().slice(0, 10);
  // 'atrasado' é sempre computado: nunca confia no valor gravado
  let status = r.status === 'pago' ? 'pago' : (vencStr < hojeStr ? 'atrasado' : 'pendente');
  return {
    id: r.id,
    tipo: r.tipo,
    categoria: r.categoria,
    descricao: r.descricao,
    valor: parseFloat(r.valor),
    dataVencimento: r.data_vencimento,
    dataPagamento: r.data_pagamento ?? undefined,
    status,
    ordemServicoId: r.ordem_servico_id ?? undefined,
  };
}

export async function listar(req: Request, res: Response): Promise<void> {
  const { page, limit, offset, sqlLimit, sqlOffset } = getPagination(req);
  const tipo = (req.query.tipo as string) || '';
  const status = (req.query.status as string) || '';

  const hoje = hojeLocal();
  let where = 'WHERE 1=1';
  const params: any[] = [];
  if (tipo) { where += ' AND tipo = ?'; params.push(tipo); }
  if (status === 'atrasado') {
    where += " AND status != 'pago' AND DATE(data_vencimento) < ?"; params.push(hoje);
  } else if (status === 'pendente') {
    where += " AND status != 'pago' AND DATE(data_vencimento) >= ?"; params.push(hoje);
  } else if (status) {
    where += ' AND status = ?'; params.push(status);
  }

  const [countRows] = await pool.execute(`SELECT COUNT(*) as total FROM contas ${where}`, params);
  const total = Number((countRows as any[])[0].total);

  const [rows] = await pool.execute(
    `SELECT * FROM contas ${where}
     ORDER BY
       CASE
         WHEN status != 'pago' AND DATE(data_vencimento) < ? THEN 1
         WHEN status != 'pago' THEN 2
         WHEN status = 'pago' THEN 3
         ELSE 4
       END,
       data_vencimento ASC
     LIMIT ? OFFSET ?`,
    [...params, hoje, sqlLimit, sqlOffset]
  );

  res.json(paginatedResponse((rows as any[]).map(mapConta), total, { page, limit, offset }));
}

export async function criar(req: Request, res: Response): Promise<void> {
  const { tipo, categoria, descricao = '', valor, dataVencimento, status = 'pendente', ordemServicoId } = req.body;
  const mysqlDate = new Date(dataVencimento).toISOString().slice(0, 19).replace('T', ' ');
  const id = uuidv4();
  await pool.execute(
    'INSERT INTO contas (id, tipo, categoria, descricao, valor, data_vencimento, status, ordem_servico_id) VALUES (?,?,?,?,?,?,?,?)',
    [id, tipo, categoria, descricao, valor, mysqlDate, status, ordemServicoId ?? null]
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
  const { tipo, categoria, descricao = '', valor, dataVencimento, status, ordemServicoId } = req.body;
  const mysqlDate = new Date(dataVencimento).toISOString().slice(0, 19).replace('T', ' ');
  const [result] = await pool.execute(
    'UPDATE contas SET tipo=?, categoria=?, descricao=?, valor=?, data_vencimento=?, status=?, ordem_servico_id=? WHERE id=?',
    [tipo, categoria, descricao, valor, mysqlDate, status ?? 'pendente', ordemServicoId ?? null, req.params.id]
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
