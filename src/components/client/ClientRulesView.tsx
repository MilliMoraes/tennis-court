import React from 'react';
import { ShieldCheck, Clock, Calendar, CheckCircle2, Phone, MapPin, Award, Info } from 'lucide-react';

export const ClientRulesView: React.FC = () => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <span>Regulamento & Informações do Clube</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Diretrizes para garantir a melhor experiência esportiva e equidade para todos os atletas.
        </p>
      </div>

      {/* Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Rule 1: Limit 2 per day */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg relative overflow-hidden">
          <div className="w-10 h-10 rounded-2xl bg-lime-400/10 border border-lime-400/20 text-lime-400 flex items-center justify-center mb-3">
            <Award className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">
            Limite de 2 Agendamentos Diários
          </h3>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            Cada cliente (identificado pelo número de telefone e nome) pode realizar no máximo <strong>2 horas de agendamento por dia</strong>. Esse limite garante oportunidade de jogo para toda a comunidade tenística.
          </p>
        </div>

        {/* Rule 2: 1-Hour Blocks */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg relative overflow-hidden">
          <div className="w-10 h-10 rounded-2xl bg-sky-400/10 border border-sky-400/20 text-sky-400 flex items-center justify-center mb-3">
            <Clock className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">
            Locação em Blocos de 1 Hora
          </h3>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            Todos os horários iniciam pontualmente na hora cheia (ex: 08:00 às 09:00). Pedimos que os atletas cheguem 10 minutos antes e liberem a quadra nos últimos 5 minutos para a passagem do rodão no saibro.
          </p>
        </div>

        {/* Rule 3: No Login Required */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg relative overflow-hidden">
          <div className="w-10 h-10 rounded-2xl bg-amber-400/10 border border-amber-400/20 text-amber-400 flex items-center justify-center mb-3">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">
            Reserva Fácil sem Senha
          </h3>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            Você não precisa criar conta com senha nem passar por processos burocráticos. Basta informar seu nome completo e telefone celular com WhatsApp para receber seu voucher instantâneo.
          </p>
        </div>

        {/* Rule 4: Footwear & Equipment */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg relative overflow-hidden">
          <div className="w-10 h-10 rounded-2xl bg-purple-400/10 border border-purple-400/20 text-purple-400 flex items-center justify-center mb-3">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">
            Calçado Apropriado por Piso
          </h3>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            Para quadras de <strong>saibro</strong>, utilize tênis com solado específico clay (espinha de peixe). Para <strong>rápida</strong> (hard court), calçados non-marking são obrigatórios para preservar a pintura.
          </p>
        </div>
      </div>

      {/* Club Contact / Location */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl">
        <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-lime-400" />
          <span>Localização & Atendimento AceCourt</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
            <span className="text-slate-500 block mb-1">Endereço</span>
            <p className="font-semibold text-slate-200">
              Av. das Nações do Tênis, 1500<br />
              Complexo Esportivo Central
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
            <span className="text-slate-500 block mb-1">Horário de Funcionamento</span>
            <p className="font-semibold text-slate-200">
              Segunda a Domingo<br />
              06:00 às 23:00 (Ininterrupto)
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
            <span className="text-slate-500 block mb-1">Recepção & WhatsApp</span>
            <p className="font-semibold text-lime-400">
              (11) 99876-5432<br />
              contato@acecourt.com.br
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
