import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { pool } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { getPagination, paginatedResponse } from '../utils/pagination';

function mapPeca(r: any, historico: any[] = []) {
  return {
    id: r.id,
    codigo: r.codigo,
    nome: r.nome,
    categoria: r.categoria,
    marca: r.marca,
    quantidade: r.quantidade,
    estoqueMinimo: r.estoque_minimo,
    precoCompra: parseFloat(r.preco_compra),
    precoVenda: parseFloat(r.preco_venda),
    localizacao: r.localizacao,
    usoTotal: r.uso_total,
    historicoPrecos: historico.map((h: any) => ({
      data: h.data,
      preco: parseFloat(h.preco),
      fornecedor: h.fornecedor,
    })),
  };
}

export async function listar(req: Request, res: Response): Promise<void> {
  const { page, limit, offset, sqlLimit, sqlOffset } = getPagination(req);
  const search = (req.query.q as string) || '';
  const like = `%${search}%`;

  const [countRows] = await pool.execute(
    'SELECT COUNT(*) as total FROM pecas WHERE nome LIKE ? OR codigo LIKE ? OR categoria LIKE ?',
    [like, like, like]
  );
  const total = (countRows as any[])[0].total as number;

  const [rows] = await pool.execute(
    'SELECT * FROM pecas WHERE nome LIKE ? OR codigo LIKE ? OR categoria LIKE ? ORDER BY nome LIMIT ? OFFSET ?',
    [like, like, like, sqlLimit, sqlOffset]
  );

  res.json(paginatedResponse((rows as any[]).map(r => mapPeca(r)), total, { page, limit, offset }));
}

export async function criar(req: Request, res: Response): Promise<void> {
  const { codigo, nome, categoria, marca = '', quantidade, estoqueMinimo = 0, precoCompra, precoVenda, localizacao = '' } = req.body;
  const id = uuidv4();
  await pool.execute(
    'INSERT INTO pecas (id, codigo, nome, categoria, marca, quantidade, estoque_minimo, preco_compra, preco_venda, localizacao) VALUES (?,?,?,?,?,?,?,?,?,?)',
    [id, codigo, nome, categoria, marca, quantidade, estoqueMinimo, precoCompra, precoVenda, localizacao]
  );
  await pool.execute(
    'INSERT INTO historico_precos (peca_id, preco, fornecedor) VALUES (?, ?, ?)',
    [id, precoCompra, 'Cadastro inicial']
  );
  const [rows] = await pool.execute('SELECT * FROM pecas WHERE id = ?', [id]);
  const [hist] = await pool.execute('SELECT * FROM historico_precos WHERE peca_id = ? ORDER BY data', [id]);
  res.status(201).json(mapPeca((rows as any[])[0], hist as any[]));
}

export async function buscar(req: Request, res: Response): Promise<void> {
  const [rows] = await pool.execute('SELECT * FROM pecas WHERE id = ?', [req.params.id]);
  const peca = (rows as any[])[0];
  if (!peca) throw new AppError(404, 'Peça não encontrada.');
  const [hist] = await pool.execute('SELECT * FROM historico_precos WHERE peca_id = ? ORDER BY data', [req.params.id]);
  res.json(mapPeca(peca, hist as any[]));
}

export async function editar(req: Request, res: Response): Promise<void> {
  const { codigo, nome, categoria, marca, quantidade, estoqueMinimo, precoCompra, precoVenda, localizacao } = req.body;
  const [result] = await pool.execute(
    'UPDATE pecas SET codigo=?, nome=?, categoria=?, marca=?, quantidade=?, estoque_minimo=?, preco_compra=?, preco_venda=?, localizacao=? WHERE id=?',
    [codigo, nome, categoria, marca ?? '', quantidade, estoqueMinimo ?? 0, precoCompra, precoVenda, localizacao ?? '', req.params.id]
  );
  if ((result as any).affectedRows === 0) throw new AppError(404, 'Peça não encontrada.');
  const [rows] = await pool.execute('SELECT * FROM pecas WHERE id = ?', [req.params.id]);
  const [hist] = await pool.execute('SELECT * FROM historico_precos WHERE peca_id = ? ORDER BY data', [req.params.id]);
  res.json(mapPeca((rows as any[])[0], hist as any[]));
}

export async function remover(req: Request, res: Response): Promise<void> {
  const [result] = await pool.execute('DELETE FROM pecas WHERE id = ?', [req.params.id]);
  if ((result as any).affectedRows === 0) throw new AppError(404, 'Peça não encontrada.');
  res.status(204).send();
}

export async function alertasEstoque(_req: Request, res: Response): Promise<void> {
  const [rows] = await pool.execute(
    'SELECT * FROM pecas WHERE quantidade <= estoque_minimo ORDER BY nome'
  );
  res.json((rows as any[]).map(r => mapPeca(r)));
}

export async function adicionarHistoricoPreco(req: Request, res: Response): Promise<void> {
  const { preco, fornecedor = '' } = req.body;
  await pool.execute(
    'UPDATE pecas SET preco_compra = ? WHERE id = ?',
    [preco, req.params.id]
  );
  await pool.execute(
    'INSERT INTO historico_precos (peca_id, preco, fornecedor) VALUES (?,?,?)',
    [req.params.id, preco, fornecedor]
  );
  const [rows] = await pool.execute('SELECT * FROM pecas WHERE id = ?', [req.params.id]);
  if (!(rows as any[])[0]) throw new AppError(404, 'Peça não encontrada.');
  const [hist] = await pool.execute('SELECT * FROM historico_precos WHERE peca_id = ? ORDER BY data', [req.params.id]);
  res.json(mapPeca((rows as any[])[0], hist as any[]));
}
