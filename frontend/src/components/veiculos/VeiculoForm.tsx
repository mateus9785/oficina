import { useState, useEffect } from 'react';
import type { Veiculo, TipoVeiculo, Cliente } from '../../types';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';

interface VeiculoFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Veiculo, 'id'>) => void;
  veiculo?: Veiculo;
  clienteId?: string;
  clientes?: Cliente[];
}

export function VeiculoForm({ isOpen, onClose, onSave, veiculo, clienteId, clientes }: VeiculoFormProps) {
  const [selectedClienteId, setSelectedClienteId] = useState(clienteId || '');
  const [tipo, setTipo] = useState<TipoVeiculo>('carro');
  const [marca, setMarca] = useState('');
  const [modelo, setModelo] = useState('');
  const [ano, setAno] = useState('');
  const [placa, setPlaca] = useState('');
  const [cor, setCor] = useState('');
  const [observacoes, setObservacoes] = useState('');

  useEffect(() => {
    if (veiculo) {
      setTipo(veiculo.tipo);
      setMarca(veiculo.marca);
      setModelo(veiculo.modelo);
      setAno(String(veiculo.ano));
      setPlaca(veiculo.placa);
      setCor(veiculo.cor);
      setObservacoes(veiculo.observacoes);
    } else {
      setSelectedClienteId(clienteId || '');
      setTipo('carro');
      setMarca('');
      setModelo('');
      setAno('');
      setPlaca('');
      setCor('');
      setObservacoes('');
    }
  }, [veiculo, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      clienteId: selectedClienteId,
      tipo,
      marca,
      modelo,
      ano: Number(ano),
      placa: placa.toUpperCase(),
      cor,
      observacoes,
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={veiculo ? 'Editar Veículo' : 'Novo Veículo'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {clientes && !clienteId && (
          <Select
            label="Cliente"
            value={selectedClienteId}
            onChange={(e) => setSelectedClienteId(e.target.value)}
            options={clientes.map((c) => ({ value: c.id, label: c.nome }))}
            required
          />
        )}
        <Select
          label="Tipo"
          value={tipo}
          onChange={(e) => setTipo(e.target.value as TipoVeiculo)}
          options={[
            { value: 'carro', label: 'Carro' },
            { value: 'moto', label: 'Moto' },
          ]}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Marca" value={marca} onChange={(e) => setMarca(e.target.value)} />
          <Input label="Modelo" value={modelo} onChange={(e) => setModelo(e.target.value)} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input label="Ano" type="number" value={ano} onChange={(e) => setAno(e.target.value)} />
          <Input label="Placa" value={placa} onChange={(e) => setPlaca(e.target.value)} required />
          <Input label="Cor" value={cor} onChange={(e) => setCor(e.target.value)} />
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
