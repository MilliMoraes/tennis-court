import React, { useState } from 'react';
import { useTennis } from '../../context/TennisContext';
import { Lock, ShieldCheck, KeyRound, AlertCircle, Sparkles, Mail, CheckCircle2 } from 'lucide-react';

export const OwnerLoginView: React.FC = () => {
  const { loginOwner } = useTennis();
  const [email, setEmail] = useState<string>('admin@tenisclub.com');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      const res = loginOwner(password);
      if (!res.success) {
        setError(res.message);
      }
      setIsLoading(false);
    }, 400);
  };

  const handleQuickDemoLogin = () => {
    setPassword('admin123');
    setError(null);
    loginOwner('admin123');
  };

  return (
    <div className="min-h-[600px] flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-1/2 translate-x-1/2 w-48 h-32 bg-amber-500/10 blur-3xl pointer-events-none" />

        {/* Lock Icon */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20">
            <Lock className="w-8 h-8" />
          </div>
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/30">
            Acesso Restrito
          </span>
          <h2 className="text-2xl font-black text-white mt-2">Painel do Proprietário</h2>
          <p className="text-xs text-slate-400 mt-1">
            Gestão de quadras, controle de agenda e relatórios financeiros
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              E-mail Administrativo
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@tenisclub.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
              />
              <Mail className="absolute right-3.5 top-3 w-4 h-4 text-slate-500 pointer-events-none" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-300">
                Senha de Acesso
              </label>
              <span className="text-[10px] text-amber-400/80">
                Padrão: <strong>admin123</strong>
              </span>
            </div>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={e => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="Digite sua senha"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
              />
              <KeyRound className="absolute right-3.5 top-3 w-4 h-4 text-slate-500 pointer-events-none" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 active:scale-98"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{isLoading ? 'Autenticando...' : 'Acessar Painel Administrativo'}</span>
          </button>
        </form>

        {/* 1-Click Demo Login */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 text-center">
          <p className="text-xs text-slate-400 mb-2">Para testar rapidamente a aplicação:</p>
          <button
            type="button"
            onClick={handleQuickDemoLogin}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-lime-400 text-xs font-bold border border-slate-700 flex items-center justify-center gap-2 transition-colors"
          >
            <Sparkles className="w-4 h-4 text-lime-400" />
            <span>Entrar com 1 Clique (Demo Proprietário)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
