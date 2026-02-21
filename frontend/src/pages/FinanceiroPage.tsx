import { useState, useMemo, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '../components/layout/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { FluxoCaixaDashboard } from '../components/financeiro/FluxoCaixaDashboard';
import { ContasList } from '../components/financeiro/ContasList';
import { ContaForm } from '../components/financeiro/ContaForm';
import { useFinanceiroStore } from '../stores/useFinanceiroStore';
import type { Conta } from '../types';

export function FinanceiroPage() {
  const { contas, adicionarConta, editarConta, removerConta, pagarConta, fetchContas } = useFinanceiroStore();
  const [formOpen, setFormOpen] = useState(false);
  const [contaEditando, setContaEditando] = useState<Conta | undefined>(undefined);
  const [contaRemover, setContaRemover] = useState<Conta | undefined>(undefined);
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');

  useEffect(() => { fetchContas(); }, []);

  const filtered = useMemo(() => {
    let result = contas;
    if (filtroTipo) result = result.filter((c) => c.tipo === filtroTipo);
    if (filtroStatus) result = result.filter((c) => c.status === filtroStatus);
    const priority = { atrasado: 0, pendente: 1, pago: 2 } as Record<string, number>;
    return result.sort((a, b) => {
      const diff = (priority[a.status] ?? 3) - (priority[b.status] ?? 3);
      if (diff !== 0) return diff;
      return new Date(a.dataVencimento).getTime() - new Date(b.dataVencimento).getTime();
    });
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
        <ContasList
          contas={filtered}
          onPagar={pagarConta}
          onEditar={(conta) => setContaEditando(conta)}
          onRemover={(conta) => setContaRemover(conta)}
        />
      </Card>

      <ContaForm
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={async (data) => {
          try {
            await adicionarConta(data);
            toast.success('Conta cadastrada com sucesso!');
          } catch (err) {
            toast.error((err as Error).message || 'Erro ao cadastrar conta.');
          }
        }}
      />

      <ContaForm
        isOpen={!!contaEditando}
        conta={contaEditando}
        onClose={() => setContaEditando(undefined)}
        onSave={async (data) => {
          try {
            await editarConta(contaEditando!.id, data);
            toast.success('Conta atualizada com sucesso!');
          } catch (err) {
            toast.error((err as Error).message || 'Erro ao atualizar conta.');
          }
        }}
      />

      <ConfirmDialog
        isOpen={!!contaRemover}
        onClose={() => setContaRemover(undefined)}
        title="Excluir conta"
        message={`Deseja excluir "${contaRemover?.descricao || 'esta conta'}"? Esta ação não pode ser desfeita.`}
        onConfirm={async () => {
          try {
            await removerConta(contaRemover!.id);
            toast.success('Conta excluída com sucesso!');
          } catch (err) {
            toast.error((err as Error).message || 'Erro ao excluir conta.');
          } finally {
            setContaRemover(undefined);
          }
        }}
      />
    </div>
  );
}
