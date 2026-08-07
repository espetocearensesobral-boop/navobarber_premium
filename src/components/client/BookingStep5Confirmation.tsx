import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { playConfirmationChime } from '../../lib/audio';
import { LottieIcon } from '../ui/LottieIcon';
import { ServiceItem, Professional } from '../../types';
import {
  CheckCircle2,
  CalendarDays,
  PlusCircle,
  Clock,
  User,
  ArrowRight,
  Scissors,
  Ticket,
  Copy,
  Check
} from 'lucide-react';

interface BookingStep5Props {
  selectedServices: ServiceItem[];
  selectedBarber: Professional | null;
  selectedDate: string;
  selectedTimeSlot: string;
  totalPaid: number;
  bookingCode?: string;
  onResetBooking: () => void;
  onViewAppointments: () => void;
}

export const BookingStep5Confirmation: React.FC<BookingStep5Props> = ({
  selectedServices,
  selectedBarber,
  selectedDate,
  selectedTimeSlot,
  totalPaid,
  bookingCode,
  onResetBooking,
  onViewAppointments
}) => {
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    try {
      playConfirmationChime();
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.55 },
        colors: ['#C9A96E', '#F2EFE7', '#121212', '#000000']
      });
    } catch (e) {
      console.log('Confetti failed to run', e);
    }
  }, []);

  const handleCopyVoucher = () => {
    if (!bookingCode) return;
    navigator.clipboard.writeText(bookingCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const totalDuration = selectedServices.reduce((acc, curr) => acc + curr.duration_minutes, 0);

  // Format Date
  const dateObj = new Date(`${selectedDate}T12:00:00`);
  const formattedDate = dateObj.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="space-y-5 text-center pb-8 px-4 max-w-md mx-auto animate-in fade-in duration-300 mt-6">
      {/* Minimalist Icon & Plain Text Title */}
      <div className="pt-2 flex flex-col items-center justify-center space-y-2">
        <div className="w-12 h-12 rounded-full bg-status-success/10 border border-status-success/20 flex items-center justify-center text-status-success">
          <LottieIcon 
            fallbackIcon={<CheckCircle2 className="w-7 h-7 stroke-[2]" />}
            className="w-8 h-8"
            loop={false}
          />
        </div>
        <span className="text-xs font-bold text-status-success uppercase tracking-widest">
          Agendamento Confirmado!
        </span>
      </div>

      {/* VOUCHER / CÓDIGO DE RESERVA CARD */}
      {bookingCode && (
        <div className="bg-gradient-to-br from-gold-base/15 via-gold-base/10 to-gold-base/5 border border-gold-base/40 rounded-2xl p-4 text-center space-y-1.5 shadow-md animate-in zoom-in-95 duration-300">
          <div className="flex items-center justify-center gap-1.5 text-gold-base text-[11px] font-bold uppercase tracking-wider">
            <Ticket className="w-3.5 h-3.5" />
            <span>Código do Voucher / Agendamento</span>
          </div>

          <div className="flex items-center justify-center gap-2 pt-0.5">
            <span className="text-2xl font-black text-content-base tracking-widest font-mono select-all">
              {bookingCode}
            </span>
            <button
              type="button"
              onClick={handleCopyVoucher}
              className="p-2 rounded-xl bg-gold-base/20 hover:bg-gold-base/30 text-gold-base active:scale-95 transition-all flex items-center gap-1 text-xs font-bold"
              title="Copiar Código"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-status-success" />
                  <span className="text-status-success text-[10px]">Copiado</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span className="text-[10px]">Copiar</span>
                </>
              )}
            </button>
          </div>

          <p className="text-[11px] text-content-muted font-medium pt-1">
            🔑 Guarde este código! Ele será solicitado para consultar seu agendamento como visitante.
          </p>
        </div>
      )}

      {/* Quick Appointment Summary Card */}
      <div className="bg-border-subtle backdrop-blur-[10px] p-4 rounded-2xl border border-border-subtle text-left space-y-3">
        <div className="flex items-center justify-between border-b border-border-subtle pb-3">
          <div className="flex items-center space-x-2 text-xs text-content-muted">
            <User className="w-4 h-4 text-gold-base" />
            <span>Profissional:</span>
          </div>
          <span className="text-sm font-extrabold text-content-base">{selectedBarber?.name || 'Profissional'}</span>
        </div>

        <div className="border-b border-border-subtle pb-3 space-y-2">
          <div className="flex items-center justify-between text-xs text-content-muted">
            <div className="flex items-center space-x-2">
              <Scissors className="w-4 h-4 text-gold-base" />
              <span className="font-bold text-content-base">Serviços Selecionados:</span>
            </div>
            <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-gold-base font-bold">
              {selectedServices.length} {selectedServices.length === 1 ? 'item' : 'itens'}
            </span>
          </div>
          <div className="space-y-1.5 pt-1">
            {selectedServices.map(srv => (
              <div key={srv.id} className="flex justify-between items-center text-xs bg-surface-base/60 p-2.5 rounded-xl border border-border-subtle/40">
                <div className="flex flex-col min-w-0 pr-2">
                  <span className="text-content-base font-bold truncate">{srv.title}</span>
                  <span className="text-[10px] text-content-muted flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3 text-gold-base" />
                    {srv.duration_minutes} min
                  </span>
                </div>
                <span className="text-gold-base font-black shrink-0">R$ {srv.price.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between border-b border-border-subtle pb-3">
          <div className="flex items-center space-x-2 text-xs text-content-muted">
            <CalendarDays className="w-4 h-4 text-gold-base" />
            <span>Data e Horário:</span>
          </div>
          <span className="text-xs sm:text-sm font-bold text-content-base capitalize">
            {formattedDate} às <strong className="text-gold-base font-black">{selectedTimeSlot}</strong>
          </span>
        </div>

        <div className="flex items-center justify-between border-b border-border-subtle pb-3">
          <div className="flex items-center space-x-2 text-xs text-content-muted">
            <Clock className="w-4 h-4 text-gold-base" />
            <span>Duração Estimada:</span>
          </div>
          <span className="text-xs sm:text-sm font-bold text-content-base">{totalDuration} min</span>
        </div>

        <div className="flex items-center justify-between pt-0.5">
          <span className="text-xs text-content-muted font-medium">Valor Total:</span>
          <span className="text-base font-black text-status-success">R$ {totalPaid.toFixed(2)}</span>
        </div>
      </div>

      {/* Uncontained Notice */}
      <div className="space-y-1.5 py-1 text-center text-xs text-content-muted leading-relaxed max-w-xs mx-auto">
        <p className="font-bold text-content-base">Precisa cancelar ou reagendar?</p>
        <p>Solicite com pelo menos 2 horas de antecedência pelo menu "Meus Agendamentos" ou pelo WhatsApp.</p>
        <p className="text-content-muted font-medium">Agradecemos sua compreensão!</p>
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-2.5 pt-2">
        <button
          type="button"
          onClick={onResetBooking}
          className="flex-1 py-3.5 px-2 rounded-xl bg-surface-card/80 hover:bg-surface-card text-content-base border border-border-subtle text-xs font-bold hover:border-gold-base/50 flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all"
        >
          <PlusCircle className="w-4 h-4 shrink-0 text-content-base" />
          <span className="truncate">Novo</span>
        </button>

        <button
          type="button"
          onClick={onViewAppointments}
          className="flex-[1.6] py-3.5 px-2 rounded-xl bg-gold-base text-surface-base font-black text-xs uppercase tracking-wider hover:opacity-95 flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all"
        >
          <CalendarDays className="w-4 h-4 shrink-0 stroke-[2.5]" />
          <span className="truncate">Meus Agendamentos</span>
        </button>
      </div>
    </div>
  );
};
