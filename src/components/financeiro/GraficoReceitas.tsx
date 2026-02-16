import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { Conta } from '../../types';

interface GraficoReceitasProps {
  contas: Conta[];
}

export function GraficoReceitas({ contas }: GraficoReceitasProps) {
  const data = useMemo(() => {
    const meses: Record<string, { receitas: number; despesas: number }> = {};
    contas.forEach((c) => {
      const d = new Date(c.dataVencimento);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!meses[key]) meses[key] = { receitas: 0, despesas: 0 };
      if (c.tipo === 'receita') meses[key].receitas += c.valor;
      else meses[key].despesas += c.valor;
    });

    return Object.entries(meses)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([key, val]) => {
        const [ano, mes] = key.split('-');
        const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        return {
          nome: `${monthNames[Number(mes) - 1]}/${ano.slice(2)}`,
          Receitas: val.receitas,
          Despesas: val.despesas,
        };
      });
  }, [contas]);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="nome" fontSize={12} />
        <YAxis fontSize={12} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
        <Tooltip formatter={(value) => `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
        <Legend />
        <Bar dataKey="Receitas" fill="#22c55e" radius={[4, 4, 0, 0]} />
        <Bar dataKey="Despesas" fill="#ef4444" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
