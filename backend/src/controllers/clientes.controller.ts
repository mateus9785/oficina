import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { pool } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { getPagination, paginatedResponse } from '../utils/pagination';

export async function listar(req: Request, res: Response): Promise<void> {
  const { page, limit, offset } = getPagination(req);
  const search = (req.query.q as string) || '';
  const like = `%${search}%`;

  const [countRows] = await pool.execute(
    'SELECT COUNT(*) as total FROM clientes WHERE nome LIKE ? OR cpf_cnpj LIKE ? OR email LIKE ?',
    [like, like, like]
  );
  const total = (countRows as any[])[0].total as number;

  const [rows] = await pool.execute(
    'SELECT * FROM clientes WHERE nome LIKE ? OR cpf_cnpj LIKE ? OR email LIKE ? ORDER BY nome LIMIT ? OFFSET ?',
    [like, like, like, limit, offset]
  );

  res.json(paginatedResponse(mapClientes(rows as any[]), total, { page, limit, offset }));
}

export async function verificarCpf(req: Request, res: Response): Promise<void> {
  const { cpf, excludeId } = req.query as { cpf?: string; excludeId?: string };
  if (!cpf?.trim()) { res.json({ exists: false }); return; }
  const [rows] = await pool.execute(
    'SELECT id FROM clientes WHERE cpf_cnpj = ? AND id != ?',
    [cpf.trim(), excludeId || '']
  );
  res.json({ exists: (rows as any[]).length > 0 });
}

export async function criar(req: Request, res: Response): Promise<void> {
  const { nome, cpfCnpj, telefone = '', email = '', endereco = '', observacoes = '' } = req.body;
  if (cpfCnpj?.trim()) {
    const [dup] = await pool.execute('SELECT id FROM clientes WHERE cpf_cnpj = ?', [cpfCnpj.trim()]);
    if ((dup as any[]).length > 0) throw new AppError(409, 'CPF/CNPJ já cadastrado.');
  }
  const id = uuidv4();
  await pool.execute(
    'INSERT INTO clientes (id, nome, cpf_cnpj, telefone, email, endereco, observacoes) VALUES (?,?,?,?,?,?,?)',
    [id, nome, cpfCnpj, telefone, email, endereco, observacoes]
  );
  const [rows] = await pool.execute('SELECT * FROM clientes WHERE id = ?', [id]);
  res.status(201).json(mapCliente((rows as any[])[0]));
}

export async function buscar(req: Request, res: Response): Promise<void> {
  const [rows] = await pool.execute('SELECT * FROM clientes WHERE id = ?', [req.params.id]);
  const cliente = (rows as any[])[0];
  if (!cliente) throw new AppError(404, 'Cliente não encontrado.');
  res.json(mapCliente(cliente));
}

export async function editar(req: Request, res: Response): Promise<void> {
  const { nome, cpfCnpj, telefone, email, endereco, observacoes } = req.body;
  if (cpfCnpj?.trim()) {
    const [dup] = await pool.execute(
      'SELECT id FROM clientes WHERE cpf_cnpj = ? AND id != ?',
      [cpfCnpj.trim(), req.params.id]
    );
    if ((dup as any[]).length > 0) throw new AppError(409, 'CPF/CNPJ já cadastrado.');
  }
  const [result] = await pool.execute(
    'UPDATE clientes SET nome=?, cpf_cnpj=?, telefone=?, email=?, endereco=?, observacoes=? WHERE id=?',
    [nome, cpfCnpj, telefone ?? '', email ?? '', endereco ?? '', observacoes ?? '', req.params.id]
  );
  if ((result as any).affectedRows === 0) throw new AppError(404, 'Cliente não encontrado.');
  const [rows] = await pool.execute('SELECT * FROM clientes WHERE id = ?', [req.params.id]);
  res.json(mapCliente((rows as any[])[0]));
}

export async function remover(req: Request, res: Response): Promise<void> {
  const [result] = await pool.execute('DELETE FROM clientes WHERE id = ?', [req.params.id]);
  if ((result as any).affectedRows === 0) throw new AppError(404, 'Cliente não encontrado.');
  res.status(204).send();
}

export async function veiculosDoCliente(req: Request, res: Response): Promise<void> {
  const [rows] = await pool.execute(
    'SELECT * FROM veiculos WHERE cliente_id = ? ORDER BY modelo',
    [req.params.id]
  );
  res.json(mapVeiculos(rows as any[]));
}

function mapCliente(r: any) {
  return {
    id: r.id,
    nome: r.nome,
    cpfCnpj: r.cpf_cnpj,
    telefone: r.telefone,
    email: r.email,
    endereco: r.endereco,
    observacoes: r.observacoes,
    dataCadastro: r.data_cadastro,
  };
}
function mapClientes(rows: any[]) { return rows.map(mapCliente); }

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
function mapVeiculos(rows: any[]) { return rows.map(mapVeiculo); }
