import { Request, Response } from 'express';
import { pool } from '../config/database';

export async function diario(req: Request, res: Response): Promise<void> {
  const data = (req.query.data as string) || new Date().toISOString().slice(0, 10);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) {
    res.status(400).json({ error: 'Data inválida. Use o formato YYYY-MM-DD' });
    return;
  }

  const [entradasRows, saidasRows, ordensRows, contasRows] = await Promise.all([
    // Entradas de estoque (compras/recebimentos registrados no dia)
    pool.execute(
      `SELECT hp.id, hp.peca_id, hp.data, hp.preco, hp.fornecedor, hp.quantidade, hp.valor_total, hp.preco_venda,
              p.nome, p.categoria, p.marca
       FROM historico_precos hp
       JOIN pecas p ON p.id = hp.peca_id
       WHERE DATE(hp.data) = ?
       ORDER BY hp.data DESC`,
      [data]
    ),

    // Saídas de estoque (itens de peça adicionados a OS no dia)
    pool.execute(
      `SELECT io.id, io.ordem_id, io.peca_id, io.descricao, io.quantidade, io.valor_unitario, io.criado_em,
              p.nome AS peca_nome, p.categoria, p.marca,
              o.numero AS os_numero
       FROM itens_os io
       JOIN ordens_servico o ON o.id = io.ordem_id
       LEFT JOIN pecas p ON p.id = io.peca_id
       WHERE io.tipo = 'peca' AND io.peca_id IS NOT NULL AND DATE(io.criado_em) = ?
       ORDER BY io.criado_em DESC`,
      [data]
    ),

    // OS abertas ou finalizadas no dia
    pool.execute(
      `SELECT o.id, o.numero, o.status, o.data_abertura, o.data_finalizacao,
              o.nome_cliente, o.descricao_veiculo, o.desconto_percentual,
              c.nome AS cliente_nome,
              v.placa, v.marca AS veiculo_marca, v.modelo AS veiculo_modelo,
              COALESCE(SUM(io.quantidade * io.valor_unitario), 0) AS valor_bruto
       FROM ordens_servico o
       LEFT JOIN clientes c ON c.id = o.cliente_id
       LEFT JOIN veiculos v ON v.id = o.veiculo_id
       LEFT JOIN itens_os io ON io.ordem_id = o.id
       WHERE DATE(o.data_abertura) = ? OR DATE(o.data_finalizacao) = ?
       GROUP BY o.id
       ORDER BY o.numero DESC`,
      [data, data]
    ),

    // Movimentações financeiras do dia (venceu ou foi pago)
    pool.execute(
      `SELECT id, tipo, categoria, descricao, valor, data_vencimento, data_pagamento, status, ordem_servico_id
       FROM contas
       WHERE DATE(data_vencimento) = ? OR DATE(data_pagamento) = ?
       ORDER BY tipo, data_vencimento`,
      [data, data]
    ),
  ]);

  const entradas = (entradasRows[0] as any[]).map((row) => ({
    id: row.id,
    pecaId: row.peca_id,
    nome: row.nome,
    categoria: row.categoria,
    marca: row.marca,
    fornecedor: row.fornecedor || '',
    quantidade: row.quantidade,
    valorTotal: parseFloat(row.valor_total),
    preco: parseFloat(row.preco),
    precoVenda: parseFloat(row.preco_venda),
    data: row.data,
  }));

  const saidas = (saidasRows[0] as any[]).map((row) => ({
    id: row.id,
    ordemId: row.ordem_id,
    pecaId: row.peca_id,
    pecaNome: row.peca_nome,
    categoria: row.categoria,
    marca: row.marca,
    descricao: row.descricao,
    quantidade: row.quantidade,
    valorUnitario: parseFloat(row.valor_unitario),
    osNumero: row.os_numero,
    criadoEm: row.criado_em,
  }));

  const ordens = (ordensRows[0] as any[]).map((row) => {
    const valorBruto = parseFloat(row.valor_bruto);
    const desconto = parseFloat(row.desconto_percentual);
    return {
      id: row.id,
      numero: row.numero,
      status: row.status,
      dataAbertura: row.data_abertura,
      dataFinalizacao: row.data_finalizacao,
      nomeCliente: row.cliente_nome || row.nome_cliente,
      descricaoVeiculo: row.veiculo_marca
        ? `${row.veiculo_marca} ${row.veiculo_modelo} · ${row.placa}`
        : row.descricao_veiculo,
      valorTotal: valorBruto * (1 - desconto / 100),
      descontoPercentual: desconto,
    };
  });

  const todasContas = (contasRows[0] as any[]).map((row) => ({
    id: row.id,
    tipo: row.tipo as 'receita' | 'despesa',
    categoria: row.categoria,
    descricao: row.descricao,
    valor: parseFloat(row.valor),
    dataVencimento: row.data_vencimento,
    dataPagamento: row.data_pagamento,
    status: row.status,
    ordemServicoId: row.ordem_servico_id,
  }));

  const receitas = todasContas.filter((c) => c.tipo === 'receita');
  const despesas = todasContas.filter((c) => c.tipo === 'despesa');
  const totalReceitas = receitas.reduce((s, c) => s + c.valor, 0);
  const totalDespesas = despesas.reduce((s, c) => s + c.valor, 0);
  const ordensFinalizadas = ordens.filter((o) => o.status === 'finalizado');

  res.json({
    data,
    estoque: {
      entradas,
      saidas,
      totalEntradas: entradas.reduce((s, e) => s + e.quantidade, 0),
      totalSaidas: saidas.reduce((s, e) => s + e.quantidade, 0),
    },
    ordens: {
      lista: ordens,
      total: ordens.length,
      finalizadas: ordensFinalizadas.length,
      valorTotalFinalizadas: ordensFinalizadas.reduce((s, o) => s + o.valorTotal, 0),
    },
    financeiro: {
      receitas,
      despesas,
      totalReceitas,
      totalDespesas,
      saldo: totalReceitas - totalDespesas,
    },
  });
}

export async function dashboard(_req: Request, res: Response): Promise<void> {
  const [[totalClientes], [totalVeiculos], [totalPecas], [osStats], [financeiro], [alertas]] = await Promise.all([
    pool.execute('SELECT COUNT(*) as total FROM clientes'),
    pool.execute('SELECT COUNT(*) as total FROM veiculos'),
    pool.execute('SELECT COUNT(*) as total FROM pecas'),
    pool.execute(`
      SELECT
        COUNT(*) as total,
        SUM(status = 'aguardando_aprovacao') as aguardando_aprovacao,
        SUM(status = 'aguardando_peca') as aguardando_peca,
        SUM(status = 'em_execucao') as em_execucao,
        SUM(status = 'pronto_retirada') as pronto_retirada,
        SUM(status = 'finalizado') as finalizado
      FROM ordens_servico
    `),
    pool.execute(`
      SELECT
        COALESCE(SUM(CASE WHEN tipo='receita' AND MONTH(data_vencimento)=MONTH(NOW()) AND YEAR(data_vencimento)=YEAR(NOW()) THEN valor END), 0) as receitasMes,
        COALESCE(SUM(CASE WHEN tipo='despesa' AND MONTH(data_vencimento)=MONTH(NOW()) AND YEAR(data_vencimento)=YEAR(NOW()) THEN valor END), 0) as despesasMes,
        COALESCE(SUM(CASE WHEN status='pendente' AND data_vencimento < NOW() THEN valor END), 0) as contasAtrasadas
      FROM contas
    `),
    pool.execute('SELECT COUNT(*) as total FROM pecas WHERE quantidade <= estoque_minimo'),
  ]);

  const os = (osStats as any[])[0];
  const fin = (financeiro as any[])[0];

  res.json({
    totalClientes: (totalClientes as any[])[0].total,
    totalVeiculos: (totalVeiculos as any[])[0].total,
    totalPecas: (totalPecas as any[])[0].total,
    alertasEstoque: (alertas as any[])[0].total,
    ordens: {
      total: os.total,
      aguardandoAprovacao: os.aguardando_aprovacao || 0,
      aguardandoPeca: os.aguardando_peca || 0,
      emExecucao: os.em_execucao || 0,
      prontoRetirada: os.pronto_retirada || 0,
      finalizado: os.finalizado || 0,
    },
    financeiro: {
      receitasMes: parseFloat(fin.receitasMes),
      despesasMes: parseFloat(fin.despesasMes),
      lucroMes: parseFloat(fin.receitasMes) - parseFloat(fin.despesasMes),
      contasAtrasadas: parseFloat(fin.contasAtrasadas),
    },
  });
}

export async function fluxoMensal(req: Request, res: Response): Promise<void> {
  const ano = parseInt((req.query.ano as string) || String(new Date().getFullYear()), 10);

  const [rows] = await pool.execute(
    `SELECT
      MONTH(data_vencimento) as mes,
      tipo,
      SUM(valor) as total
    FROM contas
    WHERE YEAR(data_vencimento) = ?
    GROUP BY MONTH(data_vencimento), tipo
    ORDER BY mes`,
    [ano]
  );

  const meses = Array.from({ length: 12 }, (_, i) => ({
    mes: i + 1,
    receitas: 0,
    despesas: 0,
    lucro: 0,
  }));

  for (const row of rows as any[]) {
    const idx = row.mes - 1;
    if (row.tipo === 'receita') meses[idx].receitas = parseFloat(row.total);
    else meses[idx].despesas = parseFloat(row.total);
  }

  for (const m of meses) {
    m.lucro = m.receitas - m.despesas;
  }

  res.json({ ano, meses });
}
