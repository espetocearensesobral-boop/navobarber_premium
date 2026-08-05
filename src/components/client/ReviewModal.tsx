import React, { useState } from 'react';
import { Appointment } from '../../types';
import { authFetch } from '../../lib/api';
import { X, Star, Loader2, CheckCircle2 } from 'lucide-react';
import { hapticSuccess } from '../../lib/haptics';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment;
  onSuccess: (appointmentId: string) => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({ isOpen, onClose, appointment, onSuccess }) => {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await authFetch(`/api/appointments/${appointment.id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, comment })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erro ao enviar avaliação.');
      }

      setSuccess(true);
      hapticSuccess();
      setTimeout(() => {
        onSuccess(appointment.id);
      }, 2000);
    } catch (err: any) {
      setError(err.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-surface-base/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-surface-card rounded-2xl border border-border-subtle shadow-2xl p-6 relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-surface-base rounded-full text-content-muted hover:text-content-base focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-base"
        >
          <X className="w-5 h-5" />
        </button>

        {success ? (
          <div className="py-8 text-center space-y-4 animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-full bg-status-success/20 border border-status-success/30 text-status-success mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-content-base">Avaliação Enviada!</h3>
              <p className="text-sm text-content-muted mt-1">Obrigado por nos ajudar a melhorar.</p>
            </div>
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <h2 className="text-xl font-serif font-bold text-content-base mb-1">Avaliar Atendimento</h2>
              <p className="text-xs text-content-muted">Como foi seu corte com {appointment.professional_name}?</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex justify-center space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-base rounded-full p-1 transition-transform hover:scale-110"
                  >
                    <Star 
                      className={`w-8 h-8 ${
                        star <= (hoverRating || rating) 
                          ? 'fill-gold-base text-gold-base drop-shadow-[0_0_8px_rgba(201,169,110,0.4)]' 
                          : 'fill-transparent text-border-subtle'
                      } transition-colors duration-200`} 
                    />
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-xs font-bold text-content-muted mb-2">Comentário (opcional)</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="O que achou do serviço?"
                  className="w-full bg-surface-base border border-border-subtle rounded-xl p-3 text-sm text-content-base placeholder:text-content-muted/50 focus:border-gold-base focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-base min-h-[100px] resize-none"
                  maxLength={500}
                />
                <div className="text-[10px] text-content-muted text-right mt-1">
                  {comment.length}/500
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-status-error/10 border border-status-error/20 text-status-error text-xs font-medium">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting || rating === 0}
                className="w-full py-3 rounded-xl bg-gold-base text-surface-base font-bold transition-all flex items-center justify-center disabled:opacity-50 active:scale-95 hover:opacity-95 shadow-lg shadow-gold-base/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-base focus-visible:ring-offset-2 focus-visible:ring-offset-surface-base"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Enviando...
                  </>
                ) : (
                  'Enviar Avaliação'
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
