import React, { useState, useMemo } from 'react';
import { useTennis } from '../../context/TennisContext';
import { Court, Booking } from '../../types/tennis';
import { 
  getUpcomingDays, 
  getTodayDateString, 
  formatDateBR, 
  formatCurrency, 
  formatSlotLabel, 
  formatPhone, 
  cleanPhone, 
  isValidPhone,
  SURFACE_LABELS 
} from '../../utils/dateUtils';
import { ReceiptModal } from '../shared/ReceiptModal';
import confetti from 'canvas-confetti';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Sparkles, 
  ShieldAlert, 
  Info, 
  Phone, 
  User, 
  ChevronRight,
  Sun,
  Flame,
  Check
} from 'lucide-react';

export const ClientBookingView: React.FC<{ onNavigateToBookings?: () => void }> = ({
  onNavigateToBookings,
}) => {
  const {
    courts,
    bookings,
    addBooking,
    getClientBookingsCountForDay,
    clientProfile,
  } = useTennis();

  const upcomingDays = useMemo(() => getUpcomingDays(14), []);
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
  const [selectedCourtId, setSelectedCourtId] = useState<string>(courts[0]?.id || '');
  const [selectedHour, setSelectedHour] = useState<number | null>(null);

  // Client form fields (no login required!)
  const [clientName, setClientName] = useState<string>(clientProfile?.name || '');
  const [clientPhone, setClientPhone] = useState<string>(clientProfile?.phone || '');
  const [notes, setNotes] = useState<string>('');

  // UI state
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successBooking, setSuccessBooking] = useState<Booking | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Selected Court object
  const activeCourts = courts.filter(c => c.isActive);
  const currentCourt = courts.find(c => c.id === selectedCourtId) || activeCourts[0];

  // Live daily booking limit count for entered phone
  const dailyBookingsCount = useMemo(() => {
    if (!clientPhone || cleanPhone(clientPhone).length < 10) return 0;
    return getClientBookingsCountForDay(clientPhone, selectedDate);
  }, [clientPhone, selectedDate, getClientBookingsCountForDay, bookings]);

  const isLimitReached = dailyBookingsCount >= 2;

  // Generate available slots for the selected court
  const slots = useMemo(() => {
    if (!currentCourt) return [];
    const open = currentCourt.openHour;
    const close = currentCourt.closeHour;
    const list = [];

    for (let h = open; h < close; h++) {
      // Find booking for this court, date and hour
      const booking = bookings.find(
        b => b.courtId === currentCourt.id &&
             b.date === selectedDate &&
             b.startHour === h &&
             b.status !== 'cancelled'
      );

      const isOccupied = !!booking;
      const isBlocked = booking?.status === 'blocked';

      list.push({
        hour: h,
        label: formatSlotLabel(h, h + 1),
        isOccupied,
        isBlocked,
        booking,
      });
    }

    return list;
  }, [currentCourt, selectedDate, bookings]);

  // Handle phone input with mask
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setClientPhone(formatted);
    if (errorMessage) setErrorMessage(null);
  };

  const handleSubmitBooking = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!selectedCourtId || !currentCourt) {
      setErrorMessage('Por favor, selecione uma quadra.');
      return;
    }

    if (selectedHour === null) {
      setErrorMessage('Por favor, selecione um horário disponível.');
      return;
    }

    if (!clientName.trim() || clientName.trim().length < 3) {
      setErrorMessage('Por favor, digite seu nome completo.');
      return;
    }

    if (!isValidPhone(clientPhone)) {
      setErrorMessage('Por favor, informe um telefone celular válido com DDD.');
      return;
    }

    if (isLimitReached) {
      setErrorMessage(
        `Limite diário atingido! Você já possui ${dailyBookingsCount} agendamentos no dia ${formatDateBR(selectedDate)}. O clube permite no máximo 2 horas por dia por atleta.`
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const res = addBooking({
        courtId: currentCourt.id,
        clientName,
        clientPhone,
        date: selectedDate,
        startHour: selectedHour,
        notes,
      });

      if (!res.success) {
        setErrorMessage(res.message);
        setIsSubmitting(false);
        return;
      }

      // Celebrate!
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#a3e635', '#22c55e', '#38bdf8', '#fbbf24'],
        });
      } catch {
        // Confetti fallback
      }

      setSuccessBooking(res.booking || null);
      setSelectedHour(null);
      setNotes('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Banner / Instructions */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-emerald-950/40 border border-slate-800 p-5 sm:p-6 shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-lime-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-lime-400/10 text-lime-400 text-xs font-semibold border border-lime-400/20 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Agendamento Instantâneo sem Login
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Reserve sua Quadra de Tênis
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
              Escolha a data, quadra e o bloco de 1 hora desejado. Informe apenas seu nome e telefone para confirmar a reserva.
            </p>
          </div>

          {/* Rule Badge */}
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-3.5 flex items-start gap-3 shrink-0 md:max-w-xs">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
              <Flame className="w-4 h-4" />
            </div>
            <div className="text-xs">
              <p className="font-bold text-slate-200">Regra do Clube</p>
              <p className="text-slate-400 text-[11px] mt-0.5">
                Limite de <strong className="text-lime-400">até 2 agendamentos por dia</strong> por atleta para garantir rotatividade.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* STEP 1: Date Selector (Horizontal scrollable calendar pills) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-lime-400" />
            <span>1. Selecione a Data</span>
          </label>
          <span className="text-xs text-lime-400 font-semibold">
            {formatDateBR(selectedDate)}
          </span>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 pt-1 no-scrollbar -mx-1 px-1">
          {upcomingDays.map(day => {
            const isSelected = selectedDate === day.iso;
            return (
              <button
                key={day.iso}
                type="button"
                onClick={() => {
                  setSelectedDate(day.iso);
                  setSelectedHour(null);
                  setErrorMessage(null);
                }}
                className={`flex flex-col items-center justify-center min-w-[70px] sm:min-w-[84px] py-3 px-2 rounded-2xl border transition-all duration-200 shrink-0 ${
                  isSelected
                    ? 'bg-lime-400 text-slate-950 border-lime-400 font-bold shadow-lg shadow-lime-500/20 scale-102'
                    : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:border-slate-700 hover:bg-slate-800/60'
                }`}
              >
                <span className={`text-[11px] font-semibold uppercase ${isSelected ? 'text-slate-900' : 'text-slate-400'}`}>
                  {day.dayName}
                </span>
                <span className="text-lg sm:text-xl font-extrabold mt-0.5">
                  {day.dayNumber}
                </span>
                <span className={`text-[9px] mt-0.5 font-medium px-1.5 py-0.2 rounded-full ${
                  isSelected ? 'bg-slate-950/20 text-slate-950' : 'text-slate-500'
                }`}>
                  {day.label === 'Hoje' ? 'Hoje' : day.label === 'Amanhã' ? 'Amanhã' : 'Disponível'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* STEP 2: Court Selector */}
      <div className="space-y-3">
        <label className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <Sun className="w-4 h-4 text-lime-400" />
          <span>2. Escolha a Quadra</span>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {courts.map(court => {
            const isSelected = selectedCourtId === court.id;
            const surfaceInfo = SURFACE_LABELS[court.surface] || SURFACE_LABELS.saibro;

            return (
              <button
                key={court.id}
                type="button"
                disabled={!court.isActive}
                onClick={() => {
                  if (court.isActive) {
                    setSelectedCourtId(court.id);
                    setSelectedHour(null);
                    setErrorMessage(null);
                  }
                }}
                className={`relative text-left rounded-2xl p-3.5 border transition-all duration-200 overflow-hidden flex flex-col justify-between ${
                  !court.isActive
                    ? 'opacity-50 cursor-not-allowed bg-slate-900/40 border-slate-800'
                    : isSelected
                    ? 'bg-slate-900 border-lime-400 ring-2 ring-lime-400/40 shadow-xl shadow-lime-500/10'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-800/70'
                }`}
              >
                {/* Court Thumbnail Image */}
                <div className="relative h-28 w-full rounded-xl overflow-hidden mb-3 bg-slate-950">
                  <img
                    src={court.imageUrl}
                    alt={court.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                  {/* Surface Badge */}
                  <span className={`absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-md border ${surfaceInfo.badge}`}>
                    {surfaceInfo.label}
                  </span>

                  {court.isIndoor && (
                    <span className="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-500/30 text-purple-300 border border-purple-500/40">
                      Coberta
                    </span>
                  )}

                  {!court.isActive && (
                    <div className="absolute inset-0 bg-slate-950/80 flex items-center justify-center">
                      <span className="text-xs font-bold text-red-400 bg-red-950/80 px-2.5 py-1 rounded-lg border border-red-800">
                        Manutenção
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-white truncate max-w-[170px]">
                      {court.name}
                    </h3>
                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-lime-400 text-slate-950 flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                    {court.description}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">
                    {court.hasLighting ? '💡 Iluminação LED' : '☀️ Luz Natural'}
                  </span>
                  <span className="text-sm font-extrabold text-lime-400">
                    {formatCurrency(court.hourlyPrice)}
                    <span className="text-[10px] text-slate-400 font-normal">/h</span>
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* STEP 3: Available 1-Hour Time Slots */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <label className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Clock className="w-4 h-4 text-lime-400" />
            <span>3. Selecione o Horário (Blocos de 1h)</span>
          </label>

          {/* Slots Legend */}
          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-lime-400" />
              Disponível
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
              Ocupado
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              Bloqueado
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
          {slots.map(slot => {
            const isSelected = selectedHour === slot.hour;

            if (slot.isBlocked) {
              return (
                <div
                  key={slot.hour}
                  className="p-2.5 rounded-xl bg-amber-950/20 border border-amber-900/40 text-amber-400/70 text-center cursor-not-allowed select-none"
                  title={slot.booking?.blockedReason || 'Horário reservado para manutenção do clube'}
                >
                  <p className="font-bold text-xs">{slot.label.split(' às ')[0]}</p>
                  <span className="text-[9px] block text-amber-500 font-semibold mt-0.5">
                    Bloqueado
                  </span>
                </div>
              );
            }

            if (slot.isOccupied) {
              return (
                <div
                  key={slot.hour}
                  className="p-2.5 rounded-xl bg-slate-900/40 border border-slate-800 text-slate-600 text-center cursor-not-allowed select-none"
                  title="Horário já reservado por outro cliente"
                >
                  <p className="font-semibold text-xs text-slate-500">{slot.label.split(' às ')[0]}</p>
                  <span className="text-[9px] block text-slate-600 font-medium mt-0.5">
                    Ocupado
                  </span>
                </div>
              );
            }

            return (
              <button
                key={slot.hour}
                type="button"
                onClick={() => {
                  setSelectedHour(slot.hour);
                  setErrorMessage(null);
                }}
                className={`p-2.5 rounded-xl border text-center transition-all duration-200 ${
                  isSelected
                    ? 'bg-lime-400 text-slate-950 border-lime-400 font-bold shadow-lg shadow-lime-500/20 scale-102 ring-2 ring-lime-300'
                    : 'bg-slate-900/90 hover:bg-slate-800 text-slate-200 border-slate-800 hover:border-lime-500/40'
                }`}
              >
                <p className="font-bold text-xs">{slot.label.split(' às ')[0]}</p>
                <span className={`text-[9px] block mt-0.5 font-semibold ${
                  isSelected ? 'text-slate-950' : 'text-lime-400'
                }`}>
                  Livre
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* STEP 4: Client Info Form & Validation */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-4 mb-5">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <User className="w-5 h-5 text-lime-400" />
              4. Identificação do Atleta (Sem Login Necessário)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Informe apenas seu nome e telefone para reserva imediata e envio do comprovante.
            </p>
          </div>

          {/* Daily Limit Tracker Pill */}
          {cleanPhone(clientPhone).length >= 10 && (
            <div className={`px-3 py-1.5 rounded-xl border text-xs flex items-center gap-2 ${
              isLimitReached
                ? 'bg-red-500/10 border-red-500/30 text-red-400'
                : 'bg-lime-500/10 border-lime-500/30 text-lime-300'
            }`}>
              {isLimitReached ? (
                <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
              ) : (
                <CheckCircle className="w-4 h-4 text-lime-400 shrink-0" />
              )}
              <span>
                Agendamentos hoje ({formatDateBR(selectedDate)}):{' '}
                <strong className={isLimitReached ? 'text-red-300' : 'text-lime-300'}>
                  {dailyBookingsCount} de 2
                </strong>
              </span>
            </div>
          )}
        </div>

        {/* Warning if limit reached */}
        {isLimitReached && (
          <div className="mb-5 p-4 rounded-2xl bg-red-950/40 border border-red-500/40 text-red-200 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-bold text-sm text-red-300">
                Limite diário de 2 agendamentos atingido!
              </p>
              <p className="text-red-200/90">
                O atleta com telefone <strong>{clientPhone}</strong> já possui <strong>2 agendamentos</strong> para o dia <strong>{formatDateBR(selectedDate)}</strong>.
              </p>
              <p className="text-red-300/80">
                Pelo regulamento do AceCourt, cada jogador pode agendar no máximo 2 horas por dia para garantir a disponibilidade de quadras a todos.
              </p>
              {onNavigateToBookings && (
                <button
                  type="button"
                  onClick={onNavigateToBookings}
                  className="mt-2 text-xs font-semibold text-white underline hover:text-red-200 block"
                >
                  Consultar ou gerenciar meus agendamentos existentes →
                </button>
              )}
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="mb-5 p-3.5 rounded-2xl bg-red-900/30 border border-red-500/40 text-red-300 text-xs flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmitBooking} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Nome Completo *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Ex: Carlos Eduardo da Silva"
                  value={clientName}
                  onChange={e => {
                    setClientName(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400 transition-colors"
                />
                <User className="absolute right-3.5 top-3 w-4 h-4 text-slate-500 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Telefone / WhatsApp com DDD *
              </label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  maxLength={15}
                  placeholder="(11) 98765-4321"
                  value={clientPhone}
                  onChange={handlePhoneChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400 transition-colors"
                />
                <Phone className="absolute right-3.5 top-3 w-4 h-4 text-slate-500 pointer-events-none" />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Usado para identificar seus agendamentos e enviar confirmação.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Observações (Opcional)
            </label>
            <input
              type="text"
              placeholder="Ex: Jogo de simples, trazer raquete extra, etc."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400 transition-colors"
            />
          </div>

          {/* Booking Summary Box */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                Resumo da Reserva
              </span>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-slate-200">
                <span className="font-bold text-lime-400">
                  {currentCourt?.name || 'Selecione a quadra'}
                </span>
                <span>•</span>
                <span>{formatDateBR(selectedDate)}</span>
                <span>•</span>
                <span>
                  {selectedHour !== null
                    ? formatSlotLabel(selectedHour, selectedHour + 1)
                    : 'Horário não selecionado'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-[10px] text-slate-400">Total</span>
                <p className="text-xl font-extrabold text-white">
                  {formatCurrency(currentCourt?.hourlyPrice || 0)}
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || isLimitReached || selectedHour === null}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm shadow-lg transition-all duration-200 ${
                  isSubmitting || isLimitReached || selectedHour === null
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed shadow-none'
                    : 'bg-lime-400 hover:bg-lime-300 text-slate-950 shadow-lime-500/20 active:scale-98'
                }`}
              >
                <span>Confirmar Agendamento</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Success Receipt Modal */}
      {successBooking && (
        <ReceiptModal
          booking={successBooking}
          court={courts.find(c => c.id === successBooking.courtId)}
          onClose={() => setSuccessBooking(null)}
        />
      )}
    </div>
  );
};
