import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Archive, Plus } from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { Button } from '../components/ui/Button';
import { KanbanBoard } from '../components/kanban/KanbanBoard';
import { ArquivadasModal } from '../components/kanban/ArquivadasModal';
import { useOrdemServicoStore } from '../stores/useOrdemServicoStore';

export function KanbanPage() {
  const { ordens, moverOrdem, arquivarOrdem, fetchOrdens } = useOrdemServicoStore();
  const navigate = useNavigate();
  const [modalArquivadas, setModalArquivadas] = useState(false);

  useEffect(() => { fetchOrdens(); }, []);

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Ordens de Serviço"
        description={`${ordens.length} ordens`}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={() => setModalArquivadas(true)}>
              <Archive size={16} /> Arquivadas
            </Button>
            <Button onClick={() => navigate('/ordens/nova')}>
              <Plus size={18} /> Nova OS
            </Button>
          </div>
        }
      />

      <div className="flex-1 min-h-0 overflow-hidden">
        <KanbanBoard
          ordens={ordens}
          onMover={(ordemId, novoStatus) => moverOrdem(ordemId, novoStatus)}
          onCardClick={(ordem) => navigate(`/ordens/${ordem.id}`)}
          onArquivar={(ordemId) => arquivarOrdem(ordemId)}
        />
      </div>

      <ArquivadasModal isOpen={modalArquivadas} onClose={() => setModalArquivadas(false)} />
    </div>
  );
}
