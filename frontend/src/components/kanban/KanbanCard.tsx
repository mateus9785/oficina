import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Car, Bike, Clock } from 'lucide-react';
import type { OrdemServico } from '../../types';
import { useClienteStore } from '../../stores/useClienteStore';
import { useVeiculoStore } from '../../stores/useVeiculoStore';
import { calcularTotalOS } from '../../lib/calculators';
import { formatCurrency } from '../../lib/formatters';

interface KanbanCardProps {
  ordem: OrdemServico;
  onClick: () => void;
}

export function KanbanCard({ ordem, onClick }: KanbanCardProps) {
  const { buscarCliente } = useClienteStore();
  const { buscarVeiculo } = useVeiculoStore();
  const cliente = buscarCliente(ordem.clienteId);
  const veiculo = buscarVeiculo(ordem.veiculoId);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: ordem.id,
    data: { ordem },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm hover:shadow-md cursor-grab active:cursor-grabbing transition-shadow"
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-blue-600">#{ordem.numero}</span>
        <span className="text-xs text-gray-500 flex items-center gap-1">
          <Clock size={12} />
          {new Date(ordem.dataAbertura).toLocaleDateString('pt-BR')}
        </span>
      </div>

      <p className="text-sm font-medium text-gray-900 mb-1 line-clamp-2">{ordem.descricao}</p>

      {cliente && (
        <p className="text-xs text-gray-500 mb-2">{cliente.nome}</p>
      )}

      {veiculo && (
        <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
          {veiculo.tipo === 'carro' ? <Car size={12} /> : <Bike size={12} />}
          <span>{veiculo.marca} {veiculo.modelo}</span>
          <span className="text-gray-400">({veiculo.placa})</span>
        </div>
      )}

      {ordem.itens.length > 0 && (
        <div className="text-right">
          <span className="text-sm font-semibold text-green-600">{formatCurrency(calcularTotalOS(ordem))}</span>
        </div>
      )}
    </div>
  );
}
