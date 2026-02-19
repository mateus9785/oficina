import { Request, Response } from 'express';
import { pool } from '../config/database';

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
