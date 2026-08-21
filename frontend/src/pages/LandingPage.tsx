import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';
import { Wrench, Users, ClipboardList, Package, Wallet, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';

const ETAPAS_KANBAN = [
  'Aguardando aprovação',
  'Aguardando peça',
  'Em execução',
  'Pronto pra retirada',
  'Finalizado',
];

const RECURSOS = [
  { icon: Users, texto: 'Clientes e veículos com histórico completo' },
  { icon: ClipboardList, texto: 'Ordens de serviço em quadro kanban' },
  { icon: Package, texto: 'Controle de estoque de peças com alerta de mínimo' },
  { icon: Wallet, texto: 'Financeiro com contas a receber automáticas ao finalizar uma OS' },
];

type Modo = 'login' | 'signup';

export function LandingPage() {
  const navigate = useNavigate();
  const { login, register, loading } = useAuthStore();
  const [modo, setModo] = useState<Modo>('login');
  const [erro, setErro] = useState<string | null>(null);

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const [nome, setNome] = useState('');
  const [emailCadastro, setEmailCadastro] = useState('');
  const [senhaCadastro, setSenhaCadastro] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  function trocarModo(novoModo: Modo) {
    setModo(novoModo);
    setErro(null);
  }

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setErro(null);
    try {
      await login(email, senha);
      navigate('/', { replace: true });
    } catch (err) {
      setErro((err as Error).message || 'Credenciais inválidas.');
    }
  }

  async function handleSignup(e: FormEvent) {
    e.preventDefault();
    setErro(null);
    if (senhaCadastro !== confirmarSenha) {
      setErro('As senhas não conferem.');
      return;
    }
    try {
      await register(nome, emailCadastro, senhaCadastro);
      navigate('/', { replace: true });
    } catch (err) {
      setErro((err as Error).message || 'Não foi possível criar a conta.');
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl grid md:grid-cols-2 gap-8 items-center">
        <div className="order-2 md:order-1">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-600 p-3 rounded-xl">
              <Wrench className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Oficina</h1>
              <p className="text-sm text-gray-500">Gestão de Oficina Mecânica</p>
            </div>
          </div>

          <p className="text-gray-600 mb-6">
            Sistema de gestão para oficina mecânica: clientes, veículos, ordens de serviço em um
            quadro kanban, controle de estoque de peças e um módulo financeiro que transforma uma
            ordem finalizada em conta a receber automaticamente.
          </p>

          <div className="flex flex-wrap gap-2 mb-6">
            {ETAPAS_KANBAN.map((etapa, i) => (
              <span
                key={etapa}
                className="text-xs font-medium px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100"
              >
                {i + 1}. {etapa}
              </span>
            ))}
          </div>

          <ul className="space-y-3 mb-6">
            {RECURSOS.map(({ icon: Icon, texto }) => (
              <li key={texto} className="flex items-start gap-2 text-sm text-gray-700">
                <Icon className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                {texto}
              </li>
            ))}
          </ul>

          <div className="flex items-start gap-2 text-sm text-gray-500 bg-white rounded-lg border border-gray-200 p-3">
            <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
            Este é um projeto de portfólio: crie uma conta gratuita e explore o sistema à vontade.
            Cada conta tem seus próprios dados, isolados dos demais visitantes.
          </div>
        </div>

        <Card className="order-1 md:order-2 p-8">
          <div className="flex rounded-lg bg-gray-100 p-1 mb-6">
            <button
              type="button"
              onClick={() => trocarModo('login')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                modo === 'login' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => trocarModo('signup')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                modo === 'signup' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
              }`}
            >
              Cadastrar
            </button>
          </div>

          {modo === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                placeholder="admin@oficina.com"
              />
              <Input
                label="Senha"
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                placeholder="••••••••"
              />
              {erro && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-700">
                  {erro}
                </div>
              )}
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleSignup} className="space-y-4">
              <Input
                label="Nome"
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                autoFocus
                placeholder="Seu nome"
              />
              <Input
                label="Email"
                type="email"
                value={emailCadastro}
                onChange={(e) => setEmailCadastro(e.target.value)}
                required
                placeholder="voce@exemplo.com"
              />
              <Input
                label="Senha"
                type="password"
                value={senhaCadastro}
                onChange={(e) => setSenhaCadastro(e.target.value)}
                required
                minLength={6}
                placeholder="Pelo menos 6 caracteres"
              />
              <Input
                label="Confirmar senha"
                type="password"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                required
                minLength={6}
                placeholder="••••••••"
              />
              {erro && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-700">
                  {erro}
                </div>
              )}
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Criando conta...' : 'Criar conta'}
              </Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
