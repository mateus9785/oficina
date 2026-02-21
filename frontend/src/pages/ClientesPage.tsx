import { useState, useMemo, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '../components/layout/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { SearchInput } from '../components/ui/SearchInput';
import { ClienteList } from '../components/clientes/ClienteList';
import { ClienteForm } from '../components/clientes/ClienteForm';
import { useClienteStore } from '../stores/useClienteStore';
import { useDebounce } from '../hooks/useDebounce';

export function ClientesPage() {
  const { clientes, adicionarCliente, fetchClientes, loading } = useClienteStore();
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const debouncedSearch = useDebounce(search);

  useEffect(() => { fetchClientes(); }, []);

  const filtered = useMemo(() => {
    if (!debouncedSearch) return clientes;
    const q = debouncedSearch.toLowerCase();
    return clientes.filter(
      (c) =>
        c.nome.toLowerCase().includes(q) ||
        c.cpfCnpj.includes(q) ||
        c.telefone.includes(q) ||
        c.email.toLowerCase().includes(q)
    );
  }, [clientes, debouncedSearch]);

  return (
    <div>
      <PageHeader
        title="Clientes"
        description={`${clientes.length} clientes cadastrados`}
        actions={
          <Button onClick={() => setFormOpen(true)}>
            <Plus size={18} />
            Novo Cliente
          </Button>
        }
      />

      <Card className="p-4 mb-4">
        <SearchInput value={search} onChange={setSearch} placeholder="Buscar por nome, CPF/CNPJ, telefone ou e-mail..." />
      </Card>

      {loading ? (
        <Card className="p-8 text-center text-gray-400">Carregando...</Card>
      ) : (
        <Card>
          <ClienteList clientes={filtered} />
        </Card>
      )}

      <ClienteForm
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={async (data) => {
          try {
            await adicionarCliente(data);
            toast.success('Cliente cadastrado com sucesso!');
          } catch (err) {
            toast.error((err as Error).message || 'Erro ao cadastrar cliente.');
          }
        }}
      />
    </div>
  );
}
