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
  const [estoqueMinimo, setEstoqueMinimo] = useState('');
  const [localizacao, setLocalizacao] = useState('');
  const [servicoVinculadoNome, setServicoVinculadoNome] = useState('');
  const [servicoVinculadoValor, setServicoVinculadoValor] = useState('');

  useEffect(() => {
    if (peca) {
      setNome(peca.nome);
      setCategoria(peca.categoria);
      setMarca(peca.marca);
      setEstoqueMinimo(String(peca.estoqueMinimo));
      setLocalizacao(peca.localizacao);
      setServicoVinculadoNome(peca.servicoVinculadoNome ?? '');
      setServicoVinculadoValor(peca.servicoVinculadoValor != null ? String(peca.servicoVinculadoValor) : '');
    } else {
      setNome(''); setCategoria('motor'); setMarca('');
      setEstoqueMinimo(''); setLocalizacao('');
      setServicoVinculadoNome(''); setServicoVinculadoValor('');
    }
  }, [peca, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const svNome = servicoVinculadoNome.trim() || null;
    const svValor = servicoVinculadoValor.trim() ? Number(servicoVinculadoValor) : null;

    onSave({
      nome, categoria, marca,
      quantidade: peca?.quantidade ?? 0,
      estoqueMinimo: Number(estoqueMinimo),
      precoCompra: peca?.precoCompra ?? 0,
      precoVenda: peca?.precoVenda ?? 0,
      localizacao,
      servicoVinculadoNome: svNome,
      servicoVinculadoValor: svValor,
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={peca ? 'Editar Peça' : 'Nova Peça'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select label="Categoria" value={categoria} onChange={(e) => setCategoria(e.target.value as CategoriaPeca)} options={categoriaOptions} />
        <Input label="Nome" value={nome} onChange={(e) => setNome(e.target.value)} required />
        <Input label="Marca" value={marca} onChange={(e) => setMarca(e.target.value)} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Estoque Mínimo" type="number" value={estoqueMinimo} onChange={(e) => setEstoqueMinimo(e.target.value)} />
          <Input label="Localização" value={localizacao} onChange={(e) => setLocalizacao(e.target.value)} placeholder="Ex: A1-01" />
        </div>

        <div className="border-t pt-4">
          <p className="text-sm font-medium text-gray-700 mb-1">Serviço vinculado</p>
          <p className="text-xs text-gray-500 mb-3">Ao adicionar esta peça a uma OS, este serviço será inserido automaticamente.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Nome do serviço"
              value={servicoVinculadoNome}
              onChange={(e) => setServicoVinculadoNome(e.target.value)}
              placeholder="Ex: Troca de Óleo"
            />
            <Input
              label="Valor do serviço (R$)"
              type="number"
              step="0.01"
              value={servicoVinculadoValor}
              onChange={(e) => setServicoVinculadoValor(e.target.value)}
              placeholder="Ex: 80.00"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="secondary" type="button" onClick={onClose}>Cancelar</Button>
          <Button type="submit">Salvar</Button>
        </div>
      </form>
    </Modal>
  );
}
