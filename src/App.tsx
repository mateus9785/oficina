import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardPage } from './pages/DashboardPage';
import { ClientesPage } from './pages/ClientesPage';
import { ClienteDetalhePage } from './pages/ClienteDetalhePage';
import { VeiculoDetalhePage } from './pages/VeiculoDetalhePage';
import { KanbanPage } from './pages/KanbanPage';
import { OrdemServicoDetalhePage } from './pages/OrdemServicoDetalhePage';
import { EstoquePage } from './pages/EstoquePage';
import { PecaDetalhePage } from './pages/PecaDetalhePage';
import { FinanceiroPage } from './pages/FinanceiroPage';
import { RelatoriosPage } from './pages/RelatoriosPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/clientes" element={<ClientesPage />} />
          <Route path="/clientes/:id" element={<ClienteDetalhePage />} />
          <Route path="/veiculos/:id" element={<VeiculoDetalhePage />} />
          <Route path="/ordens" element={<KanbanPage />} />
          <Route path="/ordens/:id" element={<OrdemServicoDetalhePage />} />
          <Route path="/estoque" element={<EstoquePage />} />
          <Route path="/estoque/:id" element={<PecaDetalhePage />} />
          <Route path="/financeiro" element={<FinanceiroPage />} />
          <Route path="/relatorios" element={<RelatoriosPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
