import React, { useState, useMemo } from 'react';
import { useTennis } from '../../context/TennisContext';
import { Booking, BookingStatus } from '../../types/tennis';
import { 
  formatCurrency, 
  formatDateBR, 
  formatSlotLabel, 
  formatPhone, 
  getTodayDateString 
} from '../../utils/dateUtils';
import { ReceiptModal } from '../shared/ReceiptModal';
import { 
  FileText, 
  Download, 
  Printer, 
  Filter, 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  Clock, 
  Users, 
  CheckCircle, 
  XCircle, 
  Search,
  Sparkles,
  Award
} from 'lucide-react';

export const OwnerReportsView: React.FC = () => {
  const { courts, bookings, completeBooking, cancelBooking } = useTennis();

  // Filters
  const [periodFilter, setPeriodFilter] = useState<'today' | '7days' | '30days' | 'all' | 'custom'>('all');
  const [customStart, setCustomStart] = useState<string>('');
  const [customEnd, setCustomEnd] = useState<string>('');
  const [courtFilter, setCourtFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedReceiptBooking, setSelectedReceiptBooking] = useState<Booking | null>(null);

  const today = getTodayDateString();

  // Filtered bookings
  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      // Status filter
      if (statusFilter !== 'all' && b.status !== statusFilter) return false;

      // Court filter
      if (courtFilter !== 'all' && b.courtId !== courtFilter) return false;

      // Search query (client name or phone)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = b.clientName.toLowerCase().includes(q);
        const matchPhone = b.clientPhone.includes(q);
        const matchCourt = b.courtName.toLowerCase().includes(q);
        if (!matchName && !matchPhone && !matchCourt) return false;
      }

      // Period filter
      if (periodFilter === 'today') {
        return b.date === today;
      } else if (periodFilter === '7days') {
        const d = new Date();
        d.setDate(d.getDate() - 7);
        const sevenDaysAgo = d.toISOString().split('T')[0];
        return b.date >= sevenDaysAgo;
      } else if (periodFilter === '30days') {
        const d = new Date();
        d.setDate(d.getDate() - 30);
        const thirtyDaysAgo = d.toISOString().split('T')[0];
        return b.date >= thirtyDaysAgo;
      } else if (periodFilter === 'custom') {
        if (customStart && b.date < customStart) return false;
        if (customEnd && b.date > customEnd) return false;
        return true;
      }

      return true; // 'all'
    });
  }, [bookings, periodFilter, customStart, customEnd, courtFilter, statusFilter, searchQuery, today]);

  // Aggregate Metrics
  const validBookings = filteredBookings.filter(b => b.status !== 'cancelled' && b.status !== 'blocked');
  const totalRevenue = validBookings.reduce((sum, b) => sum + b.totalPrice, 0);
  const totalHours = validBookings.length;
  const averageTicket = validBookings.length > 0 ? Math.round(totalRevenue / validBookings.length) : 0;
  
  const cancelledCount = filteredBookings.filter(b => b.status === 'cancelled').length;
  const cancellationRate = filteredBookings.length > 0
    ? Math.round((cancelledCount / filteredBookings.length) * 100)
    : 0;

  // Revenue & bookings by Court
  const courtBreakdown = useMemo(() => {
    return courts.map(court => {
      const courtBookings = validBookings.filter(b => b.courtId === court.id);
      const revenue = courtBookings.reduce((sum, b) => sum + b.totalPrice, 0);
      const share = totalRevenue > 0 ? Math.round((revenue / totalRevenue) * 100) : 0;
      return {
        id: court.id,
        name: court.name,
        surface: court.surface,
        bookingsCount: courtBookings.length,
        revenue,
        share,
      };
    }).sort((a, b) => b.revenue - a.revenue);
  }, [courts, validBookings, totalRevenue]);

  // Top clients ranking
  const topClients = useMemo(() => {
    const clientMap = new Map<string, { name: string; phone: string; count: number; spent: number }>();

    validBookings.forEach(b => {
      const key = b.clientPhone;
      const current = clientMap.get(key) || { name: b.clientName, phone: b.clientPhone, count: 0, spent: 0 };
      current.count += 1;
      current.spent += b.totalPrice;
      clientMap.set(key, current);
    });

    return Array.from(clientMap.values())
      .sort((a, b) => b.spent - a.spent)
      .slice(0, 5);
  }, [validBookings]);

  // CSV Export
  const handleExportCSV = () => {
    const headers = [
      'ID Reserva',
      'Data',
      'Horario',
      'Quadra',
      'Cliente',
      'Telefone',
      'Valor (R$)',
      'Status',
      'Pagamento',
      'Observacoes',
    ];

    const rows = filteredBookings.map(b => [
      b.id,
      formatDateBR(b.date),
      formatSlotLabel(b.startHour, b.endHour),
      `"${b.courtName.replace(/"/g, '""')}"`,
      `"${b.clientName.replace(/"/g, '""')}"`,
      b.clientPhone,
      b.totalPrice.toFixed(2),
      b.status,
      b.paymentStatus,
      `"${(b.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      '\uFEFF' + // UTF-8 BOM for Excel compatibility
      [headers.join(';'), ...rows.map(r => r.join(';'))].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `relatorio_locacoes_acecourt_${today}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Title & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl">
        <div>
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
            Inteligência de Negócio
          </span>
          <h2 className="text-2xl font-black text-white mt-1">
            Relatório de Locações & Faturamento
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Análise detalhada de horários ocupados, receita gerada, cancelamentos e clientes mais ativos.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 transition-all active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Exportar CSV</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Faturamento no Período</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-white mt-2">
            {formatCurrency(totalRevenue)}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {validBookings.length} agendamentos faturados
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total de Horas Jogadas</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-amber-400 mt-2">
            {totalHours} horas
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Blocos de 1h confirmados
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Ticket Médio</span>
            <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-white mt-2">
            {formatCurrency(averageTicket)}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Média por hora alugada
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Taxa de Cancelamentos</span>
            <div className="w-8 h-8 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-white mt-2">
            {cancellationRate}%
          </p>
          <span className="text-[11px] text-red-400 mt-1 block">
            {cancelledCount} reservas canceladas
          </span>
        </div>
      </div>

      {/* Visual Analytics Grid: Courts Ranking & Top Clients */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Court Occupancy & Revenue Breakdown */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <span>Desempenho por Quadra</span>
          </h3>

          <div className="space-y-3.5">
            {courtBreakdown.map(c => (
              <div key={c.id} className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{c.name}</span>
                    <span className="text-[10px] text-slate-400 capitalize">({c.surface})</span>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-amber-400 mr-2">{formatCurrency(c.revenue)}</span>
                    <span className="text-slate-400">({c.bookingsCount} locações)</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-amber-400 to-lime-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${c.share}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Active Clients */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-400" />
            <span>Top Clientes Frequentes</span>
          </h3>

          {topClients.length === 0 ? (
            <p className="text-xs text-slate-500 italic">Nenhum dado no período.</p>
          ) : (
            <div className="space-y-3">
              {topClients.map((client, idx) => (
                <div key={idx} className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-amber-400/20 text-amber-300 font-bold text-xs flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div>
                      <h4 className="font-bold text-xs text-white truncate max-w-[130px]">{client.name}</h4>
                      <p className="text-[10px] text-slate-400">{formatPhone(client.phone)}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold text-emerald-400 block">{formatCurrency(client.spent)}</span>
                    <span className="text-[10px] text-slate-400">{client.count} reservas</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Filter className="w-4 h-4 text-amber-400" />
            <span>Filtros do Relatório ({filteredBookings.length} encontrados)</span>
          </h3>

          <div className="relative w-48 sm:w-64">
            <input
              type="text"
              placeholder="Buscar cliente ou quadra..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
            <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-500" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Period selector */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Período</label>
            <select
              value={periodFilter}
              onChange={e => setPeriodFilter(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
            >
              <option value="all">Todo o Histórico</option>
              <option value="today">Apenas Hoje</option>
              <option value="7days">Últimos 7 dias</option>
              <option value="30days">Últimos 30 dias</option>
              <option value="custom">Personalizado (Intervalo)</option>
            </select>
          </div>

          {/* Court selector */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Quadra</label>
            <select
              value={courtFilter}
              onChange={e => setCourtFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
            >
              <option value="all">Todas as Quadras</option>
              {courts.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Status selector */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
            >
              <option value="all">Todos os Status</option>
              <option value="confirmed">Confirmados</option>
              <option value="completed">Concluídos</option>
              <option value="cancelled">Cancelados</option>
              <option value="blocked">Bloqueios de Manutenção</option>
            </select>
          </div>
        </div>

        {/* Custom date range inputs */}
        {periodFilter === 'custom' && (
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-[10px] text-slate-500 mb-1">Data Inicial</label>
              <input
                type="date"
                value={customStart}
                onChange={e => setCustomStart(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-500 mb-1">Data Final</label>
              <input
                type="date"
                value={customEnd}
                onChange={e => setCustomEnd(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white"
              />
            </div>
          </div>
        )}
      </div>

      {/* Bookings Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Código</th>
                <th className="py-3 px-4">Data & Horário</th>
                <th className="py-3 px-4">Quadra</th>
                <th className="py-3 px-4">Cliente / Telefone</th>
                <th className="py-3 px-4">Valor</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 italic">
                    Nenhum agendamento atende aos filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredBookings.map(b => (
                  <tr key={b.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-400">
                      #{b.id.slice(-6).toUpperCase()}
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-white">{formatDateBR(b.date)}</p>
                      <p className="text-[11px] text-slate-400">{formatSlotLabel(b.startHour, b.endHour)}</p>
                    </td>

                    <td className="py-3.5 px-4 font-medium text-lime-300">
                      {b.courtName}
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-white">{b.clientName}</p>
                      <p className="text-[11px] text-slate-400">{formatPhone(b.clientPhone)}</p>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-white">
                      {formatCurrency(b.totalPrice)}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
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
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedReceiptBooking(b)}
                          className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px]"
                          title="Ver comprovante"
                        >
                          Voucher
                        </button>

                        {b.status === 'confirmed' && (
                          <>
                            <button
                              type="button"
                              onClick={() => completeBooking(b.id)}
                              className="px-2 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[11px] font-semibold"
                            >
                              Concluir
                            </button>
                            <button
                              type="button"
                              onClick={() => cancelBooking(b.id, 'Cancelado pelo proprietário')}
                              className="px-2 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 text-[11px] font-semibold"
                            >
                              Cancelar
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Voucher Modal */}
      {selectedReceiptBooking && (
        <ReceiptModal
          booking={selectedReceiptBooking}
          court={courts.find(c => c.id === selectedReceiptBooking.courtId)}
          onClose={() => setSelectedReceiptBooking(null)}
        />
      )}
    </div>
  );
};
