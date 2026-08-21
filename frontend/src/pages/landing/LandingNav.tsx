import { useEffect, useState } from 'react';
import { Wrench } from 'lucide-react';

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-colors duration-300 ${
        scrolled ? 'bg-slate-900/90 backdrop-blur border-b border-white/10' : 'bg-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <a href="#" className="flex items-center gap-2.5">
          <div className="bg-slate-800 p-2 rounded-lg">
            <Wrench className="w-5 h-5 text-amber-500" />
          </div>
          <span className="font-display font-bold text-white text-lg">Oficina</span>
        </a>

        <nav className="hidden sm:flex items-center gap-8 text-sm font-medium text-slate-300">
          <a href="#recursos" className="hover:text-white transition-colors">
            Recursos
          </a>
          <a href="#fluxo" className="hover:text-white transition-colors">
            Como funciona
          </a>
        </nav>

        <a
          href="#entrar"
          className="inline-flex items-center rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-amber-400 transition-colors"
        >
          Entrar
        </a>
      </div>
    </header>
  );
}
