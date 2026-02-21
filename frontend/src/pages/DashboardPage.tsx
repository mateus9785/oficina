import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Car, FileText, Package, AlertTriangle, DollarSign, TrendingUp, Wrench } from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { useRelatorios } from '../hooks/useRelatorios';
import { useOrdemServicoStore } from '../stores/useOrdemServicoStore';
import { useEstoqueStore } from '../stores/useEstoqueStore';
import { useClienteStore } from '../stores/useClienteStore';
import { useVeiculoStore } from '../stores/useVeiculoStore';
import { useFinanceiroStore } from '../stores/useFinanceiroStore';
import { STATUS_OS_LABELS, STATUS_OS_COLORS } from '../types';
import { formatCurrency, formatDate } from '../lib/formatters';
import { calcularTotalOS } from '../lib/calculators';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

export function DashboardPage() {
  const navigate = useNavigate();
  const rel = useRelatorios();
  const { ordens, fetchOrdens } = useOrdemServicoStore();
  const { pecasAbaixoMinimo, fetchPecas } = useEstoqueStore();
  const { buscarCliente, fetchClientes } = useClienteStore();
  const { buscarVeiculo, fetchVeiculos } = useVeiculoStore();
  const { fetchContas } = useFinanceiroStore();

  useEffect(() => {
    fetchOrdens();
    fetchPecas();
    fetchClientes();
    fetchVeiculos();
    fetchContas();
  }, []);

  const alertas = pecasAbaixoMinimo();
  const ordensRecentes = [...ordens]
    .filter((o) => o.status !== 'finalizado')
    .sort((a, b) => new Date(b.dataAbertura).getTime() - new Date(a.dataAbertura).getTime())
    .slice(0, 5);

  const miniChartData = Object.entries(rel.fluxoMensal)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([key, val]) => {
      const [ano, mes] = key.split('-');
      const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      return { nome: `${monthNames[Number(mes) - 1]}/${ano.slice(2)}`, Receitas: val.receitas, Despesas: val.despesas };
    });

  const kpis = [
    { label: 'Clientes', value: rel.totalClientes, icon: Users, color: 'bg-blue-100 text-blue-600' },
    { label: 'Veículos', value: rel.totalVeiculos, icon: Car, color: 'bg-green-100 text-green-600' },
    { label: 'Ordens Ativas', value: rel.totalOrdens - rel.ordensFinalizadas, icon: FileText, color: 'bg-orange-100 text-orange-600' },
    { label: 'Faturamento', value: formatCurrency(rel.totalFaturado), icon: DollarSign, color: 'bg-emerald-100 text-emerald-600' },
    { label: 'Ticket Médio', value: formatCurrency(rel.ticketMedio), icon: TrendingUp, color: 'bg-purple-100 text-purple-600' },
    { label: 'Peças', value: rel.totalPecas, icon: Package, color: 'bg-indigo-100 text-indigo-600' },
    { label: 'Estoque Baixo', value: rel.pecasAbaixoMinimo, icon: AlertTriangle, color: rel.pecasAbaixoMinimo > 0 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600' },
    { label: 'OS Finalizadas', value: rel.ordensFinalizadas, icon: Wrench, color: 'bg-teal-100 text-teal-600' },
  ];

  return (
    <div>
      <PageHeader title="Dashboard" description="Visão geral da oficina" />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${kpi.color} flex items-center justify-center`}>
                <kpi.icon size={20} />
              </div>
              <div>
                <p className="text-xs text-gray-500">{kpi.label}</p>
                <p className="text-lg font-bold text-gray-900">{kpi.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Alertas de estoque */}
        {alertas.length > 0 && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <AlertTriangle size={18} className="text-red-500" /> Alertas de Estoque
              </h3>
              <button onClick={() => navigate('/estoque')} className="text-sm text-blue-600 hover:underline">Ver tudo</button>
            </div>
            <div className="space-y-2">
              {alertas.slice(0, 5).map((p) => (
                <div key={p.id} className="flex items-center justify-between text-sm p-2 bg-red-50 rounded">
                  <span>{p.nome}</span>
                  <span className="text-red-600 font-medium">{p.quantidade}/{p.estoqueMinimo}</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Mini chart */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Receitas x Despesas</h3>
            <button onClick={() => navigate('/financeiro')} className="text-sm text-blue-600 hover:underline">Ver detalhes</button>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={miniChartData}>
              <XAxis dataKey="nome" fontSize={11} />
              <YAxis fontSize={11} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(value) => `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
              <Bar dataKey="Receitas" fill="#22c55e" radius={[3, 3, 0, 0]} />
              <Bar dataKey="Despesas" fill="#ef4444" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Ordens recentes */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Ordens em Andamento</h3>
          <button onClick={() => navigate('/ordens')} className="text-sm text-blue-600 hover:underline">Ver kanban</button>
        </div>
        {ordensRecentes.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Nenhuma ordem em andamento</p>
        ) : (
          <div className="space-y-3">
            {ordensRecentes.map((os) => {
              const cliente = buscarCliente(os.clienteId);
              const veiculo = buscarVeiculo(os.veiculoId);
              return (
                <div
                  key={os.id}
                  className="flex items-center gap-4 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => navigate(`/ordens/${os.id}`)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-blue-600 text-sm">#{os.numero}</span>
                      <Badge className={STATUS_OS_COLORS[os.status]}>{STATUS_OS_LABELS[os.status]}</Badge>
                    </div>
                    <p className="text-sm text-gray-900 truncate">{os.descricao}</p>
                    <p className="text-xs text-gray-500">{cliente?.nome} - {veiculo?.marca} {veiculo?.modelo}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-semibold text-green-600">{formatCurrency(calcularTotalOS(os))}</span>
                    <span className="block text-xs text-gray-500">{formatDate(os.dataAbertura)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
