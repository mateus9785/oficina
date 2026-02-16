import { useState, useMemo } from 'react';
import { Plus } from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { FluxoCaixaDashboard } from '../components/financeiro/FluxoCaixaDashboard';
import { ContasList } from '../components/financeiro/ContasList';
import { ContaForm } from '../components/financeiro/ContaForm';
import { GraficoReceitas } from '../components/financeiro/GraficoReceitas';
import { useFinanceiroStore } from '../stores/useFinanceiroStore';

export function FinanceiroPage() {
  const { contas, adicionarConta, pagarConta } = useFinanceiroStore();
  const [formOpen, setFormOpen] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');

  const filtered = useMemo(() => {
    let result = contas;
    if (filtroTipo) result = result.filter((c) => c.tipo === filtroTipo);
    if (filtroStatus) result = result.filter((c) => c.status === filtroStatus);
    return result.sort((a, b) => new Date(b.dataVencimento).getTime() - new Date(a.dataVencimento).getTime());
  }, [contas, filtroTipo, filtroStatus]);

  return (
    <div>
      <PageHeader
        title="Financeiro"
        description="Fluxo de caixa e contas"
        actions={
          <Button onClick={() => setFormOpen(true)}>
            <Plus size={18} /> Nova Conta
          </Button>
        }
      />

      <FluxoCaixaDashboard contas={contas} />

      <Card className="p-6 mt-6">
        <h3 className="font-semibold text-gray-900 mb-4">Receitas x Despesas (6 meses)</h3>
        <GraficoReceitas contas={contas} />
      </Card>

      <Card className="mt-6">
        <div className="p-4 border-b flex flex-col sm:flex-row gap-4">
          <Select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            options={[
              { value: '', label: 'Todos os tipos' },
              { value: 'receita', label: 'Receitas' },
              { value: 'despesa', label: 'Despesas' },
            ]}
          />
          <Select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            options={[
              { value: '', label: 'Todos os status' },
              { value: 'pago', label: 'Pago' },
              { value: 'pendente', label: 'Pendente' },
              { value: 'atrasado', label: 'Atrasado' },
            ]}
          />
        </div>
        <ContasList contas={filtered} onPagar={pagarConta} />
      </Card>

      <ContaForm isOpen={formOpen} onClose={() => setFormOpen(false)} onSave={(data) => adicionarConta(data)} />
    </div>
  );
}
