import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import { pool } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { env } from '../config/env';

function mapUsuario(r: any) {
  return { id: r.id, nome: r.nome, email: r.email, role: r.role, ativo: !!r.ativo, criadoEm: r.criado_em };
}

export async function listar(_req: Request, res: Response): Promise<void> {
  const [rows] = await pool.execute('SELECT id, nome, email, role, ativo, criado_em FROM usuarios ORDER BY nome');
  res.json((rows as any[]).map(mapUsuario));
}

export async function criar(req: Request, res: Response): Promise<void> {
  const { nome, email, senha, role = 'funcionario' } = req.body;
  const id = uuidv4();
  const hash = await bcrypt.hash(senha, env.BCRYPT_ROUNDS);
  await pool.execute(
    'INSERT INTO usuarios (id, nome, email, senha_hash, role) VALUES (?,?,?,?,?)',
    [id, nome, email.toLowerCase().trim(), hash, role]
  );
  const [rows] = await pool.execute('SELECT id, nome, email, role, ativo, criado_em FROM usuarios WHERE id = ?', [id]);
  res.status(201).json(mapUsuario((rows as any[])[0]));
}

export async function buscar(req: Request, res: Response): Promise<void> {
  const [rows] = await pool.execute('SELECT id, nome, email, role, ativo, criado_em FROM usuarios WHERE id = ?', [req.params.id]);
  const u = (rows as any[])[0];
  if (!u) throw new AppError(404, 'Usuário não encontrado.');
  res.json(mapUsuario(u));
}

export async function editar(req: Request, res: Response): Promise<void> {
  const { nome, email, senha, role, ativo } = req.body;
  const sets: string[] = [];
  const vals: any[] = [];
  if (nome !== undefined) { sets.push('nome=?'); vals.push(nome); }
  if (email !== undefined) { sets.push('email=?'); vals.push(email.toLowerCase().trim()); }
  if (senha !== undefined) { sets.push('senha_hash=?'); vals.push(await bcrypt.hash(senha, env.BCRYPT_ROUNDS)); }
  if (role !== undefined) { sets.push('role=?'); vals.push(role); }
  if (ativo !== undefined) { sets.push('ativo=?'); vals.push(ativo ? 1 : 0); }
  if (sets.length === 0) { res.status(400).json({ error: 'Nenhum campo para atualizar.' }); return; }
  vals.push(req.params.id);
  const [result] = await pool.execute(`UPDATE usuarios SET ${sets.join(',')} WHERE id=?`, vals);
  if ((result as any).affectedRows === 0) throw new AppError(404, 'Usuário não encontrado.');
  const [rows] = await pool.execute('SELECT id, nome, email, role, ativo, criado_em FROM usuarios WHERE id = ?', [req.params.id]);
  res.json(mapUsuario((rows as any[])[0]));
}

export async function remover(req: Request, res: Response): Promise<void> {
  // Não permite deletar o próprio usuário
  if (req.params.id === req.user!.sub) {
    throw new AppError(400, 'Não é possível remover o próprio usuário.');
  }
  const [result] = await pool.execute('DELETE FROM usuarios WHERE id = ?', [req.params.id]);
  if ((result as any).affectedRows === 0) throw new AppError(404, 'Usuário não encontrado.');
  res.status(204).send();
}
