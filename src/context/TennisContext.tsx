import React, { createContext, useContext, useState, useEffect } from 'react';
import { Court, Booking, ClientProfile, UserRole } from '../types/tennis';
import { INITIAL_COURTS, generateInitialBookings } from '../data/mockData';
import { cleanPhone, formatDateBR } from '../utils/dateUtils';

interface AddBookingParams {
  courtId: string;
  clientName: string;
  clientPhone: string;
  date: string;
  startHour: number;
  notes?: string;
}

interface TennisContextType {
  courts: Court[];
  bookings: Booking[];
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  isOwnerLoggedIn: boolean;
  loginOwner: (password: string) => { success: boolean; message: string };
  logoutOwner: () => void;
  clientProfile: ClientProfile | null;
  setClientProfile: (profile: ClientProfile | null) => void;
  isMobilePreview: boolean;
  setIsMobilePreview: (val: boolean | ((prev: boolean) => boolean)) => void;
  
  // Booking operations
  addBooking: (params: AddBookingParams) => { success: boolean; message: string; booking?: Booking };
  cancelBooking: (bookingId: string, reason?: string) => { success: boolean; message: string };
  completeBooking: (bookingId: string) => void;
  getClientBookingsCountForDay: (phone: string, date: string) => number;
  isSlotAvailable: (courtId: string, date: string, hour: number) => boolean;
  getSlotBooking: (courtId: string, date: string, hour: number) => Booking | undefined;

  // Court operations (Owner)
  addCourt: (courtData: Omit<Court, 'id'>) => Court;
  updateCourt: (courtId: string, updates: Partial<Court>) => void;
  deleteCourt: (courtId: string) => { success: boolean; message: string };
  toggleCourtStatus: (courtId: string) => void;

  // Owner slot block
  blockSlot: (courtId: string, date: string, startHour: number, reason: string) => { success: boolean; message: string };
  unblockSlot: (bookingId: string) => void;

  // Reset
  resetToDefaultData: () => void;
}

const STORAGE_KEYS = {
  COURTS: 'acecourt_courts_v1',
  BOOKINGS: 'acecourt_bookings_v1',
  OWNER_AUTH: 'acecourt_owner_auth_v1',
  CLIENT_PROFILE: 'acecourt_client_profile_v1',
  MOBILE_PREVIEW: 'acecourt_mobile_preview_v1',
};

const TennisContext = createContext<TennisContextType | undefined>(undefined);

export const TennisProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [courts, setCourts] = useState<Court[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.COURTS);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_COURTS;
  });

  const [bookings, setBookings] = useState<Booking[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return generateInitialBookings();
  });

  const [isOwnerLoggedIn, setIsOwnerLoggedIn] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.OWNER_AUTH) === 'true';
    } catch {
      return false;
    }
  });

  const [currentRole, setCurrentRole] = useState<UserRole>('client');

  const [clientProfile, setClientProfileState] = useState<ClientProfile | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CLIENT_PROFILE);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return null;
  });

  const [isMobilePreview, setIsMobilePreview] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MOBILE_PREVIEW);
      return saved !== null ? saved === 'true' : false;
    } catch {
      return false;
    }
  });

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.COURTS, JSON.stringify(courts));
  }, [courts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.OWNER_AUTH, String(isOwnerLoggedIn));
  }, [isOwnerLoggedIn]);

  useEffect(() => {
    if (clientProfile) {
      localStorage.setItem(STORAGE_KEYS.CLIENT_PROFILE, JSON.stringify(clientProfile));
    }
  }, [clientProfile]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MOBILE_PREVIEW, String(isMobilePreview));
  }, [isMobilePreview]);

  const setClientProfile = (profile: ClientProfile | null) => {
    setClientProfileState(profile);
    if (!profile) {
      localStorage.removeItem(STORAGE_KEYS.CLIENT_PROFILE);
    }
  };

  const loginOwner = (password: string) => {
    // Standard owner password (default 'admin123' or any 4+ char password for ease of testing)
    if (password === 'admin123' || password === 'acecourt2026' || password === '1234') {
      setIsOwnerLoggedIn(true);
      return { success: true, message: 'Login realizado com sucesso!' };
    }
    return { success: false, message: 'Senha incorreta. A senha padrão do proprietário é: admin123' };
  };

  const logoutOwner = () => {
    setIsOwnerLoggedIn(false);
    setCurrentRole('client');
  };

  // Count active bookings for a phone number on a specific day
  const getClientBookingsCountForDay = (phone: string, date: string): number => {
    const targetDigits = cleanPhone(phone);
    if (!targetDigits) return 0;

    return bookings.filter(b => {
      if (b.status === 'cancelled') return false;
      if (b.date !== date) return false;
      return cleanPhone(b.clientPhone) === targetDigits;
    }).length;
  };

  // Check if a slot is available
  const isSlotAvailable = (courtId: string, date: string, hour: number): boolean => {
    const court = courts.find(c => c.id === courtId);
    if (!court || !court.isActive) return false;
    if (hour < court.openHour || hour >= court.closeHour) return false;

    const existing = bookings.find(b => 
      b.courtId === courtId &&
      b.date === date &&
      b.startHour === hour &&
      b.status !== 'cancelled'
    );

    return !existing;
  };

  const getSlotBooking = (courtId: string, date: string, hour: number): Booking | undefined => {
    return bookings.find(b => 
      b.courtId === courtId &&
      b.date === date &&
      b.startHour === hour &&
      b.status !== 'cancelled'
    );
  };

  // Add booking with STRICT 2-PER-DAY LIMIT
  const addBooking = ({
    courtId,
    clientName,
    clientPhone,
    date,
    startHour,
    notes,
  }: AddBookingParams): { success: boolean; message: string; booking?: Booking } => {
    const court = courts.find(c => c.id === courtId);
    if (!court) {
      return { success: false, message: 'Quadra não encontrada.' };
    }

    if (!court.isActive) {
      return { success: false, message: 'Esta quadra está temporariamente em manutenção.' };
    }

    if (!clientName.trim() || clientName.trim().length < 3) {
      return { success: false, message: 'Por favor, informe seu nome completo.' };
    }

    const digits = cleanPhone(clientPhone);
    if (digits.length < 10) {
      return { success: false, message: 'Por favor, informe um telefone válido com DDD.' };
    }

    // Check if slot is already occupied
    const isOccupied = bookings.some(b => 
      b.courtId === courtId &&
      b.date === date &&
      b.startHour === startHour &&
      b.status !== 'cancelled'
    );

    if (isOccupied) {
      return { success: false, message: 'Este horário acabou de ser reservado. Por favor, escolha outro horário.' };
    }

    // STRICT RULE: Max 2 bookings per day per client!
    const activeCountForDay = getClientBookingsCountForDay(clientPhone, date);
    if (activeCountForDay >= 2) {
      return {
        success: false,
        message: `Limite diário atingido! Você já possui ${activeCountForDay} agendamentos no dia ${formatDateBR(date)}. O regulamento permite no máximo 2 horas por dia por atleta.`,
      };
    }

    const newBooking: Booking = {
      id: `b-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      courtId: court.id,
      courtName: court.name,
      clientName: clientName.trim(),
      clientPhone: clientPhone.trim(),
      date,
      startHour,
      endHour: startHour + 1,
      totalPrice: court.hourlyPrice,
      status: 'confirmed',
      paymentStatus: 'pending',
      createdAt: new Date().toISOString(),
      notes: notes?.trim() || undefined,
    };

    setBookings(prev => [newBooking, ...prev]);

    // Save client profile for convenience
    setClientProfileState({
      name: clientName.trim(),
      phone: clientPhone.trim(),
    });

    return {
      success: true,
      message: 'Agendamento confirmado com sucesso!',
      booking: newBooking,
    };
  };

  // Cancel booking
  const cancelBooking = (bookingId: string, reason?: string) => {
    const exists = bookings.find(b => b.id === bookingId);
    if (!exists) {
      return { success: false, message: 'Agendamento não encontrado.' };
    }

    setBookings(prev =>
      prev.map(b => (b.id === bookingId ? { ...b, status: 'cancelled', notes: reason ? `${b.notes ? b.notes + ' - ' : ''}Cancelado: ${reason}` : b.notes } : b))
    );

    return { success: true, message: 'Agendamento cancelado com sucesso.' };
  };

  const completeBooking = (bookingId: string) => {
    setBookings(prev =>
      prev.map(b => (b.id === bookingId ? { ...b, status: 'completed', paymentStatus: 'paid' } : b))
    );
  };

  // Court operations
  const addCourt = (courtData: Omit<Court, 'id'>): Court => {
    const newCourt: Court = {
      ...courtData,
      id: `court-${Date.now()}`,
    };
    setCourts(prev => [...prev, newCourt]);
    return newCourt;
  };

  const updateCourt = (courtId: string, updates: Partial<Court>) => {
    setCourts(prev =>
      prev.map(c => (c.id === courtId ? { ...c, ...updates } : c))
    );
  };

  const deleteCourt = (courtId: string) => {
    const hasActiveBookings = bookings.some(
      b => b.courtId === courtId && b.status === 'confirmed'
    );

    if (hasActiveBookings) {
      return {
        success: false,
        message: 'Não é possível excluir esta quadra pois existem agendamentos ativos vinculados a ela.',
      };
    }

    setCourts(prev => prev.filter(c => c.id !== courtId));
    return { success: true, message: 'Quadra removida com sucesso.' };
  };

  const toggleCourtStatus = (courtId: string) => {
    setCourts(prev =>
      prev.map(c => (c.id === courtId ? { ...c, isActive: !c.isActive } : c))
    );
  };

  // Owner block slot
  const blockSlot = (courtId: string, date: string, startHour: number, reason: string) => {
    const court = courts.find(c => c.id === courtId);
    if (!court) return { success: false, message: 'Quadra não encontrada' };

    const newBlock: Booking = {
      id: `block-${Date.now()}`,
      courtId: court.id,
      courtName: court.name,
      clientName: 'Bloqueio de Manutenção / Clube',
      clientPhone: '(00) 00000-0000',
      date,
      startHour,
      endHour: startHour + 1,
      totalPrice: 0,
      status: 'blocked',
      paymentStatus: 'paid',
      createdAt: new Date().toISOString(),
      blockedReason: reason || 'Manutenção programada da quadra',
    };

    setBookings(prev => [newBlock, ...prev]);
    return { success: true, message: 'Horário bloqueado com sucesso.' };
  };

  const unblockSlot = (bookingId: string) => {
    setBookings(prev => prev.filter(b => b.id !== bookingId));
  };

  // Reset demo data
  const resetToDefaultData = () => {
    setCourts(INITIAL_COURTS);
    setBookings(generateInitialBookings());
    localStorage.removeItem(STORAGE_KEYS.COURTS);
    localStorage.removeItem(STORAGE_KEYS.BOOKINGS);
  };

  return (
    <TennisContext.Provider
      value={{
        courts,
        bookings,
        currentRole,
        setCurrentRole,
        isOwnerLoggedIn,
        loginOwner,
        logoutOwner,
        clientProfile,
        setClientProfile,
        isMobilePreview,
        setIsMobilePreview,
        addBooking,
        cancelBooking,
        completeBooking,
        getClientBookingsCountForDay,
        isSlotAvailable,
        getSlotBooking,
        addCourt,
        updateCourt,
        deleteCourt,
        toggleCourtStatus,
        blockSlot,
        unblockSlot,
        resetToDefaultData,
      }}
    >
      {children}
    </TennisContext.Provider>
  );
};

export const useTennis = () => {
  const context = useContext(TennisContext);
  if (!context) {
    throw new Error('useTennis must be used within a TennisProvider');
  }
  return context;
};
