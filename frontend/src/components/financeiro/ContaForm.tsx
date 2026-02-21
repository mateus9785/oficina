import { useState, useEffect } from 'react';
import type { Conta, TipoConta, StatusConta, CategoriaConta } from '../../types';
import { CATEGORIA_CONTA_LABELS } from '../../types';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';

interface ContaFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Conta, 'id'>) => void;
  conta?: Conta;
}

const categoriaOptions = Object.entries(CATEGORIA_CONTA_LABELS).map(([value, label]) => ({ value, label }));

export function ContaForm({ isOpen, onClose, onSave, conta }: ContaFormProps) {
  const [tipo, setTipo] = useState<TipoConta>('receita');
  const [categoria, setCategoria] = useState<CategoriaConta>('ordem_servico');
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [dataVencimento, setDataVencimento] = useState('');
  const [status, setStatus] = useState<StatusConta>('pendente');
  const [observacoes, setObservacoes] = useState('');

  useEffect(() => {
    if (conta) {
      setTipo(conta.tipo);
      setCategoria(conta.categoria);
      setDescricao(conta.descricao);
      setValor(String(conta.valor));
      setDataVencimento(conta.dataVencimento.split('T')[0]);
      setStatus(conta.status);
      setObservacoes(conta.observacoes);
    } else {
      setTipo('receita'); setCategoria('ordem_servico'); setDescricao('');
      setValor(''); setDataVencimento(''); setStatus('pendente'); setObservacoes('');
    }
  }, [conta, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      tipo, categoria, descricao,
      valor: Number(valor),
      dataVencimento: `${dataVencimento}T00:00:00Z`,
      status,
      observacoes,
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={conta ? 'Editar Conta' : 'Nova Conta'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select label="Tipo" value={tipo} onChange={(e) => setTipo(e.target.value as TipoConta)} options={[{ value: 'receita', label: 'Receita' }, { value: 'despesa', label: 'Despesa' }]} />
          <Select label="Categoria" value={categoria} onChange={(e) => setCategoria(e.target.value as CategoriaConta)} options={categoriaOptions} />
        </div>
        <Input label="Descrição" value={descricao} onChange={(e) => setDescricao(e.target.value)} />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input label="Valor (R$)" type="number" step="0.01" value={valor} onChange={(e) => setValor(e.target.value)} required />
          <Input label="Data Vencimento" type="date" value={dataVencimento} onChange={(e) => setDataVencimento(e.target.value)} required />
          <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value as StatusConta)} options={[{ value: 'pendente', label: 'Pendente' }, { value: 'pago', label: 'Pago' }]} />
        </div>
        <Textarea label="Observações" value={observacoes} onChange={(e) => setObservacoes(e.target.value)} />
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="secondary" type="button" onClick={onClose}>Cancelar</Button>
          <Button type="submit">Salvar</Button>
        </div>
      </form>
    </Modal>
  );
}
