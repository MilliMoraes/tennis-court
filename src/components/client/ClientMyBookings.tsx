import React, { useState, useMemo } from 'react';
import { useTennis } from '../../context/TennisContext';
import { Booking } from '../../types/tennis';
import { 
  formatDateBR, 
  formatSlotLabel, 
  formatCurrency, 
  formatPhone, 
  cleanPhone, 
  isValidPhone,
  getTodayDateString 
} from '../../utils/dateUtils';
import { ReceiptModal } from '../shared/ReceiptModal';
import { 
  Search, 
  Calendar, 
  Clock, 
  Phone, 
  XCircle, 
  Ticket, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

interface ClientMyBookingsProps {
  onNavigateToBooking: () => void;
}

export const ClientMyBookings: React.FC<ClientMyBookingsProps> = ({
  onNavigateToBooking,
}) => {
  const { bookings, courts, cancelBooking, clientProfile, setClientProfile } = useTennis();

  // Initial phone from remembered profile, or sample Carlos Silva `(11) 98765-4321` for instant demo
  const [phoneSearch, setPhoneSearch] = useState<string>(
    clientProfile?.phone || '(11) 98765-4321'
  );
  const [selectedBookingForReceipt, setSelectedBookingForReceipt] = useState<Booking | null>(null);
  const [cancelModalBooking, setCancelModalBooking] = useState<Booking | null>(null);
  const [cancelReason, setCancelReason] = useState<string>('');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const cleanSearchDigits = cleanPhone(phoneSearch);

  // Filter bookings for this client
  const clientBookings = useMemo(() => {
    if (!cleanSearchDigits || cleanSearchDigits.length < 8) return [];
    return bookings.filter(b => cleanPhone(b.clientPhone).includes(cleanSearchDigits));
  }, [bookings, cleanSearchDigits]);

  const today = getTodayDateString();

  const upcomingBookings = useMemo(() => {
    return clientBookings.filter(b => b.date >= today && b.status === 'confirmed');
  }, [clientBookings, today]);

  const pastOrCancelledBookings = useMemo(() => {
    return clientBookings.filter(b => b.date < today || b.status !== 'confirmed');
  }, [clientBookings, today]);

  const handlePhoneInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setPhoneSearch(formatted);
  };

  const handleConfirmCancel = () => {
    if (!cancelModalBooking) return;
    const res = cancelBooking(cancelModalBooking.id, cancelReason);
    if (res.success) {
      setActionNotice('Agendamento cancelado com sucesso. O horário foi liberado para outros atletas.');
      setCancelModalBooking(null);
      setCancelReason('');
      setTimeout(() => setActionNotice(null), 5000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-lime-400/10 text-lime-400 text-xs font-semibold border border-lime-400/20 mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              Consulta Rápida por Telefone
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              Meus Agendamentos
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Informe o número de telefone informado na reserva para visualizar ou cancelar seus horários.
            </p>
          </div>

          {/* Quick Demo Phone button */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500">Exemplo para teste:</span>
            <button
              type="button"
              onClick={() => setPhoneSearch('(11) 98765-4321')}
              className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-lime-400 border border-slate-700"
            >
              (11) 98765-4321
            </button>
          </div>
        </div>

        {/* Input bar */}
        <div className="mt-5 relative max-w-md">
          <input
            type="tel"
            maxLength={15}
            value={phoneSearch}
            onChange={handlePhoneInputChange}
            placeholder="Digite seu celular com DDD (XX) XXXXX-XXXX"
            className="w-full bg-slate-950 border border-slate-700 rounded-2xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400"
          />
          <Phone className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
        </div>
      </div>

      {actionNotice && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Bookings View */}
      {cleanSearchDigits.length < 8 ? (
        <div className="p-8 text-center bg-slate-900/40 border border-slate-800/80 rounded-3xl">
          <Search className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="font-bold text-white text-base">Digite seu número de telefone</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Seus agendamentos ativos e históricos serão carregados automaticamente.
          </p>
        </div>
      ) : clientBookings.length === 0 ? (
        <div className="p-8 text-center bg-slate-900/40 border border-slate-800/80 rounded-3xl">
          <Calendar className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="font-bold text-white text-base">Nenhum agendamento encontrado</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Não encontramos reservas para o telefone <strong className="text-slate-200">{phoneSearch}</strong>.
          </p>
          <button
            type="button"
            onClick={onNavigateToBooking}
            className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-lime-400 text-slate-950 text-xs font-bold shadow-lg shadow-lime-500/20 hover:bg-lime-300 transition-colors"
          >
            <span>Reservar uma Quadra Agora</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Active / Upcoming Bookings */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-lime-400" />
                <span>Agendamentos Próximos ({upcomingBookings.length})</span>
              </h3>
            </div>

            {upcomingBookings.length === 0 ? (
              <p className="text-xs text-slate-500 italic p-3 bg-slate-900/30 rounded-xl">
                Você não possui agendamentos futuros confirmados.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {upcomingBookings.map(b => (
                  <div
                    key={b.id}
                    className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg relative overflow-hidden flex flex-col justify-between"
                  >
                    <div className="flex items-start justify-between border-b border-slate-800/80 pb-3">
                      <div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-lime-400/20 text-lime-300 border border-lime-400/30">
                          Confirmado
                        </span>
                        <h4 className="text-base font-extrabold text-white mt-1.5">
                          {b.courtName}
                        </h4>
                      </div>
                      <span className="text-xs font-mono font-bold text-slate-400">
                        #{b.id.slice(-6).toUpperCase()}
                      </span>
                    </div>

                    <div className="py-3 grid grid-cols-2 gap-3 text-xs">
                      <div className="flex items-center gap-2 text-slate-300">
                        <Calendar className="w-4 h-4 text-lime-400 shrink-0" />
                        <div>
                          <p className="text-[10px] text-slate-500">Data</p>
                          <p className="font-semibold">{formatDateBR(b.date)}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-slate-300">
                        <Clock className="w-4 h-4 text-lime-400 shrink-0" />
                        <div>
                          <p className="text-[10px] text-slate-500">Horário</p>
                          <p className="font-semibold">{formatSlotLabel(b.startHour, b.endHour)}</p>
                        </div>
                      </div>
                    </div>

                    {b.notes && (
                      <p className="text-[11px] text-slate-400 italic bg-slate-950/60 p-2 rounded-lg mb-3">
                        Obs: {b.notes}
                      </p>
                    )}

                    <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                      <span className="text-sm font-bold text-white">
                        {formatCurrency(b.totalPrice)}
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedBookingForReceipt(b)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-lime-400 text-xs font-semibold border border-slate-700 transition-colors"
                        >
                          <Ticket className="w-3.5 h-3.5" />
                          <span>Voucher</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setCancelModalBooking(b)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold border border-red-500/30 transition-colors"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Cancelar</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Past / Cancelled History */}
          {pastOrCancelledBookings.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                Histórico Anterior ({pastOrCancelledBookings.length})
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {pastOrCancelledBookings.map(b => (
                  <div
                    key={b.id}
                    className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between opacity-80"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.2 rounded ${
                          b.status === 'completed'
                            ? 'bg-blue-500/20 text-blue-300'
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {b.status === 'completed' ? 'Concluído' : 'Cancelado'}
                        </span>
                        <h4 className="text-xs font-bold text-slate-300">{b.courtName}</h4>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        {formatDateBR(b.date)} • {formatSlotLabel(b.startHour, b.endHour)}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedBookingForReceipt(b)}
                      className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                      title="Ver detalhes"
                    >
                      <Ticket className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {cancelModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-slate-100">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mb-4">
              <AlertCircle className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-white">Cancelar Agendamento?</h3>
            <p className="text-xs text-slate-400 mt-1">
              Você está prestes a cancelar a reserva da <strong className="text-slate-200">{cancelModalBooking.courtName}</strong> em <strong className="text-slate-200">{formatDateBR(cancelModalBooking.date)}</strong> às <strong className="text-slate-200">{formatSlotLabel(cancelModalBooking.startHour, cancelModalBooking.endHour)}</strong>.
            </p>

            <div className="mt-4">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Motivo do cancelamento (opcional):
              </label>
              <input
                type="text"
                placeholder="Ex: Imprevisto de trabalho, chuva, etc."
                value={cancelReason}
                onChange={e => setCancelReason(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-400"
              />
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setCancelModalBooking(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/20 transition-colors"
              >
                Confirmar Cancelamento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Voucher modal */}
      {selectedBookingForReceipt && (
        <ReceiptModal
          booking={selectedBookingForReceipt}
          court={courts.find(c => c.id === selectedBookingForReceipt.courtId)}
          onClose={() => setSelectedBookingForReceipt(null)}
        />
      )}
    </div>
  );
};
