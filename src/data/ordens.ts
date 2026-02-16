import type { OrdemServico } from '../types';

export const ordensSeed: OrdemServico[] = [
  {
    id: 'os_001', numero: 1001, clienteId: 'cli_001', veiculoId: 'vei_001',
    status: 'finalizado', dataAbertura: '2025-01-10T08:00:00Z', dataFinalizacao: '2025-01-12T17:00:00Z',
    descricaoProblema: 'Veículo com barulho ao frear', diagnostico: 'Pastilhas de freio gastas',
    itens: [
      { id: 'item_001', tipo: 'peca', pecaId: 'pec_006', descricao: 'Pastilha de Freio Dianteira', quantidade: 1, valorUnitario: 120 },
      { id: 'item_002', tipo: 'servico', descricao: 'Mão de obra troca de pastilha', quantidade: 1, valorUnitario: 150 },
    ],
    checklistEntrada: [{ zona: 'Pneus', temDano: false, descricao: '' }, { zona: 'Lataria', temDano: true, descricao: 'Risco na porta traseira direita' }],
    observacoes: '', kmEntrada: 66500,
  },
  {
    id: 'os_002', numero: 1002, clienteId: 'cli_002', veiculoId: 'vei_003',
    status: 'finalizado', dataAbertura: '2025-01-15T09:00:00Z', dataFinalizacao: '2025-01-16T16:00:00Z',
    descricaoProblema: 'Revisão programada 40.000km', diagnostico: 'Troca de óleo e filtros',
    itens: [
      { id: 'item_003', tipo: 'peca', pecaId: 'pec_022', descricao: 'Óleo Motor 5W30 Sintético (1L)', quantidade: 4, valorUnitario: 60 },
      { id: 'item_004', tipo: 'peca', pecaId: 'pec_018', descricao: 'Filtro de Óleo', quantidade: 1, valorUnitario: 35 },
      { id: 'item_005', tipo: 'peca', pecaId: 'pec_019', descricao: 'Filtro de Ar', quantidade: 1, valorUnitario: 60 },
      { id: 'item_006', tipo: 'servico', descricao: 'Revisão completa', quantidade: 1, valorUnitario: 250 },
    ],
    checklistEntrada: [], observacoes: 'Cliente pediu verificação do ar condicionado', kmEntrada: 44500,
  },
  {
    id: 'os_003', numero: 1003, clienteId: 'cli_003', veiculoId: 'vei_004',
    status: 'finalizado', dataAbertura: '2025-01-20T10:00:00Z', dataFinalizacao: '2025-01-22T15:00:00Z',
    descricaoProblema: 'Embreagem patinando', diagnostico: 'Kit embreagem gasto - troca necessária',
    itens: [
      { id: 'item_007', tipo: 'peca', pecaId: 'pec_025', descricao: 'Kit Embreagem', quantidade: 1, valorUnitario: 780 },
      { id: 'item_008', tipo: 'servico', descricao: 'Troca de embreagem', quantidade: 1, valorUnitario: 600 },
    ],
    checklistEntrada: [], observacoes: '', kmEntrada: 27000,
  },
  {
    id: 'os_004', numero: 1004, clienteId: 'cli_004', veiculoId: 'vei_006',
    status: 'em_execucao', dataAbertura: '2025-02-01T08:00:00Z',
    descricaoProblema: 'Barulho na suspensão dianteira', diagnostico: 'Amortecedores dianteiros vencidos',
    itens: [
      { id: 'item_009', tipo: 'peca', pecaId: 'pec_010', descricao: 'Amortecedor Dianteiro', quantidade: 2, valorUnitario: 320 },
      { id: 'item_010', tipo: 'peca', pecaId: 'pec_012', descricao: 'Kit Batente Amortecedor', quantidade: 2, valorUnitario: 85 },
      { id: 'item_011', tipo: 'servico', descricao: 'Troca amortecedor + alinhamento', quantidade: 1, valorUnitario: 350 },
    ],
    checklistEntrada: [{ zona: 'Pneus', temDano: false, descricao: '' }, { zona: 'Faróis', temDano: false, descricao: '' }],
    observacoes: 'Verificar também a necessidade de balanceamento', kmEntrada: 34500,
  },
  {
    id: 'os_005', numero: 1005, clienteId: 'cli_005', veiculoId: 'vei_008',
    status: 'aguardando_aprovacao', dataAbertura: '2025-02-05T09:00:00Z',
    descricaoProblema: 'Ar condicionado não gela', diagnostico: 'Possível vazamento no sistema de ar condicionado',
    itens: [
      { id: 'item_012', tipo: 'servico', descricao: 'Diagnóstico do A/C', quantidade: 1, valorUnitario: 120 },
      { id: 'item_013', tipo: 'servico', descricao: 'Recarga de gás + reparo', quantidade: 1, valorUnitario: 350 },
    ],
    checklistEntrada: [], observacoes: 'Veículo em garantia - verificar cobertura', kmEntrada: 7800,
  },
  {
    id: 'os_006', numero: 1006, clienteId: 'cli_006', veiculoId: 'vei_009',
    status: 'em_execucao', dataAbertura: '2025-02-03T11:00:00Z',
    descricaoProblema: 'Troca de correia dentada preventiva', diagnostico: 'Correia com 60.000km - dentro da faixa de troca',
    itens: [
      { id: 'item_014', tipo: 'peca', pecaId: 'pec_002', descricao: 'Correia Dentada Gates', quantidade: 1, valorUnitario: 150 },
      { id: 'item_015', tipo: 'peca', pecaId: 'pec_005', descricao: 'Tensor da Correia', quantidade: 1, valorUnitario: 195 },
      { id: 'item_016', tipo: 'peca', pecaId: 'pec_004', descricao: 'Bomba D\'Água', quantidade: 1, valorUnitario: 170 },
      { id: 'item_017', tipo: 'servico', descricao: 'Troca de correia + tensor + bomba', quantidade: 1, valorUnitario: 450 },
    ],
    checklistEntrada: [], observacoes: '', kmEntrada: 61000,
  },
  {
    id: 'os_007', numero: 1007, clienteId: 'cli_007', veiculoId: 'vei_010',
    status: 'aguardando_peca', dataAbertura: '2025-02-04T14:00:00Z',
    descricaoProblema: 'Alternador não está carregando bateria', diagnostico: 'Alternador com defeito - necessário troca',
    itens: [
      { id: 'item_018', tipo: 'peca', pecaId: 'pec_015', descricao: 'Alternador Recondicionado', quantidade: 1, valorUnitario: 750 },
      { id: 'item_019', tipo: 'peca', pecaId: 'pec_014', descricao: 'Bateria 60Ah', quantidade: 1, valorUnitario: 550 },
      { id: 'item_020', tipo: 'servico', descricao: 'Troca alternador + bateria', quantidade: 1, valorUnitario: 300 },
    ],
    checklistEntrada: [], observacoes: 'Aguardando alternador compatível com Renault Master', kmEntrada: 119500,
  },
  {
    id: 'os_008', numero: 1008, clienteId: 'cli_009', veiculoId: 'vei_012',
    status: 'pronto_retirada', dataAbertura: '2025-02-06T08:00:00Z',
    descricaoProblema: 'Revisão + troca de pneu', diagnostico: 'Troca de óleo, filtros e pneu dianteiro',
    itens: [
      { id: 'item_021', tipo: 'peca', pecaId: 'pec_023', descricao: 'Óleo Motor 10W40 Semi (1L)', quantidade: 1, valorUnitario: 48 },
      { id: 'item_022', tipo: 'peca', pecaId: 'pec_018', descricao: 'Filtro de Óleo', quantidade: 1, valorUnitario: 35 },
      { id: 'item_023', tipo: 'servico', descricao: 'Revisão moto + troca pneu', quantidade: 1, valorUnitario: 180 },
    ],
    checklistEntrada: [], observacoes: 'Pneu fornecido pelo cliente', kmEntrada: 24800,
  },
  {
    id: 'os_009', numero: 1009, clienteId: 'cli_001', veiculoId: 'vei_002',
    status: 'aguardando_aprovacao', dataAbertura: '2025-02-07T10:00:00Z',
    descricaoProblema: 'Farol dianteiro queimado + revisão elétrica', diagnostico: 'Lâmpada queimada e chicote com mau contato',
    itens: [
      { id: 'item_024', tipo: 'peca', pecaId: 'pec_032', descricao: 'Lâmpada H4 Par', quantidade: 1, valorUnitario: 55 },
      { id: 'item_025', tipo: 'servico', descricao: 'Revisão elétrica + troca lâmpada', quantidade: 1, valorUnitario: 200 },
    ],
    checklistEntrada: [], observacoes: '', kmEntrada: 31500,
  },
  {
    id: 'os_010', numero: 1010, clienteId: 'cli_008', veiculoId: 'vei_011',
    status: 'em_execucao', dataAbertura: '2025-02-08T09:00:00Z',
    descricaoProblema: 'Barulho ao frear e volante vibrando', diagnostico: 'Disco de freio empenado + pastilhas gastas',
    itens: [
      { id: 'item_026', tipo: 'peca', pecaId: 'pec_007', descricao: 'Disco de Freio Ventilado', quantidade: 2, valorUnitario: 230 },
      { id: 'item_027', tipo: 'peca', pecaId: 'pec_006', descricao: 'Pastilha de Freio Dianteira', quantidade: 1, valorUnitario: 120 },
      { id: 'item_028', tipo: 'servico', descricao: 'Troca de disco + pastilha', quantidade: 1, valorUnitario: 280 },
    ],
    checklistEntrada: [], observacoes: '', kmEntrada: 17500,
  },
  {
    id: 'os_011', numero: 1011, clienteId: 'cli_004', veiculoId: 'vei_007',
    status: 'pronto_retirada', dataAbertura: '2025-02-09T08:00:00Z',
    descricaoProblema: 'Revisão de 10.000km', diagnostico: 'Troca de óleo e verificação geral',
    itens: [
      { id: 'item_029', tipo: 'peca', pecaId: 'pec_022', descricao: 'Óleo Motor 5W30 Sintético (1L)', quantidade: 3, valorUnitario: 60 },
      { id: 'item_030', tipo: 'peca', pecaId: 'pec_018', descricao: 'Filtro de Óleo', quantidade: 1, valorUnitario: 35 },
      { id: 'item_031', tipo: 'servico', descricao: 'Revisão moto completa', quantidade: 1, valorUnitario: 200 },
    ],
    checklistEntrada: [], observacoes: '', kmEntrada: 11800,
  },
  {
    id: 'os_012', numero: 1012, clienteId: 'cli_010', veiculoId: 'vei_014',
    status: 'aguardando_peca', dataAbertura: '2025-02-10T11:00:00Z',
    descricaoProblema: 'Retrovisor externo quebrado', diagnostico: 'Necessário trocar retrovisor completo',
    itens: [
      { id: 'item_032', tipo: 'peca', pecaId: 'pec_030', descricao: 'Retrovisor Externo', quantidade: 1, valorUnitario: 260 },
      { id: 'item_033', tipo: 'servico', descricao: 'Troca de retrovisor', quantidade: 1, valorUnitario: 80 },
    ],
    checklistEntrada: [], observacoes: 'Aguardando peça compatível com Nissan Kicks', kmEntrada: 21500,
  },
  // More finalizado orders for financial data
  {
    id: 'os_013', numero: 1013, clienteId: 'cli_003', veiculoId: 'vei_005',
    status: 'finalizado', dataAbertura: '2024-12-05T09:00:00Z', dataFinalizacao: '2024-12-07T17:00:00Z',
    descricaoProblema: 'Troca de pneus + alinhamento', diagnostico: 'Pneus com desgaste irregular',
    itens: [
      { id: 'item_034', tipo: 'servico', descricao: 'Alinhamento e balanceamento', quantidade: 1, valorUnitario: 180 },
      { id: 'item_035', tipo: 'servico', descricao: 'Troca de pneus (4)', quantidade: 1, valorUnitario: 200 },
    ],
    checklistEntrada: [], observacoes: 'Pneus fornecidos pelo cliente', kmEntrada: 88000,
  },
  {
    id: 'os_014', numero: 1014, clienteId: 'cli_006', veiculoId: 'vei_009',
    status: 'finalizado', dataAbertura: '2024-11-20T10:00:00Z', dataFinalizacao: '2024-11-22T15:00:00Z',
    descricaoProblema: 'Revisão 50.000km', diagnostico: 'Revisão completa',
    itens: [
      { id: 'item_036', tipo: 'peca', pecaId: 'pec_022', descricao: 'Óleo Motor 5W30 (1L)', quantidade: 4, valorUnitario: 60 },
      { id: 'item_037', tipo: 'peca', pecaId: 'pec_018', descricao: 'Filtro de Óleo', quantidade: 1, valorUnitario: 35 },
      { id: 'item_038', tipo: 'peca', pecaId: 'pec_019', descricao: 'Filtro de Ar', quantidade: 1, valorUnitario: 60 },
      { id: 'item_039', tipo: 'peca', pecaId: 'pec_021', descricao: 'Filtro de Cabine', quantidade: 1, valorUnitario: 65 },
      { id: 'item_040', tipo: 'servico', descricao: 'Revisão completa', quantidade: 1, valorUnitario: 300 },
    ],
    checklistEntrada: [], observacoes: '', kmEntrada: 55000,
  },
  {
    id: 'os_015', numero: 1015, clienteId: 'cli_002', veiculoId: 'vei_003',
    status: 'finalizado', dataAbertura: '2024-10-15T09:00:00Z', dataFinalizacao: '2024-10-17T16:00:00Z',
    descricaoProblema: 'Troca de pastilhas traseiras', diagnostico: 'Lonas de freio gastas',
    itens: [
      { id: 'item_041', tipo: 'peca', pecaId: 'pec_009', descricao: 'Lona de Freio Traseira', quantidade: 1, valorUnitario: 100 },
      { id: 'item_042', tipo: 'servico', descricao: 'Troca de lona + regulagem', quantidade: 1, valorUnitario: 180 },
    ],
    checklistEntrada: [], observacoes: '', kmEntrada: 42000,
  },
  {
    id: 'os_016', numero: 1016, clienteId: 'cli_009', veiculoId: 'vei_012',
    status: 'finalizado', dataAbertura: '2024-12-20T08:00:00Z', dataFinalizacao: '2024-12-20T14:00:00Z',
    descricaoProblema: 'Vela falhando', diagnostico: 'Velas de ignição com desgaste',
    itens: [
      { id: 'item_043', tipo: 'peca', pecaId: 'pec_001', descricao: 'Vela de Ignição NGK', quantidade: 1, valorUnitario: 45 },
      { id: 'item_044', tipo: 'servico', descricao: 'Troca de vela', quantidade: 1, valorUnitario: 60 },
    ],
    checklistEntrada: [], observacoes: '', kmEntrada: 23000,
  },
  {
    id: 'os_017', numero: 1017, clienteId: 'cli_003', veiculoId: 'vei_015',
    status: 'finalizado', dataAbertura: '2024-09-10T09:00:00Z', dataFinalizacao: '2024-09-12T17:00:00Z',
    descricaoProblema: 'Bateria fraca', diagnostico: 'Bateria sem carga - troca necessária',
    itens: [
      { id: 'item_045', tipo: 'peca', pecaId: 'pec_014', descricao: 'Bateria 60Ah', quantidade: 1, valorUnitario: 550 },
      { id: 'item_046', tipo: 'servico', descricao: 'Troca de bateria + teste alternador', quantidade: 1, valorUnitario: 100 },
    ],
    checklistEntrada: [], observacoes: '', kmEntrada: 72000,
  },
  {
    id: 'os_018', numero: 1018, clienteId: 'cli_005', veiculoId: 'vei_008',
    status: 'finalizado', dataAbertura: '2024-11-10T10:00:00Z', dataFinalizacao: '2024-11-10T15:00:00Z',
    descricaoProblema: 'Palhetas do limpador riscando', diagnostico: 'Palhetas ressecadas',
    itens: [
      { id: 'item_047', tipo: 'peca', pecaId: 'pec_031', descricao: 'Palheta Limpador Par', quantidade: 1, valorUnitario: 80 },
      { id: 'item_048', tipo: 'servico', descricao: 'Troca de palhetas', quantidade: 1, valorUnitario: 30 },
    ],
    checklistEntrada: [], observacoes: '', kmEntrada: 5500,
  },
  {
    id: 'os_019', numero: 1019, clienteId: 'cli_007', veiculoId: 'vei_010',
    status: 'finalizado', dataAbertura: '2024-10-25T08:00:00Z', dataFinalizacao: '2024-10-28T17:00:00Z',
    descricaoProblema: 'Revisão geral + problemas suspensão', diagnostico: 'Pivô e batentes gastos',
    itens: [
      { id: 'item_049', tipo: 'peca', pecaId: 'pec_013', descricao: 'Pivô de Suspensão', quantidade: 2, valorUnitario: 140 },
      { id: 'item_050', tipo: 'peca', pecaId: 'pec_012', descricao: 'Kit Batente Amortecedor', quantidade: 2, valorUnitario: 85 },
      { id: 'item_051', tipo: 'servico', descricao: 'Troca pivô + batente + alinhamento', quantidade: 1, valorUnitario: 400 },
    ],
    checklistEntrada: [], observacoes: '', kmEntrada: 115000,
  },
  {
    id: 'os_020', numero: 1020, clienteId: 'cli_004', veiculoId: 'vei_006',
    status: 'finalizado', dataAbertura: '2024-08-15T09:00:00Z', dataFinalizacao: '2024-08-16T16:00:00Z',
    descricaoProblema: 'Revisão 30.000km', diagnostico: 'Revisão de rotina',
    itens: [
      { id: 'item_052', tipo: 'peca', pecaId: 'pec_022', descricao: 'Óleo Motor 5W30 (1L)', quantidade: 4, valorUnitario: 60 },
      { id: 'item_053', tipo: 'peca', pecaId: 'pec_018', descricao: 'Filtro de Óleo', quantidade: 1, valorUnitario: 35 },
      { id: 'item_054', tipo: 'peca', pecaId: 'pec_020', descricao: 'Filtro de Combustível', quantidade: 1, valorUnitario: 55 },
      { id: 'item_055', tipo: 'servico', descricao: 'Revisão completa', quantidade: 1, valorUnitario: 250 },
    ],
    checklistEntrada: [], observacoes: '', kmEntrada: 30000,
  },
];
