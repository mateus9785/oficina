import { Router } from 'express';
import * as ctrl from '../controllers/configuracoes.controller';
import { requireAuth } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();
router.use(requireAuth);

router.get('/', asyncHandler(ctrl.listar));
router.put('/:chave', asyncHandler(ctrl.atualizar));

export default router;
