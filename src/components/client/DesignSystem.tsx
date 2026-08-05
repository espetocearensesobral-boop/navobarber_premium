import React from 'react';
import { ArrowLeft, CheckCircle2, AlertTriangle, Info, AlertOctagon } from 'lucide-react';

export const DesignSystem: React.FC = () => {
  return (
    <div className="min-h-[100dvh] bg-surface-base text-content-base overflow-y-auto p-4 sm:p-8 space-y-12 pb-32">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display text-gold-base mb-2">Design System</h1>
          <p className="text-content-muted">Monarca BarberX - Identity & Tokens</p>
        </div>
        <button 
          onClick={() => window.location.href = '/'}
          className="p-3 rounded-full bg-surface-card border border-border-subtle hover:border-gold-base/50 text-content-base hover:text-gold-base transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="hidden sm:inline text-sm font-bold uppercase tracking-wider">Voltar ao App</span>
        </button>
      </div>

      
      <section className="space-y-6">
        <h2 className="text-xl font-serif border-b border-border-subtle pb-2">Temas (Aparência)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-6 rounded-card border border-border-subtle bg-[#000000] text-[#F2EFE7]">
            <h3 className="text-lg font-bold font-serif mb-2">Noir (Tema Escuro)</h3>
            <p className="text-sm opacity-60 mb-4">Luxo moderno, vida noturna, drama e contraste. O padrão da marca.</p>
            <div className="flex gap-2">
              <div className="w-8 h-8 rounded bg-[#121212] border border-white/10"></div>
              <div className="w-8 h-8 rounded bg-[#C9A96E]"></div>
            </div>
          </div>
          <div className="p-6 rounded-card border border-border-subtle bg-[#F5F1E8] text-[#1C1917]">
            <h3 className="text-lg font-bold font-serif mb-2">Heritage (Tema Claro)</h3>
            <p className="text-sm opacity-60 mb-4">Barbearia clássica, papel marfim, tinta escura e latão. A tradição.</p>
            <div className="flex gap-2">
              <div className="w-8 h-8 rounded bg-[#FFFDF8] border border-black/10"></div>
              <div className="w-8 h-8 rounded bg-[#C9A96E]"></div>
              <div className="w-8 h-8 rounded bg-[#8B6332]"></div>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-xl font-serif border-b border-border-subtle pb-2">1. Cores Base (Core Palette)</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <div className="h-24 rounded-lg bg-surface-base border border-border-subtle shadow-card flex items-end p-3">
              <span className="text-xs font-mono font-bold text-content-muted">#000000</span>
            </div>
            <p className="text-sm font-bold uppercase tracking-wider">Surface Base</p>
            <p className="text-xs text-content-muted">Background principal</p>
          </div>
          <div className="space-y-2">
            <div className="h-24 rounded-lg bg-surface-card border border-border-subtle shadow-card flex items-end p-3">
              <span className="text-xs font-mono font-bold text-content-muted">#121212</span>
            </div>
            <p className="text-sm font-bold uppercase tracking-wider">Surface Card</p>
            <p className="text-xs text-content-muted">Cards, containers</p>
          </div>
          <div className="space-y-2">
            <div className="h-24 rounded-lg bg-gold-base shadow-card flex items-end p-3">
              <span className="text-xs font-mono font-bold text-surface-base">#C9A96E</span>
            </div>
            <p className="text-sm font-bold uppercase tracking-wider">Gold Base</p>
            <p className="text-xs text-content-muted">Acentos, botões</p>
          </div>
          <div className="space-y-2">
            <div className="h-24 rounded-lg bg-content-base shadow-card flex items-end p-3">
              <span className="text-xs font-mono font-bold text-surface-base">#F2EFE7</span>
            </div>
            <p className="text-sm font-bold uppercase tracking-wider">Content Base</p>
            <p className="text-xs text-content-muted">Texto principal</p>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-xl font-serif border-b border-border-subtle pb-2">2. Status & Cores Semânticas</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-status-success/10 border border-status-success/30 flex flex-col gap-3">
            <CheckCircle2 className="w-6 h-6 text-status-success" />
            <div>
              <p className="text-sm font-bold uppercase text-status-success">Success</p>
              <p className="text-xs text-content-muted mt-1">#10B981 (Esmeralda)</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-status-warning/10 border border-status-warning/30 flex flex-col gap-3">
            <AlertTriangle className="w-6 h-6 text-status-warning" />
            <div>
              <p className="text-sm font-bold uppercase text-status-warning">Warning</p>
              <p className="text-xs text-content-muted mt-1">#F59E0B (Âmbar)</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-status-error/10 border border-status-error/30 flex flex-col gap-3">
            <AlertOctagon className="w-6 h-6 text-status-error" />
            <div>
              <p className="text-sm font-bold uppercase text-status-error">Error</p>
              <p className="text-xs text-content-muted mt-1">#EF4444 (Vermelho)</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-status-info/10 border border-status-info/30 flex flex-col gap-3">
            <Info className="w-6 h-6 text-status-info" />
            <div>
              <p className="text-sm font-bold uppercase text-status-info">Info</p>
              <p className="text-xs text-content-muted mt-1">#3B82F6 (Azul)</p>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-xl font-serif border-b border-border-subtle pb-2">3. Tipografia</h2>
        <div className="space-y-8">
          <div>
            <h3 className="text-display-lg text-content-base">Display (Playfair)</h3>
            <p className="text-sm text-content-muted mt-2">Usado em grandes chamadas hero. Letter-spacing negativo.</p>
          </div>
          <div>
            <h3 className="text-section text-content-base">Section Title (Playfair)</h3>
            <p className="text-sm text-content-muted mt-2">Usado em títulos de seções e modais.</p>
          </div>
          <div className="space-y-4 bg-surface-card p-6 rounded-card border border-border-subtle">
            <p className="text-base text-content-base"><strong>Body Text (Inter)</strong> - Texto corrido principal. O ofício exige <em className="italic text-gold-base">dedicação</em>. 16px Base.</p>
            <p className="text-sm text-content-muted">Texto Secundário (Muted) - Agora ajustado com 65% de opacidade para aprovação WCAG AA.</p>
            <p className="text-xs font-bold uppercase tracking-widest text-gold-base">Label & Eyebrow Text</p>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-xl font-serif border-b border-border-subtle pb-2">4. Interações & Botões</h2>
        <div className="flex flex-wrap gap-6 items-end p-8 bg-surface-card rounded-card border border-border-subtle">
          <div className="space-y-3">
            <p className="text-xs font-bold text-content-muted uppercase tracking-wider">CTA Principal</p>
            <button className="px-8 py-3.5 rounded-full bg-gold-base text-surface-base font-extrabold text-xs uppercase tracking-widest shadow-md hover:opacity-95 active:scale-95 transition-all">
              Agendar Horário
            </button>
          </div>
          
          <div className="space-y-3">
            <p className="text-xs font-bold text-content-muted uppercase tracking-wider">Secundário</p>
            <button className="px-6 py-3 rounded-full border border-border-subtle bg-surface-base hover:bg-surface-card text-content-base font-bold text-sm transition-all active:scale-95">
              Cancelar
            </button>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-bold text-content-muted uppercase tracking-wider">Ação Icon</p>
            <button className="w-10 h-10 rounded-full border border-border-subtle bg-border-subtle hover:bg-surface-card hover:border-gold-base/50 flex items-center justify-center text-gold-base transition-all active:scale-95 shadow-md">
              <CheckCircle2 className="w-5 h-5" />
            </button>
          </div>
          
          <div className="space-y-3 w-full mt-4">
            <p className="text-xs font-bold text-content-muted uppercase tracking-wider">Focus Ring (Acessibilidade)</p>
            <input 
              type="text" 
              placeholder="Clique para testar o foco..." 
              className="w-full bg-surface-base border border-border-subtle rounded-input px-4 py-3 text-sm text-content-base placeholder:text-content-muted/50 focus:border-gold-base/50 transition-colors"
            />
          </div>
        </div>
      </section>
    </div>
  );
};
