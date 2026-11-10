import React from 'react';
import { Booking, Court } from '../../types/tennis';
import { formatDateBR, formatSlotLabel, formatCurrency, formatPhone } from '../../utils/dateUtils';
import { CheckCircle2, Share2, Printer, X, Calendar, Clock, MapPin, User, Phone, Sparkles } from 'lucide-react';

interface ReceiptModalProps {
  booking: Booking;
  court?: Court;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  booking,
  court,
  onClose,
}) => {
  const shareOnWhatsApp = () => {
    const text = encodeURIComponent(
      `🎾 *Agendamento Confirmado no AceCourt!* 🎾\n\n` +
      `*Quadra:* ${booking.courtName}\n` +
      `*Data:* ${formatDateBR(booking.date)}\n` +
      `*Horário:* ${formatSlotLabel(booking.startHour, booking.endHour)}\n` +
      `*Atleta:* ${booking.clientName}\n` +
      `*Código:* #${booking.id.slice(-6).toUpperCase()}\n\n` +
      `Nos vemos na quadra! 🏆`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-slate-100 overflow-hidden">
        {/* Glow decoration */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-20 bg-lime-500/20 blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Ticket Badge */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-tr from-lime-500 to-emerald-400 flex items-center justify-center text-slate-950 shadow-lg shadow-lime-500/30">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-lime-400/10 text-lime-400 text-xs font-semibold border border-lime-400/20">
            <Sparkles className="w-3.5 h-3.5" />
            Agendamento Confirmado
          </span>
          <h3 className="text-xl font-bold mt-2 text-white">Comprovante de Reserva</h3>
          <p className="text-xs text-slate-400">Apresente este voucher na recepção do clube</p>
        </div>

        {/* Voucher Card */}
        <div className="bg-slate-950/80 rounded-2xl border border-slate-800 p-4 space-y-3.5 relative">
          <div className="flex items-start justify-between border-b border-slate-800/80 pb-3">
            <div>
              <p className="text-xs text-slate-400">Quadra</p>
              <h4 className="font-bold text-base text-lime-400">{booking.courtName}</h4>
              {court && (
                <p className="text-xs text-slate-400 capitalize">
                  {court.surface} • {court.isIndoor ? 'Coberta' : 'Aberta'}
                </p>
              )}
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 font-mono">Código</span>
              <p className="font-mono font-bold text-sm text-slate-200">
                #{booking.id.slice(-6).toUpperCase()}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <Calendar className="w-4 h-4 text-lime-400 shrink-0" />
              <div>
                <p className="text-slate-500 text-[10px]">Data</p>
                <p className="font-semibold">{formatDateBR(booking.date)}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-slate-300">
              <Clock className="w-4 h-4 text-lime-400 shrink-0" />
              <div>
                <p className="text-slate-500 text-[10px]">Horário (1 hora)</p>
                <p className="font-semibold">{formatSlotLabel(booking.startHour, booking.endHour)}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-slate-300">
              <User className="w-4 h-4 text-lime-400 shrink-0" />
              <div>
                <p className="text-slate-500 text-[10px]">Atleta</p>
                <p className="font-semibold truncate max-w-[120px]">{booking.clientName}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-slate-300">
              <Phone className="w-4 h-4 text-lime-400 shrink-0" />
              <div>
                <p className="text-slate-500 text-[10px]">Telefone</p>
                <p className="font-semibold">{formatPhone(booking.clientPhone)}</p>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-500">Valor da Locação</span>
              <p className="text-lg font-extrabold text-white">
                {formatCurrency(booking.totalPrice)}
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-500">Status</span>
              <div className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Confirmado
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-5 grid grid-cols-2 gap-2.5">
          <button
            onClick={shareOnWhatsApp}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/20 transition-colors"
          >
            <Share2 className="w-4 h-4" />
            <span>Enviar no WhatsApp</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir / Salvar</span>
          </button>
        </div>

        <button
          onClick={onClose}
          className="mt-3 w-full py-2 text-center text-xs text-slate-400 hover:text-white transition-colors"
        >
          Concluir e Voltar
        </button>
      </div>
    </div>
  );
};
