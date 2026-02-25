import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bike, Clock, ArchiveRestore } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { useOrdemServicoStore } from '../../stores/useOrdemServicoStore';
import { useClienteStore } from '../../stores/useClienteStore';
import { useVeiculoStore } from '../../stores/useVeiculoStore';
import { calcularTotalOS } from '../../lib/calculators';
import { formatCurrency } from '../../lib/formatters';

interface ArquivadasModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ArquivadasModal({ isOpen, onClose }: ArquivadasModalProps) {
  const { ordensArquivadas, fetchOrdensArquivadas, desarquivarOrdem } = useOrdemServicoStore();
  const { buscarCliente } = useClienteStore();
  const { buscarVeiculo } = useVeiculoStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) fetchOrdensArquivadas();
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Ordens de Serviço Arquivadas" size="2xl">
      {ordensArquivadas.length === 0 ? (
        <p className="text-center text-gray-500 py-8">Nenhuma ordem arquivada.</p>
      ) : (
        <div className="grid grid-cols-5 gap-3">
          {ordensArquivadas.map((ordem) => {
            const cliente = ordem.clienteId ? buscarCliente(ordem.clienteId) : undefined;
            const veiculo = ordem.veiculoId ? buscarVeiculo(ordem.veiculoId) : undefined;
            const nomeCliente = cliente?.nome ?? ordem.nomeCliente;
            const total = calcularTotalOS(ordem);

            return (
              <div
                key={ordem.id}
                className="text-left bg-white rounded-lg border border-gray-200 p-3 shadow-sm hover:shadow-md transition-shadow flex flex-col"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-blue-600">#{ordem.numero}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock size={12} />
                      {ordem.dataFinalizacao
                        ? new Date(ordem.dataFinalizacao).toLocaleDateString('pt-BR')
                        : new Date(ordem.dataAbertura).toLocaleDateString('pt-BR')}
                    </span>
                    <button
                      title="Desarquivar OS"
                      onClick={() => desarquivarOrdem(ordem.id)}
                      className="text-gray-400 hover:text-blue-600 transition-colors cursor-pointer"
                    >
                      <ArchiveRestore size={14} />
                    </button>
                  </div>
                </div>

                <button
                  className="text-left flex-1"
                  onClick={() => { onClose(); navigate(`/ordens/${ordem.id}`); }}
                >
                  <p className="text-sm font-medium text-gray-900 mb-1 line-clamp-2">{ordem.descricao}</p>

                  {nomeCliente && (
                    <p className="text-xs text-gray-500 mb-2">{nomeCliente}</p>
                  )}

                  {veiculo && (
                    <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                      <Bike size={12} />
                      <span>{veiculo.marca} {veiculo.modelo}</span>
                      <span className="text-gray-400">({veiculo.placa})</span>
                    </div>
                  )}

                  {total > 0 && (
                    <div className="text-right">
                      <span className="text-sm font-semibold text-green-600">{formatCurrency(total)}</span>
                    </div>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </Modal>
  );
}
