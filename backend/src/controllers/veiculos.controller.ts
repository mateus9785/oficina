import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { pool } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { getPagination, paginatedResponse } from '../utils/pagination';

function mapVeiculo(r: any) {
  return {
    id: r.id,
    clienteId: r.cliente_id,
    tipo: r.tipo,
    marca: r.marca,
    modelo: r.modelo,
    ano: r.ano,
    placa: r.placa,
    cor: r.cor,
    observacoes: r.observacoes,
  };
}

export async function listar(req: Request, res: Response): Promise<void> {
  const { page, limit, offset, sqlLimit, sqlOffset } = getPagination(req);
  const search = (req.query.q as string) || '';
  const like = `%${search}%`;

  const [countRows] = await pool.execute(
    'SELECT COUNT(*) as total FROM veiculos WHERE placa LIKE ? OR marca LIKE ? OR modelo LIKE ?',
    [like, like, like]
  );
  const total = (countRows as any[])[0].total as number;

  const [rows] = await pool.execute(
    'SELECT * FROM veiculos WHERE placa LIKE ? OR marca LIKE ? OR modelo LIKE ? ORDER BY modelo LIMIT ? OFFSET ?',
    [like, like, like, sqlLimit, sqlOffset]
  );

  res.json(paginatedResponse((rows as any[]).map(mapVeiculo), total, { page, limit, offset }));
}

export async function criar(req: Request, res: Response): Promise<void> {
  const { clienteId, tipo, marca = '', modelo = '', ano = null, placa, cor = '', observacoes = '' } = req.body;
  const id = uuidv4();
  await pool.execute(
    'INSERT INTO veiculos (id, cliente_id, tipo, marca, modelo, ano, placa, cor, observacoes) VALUES (?,?,?,?,?,?,?,?,?)',
    [id, clienteId, tipo, marca, modelo, ano, placa.toUpperCase(), cor, observacoes]
  );
  const [rows] = await pool.execute('SELECT * FROM veiculos WHERE id = ?', [id]);
  res.status(201).json(mapVeiculo((rows as any[])[0]));
}

export async function buscar(req: Request, res: Response): Promise<void> {
  const [rows] = await pool.execute('SELECT * FROM veiculos WHERE id = ?', [req.params.id]);
  const v = (rows as any[])[0];
  if (!v) throw new AppError(404, 'Veículo não encontrado.');
  res.json(mapVeiculo(v));
}

export async function editar(req: Request, res: Response): Promise<void> {
  const { clienteId, tipo, marca, modelo, ano, placa, cor, observacoes } = req.body;
  const [result] = await pool.execute(
    'UPDATE veiculos SET cliente_id=?, tipo=?, marca=?, modelo=?, ano=?, placa=?, cor=?, observacoes=? WHERE id=?',
    [clienteId, tipo, marca, modelo, ano, placa.toUpperCase(), cor ?? '', observacoes ?? '', req.params.id]
  );
  if ((result as any).affectedRows === 0) throw new AppError(404, 'Veículo não encontrado.');
  const [rows] = await pool.execute('SELECT * FROM veiculos WHERE id = ?', [req.params.id]);
  res.json(mapVeiculo((rows as any[])[0]));
}

export async function remover(req: Request, res: Response): Promise<void> {
  const [result] = await pool.execute('DELETE FROM veiculos WHERE id = ?', [req.params.id]);
  if ((result as any).affectedRows === 0) throw new AppError(404, 'Veículo não encontrado.');
  res.status(204).send();
}
