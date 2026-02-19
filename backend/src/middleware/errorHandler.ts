import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  // MySQL duplicate entry
  if ((err as NodeJS.ErrnoException).code === 'ER_DUP_ENTRY') {
    res.status(409).json({ error: 'Registro duplicado.' });
    return;
  }

  console.error('[ERROR]', err);
  res.status(500).json({ error: 'Erro interno do servidor.' });
}

export function notFound(_req: Request, res: Response): void {
  res.status(404).json({ error: 'Rota não encontrada.' });
}
