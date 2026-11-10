import React, { useState } from 'react';
import { useTennis } from '../../context/TennisContext';
import { Court, SurfaceType } from '../../types/tennis';
import { formatCurrency, SURFACE_LABELS } from '../../utils/dateUtils';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Power, 
  Sun, 
  Clock, 
  DollarSign, 
  Check, 
  X, 
  AlertTriangle,
  Sparkles,
  Image as ImageIcon
} from 'lucide-react';

const PRESET_IMAGES = [
  {
    name: 'Saibro Clássico',
    url: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=1000&q=80',
  },
  {
    name: 'Piso Rápido / US Open',
    url: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=1000&q=80',
  },
  {
    name: 'Arena Coberta',
    url: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?auto=format&fit=crop&w=1000&q=80',
  },
  {
    name: 'Grama / Clube',
    url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1000&q=80',
  },
];

interface OwnerCourtsManagerProps {
  isAddModalOpen?: boolean;
  onCloseAddModal?: () => void;
}

export const OwnerCourtsManager: React.FC<OwnerCourtsManagerProps> = ({
  isAddModalOpen = false,
  onCloseAddModal,
}) => {
  const { courts, addCourt, updateCourt, deleteCourt, toggleCourtStatus } = useTennis();

  const [isModalOpen, setIsModalOpen] = useState<boolean>(isAddModalOpen);
  const [editingCourt, setEditingCourt] = useState<Court | null>(null);
  const [feedbackNotice, setFeedbackNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form states
  const [name, setName] = useState<string>('');
  const [surface, setSurface] = useState<SurfaceType>('saibro');
  const [hourlyPrice, setHourlyPrice] = useState<number>(85);
  const [isIndoor, setIsIndoor] = useState<boolean>(false);
  const [hasLighting, setHasLighting] = useState<boolean>(true);
  const [openHour, setOpenHour] = useState<number>(6);
  const [closeHour, setCloseHour] = useState<number>(23);
  const [imageUrl, setImageUrl] = useState<string>(PRESET_IMAGES[0].url);
  const [description, setDescription] = useState<string>('');

  const openAddModal = () => {
    setEditingCourt(null);
    setName('');
    setSurface('saibro');
    setHourlyPrice(85);
    setIsIndoor(false);
    setHasLighting(true);
    setOpenHour(6);
    setCloseHour(23);
    setImageUrl(PRESET_IMAGES[0].url);
    setDescription('');
    setIsModalOpen(true);
  };

  const openEditModal = (court: Court) => {
    setEditingCourt(court);
    setName(court.name);
    setSurface(court.surface);
    setHourlyPrice(court.hourlyPrice);
    setIsIndoor(court.isIndoor);
    setHasLighting(court.hasLighting);
    setOpenHour(court.openHour);
    setCloseHour(court.closeHour);
    setImageUrl(court.imageUrl);
    setDescription(court.description);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCourt(null);
    if (onCloseAddModal) onCloseAddModal();
  };

  const handleSubmitCourt = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setFeedbackNotice({ type: 'error', message: 'Informe o nome da quadra.' });
      return;
    }

    if (hourlyPrice <= 0) {
      setFeedbackNotice({ type: 'error', message: 'O valor da hora deve ser maior que zero.' });
      return;
    }

    if (editingCourt) {
      updateCourt(editingCourt.id, {
        name: name.trim(),
        surface,
        hourlyPrice: Number(hourlyPrice),
        isIndoor,
        hasLighting,
        openHour: Number(openHour),
        closeHour: Number(closeHour),
        imageUrl,
        description: description.trim(),
      });
      setFeedbackNotice({ type: 'success', message: 'Quadra atualizada com sucesso!' });
    } else {
      addCourt({
        name: name.trim(),
        surface,
        hourlyPrice: Number(hourlyPrice),
        isIndoor,
        hasLighting,
        openHour: Number(openHour),
        closeHour: Number(closeHour),
        imageUrl,
        description: description.trim() || 'Quadra oficial para prática de tênis.',
        isActive: true,
      });
      setFeedbackNotice({ type: 'success', message: 'Nova quadra cadastrada com sucesso!' });
    }

    handleCloseModal();
    setTimeout(() => setFeedbackNotice(null), 4000);
  };

  const handleDeleteCourt = (court: Court) => {
    if (window.confirm(`Tem certeza que deseja excluir a "${court.name}"?`)) {
      const res = deleteCourt(court.id);
      if (!res.success) {
        alert(res.message);
      } else {
        setFeedbackNotice({ type: 'success', message: 'Quadra removida com sucesso.' });
        setTimeout(() => setFeedbackNotice(null), 3000);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Cadastro & Gestão de Quadras</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/20 font-semibold">
              {courts.length} cadastradas
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Cadastre novas quadras, ajuste valores por hora, pisos, horários e coloque em manutenção quando necessário.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/20 transition-all self-start sm:self-auto active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Nova Quadra</span>
        </button>
      </div>

      {feedbackNotice && (
        <div className={`p-4 rounded-2xl text-xs flex items-center gap-2.5 ${
          feedbackNotice.type === 'success'
            ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
            : 'bg-red-500/10 border border-red-500/30 text-red-300'
        }`}>
          {feedbackNotice.type === 'success' ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          <span>{feedbackNotice.message}</span>
        </div>
      )}

      {/* Courts List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {courts.map(court => {
          const surfaceInfo = SURFACE_LABELS[court.surface] || SURFACE_LABELS.saibro;

          return (
            <div
              key={court.id}
              className={`bg-slate-900 border rounded-3xl overflow-hidden shadow-xl flex flex-col justify-between transition-all ${
                court.isActive ? 'border-slate-800' : 'border-red-900/40 opacity-75'
              }`}
            >
              {/* Image & Badges */}
              <div className="relative h-44 w-full bg-slate-950 overflow-hidden">
                <img
                  src={court.imageUrl}
                  alt={court.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/30 to-transparent" />

                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md border backdrop-blur-md ${surfaceInfo.badge}`}>
                    {surfaceInfo.label}
                  </span>
                  {court.isIndoor && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-500/30 text-purple-300 border border-purple-500/40 backdrop-blur-md">
                      Coberta
                    </span>
                  )}
                </div>

                <div className="absolute top-3 right-3">
                  <button
                    type="button"
                    onClick={() => toggleCourtStatus(court.id)}
                    title={court.isActive ? 'Pausar para manutenção' : 'Ativar quadra'}
                    className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg backdrop-blur-md border transition-colors ${
                      court.isActive
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 hover:bg-red-500/20 hover:text-red-300 hover:border-red-500/30'
                        : 'bg-red-500/30 text-red-300 border-red-500/40 hover:bg-emerald-500/30 hover:text-emerald-300'
                    }`}
                  >
                    <Power className="w-3 h-3" />
                    <span>{court.isActive ? 'Ativa' : 'Manutenção'}</span>
                  </button>
                </div>

                <div className="absolute bottom-3 right-3 bg-slate-950/90 backdrop-blur-md border border-slate-700 px-3 py-1 rounded-xl">
                  <span className="text-sm font-extrabold text-amber-400">
                    {formatCurrency(court.hourlyPrice)}
                    <span className="text-[10px] text-slate-400 font-normal">/hora</span>
                  </span>
                </div>
              </div>

              {/* Details */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">{court.name}</h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                    {court.description}
                  </p>

                  <div className="mt-3 pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-[11px] text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>{String(court.openHour).padStart(2, '0')}:00 às {String(court.closeHour).padStart(2, '0')}:00</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Sun className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>{court.hasLighting ? 'Com Iluminação' : 'Sem Iluminação'}</span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => openEditModal(court)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                    <span>Editar</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteCourt(court)}
                    className="p-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition-colors"
                    title="Excluir quadra"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Court Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={handleCloseModal}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-5">
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                {editingCourt ? 'Editar Cadastro' : 'Novo Cadastro'}
              </span>
              <h3 className="text-xl font-bold text-white mt-0.5">
                {editingCourt ? `Editar ${editingCourt.name}` : 'Cadastrar Nova Quadra de Tênis'}
              </h3>
            </div>

            <form onSubmit={handleSubmitCourt} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nome da Quadra *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Quadra 5 - Saibro VIP"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Tipo de Superfície
                  </label>
                  <select
                    value={surface}
                    onChange={e => setSurface(e.target.value as SurfaceType)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="saibro">Saibro (Clay)</option>
                    <option value="rapida">Rápida (Hard Court)</option>
                    <option value="coberta">Coberta Premium</option>
                    <option value="grama">Grama Sintética</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Valor por Hora (R$) *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min={10}
                      max={1000}
                      step={5}
                      value={hourlyPrice}
                      onChange={e => setHourlyPrice(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400 font-bold"
                    />
                    <DollarSign className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                  </div>
                </div>
              </div>

              {/* Toggles: Indoor & Lighting */}
              <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-slate-950 border border-slate-800">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-300 select-none">
                  <input
                    type="checkbox"
                    checked={isIndoor}
                    onChange={e => setIsIndoor(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-0 bg-slate-900 border-slate-700"
                  />
                  <span>Quadra Coberta</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-300 select-none">
                  <input
                    type="checkbox"
                    checked={hasLighting}
                    onChange={e => setHasLighting(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-0 bg-slate-900 border-slate-700"
                  />
                  <span>Iluminação Noturna</span>
                </label>
              </div>

              {/* Operating Hours */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Abertura (Hora)
                  </label>
                  <select
                    value={openHour}
                    onChange={e => setOpenHour(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                  >
                    {[5, 6, 7, 8, 9, 10].map(h => (
                      <option key={h} value={h}>{String(h).padStart(2, '0')}:00</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Fechamento (Hora)
                  </label>
                  <select
                    value={closeHour}
                    onChange={e => setCloseHour(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                  >
                    {[18, 19, 20, 21, 22, 23, 24].map(h => (
                      <option key={h} value={h}>{String(h).padStart(2, '0')}:00</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Image presets */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>Foto da Quadra</span>
                  <span className="text-[10px] text-slate-500">Escolha um modelo ou digite a URL</span>
                </label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {PRESET_IMAGES.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setImageUrl(img.url)}
                      className={`relative h-14 rounded-xl overflow-hidden border transition-all ${
                        imageUrl === img.url
                          ? 'border-amber-400 ring-2 ring-amber-400/40'
                          : 'border-slate-800 hover:border-slate-700 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                      {imageUrl === img.url && (
                        <div className="absolute inset-0 bg-amber-500/20 flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                <input
                  type="url"
                  placeholder="https://exemplo.com/imagem-quadra.jpg"
                  value={imageUrl}
                  onChange={e => setImageUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Descrição da Quadra
                </label>
                <textarea
                  rows={2}
                  placeholder="Detalhes sobre tipo de piso, manutenção recente, redes..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 resize-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all"
                >
                  {editingCourt ? 'Salvar Alterações' : 'Concluir Cadastro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
