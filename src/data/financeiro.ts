import type { Conta } from '../types';

export const contasSeed: Conta[] = [
  // Receitas de OS finalizadas
  { id: 'fin_001', tipo: 'receita', categoria: 'ordem_servico', descricao: 'OS #1001 - Troca pastilha', valor: 1470, dataVencimento: '2025-01-12T00:00:00Z', dataPagamento: '2025-01-12T00:00:00Z', status: 'pago', ordemServicoId: 'os_001', observacoes: '' },
  { id: 'fin_002', tipo: 'receita', categoria: 'ordem_servico', descricao: 'OS #1002 - Revisão HB20', valor: 2385, dataVencimento: '2025-01-16T00:00:00Z', dataPagamento: '2025-01-16T00:00:00Z', status: 'pago', ordemServicoId: 'os_002', observacoes: '' },
  { id: 'fin_003', tipo: 'receita', categoria: 'ordem_servico', descricao: 'OS #1003 - Embreagem S10', valor: 4580, dataVencimento: '2025-01-22T00:00:00Z', dataPagamento: '2025-01-22T00:00:00Z', status: 'pago', ordemServicoId: 'os_003', observacoes: '' },
  { id: 'fin_004', tipo: 'receita', categoria: 'ordem_servico', descricao: 'OS #1013 - Pneus Fiorino', valor: 2480, dataVencimento: '2024-12-07T00:00:00Z', dataPagamento: '2024-12-07T00:00:00Z', status: 'pago', ordemServicoId: 'os_013', observacoes: '' },
  { id: 'fin_005', tipo: 'receita', categoria: 'ordem_servico', descricao: 'OS #1014 - Revisão Civic', valor: 3200, dataVencimento: '2024-11-22T00:00:00Z', dataPagamento: '2024-11-22T00:00:00Z', status: 'pago', ordemServicoId: 'os_014', observacoes: '' },
  { id: 'fin_006', tipo: 'receita', categoria: 'ordem_servico', descricao: 'OS #1015 - Freio HB20', valor: 1780, dataVencimento: '2024-10-17T00:00:00Z', dataPagamento: '2024-10-17T00:00:00Z', status: 'pago', ordemServicoId: 'os_015', observacoes: '' },
  { id: 'fin_007', tipo: 'receita', categoria: 'ordem_servico', descricao: 'OS #1016 - Vela CG', valor: 850, dataVencimento: '2024-12-20T00:00:00Z', dataPagamento: '2024-12-20T00:00:00Z', status: 'pago', ordemServicoId: 'os_016', observacoes: '' },
  { id: 'fin_008', tipo: 'receita', categoria: 'ordem_servico', descricao: 'OS #1017 - Bateria Saveiro', valor: 2650, dataVencimento: '2024-09-12T00:00:00Z', dataPagamento: '2024-09-12T00:00:00Z', status: 'pago', ordemServicoId: 'os_017', observacoes: '' },
  { id: 'fin_009', tipo: 'receita', categoria: 'ordem_servico', descricao: 'OS #1018 - Palheta Renegade', valor: 1210, dataVencimento: '2024-11-10T00:00:00Z', dataPagamento: '2024-11-10T00:00:00Z', status: 'pago', ordemServicoId: 'os_018', observacoes: '' },
  { id: 'fin_010', tipo: 'receita', categoria: 'ordem_servico', descricao: 'OS #1019 - Suspensão Master', valor: 3850, dataVencimento: '2024-10-28T00:00:00Z', dataPagamento: '2024-10-28T00:00:00Z', status: 'pago', ordemServicoId: 'os_019', observacoes: '' },
  { id: 'fin_011', tipo: 'receita', categoria: 'ordem_servico', descricao: 'OS #1020 - Revisão Corolla', valor: 2780, dataVencimento: '2024-08-16T00:00:00Z', dataPagamento: '2024-08-16T00:00:00Z', status: 'pago', ordemServicoId: 'os_020', observacoes: '' },

  // Receitas adicionais de OS
  { id: 'fin_012', tipo: 'receita', categoria: 'ordem_servico', descricao: 'OS #1021 - Retífica motor Gol', valor: 6500, dataVencimento: '2025-01-28T00:00:00Z', dataPagamento: '2025-01-28T00:00:00Z', status: 'pago', observacoes: '' },
  { id: 'fin_013', tipo: 'receita', categoria: 'ordem_servico', descricao: 'OS #1022 - Câmbio Hilux', valor: 5800, dataVencimento: '2024-12-18T00:00:00Z', dataPagamento: '2024-12-18T00:00:00Z', status: 'pago', observacoes: '' },
  { id: 'fin_014', tipo: 'receita', categoria: 'ordem_servico', descricao: 'OS #1023 - Suspensão completa Civic', valor: 4900, dataVencimento: '2024-11-05T00:00:00Z', dataPagamento: '2024-11-05T00:00:00Z', status: 'pago', observacoes: '' },
  { id: 'fin_015', tipo: 'receita', categoria: 'ordem_servico', descricao: 'OS #1024 - Motor arranque Strada', valor: 3250, dataVencimento: '2024-10-10T00:00:00Z', dataPagamento: '2024-10-10T00:00:00Z', status: 'pago', observacoes: '' },
  { id: 'fin_016', tipo: 'receita', categoria: 'ordem_servico', descricao: 'OS #1025 - Injeção eletrônica Corsa', valor: 3600, dataVencimento: '2024-09-22T00:00:00Z', dataPagamento: '2024-09-22T00:00:00Z', status: 'pago', observacoes: '' },
  { id: 'fin_017', tipo: 'receita', categoria: 'ordem_servico', descricao: 'OS #1026 - Troca correia Palio', valor: 2450, dataVencimento: '2024-08-25T00:00:00Z', dataPagamento: '2024-08-25T00:00:00Z', status: 'pago', observacoes: '' },
  { id: 'fin_018', tipo: 'receita', categoria: 'ordem_servico', descricao: 'OS #1027 - Radiador Amarok', valor: 4350, dataVencimento: '2025-02-03T00:00:00Z', dataPagamento: '2025-02-03T00:00:00Z', status: 'pago', observacoes: '' },
  { id: 'fin_019', tipo: 'receita', categoria: 'ordem_servico', descricao: 'OS #1028 - Revisão completa Tracker', valor: 3700, dataVencimento: '2024-09-18T00:00:00Z', dataPagamento: '2024-09-18T00:00:00Z', status: 'pago', observacoes: '' },
  { id: 'fin_020', tipo: 'receita', categoria: 'ordem_servico', descricao: 'OS #1029 - Direção hidráulica Uno', valor: 3100, dataVencimento: '2024-10-05T00:00:00Z', dataPagamento: '2024-10-05T00:00:00Z', status: 'pago', observacoes: '' },
  { id: 'fin_021', tipo: 'receita', categoria: 'ordem_servico', descricao: 'OS #1030 - Ar condicionado Onix', valor: 2850, dataVencimento: '2024-11-28T00:00:00Z', dataPagamento: '2024-11-28T00:00:00Z', status: 'pago', observacoes: '' },
  { id: 'fin_022', tipo: 'receita', categoria: 'ordem_servico', descricao: 'OS #1031 - Turbina Ranger', valor: 7800, dataVencimento: '2024-12-28T00:00:00Z', dataPagamento: '2024-12-28T00:00:00Z', status: 'pago', observacoes: '' },
  { id: 'fin_023', tipo: 'receita', categoria: 'ordem_servico', descricao: 'OS #1032 - Junta cabeçote Astra', valor: 5500, dataVencimento: '2025-02-08T00:00:00Z', dataPagamento: '2025-02-08T00:00:00Z', status: 'pago', observacoes: '' },
  { id: 'fin_024', tipo: 'receita', categoria: 'ordem_servico', descricao: 'OS #1033 - Freio ABS Compass', valor: 4500, dataVencimento: '2024-08-10T00:00:00Z', dataPagamento: '2024-08-10T00:00:00Z', status: 'pago', observacoes: '' },
  { id: 'fin_025', tipo: 'receita', categoria: 'ordem_servico', descricao: 'OS #1034 - Motor completo Frontier', valor: 8900, dataVencimento: '2025-01-08T00:00:00Z', dataPagamento: '2025-01-08T00:00:00Z', status: 'pago', observacoes: '' },
  { id: 'fin_026', tipo: 'receita', categoria: 'ordem_servico', descricao: 'OS #1035 - Cambio automático Cruze', valor: 6200, dataVencimento: '2024-12-03T00:00:00Z', dataPagamento: '2024-12-03T00:00:00Z', status: 'pago', observacoes: '' },
  { id: 'fin_027', tipo: 'receita', categoria: 'ordem_servico', descricao: 'OS #1036 - Funilaria e pintura Polo', valor: 5400, dataVencimento: '2024-11-15T00:00:00Z', dataPagamento: '2024-11-15T00:00:00Z', status: 'pago', observacoes: '' },
  { id: 'fin_028', tipo: 'receita', categoria: 'ordem_servico', descricao: 'OS #1037 - Revisão completa Toro', valor: 3950, dataVencimento: '2024-10-22T00:00:00Z', dataPagamento: '2024-10-22T00:00:00Z', status: 'pago', observacoes: '' },
  { id: 'fin_029', tipo: 'receita', categoria: 'ordem_servico', descricao: 'OS #1038 - Alternador Sprinter', valor: 4100, dataVencimento: '2024-09-05T00:00:00Z', dataPagamento: '2024-09-05T00:00:00Z', status: 'pago', observacoes: '' },
  { id: 'fin_030', tipo: 'receita', categoria: 'ordem_servico', descricao: 'OS #1039 - Cabeçote HR', valor: 7200, dataVencimento: '2024-08-20T00:00:00Z', dataPagamento: '2024-08-20T00:00:00Z', status: 'pago', observacoes: '' },

  // Despesas fixas (mensais - últimos 6 meses)
  ...[8, 9, 10, 11, 0, 1].flatMap((m) => {
    const ano = m < 6 ? 2025 : 2024;
    const mes = m < 6 ? m : m;
    const mesStr = String(mes + 1).padStart(2, '0');
    return [
      { id: `fin_aluguel_${mesStr}_${ano}`, tipo: 'despesa' as const, categoria: 'aluguel' as const, descricao: `Aluguel ${mesStr}/${ano}`, valor: 2200, dataVencimento: `${ano}-${mesStr}-10T00:00:00Z`, dataPagamento: `${ano}-${mesStr}-10T00:00:00Z`, status: 'pago' as const, observacoes: '' },
      { id: `fin_energia_${mesStr}_${ano}`, tipo: 'despesa' as const, categoria: 'energia' as const, descricao: `Energia ${mesStr}/${ano}`, valor: 480 + Math.floor(Math.random() * 120), dataVencimento: `${ano}-${mesStr}-15T00:00:00Z`, dataPagamento: `${ano}-${mesStr}-15T00:00:00Z`, status: 'pago' as const, observacoes: '' },
      { id: `fin_agua_${mesStr}_${ano}`, tipo: 'despesa' as const, categoria: 'agua' as const, descricao: `Água ${mesStr}/${ano}`, valor: 150 + Math.floor(Math.random() * 50), dataVencimento: `${ano}-${mesStr}-20T00:00:00Z`, dataPagamento: `${ano}-${mesStr}-20T00:00:00Z`, status: 'pago' as const, observacoes: '' },
      { id: `fin_internet_${mesStr}_${ano}`, tipo: 'despesa' as const, categoria: 'internet' as const, descricao: `Internet ${mesStr}/${ano}`, valor: 150, dataVencimento: `${ano}-${mesStr}-05T00:00:00Z`, dataPagamento: `${ano}-${mesStr}-05T00:00:00Z`, status: 'pago' as const, observacoes: '' },
      { id: `fin_salario_${mesStr}_${ano}`, tipo: 'despesa' as const, categoria: 'salario' as const, descricao: `Salários ${mesStr}/${ano}`, valor: 5800, dataVencimento: `${ano}-${mesStr}-05T00:00:00Z`, dataPagamento: `${ano}-${mesStr}-05T00:00:00Z`, status: 'pago' as const, observacoes: '2 mecânicos + auxiliar' },
    ];
  }),

  // Compras de peças (despesas)
  { id: 'fin_compra_001', tipo: 'despesa', categoria: 'compra_peca', descricao: 'Compra lote pastilhas Fras-le', valor: 580, dataVencimento: '2025-01-05T00:00:00Z', dataPagamento: '2025-01-05T00:00:00Z', status: 'pago', observacoes: '' },
  { id: 'fin_compra_002', tipo: 'despesa', categoria: 'compra_peca', descricao: 'Compra óleos Mobil', valor: 1250, dataVencimento: '2024-12-15T00:00:00Z', dataPagamento: '2024-12-15T00:00:00Z', status: 'pago', observacoes: '' },
  { id: 'fin_compra_003', tipo: 'despesa', categoria: 'compra_peca', descricao: 'Compra filtros Mann', valor: 720, dataVencimento: '2025-01-20T00:00:00Z', dataPagamento: '2025-01-20T00:00:00Z', status: 'pago', observacoes: '' },

  // Contas pendentes
  { id: 'fin_pend_001', tipo: 'despesa', categoria: 'compra_peca', descricao: 'Compra amortecedores Monroe', valor: 1260, dataVencimento: '2025-02-20T00:00:00Z', status: 'pendente', observacoes: '' },
  { id: 'fin_pend_002', tipo: 'despesa', categoria: 'manutencao', descricao: 'Manutenção elevador', valor: 450, dataVencimento: '2025-02-25T00:00:00Z', status: 'pendente', observacoes: '' },
  { id: 'fin_pend_003', tipo: 'receita', categoria: 'ordem_servico', descricao: 'OS #1008 - CG (a receber)', valor: 1863, dataVencimento: '2025-02-15T00:00:00Z', status: 'pendente', observacoes: 'Aguardando retirada do veículo' },
];
