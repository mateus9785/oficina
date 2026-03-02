import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, Paperclip, X } from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Select } from '../components/ui/Select';
import { OrdemItensTable } from '../components/ordens/OrdemItensTable';
import { useClienteStore } from '../stores/useClienteStore';
import { useVeiculoStore } from '../stores/useVeiculoStore';
import { useOrdemServicoStore } from '../stores/useOrdemServicoStore';
import { useConfiguracoes } from '../stores/useConfiguracoes';
import { api } from '../lib/api';
import type { ItemOS, AnexoOS } from '../types';

interface LocalItem extends Omit<ItemOS, 'id'> {
  _localId: string;
}

export function NovaOrdemPage() {
  const navigate = useNavigate();
  const { clientes, fetchClientes } = useClienteStore();
  const { veiculos, fetchVeiculos } = useVeiculoStore();
  const { adicionarOrdem, moverOrdem, fetchOrdens } = useOrdemServicoStore();
  const { config, fetchConfiguracoes } = useConfiguracoes();

  const [avulso, setAvulso] = useState(false);
  const [clienteId, setClienteId] = useState('');
  const [veiculoId, setVeiculoId] = useState('');
  const [descricao, setDescricao] = useState('');
  const [kmEntrada, setKmEntrada] = useState('');
  const [previsaoEntrega, setPrevisaoEntrega] = useState('');
  const [descontoPercentual, setDescontoPercentual] = useState('0');
  const [itens, setItens] = useState<LocalItem[]>([]);
  const [arquivos, setArquivos] = useState<File[]>([]);
  const [salvando, setSalvando] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const descontoMaximo = Number(config.desconto_maximo ?? 100);

  useEffect(() => {
    if (clientes.length === 0) fetchClientes();
    if (veiculos.length === 0) fetchVeiculos();
    fetchConfiguracoes();
  }, []);

  const veiculosDoCliente = clienteId
    ? veiculos.filter((v) => v.clienteId === clienteId)
    : [];

  function handleClienteChange(id: string) {
    setClienteId(id);
    setVeiculoId('');
  }

  function handleAdicionarItem(item: Omit<ItemOS, 'id'>) {
    setItens((prev) => [...prev, { ...item, _localId: crypto.randomUUID() }]);
  }

  function handleRemoverItem(localId: string) {
    setItens((prev) => prev.filter((i) => i._localId !== localId));
  }

  function handleEditarQuantidade(localId: string, quantidade: number) {
    setItens((prev) => prev.map((i) => i._localId === localId ? { ...i, quantidade } : i));
  }

  function handleArquivos(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;
    setArquivos((prev) => [...prev, ...Array.from(files)]);
    e.target.value = '';
  }

  function handleRemoverArquivo(idx: number) {
    setArquivos((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleCriar() {
    if (!avulso) {
      if (!clienteId) { toast.error('Selecione um cliente.'); return; }
      if (!veiculoId) { toast.error('Selecione um veículo.'); return; }
      if (!kmEntrada) { toast.error('Informe o KM de entrada.'); return; }
    }

    const desconto = Math.min(Number(descontoPercentual) || 0, descontoMaximo);

    setSalvando(true);
    try {
      const payload: any = {
        descricao: descricao.trim() || '',
        status: 'aguardando_aprovacao',
        dataAbertura: new Date().toISOString(),
        descontoPercentual: desconto,
      };

      if (avulso) {
        payload.clienteId = null;
        payload.veiculoId = null;
        payload.kmEntrada = 0;
      } else {
        payload.clienteId = clienteId;
        payload.veiculoId = veiculoId;
        payload.kmEntrada = Number(kmEntrada);
        payload.previsaoEntrega = previsaoEntrega || undefined;
      }

      const ordem = await adicionarOrdem(payload);

      for (const item of itens) {
        await api.post(`/ordens/${ordem.id}/itens`, {
          tipo: item.tipo,
          descricao: item.descricao,
          quantidade: item.quantidade,
          valorUnitario: item.valorUnitario,
          pecaId: item.pecaId,
        });
      }

      if (arquivos.length > 0) {
        const formData = new FormData();
        arquivos.forEach((f) => formData.append('arquivos', f));
        await api.postForm<AnexoOS[]>(`/ordens/${ordem.id}/anexos`, formData);
      }

      if (avulso) {
        await moverOrdem(ordem.id, 'finalizado');
      }

      await fetchOrdens();
      toast.success('Ordem de serviço criada com sucesso!');
      navigate(`/ordens/${ordem.id}`);
    } catch (err) {
      toast.error((err as Error).message || 'Erro ao criar ordem de serviço.');
      setSalvando(false);
    }
  }

  const itensParaTabela: ItemOS[] = itens.map((i) => ({
    id: i._localId,
    tipo: i.tipo,
    pecaId: i.pecaId,
    descricao: i.descricao,
    quantidade: i.quantidade,
    valorUnitario: i.valorUnitario,
  }));

  return (
    <div>
      <div className="mb-4">
        <button
          onClick={() => navigate('/ordens')}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft size={16} /> Voltar para kanban
        </button>
      </div>

      <PageHeader
        title="Nova Ordem de Serviço"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={() => navigate('/ordens')} disabled={salvando}>
              Cancelar
            </Button>
            <Button onClick={handleCriar} disabled={salvando}>
              {salvando ? 'Criando...' : 'Criar OS'}
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Informações */}
        <Card className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Informações</h3>
          <div className="space-y-4">
            {/* Toggle sem cliente/veículo */}
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <div
                onClick={() => { setAvulso((v) => !v); setClienteId(''); setVeiculoId(''); }}
                className={`relative w-10 h-5 rounded-full transition-colors ${avulso ? 'bg-blue-600' : 'bg-gray-300'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${avulso ? 'translate-x-5' : ''}`} />
              </div>
              <span className="text-sm text-gray-700">Sem cliente/veículo cadastrado</span>
            </label>

            {!avulso && (
              <>
                <Select
                  label="Cliente *"
                  value={clienteId}
                  onChange={(e) => handleClienteChange(e.target.value)}
                  placeholder="Selecione um cliente"
                  options={clientes.map((c) => ({ value: c.id, label: c.nome }))}
                />
                <Select
                  label="Veículo *"
                  value={veiculoId}
                  onChange={(e) => setVeiculoId(e.target.value)}
                  placeholder={clienteId ? 'Selecione um veículo' : 'Selecione o cliente primeiro'}
                  disabled={!clienteId || veiculosDoCliente.length === 0}
                  options={veiculosDoCliente.map((v) => ({
                    value: v.id,
                    label: `${v.marca} ${v.modelo} — ${v.placa}`,
                  }))}
                />
                {clienteId && veiculosDoCliente.length === 0 && (
                  <p className="text-xs text-amber-600">Este cliente não tem veículos cadastrados.</p>
                )}
                <Input
                  label="KM de Entrada *"
                  type="number"
                  min="0"
                  value={kmEntrada}
                  onChange={(e) => setKmEntrada(e.target.value)}
                  placeholder="0"
                />
                <Input
                  label="Previsão de Entrega"
                  type="date"
                  value={previsaoEntrega}
                  onChange={(e) => setPrevisaoEntrega(e.target.value)}
                />
              </>
            )}

            <Textarea
              label="Descrição"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descreva o problema ou serviço solicitado"
            />
          </div>
        </Card>

        {/* Itens */}
        <Card className="p-6 lg:col-span-2">
          <OrdemItensTable
            itens={itensParaTabela}
            onAdicionarItem={handleAdicionarItem}
            onRemoverItem={handleRemoverItem}
            onEditarQuantidade={handleEditarQuantidade}
            descontoPercentual={Number(descontoPercentual)}
            onDescontoChange={(v) => setDescontoPercentual(String(v))}
            descontoMaximo={descontoMaximo}
          />
        </Card>
      </div>

      {/* Anexos */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Paperclip size={18} /> Anexos
            {arquivos.length > 0 && (
              <span className="text-sm font-normal text-gray-500">({arquivos.length})</span>
            )}
          </h3>
          <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
            Selecionar arquivos
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/mp4,video/webm,video/quicktime"
            className="hidden"
            onChange={handleArquivos}
          />
        </div>

        {arquivos.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">Nenhum arquivo selecionado.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {arquivos.map((file, idx) => {
              const url = URL.createObjectURL(file);
              const isImage = file.type.startsWith('image/');
              return (
                <div
                  key={idx}
                  className="relative group rounded-lg overflow-hidden border border-gray-200 bg-gray-50"
                >
                  {isImage ? (
                    <img
                      src={url}
                      alt={file.name}
                      className="w-full h-28 object-cover"
                      onLoad={() => URL.revokeObjectURL(url)}
                    />
                  ) : (
                    <video
                      src={url}
                      className="w-full h-28 object-cover"
                      muted
                      preload="metadata"
                    />
                  )}
                  <div className="px-2 py-1">
                    <p className="text-xs text-gray-600 truncate" title={file.name}>
                      {file.name}
                    </p>
                  </div>
                  <button
                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleRemoverArquivo(idx)}
                    title="Remover"
                  >
                    <X size={12} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
