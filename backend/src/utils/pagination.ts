import { Request } from 'express';

export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
  /** Usar em pool.execute() — mysql2 v3 exige BigInt para LIMIT/OFFSET */
  sqlLimit: bigint;
  sqlOffset: bigint;
}

export function getPagination(req: Request): PaginationParams {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(500, Math.max(1, parseInt(req.query.limit as string) || 20));
  const offset = (page - 1) * limit;
  return { page, limit, offset, sqlLimit: BigInt(limit), sqlOffset: BigInt(offset) };
}

export function paginatedResponse<T>(
  data: T[],
  total: number,
  { page, limit }: { page: number; limit: number; [key: string]: unknown }
) {
  return {
    data,
    meta: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  };
}
