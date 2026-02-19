import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { api } from '../../lib/api';

interface MudarSenhaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MudarSenhaModal({ isOpen, onClose }: MudarSenhaModalProps) {
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);
  const [loading, setLoading] = useState(false);

  function reset() {
    setSenhaAtual('');
    setNovaSenha('');
    setConfirmar('');
    setErro('');
    setSucesso(false);
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro('');
    if (novaSenha !== confirmar) {
      setErro('As senhas não coincidem.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/mudar-senha', { senhaAtual, novaSenha });
      setSucesso(true);
    } catch (err) {
      setErro((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Mudar Senha">
      {sucesso ? (
        <div className="space-y-4">
          <p className="text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
            Senha alterada com sucesso.
          </p>
          <div className="flex justify-end">
            <Button onClick={handleClose}>Fechar</Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Senha atual"
            type="password"
            value={senhaAtual}
            onChange={(e) => setSenhaAtual(e.target.value)}
            required
          />
          <Input
            label="Nova senha"
            type="password"
            value={novaSenha}
            onChange={(e) => setNovaSenha(e.target.value)}
            required
          />
          <Input
            label="Confirmar nova senha"
            type="password"
            value={confirmar}
            onChange={(e) => setConfirmar(e.target.value)}
            required
          />
          {erro && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              {erro}
            </p>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={handleClose}>Cancelar</Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
