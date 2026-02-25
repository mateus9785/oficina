import { useState, useEffect } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { useRelatorios } from '../hooks/useRelatorios';
import { formatCurrency } from '../lib/formatters';
import { CATEGORIA_PECA_LABELS, STATUS_OS_LABELS, type StatusOS } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import clsx from 'clsx';
import { useOrdemServicoStore } from '../stores/useOrdemServicoStore';
import { useEstoqueStore } from '../stores/useEstoqueStore';
import { useClienteStore } from '../stores/useClienteStore';
import { useVeiculoStore } from '../stores/useVeiculoStore';
import { useFinanceiroStore } from '../stores/useFinanceiroStore';
import { api } from '../lib/api';

const tabs = [
  { id: 'geral', label: 'Geral' },
  { id: 'diario', label: 'Diário' },
  { id: 'clientes', label: 'Clientes' },
  { id: 'veiculos', label: 'Veículos' },
  { id: 'pecas', label: 'Peças' },
  { id: 'financeiro', label: 'Financeiro' },
];

const PIE_COLORS = ['#eab308', '#f97316', '#3b82f6', '#22c55e', '#6b7280'];

const CATEGORIA_CONTA_LABELS: Record<string, string> = {
  ordem_servico: 'Ordem de Serviço',
  venda_peca: 'Venda de Peça',
  compra_peca: 'Compra de Peça',
  aluguel: 'Aluguel',
  salario: 'Salário',
  energia: 'Energia',
  agua: 'Água',
  internet: 'Internet',
  manutencao: 'Manutenção',
  outros: 'Outros',
};

interface DiarioEntrada {
  id: number;
  pecaId: string;
  nome: string;
  categoria: string;
  marca: string;
  fornecedor: string;
  quantidade: number;
  valorTotal: number;
  preco: number;
  precoVenda: number;
  data: string;
}

interface DiarioSaida {
  id: string;
  ordemId: string;
  pecaId: string;
  pecaNome: string;
  categoria: string;
  marca: string;
  descricao: string;
  quantidade: number;
  valorUnitario: number;
  osNumero: number;
  criadoEm: string;
}

interface DiarioOS {
  id: string;
  numero: number;
  status: string;
  dataAbertura: string;
  dataFinalizacao: string | null;
  nomeCliente: string;
  descricaoVeiculo: string;
  valorTotal: number;
  descontoPercentual: number;
}

interface DiarioConta {
  id: string;
  tipo: 'receita' | 'despesa';
  categoria: string;
  descricao: string;
  valor: number;
  dataVencimento: string;
  dataPagamento: string | null;
  status: string;
}

interface DiarioData {
  data: string;
  estoque: {
    entradas: DiarioEntrada[];
    saidas: DiarioSaida[];
    totalEntradas: number;
    totalSaidas: number;
  };
  ordens: {
    lista: DiarioOS[];
    total: number;
    finalizadas: number;
    valorTotalFinalizadas: number;
  };
  financeiro: {
    receitas: DiarioConta[];
    despesas: DiarioConta[];
    totalReceitas: number;
    totalDespesas: number;
    saldo: number;
  };
}

export function RelatoriosPage() {
  const [activeTab, setActiveTab] = useState('geral');
  const rel = useRelatorios();
  const { fetchOrdens } = useOrdemServicoStore();
  const { fetchPecas } = useEstoqueStore();
  const { fetchClientes } = useClienteStore();
  const { fetchVeiculos } = useVeiculoStore();
  const { fetchContas } = useFinanceiroStore();

  const [dataDiario, setDataDiario] = useState(() => new Date().toISOString().slice(0, 10));
  const [diario, setDiario] = useState<DiarioData | null>(null);
  const [loadingDiario, setLoadingDiario] = useState(false);

  useEffect(() => {
    fetchOrdens();
    fetchPecas();
    fetchClientes();
    fetchVeiculos();
    fetchContas();
  }, []);

  useEffect(() => {
    if (activeTab === 'diario') {
      fetchDiario(dataDiario);
    }
  }, [activeTab, dataDiario]);

  async function fetchDiario(data: string) {
    setLoadingDiario(true);
    try {
      const result = await api.get<DiarioData>(`/relatorios/diario?data=${data}`);
      setDiario(result);
    } finally {
      setLoadingDiario(false);
    }
  }

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

      {activeTab === 'diario' && (
        <div className="space-y-6">
          {/* Seletor de data */}
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700">Data:</label>
            <input
              type="date"
              value={dataDiario}
              onChange={(e) => setDataDiario(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {loadingDiario && <span className="text-sm text-gray-400">Carregando...</span>}
          </div>

          {diario && !loadingDiario && (
            <>
              {/* KPIs principais */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-4">
                  <p className="text-xs text-gray-500">OS no Dia</p>
                  <p className="text-xl font-bold text-gray-900">{diario.ordens.total}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{diario.ordens.finalizadas} finalizadas</p>
                </Card>
                <Card className="p-4">
                  <p className="text-xs text-gray-500">Faturamento do Dia</p>
                  <p className="text-xl font-bold text-blue-600">{formatCurrency(diario.ordens.valorTotalFinalizadas)}</p>
                  <p className="text-xs text-gray-400 mt-0.5">OS finalizadas</p>
                </Card>
                <Card className="p-4">
                  <p className="text-xs text-gray-500">Entradas Financeiras</p>
                  <p className="text-xl font-bold text-green-600">{formatCurrency(diario.financeiro.totalReceitas)}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{diario.financeiro.receitas.length} lançamentos</p>
                </Card>
                <Card className="p-4">
                  <p className="text-xs text-gray-500">Saídas Financeiras</p>
                  <p className="text-xl font-bold text-red-600">{formatCurrency(diario.financeiro.totalDespesas)}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{diario.financeiro.despesas.length} lançamentos</p>
                </Card>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-4">
                  <p className="text-xs text-gray-500">Peças Recebidas</p>
                  <p className="text-xl font-bold text-gray-900">{diario.estoque.totalEntradas} un</p>
                  <p className="text-xs text-gray-400 mt-0.5">{diario.estoque.entradas.length} itens</p>
                </Card>
                <Card className="p-4">
                  <p className="text-xs text-gray-500">Peças Utilizadas</p>
                  <p className="text-xl font-bold text-gray-900">{diario.estoque.totalSaidas} un</p>
                  <p className="text-xs text-gray-400 mt-0.5">{diario.estoque.saidas.length} movimentos</p>
                </Card>
                <Card className="p-4 lg:col-span-2">
                  <p className="text-xs text-gray-500">Saldo do Dia</p>
                  <p className={clsx('text-2xl font-bold mt-0.5', diario.financeiro.saldo >= 0 ? 'text-green-600' : 'text-red-600')}>
                    {formatCurrency(diario.financeiro.saldo)}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">Receitas − Despesas</p>
                </Card>
              </div>

              {/* Estoque */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" />
                    Entradas de Estoque
                    <span className="text-gray-400 font-normal text-sm">({diario.estoque.entradas.length})</span>
                  </h3>
                  {diario.estoque.entradas.length === 0 ? (
                    <p className="text-sm text-gray-400">Nenhuma entrada registrada neste dia</p>
                  ) : (
                    <div className="divide-y">
                      {diario.estoque.entradas.map((e) => (
                        <div key={e.id} className="flex items-start justify-between py-2.5">
                          <div className="min-w-0 flex-1 pr-3">
                            <p className="font-medium text-sm text-gray-900 truncate">{e.nome}</p>
                            <p className="text-xs text-gray-500">
                              {e.marca && `${e.marca} · `}
                              {e.fornecedor || 'Sem fornecedor'}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-sm font-semibold text-green-600">+{e.quantidade} un</p>
                            <p className="text-xs text-gray-500">{formatCurrency(e.valorTotal)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>

                <Card className="p-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
                    Saídas de Estoque
                    <span className="text-gray-400 font-normal text-sm">({diario.estoque.saidas.length})</span>
                  </h3>
                  {diario.estoque.saidas.length === 0 ? (
                    <p className="text-sm text-gray-400">Nenhuma saída registrada neste dia</p>
                  ) : (
                    <div className="divide-y">
                      {diario.estoque.saidas.map((s) => (
                        <div key={s.id} className="flex items-start justify-between py-2.5">
                          <div className="min-w-0 flex-1 pr-3">
                            <p className="font-medium text-sm text-gray-900 truncate">{s.pecaNome || s.descricao}</p>
                            <p className="text-xs text-gray-500">OS #{s.osNumero}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-sm font-semibold text-red-600">−{s.quantidade} un</p>
                            <p className="text-xs text-gray-500">{formatCurrency(s.quantidade * s.valorUnitario)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </div>

              {/* Ordens de Serviço */}
              <Card className="p-6">
                <h3 className="font-semibold mb-4">
                  Ordens de Serviço
                  <span className="text-gray-400 font-normal text-sm ml-2">({diario.ordens.total})</span>
                </h3>
                {diario.ordens.lista.length === 0 ? (
                  <p className="text-sm text-gray-400">Nenhuma OS registrada neste dia</p>
                ) : (
                  <div className="divide-y">
                    {diario.ordens.lista.map((os) => (
                      <div key={os.id} className="flex items-center gap-4 py-3">
                        <span className="text-sm font-bold text-gray-400 w-12 shrink-0">#{os.numero}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-gray-900 truncate">{os.nomeCliente || 'Sem cliente'}</p>
                          <p className="text-xs text-gray-500 truncate">{os.descricaoVeiculo || 'Sem veículo'}</p>
                        </div>
                        <Badge>{STATUS_OS_LABELS[os.status as StatusOS] || os.status}</Badge>
                        <span className="font-semibold text-sm text-gray-900 shrink-0">{formatCurrency(os.valorTotal)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Financeiro */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6">
                  <h3 className="font-semibold mb-4 text-green-700 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" />
                    Receitas
                    <span className="text-gray-400 font-normal text-sm">({diario.financeiro.receitas.length})</span>
                  </h3>
                  {diario.financeiro.receitas.length === 0 ? (
                    <p className="text-sm text-gray-400">Nenhuma receita neste dia</p>
                  ) : (
                    <div className="divide-y">
                      {diario.financeiro.receitas.map((c) => (
                        <div key={c.id} className="flex items-start justify-between py-2.5">
                          <div className="min-w-0 flex-1 pr-3">
                            <p className="font-medium text-sm text-gray-900 truncate">
                              {c.descricao || CATEGORIA_CONTA_LABELS[c.categoria] || c.categoria}
                            </p>
                            <p className="text-xs text-gray-500">
                              {CATEGORIA_CONTA_LABELS[c.categoria]}
                              {c.status === 'pago' ? ' · Pago' : ' · Pendente'}
                            </p>
                          </div>
                          <span className="text-sm font-semibold text-green-600 shrink-0">{formatCurrency(c.valor)}</span>
                        </div>
                      ))}
                      <div className="flex justify-between pt-3">
                        <span className="text-sm font-semibold text-gray-700">Total Receitas</span>
                        <span className="text-sm font-bold text-green-600">{formatCurrency(diario.financeiro.totalReceitas)}</span>
                      </div>
                    </div>
                  )}
                </Card>

                <Card className="p-6">
                  <h3 className="font-semibold mb-4 text-red-700 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
                    Despesas
                    <span className="text-gray-400 font-normal text-sm">({diario.financeiro.despesas.length})</span>
                  </h3>
                  {diario.financeiro.despesas.length === 0 ? (
                    <p className="text-sm text-gray-400">Nenhuma despesa neste dia</p>
                  ) : (
                    <div className="divide-y">
                      {diario.financeiro.despesas.map((c) => (
                        <div key={c.id} className="flex items-start justify-between py-2.5">
                          <div className="min-w-0 flex-1 pr-3">
                            <p className="font-medium text-sm text-gray-900 truncate">
                              {c.descricao || CATEGORIA_CONTA_LABELS[c.categoria] || c.categoria}
                            </p>
                            <p className="text-xs text-gray-500">
                              {CATEGORIA_CONTA_LABELS[c.categoria]}
                              {c.status === 'pago' ? ' · Pago' : ' · Pendente'}
                            </p>
                          </div>
                          <span className="text-sm font-semibold text-red-600 shrink-0">{formatCurrency(c.valor)}</span>
                        </div>
                      ))}
                      <div className="flex justify-between pt-3">
                        <span className="text-sm font-semibold text-gray-700">Total Despesas</span>
                        <span className="text-sm font-bold text-red-600">{formatCurrency(diario.financeiro.totalDespesas)}</span>
                      </div>
                    </div>
                  )}
                </Card>
              </div>
            </>
          )}
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
