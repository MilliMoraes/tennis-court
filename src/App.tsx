import React, { useState } from 'react';
import { TennisProvider, useTennis } from './context/TennisContext';
import { Header } from './components/layout/Header';
import { MobileShell } from './components/layout/MobileShell';

// Client Views
import { ClientBookingView } from './components/client/ClientBookingView';
import { ClientCourtCatalog } from './components/client/ClientCourtCatalog';
import { ClientMyBookings } from './components/client/ClientMyBookings';
import { ClientRulesView } from './components/client/ClientRulesView';

// Owner Views
import { OwnerLoginView } from './components/owner/OwnerLoginView';
import { OwnerDashboardView } from './components/owner/OwnerDashboardView';
import { OwnerCourtsManager } from './components/owner/OwnerCourtsManager';
import { OwnerReportsView } from './components/owner/OwnerReportsView';
import { OwnerScheduleGrid } from './components/owner/OwnerScheduleGrid';

// Icons
import { 
  Calendar, 
  Layers, 
  Ticket, 
  BookOpen, 
  LayoutDashboard, 
  FileText, 
  CalendarDays,
  Plus
} from 'lucide-react';

function TennisAppContent() {
  const { currentRole, isOwnerLoggedIn, bookings, clientProfile } = useTennis();

  // Navigation tab states
  const [clientTab, setClientTab] = useState<string>('book');
  const [ownerTab, setOwnerTab] = useState<string>('dashboard');
  const [isAddCourtModalOpen, setIsAddCourtModalOpen] = useState<boolean>(false);

  // Active bookings count for badge
  const clientActiveCount = clientProfile?.phone
    ? bookings.filter(b => b.clientPhone === clientProfile.phone && b.status === 'confirmed').length
    : undefined;

  // Client tabs configuration
  const clientTabs = [
    {
      id: 'book',
      label: 'Agendar',
      icon: <Calendar className="w-5 h-5" />,
    },
    {
      id: 'courts',
      label: 'Quadras',
      icon: <Layers className="w-5 h-5" />,
    },
    {
      id: 'my_bookings',
      label: 'Minhas Reservas',
      icon: <Ticket className="w-5 h-5" />,
      badge: clientActiveCount,
    },
    {
      id: 'rules',
      label: 'Regulamento',
      icon: <BookOpen className="w-5 h-5" />,
    },
  ];

  // Owner tabs configuration
  const ownerTabs = [
    {
      id: 'dashboard',
      label: 'Visão Geral',
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      id: 'courts',
      label: 'Quadras',
      icon: <Layers className="w-5 h-5" />,
    },
    {
      id: 'schedule',
      label: 'Grade / Ocupação',
      icon: <CalendarDays className="w-5 h-5" />,
    },
    {
      id: 'reports',
      label: 'Relatórios',
      icon: <FileText className="w-5 h-5" />,
    },
  ];

  // Helper when clicking "Agendar nesta quadra" from catalog
  const handleSelectCourtFromCatalog = (courtId: string) => {
    setClientTab('book');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-lime-400 selection:text-slate-950">
      <Header />

      {currentRole === 'client' ? (
        <MobileShell
          activeTab={clientTab}
          onTabChange={setClientTab}
          tabs={clientTabs}
          title="🎾 AceCourt • Agendamento"
        >
          {clientTab === 'book' && (
            <ClientBookingView
              onNavigateToBookings={() => setClientTab('my_bookings')}
            />
          )}

          {clientTab === 'courts' && (
            <ClientCourtCatalog
              onSelectCourtToBook={handleSelectCourtFromCatalog}
            />
          )}

          {clientTab === 'my_bookings' && (
            <ClientMyBookings
              onNavigateToBooking={() => setClientTab('book')}
            />
          )}

          {clientTab === 'rules' && <ClientRulesView />}
        </MobileShell>
      ) : (
        /* Owner Role */
        !isOwnerLoggedIn ? (
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8">
            <OwnerLoginView />
          </main>
        ) : (
          <MobileShell
            activeTab={ownerTab}
            onTabChange={setOwnerTab}
            tabs={ownerTabs}
            title="🛡️ Gestão AceCourt"
          >
            {ownerTab === 'dashboard' && (
              <OwnerDashboardView
                onNavigateTab={setOwnerTab}
                onOpenAddCourtModal={() => {
                  setOwnerTab('courts');
                  setIsAddCourtModalOpen(true);
                }}
              />
            )}

            {ownerTab === 'courts' && (
              <OwnerCourtsManager
                isAddModalOpen={isAddCourtModalOpen}
                onCloseAddModal={() => setIsAddCourtModalOpen(false)}
              />
            )}

            {ownerTab === 'schedule' && <OwnerScheduleGrid />}

            {ownerTab === 'reports' && <OwnerReportsView />}
          </MobileShell>
        )
      )}
    </div>
  );
}

export default function App() {
  return (
    <TennisProvider>
      <TennisAppContent />
    </TennisProvider>
  );
}
