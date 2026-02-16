import { useMemo } from 'react';
import { TrendingUp, TrendingDown, DollarSign, AlertTriangle } from 'lucide-react';
import { Card } from '../ui/Card';
import { formatCurrency } from '../../lib/formatters';
import type { Conta } from '../../types';

interface FluxoCaixaDashboardProps {
  contas: Conta[];
}

export function FluxoCaixaDashboard({ contas }: FluxoCaixaDashboardProps) {
  const stats = useMemo(() => {
    const totalReceitas = contas.filter((c) => c.tipo === 'receita').reduce((s, c) => s + c.valor, 0);
    const totalDespesas = contas.filter((c) => c.tipo === 'despesa').reduce((s, c) => s + c.valor, 0);
    const saldo = totalReceitas - totalDespesas;
    const pendentes = contas.filter((c) => c.status === 'pendente');
    const totalPendente = pendentes.reduce((s, c) => s + c.valor, 0);
    return { totalReceitas, totalDespesas, saldo, pendentes: pendentes.length, totalPendente };
  }, [contas]);

  const cards = [
    { label: 'Total Receitas', value: stats.totalReceitas, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-100' },
    { label: 'Total Despesas', value: stats.totalDespesas, icon: TrendingDown, color: 'text-red-600', bg: 'bg-red-100' },
    { label: 'Saldo', value: stats.saldo, icon: DollarSign, color: stats.saldo >= 0 ? 'text-green-600' : 'text-red-600', bg: stats.saldo >= 0 ? 'bg-green-100' : 'bg-red-100' },
    { label: 'Pendentes', value: stats.totalPendente, icon: AlertTriangle, color: 'text-yellow-600', bg: 'bg-yellow-100', subtitle: `${stats.pendentes} contas` },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card key={card.label} className="p-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center`}>
              <card.icon size={20} className={card.color} />
            </div>
            <div>
              <p className="text-xs text-gray-500">{card.label}</p>
              <p className={`text-lg font-bold ${card.color}`}>{formatCurrency(card.value)}</p>
              {card.subtitle && <p className="text-xs text-gray-400">{card.subtitle}</p>}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
