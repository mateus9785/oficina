import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { pool } from '../config/database';
import { AppError } from '../middleware/errorHandler';

const CATEGORIAS_VALIDAS = ['aluguel', 'salario', 'energia', 'agua', 'internet', 'manutencao', 'outros'] as const;

/** Data de hoje no fuso horário do Brasil (America/Sao_Paulo), formato YYYY-MM-DD. */
function hojeLocal(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date());
}

function mapRecorrente(r: any) {
  return {
    id: r.id,
    categoria: r.categoria,
    descricao: r.descricao,
    valor: parseFloat(r.valor),
    diaVencimento: r.dia_vencimento,
    ativo: r.ativo === 1 || r.ativo === true,
    observacoes: r.observacoes,
  };
}

export async function listar(req: Request, res: Response): Promise<void> {
  const [rows] = await pool.execute('SELECT * FROM despesas_recorrentes WHERE usuario_id = ? ORDER BY descricao', [
    req.user!.sub,
  ]);
  res.json((rows as any[]).map(mapRecorrente));
}

export async function criar(req: Request, res: Response): Promise<void> {
  const usuarioId = req.user!.sub;
  const { categoria, descricao = '', valor, diaVencimento, observacoes = '' } = req.body;
  if (!CATEGORIAS_VALIDAS.includes(categoria)) throw new AppError(400, 'Categoria inválida.');
  if (!diaVencimento || diaVencimento < 1 || diaVencimento > 31) throw new AppError(400, 'Dia de vencimento deve ser entre 1 e 31.');
  if (!valor || Number(valor) <= 0) throw new AppError(400, 'Valor deve ser positivo.');
  const id = uuidv4();
  await pool.execute(
    'INSERT INTO despesas_recorrentes (id, usuario_id, categoria, descricao, valor, dia_vencimento, observacoes) VALUES (?,?,?,?,?,?,?)',
    [id, usuarioId, categoria, descricao, valor, diaVencimento, observacoes]
  );
  const [rows] = await pool.execute('SELECT * FROM despesas_recorrentes WHERE id = ? AND usuario_id = ?', [id, usuarioId]);
  res.status(201).json(mapRecorrente((rows as any[])[0]));
}

export async function editar(req: Request, res: Response): Promise<void> {
  const usuarioId = req.user!.sub;
  const { categoria, descricao = '', valor, diaVencimento, observacoes = '' } = req.body;
  if (categoria && !CATEGORIAS_VALIDAS.includes(categoria)) throw new AppError(400, 'Categoria inválida.');
  if (diaVencimento && (diaVencimento < 1 || diaVencimento > 31)) throw new AppError(400, 'Dia de vencimento deve ser entre 1 e 31.');
  const [result] = await pool.execute(
    'UPDATE despesas_recorrentes SET categoria=?, descricao=?, valor=?, dia_vencimento=?, observacoes=? WHERE id=? AND usuario_id=?',
    [categoria, descricao, valor, diaVencimento, observacoes, req.params.id, usuarioId]
  );
  if ((result as any).affectedRows === 0) throw new AppError(404, 'Despesa recorrente não encontrada.');
  const [rows] = await pool.execute('SELECT * FROM despesas_recorrentes WHERE id = ? AND usuario_id = ?', [req.params.id, usuarioId]);
  res.json(mapRecorrente((rows as any[])[0]));
}

export async function remover(req: Request, res: Response): Promise<void> {
  const [result] = await pool.execute('DELETE FROM despesas_recorrentes WHERE id = ? AND usuario_id = ?', [
    req.params.id,
    req.user!.sub,
  ]);
  if ((result as any).affectedRows === 0) throw new AppError(404, 'Despesa recorrente não encontrada.');
  res.status(204).send();
}

export async function toggleAtivo(req: Request, res: Response): Promise<void> {
  const usuarioId = req.user!.sub;
  const [rows] = await pool.execute('SELECT ativo FROM despesas_recorrentes WHERE id = ? AND usuario_id = ?', [
    req.params.id,
    usuarioId,
  ]);
  const rec = (rows as any[])[0];
  if (!rec) throw new AppError(404, 'Despesa recorrente não encontrada.');
  const novoAtivo = rec.ativo ? 0 : 1;
  await pool.execute('UPDATE despesas_recorrentes SET ativo=? WHERE id=? AND usuario_id=?', [novoAtivo, req.params.id, usuarioId]);
  const [updated] = await pool.execute('SELECT * FROM despesas_recorrentes WHERE id = ? AND usuario_id = ?', [req.params.id, usuarioId]);
  res.json(mapRecorrente((updated as any[])[0]));
}

/**
 * Sem `usuarioId`: caminho do cron/boot, processa a despesa recorrente de TODOS os tenants
 * (cada `conta` gerada carrega o `usuario_id` da própria linha de `despesas_recorrentes`, então
 * nada vaza entre contas). Com `usuarioId`: caminho do disparo manual (`processarManual`),
 * processa só as recorrentes daquele usuário.
 */
export async function processarRecorrentes(usuarioId?: string): Promise<void> {
  try {
    const hojeStr = hojeLocal(); // YYYY-MM-DD
    const hoje = new Date(`${hojeStr}T00:00:00`);
    const alvo = new Date(hoje);
    alvo.setDate(alvo.getDate() + 10);
    const diaAlvo = alvo.getDate();
    const alvoStr = alvo.toISOString().slice(0, 10); // YYYY-MM-DD

    const where = usuarioId
      ? 'WHERE ativo = 1 AND dia_vencimento = ? AND usuario_id = ?'
      : 'WHERE ativo = 1 AND dia_vencimento = ?';
    const params = usuarioId ? [diaAlvo, usuarioId] : [diaAlvo];
    const [rows] = await pool.execute(`SELECT * FROM despesas_recorrentes ${where}`, params);
    const recorrentes = rows as any[];

    for (const rec of recorrentes) {
      const [existing] = await pool.execute(
        'SELECT id FROM contas WHERE recorrente_id = ? AND DATE(data_vencimento) = ?',
        [rec.id, alvoStr]
      );
      if ((existing as any[]).length > 0) continue;

      const id = uuidv4();
      const mysqlDate = `${alvoStr} 00:00:00`;
      await pool.execute(
        'INSERT INTO contas (id, usuario_id, tipo, categoria, descricao, valor, data_vencimento, status, recorrente_id) VALUES (?,?,?,?,?,?,?,?,?)',
        [id, rec.usuario_id, 'despesa', rec.categoria, rec.descricao, rec.valor, mysqlDate, 'pendente', rec.id]
      );
      console.log(`✓ Despesa recorrente gerada: ${rec.descricao} — vencimento ${alvoStr}`);
    }
  } catch (err) {
    console.error('✗ Erro ao processar despesas recorrentes:', err);
  }
}

export async function processarManual(req: Request, res: Response): Promise<void> {
  await processarRecorrentes(req.user!.sub);
  res.json({ ok: true, message: 'Processamento de recorrentes executado.' });
}
