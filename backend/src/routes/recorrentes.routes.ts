import { Router } from 'express';
import { param } from 'express-validator';
import * as ctrl from '../controllers/recorrentes.controller';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();
router.use(requireAuth);

router.get('/', asyncHandler(ctrl.listar));
router.post('/', asyncHandler(ctrl.criar));
router.put('/:id', param('id').isUUID(), validate, asyncHandler(ctrl.editar));
router.delete('/:id', param('id').isUUID(), validate, asyncHandler(ctrl.remover));
router.patch('/:id/toggle', param('id').isUUID(), validate, asyncHandler(ctrl.toggleAtivo));
router.post('/processar', asyncHandler(ctrl.processarManual));

export default router;
