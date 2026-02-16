import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { Button } from '../components/ui/Button';
import { KanbanBoard } from '../components/kanban/KanbanBoard';
import { OrdemServicoForm } from '../components/ordens/OrdemServicoForm';
import { useOrdemServicoStore } from '../stores/useOrdemServicoStore';

export function KanbanPage() {
  const { ordens, adicionarOrdem, moverOrdem } = useOrdemServicoStore();
  const [formOpen, setFormOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div>
      <PageHeader
        title="Ordens de Serviço"
        description={`${ordens.length} ordens`}
        actions={
          <Button onClick={() => setFormOpen(true)}>
            <Plus size={18} /> Nova OS
          </Button>
        }
      />

      <KanbanBoard
        ordens={ordens}
        onMover={(ordemId, novoStatus) => moverOrdem(ordemId, novoStatus)}
        onCardClick={(ordem) => navigate(`/ordens/${ordem.id}`)}
      />

      <OrdemServicoForm
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={(data) => adicionarOrdem(data)}
      />
    </div>
  );
}
