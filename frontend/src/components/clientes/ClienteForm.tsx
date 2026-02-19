import { useState, useEffect } from 'react';
import type { Cliente } from '../../types';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';
import { api } from '../../lib/api';

interface ClienteFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Cliente, 'id' | 'dataCadastro'>) => void;
  cliente?: Cliente;
}

export function ClienteForm({ isOpen, onClose, onSave, cliente }: ClienteFormProps) {
  const [nome, setNome] = useState('');
  const [cpfCnpj, setCpfCnpj] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [endereco, setEndereco] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [cpfError, setCpfError] = useState('');

  useEffect(() => {
    if (cliente) {
      setNome(cliente.nome);
      setCpfCnpj(cliente.cpfCnpj);
      setTelefone(cliente.telefone);
      setEmail(cliente.email);
      setEndereco(cliente.endereco);
      setObservacoes(cliente.observacoes);
    } else {
      setNome('');
      setCpfCnpj('');
      setTelefone('');
      setEmail('');
      setEndereco('');
      setObservacoes('');
    }
    setCpfError('');
  }, [cliente, isOpen]);

  const handleCpfBlur = async () => {
    if (!cpfCnpj.trim()) { setCpfError(''); return; }
    const params = new URLSearchParams({ cpf: cpfCnpj.trim() });
    if (cliente?.id) params.set('excludeId', cliente.id);
    const data = await api.get<{ exists: boolean }>(`/clientes/check-cpf?${params}`);
    setCpfError(data.exists ? 'CPF/CNPJ já cadastrado.' : '');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cpfError) return;
    onSave({ nome, cpfCnpj, telefone, email, endereco, observacoes });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={cliente ? 'Editar Cliente' : 'Novo Cliente'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Nome completo" value={nome} onChange={(e) => setNome(e.target.value)} required />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="CPF/CNPJ" value={cpfCnpj} onChange={(e) => { setCpfCnpj(e.target.value); setCpfError(''); }} onBlur={handleCpfBlur} error={cpfError} />
          <Input label="Telefone" value={telefone} onChange={(e) => setTelefone(e.target.value)} required />
        </div>
        <Input label="E-mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input label="Endereço" value={endereco} onChange={(e) => setEndereco(e.target.value)} required />
        <Textarea label="Observações" value={observacoes} onChange={(e) => setObservacoes(e.target.value)} />
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="secondary" type="button" onClick={onClose}>Cancelar</Button>
          <Button type="submit">Salvar</Button>
        </div>
      </form>
    </Modal>
  );
}
