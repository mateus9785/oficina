import { Router } from 'express';
import { body, param } from 'express-validator';
import * as ctrl from '../controllers/veiculos.controller';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();
router.use(requireAuth);

const bodyRules = [
  body('clienteId').isUUID().withMessage('clienteId inválido.'),
  body('marca').optional().trim(),
  body('modelo').optional().trim(),
  body('ano').optional({ nullable: true }).isInt({ min: 1900, max: 2100 }),
  body('placa').trim().notEmpty().withMessage('Placa obrigatória.'),
  body('cor').optional().trim(),
  body('km').optional().isInt({ min: 0 }),
  body('observacoes').optional().trim(),
];

router.get('/', asyncHandler(ctrl.listar));
router.post('/', bodyRules, validate, asyncHandler(ctrl.criar));
router.get('/:id', param('id').isUUID(), validate, asyncHandler(ctrl.buscar));
router.put('/:id', param('id').isUUID(), bodyRules, validate, asyncHandler(ctrl.editar));
router.delete('/:id', param('id').isUUID(), validate, asyncHandler(ctrl.remover));

export default router;
