import React, { useState, useEffect } from 'react';
import { fetchAppointmentsFromSupabase } from '../../services/supabaseDataService';
import { Appointment } from '../../types';
import { DollarSign, CalendarCheck, Users, TrendingUp, ArrowRight, RefreshCw, Scissors, CheckCircle2 } from 'lucide-react';

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
        return <span className="text-[10px] font-bold text-status-success bg-status-success/15 border border-status-success/30 px-2.5 py-0.5 rounded-full">Em andamento</span>;
      case 'completed':
        return <span className="text-[10px] font-bold text-blue-400 bg-blue-500/15 border border-blue-500/30 px-2.5 py-0.5 rounded-full">Concluído</span>;
      case 'cancelled':
        return <span className="text-[10px] font-bold text-red-400 bg-red-500/15 border border-red-500/30 px-2.5 py-0.5 rounded-full">Cancelado</span>;
      case 'confirmed':
      default:
        return <span className="text-[10px] font-bold text-gold-hover bg-gold-base/15 border border-gold-hover/30 px-2.5 py-0.5 rounded-full">Confirmado</span>;
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Date Header */}
      <div className="flex justify-between items-center bg-surface-card p-4 rounded-2xl border border-border-subtle">
        <div>
          <span className="text-xs text-content-muted font-bold capitalize block">{todayFormatted}</span>
          <h2 className="text-base text-content-base font-bold">Resumo Diário da Barbearia</h2>
        </div>
        <button 
          onClick={loadData}
          className="p-2 rounded-xl bg-surface-base text-gold-hover hover:bg-surface-card transition-colors border border-border-subtle"
          title="Atualizar dados"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Faturamento hoje */}
        <div className="bg-surface-card p-4 rounded-2xl border border-border-subtle space-y-1">
          <span className="text-[11px] text-content-muted font-bold uppercase tracking-wider block">Faturamento Hoje</span>
          <div className="text-xl sm:text-2xl text-gold-hover font-black tracking-tight">
            R$ {totalRevenueToday.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-status-success font-semibold block">{activeToday.length} cortes hoje</span>
        </div>

        {/* Agendamentos */}
        <div className="bg-surface-card p-4 rounded-2xl border border-border-subtle space-y-1">
          <span className="text-[11px] text-content-muted font-bold uppercase tracking-wider block">Agendamentos</span>
          <div className="text-xl sm:text-2xl text-content-base font-black tracking-tight">
            {todayAppointments.length}
          </div>
          <span className="text-[10px] text-content-muted font-semibold block">{pendingToday} pendentes • {completedToday} concluídos</span>
        </div>

        {/* Clientes únicos */}
        <div className="bg-surface-card p-4 rounded-2xl border border-border-subtle space-y-1">
          <span className="text-[11px] text-content-muted font-bold uppercase tracking-wider block">Base de Clientes</span>
          <div className="text-xl sm:text-2xl text-content-base font-black tracking-tight">{uniqueClients}</div>
          <span className="text-[10px] text-content-muted font-medium block">Clientes cadastrados</span>
        </div>

        {/* Ticket médio */}
        <div className="bg-surface-card p-4 rounded-2xl border border-border-subtle space-y-1">
          <span className="text-[11px] text-content-muted font-bold uppercase tracking-wider block">Ticket Médio</span>
          <div className="text-xl sm:text-2xl text-gold-hover font-black tracking-tight">
            R$ {ticketMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-status-success font-semibold block">Média por atendimento</span>
        </div>
      </div>

      {/* Próximos agendamentos List */}
      <div className="bg-surface-card p-4 sm:p-5 rounded-2xl border border-border-subtle space-y-3">
        <div className="flex justify-between items-center pb-2 border-b border-border-subtle">
          <h3 className="text-xs font-bold text-content-base uppercase tracking-wider">Agendamentos de Hoje ({todayAppointments.length})</h3>
          <button 
            onClick={onNavigateToAgenda}
            className="text-xs text-gold-hover hover:underline font-bold flex items-center gap-1"
          >
            <span>Ver Agenda</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-border-subtle">
          {todayAppointments.length === 0 ? (
            <div className="py-8 text-center text-xs text-content-muted">
              Nenhum agendamento registrado para a data de hoje.
            </div>
          ) : (
            todayAppointments.slice(0, 6).map(apt => {
              const serviceName = Array.isArray(apt.services) && apt.services.length > 0
                ? (typeof apt.services[0] === 'string' ? apt.services[0] : apt.services[0].title)
                : 'Atendimento';

              return (
                <div key={apt.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-surface-base border border-border-subtle text-gold-hover font-bold text-xs flex items-center justify-center shrink-0">
                      {apt.client_name ? apt.client_name.charAt(0).toUpperCase() : 'C'}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-content-base truncate">{apt.client_name || 'Cliente'}</div>
                      <div className="text-[10px] text-content-muted truncate">{serviceName} • <strong className="text-gold-hover">{apt.professional_name || 'Barbeiro'}</strong></div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <div className="text-xs font-bold text-gold-hover">{apt.time_slot || '--:--'}</div>
                      <div className="text-[10px] text-content-muted">R$ {apt.final_amount ? apt.final_amount.toFixed(2) : '0.00'}</div>
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

