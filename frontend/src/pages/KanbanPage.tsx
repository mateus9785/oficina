import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { Button } from '../components/ui/Button';
import { KanbanBoard } from '../components/kanban/KanbanBoard';
import { useOrdemServicoStore } from '../stores/useOrdemServicoStore';

export function KanbanPage() {
  const { ordens, moverOrdem, fetchOrdens } = useOrdemServicoStore();
  const navigate = useNavigate();

  useEffect(() => { fetchOrdens(); }, []);

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Ordens de Serviço"
        description={`${ordens.length} ordens`}
        actions={
          <Button onClick={() => navigate('/ordens/nova')}>
            <Plus size={18} /> Nova OS
          </Button>
        }
      />

      <div className="flex-1 min-h-0 overflow-hidden">
        <KanbanBoard
          ordens={ordens}
          onMover={(ordemId, novoStatus) => moverOrdem(ordemId, novoStatus)}
          onCardClick={(ordem) => navigate(`/ordens/${ordem.id}`)}
        />
      </div>
    </div>
  );
}
