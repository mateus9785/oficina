import type { Conta } from '../../types';
import { CATEGORIA_CONTA_LABELS } from '../../types';
import { Table } from '../ui/Table';
import { Badge } from '../ui/Badge';
import { formatCurrency, formatDate } from '../../lib/formatters';
import { CheckCircle, Clock, AlertTriangle } from 'lucide-react';

interface ContasListProps {
  contas: Conta[];
  onPagar?: (id: string) => void;
}

const statusConfig = {
  pago: { icon: CheckCircle, className: 'bg-green-100 text-green-800 border-green-300' },
  pendente: { icon: Clock, className: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
  atrasado: { icon: AlertTriangle, className: 'bg-red-100 text-red-800 border-red-300' },
};

export function ContasList({ contas, onPagar }: ContasListProps) {
  const columns = [
    {
      key: 'tipo',
      header: 'Tipo',
      render: (c: Conta) => (
        <Badge className={c.tipo === 'receita' ? 'bg-green-100 text-green-700 border-green-300' : 'bg-red-100 text-red-700 border-red-300'}>
          {c.tipo === 'receita' ? 'Receita' : 'Despesa'}
        </Badge>
      ),
    },
    {
      key: 'descricao',
      header: 'Descrição',
      render: (c: Conta) => (
        <div>
          <span className="font-medium text-gray-900">{c.descricao}</span>
          <span className="block text-xs text-gray-500">{CATEGORIA_CONTA_LABELS[c.categoria]}</span>
        </div>
      ),
    },
    {
      key: 'valor',
      header: 'Valor',
      render: (c: Conta) => (
        <span className={c.tipo === 'receita' ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
          {c.tipo === 'receita' ? '+' : '-'} {formatCurrency(c.valor)}
        </span>
      ),
    },
    {
      key: 'vencimento',
      header: 'Vencimento',
      render: (c: Conta) => formatDate(c.dataVencimento),
      className: 'hidden sm:table-cell',
    },
    {
      key: 'status',
      header: 'Status',
      render: (c: Conta) => {
        const config = statusConfig[c.status];
        const Icon = config.icon;
        return (
          <div className="flex items-center gap-2">
            <Badge className={config.className}>
              <Icon size={12} className="mr-1" />
              {c.status === 'pago' ? 'Pago' : c.status === 'pendente' ? 'Pendente' : 'Atrasado'}
            </Badge>
            {onPagar && c.status === 'pendente' && (
              <button
                onClick={(e) => { e.stopPropagation(); onPagar(c.id); }}
                className="text-xs text-blue-600 hover:underline"
              >
                Pagar
              </button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <Table columns={columns} data={contas} keyExtractor={(c) => c.id} emptyMessage="Nenhuma conta encontrada" />
  );
}
