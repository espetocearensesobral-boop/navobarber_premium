import { authFetch } from '../../lib/api';
import React, { useRef, useState, useEffect } from 'react';
import { Appointment } from '../../types';
import {
  X,
  Download,
  Share2,
  MapPin,
  Calendar,
  Clock,
  User,
  Scissors,
  CheckCircle2,
  Copy,
  MessageCircle,
  AlertTriangle,
  XCircle,
  Loader2,
  Phone
} from 'lucide-react';
import { toPng } from 'html-to-image';
import { Star } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { createAppointmentInSupabase, cancelAppointmentInSupabase } from '../../services/supabaseDataService';

interface AppointmentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment | null;
  onAppointmentUpdated?: (updatedApt: Appointment) => void;
  onReviewClick?: () => void;
}

export const AppointmentDetailsModal: React.FC<AppointmentDetailsModalProps> = ({
  isOpen,
  onClose,
  appointment,
  onAppointmentUpdated,
  onReviewClick
}) => {
  const receiptRef = useRef<HTMLDivElement>(null);
  const [currentApt, setCurrentApt] = useState<Appointment | null>(appointment);
  const [copiedShare, setCopiedShare] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelToast, setCancelToast] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);


  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('Compromisso inesperado');
  const [cancelOtherReason, setCancelOtherReason] = useState('');

  const [isRescheduling, setIsRescheduling] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTimeSlot, setRescheduleTimeSlot] = useState('');
  const [busySlots, setBusySlots] = useState<string[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  const baseSlots = [
    { time: '08:00' }, { time: '08:30' }, { time: '09:00' }, { time: '09:30' },
    { time: '10:00' }, { time: '10:30' }, { time: '11:00' }, { time: '11:30' },
    { time: '13:00' }, { time: '13:30' }, { time: '14:00' }, { time: '14:30' },
    { time: '15:00' }, { time: '15:30' }, { time: '16:00' }, { time: '16:30' },
    { time: '17:00' }, { time: '17:30' }, { time: '18:00' }, { time: '18:30' },
    { time: '19:00' }
  ];

  useEffect(() => {
    let isMounted = true;
    const fetchAvailability = async () => {
      if (!rescheduleDate || !currentApt?.professional_id) return;
      setIsLoadingSlots(true);
      try {
        const response = await authFetch('/api/appointments');
        if (response.ok) {
          const appointments = await response.json();
          const activeApts = appointments.filter((apt: any) => 
            apt.status !== 'cancelled' &&
            apt.date === rescheduleDate &&
            apt.professionalId === currentApt.professional_id &&
            apt.id !== currentApt.id
          );
          
          const bookedTimes = activeApts.map((apt: any) => apt.timeSlot || apt.time_slot);
          if (isMounted) setBusySlots(bookedTimes);
        }
      } catch (err) {
        console.warn('Failed to fetch availability:', err);
      } finally {
        if (isMounted) setIsLoadingSlots(false);
      }
    };
    if (showRescheduleModal) fetchAvailability();
    return () => { isMounted = false; };
  }, [rescheduleDate, currentApt, showRescheduleModal]);

  const handleConfirmReschedule = async () => {
    if (!currentApt || !rescheduleDate || !rescheduleTimeSlot) return;
    setIsRescheduling(true);
    try {
      const res = await authFetch(`/api/appointments/${currentApt.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          date: rescheduleDate,
          timeSlot: rescheduleTimeSlot,
          time_slot: rescheduleTimeSlot
        })
      });

      if (!res.ok) throw new Error('Falha ao reagendar');
      
      const updatedApt = {
        ...currentApt,
        date: rescheduleDate,
        timeSlot: rescheduleTimeSlot,
        time_slot: rescheduleTimeSlot
      };
      
      setCurrentApt(updatedApt);
      if (onAppointmentUpdated) {
        onAppointmentUpdated(updatedApt);
      }
      setShowRescheduleModal(false);
    } catch (err) {
      console.warn('Erro ao reagendar:', err);
      alert('Erro ao reagendar. Tente novamente.');
    } finally {
      setIsRescheduling(false);
    }
  };

  useEffect(() => {
    setCurrentApt(appointment);
    setShowCancelModal(false);
    setCancelToast(false);
    setCancelError(null);
  }, [appointment]);

  if (!isOpen || !currentApt) return null;

  const isCancelled = currentApt.status === 'cancelled' || currentApt.status === 'cancelado';

  // Format Date nicely
  const formatDateDisplay = (dateStr: string) => {
    try {
      const [year, month, day] = dateStr.split('-').map(Number);
      if (year && month && day) {
        const d = new Date(year, month - 1, day);
        return d.toLocaleDateString('pt-BR', {
          weekday: 'short',
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        });
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  const handleDownloadPDF = async () => {
    if (!receiptRef.current) return;
    setIsDownloading(true);
    try {
      const imgData = await toPng(receiptRef.current, {
        pixelRatio: 3,
        backgroundColor: '#1A1A1A',
        cacheBust: true,
      });

      const img = new Image();
      img.src = imgData;
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      const naturalWidth = img.naturalWidth || 1;
      const naturalHeight = img.naturalHeight || 1;
      const aspectRatio = naturalHeight / naturalWidth;

      const pdfWidthMm = 105;
      const pdfHeightMm = pdfWidthMm * aspectRatio;

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [pdfWidthMm, pdfHeightMm]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidthMm, pdfHeightMm, undefined, 'FAST');
      pdf.save(`comprovante-barberx-${currentApt.id.substring(0, 8)}.pdf`);
    } catch (error) {
      console.warn('Error generating PDF', error);
    } finally {
      setIsDownloading(false);
    }
  };

  // Google Calendar URL Generator
  const getGoogleCalendarUrl = () => {
    const title = encodeURIComponent(`BarberX - ${currentApt.services?.[0]?.title || 'Agendamento'}`);
    const details = encodeURIComponent(
      `Agendamento BarberX\nBarbeiro: ${currentApt.professional_name}\nServiços: ${(currentApt.services || []).map(s => s.title).join(', ')}\nLocal: BarberX Premium - Rua dos Barões, 1420 - Jardins`
    );
    const location = encodeURIComponent('BarberX Premium - Rua dos Barões, 1420 - Jardins');
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}`;
  };

  // WhatsApp Message Link Generator
  const getWhatsAppUrl = () => {
    const text = encodeURIComponent(
      `💈 *BARBERX PREMIUM*\n\nOlá! Gostaria de falar sobre o meu agendamento:\n\n📋 *Voucher:* #${currentApt.id.replace('apt_', '').substring(0, 8)}\n📅 *Data:* ${currentApt.date}\n⏰ *Horário:* ${currentApt.time_slot}\n✂️ *Barbeiro:* ${currentApt.professional_name}`
    );
    return `https://api.whatsapp.com/send?text=${text}`;
  };

  // Google Maps Link
  const getMapsUrl = () => {
    return 'https://maps.google.com/?q=Rua+dos+Baroes+1420+Jardins';
  };

  // Confirm cancellation logic
  const handleConfirmCancel = async () => {
    setIsCancelling(true);
    setCancelError(null);
    try {
      const fullReason = cancelReason === 'Outro' ? cancelOtherReason : cancelReason;
      const res = await cancelAppointmentInSupabase(currentApt.id, { ...currentApt, cancellation_reason: fullReason });
      if (res.success && res.appointment) {
        setCurrentApt(res.appointment);
        if (onAppointmentUpdated) {
          onAppointmentUpdated(res.appointment);
        }
        setShowCancelModal(false);
        setCancelToast(true);
        setTimeout(() => setCancelToast(false), 5000);
      } else {
        setCancelError(res.error || 'Falha ao cancelar o agendamento.');
      }
    } catch (err: any) {
      console.warn('Erro ao cancelar agendamento:', err);
      setCancelError('Ocorreu um erro ao cancelar. Tente novamente.');
    } finally {
      setIsCancelling(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_queue':
        return 'bg-status-warning/20 text-[#FF8C00] border-status-warning/30';
      case 'in_service':
        return 'bg-status-success/20 text-status-success border-status-success/30';
      case 'confirmed':
        return 'bg-status-success/20 text-status-success border-status-success/30';
      case 'cancelled':
      case 'cancelado':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-surface-card text-content-muted border-border-subtle';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'in_queue':
        return '⏳ Em Fila de Espera';
      case 'in_service':
        return '✂️ Em Atendimento';
      case 'confirmed':
        return '✓ Agendamento Confirmado';
      case 'cancelled':
      case 'cancelado':
        return '❌ Agendamento Cancelado';
      default:
        return 'Status Desconhecido';
    }
  };

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'pix':
        return 'PIX';
      case 'credit_card':
        return 'Cartão de Crédito';
      case 'debit_card':
        return 'Cartão de Débito';
      case 'pay_at_venue':
        return 'Pagar na Barbearia';
      case 'Pagamento no Local':
        return 'Pagamento no Local';
      default:
        return method || 'Presencial';
    }
  };

  return (
    <>
      {/* Main Voucher/Receipt Modal */}
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-surface-base/70 backdrop-blur-md animate-in fade-in duration-200">
        <div className="w-full sm:w-[440px] bg-surface-card rounded-3xl border border-border-subtle shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden flex flex-col max-h-[92vh]">
          {/* Top Header */}
          <div className="p-4 border-b border-border-subtle flex items-center justify-between sticky top-0 bg-surface-base/95 backdrop-blur-md z-10">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-gold-base text-surface-base flex items-center justify-center text-surface-base shadow-md">
                <Scissors className="w-4 h-4 stroke-[2.5]" />
              </div>
              <h2 className="text-base font-serif text-content-base font-semibold">Comprovante de Agendamento</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-border-subtle text-content-muted hover:text-content-base transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="overflow-y-auto overflow-x-hidden p-4 space-y-4">
            {/* Success Toast when cancelled */}
            {cancelToast && (
              <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-xl flex items-center space-x-2.5 text-xs text-red-300 animate-in fade-in slide-in-from-top-2">
                <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span className="font-semibold">Agendamento cancelado com sucesso.</span>
              </div>
            )}

            {/* Receipt Content Card (Exportable to PDF) */}
            <div
              ref={receiptRef}
              className="bg-surface-base/90 p-5 rounded-2xl border border-border-subtle space-y-5 relative overflow-hidden shadow-inner"
            >
              {/* Header / Logo */}
              <div className="flex flex-col items-center space-y-1.5 border-b border-border-subtle pb-4">
                <div className="w-11 h-11 rounded-xl bg-gold-base text-surface-base flex items-center justify-center text-surface-base shadow-lg">
                  <Scissors className="w-5 h-5 stroke-[2.5]" />
                </div>
                <h3 className="text-lg font-serif text-content-base font-semibold uppercase tracking-widest">BARBERX</h3>
                <p className="text-[10px] text-content-muted font-mono uppercase tracking-wider text-center">
                  VOUCHER #{currentApt.id.replace('apt_', '').substring(0, 8)}
                </p>
              </div>

              {/* Status Badge */}
              <div className="flex justify-center">
                <span
                  className={`px-3.5 py-1.5 rounded-full text-xs font-black border shadow-sm ${getStatusColor(
                    currentApt.status
                  )}`}
                >
                  {getStatusText(currentApt.status)}
                </span>
              </div>

              {/* Details List */}
              <div className="space-y-3.5 text-xs">
                {/* Profissional */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-border-subtle border border-border-subtle">
                  <div className="flex items-center space-x-2.5">
                    <User className="w-4 h-4 text-gold-base" />
                    <span className="text-content-muted font-medium">Profissional:</span>
                  </div>
                  <span className="font-extrabold text-content-base text-sm">{currentApt.professional_name}</span>
                </div>

                {/* Data e Hora */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-border-subtle border border-border-subtle">
                  <div className="flex items-center space-x-2.5">
                    <Calendar className="w-4 h-4 text-gold-base" />
                    <span className="text-content-muted font-medium">Data e Hora:</span>
                  </div>
                  <div className="flex items-center space-x-1.5 font-bold text-content-base text-xs sm:text-sm">
                    <span className="capitalize">{formatDateDisplay(currentApt.date)}</span>
                    <span className="text-content-muted">•</span>
                    <Clock className="w-3.5 h-3.5 text-gold-base" />
                    <span className="text-gold-base font-black">{currentApt.time_slot}</span>
                  </div>
                </div>

                {/* Cliente */}
                {currentApt.client_name && (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-border-subtle border border-border-subtle">
                    <div className="flex items-center space-x-2.5">
                      <Phone className="w-4 h-4 text-content-base" />
                      <span className="text-content-muted font-medium">Cliente:</span>
                    </div>
                    <div className="text-right">
                      <span className="block font-bold text-content-base text-xs">{currentApt.client_name}</span>
                      {currentApt.client_phone && (
                        <span className="block text-[10px] text-content-muted">{currentApt.client_phone}</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Localização */}
                <div className="flex items-start space-x-2.5 p-2.5 rounded-xl bg-border-subtle border border-border-subtle">
                  <MapPin className="w-4 h-4 text-gold-base shrink-0 mt-0.5" />
                  <div>
                    <span className="block text-content-muted font-medium text-[11px]">Localização</span>
                    <span className="block font-bold text-content-base">BarberX Premium</span>
                    <span className="block text-[10px] text-content-muted">Rua dos Barões, 1420 - Jardins</span>
                  </div>
                </div>
              </div>

              {/* Services List */}
              <div className="pt-3 border-t border-border-subtle space-y-2">
                <span className="block text-[11px] font-bold text-content-muted uppercase tracking-wider">
                  Serviços Contratados ({currentApt.total_duration_minutes} min)
                </span>
                <div className="space-y-1.5">
                  {(currentApt.services || []).map((service, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center text-xs py-1 px-2 rounded bg-border-subtle"
                    >
                      <span className="font-semibold text-content-base">• {service.title}</span>
                      <span className="font-bold text-content-base">R$ {service.price.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Totals */}
              <div className="pt-3 border-t border-border-subtle space-y-1.5 text-xs">
                <div className="flex justify-between items-center text-content-muted">
                  <span>Subtotal</span>
                  <span>R$ {(currentApt.original_amount || currentApt.final_amount).toFixed(2)}</span>
                </div>
                {Number(currentApt.discount_amount) > 0 && (
                  <div className="flex justify-between items-center text-status-success font-semibold">
                    <span>Desconto</span>
                    <span>- R$ {Number(currentApt.discount_amount).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-sm font-serif text-content-base font-semibold pt-1 border-t border-border-subtle">
                  <span>Total</span>
                  <span className="text-status-success font-black text-base">
                    R$ {Number(currentApt.final_amount).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[10px] text-content-muted font-medium pt-1">
                  <span>Forma de Pagamento</span>
                  <span className="font-bold text-content-base uppercase">
                    {getPaymentMethodText(currentApt.payment_method)}
                  </span>
                </div>
              </div>

              {/* Background Watermark */}
              <div className="absolute -bottom-8 -right-8 opacity-5 pointer-events-none">
                <Scissors className="w-36 h-36" />
              </div>
            </div>

            {/* Structured Action Buttons Grid */}
            <div className="space-y-2 pt-1">
              {/* Row 1: Baixar PDF & Localização */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={handleDownloadPDF}
                  disabled={isDownloading}
                  className="py-3 px-3 rounded-xl bg-border-subtle border border-border-subtle hover:bg-surface-card text-content-base font-bold flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
                >
                  {isDownloading ? (
                    <>
                      <Loader2 className="w-4 h-4 text-gold-base animate-spin" />
                      <span>Gerando...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 text-content-base" />
                      <span>Baixar PDF</span>
                    </>
                  )}
                </button>

                <a
                  href={getMapsUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3 px-3 rounded-xl bg-border-subtle border border-border-subtle hover:bg-surface-card text-content-base font-bold flex items-center justify-center space-x-2 transition-all"
                >
                  <MapPin className="w-4 h-4 text-status-success" />
                  <span>Localização</span>
                </a>
              </div>

              {/* Row 2: Google Agenda & WhatsApp */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <a
                  href={getGoogleCalendarUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3 px-3 rounded-xl bg-border-subtle border border-border-subtle hover:bg-surface-card text-content-base font-bold flex items-center justify-center space-x-2 transition-all"
                >
                  <Calendar className="w-4 h-4 text-gold-base" />
                  <span>Google Agenda</span>
                </a>

                <a
                  href={getWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3 px-3 rounded-xl bg-border-subtle border border-border-subtle hover:bg-surface-card text-content-base font-bold flex items-center justify-center space-x-2 transition-all"
                >
                  <MessageCircle className="w-4 h-4 text-status-success" />
                  <span>WhatsApp</span>
                </a>
              </div>

              {/* Row 3: Conditional Action */}
              {currentApt.status === 'completed' && !currentApt.is_reviewed && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onReviewClick) onReviewClick();
                  }}
                  className="w-full py-3 rounded-xl bg-gold-base text-surface-base font-bold flex items-center justify-center space-x-2 transition-all active:scale-95 hover:opacity-95 shadow-lg shadow-gold-base/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-base mt-1"
                >
                  <Star className="w-4 h-4 fill-surface-base" />
                  <span>Avaliar Serviço</span>
                </button>
              )}
              {!isCancelled && currentApt.status !== 'completed' ? (
                <button
                  type="button"
                  onClick={() => setShowCancelModal(true)}
                  className="w-full py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold flex items-center justify-center space-x-2 transition-all mt-1"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Cancelar Agendamento</span>
                </button>
              ) : (
                <div className="w-full py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold text-center flex items-center justify-center space-x-2">
                  <XCircle className="w-4 h-4" />
                  <span>Agendamento Cancelado</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Cancellation */}
      {showCancelModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-surface-base/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full sm:w-[380px] bg-surface-card rounded-2xl border border-red-500/30 shadow-2xl p-5 text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center mx-auto text-red-400">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-serif text-content-base font-semibold">Cancelar Agendamento?</h3>
              <p className="text-xs text-content-base">
                Tem certeza de que deseja cancelar este agendamento?
              </p>
            </div>

            {/* Summary inside confirmation modal */}
            <div className="bg-border-subtle p-3 rounded-xl border border-border-subtle text-left text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-content-muted">Profissional:</span>
                <span className="font-bold text-content-base">{currentApt.professional_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-content-muted">Data e Hora:</span>
                <span className="font-bold text-content-base">{currentApt.date} às {currentApt.time_slot}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-content-muted">Serviço:</span>
                <span className="font-bold text-content-base truncate max-w-[180px]">
                  {(currentApt.services || []).map(s => s.title).join(', ')}
                </span>
              </div>
            </div>

            <div className="bg-red-500/10 p-2.5 rounded-lg text-[11px] text-red-300 text-left border border-red-500/20">
              ⚠️ Esta ação desmarcará seu horário e liberará a vaga para outros clientes.
            </div>

            {cancelError && (
              <div className="bg-red-500/20 p-2.5 rounded-lg text-xs text-red-200 text-left border border-red-500/40">
                ❌ {cancelError}
              </div>
            )}
            
            <div className="space-y-2 pt-1 text-xs">
              <button
                type="button"
                onClick={() => {
                  setRescheduleDate(currentApt?.date || '');
                  setRescheduleTimeSlot(currentApt?.time_slot || currentApt?.timeSlot || '');
                  setShowCancelModal(false);
                  setShowRescheduleModal(true);
                }}
                disabled={isCancelling}
                className="w-full py-3 rounded-xl bg-gold-base/10 border border-gold-base/30 hover:bg-gold-base/20 text-content-base font-bold flex items-center justify-center space-x-1.5 transition-all disabled:opacity-50"
              >
                <Calendar className="w-4 h-4" />
                <span>Reagendar</span>
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setShowCancelModal(false)}
                  disabled={isCancelling}
                  className="py-3 rounded-xl bg-surface-card hover:bg-neutral-700 text-content-base font-bold transition-all disabled:opacity-50"
                >
                  Manter Agendamento
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCancel}
                  disabled={isCancelling}
                  className="py-3 rounded-xl bg-red-600 hover:bg-red-700 text-content-base font-bold transition-all flex items-center justify-center space-x-1.5 disabled:opacity-50"
                >
                  {isCancelling ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Cancelando...</span>
                    </>
                  ) : (
                    <span>Sim, Cancelar</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {showRescheduleModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-surface-base/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full sm:w-[380px] bg-surface-card rounded-2xl border border-border-subtle shadow-2xl p-5 space-y-5 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-serif text-content-base font-semibold">Reagendar</h3>
              <button onClick={() => setShowRescheduleModal(false)} className="p-2 -mr-2 text-content-muted hover:text-content-base rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Date Selection */}
              <div className="space-y-2">
                <label className="text-content-muted font-medium">Data do Agendamento</label>
                <div className="relative">
                  <input
                    type="date"
                    value={rescheduleDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => {
                      setRescheduleDate(e.target.value);
                      setRescheduleTimeSlot(''); // reset time when date changes
                    }}
                    className="w-full bg-surface-base border border-border-subtle rounded-xl px-4 py-3 text-content-base focus:outline-none focus:border-gold-base"
                  />
                  <Calendar className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-content-muted pointer-events-none" />
                </div>
              </div>

              {/* Time Selection */}
              <div className="space-y-2">
                <label className="text-content-muted font-medium flex items-center justify-between">
                  <span>Horário Disponível</span>
                  {isLoadingSlots && <Loader2 className="w-3 h-3 animate-spin text-gold-base" />}
                </label>
                <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto pr-1">
                  {baseSlots.map((slot) => {
                    const isBusy = busySlots.includes(slot.time);
                    const isSelected = rescheduleTimeSlot === slot.time;
                    return (
                      <button
                        key={slot.time}
                        disabled={isBusy}
                        onClick={() => setRescheduleTimeSlot(slot.time)}
                        className={`py-2 rounded-lg text-center font-bold transition-all border ${
                          isSelected
                            ? 'bg-content-base text-surface-base border-content-base'
                            : isBusy
                            ? 'bg-border-subtle border-transparent text-content-muted opacity-50 cursor-not-allowed'
                            : 'bg-border-subtle border-border-subtle text-content-base hover:border-gold-base/50 hover:bg-surface-card'
                        }`}
                      >
                        {slot.time}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-surface-base border border-border-subtle flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <span className="text-content-muted text-xs">Serviços mantidos</span>
                <span className="text-content-base font-bold text-xs">{currentApt?.services?.length || 1} serviço(s)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-content-muted text-xs">Diferença de valor</span>
                <span className="text-status-success font-bold text-xs">R$ 0,00</span>
              </div>
              <p className="text-[10px] text-content-muted mt-1 opacity-70">O valor original foi mantido para este reagendamento.</p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
              <button
                type="button"
                onClick={() => setShowRescheduleModal(false)}
                disabled={isRescheduling}
                className="py-3 rounded-xl bg-surface-card hover:bg-neutral-700 text-content-base font-bold transition-all disabled:opacity-50"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={handleConfirmReschedule}
                disabled={isRescheduling || !rescheduleDate || !rescheduleTimeSlot}
                className="py-3 rounded-xl bg-content-base hover:bg-gold-base text-surface-base font-bold transition-all flex items-center justify-center space-x-1.5 disabled:opacity-50"
              >
                {isRescheduling ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Salvando...</span>
                  </>
                ) : (
                  <span>Confirmar</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
