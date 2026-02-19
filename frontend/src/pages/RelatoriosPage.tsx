import { useState, useEffect } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { useRelatorios } from '../hooks/useRelatorios';
import { formatCurrency } from '../lib/formatters';
import { CATEGORIA_PECA_LABELS } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import clsx from 'clsx';
import { useOrdemServicoStore } from '../stores/useOrdemServicoStore';
import { useEstoqueStore } from '../stores/useEstoqueStore';
import { useClienteStore } from '../stores/useClienteStore';
import { useVeiculoStore } from '../stores/useVeiculoStore';
import { useFinanceiroStore } from '../stores/useFinanceiroStore';

const tabs = [
  { id: 'geral', label: 'Geral' },
  { id: 'clientes', label: 'Clientes' },
  { id: 'veiculos', label: 'Veículos' },
  { id: 'pecas', label: 'Peças' },
  { id: 'financeiro', label: 'Financeiro' },
];

const PIE_COLORS = ['#eab308', '#f97316', '#3b82f6', '#22c55e', '#6b7280'];

export function RelatoriosPage() {
  const [activeTab, setActiveTab] = useState('geral');
  const rel = useRelatorios();
  const { fetchOrdens } = useOrdemServicoStore();
  const { fetchPecas } = useEstoqueStore();
  const { fetchClientes } = useClienteStore();
  const { fetchVeiculos } = useVeiculoStore();
  const { fetchContas } = useFinanceiroStore();

  useEffect(() => {
    fetchOrdens();
    fetchPecas();
    fetchClientes();
    fetchVeiculos();
    fetchContas();
  }, []);

  const osPieData = Object.entries(rel.osPorStatus).map(([status, count]) => {
    const labels: Record<string, string> = {
      aguardando_aprovacao: 'Ag. Aprovação',
      aguardando_peca: 'Ag. Peça',
      em_execucao: 'Em Execução',
      pronto_retirada: 'Pronto Retirada',
      finalizado: 'Finalizado',
    };
    return { name: labels[status] || status, value: count };
  });

  const fluxoData = Object.entries(rel.fluxoMensal)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([key, val]) => {
      const [ano, mes] = key.split('-');
      const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      return { nome: `${monthNames[Number(mes) - 1]}/${ano.slice(2)}`, Receitas: val.receitas, Despesas: val.despesas, Lucro: val.receitas - val.despesas };
    });

  return (
    <div>
      <PageHeader title="Relatórios" description="Análises e indicadores da oficina" />

      <div className="flex gap-2 mb-6 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={clsx(
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap',
              activeTab === tab.id ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'geral' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Clientes', value: rel.totalClientes },
              { label: 'Total Veículos', value: rel.totalVeiculos },
              { label: 'OS Finalizadas', value: rel.ordensFinalizadas },
              { label: 'Faturamento Total', value: formatCurrency(rel.totalFaturado) },
              { label: 'Ticket Médio', value: formatCurrency(rel.ticketMedio) },
              { label: 'Peças Cadastradas', value: rel.totalPecas },
              { label: 'Estoque Baixo', value: rel.pecasAbaixoMinimo },
              { label: 'Total OS', value: rel.totalOrdens },
            ].map((kpi) => (
              <Card key={kpi.label} className="p-4">
                <p className="text-xs text-gray-500">{kpi.label}</p>
                <p className="text-xl font-bold text-gray-900">{kpi.value}</p>
              </Card>
            ))}
          </div>
          <Card className="p-6">
            <h3 className="font-semibold mb-4">OS por Status</h3>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={osPieData} cx="50%" cy="45%" innerRadius={50} outerRadius={90} paddingAngle={2} dataKey="value">
                  {osPieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(value, name) => [value, name]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>
      )}

      {activeTab === 'clientes' && (
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Top Clientes por Faturamento</h3>
          <div className="space-y-3">
            {rel.topClientes.map((item, i) => (
              <div key={item.cliente!.id} className="flex items-center gap-4">
                <span className="text-sm font-bold text-gray-400 w-6">{i + 1}</span>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{item.cliente!.nome}</p>
                </div>
                <span className="font-semibold text-green-600">{formatCurrency(item.total)}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {activeTab === 'veiculos' && (
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Veículos com Mais Serviços</h3>
          <div className="space-y-3">
            {rel.topVeiculos.map((item, i) => (
              <div key={item.veiculo!.id} className="flex items-center gap-4">
                <span className="text-sm font-bold text-gray-400 w-6">{i + 1}</span>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{item.veiculo!.marca} {item.veiculo!.modelo}</p>
                  <p className="text-xs text-gray-500">{item.veiculo!.placa}</p>
                </div>
                <Badge>{item.count} OS</Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {activeTab === 'pecas' && (
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Peças Mais Utilizadas</h3>
          <div className="space-y-3">
            {rel.topPecas.map((peca, i) => (
              <div key={peca.id} className="flex items-center gap-4">
                <span className="text-sm font-bold text-gray-400 w-6">{i + 1}</span>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{peca.nome}</p>
                  <p className="text-xs text-gray-500">{CATEGORIA_PECA_LABELS[peca.categoria]} - {peca.marca}</p>
                </div>
                <div className="text-right">
                  <span className="font-semibold">{peca.usoTotal} un</span>
                  <span className="block text-xs text-gray-500">Estoque: {peca.quantidade}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {activeTab === 'financeiro' && (
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Fluxo de Caixa - Últimos 6 Meses</h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={fluxoData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="nome" fontSize={12} />
              <YAxis fontSize={12} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(value) => `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
              <Bar dataKey="Receitas" fill="#22c55e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Despesas" fill="#ef4444" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Lucro" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}
    </div>
  );
}
