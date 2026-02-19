import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { Button } from '../components/ui/Button';
import { KanbanBoard } from '../components/kanban/KanbanBoard';
import { OrdemServicoForm } from '../components/ordens/OrdemServicoForm';
import { useOrdemServicoStore } from '../stores/useOrdemServicoStore';

export function KanbanPage() {
  const { ordens, adicionarOrdem, moverOrdem, fetchOrdens } = useOrdemServicoStore();
  const [formOpen, setFormOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { fetchOrdens(); }, []);

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Ordens de Serviço"
        description={`${ordens.length} ordens`}
        actions={
          <Button onClick={() => setFormOpen(true)}>
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

      <OrdemServicoForm
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={(data) => adicionarOrdem(data)}
      />
    </div>
  );
}
