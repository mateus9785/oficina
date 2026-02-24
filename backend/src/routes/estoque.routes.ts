import { Router } from 'express';
import { body, param } from 'express-validator';
import * as ctrl from '../controllers/estoque.controller';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();
router.use(requireAuth);

const criarRules = [
  body('nome').trim().notEmpty(),
  body('categoria').isIn(['motor','freio','suspensao','eletrica','filtro','oleo','transmissao','carroceria','acessorio','outros']),
  body('marca').optional().trim(),
  body('estoqueMinimo').optional().isInt({ min: 0 }),
  body('localizacao').optional().trim(),
];

const editarRules = [
  body('nome').trim().notEmpty(),
  body('categoria').isIn(['motor','freio','suspensao','eletrica','filtro','oleo','transmissao','carroceria','acessorio','outros']),
  body('marca').optional().trim(),
  body('quantidade').isInt({ min: 0 }),
  body('estoqueMinimo').optional().isInt({ min: 0 }),
  body('precoCompra').isFloat({ min: 0 }),
  body('precoVenda').isFloat({ min: 0 }),
  body('localizacao').optional().trim(),
];

router.get('/', asyncHandler(ctrl.listar));
router.post('/', criarRules, validate, asyncHandler(ctrl.criar));
router.get('/alertas', asyncHandler(ctrl.alertasEstoque));
router.get('/:id', param('id').isUUID(), validate, asyncHandler(ctrl.buscar));
router.put('/:id', [param('id').isUUID(), ...editarRules], validate, asyncHandler(ctrl.editar));
router.delete('/:id', param('id').isUUID(), validate, asyncHandler(ctrl.remover));
router.post(
  '/:id/historico-preco',
  [
    param('id').isUUID(),
    body('preco').isFloat({ min: 0 }),
    body('fornecedor').optional().trim(),
  ],
  validate,
  asyncHandler(ctrl.adicionarHistoricoPreco)
);
router.post(
  '/:id/entrada',
  [
    param('id').isUUID(),
    body('quantidade').isInt({ min: 1 }),
    body('valorTotal').isFloat({ min: 0 }),
    body('precoCompra').isFloat({ min: 0 }),
    body('precoVenda').isFloat({ min: 0 }),
    body('fornecedor').optional().trim(),
  ],
  validate,
  asyncHandler(ctrl.darEntrada)
);

export default router;
