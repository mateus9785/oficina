import { useState, useEffect } from 'react';
import type { Veiculo, TipoVeiculo } from '../../types';
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
  clienteId: string;
}

export function VeiculoForm({ isOpen, onClose, onSave, veiculo, clienteId }: VeiculoFormProps) {
  const [tipo, setTipo] = useState<TipoVeiculo>('carro');
  const [marca, setMarca] = useState('');
  const [modelo, setModelo] = useState('');
  const [ano, setAno] = useState('');
  const [placa, setPlaca] = useState('');
  const [cor, setCor] = useState('');
  const [km, setKm] = useState('');
  const [observacoes, setObservacoes] = useState('');

  useEffect(() => {
    if (veiculo) {
      setTipo(veiculo.tipo);
      setMarca(veiculo.marca);
      setModelo(veiculo.modelo);
      setAno(String(veiculo.ano));
      setPlaca(veiculo.placa);
      setCor(veiculo.cor);
      setKm(String(veiculo.km));
      setObservacoes(veiculo.observacoes);
    } else {
      setTipo('carro');
      setMarca('');
      setModelo('');
      setAno('');
      setPlaca('');
      setCor('');
      setKm('');
      setObservacoes('');
    }
  }, [veiculo, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      clienteId,
      tipo,
      marca,
      modelo,
      ano: Number(ano),
      placa: placa.toUpperCase(),
      cor,
      km: Number(km),
      observacoes,
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={veiculo ? 'Editar Veículo' : 'Novo Veículo'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
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
          <Input label="Marca" value={marca} onChange={(e) => setMarca(e.target.value)} required />
          <Input label="Modelo" value={modelo} onChange={(e) => setModelo(e.target.value)} required />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input label="Ano" type="number" value={ano} onChange={(e) => setAno(e.target.value)} required />
          <Input label="Placa" value={placa} onChange={(e) => setPlaca(e.target.value)} required />
          <Input label="Cor" value={cor} onChange={(e) => setCor(e.target.value)} />
        </div>
        <Input label="Quilometragem" type="number" value={km} onChange={(e) => setKm(e.target.value)} />
        <Textarea label="Observações" value={observacoes} onChange={(e) => setObservacoes(e.target.value)} />
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="secondary" type="button" onClick={onClose}>Cancelar</Button>
          <Button type="submit">Salvar</Button>
        </div>
      </form>
    </Modal>
  );
}
