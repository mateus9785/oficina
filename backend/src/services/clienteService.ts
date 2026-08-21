import { RowDataPacket } from 'mysql2/promise';
import { v4 as uuidv4 } from 'uuid';
import * as clienteRepository from '../repositories/clienteRepository';
import * as veiculoRepository from '../repositories/veiculoRepository';
import { AppError } from '../middleware/errorHandler';
import { paginatedResponse } from '../utils/pagination';

function mapCliente(r: RowDataPacket) {
  return {
    id: r.id,
    nome: r.nome,
    cpfCnpj: r.cpf_cnpj,
    telefone: r.telefone,
    email: r.email,
    dataNascimento: r.data_nascimento
      ? r.data_nascimento.toISOString().split('T')[0]
      : null,
    cep: r.cep ?? '',
    cidade: r.cidade ?? '',
    estado: r.estado ?? '',
    rua: r.rua ?? '',
    numero: r.numero ?? '',
    complemento: r.complemento ?? '',
    dataCadastro: r.data_cadastro,
  };
}
function mapClientes(rows: RowDataPacket[]) {
  return rows.map(mapCliente);
}

function mapVeiculo(r: RowDataPacket) {
  return {
    id: r.id,
    clienteId: r.cliente_id,
    tipo: r.tipo,
    marca: r.marca,
    modelo: r.modelo,
    ano: r.ano,
    placa: r.placa,
    cor: r.cor,
    observacoes: r.observacoes,
  };
}
function mapVeiculos(rows: RowDataPacket[]) {
  return rows.map(mapVeiculo);
}

export interface ClienteInput {
  nome: string;
  cpfCnpj?: string;
  telefone?: string;
  email?: string;
  dataNascimento?: string | null;
  cep?: string;
  cidade?: string;
  estado?: string;
  rua?: string;
  numero?: string;
  complemento?: string;
}

export async function listar(query: {
  page: number;
  limit: number;
  offset: number;
  sqlLimit: bigint;
  sqlOffset: bigint;
  search: string;
}) {
  const filter = { search: query.search };
  const total = await clienteRepository.count(filter);
  const rows = await clienteRepository.findAll(filter, {
    sqlLimit: query.sqlLimit,
    sqlOffset: query.sqlOffset,
  });
  return paginatedResponse(mapClientes(rows), total, {
    page: query.page,
    limit: query.limit,
    offset: query.offset,
  });
}

export async function verificarCpf(cpf: string, excludeId?: string) {
  if (!cpf.trim()) return false;
  const found = await clienteRepository.findByCpf(cpf.trim(), excludeId || '');
  return found !== null;
}

export async function criar(input: ClienteInput) {
  const cpf = input.cpfCnpj?.trim() || null;
  if (cpf) {
    const dup = await clienteRepository.findByCpf(cpf);
    if (dup) throw new AppError(409, 'CPF/CNPJ já cadastrado.');
  }
  const id = uuidv4();
  await clienteRepository.create(id, {
    nome: input.nome,
    cpfCnpj: cpf,
    telefone: input.telefone ?? '',
    email: input.email ?? '',
    dataNascimento: input.dataNascimento || null,
    cep: input.cep ?? '',
    cidade: input.cidade ?? '',
    estado: input.estado ?? '',
    rua: input.rua ?? '',
    numero: input.numero ?? '',
    complemento: input.complemento ?? '',
  });
  const cliente = await clienteRepository.findById(id);
  return mapCliente(cliente!);
}

export async function buscar(id: string) {
  const cliente = await clienteRepository.findById(id);
  if (!cliente) throw new AppError(404, 'Cliente não encontrado.');
  return mapCliente(cliente);
}

export async function editar(id: string, input: ClienteInput) {
  const cpf = input.cpfCnpj?.trim() || null;
  if (cpf) {
    const dup = await clienteRepository.findByCpf(cpf, id);
    if (dup) throw new AppError(409, 'CPF/CNPJ já cadastrado.');
  }
  const updated = await clienteRepository.update(id, {
    nome: input.nome,
    cpfCnpj: cpf,
    telefone: input.telefone ?? '',
    email: input.email ?? '',
    dataNascimento: input.dataNascimento || null,
    cep: input.cep ?? '',
    cidade: input.cidade ?? '',
    estado: input.estado ?? '',
    rua: input.rua ?? '',
    numero: input.numero ?? '',
    complemento: input.complemento ?? '',
  });
  if (!updated) throw new AppError(404, 'Cliente não encontrado.');
  const cliente = await clienteRepository.findById(id);
  return mapCliente(cliente!);
}

export async function remover(id: string) {
  const removed = await clienteRepository.remove(id);
  if (!removed) throw new AppError(404, 'Cliente não encontrado.');
}

export async function veiculosDoCliente(id: string) {
  const rows = await veiculoRepository.findByClienteId(id);
  return mapVeiculos(rows);
}
