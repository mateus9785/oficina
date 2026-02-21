import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Car, Bike } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '../components/layout/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { SearchInput } from '../components/ui/SearchInput';
import { Badge } from '../components/ui/Badge';
import { VeiculoForm } from '../components/veiculos/VeiculoForm';
import { useVeiculoStore } from '../stores/useVeiculoStore';
import { useClienteStore } from '../stores/useClienteStore';
import { useDebounce } from '../hooks/useDebounce';
import { formatPlaca } from '../lib/formatters';

export function VeiculosPage() {
  const { veiculos, adicionarVeiculo, fetchVeiculos, loading } = useVeiculoStore();
  const { clientes, fetchClientes } = useClienteStore();
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const debouncedSearch = useDebounce(search);
  const navigate = useNavigate();

  useEffect(() => {
    fetchVeiculos();
    fetchClientes();
  }, []);

  const filtered = useMemo(() => {
    if (!debouncedSearch) return veiculos;
    const q = debouncedSearch.toLowerCase();
    return veiculos.filter(
      (v) =>
        v.placa.toLowerCase().includes(q) ||
        v.marca.toLowerCase().includes(q) ||
        v.modelo.toLowerCase().includes(q)
    );
  }, [veiculos, debouncedSearch]);

  const clienteMap = useMemo(
    () => Object.fromEntries(clientes.map((c) => [c.id, c.nome])),
    [clientes]
  );

  return (
    <div>
      <PageHeader
        title="Veículos"
        description={`${veiculos.length} veículos cadastrados`}
        actions={
          <Button onClick={() => setFormOpen(true)}>
            <Plus size={18} /> Novo Veículo
          </Button>
        }
      />

      <Card className="p-4 mb-4">
        <SearchInput value={search} onChange={setSearch} placeholder="Buscar por placa, marca ou modelo..." />
      </Card>

      {loading ? (
        <Card className="p-8 text-center text-gray-400">Carregando...</Card>
      ) : filtered.length === 0 ? (
        <Card className="p-8 text-center text-gray-400">Nenhum veículo encontrado</Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((v) => (
            <Card
              key={v.id}
              className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => navigate(`/veiculos/${v.id}`)}
            >
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                  {v.tipo === 'carro' ? <Car size={20} className="text-blue-600" /> : <Bike size={20} className="text-blue-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900">
                    {v.marca && v.modelo ? `${v.marca} ${v.modelo}` : formatPlaca(v.placa)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {clienteMap[v.clienteId] || '—'}
                    {v.ano ? ` · ${v.ano}` : ''}
                    {v.cor ? ` · ${v.cor}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge>{formatPlaca(v.placa)}</Badge>
                  <Badge className="bg-blue-50 text-blue-700 border-blue-200">{v.tipo === 'carro' ? 'Carro' : 'Moto'}</Badge>
                </div>
            </Card>
          ))}
        </div>
      )}

      <VeiculoForm
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={async (data) => {
          try {
            await adicionarVeiculo(data);
            toast.success('Veículo cadastrado com sucesso!');
          } catch (err) {
            toast.error((err as Error).message || 'Erro ao cadastrar veículo.');
          }
        }}
        clientes={clientes}
      />
    </div>
  );
}
