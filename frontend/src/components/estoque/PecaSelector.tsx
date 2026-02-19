import { useState, useMemo } from 'react';
import type { Peca } from '../../types';
import { useEstoqueStore } from '../../stores/useEstoqueStore';
import { formatCurrency } from '../../lib/formatters';

interface PecaSelectorProps {
  onSelect: (peca: Peca) => void;
}

export function PecaSelector({ onSelect }: PecaSelectorProps) {
  const { pecas } = useEstoqueStore();
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const filtered = useMemo(() => {
    if (!search) return pecas.slice(0, 10);
    const q = search.toLowerCase();
    return pecas.filter(
      (p) => p.nome.toLowerCase().includes(q) || p.codigo.toLowerCase().includes(q)
    ).slice(0, 10);
  }, [pecas, search]);

  return (
    <div className="relative">
      <input
        type="text"
        value={search}
        onChange={(e) => { setSearch(e.target.value); setIsOpen(true); }}
        onFocus={() => setIsOpen(true)}
        placeholder="Buscar peça por nome ou código..."
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {isOpen && filtered.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filtered.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => { onSelect(p); setSearch(''); setIsOpen(false); }}
              className="w-full text-left px-3 py-2 hover:bg-gray-50 flex justify-between items-center text-sm"
            >
              <div>
                <span className="font-medium">{p.nome}</span>
                <span className="text-gray-500 ml-2">({p.codigo})</span>
              </div>
              <div className="text-right">
                <span className="text-gray-900">{formatCurrency(p.precoVenda)}</span>
                <span className="text-gray-500 text-xs ml-2">Qtd: {p.quantidade}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
