import React from 'react';
import { useTennis } from '../../context/TennisContext';
import { Wifi, Battery, Signal } from 'lucide-react';

interface MobileShellProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tabId: string) => void;
  tabs: { id: string; label: string; icon: React.ReactNode; badge?: number }[];
  title?: string;
}

export const MobileShell: React.FC<MobileShellProps> = ({
  children,
  activeTab,
  onTabChange,
  tabs,
  title,
}) => {
  const { isMobilePreview } = useTennis();

  // If mobile preview is active, render inside a device frame
  if (isMobilePreview) {
    return (
      <div className="min-h-[calc(100vh-4rem)] py-6 flex items-center justify-center bg-slate-950 p-2 sm:p-4">
        {/* Phone Frame */}
        <div className="relative w-full max-w-[420px] h-[844px] bg-slate-900 rounded-[48px] border-[10px] border-slate-800 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col ring-1 ring-slate-700/50">
          {/* Dynamic Island / Notch */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-5 bg-slate-950 rounded-full z-50 flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-800 mr-2" />
            <div className="w-2 h-2 rounded-full bg-slate-900 border border-slate-700" />
          </div>

          {/* Status Bar */}
          <div className="pt-2 px-6 h-10 flex items-center justify-between text-[11px] font-semibold text-slate-300 z-40 bg-slate-950/40 select-none">
            <span>09:41</span>
            <div className="flex items-center gap-1.5">
              <Signal className="w-3 h-3" />
              <Wifi className="w-3 h-3" />
              <Battery className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Flutter-style App Title Bar inside Phone */}
          {title && (
            <div className="px-5 py-3 bg-slate-900/90 border-b border-slate-800/80 flex items-center justify-between z-30">
              <h2 className="font-bold text-base text-slate-100 flex items-center gap-2">
                {title}
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-lime-400/10 text-lime-400 border border-lime-400/30">
                Flutter UI
              </span>
            </div>
          )}

          {/* Scrollable Screen Content */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden bg-slate-950 text-slate-100 pb-20">
            {children}
          </div>

          {/* Flutter Bottom Navigation Bar */}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-slate-900/95 backdrop-blur-md border-t border-slate-800/80 px-2 flex items-center justify-around z-40">
            {tabs.map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onTabChange(tab.id)}
                  className={`relative flex flex-col items-center justify-center flex-1 h-full transition-all duration-200 ${
                    isActive ? 'text-lime-400 font-bold scale-105' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="relative">
                    {tab.icon}
                    {tab.badge !== undefined && tab.badge > 0 && (
                      <span className="absolute -top-1 -right-2 px-1.5 py-0.2 bg-lime-400 text-slate-950 text-[10px] font-black rounded-full min-w-[16px] text-center">
                        {tab.badge}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] mt-1 tracking-tight truncate max-w-[70px]">
                    {tab.label}
                  </span>
                  {isActive && (
                    <span className="absolute bottom-1 w-1 h-1 rounded-full bg-lime-400" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Home indicator bar */}
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-32 h-1 bg-slate-600 rounded-full z-50 pointer-events-none" />
        </div>
      </div>
    );
  }

  // Expanded Responsive layout
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col bg-slate-950">
      {/* Navigation Bar for Desktop / Tablet */}
      <div className="sticky top-16 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto py-2.5 gap-2 no-scrollbar">
          <div className="flex items-center gap-1.5 sm:gap-2">
            {tabs.map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onTabChange(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-lime-400 text-slate-950 shadow-md shadow-lime-500/20'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive ? 'bg-slate-950 text-lime-400' : 'bg-lime-400/20 text-lime-300'
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {title && (
            <div className="hidden lg:flex items-center gap-2 text-xs text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-lime-400" />
              <span>{title}</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 pb-24 lg:pb-12">
        {children}
      </main>

      {/* Mobile Floating Bottom Bar for smaller screens when not in phone simulator */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 px-2 flex items-center justify-around z-40">
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`relative flex flex-col items-center justify-center flex-1 h-full ${
                isActive ? 'text-lime-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                {tab.icon}
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="absolute -top-1 -right-2 px-1 bg-lime-400 text-slate-950 text-[10px] font-black rounded-full min-w-[14px] text-center">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 truncate max-w-[65px]">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
