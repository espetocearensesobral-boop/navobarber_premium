import React from 'react';
import { Bot, Sparkles, Clock, Wrench } from 'lucide-react';

export const OmnichannelBot: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4 animate-in fade-in duration-300">
      <div className="bg-surface-card border border-border-subtle rounded-3xl p-8 sm:p-12 text-center shadow-2xl relative overflow-hidden space-y-6">
        {/* Subtle background glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-gold-base/10 rounded-full blur-3xl pointer-events-none" />

        {/* Icon Badge */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-surface-card border border-[#FFFFFF]/30 text-gold-hover flex items-center justify-center mx-auto shadow-inner relative">
          <Bot className="w-8 h-8 sm:w-10 sm:h-10" />
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-gold-base text-surface-base rounded-full flex items-center justify-center">
            <Sparkles className="w-3 h-3" />
          </div>
        </div>

        {/* Title & Badge */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-base/10 border border-[#FFFFFF]/20 text-gold-hover text-xs font-extrabold uppercase tracking-widest">
            <Clock className="w-3.5 h-3.5" />
            <span>Em Desenvolvimento</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif text-content-base font-semibold tracking-tight">
            Assistente de Inteligência Artificial
          </h1>
        </div>

        {/* Descriptive Message */}
        <p className="text-sm text-content-muted max-w-md mx-auto leading-relaxed">
          Este menu está passando por melhorias e atualizações. Em breve você terá acesso ao assistente virtual integrado com IA para atendimento automatizado, agendamentos 24/7 e WhatsApp.
        </p>

        {/* Progress status card */}
        <div className="pt-4 max-w-sm mx-auto">
          <div className="bg-surface-card border border-border-subtle p-4 rounded-2xl text-left flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-surface-card text-gold-hover flex items-center justify-center shrink-0">
              <Wrench className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-content-base block">Módulo em Construção</span>
              <span className="text-[11px] text-content-muted block">Novidades e automações chegando em breve.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
