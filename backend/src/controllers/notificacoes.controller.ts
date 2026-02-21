import { Request, Response } from 'express';
import { pool } from '../config/database';

/** Conta dias úteis (sem domingos) de hoje até a data de entrega (inclusive).
 *  Usa datas UTC para evitar deslocamento de fuso ao normalizar para meia-noite. */
function diasUteisAte(dataEntrega: Date | string): number {
  const now = new Date();
  const hoje = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

  const d = new Date(dataEntrega);
  const entrega = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));

  if (entrega.getTime() === hoje.getTime()) return 0;
  if (entrega.getTime() < hoje.getTime()) return -1;

  let dias = 0;
  const cur = new Date(hoje);
  while (cur.getTime() < entrega.getTime()) {
    cur.setUTCDate(cur.getUTCDate() + 1);
    if (cur.getUTCDay() !== 0) dias++; // 0 = domingo
  }
  return dias;
}

export async function getNotificacoes(_req: Request, res: Response): Promise<void> {
  const [aniversariantes] = await pool.execute(
    `SELECT id, nome, telefone, data_nascimento
     FROM clientes
     WHERE DAY(data_nascimento) = DAY(CURDATE())
       AND MONTH(data_nascimento) = MONTH(CURDATE())
     ORDER BY nome`
  );

  // Busca com margem de 5 dias calendário (suficiente para 3 dias úteis mesmo com domingo)
  const [rows] = await pool.execute(
    `SELECT os.id, os.numero, os.previsao_entrega, os.status, os.descricao,
            c.nome AS cliente_nome, c.telefone AS cliente_telefone,
            v.marca, v.modelo, v.placa
     FROM ordens_servico os
     JOIN clientes c ON os.cliente_id = c.id
     JOIN veiculos v ON os.veiculo_id = v.id
     WHERE os.previsao_entrega IS NOT NULL
       AND os.previsao_entrega BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 5 DAY)
       AND os.status IN ('aguardando_aprovacao', 'aguardando_peca', 'em_execucao')
     ORDER BY os.previsao_entrega ASC`
  );

  // Filtra apenas as com ≤ 3 dias úteis restantes e inclui o campo calculado
  const ordensProximas = (rows as any[])
    .map((o) => ({
      id: o.id,
      numero: o.numero,
      previsaoEntrega: o.previsao_entrega,
      status: o.status,
      descricao: o.descricao,
      clienteNome: o.cliente_nome,
      clienteTelefone: o.cliente_telefone,
      veiculo: `${o.marca} ${o.modelo}`,
      placa: o.placa,
      diasUteis: diasUteisAte(o.previsao_entrega),
    }))
    .filter((o) => o.diasUteis <= 3);

  const hojeStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date());
  const [contasRows] = await pool.execute(
    `SELECT id, tipo, categoria, descricao, valor, data_vencimento,
            DATEDIFF(?, DATE(data_vencimento)) AS dias_atraso
     FROM contas
     WHERE status != 'pago'
       AND DATE(data_vencimento) <= ?
     ORDER BY data_vencimento ASC`,
    [hojeStr, hojeStr]
  );

  const contasAlerta = (contasRows as any[]).map((c) => ({
    id: c.id,
    tipo: c.tipo,
    categoria: c.categoria,
    descricao: c.descricao,
    valor: parseFloat(c.valor),
    dataVencimento: c.data_vencimento,
    diasAtraso: c.dias_atraso as number,
  }));

  const [estoqueBaixoRows] = await pool.execute(
    `SELECT id, codigo, nome, marca, quantidade, estoque_minimo
     FROM pecas
     WHERE estoque_minimo > 0 AND quantidade <= estoque_minimo
     ORDER BY (quantidade / estoque_minimo) ASC, nome ASC`
  );

  const estoqueBaixo = (estoqueBaixoRows as any[]).map((p) => ({
    id: p.id,
    codigo: p.codigo,
    nome: p.nome,
    marca: p.marca,
    quantidade: p.quantidade as number,
    estoqueMinimo: p.estoque_minimo as number,
  }));

  res.json({
    aniversariantes: (aniversariantes as any[]).map((a) => ({
      id: a.id,
      nome: a.nome,
      telefone: a.telefone,
      dataNascimento: a.data_nascimento,
    })),
    ordensProximas,
    contasAlerta,
    estoqueBaixo,
  });
}
