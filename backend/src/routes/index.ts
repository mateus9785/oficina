import { Router } from 'express';
import authRoutes from './auth.routes';
import clientesRoutes from './clientes.routes';
import veiculosRoutes from './veiculos.routes';
import ordensRoutes from './ordens.routes';
import estoqueRoutes from './estoque.routes';
import financeiroRoutes from './financeiro.routes';
import usuariosRoutes from './usuarios.routes';
import relatoriosRoutes from './relatorios.routes';
import notificacoesRoutes from './notificacoes.routes';
import recorrentesRoutes from './recorrentes.routes';
import configuracoesRoutes from './configuracoes.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/clientes', clientesRoutes);
router.use('/veiculos', veiculosRoutes);
router.use('/ordens', ordensRoutes);
router.use('/estoque', estoqueRoutes);
router.use('/financeiro', financeiroRoutes);
router.use('/usuarios', usuariosRoutes);
router.use('/relatorios', relatoriosRoutes);
router.use('/notificacoes', notificacoesRoutes);
router.use('/recorrentes', recorrentesRoutes);
router.use('/configuracoes', configuracoesRoutes);

export default router;
