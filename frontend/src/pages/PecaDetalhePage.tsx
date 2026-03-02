import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, TrendingUp, Package, MapPin, AlertTriangle, Wrench } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '../components/layout/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { PecaForm } from '../components/estoque/PecaForm';
import { useEstoqueStore } from '../stores/useEstoqueStore';
import { CATEGORIA_PECA_LABELS, type HistoricoPreco } from '../types';
import { formatCurrency, formatDate } from '../lib/formatters';

export function PecaDetalhePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { buscarPeca, editarPeca, removerPeca, fetchPecaById, editarHistoricoPreco } = useEstoqueStore();

  useEffect(() => {
    fetchPecaById(id!);
  }, [id]);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editHistorico, setEditHistorico] = useState<HistoricoPreco | null>(null);
  const [hPreco, setHPreco] = useState('');
  const [hPrecoVenda, setHPrecoVenda] = useState('');
  const [hFornecedor, setHFornecedor] = useState('');
  const [hQuantidade, setHQuantidade] = useState('');
  const [hValorTotal, setHValorTotal] = useState('');
  const [hSaving, setHSaving] = useState(false);

  const peca = buscarPeca(id!);

  if (!peca) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Peça não encontrada</p>
        <Button variant="secondary" className="mt-4" onClick={() => navigate('/estoque')}>Voltar</Button>
      </div>
    );
  }

  const abaixoMinimo = peca.estoqueMinimo > 0 && peca.quantidade <= peca.estoqueMinimo;

  function abrirEditHistorico(h: HistoricoPreco) {
    setEditHistorico(h);
    setHPreco(String(h.preco));
    setHPrecoVenda(String(h.precoVenda));
    setHFornecedor(h.fornecedor);
    setHQuantidade(String(h.quantidade));
    setHValorTotal(String(h.valorTotal));
  }

  async function salvarHistorico() {
    if (!editHistorico || !peca) return;
    setHSaving(true);
    try {
      await editarHistoricoPreco(peca.id, editHistorico.id, {
        preco: Number(hPreco),
        precoVenda: Number(hPrecoVenda),
        fornecedor: hFornecedor,
        quantidade: Number(hQuantidade),
        valorTotal: Number(hValorTotal),
      });
      toast.success('Histórico atualizado!');
      setEditHistorico(null);
    } catch (err) {
      toast.error((err as Error).message || 'Erro ao atualizar histórico.');
    } finally {
      setHSaving(false);
    }
  }

  return (
    <div>
      <div className="mb-4">
        <button onClick={() => navigate('/estoque')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft size={16} /> Voltar para estoque
        </button>
      </div>

      <PageHeader
        title={peca.nome}
        description={peca.marca}
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

      {abaixoMinimo && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3">
          <AlertTriangle className="text-red-500" size={20} />
          <span className="text-red-800 font-medium">
            Estoque abaixo do mínimo! Atual: {peca.quantidade} / Mínimo: {peca.estoqueMinimo}
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Package size={18} /> Detalhes
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Categoria</span><Badge>{CATEGORIA_PECA_LABELS[peca.categoria]}</Badge></div>
            <div className="flex justify-between"><span className="text-gray-500">Marca</span><span className="font-medium">{peca.marca}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Quantidade</span><span className={`font-medium ${abaixoMinimo ? 'text-red-600' : ''}`}>{peca.quantidade}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Estoque Mínimo</span><span className="font-medium">{peca.estoqueMinimo}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Uso Total</span><span className="font-medium">{peca.usoTotal}</span></div>
            {peca.servicoVinculadoNome && (
              <div className="pt-3 mt-3 border-t">
                <div className="flex items-center gap-1.5 text-purple-700 font-medium mb-1">
                  <Wrench size={14} />
                  <span className="text-xs uppercase tracking-wide">Serviço vinculado</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">{peca.servicoVinculadoNome}</span>
                  {peca.servicoVinculadoValor != null && (
                    <span className="font-medium text-purple-700">{formatCurrency(peca.servicoVinculadoValor)}</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp size={18} /> Preços
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Preço de Compra</span><span className="font-medium">{formatCurrency(peca.precoCompra)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Preço de Venda</span><span className="font-medium text-green-600">{formatCurrency(peca.precoVenda)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Margem</span><span className="font-medium">{peca.precoCompra > 0 ? ((peca.precoVenda - peca.precoCompra) / peca.precoCompra * 100).toFixed(0) : '0'}%</span></div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
            <MapPin size={14} />
            <span>Localização: {peca.localizacao}</span>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Histórico de Compras</h3>
          {peca.historicoPrecos.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-4">Nenhum histórico</p>
          ) : (
            <div className="space-y-2">
              {[...peca.historicoPrecos].reverse().map((h) => (
                <div key={h.id} className="text-xs p-2 bg-gray-50 rounded">
                  <div className="flex justify-between text-gray-500 mb-0.5">
                    <span>{formatDate(h.data)}</span>
                    <div className="flex items-center gap-2">
                      <span>{h.fornecedor || '—'}</span>
                      <button
                        onClick={() => abrirEditHistorico(h)}
                        className="text-blue-500 hover:text-blue-700"
                        title="Editar"
                      >
                        <Edit size={12} />
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-gray-600">{h.quantidade} un. · total {formatCurrency(h.valorTotal)}</span>
                    <span className="font-medium">Compra {formatCurrency(h.preco)} · Venda <span className="text-green-600">{formatCurrency(h.precoVenda)}</span></span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <PecaForm
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        onSave={async (data) => {
          try {
            await editarPeca(peca.id, data);
            toast.success('Peça atualizada com sucesso!');
          } catch (err) {
            toast.error((err as Error).message || 'Erro ao atualizar peça.');
          }
        }}
        peca={peca}
      />

      <Modal isOpen={!!editHistorico} onClose={() => setEditHistorico(null)} title="Editar Histórico de Compra">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Preço de Compra (R$)" type="number" step="0.01" value={hPreco} onChange={(e) => setHPreco(e.target.value)} />
            <Input label="Preço de Venda (R$)" type="number" step="0.01" value={hPrecoVenda} onChange={(e) => setHPrecoVenda(e.target.value)} />
            <Input label="Quantidade" type="number" value={hQuantidade} onChange={(e) => setHQuantidade(e.target.value)} />
            <Input label="Valor Total (R$)" type="number" step="0.01" value={hValorTotal} onChange={(e) => setHValorTotal(e.target.value)} />
          </div>
          <Input label="Fornecedor" value={hFornecedor} onChange={(e) => setHFornecedor(e.target.value)} />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setEditHistorico(null)}>Cancelar</Button>
            <Button onClick={salvarHistorico} disabled={hSaving}>{hSaving ? 'Salvando...' : 'Salvar'}</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={async () => {
          try {
            await removerPeca(peca.id);
            toast.success('Peça excluída com sucesso!');
            navigate('/estoque');
          } catch (err) {
            toast.error((err as Error).message || 'Erro ao excluir peça.');
          }
        }}
        title="Excluir Peça"
        message={`Tem certeza que deseja excluir "${peca.nome}"? Esta ação não pode ser desfeita.`}
      />
    </div>
  );
}
