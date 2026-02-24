import type { Peca } from '../types';

export const pecasSeed: Peca[] = [
  // Motor
  { id: 'pec_001', nome: 'Vela de Ignição NGK', categoria: 'motor', marca: 'NGK', quantidade: 40, estoqueMinimo: 10, precoCompra: 25, precoVenda: 45, localizacao: 'A1-01', usoTotal: 85, historicoPrecos: [{ data: '2024-06-01T00:00:00Z', preco: 22, fornecedor: 'Dist. Nacional' }, { data: '2024-09-01T00:00:00Z', preco: 25, fornecedor: 'Dist. Nacional' }] },
  { id: 'pec_002', nome: 'Correia Dentada Gates', categoria: 'motor', marca: 'Gates', quantidade: 8, estoqueMinimo: 3, precoCompra: 85, precoVenda: 150, localizacao: 'A1-02', usoTotal: 22, historicoPrecos: [{ data: '2024-07-01T00:00:00Z', preco: 80, fornecedor: 'Gates Brasil' }, { data: '2025-01-01T00:00:00Z', preco: 85, fornecedor: 'Gates Brasil' }] },
  { id: 'pec_003', nome: 'Junta do Cabeçote', categoria: 'motor', marca: 'Vedamotors', quantidade: 5, estoqueMinimo: 2, precoCompra: 120, precoVenda: 220, localizacao: 'A1-03', usoTotal: 8, historicoPrecos: [{ data: '2024-08-01T00:00:00Z', preco: 120, fornecedor: 'Vedamotors' }] },
  { id: 'pec_004', nome: 'Bomba D\'Água', categoria: 'motor', marca: 'Indisa', quantidade: 6, estoqueMinimo: 2, precoCompra: 95, precoVenda: 170, localizacao: 'A1-04', usoTotal: 12, historicoPrecos: [{ data: '2024-09-01T00:00:00Z', preco: 95, fornecedor: 'Indisa' }] },
  { id: 'pec_005', nome: 'Tensor da Correia', categoria: 'motor', marca: 'INA', quantidade: 4, estoqueMinimo: 2, precoCompra: 110, precoVenda: 195, localizacao: 'A1-05', usoTotal: 10, historicoPrecos: [{ data: '2024-10-01T00:00:00Z', preco: 110, fornecedor: 'Schaeffler' }] },

  // Freio
  { id: 'pec_006', nome: 'Pastilha de Freio Dianteira', categoria: 'freio', marca: 'Fras-le', quantidade: 20, estoqueMinimo: 8, precoCompra: 65, precoVenda: 120, localizacao: 'B1-01', usoTotal: 55, historicoPrecos: [{ data: '2024-06-01T00:00:00Z', preco: 60, fornecedor: 'Fras-le' }, { data: '2025-01-01T00:00:00Z', preco: 65, fornecedor: 'Fras-le' }] },
  { id: 'pec_007', nome: 'Disco de Freio Ventilado', categoria: 'freio', marca: 'Fremax', quantidade: 10, estoqueMinimo: 4, precoCompra: 130, precoVenda: 230, localizacao: 'B1-02', usoTotal: 18, historicoPrecos: [{ data: '2024-08-01T00:00:00Z', preco: 130, fornecedor: 'Fremax' }] },
  { id: 'pec_008', nome: 'Fluido de Freio DOT 4', categoria: 'freio', marca: 'Bosch', quantidade: 15, estoqueMinimo: 5, precoCompra: 28, precoVenda: 50, localizacao: 'B1-03', usoTotal: 40, historicoPrecos: [{ data: '2024-07-01T00:00:00Z', preco: 28, fornecedor: 'Bosch' }] },
  { id: 'pec_009', nome: 'Lona de Freio Traseira', categoria: 'freio', marca: 'Fras-le', quantidade: 12, estoqueMinimo: 4, precoCompra: 55, precoVenda: 100, localizacao: 'B1-04', usoTotal: 30, historicoPrecos: [{ data: '2024-09-01T00:00:00Z', preco: 55, fornecedor: 'Fras-le' }] },

  // Suspensão
  { id: 'pec_010', nome: 'Amortecedor Dianteiro', categoria: 'suspensao', marca: 'Monroe', quantidade: 6, estoqueMinimo: 4, precoCompra: 180, precoVenda: 320, localizacao: 'C1-01', usoTotal: 14, historicoPrecos: [{ data: '2024-07-01T00:00:00Z', preco: 175, fornecedor: 'Tenneco' }, { data: '2025-01-01T00:00:00Z', preco: 180, fornecedor: 'Tenneco' }] },
  { id: 'pec_011', nome: 'Amortecedor Traseiro', categoria: 'suspensao', marca: 'Monroe', quantidade: 6, estoqueMinimo: 4, precoCompra: 150, precoVenda: 270, localizacao: 'C1-02', usoTotal: 12, historicoPrecos: [{ data: '2024-07-01T00:00:00Z', preco: 150, fornecedor: 'Tenneco' }] },
  { id: 'pec_012', nome: 'Kit Batente Amortecedor', categoria: 'suspensao', marca: 'Sampel', quantidade: 8, estoqueMinimo: 3, precoCompra: 45, precoVenda: 85, localizacao: 'C1-03', usoTotal: 16, historicoPrecos: [{ data: '2024-08-01T00:00:00Z', preco: 45, fornecedor: 'Sampel' }] },
  { id: 'pec_013', nome: 'Pivô de Suspensão', categoria: 'suspensao', marca: 'Viemar', quantidade: 3, estoqueMinimo: 2, precoCompra: 75, precoVenda: 140, localizacao: 'C1-04', usoTotal: 9, historicoPrecos: [{ data: '2024-10-01T00:00:00Z', preco: 75, fornecedor: 'Viemar' }] },

  // Elétrica
  { id: 'pec_014', nome: 'Bateria 60Ah', categoria: 'eletrica', marca: 'Moura', quantidade: 4, estoqueMinimo: 2, precoCompra: 350, precoVenda: 550, localizacao: 'D1-01', usoTotal: 10, historicoPrecos: [{ data: '2024-06-01T00:00:00Z', preco: 340, fornecedor: 'Moura' }, { data: '2024-12-01T00:00:00Z', preco: 350, fornecedor: 'Moura' }] },
  { id: 'pec_015', nome: 'Alternador Recondicionado', categoria: 'eletrica', marca: 'Bosch', quantidade: 2, estoqueMinimo: 1, precoCompra: 450, precoVenda: 750, localizacao: 'D1-02', usoTotal: 5, historicoPrecos: [{ data: '2024-09-01T00:00:00Z', preco: 450, fornecedor: 'Recon Eletric' }] },
  { id: 'pec_016', nome: 'Motor de Arranque', categoria: 'eletrica', marca: 'Valeo', quantidade: 2, estoqueMinimo: 1, precoCompra: 380, precoVenda: 620, localizacao: 'D1-03', usoTotal: 4, historicoPrecos: [{ data: '2024-10-01T00:00:00Z', preco: 380, fornecedor: 'Valeo' }] },
  { id: 'pec_017', nome: 'Bobina de Ignição', categoria: 'eletrica', marca: 'Bosch', quantidade: 10, estoqueMinimo: 4, precoCompra: 85, precoVenda: 150, localizacao: 'D1-04', usoTotal: 15, historicoPrecos: [{ data: '2024-08-01T00:00:00Z', preco: 85, fornecedor: 'Bosch' }] },

  // Filtros
  { id: 'pec_018', nome: 'Filtro de Óleo', categoria: 'filtro', marca: 'Mann', quantidade: 30, estoqueMinimo: 10, precoCompra: 18, precoVenda: 35, localizacao: 'E1-01', usoTotal: 95, historicoPrecos: [{ data: '2024-06-01T00:00:00Z', preco: 16, fornecedor: 'Mann+Hummel' }, { data: '2025-01-01T00:00:00Z', preco: 18, fornecedor: 'Mann+Hummel' }] },
  { id: 'pec_019', nome: 'Filtro de Ar', categoria: 'filtro', marca: 'Mann', quantidade: 25, estoqueMinimo: 8, precoCompra: 32, precoVenda: 60, localizacao: 'E1-02', usoTotal: 70, historicoPrecos: [{ data: '2024-07-01T00:00:00Z', preco: 32, fornecedor: 'Mann+Hummel' }] },
  { id: 'pec_020', nome: 'Filtro de Combustível', categoria: 'filtro', marca: 'Tecfil', quantidade: 20, estoqueMinimo: 6, precoCompra: 28, precoVenda: 55, localizacao: 'E1-03', usoTotal: 50, historicoPrecos: [{ data: '2024-08-01T00:00:00Z', preco: 28, fornecedor: 'Tecfil' }] },
  { id: 'pec_021', nome: 'Filtro de Cabine (Ar Condicionado)', categoria: 'filtro', marca: 'Mann', quantidade: 18, estoqueMinimo: 6, precoCompra: 35, precoVenda: 65, localizacao: 'E1-04', usoTotal: 45, historicoPrecos: [{ data: '2024-09-01T00:00:00Z', preco: 35, fornecedor: 'Mann+Hummel' }] },

  // Óleo
  { id: 'pec_022', nome: 'Óleo Motor 5W30 Sintético (1L)', categoria: 'oleo', marca: 'Mobil', quantidade: 50, estoqueMinimo: 20, precoCompra: 35, precoVenda: 60, localizacao: 'F1-01', usoTotal: 180, historicoPrecos: [{ data: '2024-06-01T00:00:00Z', preco: 32, fornecedor: 'ExxonMobil' }, { data: '2024-12-01T00:00:00Z', preco: 35, fornecedor: 'ExxonMobil' }] },
  { id: 'pec_023', nome: 'Óleo Motor 10W40 Semi (1L)', categoria: 'oleo', marca: 'Castrol', quantidade: 35, estoqueMinimo: 15, precoCompra: 28, precoVenda: 48, localizacao: 'F1-02', usoTotal: 120, historicoPrecos: [{ data: '2024-07-01T00:00:00Z', preco: 28, fornecedor: 'Castrol' }] },
  { id: 'pec_024', nome: 'Óleo Câmbio ATF (1L)', categoria: 'oleo', marca: 'Mobil', quantidade: 12, estoqueMinimo: 5, precoCompra: 42, precoVenda: 75, localizacao: 'F1-03', usoTotal: 25, historicoPrecos: [{ data: '2024-08-01T00:00:00Z', preco: 42, fornecedor: 'ExxonMobil' }] },

  // Transmissão
  { id: 'pec_025', nome: 'Kit Embreagem', categoria: 'transmissao', marca: 'LUK', quantidade: 3, estoqueMinimo: 2, precoCompra: 450, precoVenda: 780, localizacao: 'G1-01', usoTotal: 7, historicoPrecos: [{ data: '2024-07-01T00:00:00Z', preco: 430, fornecedor: 'Schaeffler' }, { data: '2025-01-01T00:00:00Z', preco: 450, fornecedor: 'Schaeffler' }] },
  { id: 'pec_026', nome: 'Junta Homocinética', categoria: 'transmissao', marca: 'Cofap', quantidade: 4, estoqueMinimo: 2, precoCompra: 85, precoVenda: 155, localizacao: 'G1-02', usoTotal: 8, historicoPrecos: [{ data: '2024-09-01T00:00:00Z', preco: 85, fornecedor: 'Cofap' }] },
  { id: 'pec_027', nome: 'Rolamento Roda Dianteira', categoria: 'transmissao', marca: 'SKF', quantidade: 6, estoqueMinimo: 2, precoCompra: 95, precoVenda: 170, localizacao: 'G1-03', usoTotal: 11, historicoPrecos: [{ data: '2024-10-01T00:00:00Z', preco: 95, fornecedor: 'SKF' }] },

  // Carroceria
  { id: 'pec_028', nome: 'Farol Dianteiro LD', categoria: 'carroceria', marca: 'Arteb', quantidade: 2, estoqueMinimo: 1, precoCompra: 280, precoVenda: 480, localizacao: 'H1-01', usoTotal: 3, historicoPrecos: [{ data: '2024-08-01T00:00:00Z', preco: 280, fornecedor: 'Arteb' }] },
  { id: 'pec_029', nome: 'Lanterna Traseira LE', categoria: 'carroceria', marca: 'Arteb', quantidade: 2, estoqueMinimo: 1, precoCompra: 180, precoVenda: 310, localizacao: 'H1-02', usoTotal: 2, historicoPrecos: [{ data: '2024-09-01T00:00:00Z', preco: 180, fornecedor: 'Arteb' }] },
  { id: 'pec_030', nome: 'Retrovisor Externo', categoria: 'carroceria', marca: 'Metagal', quantidade: 1, estoqueMinimo: 1, precoCompra: 150, precoVenda: 260, localizacao: 'H1-03', usoTotal: 2, historicoPrecos: [{ data: '2024-10-01T00:00:00Z', preco: 150, fornecedor: 'Metagal' }] },

  // Acessórios
  { id: 'pec_031', nome: 'Palheta Limpador Par', categoria: 'acessorio', marca: 'Bosch', quantidade: 15, estoqueMinimo: 5, precoCompra: 45, precoVenda: 80, localizacao: 'I1-01', usoTotal: 35, historicoPrecos: [{ data: '2024-07-01T00:00:00Z', preco: 45, fornecedor: 'Bosch' }] },
  { id: 'pec_032', nome: 'Lâmpada H4 Par', categoria: 'acessorio', marca: 'Philips', quantidade: 12, estoqueMinimo: 4, precoCompra: 30, precoVenda: 55, localizacao: 'I1-02', usoTotal: 28, historicoPrecos: [{ data: '2024-08-01T00:00:00Z', preco: 30, fornecedor: 'Philips' }] },
  { id: 'pec_033', nome: 'Lâmpada LED H7 Par', categoria: 'acessorio', marca: 'Osram', quantidade: 8, estoqueMinimo: 3, precoCompra: 75, precoVenda: 130, localizacao: 'I1-03', usoTotal: 15, historicoPrecos: [{ data: '2024-09-01T00:00:00Z', preco: 75, fornecedor: 'Osram' }] },

  // Outros
  { id: 'pec_034', nome: 'Aditivo Radiador (1L)', categoria: 'outros', marca: 'Orbi', quantidade: 20, estoqueMinimo: 8, precoCompra: 15, precoVenda: 30, localizacao: 'J1-01', usoTotal: 60, historicoPrecos: [{ data: '2024-07-01T00:00:00Z', preco: 15, fornecedor: 'Orbi Química' }] },
  { id: 'pec_035', nome: 'Cola para Espelho Retrovisor', categoria: 'outros', marca: 'Loctite', quantidade: 6, estoqueMinimo: 2, precoCompra: 18, precoVenda: 35, localizacao: 'J1-02', usoTotal: 12, historicoPrecos: [{ data: '2024-08-01T00:00:00Z', preco: 18, fornecedor: 'Henkel' }] },
];
