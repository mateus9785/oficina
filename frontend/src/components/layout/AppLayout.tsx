import { useEffect, useRef, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Menu, KeyRound, LogOut, ChevronDown, Settings } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { NotificacoesBell } from './NotificacoesBell';
import { MudarSenhaModal } from '../auth/MudarSenhaModal';
import { useAuthStore } from '../../stores/useAuthStore';

export function AppLayout() {
  const navigate = useNavigate();
  const { logout, usuario, fetchMe } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mudarSenhaOpen, setMudarSenhaOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!usuario) fetchMe();
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="h-12 border-b border-gray-200 bg-white flex items-center justify-between px-4 shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100"
          >
            <Menu size={20} />
          </button>

          <div className="ml-auto flex items-center gap-1">
            <NotificacoesBell />

            {/* User menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen((v) => !v)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {usuario?.nome?.charAt(0).toUpperCase() ?? '?'}
                </div>
                <span className="hidden sm:block text-sm font-medium text-gray-700 max-w-[120px] truncate">
                  {usuario?.nome}
                </span>
                <ChevronDown size={14} className="text-gray-400 hidden sm:block" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-10 w-52 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden">
                  {usuario && (
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900 truncate">{usuario.nome}</p>
                      <p className="text-xs text-gray-500 truncate">{usuario.email}</p>
                    </div>
                  )}
                  <button
                    onClick={() => { setMudarSenhaOpen(true); setUserMenuOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <KeyRound size={16} className="text-gray-400" />
                    Mudar senha
                  </button>
                  {usuario?.role === 'admin' && (
                    <button
                      onClick={() => { navigate('/configuracoes'); setUserMenuOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Settings size={16} className="text-gray-400" />
                      Configurações
                    </button>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={16} />
                    Sair
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>

      <MudarSenhaModal isOpen={mudarSenhaOpen} onClose={() => setMudarSenhaOpen(false)} />
    </div>
  );
}
