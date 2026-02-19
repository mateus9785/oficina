import { useState, useRef, useEffect } from 'react';
import { Menu, LogOut, KeyRound, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/useAuthStore';
import { MudarSenhaModal } from '../auth/MudarSenhaModal';

interface TopBarProps {
  onMenuClick: () => void;
}

export function TopBar({ onMenuClick }: TopBarProps) {
  const navigate = useNavigate();
  const { logout, usuario } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mudarSenhaOpen, setMudarSenhaOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
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
    <>
      <header className="h-16 border-b border-gray-200 bg-white flex items-center justify-between px-4 lg:px-6">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-lg hover:bg-gray-100 lg:hidden"
        >
          <Menu size={20} />
        </button>

        <div className="ml-auto relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 text-sm text-gray-700"
          >
            <span className="hidden sm:block font-medium">{usuario?.nome}</span>
            <ChevronDown size={16} className="text-gray-400" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-1">
              <button
                onClick={() => { setMenuOpen(false); setMudarSenhaOpen(true); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
              >
                <KeyRound size={16} className="text-gray-400" />
                Mudar senha
              </button>
              <div className="border-t border-gray-100 my-1" />
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
              >
                <LogOut size={16} />
                Sair
              </button>
            </div>
          )}
        </div>
      </header>

      <MudarSenhaModal isOpen={mudarSenhaOpen} onClose={() => setMudarSenhaOpen(false)} />
    </>
  );
}
