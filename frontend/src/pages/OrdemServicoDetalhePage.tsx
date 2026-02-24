import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, Car, Bike, User, FileText, Pencil, Trash2 } from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { OrdemItensTable } from '../components/ordens/OrdemItensTable';
import { AnexosSection } from '../components/ordens/AnexosSection';
import { useOrdemServicoStore } from '../stores/useOrdemServicoStore';
import { useClienteStore } from '../stores/useClienteStore';
import { useVeiculoStore } from '../stores/useVeiculoStore';
import { STATUS_OS_LABELS, STATUS_OS_COLORS } from '../types';
import { formatDate, formatKm, formatCurrency } from '../lib/formatters';
import { calcularTotalOS, calcularTotalPecas, calcularTotalServicos } from '../lib/calculators';

export function OrdemServicoDetalhePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { buscarOrdem, removerOrdem, fetchOrdens, ordens } = useOrdemServicoStore();
  const { buscarCliente, fetchClientes, clientes } = useClienteStore();
  const { buscarVeiculo, fetchVeiculos, veiculos } = useVeiculoStore();

  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    if (ordens.length === 0) fetchOrdens();
    if (clientes.length === 0) fetchClientes();
    if (veiculos.length === 0) fetchVeiculos();
  }, []);

  const ordem = buscarOrdem(id!);

  if (!ordem) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Ordem de serviço não encontrada</p>
        <Button variant="secondary" className="mt-4" onClick={() => navigate('/ordens')}>Voltar</Button>
      </div>
    );
  }

  const cliente = buscarCliente(ordem.clienteId);
  const veiculo = buscarVeiculo(ordem.veiculoId);
  const finalizado = ordem.status === 'finalizado';

  async function handleDelete() {
    try {
      await removerOrdem(ordem!.id);
      toast.success('Ordem de serviço removida com sucesso!');
      navigate('/ordens');
    } catch (err) {
      toast.error((err as Error).message || 'Erro ao remover ordem de serviço.');
    }
  }

  return (
    <div>
      <div className="mb-4">
        <button onClick={() => navigate('/ordens')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft size={16} /> Voltar para kanban
        </button>
      </div>

      <PageHeader
        title={`OS #${ordem.numero}`}
        actions={
          <div className="flex items-center gap-2">
            <Badge className={STATUS_OS_COLORS[ordem.status]}>{STATUS_OS_LABELS[ordem.status]}</Badge>
            {!finalizado && (
              <>
                <Button variant="secondary" onClick={() => navigate(`/ordens/${ordem.id}/editar`)}>
                  <Pencil size={15} className="mr-1" /> Editar
                </Button>
                <Button variant="danger" onClick={() => setDeleteOpen(true)}>
                  <Trash2 size={15} className="mr-1" /> Apagar
                </Button>
              </>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileText size={18} /> Informações
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Data Abertura</span><span>{formatDate(ordem.dataAbertura)}</span></div>
            {ordem.previsaoEntrega && (
              <div className="flex justify-between"><span className="text-gray-500">Previsão de Entrega</span><span>{formatDate(ordem.previsaoEntrega)}</span></div>
            )}
            {ordem.dataFinalizacao && (
              <div className="flex justify-between"><span className="text-gray-500">Data Finalização</span><span>{formatDate(ordem.dataFinalizacao)}</span></div>
            )}
            <div className="flex justify-between"><span className="text-gray-500">KM Entrada</span><span>{formatKm(ordem.kmEntrada)}</span></div>
            {ordem.descricao && (
              <div className="mt-3">
                <span className="text-gray-500 block mb-1">Descrição</span>
                <p className="bg-gray-50 p-2 rounded">{ordem.descricao}</p>
              </div>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <User size={18} /> Cliente
          </h3>
          {cliente && (
            <div
              className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
              onClick={() => navigate(`/clientes/${cliente.id}`)}
            >
              <p className="font-medium">{cliente.nome}</p>
              <p className="text-sm text-gray-500">{cliente.telefone}</p>
            </div>
          )}

          <h3 className="font-semibold text-gray-900 mb-4 mt-6 flex items-center gap-2">
            {veiculo?.tipo === 'carro' ? <Car size={18} /> : <Bike size={18} />} Veículo
          </h3>
          {veiculo && (
            <div
              className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
              onClick={() => navigate(`/veiculos/${veiculo.id}`)}
            >
              <p className="font-medium">{veiculo.marca} {veiculo.modelo}</p>
              <p className="text-sm text-gray-500">{veiculo.placa}{veiculo.ano ? ` - ${veiculo.ano}` : ''}{veiculo.cor ? ` - ${veiculo.cor}` : ''}</p>
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Resumo Financeiro</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Peças</span><span>{formatCurrency(calcularTotalPecas(ordem))}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Serviços</span><span>{formatCurrency(calcularTotalServicos(ordem))}</span></div>
            <div className="flex justify-between border-t pt-2"><span className="font-semibold">Total</span><span className="font-bold text-green-600 text-lg">{formatCurrency(calcularTotalOS(ordem))}</span></div>
          </div>

          {ordem.checklistEntrada.length > 0 && (
            <div className="mt-6">
              <h4 className="font-semibold text-gray-900 mb-2">Checklist de Entrada</h4>
              <div className="space-y-1">
                {ordem.checklistEntrada.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <span className={`w-2 h-2 rounded-full ${item.temDano ? 'bg-red-500' : 'bg-green-500'}`} />
                    <span>{item.zona}</span>
                    {item.temDano && item.descricao && <span className="text-red-600">- {item.descricao}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>

      <Card className="p-6 mb-6">
        <OrdemItensTable
          itens={ordem.itens}
          onAdicionarItem={() => {}}
          onRemoverItem={() => {}}
          readOnly
        />
      </Card>

      <Card className="p-6">
        <AnexosSection ordemId={ordem.id} readOnly={finalizado} />
      </Card>

      <ConfirmDialog
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Apagar Ordem de Serviço"
        message={`Tem certeza que deseja apagar a OS #${ordem.numero}? Esta ação não pode ser desfeita e o estoque das peças será restaurado.`}
      />
    </div>
  );
}
