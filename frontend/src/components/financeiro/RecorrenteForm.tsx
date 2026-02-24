import { useState, useEffect } from 'react';
import type { DespesaRecorrente, CategoriaRecorrente } from '../../types';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';
import { CATEGORIAS_RECORRENTE } from '../../stores/useRecorrentesStore';

interface RecorrenteFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<DespesaRecorrente, 'id' | 'ativo'>) => void;
  recorrente?: DespesaRecorrente;
}

export function RecorrenteForm({ isOpen, onClose, onSave, recorrente }: RecorrenteFormProps) {
  const [categoria, setCategoria] = useState<CategoriaRecorrente>('outros');
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [diaVencimento, setDiaVencimento] = useState('');
  const [observacoes, setObservacoes] = useState('');

  useEffect(() => {
    if (recorrente) {
      setCategoria(recorrente.categoria);
      setDescricao(recorrente.descricao);
      setValor(String(recorrente.valor));
      setDiaVencimento(String(recorrente.diaVencimento));
      setObservacoes(recorrente.observacoes);
    } else {
      setCategoria('outros');
      setDescricao('');
      setValor('');
      setDiaVencimento('');
      setObservacoes('');
    }
  }, [recorrente, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      categoria,
      descricao,
      valor: Number(valor),
      diaVencimento: Number(diaVencimento),
      observacoes,
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={recorrente ? 'Editar Despesa Recorrente' : 'Nova Despesa Recorrente'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Categoria"
          value={categoria}
          onChange={(e) => setCategoria(e.target.value as CategoriaRecorrente)}
          options={CATEGORIAS_RECORRENTE}
        />
        <Input
          label="Descrição"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          required
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Valor (R$)"
            type="number"
            step="0.01"
            min="0.01"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            required
          />
          <Input
            label="Dia do vencimento (1–31)"
            type="number"
            min="1"
            max="31"
            value={diaVencimento}
            onChange={(e) => setDiaVencimento(e.target.value)}
            required
          />
        </div>
        <Textarea
          label="Observações"
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
        />
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="secondary" type="button" onClick={onClose}>Cancelar</Button>
          <Button type="submit">Salvar</Button>
        </div>
      </form>
    </Modal>
  );
}
