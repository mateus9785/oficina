import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Cake, Clock, X, AlertTriangle, Package } from 'lucide-react';
import { useNotificacoesStore } from '../../stores/useNotificacoesStore';
import { formatCurrency, formatDate } from '../../lib/formatters';
import { STATUS_OS_LABELS, STATUS_OS_COLORS } from '../../types';
import { Badge } from '../ui/Badge';

export function NotificacoesBell() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { aniversariantes, ordensProximas, contasAlerta, estoqueBaixo, loading, fetchNotificacoes, total } = useNotificacoesStore();

  useEffect(() => {
    fetchNotificacoes();
    const interval = setInterval(fetchNotificacoes, 5 * 60 * 1000); // refresh every 5 min
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const count = total();


  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label="Notificações"
      >
        <Bell size={20} className="text-gray-600" />
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100">
            <span className="font-semibold text-gray-900 text-sm">Notificações</span>
            <button onClick={() => setOpen(false)} className="p-1 hover:bg-gray-100 rounded">
              <X size={16} className="text-gray-500" />
            </button>
          </div>

          {loading && (
            <div className="px-4 py-6 text-center text-sm text-gray-400">Carregando...</div>
          )}

          {!loading && count === 0 && (
            <div className="px-4 py-8 text-center">
              <Bell size={32} className="mx-auto text-gray-300 mb-2" />
              <p className="text-sm text-gray-400">Nenhuma notificação</p>
            </div>
          )}

          {!loading && count > 0 && (
            <div className="max-h-[480px] overflow-y-auto">
              {/* Aniversariantes */}
              {aniversariantes.length > 0 && (
                <div>
                  <div className="px-3 py-1.5 bg-blue-50 border-b border-blue-100">
                    <p className="text-[11px] font-semibold text-blue-700 uppercase tracking-wide flex items-center gap-1">
                      <Cake size={11} /> Aniversariantes de hoje
                    </p>
                  </div>
                  {aniversariantes.map((a) => (
                    <button
                      key={a.id}
                      className="w-full text-left px-3 py-1.5 hover:bg-gray-50 border-b border-gray-100 transition-colors flex items-center justify-between gap-2"
                      onClick={() => { navigate(`/clientes/${a.id}`); setOpen(false); }}
                    >
                      <span className="text-sm font-medium text-gray-900 truncate">{a.nome}</span>
                      {a.telefone && <span className="text-xs text-gray-400 shrink-0">{a.telefone}</span>}
                    </button>
                  ))}
                </div>
              )}

              {/* Contas vencidas / vencem hoje */}
              {contasAlerta.length > 0 && (
                <div>
                  <div className="px-3 py-1.5 bg-red-50 border-b border-red-100">
                    <p className="text-[11px] font-semibold text-red-700 uppercase tracking-wide flex items-center gap-1">
                      <AlertTriangle size={11} /> Contas vencidas / vencem hoje
                    </p>
                  </div>
                  {contasAlerta.map((c) => (
                    <button
                      key={c.id}
                      className="w-full text-left px-3 py-1.5 hover:bg-gray-50 border-b border-gray-100 transition-colors flex items-center gap-2"
                      onClick={() => { navigate('/financeiro'); setOpen(false); }}
                    >
                      <span className="text-sm text-gray-900 truncate flex-1">{c.descricao}</span>
                      <span className={`text-xs font-semibold shrink-0 ${c.diasAtraso === 0 ? 'text-orange-600' : 'text-red-600'}`}>
                        {c.diasAtraso === 0 ? 'Vence hoje' : `${c.diasAtraso} dia${c.diasAtraso > 1 ? 's' : ''}`}
                      </span>
                      <span className={`text-sm font-semibold shrink-0 ${c.tipo === 'receita' ? 'text-green-600' : 'text-red-600'}`}>
                        {c.tipo === 'receita' ? '+' : '-'}{formatCurrency(c.valor)}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Estoque baixo */}
              {estoqueBaixo.length > 0 && (
                <div>
                  <div className="px-3 py-1.5 bg-yellow-50 border-b border-yellow-100">
                    <p className="text-[11px] font-semibold text-yellow-700 uppercase tracking-wide flex items-center gap-1">
                      <Package size={11} /> Estoque baixo
                    </p>
                  </div>
                  {estoqueBaixo.map((p) => (
                    <button
                      key={p.id}
                      className="w-full text-left px-3 py-1.5 hover:bg-gray-50 border-b border-gray-100 transition-colors flex items-center gap-2"
                      onClick={() => { navigate(`/estoque/${p.id}`); setOpen(false); }}
                    >
                      <span className="text-sm text-gray-900 truncate flex-1">{p.nome}</span>
                      {p.marca && <span className="text-xs text-gray-400 shrink-0">{p.marca}</span>}
                      <span className="text-xs font-semibold text-yellow-700 bg-yellow-100 rounded px-1.5 py-0.5 shrink-0">
                        {p.quantidade}/{p.estoqueMinimo}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* OS com entrega próxima */}
              {ordensProximas.length > 0 && (
                <div>
                  <div className="px-3 py-1.5 bg-orange-50 border-b border-orange-100">
                    <p className="text-[11px] font-semibold text-orange-700 uppercase tracking-wide flex items-center gap-1">
                      <Clock size={11} /> Entregas próximas
                    </p>
                  </div>
                  {ordensProximas.map((o) => (
                    <button
                      key={o.id}
                      className="w-full text-left px-3 py-1.5 hover:bg-gray-50 border-b border-gray-100 transition-colors flex items-center gap-2"
                      onClick={() => { navigate(`/ordens/${o.id}`); setOpen(false); }}
                    >
                      <span className="text-xs font-semibold text-gray-500 shrink-0">{o.placa}</span>
                      <span className="text-sm text-gray-900 truncate flex-1">{o.veiculo}</span>
                      <span className={`text-xs font-semibold shrink-0 ${o.diasUteis === 0 ? 'text-red-600' : o.diasUteis <= 1 ? 'text-orange-600' : 'text-yellow-600'}`}>
                        {o.diasUteis === 0 ? 'Hoje!' : `${o.diasUteis} dia${o.diasUteis > 1 ? 's' : ''} útil${o.diasUteis > 1 ? 'eis' : ''}`}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
