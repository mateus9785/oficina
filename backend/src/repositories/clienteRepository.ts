import { PoolConnection, RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { pool } from '../config/database';

function exec(conn?: PoolConnection) {
  return conn ? conn.execute.bind(conn) : pool.execute.bind(pool);
}

export interface ClienteFilter {
  search: string;
}

export interface ClientePagination {
  sqlLimit: bigint;
  sqlOffset: bigint;
}

export interface NovoClienteData {
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
): Promise<RowDataPacket[]> {
  const like = `%${filter.search}%`;
  const [rows] = await exec(conn)<RowDataPacket[]>(
    'SELECT * FROM clientes WHERE nome LIKE ? OR cpf_cnpj LIKE ? OR email LIKE ? ORDER BY nome LIMIT ? OFFSET ?',
    [like, like, like, pagination.sqlLimit, pagination.sqlOffset]
  );
  return rows;
}

export async function count(
  filter: ClienteFilter,
  conn?: PoolConnection
): Promise<number> {
  const like = `%${filter.search}%`;
  const [rows] = await exec(conn)<RowDataPacket[]>(
    'SELECT COUNT(*) as total FROM clientes WHERE nome LIKE ? OR cpf_cnpj LIKE ? OR email LIKE ?',
    [like, like, like]
  );
  return Number(rows[0].total);
}

export async function findByCpf(
  cpf: string,
  excludeId?: string,
  conn?: PoolConnection
): Promise<RowDataPacket | null> {
  const [rows] = await exec(conn)<RowDataPacket[]>(
    'SELECT id FROM clientes WHERE cpf_cnpj = ? AND id != ?',
    [cpf, excludeId || '']
  );
  return rows[0] ?? null;
}

export async function findById(
  id: string,
  conn?: PoolConnection
): Promise<RowDataPacket | null> {
  const [rows] = await exec(conn)<RowDataPacket[]>(
    'SELECT * FROM clientes WHERE id = ?',
    [id]
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
       (id, nome, cpf_cnpj, telefone, email,
        data_nascimento, cep, cidade, estado, rua, numero, complemento)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      id,
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
     WHERE id=?`,
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
    ]
  );
  return result.affectedRows > 0;
}

export async function remove(
  id: string,
  conn?: PoolConnection
): Promise<boolean> {
  const [result] = await exec(conn)<ResultSetHeader>(
    'DELETE FROM clientes WHERE id = ?',
    [id]
  );
  return result.affectedRows > 0;
}
