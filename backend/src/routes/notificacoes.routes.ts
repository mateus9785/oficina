import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { getNotificacoes } from '../controllers/notificacoes.controller';

const router = Router();

router.get('/', requireAuth, getNotificacoes);

export default router;
