import { useState } from 'react';
import type { ItemOS } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { PecaSelector } from '../estoque/PecaSelector';
import { formatCurrency } from '../../lib/formatters';
import { calcularTotalItem } from '../../lib/calculators';
import { Trash2, Plus } from 'lucide-react';
import type { Peca } from '../../types';

interface OrdemItensTableProps {
  itens: ItemOS[];
  onAdicionarItem: (item: Omit<ItemOS, 'id'>) => void;
  onRemoverItem: (itemId: string) => void;
  readOnly?: boolean;
  descontoPercentual?: number;
  onDescontoChange?: (valor: number) => void;
  descontoMaximo?: number;
}

export function OrdemItensTable({ itens, onAdicionarItem, onRemoverItem, readOnly, descontoPercentual = 0, onDescontoChange, descontoMaximo = 100 }: OrdemItensTableProps) {
  const [addMode, setAddMode] = useState<'peca' | 'servico' | null>(null);
  const [descricaoServico, setDescricaoServico] = useState('');
  const [valorServico, setValorServico] = useState('');

  const subtotal = itens.reduce((sum, item) => sum + calcularTotalItem(item), 0);
  const valorDesconto = subtotal * (descontoPercentual / 100);
  const total = subtotal - valorDesconto;

  function handleDescontoInput(value: string) {
    if (!onDescontoChange) return;
    const num = Math.min(Math.max(Number(value) || 0, 0), descontoMaximo);
    onDescontoChange(num);
  }

  const handleSelectPeca = (peca: Peca) => {
    onAdicionarItem({
      tipo: 'peca',
      pecaId: peca.id,
      descricao: peca.nome,
      quantidade: 1,
      valorUnitario: peca.precoVenda,
    });
  };

  const handleAddServico = () => {
    if (!descricaoServico || !valorServico) return;
    onAdicionarItem({
      tipo: 'servico',
      descricao: descricaoServico,
      quantidade: 1,
      valorUnitario: Number(valorServico),
    });
    setDescricaoServico('');
    setValorServico('');
    setAddMode(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-gray-900">Itens da OS</h4>
        {!readOnly && (
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" onClick={() => setAddMode('peca')}>
              <Plus size={14} /> Peça
            </Button>
            <Button size="sm" variant="secondary" onClick={() => setAddMode('servico')}>
              <Plus size={14} /> Serviço
            </Button>
          </div>
        )}
      </div>

      {addMode === 'peca' && (
        <div className="mb-3 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700 mb-2">Selecione uma peça do estoque:</p>
          <PecaSelector onSelect={handleSelectPeca} />
          <Button size="sm" variant="ghost" className="mt-2" onClick={() => setAddMode(null)}>Cancelar</Button>
        </div>
      )}

      {addMode === 'servico' && (
        <div className="mb-3 p-3 bg-green-50 rounded-lg space-y-2">
          <Input label="Descrição do serviço" value={descricaoServico} onChange={(e) => setDescricaoServico(e.target.value)} />
          <Input label="Valor (R$)" type="number" step="0.01" value={valorServico} onChange={(e) => setValorServico(e.target.value)} />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleAddServico}>Adicionar</Button>
            <Button size="sm" variant="ghost" onClick={() => setAddMode(null)}>Cancelar</Button>
          </div>
        </div>
      )}

      {itens.length === 0 ? (
        <p className="text-center text-gray-500 py-4 text-sm">Nenhum item adicionado</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs text-gray-500 uppercase">
                <th className="pb-2">Tipo</th>
                <th className="pb-2">Descrição</th>
                <th className="pb-2 text-right">Qtd</th>
                <th className="pb-2 text-right">Valor Unit.</th>
                <th className="pb-2 text-right">Total</th>
                {!readOnly && <th className="pb-2"></th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {itens.map((item) => (
                <tr key={item.id}>
                  <td className="py-2">
                    <span className={`text-xs px-2 py-0.5 rounded ${item.tipo === 'peca' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                      {item.tipo === 'peca' ? 'Peça' : 'Serviço'}
                    </span>
                  </td>
                  <td className="py-2">{item.descricao}</td>
                  <td className="py-2 text-right">{item.quantidade}</td>
                  <td className="py-2 text-right">{formatCurrency(item.valorUnitario)}</td>
                  <td className="py-2 text-right font-medium">{formatCurrency(calcularTotalItem(item))}</td>
                  {!readOnly && (
                    <td className="py-2 text-right">
                      <button onClick={() => onRemoverItem(item.id)} className="text-red-500 hover:text-red-700 p-1">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
            <tfoot>
              {descontoPercentual > 0 && (
                <>
                  <tr>
                    <td colSpan={readOnly ? 4 : 5} className="py-1 text-right text-sm text-gray-500">Subtotal:</td>
                    <td className="py-1 text-right text-sm text-gray-500">{formatCurrency(subtotal)}</td>
                  </tr>
                  <tr>
                    <td colSpan={readOnly ? 4 : 5} className="py-1 text-right text-sm text-red-500">Desconto ({descontoPercentual}%):</td>
                    <td className="py-1 text-right text-sm text-red-500">- {formatCurrency(valorDesconto)}</td>
                  </tr>
                </>
              )}
              <tr className="border-t-2">
                <td colSpan={readOnly ? 4 : 5} className="py-2 text-right font-semibold">Total:</td>
                <td className="py-2 text-right font-bold text-green-600">{formatCurrency(total)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {!readOnly && onDescontoChange && itens.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
          <span className="text-sm text-gray-600 shrink-0">
            Desconto <span className="text-gray-400">(máx. {descontoMaximo}%)</span>
          </span>
          <div className="flex items-center gap-1.5 w-28">
            <Input
              type="number"
              min="0"
              max={descontoMaximo}
              step="0.5"
              value={descontoPercentual === 0 ? '' : String(descontoPercentual)}
              onChange={(e) => handleDescontoInput(e.target.value)}
              placeholder="0"
            />
            <span className="text-sm text-gray-500 shrink-0">%</span>
          </div>
        </div>
      )}
    </div>
  );
}
