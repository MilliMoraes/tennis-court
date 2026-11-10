export type SurfaceType = 'saibro' | 'rapida' | 'grama' | 'coberta';

export type BookingStatus = 'confirmed' | 'completed' | 'cancelled' | 'blocked';

export type PaymentStatus = 'pending' | 'paid';

export interface Court {
  id: string;
  name: string;
  surface: SurfaceType;
  hourlyPrice: number;
  isIndoor: boolean;
  hasLighting: boolean;
  imageUrl: string;
  description: string;
  isActive: boolean;
  openHour: number; // e.g. 6 (06:00)
  closeHour: number; // e.g. 23 (23:00)
}

export interface Booking {
  id: string;
  courtId: string;
  courtName: string;
  clientName: string;
  clientPhone: string;
  date: string; // ISO format 'YYYY-MM-DD'
  startHour: number; // e.g. 8 (means 08:00 - 09:00)
  endHour: number; // e.g. 9
  totalPrice: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
  notes?: string;
  blockedReason?: string; // If blocked by owner
}

export interface ClientProfile {
  name: string;
  phone: string;
}

export type UserRole = 'client' | 'owner';

export interface ReportFilter {
  dateRange: 'today' | '7days' | '30days' | 'all' | 'custom';
  startDate?: string;
  endDate?: string;
  courtId?: string;
  status?: BookingStatus | 'all';
}
