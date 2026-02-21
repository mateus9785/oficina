import { useState } from 'react';
import type { StatusOS } from '../../types';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';
import { useClienteStore } from '../../stores/useClienteStore';
import { useVeiculoStore } from '../../stores/useVeiculoStore';

interface OrdemServicoFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    clienteId: string;
    veiculoId: string;
    status: StatusOS;
    dataAbertura: string;
    descricao: string;
    observacoes: string;
    kmEntrada: number;
  }) => void;
}

export function OrdemServicoForm({ isOpen, onClose, onSave }: OrdemServicoFormProps) {
  const { clientes } = useClienteStore();
  const { veiculos } = useVeiculoStore();
  const [clienteId, setClienteId] = useState('');
  const [veiculoId, setVeiculoId] = useState('');
  const [descricao, setDescricao] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [kmEntrada, setKmEntrada] = useState('');

  const veiculosFiltrados = clienteId
    ? veiculos.filter((v) => v.clienteId === clienteId)
    : [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      clienteId,
      veiculoId,
      status: 'aguardando_aprovacao',
      dataAbertura: new Date().toISOString(),
      descricao,
      observacoes,
      kmEntrada: Number(kmEntrada),
    });
    setClienteId(''); setVeiculoId(''); setDescricao('');
    setObservacoes(''); setKmEntrada('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nova Ordem de Serviço" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Cliente"
          value={clienteId}
          onChange={(e) => { setClienteId(e.target.value); setVeiculoId(''); }}
          options={clientes.map((c) => ({ value: c.id, label: c.nome }))}
          placeholder="Selecione o cliente"
          required
        />
        <Select
          label="Veículo"
          value={veiculoId}
          onChange={(e) => setVeiculoId(e.target.value)}
          options={veiculosFiltrados.map((v) => ({ value: v.id, label: `${v.marca} ${v.modelo} (${v.placa})` }))}
          placeholder={clienteId ? 'Selecione o veículo' : 'Selecione um cliente primeiro'}
          disabled={!clienteId}
          required
        />
        <Input label="KM de Entrada" type="number" value={kmEntrada} onChange={(e) => setKmEntrada(e.target.value)} />
        <Textarea label="Descrição" value={descricao} onChange={(e) => setDescricao(e.target.value)} required />
        <Textarea label="Observações" value={observacoes} onChange={(e) => setObservacoes(e.target.value)} />
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="secondary" type="button" onClick={onClose}>Cancelar</Button>
          <Button type="submit">Criar OS</Button>
        </div>
      </form>
    </Modal>
  );
}
