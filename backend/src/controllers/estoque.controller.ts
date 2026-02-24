import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { pool } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { getPagination, paginatedResponse } from '../utils/pagination';

function mapPeca(r: any, historico: any[] = []) {
  return {
    id: r.id,
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
      quantidade: h.quantidade,
      valorTotal: parseFloat(h.valor_total),
      precoVenda: parseFloat(h.preco_venda),
    })),
  };
}

export async function listar(req: Request, res: Response): Promise<void> {
  const { page, limit, offset, sqlLimit, sqlOffset } = getPagination(req);
  const search = (req.query.q as string) || '';
  const like = `%${search}%`;

  const [countRows] = await pool.execute(
    'SELECT COUNT(*) as total FROM pecas WHERE nome LIKE ? OR marca LIKE ? OR categoria LIKE ?',
    [like, like, like]
  );
  const total = Number((countRows as any[])[0].total);

  const [rows] = await pool.execute(
    'SELECT * FROM pecas WHERE nome LIKE ? OR marca LIKE ? OR categoria LIKE ? ORDER BY nome LIMIT ? OFFSET ?',
    [like, like, like, sqlLimit, sqlOffset]
  );

  res.json(paginatedResponse((rows as any[]).map(r => mapPeca(r)), total, { page, limit, offset }));
}

export async function criar(req: Request, res: Response): Promise<void> {
  const { nome, categoria, marca = '', estoqueMinimo = 0, localizacao = '' } = req.body;
  const id = uuidv4();
  await pool.execute(
    'INSERT INTO pecas (id, nome, categoria, marca, quantidade, estoque_minimo, preco_compra, preco_venda, localizacao) VALUES (?,?,?,?,?,?,?,?,?)',
    [id, nome, categoria, marca, 0, estoqueMinimo, 0, 0, localizacao]
  );
  const [rows] = await pool.execute('SELECT * FROM pecas WHERE id = ?', [id]);
  res.status(201).json(mapPeca((rows as any[])[0], []));
}

export async function buscar(req: Request, res: Response): Promise<void> {
  const [rows] = await pool.execute('SELECT * FROM pecas WHERE id = ?', [req.params.id]);
  const peca = (rows as any[])[0];
  if (!peca) throw new AppError(404, 'Peça não encontrada.');
  const [hist] = await pool.execute('SELECT * FROM historico_precos WHERE peca_id = ? ORDER BY data', [req.params.id]);
  res.json(mapPeca(peca, hist as any[]));
}

export async function editar(req: Request, res: Response): Promise<void> {
  const { nome, categoria, marca, quantidade, estoqueMinimo, precoCompra, precoVenda, localizacao } = req.body;
  const [result] = await pool.execute(
    'UPDATE pecas SET nome=?, categoria=?, marca=?, quantidade=?, estoque_minimo=?, preco_compra=?, preco_venda=?, localizacao=? WHERE id=?',
    [nome, categoria, marca ?? '', quantidade, estoqueMinimo ?? 0, precoCompra, precoVenda, localizacao ?? '', req.params.id]
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

export async function darEntrada(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const { quantidade, valorTotal, precoCompra, precoVenda, fornecedor = '' } = req.body;

  if (!quantidade || quantidade <= 0) throw new AppError(400, 'Quantidade deve ser maior que zero.');
  if (valorTotal < 0) throw new AppError(400, 'Valor total não pode ser negativo.');

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [pecaRows] = await conn.execute('SELECT nome FROM pecas WHERE id = ?', [id]);
    const nomePeca = (pecaRows as any[])[0]?.nome;
    if (!nomePeca) throw new AppError(404, 'Peça não encontrada.');

    await conn.execute(
      'UPDATE pecas SET quantidade = quantidade + ?, preco_compra = ?, preco_venda = ?, atualizado_em = NOW() WHERE id = ?',
      [quantidade, precoCompra, precoVenda, id]
    );

    await conn.execute(
      'INSERT INTO historico_precos (peca_id, preco, fornecedor, quantidade, valor_total, preco_venda) VALUES (?,?,?,?,?,?)',
      [id, precoCompra, fornecedor, quantidade, valorTotal, precoVenda]
    );

    const despesaId = uuidv4();
    await conn.execute(
      `INSERT INTO contas (id, tipo, categoria, descricao, valor, data_vencimento, status, data_pagamento)
       VALUES (?, 'despesa', 'compra_peca', ?, ?, NOW(), 'pago', NOW())`,
      [despesaId, `Compra de peça: ${nomePeca} (${quantidade} un.)`, valorTotal]
    );

    await conn.commit();

    const [rows] = await pool.execute('SELECT * FROM pecas WHERE id = ?', [id]);
    const [hist] = await pool.execute('SELECT * FROM historico_precos WHERE peca_id = ? ORDER BY data', [id]);
    res.json(mapPeca((rows as any[])[0], hist as any[]));
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}
