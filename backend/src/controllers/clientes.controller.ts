import { Request, Response } from 'express';
import { getPagination } from '../utils/pagination';
import * as clienteService from '../services/clienteService';

export async function listar(req: Request, res: Response): Promise<void> {
  const { page, limit, offset, sqlLimit, sqlOffset } = getPagination(req);
  const search = (req.query.q as string) || '';
  res.json(
    await clienteService.listar({ page, limit, offset, sqlLimit, sqlOffset, search })
  );
}

export async function verificarCpf(req: Request, res: Response): Promise<void> {
  const { cpf, excludeId } = req.query as { cpf?: string; excludeId?: string };
  const exists = await clienteService.verificarCpf(cpf ?? '', excludeId);
  res.json({ exists });
}

export async function criar(req: Request, res: Response): Promise<void> {
  const cliente = await clienteService.criar(req.body);
  res.status(201).json(cliente);
}

export async function buscar(req: Request, res: Response): Promise<void> {
  res.json(await clienteService.buscar(req.params.id));
}

export async function editar(req: Request, res: Response): Promise<void> {
  res.json(await clienteService.editar(req.params.id, req.body));
}

export async function remover(req: Request, res: Response): Promise<void> {
  await clienteService.remover(req.params.id);
  res.status(204).send();
}

export async function veiculosDoCliente(req: Request, res: Response): Promise<void> {
  res.json(await clienteService.veiculosDoCliente(req.params.id));
}
