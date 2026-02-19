import { Router } from 'express';
import { body, param } from 'express-validator';
import * as ctrl from '../controllers/usuarios.controller';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';
import { validate } from '../middleware/validate';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();
router.use(requireAuth, requireRole('admin'));

router.get('/', asyncHandler(ctrl.listar));
router.post(
  '/',
  [
    body('nome').trim().notEmpty(),
    body('email').isEmail(),
    body('senha').isLength({ min: 6 }).withMessage('Senha mínima: 6 caracteres.'),
    body('role').optional().isIn(['admin', 'funcionario']),
  ],
  validate,
  asyncHandler(ctrl.criar)
);
router.get('/:id', param('id').isUUID(), validate, asyncHandler(ctrl.buscar));
router.put(
  '/:id',
  [
    param('id').isUUID(),
    body('nome').optional().trim().notEmpty(),
    body('email').optional().isEmail(),
    body('senha').optional().isLength({ min: 6 }),
    body('role').optional().isIn(['admin', 'funcionario']),
    body('ativo').optional().isBoolean(),
  ],
  validate,
  asyncHandler(ctrl.editar)
);
router.delete('/:id', param('id').isUUID(), validate, asyncHandler(ctrl.remover));

export default router;
