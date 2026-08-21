import { Wrench } from 'lucide-react';

export function LandingFooter() {
  return (
    <footer className="bg-slate-950 border-t border-white/10 py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2.5">
          <div className="bg-slate-800 p-2 rounded-lg">
            <Wrench className="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <p className="font-display font-semibold text-white text-sm">Oficina</p>
            <p className="text-xs text-slate-500">Gestão de oficina mecânica</p>
          </div>
        </div>

        <nav className="flex items-center gap-6 text-sm text-slate-400">
          <a href="#recursos" className="hover:text-white transition-colors">
            Recursos
          </a>
          <a href="#fluxo" className="hover:text-white transition-colors">
            Como funciona
          </a>
          <a href="#entrar" className="hover:text-white transition-colors">
            Entrar
          </a>
        </nav>

        <p className="text-xs text-slate-500">
          Feito com React, TypeScript e Tailwind CSS. &copy; 2026 Oficina.
        </p>
      </div>
    </footer>
  );
}
