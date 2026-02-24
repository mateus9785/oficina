import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, TrendingUp, Package, MapPin, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '../components/layout/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { PecaForm } from '../components/estoque/PecaForm';
import { useEstoqueStore } from '../stores/useEstoqueStore';
import { CATEGORIA_PECA_LABELS } from '../types';
import { formatCurrency, formatDate } from '../lib/formatters';

export function PecaDetalhePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { buscarPeca, editarPeca, removerPeca, fetchPecaById } = useEstoqueStore();

  useEffect(() => {
    fetchPecaById(id!);
  }, [id]);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const peca = buscarPeca(id!);

  if (!peca) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Peça não encontrada</p>
        <Button variant="secondary" className="mt-4" onClick={() => navigate('/estoque')}>Voltar</Button>
      </div>
    );
  }

  const abaixoMinimo = peca.quantidade <= peca.estoqueMinimo;

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
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp size={18} /> Preços
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Preço de Compra</span><span className="font-medium">{formatCurrency(peca.precoCompra)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Preço de Venda</span><span className="font-medium text-green-600">{formatCurrency(peca.precoVenda)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Margem</span><span className="font-medium">{((peca.precoVenda - peca.precoCompra) / peca.precoCompra * 100).toFixed(0)}%</span></div>
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
              {[...peca.historicoPrecos].reverse().map((h, i) => (
                <div key={i} className="text-xs p-2 bg-gray-50 rounded">
                  <div className="flex justify-between text-gray-500 mb-0.5">
                    <span>{formatDate(h.data)}</span>
                    <span>{h.fornecedor || '—'}</span>
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
