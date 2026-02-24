import { useState, useEffect } from 'react';
import type { Peca } from '../../types';
import type { EntradaData } from '../../stores/useEstoqueStore';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

interface EntradaEstoqueModalProps {
  peca: Peca | null;
  onClose: () => void;
  onSave: (data: EntradaData) => Promise<void>;
}

export function EntradaEstoqueModal({ peca, onClose, onSave }: EntradaEstoqueModalProps) {
  const [quantidade, setQuantidade] = useState('');
  const [valorTotal, setValorTotal] = useState('');
  const [precoCompra, setPrecoCompra] = useState('');
  const [precoVenda, setPrecoVenda] = useState('');
  const [fornecedor, setFornecedor] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (peca) {
      setQuantidade('');
      setValorTotal('');
      setPrecoCompra('');
      setPrecoVenda('');
      setFornecedor('');
    }
  }, [peca]);

  useEffect(() => {
    const total = parseFloat(valorTotal);
    const qty = parseFloat(quantidade);
    if (total >= 0 && qty > 0) {
      const compra = total / qty;
      setPrecoCompra(compra.toFixed(2));
      setPrecoVenda((compra * 2).toFixed(2));
    }
  }, [valorTotal, quantidade]);

  useEffect(() => {
    const compra = parseFloat(precoCompra);
    if (compra > 0) {
      setPrecoVenda((compra * 2).toFixed(2));
    }
  }, [precoCompra]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({
        quantidade: Number(quantidade),
        valorTotal: Number(valorTotal),
        precoCompra: Number(precoCompra),
        precoVenda: Number(precoVenda),
        fornecedor,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={!!peca} onClose={onClose} title={`Dar Entrada — ${peca?.nome ?? ''}`} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Quantidade"
            type="number"
            min="1"
            step="1"
            value={quantidade}
            onChange={(e) => setQuantidade(e.target.value)}
            required
          />
          <Input
            label="Valor Total Pago (R$)"
            type="number"
            min="0"
            step="0.01"
            value={valorTotal}
            onChange={(e) => setValorTotal(e.target.value)}
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Preço de Compra (R$)"
            type="number"
            min="0"
            step="0.01"
            value={precoCompra}
            onChange={(e) => setPrecoCompra(e.target.value)}
            required
          />
          <Input
            label="Preço de Venda (R$)"
            type="number"
            min="0"
            step="0.01"
            value={precoVenda}
            onChange={(e) => setPrecoVenda(e.target.value)}
            required
          />
        </div>
        <Input
          label="Fornecedor"
          value={fornecedor}
          onChange={(e) => setFornecedor(e.target.value)}
          placeholder="Opcional"
        />
        <p className="text-xs text-gray-500">
          Preço de compra e venda são calculados automaticamente a partir do valor total e quantidade.
        </p>
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" type="button" onClick={onClose} disabled={saving}>Cancelar</Button>
          <Button type="submit" disabled={saving}>{saving ? 'Salvando...' : 'Confirmar Entrada'}</Button>
        </div>
      </form>
    </Modal>
  );
}
