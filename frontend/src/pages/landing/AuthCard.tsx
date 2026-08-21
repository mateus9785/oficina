import type { FormEvent } from 'react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

type Modo = 'login' | 'signup';

interface AuthCardProps {
  modo: Modo;
  trocarModo: (modo: Modo) => void;
  erro: string | null;
  loading: boolean;

  email: string;
  setEmail: (v: string) => void;
  senha: string;
  setSenha: (v: string) => void;
  handleLogin: (e: FormEvent) => void;

  nome: string;
  setNome: (v: string) => void;
  emailCadastro: string;
  setEmailCadastro: (v: string) => void;
  senhaCadastro: string;
  setSenhaCadastro: (v: string) => void;
  confirmarSenha: string;
  setConfirmarSenha: (v: string) => void;
  handleSignup: (e: FormEvent) => void;
}

export function AuthCard({
  modo,
  trocarModo,
  erro,
  loading,
  email,
  setEmail,
  senha,
  setSenha,
  handleLogin,
  nome,
  setNome,
  emailCadastro,
  setEmailCadastro,
  senhaCadastro,
  setSenhaCadastro,
  confirmarSenha,
  setConfirmarSenha,
  handleSignup,
}: AuthCardProps) {
  return (
    <div
      id="entrar"
      className="w-full bg-white/95 backdrop-blur border border-white/40 shadow-2xl shadow-slate-900/20 rounded-2xl p-6 sm:p-8 scroll-mt-24"
    >
      <div className="flex rounded-lg bg-gray-100 p-1 mb-6">
        <button
          type="button"
          onClick={() => trocarModo('login')}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer ${
            modo === 'login' ? 'bg-white text-slate-900 shadow-sm' : 'text-gray-500'
          }`}
        >
          Entrar
        </button>
        <button
          type="button"
          onClick={() => trocarModo('signup')}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer ${
            modo === 'signup' ? 'bg-white text-slate-900 shadow-sm' : 'text-gray-500'
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
          <Button
            type="submit"
            disabled={loading}
            className="w-full !bg-amber-500 !text-slate-900 hover:!bg-amber-400 focus:!ring-amber-500"
          >
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
          <Button
            type="submit"
            disabled={loading}
            className="w-full !bg-amber-500 !text-slate-900 hover:!bg-amber-400 focus:!ring-amber-500"
          >
            {loading ? 'Criando conta...' : 'Criar conta'}
          </Button>
        </form>
      )}
    </div>
  );
}
