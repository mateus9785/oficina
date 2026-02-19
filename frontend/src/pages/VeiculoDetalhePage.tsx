import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Car, Bike, User, Clock } from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { VeiculoForm } from '../components/veiculos/VeiculoForm';
import { useVeiculoStore } from '../stores/useVeiculoStore';
import { useClienteStore } from '../stores/useClienteStore';
import { formatPlaca, formatDate, formatCurrency } from '../lib/formatters';
import { useOrdemServicoStore } from '../stores/useOrdemServicoStore';
import { calcularTotalOS } from '../lib/calculators';
import { STATUS_OS_LABELS, STATUS_OS_COLORS } from '../types';

export function VeiculoDetalhePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { buscarVeiculo, editarVeiculo, removerVeiculo, fetchVeiculos, veiculos } = useVeiculoStore();
  const { buscarCliente, fetchClientes, clientes } = useClienteStore();
  const { ordensDoVeiculo, fetchOrdens, ordens } = useOrdemServicoStore();

  useEffect(() => {
    if (veiculos.length === 0) fetchVeiculos();
    if (clientes.length === 0) fetchClientes();
    if (ordens.length === 0) fetchOrdens();
  }, []);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const veiculo = buscarVeiculo(id!);
  const ordensVeiculo = veiculo ? ordensDoVeiculo(veiculo.id) : [];
  const cliente = veiculo ? buscarCliente(veiculo.clienteId) : undefined;

  if (!veiculo) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Veículo não encontrado</p>
        <Button variant="secondary" className="mt-4" onClick={() => navigate(-1)}>
          Voltar
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft size={16} /> Voltar
        </button>
      </div>

      <PageHeader
        title={`${veiculo.marca} ${veiculo.modelo}`}
        description={`${formatPlaca(veiculo.placa)} - ${veiculo.ano}`}
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setEditOpen(true)}>
              <Edit size={16} /> Editar
            </Button>
            <Button variant="danger" onClick={() => setDeleteOpen(true)}>
              <Trash2 size={16} /> Excluir
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center">
              {veiculo.tipo === 'carro' ? <Car size={28} className="text-blue-600" /> : <Bike size={28} className="text-blue-600" />}
            </div>
            <div>
              <Badge>{veiculo.tipo === 'carro' ? 'Carro' : 'Moto'}</Badge>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Marca</span>
              <span className="font-medium">{veiculo.marca}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Modelo</span>
              <span className="font-medium">{veiculo.modelo}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Ano</span>
              <span className="font-medium">{veiculo.ano}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Placa</span>
              <span className="font-medium">{formatPlaca(veiculo.placa)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Cor</span>
              <span className="font-medium">{veiculo.cor}</span>
            </div>
          </div>

          {veiculo.observacoes && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
              {veiculo.observacoes}
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Proprietário</h3>
          {cliente ? (
            <div
              className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
              onClick={() => navigate(`/clientes/${cliente.id}`)}
            >
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                <User size={20} className="text-gray-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{cliente.nome}</p>
                <p className="text-sm text-gray-500">{cliente.telefone}</p>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">Proprietário não encontrado</p>
          )}
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock size={18} /> Histórico de Serviços ({ordensVeiculo.length})
          </h3>
          {ordensVeiculo.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">Nenhuma ordem de serviço</p>
          ) : (
            <div className="space-y-2">
              {ordensVeiculo.map((os) => (
                <div
                  key={os.id}
                  className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => navigate(`/ordens/${os.id}`)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold text-blue-600">#{os.numero}</span>
                    <Badge className={STATUS_OS_COLORS[os.status]}>{STATUS_OS_LABELS[os.status]}</Badge>
                  </div>
                  <p className="text-sm text-gray-700">{os.descricaoProblema}</p>
                  <div className="flex justify-between mt-1 text-xs text-gray-500">
                    <span>{formatDate(os.dataAbertura)}</span>
                    <span className="font-medium text-gray-900">{formatCurrency(calcularTotalOS(os))}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <VeiculoForm
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        onSave={(data) => editarVeiculo(veiculo.id, data)}
        veiculo={veiculo}
        clienteId={veiculo.clienteId}
      />

      <ConfirmDialog
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => {
          removerVeiculo(veiculo.id);
          navigate(-1);
        }}
        title="Excluir Veículo"
        message={`Tem certeza que deseja excluir o veículo "${veiculo.marca} ${veiculo.modelo}" (${veiculo.placa})?`}
      />
    </div>
  );
}
