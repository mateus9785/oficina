import { Request, Response } from 'express';
import { getPagination } from '../utils/pagination';
import * as ordemService from '../services/ordemService';

export async function listar(req: Request, res: Response): Promise<void> {
  const { page, limit, offset, sqlLimit, sqlOffset } = getPagination(req);
  const status = (req.query.status as string) || '';
  const clienteId = (req.query.clienteId as string) || '';
  const somenteArquivadas = req.query.arquivado === '1';

  res.json(
    await ordemService.listar({
      page,
      limit,
      offset,
      sqlLimit,
      sqlOffset,
      status,
      clienteId,
      somenteArquivadas,
    })
  );
}

export async function criar(req: Request, res: Response): Promise<void> {
  const ordem = await ordemService.criar(req.body);
  res.status(201).json(ordem);
}

export async function buscar(req: Request, res: Response): Promise<void> {
  res.json(await ordemService.buscar(req.params.id));
}

export async function editar(req: Request, res: Response): Promise<void> {
  res.json(await ordemService.editar(req.params.id, req.body));
}

export async function remover(req: Request, res: Response): Promise<void> {
  await ordemService.remover(req.params.id);
  res.status(204).send();
}

export async function moverStatus(req: Request, res: Response): Promise<void> {
  const { status } = req.body as { status: string };
  res.json(await ordemService.moverStatus(req.params.id, status));
}

export async function adicionarItem(req: Request, res: Response): Promise<void> {
  const ordem = await ordemService.adicionarItem(req.params.id, req.body);
  res.status(201).json(ordem);
}

export async function editarItem(req: Request, res: Response): Promise<void> {
  res.json(
    await ordemService.editarItem(req.params.id, req.params.itemId, req.body)
  );
}

export async function removerItem(req: Request, res: Response): Promise<void> {
  res.json(await ordemService.removerItem(req.params.id, req.params.itemId));
}

export async function arquivar(req: Request, res: Response): Promise<void> {
  await ordemService.arquivar(req.params.id);
  res.status(204).send();
}

export async function desarquivar(req: Request, res: Response): Promise<void> {
  res.json(await ordemService.desarquivar(req.params.id));
}

export async function atualizarChecklist(
  req: Request,
  res: Response
): Promise<void> {
  res.json(await ordemService.atualizarChecklist(req.params.id, req.body.checklist));
}
