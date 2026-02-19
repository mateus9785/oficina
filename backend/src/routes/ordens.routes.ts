import { Router } from 'express';
import { body, param } from 'express-validator';
import * as ctrl from '../controllers/ordens.controller';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();
router.use(requireAuth);

router.get('/', asyncHandler(ctrl.listar));
router.post(
  '/',
  [
    body('clienteId').isUUID(),
    body('veiculoId').isUUID(),
    body('descricaoProblema').trim().notEmpty(),
    body('kmEntrada').optional().isInt({ min: 0 }),
  ],
  validate,
  asyncHandler(ctrl.criar)
);
router.get('/:id', param('id').isUUID(), validate, asyncHandler(ctrl.buscar));
router.put(
  '/:id',
  [param('id').isUUID(), body('descricaoProblema').optional().trim()],
  validate,
  asyncHandler(ctrl.editar)
);
router.delete('/:id', param('id').isUUID(), validate, asyncHandler(ctrl.remover));
router.patch(
  '/:id/status',
  [
    param('id').isUUID(),
    body('status').isIn([
      'aguardando_aprovacao',
      'aguardando_peca',
      'em_execucao',
      'pronto_retirada',
      'finalizado',
    ]),
  ],
  validate,
  asyncHandler(ctrl.moverStatus)
);

// Itens
router.post(
  '/:id/itens',
  [
    param('id').isUUID(),
    body('tipo').isIn(['peca', 'servico']),
    body('descricao').trim().notEmpty(),
    body('quantidade').isInt({ min: 1 }),
    body('valorUnitario').isFloat({ min: 0 }),
    body('pecaId').optional().isUUID(),
  ],
  validate,
  asyncHandler(ctrl.adicionarItem)
);
router.put(
  '/:id/itens/:itemId',
  [param('id').isUUID(), param('itemId').isUUID()],
  validate,
  asyncHandler(ctrl.editarItem)
);
router.delete(
  '/:id/itens/:itemId',
  [param('id').isUUID(), param('itemId').isUUID()],
  validate,
  asyncHandler(ctrl.removerItem)
);

// Checklist
router.put('/:id/checklist', param('id').isUUID(), validate, asyncHandler(ctrl.atualizarChecklist));

export default router;
