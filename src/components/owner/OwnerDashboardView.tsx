import React from 'react';
import { useTennis } from '../../context/TennisContext';
import { 
  formatCurrency, 
  formatDateBR, 
  formatSlotLabel, 
  formatPhone, 
  getTodayDateString 
} from '../../utils/dateUtils';
import { 
  DollarSign, 
  CalendarCheck, 
  Clock, 
  Award, 
  Users, 
  PlusCircle, 
  FileText, 
  CheckCircle, 
  ChevronRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

interface OwnerDashboardViewProps {
  onNavigateTab: (tabId: string) => void;
  onOpenAddCourtModal: () => void;
}

export const OwnerDashboardView: React.FC<OwnerDashboardViewProps> = ({
  onNavigateTab,
  onOpenAddCourtModal,
}) => {
  const { courts, bookings, completeBooking, cancelBooking } = useTennis();
  const today = getTodayDateString();

  // Financial calculations
  const nonCancelledBookings = bookings.filter(b => b.status !== 'cancelled' && b.status !== 'blocked');
  const totalRevenue = nonCancelledBookings.reduce((sum, b) => sum + b.totalPrice, 0);

  const todayBookings = bookings.filter(b => b.date === today);
  const todayActive = todayBookings.filter(b => b.status === 'confirmed' || b.status === 'completed');
  const todayRevenue = todayActive.reduce((sum, b) => sum + b.totalPrice, 0);

  // Approximate occupancy rate for today
  const activeCourts = courts.filter(c => c.isActive);
  const totalDailySlotsAvailable = activeCourts.reduce((sum, c) => sum + (c.closeHour - c.openHour), 0);
  const occupancyRate = totalDailySlotsAvailable > 0
    ? Math.round((todayActive.length / totalDailySlotsAvailable) * 100)
    : 0;

  const totalClients = new Set(bookings.map(b => b.clientPhone)).size;

  return (
    <div className="space-y-6">
      {/* Top Welcome / Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl">
        <div>
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
            Painel de Controle
          </span>
          <h2 className="text-2xl font-black text-white mt-1">
            Gestão do Clube AceCourt
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Visão consolidada de receitas, ocupação e reservas em tempo real para hoje, {formatDateBR(today)}.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenAddCourtModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/20 transition-all active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Nova Quadra</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab('reports')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition-colors"
          >
            <FileText className="w-4 h-4 text-amber-400" />
            <span>Relatórios</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Receita Total</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-white mt-2">
            {formatCurrency(totalRevenue)}
          </p>
          <span className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1 font-medium">
            <TrendingUp className="w-3 h-3" />
            {nonCancelledBookings.length} horas faturadas
          </span>
        </div>

        {/* Today's Revenue */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Receita Hoje</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-amber-400 mt-2">
            {formatCurrency(todayRevenue)}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {todayActive.length} locações agendadas
          </span>
        </div>

        {/* Occupancy Rate */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Taxa de Ocupação</span>
            <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-white mt-2">
            {occupancyRate}%
          </p>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-sky-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(occupancyRate, 100)}%` }}
            />
          </div>
        </div>

        {/* Courts / Clients */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Quadras Ativas</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-white mt-2">
            {activeCourts.length} <span className="text-xs font-normal text-slate-400">de {courts.length}</span>
          </p>
          <span className="text-[11px] text-purple-300 mt-1 block">
            {totalClients} atletas cadastrados
          </span>
        </div>
      </div>

      {/* Today's Schedule Timeline */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <CalendarCheck className="w-5 h-5 text-amber-400" />
              <span>Programação de Hoje ({formatDateBR(today)})</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Locações marcadas para o dia de hoje em todas as quadras.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigateTab('schedule')}
            className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1"
          >
            <span>Ver grade completa</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {todayBookings.length === 0 ? (
          <div className="p-6 text-center bg-slate-950/60 rounded-2xl border border-slate-800">
            <p className="text-xs text-slate-400">Nenhum agendamento marcado para hoje ainda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {todayBookings.map(b => (
              <div
                key={b.id}
                className={`p-4 rounded-2xl border transition-all ${
                  b.status === 'blocked'
                    ? 'bg-amber-950/20 border-amber-900/40'
                    : b.status === 'cancelled'
                    ? 'bg-slate-950/40 border-slate-800 opacity-60'
                    : 'bg-slate-950/80 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-amber-400">
                    {formatSlotLabel(b.startHour, b.endHour)}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    b.status === 'confirmed'
                      ? 'bg-lime-400/20 text-lime-300'
                      : b.status === 'completed'
                      ? 'bg-blue-400/20 text-blue-300'
                      : b.status === 'blocked'
                      ? 'bg-amber-400/20 text-amber-300'
                      : 'bg-red-500/20 text-red-300'
                  }`}>
                    {b.status === 'confirmed'
                      ? 'Confirmado'
                      : b.status === 'completed'
                      ? 'Concluído'
                      : b.status === 'blocked'
                      ? 'Bloqueio'
                      : 'Cancelado'}
                  </span>
                </div>

                <h4 className="font-bold text-sm text-white mt-1">{b.courtName}</h4>

                <div className="mt-2 text-xs text-slate-300 space-y-0.5">
                  <p className="font-semibold">{b.clientName}</p>
                  {b.status !== 'blocked' && (
                    <p className="text-[11px] text-slate-400">{formatPhone(b.clientPhone)}</p>
                  )}
                  {b.blockedReason && (
                    <p className="text-[11px] text-amber-300 italic">Motivo: {b.blockedReason}</p>
                  )}
                </div>

                {b.status === 'confirmed' && (
                  <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-xs font-bold text-white">
                      {formatCurrency(b.totalPrice)}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => completeBooking(b.id)}
                        className="px-2 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[10px] font-bold"
                      >
                        Concluir
                      </button>
                      <button
                        type="button"
                        onClick={() => cancelBooking(b.id, 'Cancelado pelo proprietário')}
                        className="px-2 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 text-[10px] font-bold"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
