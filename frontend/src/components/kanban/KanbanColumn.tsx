import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { OrdemServico, StatusOS } from '../../types';
import { STATUS_OS_LABELS, STATUS_OS_COLUMN_COLORS } from '../../types';
import { KanbanCard } from './KanbanCard';
import clsx from 'clsx';

interface KanbanColumnProps {
  status: StatusOS;
  ordens: OrdemServico[];
  onCardClick: (ordem: OrdemServico) => void;
  onArquivar?: (ordemId: string) => void;
}

export function KanbanColumn({ status, ordens, onCardClick, onArquivar }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      className={clsx(
        'flex flex-col min-w-[280px] w-[280px] bg-gray-50 rounded-xl border-t-4 h-full',
        STATUS_OS_COLUMN_COLORS[status],
        isOver && 'ring-2 ring-blue-300 bg-blue-50'
      )}
    >
      <div className="px-3 py-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">{STATUS_OS_LABELS[status]}</h3>
        <span className="bg-gray-200 text-gray-600 text-xs font-bold px-2 py-0.5 rounded-full">{ordens.length}</span>
      </div>
      <SortableContext items={ordens.map((o) => o.id)} strategy={verticalListSortingStrategy}>
        <div className="flex-1 min-h-0 px-3 pb-3 space-y-2 overflow-y-auto">
          {ordens.map((ordem) => (
            <KanbanCard key={ordem.id} ordem={ordem} onClick={() => onCardClick(ordem)} onArquivar={onArquivar ? () => onArquivar(ordem.id) : undefined} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}
