import { Router } from 'express';
import { body, param } from 'express-validator';
import * as ctrl from '../controllers/financeiro.controller';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();
router.use(requireAuth);

const bodyRules = [
  body('tipo').isIn(['receita', 'despesa']),
  body('categoria').isIn(['ordem_servico','venda_peca','compra_peca','aluguel','salario','energia','agua','internet','manutencao','outros']),
  body('descricao').optional({ checkFalsy: true }).trim(),
  body('valor').isFloat({ min: 0.01 }),
  body('dataVencimento').isISO8601(),
  body('status').optional().isIn(['pendente','pago','atrasado']),
];

router.get('/', asyncHandler(ctrl.listar));
router.post('/', bodyRules, validate, asyncHandler(ctrl.criar));
router.get('/:id', param('id').isUUID(), validate, asyncHandler(ctrl.buscar));
router.put('/:id', [param('id').isUUID(), ...bodyRules], validate, asyncHandler(ctrl.editar));
router.delete('/:id', param('id').isUUID(), validate, asyncHandler(ctrl.remover));
router.patch('/:id/pagar', param('id').isUUID(), validate, asyncHandler(ctrl.pagar));

export default router;
