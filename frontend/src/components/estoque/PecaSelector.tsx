import { useState, useMemo, useRef, useEffect } from 'react';
import type { Peca } from '../../types';
import { useEstoqueStore } from '../../stores/useEstoqueStore';
import { formatCurrency } from '../../lib/formatters';

interface PecaSelectorProps {
  onSelect: (peca: Peca) => void;
}

export function PecaSelector({ onSelect }: PecaSelectorProps) {
  const { pecas, fetchPecas, loading } = useEstoqueStore();
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (pecas.length === 0) fetchPecas();
  }, []);

  const filtered = useMemo(() => {
    if (!search) return pecas.slice(0, 10);
    const q = search.toLowerCase();
    return pecas.filter((p) => p.nome.toLowerCase().includes(q)).slice(0, 10);
  }, [pecas, search]);

  function handleBlur(e: React.FocusEvent) {
    // relatedTarget é null quando foco vai para fora do browser ou para elemento não-focável
    // usamos setTimeout para deixar o onClick dos botões disparar primeiro
    setTimeout(() => {
      if (!containerRef.current?.contains(document.activeElement)) {
        setIsOpen(false);
      }
    }, 100);
  }

  return (
    <div className="relative" ref={containerRef}>
      <input
        type="text"
        value={search}
        onChange={(e) => { setSearch(e.target.value); setIsOpen(true); }}
        onFocus={() => setIsOpen(true)}
        onBlur={handleBlur}
        placeholder="Buscar peça por nome..."
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {loading ? (
            <p className="px-3 py-4 text-sm text-gray-400 text-center">Carregando...</p>
          ) : filtered.length === 0 ? (
            <p className="px-3 py-4 text-sm text-gray-400 text-center">Nenhuma peça encontrada</p>
          ) : (
            filtered.map((p) => (
              <button
                key={p.id}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => { onSelect(p); setSearch(''); setIsOpen(false); }}
                className="w-full text-left px-3 py-2 hover:bg-gray-50 flex justify-between items-center text-sm"
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium">{p.nome}</span>
                  {p.servicoVinculadoNome && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-700">
                      + {p.servicoVinculadoNome}
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-gray-900">{formatCurrency(p.precoVenda)}</span>
                  <span className="text-gray-500 text-xs ml-2">Qtd: {p.quantidade}</span>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
