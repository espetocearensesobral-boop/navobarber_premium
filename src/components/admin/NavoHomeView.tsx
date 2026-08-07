import React, { useState, useEffect } from 'react';
import { fetchAppointmentsFromSupabase } from '../../services/supabaseDataService';
import { Appointment } from '../../types';
import { RefreshCw, ArrowRight, Clock, Receipt, Scissors, Users, CalendarCheck2 } from 'lucide-react';

interface NavoHomeViewProps {
  onNavigateToAgenda: () => void;
}

export const NavoHomeView: React.FC<NavoHomeViewProps> = ({ onNavigateToAgenda }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const data = await fetchAppointmentsFromSupabase();
    setAppointments(data);
    setLoading(false);
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter(a => a.date === todayStr);
  const activeToday = todayAppointments.filter(a => a.status !== 'cancelled');
  
  const totalRevenueToday = activeToday.reduce((sum, a) => sum + (a.final_amount || 0), 0);
  const completedToday = activeToday.filter(a => a.status === 'completed').length;
  const inServiceToday = activeToday.filter(a => a.status === 'in_service' || a.status === 'in_chair').length;
  const pendingToday = activeToday.filter(a => a.status === 'confirmed').length;

  const totalCompletedAppointments = appointments.filter(a => a.status === 'completed');
  const ticketMedio = totalCompletedAppointments.length > 0 
    ? totalCompletedAppointments.reduce((sum, a) => sum + (a.final_amount || 0), 0) / totalCompletedAppointments.length 
    : (activeToday.length > 0 ? totalRevenueToday / activeToday.length : 0);

  const uniqueClients = new Set(appointments.map(a => a.client_id || a.client_phone || a.client_name)).size;

  const todayFormatted = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'in_service':
      case 'in_chair':
        return (
          <span className="text-[10px] font-bold text-status-success bg-status-success/15 border border-status-success/30 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-status-success animate-pulse" />
            Na Cadeira
          </span>
        );
      case 'completed':
        return (
          <span className="text-[10px] font-bold text-blue-400 bg-blue-500/15 border border-blue-500/30 px-2.5 py-0.5 rounded-full">
            Finalizado
          </span>
        );
      case 'cancelled':
        return (
          <span className="text-[10px] font-bold text-status-error bg-status-error/15 border border-status-error/30 px-2.5 py-0.5 rounded-full">
            Cancelado
          </span>
        );
      case 'confirmed':
      default:
        return (
          <span className="text-[10px] font-bold text-gold-base bg-gold-base/15 border border-gold-base/30 px-2.5 py-0.5 rounded-full">
            Confirmado
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-content-base min-w-0">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-card p-5 rounded-2xl border border-border-subtle relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 barber-pole-line opacity-80" />
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-gold-base block mb-0.5 capitalize">
            {todayFormatted}
          </span>
          <h1 className="text-xl font-serif text-content-base font-bold tracking-tight">
            Caixa de Hoje & Visão da Operação
          </h1>
          <p className="text-xs text-content-muted mt-1">
            Acompanhe a receita em tempo real, status das cadeiras e agendamentos confirmados.
          </p>
        </div>

        <button 
          onClick={loadData}
          disabled={loading}
          className="self-start sm:self-center px-3.5 py-2 rounded-xl bg-surface-base text-gold-base hover:text-content-base hover:bg-surface-card border border-border-subtle transition-all text-xs font-bold flex items-center gap-2 shrink-0 active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Atualizar Dados</span>
        </button>
      </div>

      {/* HERO HERO FOCUS BLOCK: CAIXA DO DIA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main Revenue Display Card */}
        <div className="lg:col-span-2 bg-gradient-to-br from-surface-card via-surface-card to-surface-base p-6 rounded-2xl border border-gold-base/30 shadow-xl relative overflow-hidden flex flex-col justify-between space-y-4">
          <div className="flex justify-between items-start gap-3">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-gold-base bg-gold-base/10 border border-gold-base/20 px-2.5 py-0.5 rounded-full inline-block">
                Faturamento Atual
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif font-black text-content-base tracking-tight mt-2 num-tabular">
                R$ {totalRevenueToday.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </h2>
            </div>

            <div className="w-10 h-10 rounded-xl bg-gold-base/10 border border-gold-base/30 flex items-center justify-center text-gold-base shrink-0">
              <Receipt className="w-5 h-5" />
            </div>
          </div>

          <div className="pt-3 border-t border-border-subtle/80 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-4 text-content-muted">
              <div>
                <span className="text-[10px] uppercase font-bold text-content-muted/70 block">Cortes Hoje</span>
                <span className="font-bold text-content-base num-tabular">{activeToday.length} atendimentos</span>
              </div>
              <div className="h-6 w-px bg-border-subtle" />
              <div>
                <span className="text-[10px] uppercase font-bold text-content-muted/70 block">Em Cadeira</span>
                <span className="font-bold text-status-success num-tabular">{inServiceToday} ativos</span>
              </div>
              <div className="h-6 w-px bg-border-subtle" />
              <div>
                <span className="text-[10px] uppercase font-bold text-content-muted/70 block">Aguardando</span>
                <span className="font-bold text-gold-base num-tabular">{pendingToday} confirmados</span>
              </div>
            </div>

            <button
              onClick={onNavigateToAgenda}
              className="bg-gold-base text-surface-base px-4 py-2 rounded-xl text-xs font-bold hover:bg-gold-base/90 transition-all flex items-center gap-2 shrink-0 shadow-md active:scale-95"
            >
              <Scissors className="w-3.5 h-3.5" />
              <span>Ver Agenda Completa</span>
            </button>
          </div>
        </div>

        {/* Side Metrics Column */}
        <div className="space-y-4 flex flex-col justify-between">
          <div className="bg-surface-card p-4 rounded-2xl border border-border-subtle flex items-center justify-between">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-content-muted block">Ticket Médio</span>
              <div className="text-xl font-serif font-bold text-gold-base mt-0.5 num-tabular">
                R$ {ticketMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <span className="text-[10px] text-content-muted mt-1 block">Por cliente atendido</span>
            </div>
            <div className="p-3 rounded-xl bg-surface-base border border-border-subtle text-content-base">
              <CalendarCheck2 className="w-5 h-5 text-gold-base" />
            </div>
          </div>

          <div className="bg-surface-card p-4 rounded-2xl border border-border-subtle flex items-center justify-between">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-content-muted block">Base de Clientes</span>
              <div className="text-xl font-serif font-bold text-content-base mt-0.5 num-tabular">
                {uniqueClients}
              </div>
              <span className="text-[10px] text-content-muted mt-1 block">Cadastrados no sistema</span>
            </div>
            <div className="p-3 rounded-xl bg-surface-base border border-border-subtle text-content-base">
              <Users className="w-5 h-5 text-gold-base" />
            </div>
          </div>
        </div>
      </div>

      {/* TODAY'S SCHEDULE / QUEUE FLOW */}
      <div className="bg-surface-card p-5 sm:p-6 rounded-2xl border border-border-subtle space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border-subtle">
          <div>
            <h3 className="text-sm font-serif font-bold text-content-base tracking-tight">
              Fluxo de Atendimentos do Dia ({todayAppointments.length})
            </h3>
            <p className="text-[11px] text-content-muted">
              Consulte os cortes e barbeiros agendados para a data de hoje.
            </p>
          </div>

          <button 
            onClick={onNavigateToAgenda}
            className="text-xs text-gold-base hover:text-gold-base/80 font-bold flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Gerenciar na Agenda</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-border-subtle/60">
          {todayAppointments.length === 0 ? (
            <div className="py-10 text-center space-y-2">
              <Clock className="w-8 h-8 text-content-muted mx-auto opacity-50" />
              <p className="text-xs text-content-muted font-medium">Nenhum agendamento registrado para hoje.</p>
              <button
                onClick={onNavigateToAgenda}
                className="mt-2 text-xs font-bold text-gold-base underline hover:text-gold-base/80"
              >
                Abrir agenda para agendar novo cliente
              </button>
            </div>
          ) : (
            todayAppointments.map(apt => {
              const serviceName = Array.isArray(apt.services) && apt.services.length > 0
                ? (typeof apt.services[0] === 'string' ? apt.services[0] : apt.services[0].title)
                : 'Atendimento de Barbearia';

              return (
                <div key={apt.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-surface-base/30 px-2 rounded-xl transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-surface-base border border-border-subtle text-gold-base font-serif font-bold text-sm flex items-center justify-center shrink-0 shadow-sm">
                      {apt.client_name ? apt.client_name.charAt(0).toUpperCase() : 'C'}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-content-base truncate">{apt.client_name || 'Cliente'}</div>
                      <div className="text-[11px] text-content-muted truncate">
                        {serviceName} • <span className="text-gold-base font-bold">{apt.professional_name || 'Barbeiro'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-border-subtle/40">
                    <div className="text-left sm:text-right">
                      <div className="text-xs font-bold text-content-base num-tabular">{apt.time_slot || '--:--'}</div>
                      <div className="text-[10px] text-content-muted num-tabular">R$ {apt.final_amount ? apt.final_amount.toFixed(2) : '0.00'}</div>
                    </div>
                    {getStatusBadge(apt.status)}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
