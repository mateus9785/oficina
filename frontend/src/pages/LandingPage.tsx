import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';
import { LandingNav } from './landing/LandingNav';
import { Hero } from './landing/Hero';
import { AuthCard } from './landing/AuthCard';
import { FeatureHighlightStrip } from './landing/FeatureHighlightStrip';
import { FeatureBentoGrid } from './landing/FeatureBentoGrid';
import { KanbanFlow } from './landing/KanbanFlow';
import { FinalCTA } from './landing/FinalCTA';
import { LandingFooter } from './landing/LandingFooter';

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

  function irParaCadastro() {
    trocarModo('signup');
    document.getElementById('entrar')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <LandingNav />

      <Hero>
        <AuthCard
          modo={modo}
          trocarModo={trocarModo}
          erro={erro}
          loading={loading}
          email={email}
          setEmail={setEmail}
          senha={senha}
          setSenha={setSenha}
          handleLogin={handleLogin}
          nome={nome}
          setNome={setNome}
          emailCadastro={emailCadastro}
          setEmailCadastro={setEmailCadastro}
          senhaCadastro={senhaCadastro}
          setSenhaCadastro={setSenhaCadastro}
          confirmarSenha={confirmarSenha}
          setConfirmarSenha={setConfirmarSenha}
          handleSignup={handleSignup}
        />
      </Hero>

      <FeatureHighlightStrip />
      <FeatureBentoGrid />
      <KanbanFlow />
      <FinalCTA onCtaClick={irParaCadastro} />
      <LandingFooter />
    </div>
  );
}
