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
import { RecorrenteForm } from '../components/financeiro/RecorrenteForm';
import { RecorrentesList } from '../components/financeiro/RecorrentesList';
import { useFinanceiroStore } from '../stores/useFinanceiroStore';
import { useRecorrentesStore } from '../stores/useRecorrentesStore';
import type { Conta, DespesaRecorrente } from '../types';

export function FinanceiroPage() {
  const { contas, adicionarConta, editarConta, removerConta, pagarConta, fetchContas } = useFinanceiroStore();
  const { recorrentes, fetchRecorrentes, adicionarRecorrente, editarRecorrente, removerRecorrente, toggleAtivo } = useRecorrentesStore();

  const [formOpen, setFormOpen] = useState(false);
  const [contaEditando, setContaEditando] = useState<Conta | undefined>(undefined);
  const [contaRemover, setContaRemover] = useState<Conta | undefined>(undefined);
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');

  const [recorrenteFormOpen, setRecorrenteFormOpen] = useState(false);
  const [recorrenteEditando, setRecorrenteEditando] = useState<DespesaRecorrente | undefined>(undefined);
  const [recorrenteRemover, setRecorrenteRemover] = useState<DespesaRecorrente | undefined>(undefined);

  useEffect(() => { fetchContas(); }, []);
  useEffect(() => { fetchRecorrentes(); }, []);

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

      <Card className="mt-6">
        <div className="p-4 border-b flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Despesas Recorrentes</h2>
            <p className="text-sm text-gray-500">Geradas automaticamente 10 dias antes do vencimento</p>
          </div>
          <Button onClick={() => setRecorrenteFormOpen(true)}>
            <Plus size={18} /> Nova Recorrente
          </Button>
        </div>
        <RecorrentesList
          recorrentes={recorrentes}
          onEditar={(rec) => setRecorrenteEditando(rec)}
          onRemover={(rec) => setRecorrenteRemover(rec)}
          onToggle={async (id) => {
            try {
              await toggleAtivo(id);
            } catch (err) {
              toast.error((err as Error).message || 'Erro ao alterar status.');
            }
          }}
        />
      </Card>

      {/* Conta forms */}
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

      {/* Recorrente forms */}
      <RecorrenteForm
        isOpen={recorrenteFormOpen}
        onClose={() => setRecorrenteFormOpen(false)}
        onSave={async (data) => {
          try {
            await adicionarRecorrente(data);
            toast.success('Despesa recorrente cadastrada com sucesso!');
          } catch (err) {
            toast.error((err as Error).message || 'Erro ao cadastrar despesa recorrente.');
          }
        }}
      />

      <RecorrenteForm
        isOpen={!!recorrenteEditando}
        recorrente={recorrenteEditando}
        onClose={() => setRecorrenteEditando(undefined)}
        onSave={async (data) => {
          try {
            await editarRecorrente(recorrenteEditando!.id, data);
            toast.success('Despesa recorrente atualizada com sucesso!');
          } catch (err) {
            toast.error((err as Error).message || 'Erro ao atualizar despesa recorrente.');
          }
        }}
      />

      <ConfirmDialog
        isOpen={!!recorrenteRemover}
        onClose={() => setRecorrenteRemover(undefined)}
        title="Excluir despesa recorrente"
        message={`Deseja excluir "${recorrenteRemover?.descricao || 'esta despesa recorrente'}"? Esta ação não pode ser desfeita.`}
        onConfirm={async () => {
          try {
            await removerRecorrente(recorrenteRemover!.id);
            toast.success('Despesa recorrente excluída com sucesso!');
          } catch (err) {
            toast.error((err as Error).message || 'Erro ao excluir despesa recorrente.');
          } finally {
            setRecorrenteRemover(undefined);
          }
        }}
      />
    </div>
  );
}
