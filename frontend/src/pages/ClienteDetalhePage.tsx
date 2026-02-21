import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Plus, Car, Bike, Phone, Mail, MapPin, Cake } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '../components/layout/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { ClienteForm } from '../components/clientes/ClienteForm';
import { VeiculoForm } from '../components/veiculos/VeiculoForm';
import { useClienteStore } from '../stores/useClienteStore';
import { useVeiculoStore } from '../stores/useVeiculoStore';
import { formatCpfCnpj, formatPhone, formatDate } from '../lib/formatters';

export function ClienteDetalhePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { buscarCliente, editarCliente, removerCliente, fetchClientes, clientes } = useClienteStore();
  const { veiculos, adicionarVeiculo, fetchVeiculosDoCliente } = useVeiculoStore();

  useEffect(() => {
    if (clientes.length === 0) fetchClientes();
    if (id) fetchVeiculosDoCliente(id);
  }, [id]);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [veiculoFormOpen, setVeiculoFormOpen] = useState(false);

  const cliente = buscarCliente(id!);
  const veiculosCliente = veiculos.filter((v) => v.clienteId === id);

  if (!cliente) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Cliente não encontrado</p>
        <Button variant="secondary" className="mt-4" onClick={() => navigate('/clientes')}>
          Voltar
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <button onClick={() => navigate('/clientes')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft size={16} /> Voltar para clientes
        </button>
      </div>

      <PageHeader
        title={cliente.nome}
        description={`Cliente desde ${formatDate(cliente.dataCadastro)}`}
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
        {/* Informações */}
        <Card className="p-6 lg:col-span-1">
          <h3 className="font-semibold text-gray-900 mb-4">Informações</h3>
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-gray-500">CPF/CNPJ</span>
              <p className="font-medium">{formatCpfCnpj(cliente.cpfCnpj)}</p>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Phone size={16} />
              <span>{formatPhone(cliente.telefone)}</span>
            </div>
            {cliente.email && (
              <div className="flex items-center gap-2 text-gray-600">
                <Mail size={16} />
                <span>{cliente.email}</span>
              </div>
            )}
            {cliente.dataNascimento && (
              <div className="flex items-center gap-2 text-gray-600">
                <Cake size={16} />
                <span>{formatDate(cliente.dataNascimento)}</span>
              </div>
            )}
            {(cliente.rua || cliente.cidade) && (
              <div className="flex items-start gap-2 text-gray-600">
                <MapPin size={16} className="mt-0.5 shrink-0" />
                <div className="text-sm">
                  {cliente.rua && (
                    <p>{cliente.rua}{cliente.numero ? `, ${cliente.numero}` : ''}{cliente.complemento ? ` — ${cliente.complemento}` : ''}</p>
                  )}
                  {(cliente.cidade || cliente.estado) && (
                    <p>{[cliente.cidade, cliente.estado].filter(Boolean).join(' - ')}{cliente.cep ? ` · ${cliente.cep}` : ''}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Veículos */}
        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Veículos ({veiculosCliente.length})</h3>
            <Button size="sm" onClick={() => setVeiculoFormOpen(true)}>
              <Plus size={16} /> Adicionar
            </Button>
          </div>
          {veiculosCliente.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Nenhum veículo cadastrado</p>
          ) : (
            <div className="space-y-3">
              {veiculosCliente.map((v) => (
                <div
                  key={v.id}
                  className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/veiculos/${v.id}`)}
                >
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    {v.tipo === 'carro' ? <Car size={20} className="text-blue-600" /> : <Bike size={20} className="text-blue-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">{v.marca} {v.modelo}</p>
                    <p className="text-sm text-gray-500">{v.placa}{v.ano ? ` - ${v.ano}` : ''}{v.cor ? ` - ${v.cor}` : ''}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <ClienteForm
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        onSave={async (data) => {
          try {
            await editarCliente(cliente.id, data);
            toast.success('Cliente atualizado com sucesso!');
          } catch (err) {
            toast.error((err as Error).message || 'Erro ao atualizar cliente.');
          }
        }}
        cliente={cliente}
      />

      <VeiculoForm
        isOpen={veiculoFormOpen}
        onClose={() => setVeiculoFormOpen(false)}
        onSave={async (data) => {
          try {
            await adicionarVeiculo(data);
            toast.success('Veículo cadastrado com sucesso!');
          } catch (err) {
            toast.error((err as Error).message || 'Erro ao cadastrar veículo.');
          }
        }}
        clienteId={cliente.id}
      />

      <ConfirmDialog
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={async () => {
          try {
            await removerCliente(cliente.id);
            toast.success('Cliente excluído com sucesso!');
            navigate('/clientes');
          } catch (err) {
            toast.error((err as Error).message || 'Erro ao excluir cliente.');
          }
        }}
        title="Excluir Cliente"
        message={`Tem certeza que deseja excluir o cliente "${cliente.nome}"? Esta ação não pode ser desfeita.`}
      />
    </div>
  );
}
