import { useNavigate } from 'react-router-dom';
import type { Peca } from '../../types';
import { CATEGORIA_PECA_LABELS } from '../../types';
import { Table } from '../ui/Table';
import { Badge } from '../ui/Badge';
import { formatCurrency } from '../../lib/formatters';
import { AlertTriangle, PackagePlus } from 'lucide-react';

interface PecaListProps {
  pecas: Peca[];
  onDarEntrada?: (peca: Peca) => void;
}

export function PecaList({ pecas, onDarEntrada }: PecaListProps) {
  const navigate = useNavigate();

  const columns = [
    {
      key: 'nome',
      header: 'Nome',
      render: (p: Peca) => (
        <div>
          <span className="font-medium text-gray-900">{p.nome}</span>
          <span className="block text-xs text-gray-500">{p.marca}</span>
        </div>
      ),
    },
    {
      key: 'categoria',
      header: 'Categoria',
      render: (p: Peca) => <Badge>{CATEGORIA_PECA_LABELS[p.categoria]}</Badge>,
      className: 'hidden md:table-cell',
    },
    {
      key: 'quantidade',
      header: 'Qtd',
      render: (p: Peca) => (
        <div className="flex items-center gap-1">
          <span className={p.quantidade <= p.estoqueMinimo ? 'text-red-600 font-semibold' : ''}>{p.quantidade}</span>
          {p.quantidade <= p.estoqueMinimo && <AlertTriangle size={14} className="text-red-500" />}
        </div>
      ),
    },
    {
      key: 'precoVenda',
      header: 'Preço Venda',
      render: (p: Peca) => formatCurrency(p.precoVenda),
      className: 'hidden sm:table-cell',
    },
    {
      key: 'localizacao',
      header: 'Local',
      render: (p: Peca) => <span className="font-mono text-xs">{p.localizacao}</span>,
      className: 'hidden lg:table-cell',
    },
    ...(onDarEntrada
      ? [
          {
            key: 'acoes',
            header: '',
            render: (p: Peca) => (
              <button
                onClick={(e) => { e.stopPropagation(); onDarEntrada(p); }}
                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                title="Dar Entrada"
              >
                <PackagePlus size={15} />
                <span className="hidden sm:inline">Dar Entrada</span>
              </button>
            ),
          },
        ]
      : []),
  ];

  return (
    <Table
      columns={columns}
      data={pecas}
      keyExtractor={(p) => p.id}
      onRowClick={(p) => navigate(`/estoque/${p.id}`)}
      emptyMessage="Nenhuma peça encontrada"
    />
  );
}
