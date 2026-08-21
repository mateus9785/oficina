import { Request, Response } from 'express';
import { pool } from '../config/database';

export async function listar(req: Request, res: Response): Promise<void> {
  const [rows] = await pool.execute('SELECT chave, valor FROM configuracoes WHERE usuario_id = ?', [req.user!.sub]);
  const config: Record<string, string> = {};
  for (const row of rows as any[]) {
    config[row.chave] = row.valor;
  }
  res.json(config);
}

export async function atualizar(req: Request, res: Response): Promise<void> {
  const usuarioId = req.user!.sub;
  const { chave } = req.params;
  const { valor } = req.body;
  await pool.execute(
    'INSERT INTO configuracoes (usuario_id, chave, valor) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE valor = ?',
    [usuarioId, chave, String(valor), String(valor)]
  );
  res.json({ chave, valor: String(valor) });
}
