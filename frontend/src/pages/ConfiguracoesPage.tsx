import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Settings } from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useConfiguracoes } from '../stores/useConfiguracoes';

export function ConfiguracoesPage() {
  const { config, loading, fetchConfiguracoes, atualizarConfiguracao } = useConfiguracoes();
  const [descontoMaximo, setDescontoMaximo] = useState('');
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    fetchConfiguracoes();
  }, []);

  useEffect(() => {
    if (config.desconto_maximo !== undefined) {
      setDescontoMaximo(config.desconto_maximo);
    }
  }, [config.desconto_maximo]);

  async function handleSalvar() {
    const valor = Number(descontoMaximo);
    if (isNaN(valor) || valor < 0 || valor > 100) {
      toast.error('O desconto máximo deve ser um valor entre 0 e 100.');
      return;
    }
    setSalvando(true);
    try {
      await atualizarConfiguracao('desconto_maximo', String(valor));
      toast.success('Configurações salvas com sucesso!');
    } catch {
      toast.error('Erro ao salvar configurações.');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Configurações"
        description="Parâmetros do sistema"
      />

      {loading ? (
        <p className="text-sm text-gray-500">Carregando...</p>
      ) : (
        <div className="max-w-lg space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Settings size={18} className="text-gray-500" />
              <h3 className="font-semibold text-gray-900">Descontos em Ordens de Serviço</h3>
            </div>
            <div className="space-y-4">
              <Input
                label="Desconto máximo permitido (%)"
                type="number"
                min="0"
                max="100"
                step="1"
                value={descontoMaximo}
                onChange={(e) => setDescontoMaximo(e.target.value)}
                placeholder="Ex: 20"
              />
              <p className="text-xs text-gray-500">
                Define o limite máximo de desconto que pode ser aplicado em uma ordem de serviço.
                Use 100 para não ter limite.
              </p>
              <div className="flex justify-end">
                <Button onClick={handleSalvar} disabled={salvando}>
                  {salvando ? 'Salvando...' : 'Salvar configurações'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
