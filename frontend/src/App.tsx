import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

const LoginPage = lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })));
const DashboardPage = lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const ClientesPage = lazy(() => import('./pages/ClientesPage').then(m => ({ default: m.ClientesPage })));
const ClienteDetalhePage = lazy(() => import('./pages/ClienteDetalhePage').then(m => ({ default: m.ClienteDetalhePage })));
const VeiculosPage = lazy(() => import('./pages/VeiculosPage').then(m => ({ default: m.VeiculosPage })));
const VeiculoDetalhePage = lazy(() => import('./pages/VeiculoDetalhePage').then(m => ({ default: m.VeiculoDetalhePage })));
const KanbanPage = lazy(() => import('./pages/KanbanPage').then(m => ({ default: m.KanbanPage })));
const OrdemServicoDetalhePage = lazy(() => import('./pages/OrdemServicoDetalhePage').then(m => ({ default: m.OrdemServicoDetalhePage })));
const EstoquePage = lazy(() => import('./pages/EstoquePage').then(m => ({ default: m.EstoquePage })));
const PecaDetalhePage = lazy(() => import('./pages/PecaDetalhePage').then(m => ({ default: m.PecaDetalhePage })));
const FinanceiroPage = lazy(() => import('./pages/FinanceiroPage').then(m => ({ default: m.FinanceiroPage })));
const RelatoriosPage = lazy(() => import('./pages/RelatoriosPage').then(m => ({ default: m.RelatoriosPage })));
const NovaOrdemPage = lazy(() => import('./pages/NovaOrdemPage').then(m => ({ default: m.NovaOrdemPage })));
const EditarOrdemPage = lazy(() => import('./pages/EditarOrdemPage').then(m => ({ default: m.EditarOrdemPage })));
const ConfiguracoesPage = lazy(() => import('./pages/ConfiguracoesPage').then(m => ({ default: m.ConfiguracoesPage })));

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors />
      <Suspense fallback={null}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<DashboardPage />} />
            <Route path="/clientes" element={<ClientesPage />} />
            <Route path="/clientes/:id" element={<ClienteDetalhePage />} />
            <Route path="/veiculos" element={<VeiculosPage />} />
            <Route path="/veiculos/:id" element={<VeiculoDetalhePage />} />
            <Route path="/ordens" element={<KanbanPage />} />
            <Route path="/ordens/nova" element={<NovaOrdemPage />} />
            <Route path="/ordens/:id/editar" element={<EditarOrdemPage />} />
            <Route path="/ordens/:id" element={<OrdemServicoDetalhePage />} />
            <Route path="/estoque" element={<EstoquePage />} />
            <Route path="/estoque/:id" element={<PecaDetalhePage />} />
            <Route path="/financeiro" element={<FinanceiroPage />} />
            <Route path="/relatorios" element={<RelatoriosPage />} />
            <Route path="/configuracoes" element={<ConfiguracoesPage />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
