import React, { useState } from 'react';
import { useTennis } from '../../context/TennisContext';
import { formatCurrency, SURFACE_LABELS } from '../../utils/dateUtils';
import { SurfaceType } from '../../types/tennis';
import { Sun, Check, Sparkles, Clock, AlertCircle } from 'lucide-react';

interface ClientCourtCatalogProps {
  onSelectCourtToBook: (courtId: string) => void;
}

export const ClientCourtCatalog: React.FC<ClientCourtCatalogProps> = ({
  onSelectCourtToBook,
}) => {
  const { courts } = useTennis();
  const [filterSurface, setFilterSurface] = useState<SurfaceType | 'all'>('all');

  const filteredCourts = courts.filter(court => {
    if (filterSurface === 'all') return true;
    return court.surface === filterSurface;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Quadras Disponíveis</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-lime-400/10 text-lime-400 border border-lime-400/20 font-semibold">
              {courts.length} quadras
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Conheça a infraestrutura do clube com saibro europeu, piso rápido padrão Grand Slam e opções cobertas.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <button
            type="button"
            onClick={() => setFilterSurface('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filterSurface === 'all'
                ? 'bg-lime-400 text-slate-950 font-bold'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Todas
          </button>
          <button
            type="button"
            onClick={() => setFilterSurface('saibro')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filterSurface === 'saibro'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Saibro
          </button>
          <button
            type="button"
            onClick={() => setFilterSurface('rapida')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filterSurface === 'rapida'
                ? 'bg-sky-500 text-slate-950 font-bold'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Rápida
          </button>
          <button
            type="button"
            onClick={() => setFilterSurface('coberta')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filterSurface === 'coberta'
                ? 'bg-purple-500 text-slate-950 font-bold'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Coberta
          </button>
          <button
            type="button"
            onClick={() => setFilterSurface('grama')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filterSurface === 'grama'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Grama
          </button>
        </div>
      </div>

      {/* Courts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredCourts.map(court => {
          const surfaceInfo = SURFACE_LABELS[court.surface] || SURFACE_LABELS.saibro;

          return (
            <div
              key={court.id}
              className={`group bg-slate-900/90 border rounded-3xl overflow-hidden flex flex-col justify-between transition-all duration-300 hover:border-slate-700 shadow-xl ${
                !court.isActive ? 'border-red-900/30 opacity-70' : 'border-slate-800'
              }`}
            >
              {/* Photo Banner */}
              <div className="relative h-48 w-full overflow-hidden bg-slate-950">
                <img
                  src={court.imageUrl}
                  alt={court.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />

                {/* Surface Tag */}
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span className={`text-xs font-bold px-3 py-1 rounded-lg border backdrop-blur-md ${surfaceInfo.badge}`}>
                    {surfaceInfo.label}
                  </span>
                  {court.isIndoor && (
                    <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-purple-900/80 text-purple-200 border border-purple-500/40 backdrop-blur-md">
                      100% Coberta
                    </span>
                  )}
                </div>

                {/* Hourly Price Tag */}
                <div className="absolute bottom-3 right-3 bg-slate-950/90 backdrop-blur-md border border-slate-700 px-3.5 py-1.5 rounded-xl shadow-lg">
                  <span className="text-[10px] text-slate-400 block -mb-0.5">Valor da hora</span>
                  <span className="text-base font-extrabold text-lime-400">
                    {formatCurrency(court.hourlyPrice)}
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-lg font-bold text-white group-hover:text-lime-300 transition-colors">
                      {court.name}
                    </h3>
                    {!court.isActive && (
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-red-500/20 text-red-400 border border-red-500/30">
                        Em Manutenção
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    {court.description}
                  </p>

                  {/* Highlights */}
                  <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-800/80 text-xs">
                    <div className="flex items-center gap-2 text-slate-300">
                      <Clock className="w-3.5 h-3.5 text-lime-400" />
                      <span>{String(court.openHour).padStart(2, '0')}:00 às {String(court.closeHour).padStart(2, '0')}:00</span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-300">
                      <Sun className="w-3.5 h-3.5 text-lime-400" />
                      <span>{court.hasLighting ? 'Iluminação Noturna' : 'Apenas Diurno'}</span>
                    </div>
                  </div>
                </div>

                {/* Action */}
                <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">
                    {court.isActive ? 'Disponível para reservas' : 'Temporariamente indisponível'}
                  </span>

                  <button
                    type="button"
                    disabled={!court.isActive}
                    onClick={() => onSelectCourtToBook(court.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
                      court.isActive
                        ? 'bg-lime-400 hover:bg-lime-300 text-slate-950 shadow-md shadow-lime-500/20 active:scale-95'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <span>Agendar Horário</span>
                    <Sparkles className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
