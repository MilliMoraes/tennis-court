import React from 'react';
import { useTennis } from '../../context/TennisContext';
import { 
  Smartphone, 
  Monitor, 
  RotateCcw, 
  UserCheck, 
  ShieldCheck, 
  LogOut,
  CalendarCheck
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    currentRole,
    setCurrentRole,
    isOwnerLoggedIn,
    logoutOwner,
    isMobilePreview,
    setIsMobilePreview,
    resetToDefaultData,
    bookings,
  } = useTennis();

  const handleRoleChange = (role: 'client' | 'owner') => {
    setCurrentRole(role);
  };

  const handleReset = () => {
    if (window.confirm('Deseja restaurar os dados originais de demonstração (quadras e agendamentos)?')) {
      resetToDefaultData();
    }
  };

  const activeBookingsCount = bookings.filter(b => b.status === 'confirmed').length;

  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-lime-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-lime-500/20 text-slate-950 font-black text-xl tracking-tighter">
            🎾
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-lime-300 bg-clip-text text-transparent">
                AceCourt
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-lime-400/20 text-lime-300 border border-lime-400/30 uppercase tracking-wider">
                Tênis Club
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Locação de Quadras & Gestão Esportiva
            </p>
          </div>
        </div>

        {/* Center / Role Switcher Tabs */}
        <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800 shadow-inner">
          <button
            type="button"
            onClick={() => handleRoleChange('client')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
              currentRole === 'client'
                ? 'bg-lime-400 text-slate-950 shadow-md shadow-lime-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Área do Cliente</span>
            <span className="hidden md:inline text-[10px] font-normal opacity-80">(Sem Login)</span>
          </button>

          <button
            type="button"
            onClick={() => handleRoleChange('owner')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
              currentRole === 'owner'
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Área do Proprietário</span>
            {isOwnerLoggedIn && (
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" title="Sessão ativa" />
            )}
          </button>
        </div>

        {/* Right Tools: View frame toggle, Demo reset, Logout */}
        <div className="flex items-center gap-2">
          {/* Mobile frame toggle (User requested Flutter app format) */}
          <button
            type="button"
            onClick={() => setIsMobilePreview(prev => !prev)}
            title={isMobilePreview ? 'Modo Tela Cheia' : 'Modo Simulador Flutter Mobile'}
            className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white transition-colors"
          >
            {isMobilePreview ? (
              <>
                <Monitor className="w-3.5 h-3.5 text-lime-400" />
                <span className="hidden sm:inline">Desktop</span>
              </>
            ) : (
              <>
                <Smartphone className="w-3.5 h-3.5 text-lime-400" />
                <span className="hidden sm:inline">Simulador Mobile</span>
              </>
            )}
          </button>

          {/* Reset Demo Data */}
          <button
            type="button"
            onClick={handleReset}
            title="Restaurar dados de teste"
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Logout if owner is logged in */}
          {currentRole === 'owner' && isOwnerLoggedIn && (
            <button
              type="button"
              onClick={logoutOwner}
              className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition-colors"
              title="Sair do painel do proprietário"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
