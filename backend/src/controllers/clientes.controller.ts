import { Request, Response } from 'express';
import { getPagination } from '../utils/pagination';
import * as clienteService from '../services/clienteService';

export async function listar(req: Request, res: Response): Promise<void> {
  const { page, limit, offset, sqlLimit, sqlOffset } = getPagination(req);
  const search = (req.query.q as string) || '';
  res.json(
    await clienteService.listar({ page, limit, offset, sqlLimit, sqlOffset, search, usuarioId: req.user!.sub })
  );
}

export async function verificarCpf(req: Request, res: Response): Promise<void> {
  const { cpf, excludeId } = req.query as { cpf?: string; excludeId?: string };
  const exists = await clienteService.verificarCpf(cpf ?? '', req.user!.sub, excludeId);
  res.json({ exists });
}

export async function criar(req: Request, res: Response): Promise<void> {
  const cliente = await clienteService.criar(req.body, req.user!.sub);
  res.status(201).json(cliente);
}

export async function buscar(req: Request, res: Response): Promise<void> {
  res.json(await clienteService.buscar(req.params.id, req.user!.sub));
}

export async function editar(req: Request, res: Response): Promise<void> {
  res.json(await clienteService.editar(req.params.id, req.body, req.user!.sub));
}

export async function remover(req: Request, res: Response): Promise<void> {
  await clienteService.remover(req.params.id, req.user!.sub);
  res.status(204).send();
}

export async function veiculosDoCliente(req: Request, res: Response): Promise<void> {
  res.json(await clienteService.veiculosDoCliente(req.params.id, req.user!.sub));
}
