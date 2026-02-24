import { useState, useEffect } from 'react';
import type { Peca, CategoriaPeca } from '../../types';
import { CATEGORIA_PECA_LABELS } from '../../types';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';

interface PecaFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Peca, 'id' | 'usoTotal' | 'historicoPrecos'>) => void;
  peca?: Peca;
}

const categoriaOptions = Object.entries(CATEGORIA_PECA_LABELS).map(([value, label]) => ({ value, label }));

export function PecaForm({ isOpen, onClose, onSave, peca }: PecaFormProps) {
  const [nome, setNome] = useState('');
  const [categoria, setCategoria] = useState<CategoriaPeca>('motor');
  const [marca, setMarca] = useState('');
  const [valorTotalPago, setValorTotalPago] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [estoqueMinimo, setEstoqueMinimo] = useState('');
  const [precoCompra, setPrecoCompra] = useState('');
  const [precoVenda, setPrecoVenda] = useState('');
  const [localizacao, setLocalizacao] = useState('');

  useEffect(() => {
    if (peca) {
      setNome(peca.nome);
      setCategoria(peca.categoria);
      setMarca(peca.marca);
      setQuantidade(String(peca.quantidade));
      setEstoqueMinimo(String(peca.estoqueMinimo));
      setPrecoCompra(String(peca.precoCompra));
      setPrecoVenda(String(peca.precoVenda));
      setLocalizacao(peca.localizacao);
    } else {
      setNome(''); setCategoria('motor'); setMarca('');
      setValorTotalPago(''); setQuantidade(''); setEstoqueMinimo('');
      setPrecoCompra(''); setPrecoVenda(''); setLocalizacao('');
    }
  }, [peca, isOpen]);

  useEffect(() => {
    const total = parseFloat(valorTotalPago);
    const qty = parseFloat(quantidade);
    if (total > 0 && qty > 0) {
      const compra = total / qty;
      setPrecoCompra(compra.toFixed(2));
      setPrecoVenda((compra * 2).toFixed(2));
    }
  }, [valorTotalPago, quantidade]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      nome, categoria, marca,
      quantidade: Number(quantidade),
      estoqueMinimo: Number(estoqueMinimo),
      precoCompra: Number(precoCompra),
      precoVenda: Number(precoVenda),
      localizacao,
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={peca ? 'Editar Peça' : 'Nova Peça'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select label="Categoria" value={categoria} onChange={(e) => setCategoria(e.target.value as CategoriaPeca)} options={categoriaOptions} />
        <Input label="Nome" value={nome} onChange={(e) => setNome(e.target.value)} required />
        <Input label="Marca" value={marca} onChange={(e) => setMarca(e.target.value)} />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input label="Valor Total Pago (R$)" type="number" step="0.01" value={valorTotalPago} onChange={(e) => setValorTotalPago(e.target.value)} placeholder="Ex: 150,00" />
          <Input label="Quantidade" type="number" value={quantidade} onChange={(e) => setQuantidade(e.target.value)} required />
          <Input label="Estoque Mínimo" type="number" value={estoqueMinimo} onChange={(e) => setEstoqueMinimo(e.target.value)} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Preço de Compra (R$)" type="number" step="0.01" value={precoCompra} onChange={(e) => setPrecoCompra(e.target.value)} required />
          <Input label="Preço de Venda (R$)" type="number" step="0.01" value={precoVenda} onChange={(e) => setPrecoVenda(e.target.value)} required />
        </div>
        <Input label="Localização" value={localizacao} onChange={(e) => setLocalizacao(e.target.value)} placeholder="Ex: A1-01" />
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="secondary" type="button" onClick={onClose}>Cancelar</Button>
          <Button type="submit">Salvar</Button>
        </div>
      </form>
    </Modal>
  );
}
