import { useState, useMemo, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { SearchInput } from '../components/ui/SearchInput';
import { Select } from '../components/ui/Select';
import { PecaList } from '../components/estoque/PecaList';
import { PecaForm } from '../components/estoque/PecaForm';
import { EstoqueAlerts } from '../components/estoque/EstoqueAlerts';
import { useEstoqueStore } from '../stores/useEstoqueStore';
import { useDebounce } from '../hooks/useDebounce';
import { CATEGORIA_PECA_LABELS } from '../types';

const categoriaOptions = [
  { value: '', label: 'Todas as categorias' },
  ...Object.entries(CATEGORIA_PECA_LABELS).map(([value, label]) => ({ value, label })),
];

export function EstoquePage() {
  const { pecas, adicionarPeca, pecasAbaixoMinimo, fetchPecas, loading } = useEstoqueStore();
  const [search, setSearch] = useState('');
  const [categoria, setCategoria] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const debouncedSearch = useDebounce(search);

  useEffect(() => { fetchPecas(); }, []);

  const alertas = pecasAbaixoMinimo();

  const filtered = useMemo(() => {
    let result = pecas;
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter(
        (p) => p.nome.toLowerCase().includes(q) || p.codigo.toLowerCase().includes(q) || p.marca.toLowerCase().includes(q)
      );
    }
    if (categoria) {
      result = result.filter((p) => p.categoria === categoria);
    }
    return result;
  }, [pecas, debouncedSearch, categoria]);

  return (
    <div>
      <PageHeader
        title="Estoque"
        description={`${pecas.length} peças cadastradas`}
        actions={
          <Button onClick={() => setFormOpen(true)}>
            <Plus size={18} /> Nova Peça
          </Button>
        }
      />

      <EstoqueAlerts pecas={alertas} />

      <Card className="p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <SearchInput value={search} onChange={setSearch} placeholder="Buscar por nome, código ou marca..." />
          </div>
          <div className="sm:w-48">
            <Select value={categoria} onChange={(e) => setCategoria(e.target.value)} options={categoriaOptions} />
          </div>
        </div>
      </Card>

      {loading ? (
        <Card className="p-8 text-center text-gray-400">Carregando...</Card>
      ) : (
        <Card>
          <PecaList pecas={filtered} />
        </Card>
      )}

      <PecaForm isOpen={formOpen} onClose={() => setFormOpen(false)} onSave={(data) => adicionarPeca(data)} />
    </div>
  );
}
