import { Router } from 'express';
import { body } from 'express-validator';
import { login, getMe, mudarSenha } from '../controllers/auth.controller';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { authLimiter } from '../middleware/rateLimiter';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.post(
  '/login',
  authLimiter,
  [
    body('email').isEmail().withMessage('Email inválido.'),
    body('senha').notEmpty().withMessage('Senha obrigatória.'),
  ],
  validate,
  asyncHandler(login)
);

router.get('/me', requireAuth, asyncHandler(getMe));

router.post(
  '/mudar-senha',
  requireAuth,
  [
    body('senhaAtual').notEmpty().withMessage('Senha atual obrigatória.'),
    body('novaSenha').isLength({ min: 6 }).withMessage('Nova senha deve ter ao menos 6 caracteres.'),
  ],
  validate,
  asyncHandler(mudarSenha)
);

export default router;
