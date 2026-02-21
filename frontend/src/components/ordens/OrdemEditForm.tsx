import { useState } from 'react';
import type { OrdemServico } from '../../types';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';

interface OrdemEditFormProps {
  isOpen: boolean;
  onClose: () => void;
  ordem: OrdemServico;
  onSave: (data: {
    descricao: string;
    kmEntrada: number;
  }) => Promise<void>;
}

export function OrdemEditForm({ isOpen, onClose, ordem, onSave }: OrdemEditFormProps) {
  const [descricao, setDescricao] = useState(ordem.descricao);
  const [kmEntrada, setKmEntrada] = useState(String(ordem.kmEntrada));
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({
        descricao,
        kmEntrada: Number(kmEntrada),
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Editar OS #${ordem.numero}`} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Textarea
          label="Descrição"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          required
        />
        <Input
          label="KM de Entrada"
          type="number"
          value={kmEntrada}
          onChange={(e) => setKmEntrada(e.target.value)}
        />
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="secondary" type="button" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
