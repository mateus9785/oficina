import { useMemo } from 'react';
import { useClienteStore } from '../stores/useClienteStore';
import { useVeiculoStore } from '../stores/useVeiculoStore';
import { useOrdemServicoStore } from '../stores/useOrdemServicoStore';
import { useEstoqueStore } from '../stores/useEstoqueStore';
import { useFinanceiroStore } from '../stores/useFinanceiroStore';
import { calcularTotalOS } from '../lib/calculators';

export function useRelatorios() {
  const { clientes } = useClienteStore();
  const { veiculos } = useVeiculoStore();
  const { ordens } = useOrdemServicoStore();
  const { pecas } = useEstoqueStore();
  const { contas } = useFinanceiroStore();

  return useMemo(() => {
    const ordensFinalizadas = ordens.filter((o) => o.status === 'finalizado');
    const totalFaturado = ordensFinalizadas.reduce((s, o) => s + calcularTotalOS(o), 0);

    // Receitas/despesas por mês
    const fluxoMensal: Record<string, { receitas: number; despesas: number }> = {};
    contas.forEach((c) => {
      const d = new Date(c.dataVencimento);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!fluxoMensal[key]) fluxoMensal[key] = { receitas: 0, despesas: 0 };
      if (c.tipo === 'receita') fluxoMensal[key].receitas += c.valor;
      else fluxoMensal[key].despesas += c.valor;
    });

    // Top clientes por faturamento
    const clienteFaturamento: Record<string, number> = {};
    ordensFinalizadas.forEach((o) => {
      if (!o.clienteId) return;
      clienteFaturamento[o.clienteId] = (clienteFaturamento[o.clienteId] || 0) + calcularTotalOS(o);
    });
    const topClientes = Object.entries(clienteFaturamento)
      .map(([id, total]) => ({ cliente: clientes.find((c) => c.id === id), total }))
      .filter((c) => c.cliente)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    // Top peças por uso
    const topPecas = [...pecas].sort((a, b) => b.usoTotal - a.usoTotal).slice(0, 10);

    // Veículos com mais serviços
    const veiculoOS: Record<string, number> = {};
    ordens.forEach((o) => {
      if (!o.veiculoId) return;
      veiculoOS[o.veiculoId] = (veiculoOS[o.veiculoId] || 0) + 1;
    });
    const topVeiculos = Object.entries(veiculoOS)
      .map(([id, count]) => ({ veiculo: veiculos.find((v) => v.id === id), count }))
      .filter((v) => v.veiculo)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // OS por status
    const osPorStatus: Record<string, number> = {};
    ordens.forEach((o) => { osPorStatus[o.status] = (osPorStatus[o.status] || 0) + 1; });

    return {
      totalClientes: clientes.length,
      totalVeiculos: veiculos.length,
      totalOrdens: ordens.length,
      ordensFinalizadas: ordensFinalizadas.length,
      totalFaturado,
      ticketMedio: ordensFinalizadas.length > 0 ? totalFaturado / ordensFinalizadas.length : 0,
      totalPecas: pecas.length,
      pecasAbaixoMinimo: pecas.filter((p) => p.quantidade <= p.estoqueMinimo).length,
      fluxoMensal,
      topClientes,
      topPecas,
      topVeiculos,
      osPorStatus,
    };
  }, [clientes, veiculos, ordens, pecas, contas]);
}
