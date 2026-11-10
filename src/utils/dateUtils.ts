/**
 * Date and formatting utilities for AceCourt
 */

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount);
}

export function cleanPhone(phone: string): string {
  return phone.replace(/\D/g, '');
}

export function formatPhone(value: string): string {
  const digits = cleanPhone(value).slice(0, 11);
  if (digits.length <= 2) return digits.length > 0 ? `(${digits}` : '';
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}

export function isValidPhone(phone: string): boolean {
  const digits = cleanPhone(phone);
  return digits.length === 10 || digits.length === 11;
}

export function getTodayDateString(): string {
  const now = new Date();
  return formatDateToISO(now);
}

export function formatDateToISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseISODate(isoString: string): Date {
  const [year, month, day] = isoString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function formatDateBR(isoString: string): string {
  if (!isoString) return '';
  const [year, month, day] = isoString.split('-');
  return `${day}/${month}/${year}`;
}

export function formatRelativeDate(isoString: string): string {
  const today = getTodayDateString();
  const target = isoString;

  if (target === today) return 'Hoje';
  
  const todayDate = parseISODate(today);
  const targetDate = parseISODate(target);
  const diffDays = Math.round((targetDate.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 1) return 'Amanhã';
  if (diffDays === -1) return 'Ontem';

  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  
  const dayOfWeek = dayNames[targetDate.getDay()];
  const day = targetDate.getDate();
  const month = monthNames[targetDate.getMonth()];

  return `${dayOfWeek}, ${day} ${month}`;
}

export function formatHour(hour: number): string {
  return `${String(hour).padStart(2, '0')}:00`;
}

export function formatSlotLabel(startHour: number, endHour: number): string {
  return `${formatHour(startHour)} às ${formatHour(endHour)}`;
}

export function getUpcomingDays(count: number = 14): { iso: string; label: string; dayName: string; dayNumber: number }[] {
  const days = [];
  const base = new Date();
  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  for (let i = 0; i < count; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    const iso = formatDateToISO(d);
    
    let label = `${dayNames[d.getDay()]}, ${d.getDate()}`;
    if (i === 0) label = 'Hoje';
    else if (i === 1) label = 'Amanhã';

    days.push({
      iso,
      label,
      dayName: dayNames[d.getDay()],
      dayNumber: d.getDate(),
    });
  }

  return days;
}

export const SURFACE_LABELS: Record<string, { label: string; color: string; badge: string }> = {
  saibro: {
    label: 'Saibro (Clay)',
    color: '#d97706',
    badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  },
  rapida: {
    label: 'Rápida (Hard)',
    color: '#0284c7',
    badge: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
  },
  grama: {
    label: 'Grama Sintética',
    color: '#16a34a',
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  },
  coberta: {
    label: 'Coberta Premium',
    color: '#8b5cf6',
    badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  },
};
