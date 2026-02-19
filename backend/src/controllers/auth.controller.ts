import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { pool } from '../config/database';
import { signToken } from '../utils/jwt';
import { AppError } from '../middleware/errorHandler';

export async function login(req: Request, res: Response): Promise<void> {
  const { email, senha } = req.body as { email: string; senha: string };

  const [rows] = await pool.execute(
    'SELECT id, nome, email, senha_hash, role, ativo FROM usuarios WHERE email = ?',
    [email.toLowerCase().trim()]
  );
  const usuario = (rows as any[])[0];

  if (!usuario || !usuario.ativo) {
    throw new AppError(401, 'Credenciais inválidas.');
  }

  const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);
  if (!senhaValida) {
    throw new AppError(401, 'Credenciais inválidas.');
  }

  const token = signToken({ sub: usuario.id, email: usuario.email, role: usuario.role });

  res.json({
    token,
    usuario: {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      role: usuario.role,
    },
  });
}

export async function mudarSenha(req: Request, res: Response): Promise<void> {
  const { senhaAtual, novaSenha } = req.body as { senhaAtual: string; novaSenha: string };

  const [rows] = await pool.execute(
    'SELECT senha_hash FROM usuarios WHERE id = ?',
    [req.user!.sub]
  );
  const usuario = (rows as any[])[0];
  if (!usuario) throw new AppError(404, 'Usuário não encontrado.');

  const senhaValida = await bcrypt.compare(senhaAtual, usuario.senha_hash);
  if (!senhaValida) throw new AppError(400, 'Senha atual incorreta.');

  const hash = await bcrypt.hash(novaSenha, 10);
  await pool.execute('UPDATE usuarios SET senha_hash = ? WHERE id = ?', [hash, req.user!.sub]);

  res.json({ message: 'Senha alterada com sucesso.' });
}

export async function getMe(req: Request, res: Response): Promise<void> {
  const [rows] = await pool.execute(
    'SELECT id, nome, email, role, ativo FROM usuarios WHERE id = ?',
    [req.user!.sub]
  );
  const usuario = (rows as any[])[0];
  if (!usuario) throw new AppError(404, 'Usuário não encontrado.');
  res.json(usuario);
}
