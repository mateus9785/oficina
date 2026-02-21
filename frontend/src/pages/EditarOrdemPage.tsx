import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, FileText } from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Select } from '../components/ui/Select';
import { OrdemItensTable } from '../components/ordens/OrdemItensTable';
import { AnexosSection } from '../components/ordens/AnexosSection';
import { useOrdemServicoStore } from '../stores/useOrdemServicoStore';
import { useClienteStore } from '../stores/useClienteStore';
import { useVeiculoStore } from '../stores/useVeiculoStore';

export function EditarOrdemPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { buscarOrdem, editarOrdem, adicionarItem, removerItem, fetchOrdens, ordens } = useOrdemServicoStore();
  const { fetchClientes, clientes } = useClienteStore();
  const { fetchVeiculos, veiculos } = useVeiculoStore();

  useEffect(() => {
    if (ordens.length === 0) fetchOrdens();
    if (clientes.length === 0) fetchClientes();
    if (veiculos.length === 0) fetchVeiculos();
  }, []);

  const ordem = buscarOrdem(id!);

  const [clienteId, setClienteId] = useState(ordem?.clienteId ?? '');
  const [veiculoId, setVeiculoId] = useState(ordem?.veiculoId ?? '');
  const [kmEntrada, setKmEntrada] = useState(String(ordem?.kmEntrada ?? ''));
  const [descricao, setDescricao] = useState(ordem?.descricao ?? '');
  const [previsaoEntrega, setPrevisaoEntrega] = useState(
    ordem?.previsaoEntrega ? ordem.previsaoEntrega.slice(0, 10) : ''
  );
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (ordem) {
      setClienteId(ordem.clienteId);
      setVeiculoId(ordem.veiculoId);
      setKmEntrada(String(ordem.kmEntrada));
      setDescricao(ordem.descricao);
      setPrevisaoEntrega(ordem.previsaoEntrega ? ordem.previsaoEntrega.slice(0, 10) : '');
    }
  }, [ordem?.id]);

  if (!ordem) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Ordem de serviço não encontrada</p>
        <Button variant="secondary" className="mt-4" onClick={() => navigate('/ordens')}>Voltar</Button>
      </div>
    );
  }

  const veiculosDoCliente = clienteId ? veiculos.filter((v) => v.clienteId === clienteId) : [];

  function handleClienteChange(novoId: string) {
    setClienteId(novoId);
    setVeiculoId('');
  }

  async function handleSalvar() {
    if (!clienteId) { toast.error('Selecione um cliente.'); return; }
    if (!veiculoId) { toast.error('Selecione um veículo.'); return; }
    if (!kmEntrada) { toast.error('Informe o KM de entrada.'); return; }
    setSalvando(true);
    try {
      await editarOrdem(ordem.id, {
        clienteId,
        veiculoId,
        descricao,
        kmEntrada: Number(kmEntrada),
        previsaoEntrega: previsaoEntrega || undefined,
      });
      toast.success('Ordem de serviço atualizada com sucesso!');
      navigate(`/ordens/${ordem.id}`);
    } catch (err) {
      toast.error((err as Error).message || 'Erro ao salvar ordem de serviço.');
      setSalvando(false);
    }
  }

  return (
    <div>
      <div className="mb-4">
        <button
          onClick={() => navigate(`/ordens/${ordem.id}`)}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft size={16} /> Voltar para OS #{ordem.numero}
        </button>
      </div>

      <PageHeader
        title={`Editar OS #${ordem.numero}`}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={() => navigate(`/ordens/${ordem.id}`)} disabled={salvando}>
              Cancelar
            </Button>
            <Button onClick={handleSalvar} disabled={salvando}>
              {salvando ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Informações */}
        <Card className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileText size={18} /> Informações
          </h3>
          <div className="space-y-4">
            <Select
              label="Cliente *"
              value={clienteId}
              onChange={(e) => handleClienteChange(e.target.value)}
              placeholder="Selecione um cliente"
              options={clientes.map((c) => ({ value: c.id, label: c.nome }))}
            />
            <Select
              label="Veículo *"
              value={veiculoId}
              onChange={(e) => setVeiculoId(e.target.value)}
              placeholder={clienteId ? 'Selecione um veículo' : 'Selecione o cliente primeiro'}
              disabled={!clienteId || veiculosDoCliente.length === 0}
              options={veiculosDoCliente.map((v) => ({
                value: v.id,
                label: `${v.marca} ${v.modelo} — ${v.placa}`,
              }))}
            />
            {clienteId && veiculosDoCliente.length === 0 && (
              <p className="text-xs text-amber-600">Este cliente não tem veículos cadastrados.</p>
            )}
            <Input
              label="KM de Entrada *"
              type="number"
              min="0"
              value={kmEntrada}
              onChange={(e) => setKmEntrada(e.target.value)}
            />
            <Input
              label="Previsão de Entrega"
              type="date"
              value={previsaoEntrega}
              onChange={(e) => setPrevisaoEntrega(e.target.value)}
            />
            <Textarea
              label="Descrição"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descreva o problema ou serviço solicitado"
            />
          </div>
        </Card>

        {/* Itens */}
        <Card className="p-6 lg:col-span-2">
          <OrdemItensTable
            itens={ordem.itens}
            onAdicionarItem={(item) => adicionarItem(ordem.id, item)}
            onRemoverItem={(itemId) => removerItem(ordem.id, itemId)}
          />
        </Card>
      </div>

      {/* Anexos */}
      <Card className="p-6">
        <AnexosSection ordemId={ordem.id} />
      </Card>
    </div>
  );
}
