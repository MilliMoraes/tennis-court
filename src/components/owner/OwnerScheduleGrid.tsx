import React, { useState } from 'react';
import { useTennis } from '../../context/TennisContext';
import { Booking } from '../../types/tennis';
import { 
  formatDateBR, 
  formatSlotLabel, 
  formatHour, 
  getUpcomingDays, 
  getTodayDateString,
  formatCurrency,
  formatPhone
} from '../../utils/dateUtils';
import { 
  Calendar, 
  Clock, 
  ShieldAlert, 
  CheckCircle, 
  X, 
  Plus, 
  AlertCircle, 
  Unlock,
  Ticket
} from 'lucide-react';
import { ReceiptModal } from '../shared/ReceiptModal';

export const OwnerScheduleGrid: React.FC = () => {
  const { 
    courts, 
    bookings, 
    blockSlot, 
    unblockSlot, 
    cancelBooking, 
    completeBooking 
  } = useTennis();

  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
  const upcomingDays = getUpcomingDays(14);

  // Modals
  const [blockModalData, setBlockModalData] = useState<{ courtId: string; hour: number } | null>(null);
  const [blockReason, setBlockReason] = useState<string>('Manutenção do piso / Irrigação');
  const [selectedBookingDetails, setSelectedBookingDetails] = useState<Booking | null>(null);
  const [receiptBooking, setReceiptBooking] = useState<Booking | null>(null);

  // Time hours from min open to max close
  const minHour = Math.min(...courts.map(c => c.openHour), 6);
  const maxHour = Math.max(...courts.map(c => c.closeHour), 23);

  const hoursList = [];
  for (let h = minHour; h < maxHour; h++) {
    hoursList.push(h);
  }

  const handleConfirmBlock = () => {
    if (!blockModalData) return;
    blockSlot(blockModalData.courtId, selectedDate, blockModalData.hour, blockReason);
    setBlockModalData(null);
    setBlockReason('Manutenção do piso / Irrigação');
  };

  return (
    <div className="space-y-6">
      {/* Header & Date Scroller */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <Calendar className="w-6 h-6 text-amber-400" />
              <span>Grade Geral de Ocupação</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Visualize a grade de horários de todas as quadras. Clique em um horário livre para bloqueá-lo para manutenção ou torneios.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-300">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-emerald-500/20 border border-emerald-500/40" />
              Livre
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-lime-400/20 border border-lime-400/40" />
              Agendado
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-amber-500/30 border border-amber-500/50" />
              Bloqueado
            </span>
          </div>
        </div>

        {/* Date Selector */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {upcomingDays.map(day => {
            const isSelected = selectedDate === day.iso;
            return (
              <button
                key={day.iso}
                type="button"
                onClick={() => setSelectedDate(day.iso)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                  isSelected
                    ? 'bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <span>{day.label}</span>
                <span className="text-[10px] opacity-75">{formatDateBR(day.iso)}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid Matrix Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950/90 border-b border-slate-800 text-slate-300">
                <th className="py-3 px-3 text-left w-24 sticky left-0 bg-slate-950/95 z-10 font-bold uppercase text-[10px] tracking-wider text-slate-400">
                  Horário
                </th>
                {courts.map(court => (
                  <th key={court.id} className="py-3 px-3 text-left min-w-[180px] font-bold">
                    <div className="flex items-center justify-between">
                      <span className="text-white truncate">{court.name}</span>
                      <span className="text-[10px] text-amber-400 font-normal">
                        {formatCurrency(court.hourlyPrice)}/h
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {hoursList.map(hour => (
                <tr key={hour} className="hover:bg-slate-800/30 transition-colors">
                  {/* Hour label */}
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-400 sticky left-0 bg-slate-900/95 z-10 border-r border-slate-800/80">
                    {formatHour(hour)}
                  </td>

                  {/* Courts Columns */}
                  {courts.map(court => {
                    const isWithinHours = hour >= court.openHour && hour < court.closeHour;

                    if (!court.isActive) {
                      return (
                        <td key={court.id} className="p-1.5 bg-red-950/10 text-center text-[10px] text-red-400 italic">
                          Quadra em manutenção
                        </td>
                      );
                    }

                    if (!isWithinHours) {
                      return (
                        <td key={court.id} className="p-1.5 bg-slate-950/40 text-center text-[10px] text-slate-600">
                          Fechada
                        </td>
                      );
                    }

                    // Booking for this slot
                    const booking = bookings.find(
                      b => b.courtId === court.id &&
                           b.date === selectedDate &&
                           b.startHour === hour &&
                           b.status !== 'cancelled'
                    );

                    if (booking) {
                      if (booking.status === 'blocked') {
                        return (
                          <td key={court.id} className="p-1.5">
                            <button
                              type="button"
                              onClick={() => setSelectedBookingDetails(booking)}
                              className="w-full text-left p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 hover:bg-amber-500/25 transition-colors"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-[10px] text-amber-300">
                                  BLOQUEADO
                                </span>
                                <ShieldAlert className="w-3 h-3 text-amber-400" />
                              </div>
                              <p className="text-[10px] text-slate-300 truncate mt-0.5">
                                {booking.blockedReason || 'Manutenção'}
                              </p>
                            </button>
                          </td>
                        );
                      }

                      return (
                        <td key={court.id} className="p-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedBookingDetails(booking)}
                            className="w-full text-left p-2 rounded-xl bg-lime-500/15 border border-lime-500/30 hover:bg-lime-500/25 transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-[10px] text-lime-300 truncate max-w-[110px]">
                                {booking.clientName}
                              </span>
                              <span className="text-[9px] font-mono font-bold text-slate-400">
                                {formatCurrency(booking.totalPrice)}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400 truncate mt-0.5">
                              {formatPhone(booking.clientPhone)}
                            </p>
                          </button>
                        </td>
                      );
                    }

                    // Empty / Free slot
                    return (
                      <td key={court.id} className="p-1.5">
                        <button
                          type="button"
                          onClick={() => setBlockModalData({ courtId: court.id, hour })}
                          className="w-full py-2 px-2.5 rounded-xl border border-dashed border-slate-800 hover:border-amber-400/50 hover:bg-slate-800/40 text-slate-500 hover:text-amber-400 flex items-center justify-center gap-1 transition-all group"
                          title="Clique para bloquear ou reservar"
                        >
                          <span className="text-[10px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                            Bloquear
                          </span>
                          <Plus className="w-3 h-3" />
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Block Slot Modal */}
      {blockModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-white">Bloquear Horário na Grade</h3>
              <button
                type="button"
                onClick={() => setBlockModalData(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400 mb-4">
              Bloqueie este horário para impedir que clientes façam reservas públicas (ex: para irrigação, manutenção, aulas do clube ou torneio).
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Motivo do Bloqueio
                </label>
                <input
                  type="text"
                  value={blockReason}
                  onChange={e => setBlockReason(e.target.value)}
                  placeholder="Ex: Manutenção do saibro, Torneio Interno..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setBlockModalData(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmBlock}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950"
              >
                Confirmar Bloqueio
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Booking Details Modal */}
      {selectedBookingDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div>
                <span className="text-[10px] font-mono text-slate-400">
                  #{selectedBookingDetails.id.slice(-6).toUpperCase()}
                </span>
                <h3 className="font-bold text-base text-white">
                  {selectedBookingDetails.courtName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBookingDetails(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Data:</span>
                <span className="font-semibold text-white">{formatDateBR(selectedBookingDetails.date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Horário:</span>
                <span className="font-semibold text-white">
                  {formatSlotLabel(selectedBookingDetails.startHour, selectedBookingDetails.endHour)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Cliente / Solicitante:</span>
                <span className="font-semibold text-white">{selectedBookingDetails.clientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Telefone:</span>
                <span className="font-semibold text-white">{formatPhone(selectedBookingDetails.clientPhone)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Valor da Locação:</span>
                <span className="font-bold text-amber-400">{formatCurrency(selectedBookingDetails.totalPrice)}</span>
              </div>
              {selectedBookingDetails.blockedReason && (
                <div className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-900/50 text-amber-300">
                  <p className="font-bold text-[11px]">Motivo do bloqueio:</p>
                  <p className="text-[11px] mt-0.5">{selectedBookingDetails.blockedReason}</p>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
              {selectedBookingDetails.status === 'blocked' ? (
                <button
                  type="button"
                  onClick={() => {
                    unblockSlot(selectedBookingDetails.id);
                    setSelectedBookingDetails(null);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                >
                  <Unlock className="w-4 h-4" />
                  <span>Desbloquear Horário</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setReceiptBooking(selectedBookingDetails);
                      setSelectedBookingDetails(null);
                    }}
                    className="flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-lime-400 text-xs font-semibold"
                  >
                    <Ticket className="w-3.5 h-3.5" />
                    <span>Voucher</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      completeBooking(selectedBookingDetails.id);
                      setSelectedBookingDetails(null);
                    }}
                    className="px-3 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-semibold"
                  >
                    Concluir
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      cancelBooking(selectedBookingDetails.id, 'Cancelado pelo proprietário na grade');
                      setSelectedBookingDetails(null);
                    }}
                    className="px-3 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs font-semibold"
                  >
                    Cancelar
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={() => setSelectedBookingDetails(null)}
                className="px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {receiptBooking && (
        <ReceiptModal
          booking={receiptBooking}
          court={courts.find(c => c.id === receiptBooking.courtId)}
          onClose={() => setReceiptBooking(null)}
        />
      )}
    </div>
  );
};
