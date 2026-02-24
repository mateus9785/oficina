import type { ItemOS, OrdemServico } from '../types';

export function calcularTotalItem(item: ItemOS): number {
  return item.quantidade * item.valorUnitario;
}

export function calcularSubtotalOS(ordem: OrdemServico): number {
  return ordem.itens.reduce((total, item) => total + calcularTotalItem(item), 0);
}

export function calcularDescontoOS(ordem: OrdemServico): number {
  const subtotal = calcularSubtotalOS(ordem);
  return subtotal * ((ordem.descontoPercentual ?? 0) / 100);
}

export function calcularTotalOS(ordem: OrdemServico): number {
  return calcularSubtotalOS(ordem) - calcularDescontoOS(ordem);
}

export function calcularTotalPecas(ordem: OrdemServico): number {
  return ordem.itens
    .filter((item) => item.tipo === 'peca')
    .reduce((total, item) => total + calcularTotalItem(item), 0);
}

export function calcularTotalServicos(ordem: OrdemServico): number {
  return ordem.itens
    .filter((item) => item.tipo === 'servico')
    .reduce((total, item) => total + calcularTotalItem(item), 0);
}
