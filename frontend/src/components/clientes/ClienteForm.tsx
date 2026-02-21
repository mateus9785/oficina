import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import type { Cliente } from '../../types';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
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
  const [dataNascimento, setDataNascimento] = useState('');
  const [cep, setCep] = useState('');
  const [rua, setRua] = useState('');
  const [numero, setNumero] = useState('');
  const [complemento, setComplemento] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [cpfError, setCpfError] = useState('');
  const [cepLoading, setCepLoading] = useState(false);
  const [cepError, setCepError] = useState('');

  useEffect(() => {
    if (cliente) {
      setNome(cliente.nome);
      setCpfCnpj(cliente.cpfCnpj ?? '');
      setTelefone(cliente.telefone ?? '');
      setEmail(cliente.email ?? '');
      setDataNascimento(cliente.dataNascimento ?? '');
      setCep(cliente.cep ?? '');
      setRua(cliente.rua ?? '');
      setNumero(cliente.numero ?? '');
      setComplemento(cliente.complemento ?? '');
      setCidade(cliente.cidade ?? '');
      setEstado(cliente.estado ?? '');
    } else {
      setNome(''); setCpfCnpj(''); setTelefone(''); setEmail('');
      setDataNascimento(''); setCep(''); setRua(''); setNumero('');
      setComplemento(''); setCidade(''); setEstado('');
    }
    setCpfError(''); setCepError('');
  }, [cliente, isOpen]);

  const handleCpfBlur = async () => {
    if (!cpfCnpj.trim()) { setCpfError(''); return; }
    const params = new URLSearchParams({ cpf: cpfCnpj.trim() });
    if (cliente?.id) params.set('excludeId', cliente.id);
    const data = await api.get<{ exists: boolean }>(`/clientes/check-cpf?${params}`);
    setCpfError(data.exists ? 'CPF/CNPJ já cadastrado.' : '');
  };

  const handleBuscarCep = async () => {
    const cepLimpo = cep.replace(/\D/g, '');
    if (cepLimpo.length !== 8) { setCepError('CEP deve ter 8 dígitos.'); return; }
    setCepLoading(true); setCepError('');
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await res.json();
      if (data.erro) { setCepError('CEP não encontrado.'); return; }
      setRua(data.logradouro ?? '');
      setCidade(data.localidade ?? '');
      setEstado(data.uf ?? '');
    } catch {
      setCepError('Erro ao buscar CEP. Verifique sua conexão.');
    } finally {
      setCepLoading(false);
    }
  };

  const handleCepKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { e.preventDefault(); handleBuscarCep(); }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cpfError) return;
    onSave({
      nome, cpfCnpj, telefone, email,
      dataNascimento: dataNascimento || null,
      cep, rua, numero, complemento, cidade, estado,
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={cliente ? 'Editar Cliente' : 'Novo Cliente'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Nome completo" value={nome} onChange={(e) => setNome(e.target.value)} required />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="CPF/CNPJ"
            value={cpfCnpj}
            onChange={(e) => { setCpfCnpj(e.target.value); setCpfError(''); }}
            onBlur={handleCpfBlur}
            error={cpfError}
          />
          <Input label="Telefone" value={telefone} onChange={(e) => setTelefone(e.target.value)} required />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="E-mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input
            label="Data de nascimento"
            type="date"
            value={dataNascimento}
            onChange={(e) => setDataNascimento(e.target.value)}
          />
        </div>

        <div className="border-t border-gray-200 pt-4">
          <p className="text-sm font-medium text-gray-700 mb-3">Endereço</p>

          <div className="flex items-end gap-2 mb-3">
            <div className="w-40">
              <Input
                label="CEP"
                value={cep}
                onChange={(e) => { setCep(e.target.value); setCepError(''); }}
                onKeyDown={handleCepKeyDown}
                error={cepError}
                placeholder="00000-000"
                maxLength={9}
              />
            </div>
            <div className="pb-0.5">
              <Button
                type="button"
                variant="secondary"
                onClick={handleBuscarCep}
                disabled={cepLoading}
              >
                <Search size={16} />
                {cepLoading ? 'Buscando...' : 'Buscar CEP'}
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <Input label="Rua / Logradouro" value={rua} onChange={(e) => setRua(e.target.value)} />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Número" value={numero} onChange={(e) => setNumero(e.target.value)} />
              <Input label="Complemento" value={complemento} onChange={(e) => setComplemento(e.target.value)} placeholder="Apto, sala, bloco..." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Cidade" value={cidade} onChange={(e) => setCidade(e.target.value)} />
              <Input label="Estado (UF)" value={estado} onChange={(e) => setEstado(e.target.value.toUpperCase())} maxLength={2} />
            </div>
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
