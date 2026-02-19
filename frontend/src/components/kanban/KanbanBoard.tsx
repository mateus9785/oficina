import { DndContext, type DragEndEvent, PointerSensor, useSensor, useSensors, closestCenter } from '@dnd-kit/core';
import type { OrdemServico, StatusOS } from '../../types';
import { KanbanColumn } from './KanbanColumn';

const COLUMNS: StatusOS[] = [
  'aguardando_aprovacao',
  'aguardando_peca',
  'em_execucao',
  'pronto_retirada',
  'finalizado',
];

interface KanbanBoardProps {
  ordens: OrdemServico[];
  onMover: (ordemId: string, novoStatus: StatusOS) => void;
  onCardClick: (ordem: OrdemServico) => void;
}

export function KanbanBoard({ ordens, onMover, onCardClick }: KanbanBoardProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const ordemId = active.id as string;
    let targetStatus: StatusOS | null = null;

    // Dropped on a column directly
    if (COLUMNS.includes(over.id as StatusOS)) {
      targetStatus = over.id as StatusOS;
    } else {
      // Dropped on another card - find its column
      const targetOrdem = ordens.find((o) => o.id === over.id);
      if (targetOrdem) {
        targetStatus = targetOrdem.status;
      }
    }

    if (targetStatus) {
      const ordem = ordens.find((o) => o.id === ordemId);
      if (ordem && ordem.status !== targetStatus) {
        onMover(ordemId, targetStatus);
      }
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto h-full pb-4">
        {COLUMNS.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            ordens={ordens.filter((o) => o.status === status)}
            onCardClick={onCardClick}
          />
        ))}
      </div>
    </DndContext>
  );
}
