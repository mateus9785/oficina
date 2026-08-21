import { PoolConnection, RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { pool } from '../config/database';
import { ClienteRow } from '../types/database';

function exec(conn?: PoolConnection) {
  return conn ? conn.execute.bind(conn) : pool.execute.bind(pool);
}

export interface ClienteFilter {
  usuarioId: string;
  search: string;
}

export interface ClientePagination {
  sqlLimit: bigint;
  sqlOffset: bigint;
}

export interface NovoClienteData {
  usuarioId: string;
  nome: string;
  cpfCnpj: string | null;
  telefone: string;
  email: string;
  dataNascimento: string | null;
  cep: string;
  cidade: string;
  estado: string;
  rua: string;
  numero: string;
  complemento: string;
}

export type EditarClienteData = NovoClienteData;

export async function findAll(
  filter: ClienteFilter,
  pagination: ClientePagination,
  conn?: PoolConnection
): Promise<ClienteRow[]> {
  const like = `%${filter.search}%`;
  const [rows] = await exec(conn)<ClienteRow[]>(
    'SELECT * FROM clientes WHERE usuario_id = ? AND (nome LIKE ? OR cpf_cnpj LIKE ? OR email LIKE ?) ORDER BY nome LIMIT ? OFFSET ?',
    [filter.usuarioId, like, like, like, pagination.sqlLimit, pagination.sqlOffset]
  );
  return rows;
}

export async function count(
  filter: ClienteFilter,
  conn?: PoolConnection
): Promise<number> {
  const like = `%${filter.search}%`;
  const [rows] = await exec(conn)<(RowDataPacket & { total: number })[]>(
    'SELECT COUNT(*) as total FROM clientes WHERE usuario_id = ? AND (nome LIKE ? OR cpf_cnpj LIKE ? OR email LIKE ?)',
    [filter.usuarioId, like, like, like]
  );
  return Number(rows[0].total);
}

export async function findByCpf(
  cpf: string,
  usuarioId: string,
  excludeId?: string,
  conn?: PoolConnection
): Promise<(RowDataPacket & { id: string }) | null> {
  const [rows] = await exec(conn)<(RowDataPacket & { id: string })[]>(
    'SELECT id FROM clientes WHERE cpf_cnpj = ? AND usuario_id = ? AND id != ?',
    [cpf, usuarioId, excludeId || '']
  );
  return rows[0] ?? null;
}

export async function findById(
  id: string,
  usuarioId: string,
  conn?: PoolConnection
): Promise<ClienteRow | null> {
  const [rows] = await exec(conn)<ClienteRow[]>(
    'SELECT * FROM clientes WHERE id = ? AND usuario_id = ?',
    [id, usuarioId]
  );
  return rows[0] ?? null;
}

export async function create(
  id: string,
  data: NovoClienteData,
  conn?: PoolConnection
): Promise<void> {
  await exec(conn)(
    `INSERT INTO clientes
       (id, usuario_id, nome, cpf_cnpj, telefone, email,
        data_nascimento, cep, cidade, estado, rua, numero, complemento)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      id,
      data.usuarioId,
      data.nome,
      data.cpfCnpj,
      data.telefone,
      data.email,
      data.dataNascimento,
      data.cep,
      data.cidade,
      data.estado,
      data.rua,
      data.numero,
      data.complemento,
    ]
  );
}

export async function update(
  id: string,
  data: EditarClienteData,
  conn?: PoolConnection
): Promise<boolean> {
  const [result] = await exec(conn)<ResultSetHeader>(
    `UPDATE clientes SET
       nome=?, cpf_cnpj=?, telefone=?, email=?,
       data_nascimento=?, cep=?, cidade=?, estado=?, rua=?, numero=?, complemento=?
     WHERE id=? AND usuario_id=?`,
    [
      data.nome,
      data.cpfCnpj,
      data.telefone,
      data.email,
      data.dataNascimento,
      data.cep,
      data.cidade,
      data.estado,
      data.rua,
      data.numero,
      data.complemento,
      id,
      data.usuarioId,
    ]
  );
  return result.affectedRows > 0;
}

export async function remove(
  id: string,
  usuarioId: string,
  conn?: PoolConnection
): Promise<boolean> {
  const [result] = await exec(conn)<ResultSetHeader>(
    'DELETE FROM clientes WHERE id = ? AND usuario_id = ?',
    [id, usuarioId]
  );
  return result.affectedRows > 0;
}
