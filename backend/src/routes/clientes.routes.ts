import { Router } from 'express';
import { body, param } from 'express-validator';
import * as ctrl from '../controllers/clientes.controller';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();
router.use(requireAuth);

const bodyRules = [
  body('nome').trim().notEmpty().withMessage('Nome obrigatório.'),
  body('cpfCnpj').optional({ checkFalsy: true }).trim(),
  body('telefone').optional().trim(),
  body('email').optional({ checkFalsy: true }).isEmail().withMessage('Email inválido.'),
  body('endereco').optional().trim(),
  body('observacoes').optional().trim(),
];

router.get('/', asyncHandler(ctrl.listar));
router.get('/check-cpf', asyncHandler(ctrl.verificarCpf));
router.post('/', bodyRules, validate, asyncHandler(ctrl.criar));
router.get('/:id', param('id').isUUID(), validate, asyncHandler(ctrl.buscar));
router.put('/:id', param('id').isUUID(), bodyRules, validate, asyncHandler(ctrl.editar));
router.delete('/:id', param('id').isUUID(), validate, asyncHandler(ctrl.remover));
router.get('/:id/veiculos', param('id').isUUID(), validate, asyncHandler(ctrl.veiculosDoCliente));

export default router;
