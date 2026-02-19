import { Router } from 'express';
import * as ctrl from '../controllers/relatorios.controller';
import { requireAuth } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();
router.use(requireAuth);

router.get('/dashboard', asyncHandler(ctrl.dashboard));
router.get('/fluxo-mensal', asyncHandler(ctrl.fluxoMensal));

export default router;
