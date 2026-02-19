import type { Peca } from '../../types';
import { AlertTriangle } from 'lucide-react';

interface EstoqueAlertsProps {
  pecas: Peca[];
}

export function EstoqueAlerts({ pecas }: EstoqueAlertsProps) {
  if (pecas.length === 0) return null;

  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
      <div className="flex items-center gap-2 mb-2">
        <AlertTriangle size={18} className="text-red-500" />
        <span className="font-semibold text-red-800">Alerta de Estoque Baixo ({pecas.length} itens)</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {pecas.map((p) => (
          <span key={p.id} className="text-sm bg-red-100 text-red-700 px-2 py-1 rounded">
            {p.nome}: {p.quantidade}/{p.estoqueMinimo}
          </span>
        ))}
      </div>
    </div>
  );
}
