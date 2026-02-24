import type { DespesaRecorrente } from '../../types';
import { CATEGORIA_RECORRENTE_LABELS } from '../../types';
import { Table } from '../ui/Table';
import { Badge } from '../ui/Badge';
import { formatCurrency } from '../../lib/formatters';
import { Pencil, Trash2 } from 'lucide-react';

interface RecorrentesListProps {
  recorrentes: DespesaRecorrente[];
  onEditar?: (rec: DespesaRecorrente) => void;
  onRemover?: (rec: DespesaRecorrente) => void;
  onToggle?: (id: string) => void;
}

export function RecorrentesList({ recorrentes, onEditar, onRemover, onToggle }: RecorrentesListProps) {
  const columns = [
    {
      key: 'descricao',
      header: 'Descrição',
      render: (r: DespesaRecorrente) => (
        <div>
          <span className="font-medium text-gray-900">{r.descricao}</span>
          <span className="block text-xs text-gray-500">{CATEGORIA_RECORRENTE_LABELS[r.categoria]}</span>
        </div>
      ),
    },
    {
      key: 'valor',
      header: 'Valor',
      render: (r: DespesaRecorrente) => (
        <span className="text-red-600 font-medium">- {formatCurrency(r.valor)}</span>
      ),
    },
    {
      key: 'dia',
      header: 'Vencimento',
      render: (r: DespesaRecorrente) => (
        <span className="text-gray-700">Todo dia {r.diaVencimento}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (r: DespesaRecorrente) => (
        <button
          onClick={(e) => { e.stopPropagation(); onToggle?.(r.id); }}
          className="focus:outline-none"
          title={r.ativo ? 'Desativar' : 'Ativar'}
        >
          <Badge className={r.ativo
            ? 'bg-green-100 text-green-800 border-green-300 cursor-pointer hover:bg-green-200'
            : 'bg-gray-100 text-gray-500 border-gray-300 cursor-pointer hover:bg-gray-200'
          }>
            {r.ativo ? 'Ativa' : 'Inativa'}
          </Badge>
        </button>
      ),
    },
    {
      key: 'acoes',
      header: '',
      render: (r: DespesaRecorrente) => (
        <div className="flex items-center gap-2 justify-end">
          {onEditar && (
            <button
              onClick={(e) => { e.stopPropagation(); onEditar(r); }}
              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
              title="Editar"
            >
              <Pencil size={15} />
            </button>
          )}
          {onRemover && (
            <button
              onClick={(e) => { e.stopPropagation(); onRemover(r); }}
              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
              title="Excluir"
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      data={recorrentes}
      keyExtractor={(r) => r.id}
      emptyMessage="Nenhuma despesa recorrente cadastrada"
    />
  );
}
