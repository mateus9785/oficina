import { describe, it, expect } from 'vitest';
import type { ItemOS, OrdemServico } from '../types';
import {
  calcularTotalItem,
  calcularSubtotalOS,
  calcularDescontoOS,
  calcularTotalOS,
  calcularTotalPecas,
  calcularTotalServicos,
} from './calculators';

function item(overrides: Partial<ItemOS>): ItemOS {
  return {
    id: 'item-1',
    tipo: 'servico',
    descricao: 'Item',
    quantidade: 1,
    valorUnitario: 0,
    ...overrides,
  };
}

function ordem(overrides: Partial<OrdemServico>): OrdemServico {
  return {
    id: 'ordem-1',
    numero: 1,
    clienteId: null,
    veiculoId: null,
    nomeCliente: '',
    descricaoVeiculo: '',
    descontoPercentual: 0,
    status: 'aguardando_aprovacao',
    dataAbertura: new Date().toISOString(),
    descricao: '',
    itens: [],
    checklistEntrada: [],
    kmEntrada: 0,
    ...overrides,
  };
}

describe('calcularTotalItem', () => {
  it('multiplies quantidade by valorUnitario', () => {
    expect(
      calcularTotalItem(item({ quantidade: 3, valorUnitario: 50 }))
    ).toBe(150);
  });
});

describe('calcularSubtotalOS', () => {
  it('sums the total of every item', () => {
    const o = ordem({
      itens: [
        item({ quantidade: 2, valorUnitario: 10 }),
        item({ quantidade: 1, valorUnitario: 30 }),
      ],
    });
    expect(calcularSubtotalOS(o)).toBe(50);
  });

  it('is 0 for an order with no items', () => {
    expect(calcularSubtotalOS(ordem({ itens: [] }))).toBe(0);
  });
});

describe('calcularDescontoOS', () => {
  it('applies the percentage discount to the subtotal', () => {
    const o = ordem({
      itens: [item({ quantidade: 1, valorUnitario: 200 })],
      descontoPercentual: 10,
    });
    expect(calcularDescontoOS(o)).toBe(20);
  });

  it('treats a missing/null descontoPercentual as 0', () => {
    const o = ordem({
      itens: [item({ quantidade: 1, valorUnitario: 200 })],
      descontoPercentual: null as unknown as number,
    });
    expect(calcularDescontoOS(o)).toBe(0);
  });
});

describe('calcularTotalOS', () => {
  it('is the subtotal minus the discount', () => {
    const o = ordem({
      itens: [item({ quantidade: 1, valorUnitario: 200 })],
      descontoPercentual: 10,
    });
    expect(calcularTotalOS(o)).toBe(180);
  });
});

describe('calcularTotalPecas / calcularTotalServicos', () => {
  it('splits totals by item tipo', () => {
    const o = ordem({
      itens: [
        item({ tipo: 'peca', quantidade: 2, valorUnitario: 25 }),
        item({ tipo: 'servico', quantidade: 1, valorUnitario: 100 }),
        item({ tipo: 'peca', quantidade: 1, valorUnitario: 10 }),
      ],
    });
    expect(calcularTotalPecas(o)).toBe(60);
    expect(calcularTotalServicos(o)).toBe(100);
  });
});
