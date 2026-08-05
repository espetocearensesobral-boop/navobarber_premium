import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { hapticLight, hapticMedium } from '../../lib/haptics';
import { 
  Scissors, 
  Calendar, 
  Clock, 
  Sparkles, 
  Star, 
  MapPin, 
  Phone, 
  ShieldCheck, 
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Crown, 
  Award, 
  Download, 
  MessageSquare, 
  Camera, 
  User,
  Coffee,
  Wifi,
  Tv,
  Check,
  ArrowRight,
  Droplet,
  X,
  ExternalLink,
  Mail,
  Instagram,
  Copy
} from 'lucide-react';

interface ClientHomeProps {
  currentUser: any;
  isGuest: boolean;
  upcomingCount: number;
  onGoToBooking: () => void;
  onGoToAppointments: () => void;
  onOpenLogin: () => void;
  onOpenProfile: () => void;
  onOpenSubscriptions: () => void;
  onOpenLoyalty: () => void;
}

export const ClientHome: React.FC<ClientHomeProps> = ({
  currentUser,
  isGuest,
  upcomingCount,
  onGoToBooking,
  onGoToAppointments,
  onOpenLogin,
  onOpenProfile,
  onOpenSubscriptions,
  onOpenLoyalty,
}) => {
  const [installedAppPrompt, setInstalledAppPrompt] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeModal, setActiveModal] = useState<'location' | 'hours' | 'contact' | null>(null);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 120) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleInstallApp = () => {
    hapticMedium();
    setInstalledAppPrompt(true);
    setTimeout(() => setInstalledAppPrompt(false), 4000);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="pb-12 text-content-base w-full flex-1 flex flex-col">
      {/* ===== HERO SECTION ===== */}
      <section id="hero-section" className="relative overflow-hidden min-h-[calc(100svh-10rem)] sm:min-h-[600px] flex flex-col justify-between pt-12 sm:pt-20 px-4 sm:px-6 mb-10 shrink-0 snap-center">
        {/* Background Image with Dark Gradient Overlays */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=75&w=800&auto=format&fit=crop" 
            alt="Monarca BarberX Barbershop"
            className="w-full h-full object-cover object-center opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface-base via-surface-base/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-surface-base via-surface-base/60 to-transparent" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 p-5 sm:p-10 space-y-5 sm:space-y-7 max-w-3xl mx-auto text-center flex-1 flex flex-col items-center justify-center">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 sm:gap-3 text-gold-deep text-xs sm:text-sm font-bold uppercase tracking-[0.2em] sm:tracking-[0.25em] justify-center">
            <span className="w-6 sm:w-8 h-[1.5px] bg-gold-deep inline-block" />
            <span>BARBEARIA ARTESANAL DESDE 2012</span>
            <span className="w-6 sm:w-8 h-[1.5px] bg-gold-deep inline-block" />
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-normal font-serif text-content-base leading-[1.15] sm:leading-[1.1] tracking-tight text-center">
            A arte da barba,<br />
            o <em className="italic text-gold-base font-serif">ofício</em> do corte.
          </h1>

          {/* Lead Paragraph */}
          <p className="text-sm sm:text-base md:text-lg text-content-muted leading-relaxed max-w-xl font-sans text-center mx-auto">
            Um espaço pensado para o cavalheiro que valoriza detalhes. Técnica apurada, navalha afiada e atendimento sob medida — do primeiro corte ao ritual completo.
          </p>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col items-center gap-3 w-full">
            <button
              onClick={() => {
                hapticMedium();
                onGoToBooking();
              }}
              className="px-8 py-4 rounded-full bg-gold-base text-surface-base font-extrabold text-xs sm:text-sm uppercase tracking-widest shadow-md hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-2.5"
            >
              <motion.div whileHover={{ scale: 1.1, rotate: [-5, 5, -5, 0] }} transition={{ duration: 0.5 }}><Calendar className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" /></motion.div>
              <span>AGENDAR HORÁRIO</span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-1" />
            </button>

            {/* Quick Action Circular Icon Buttons */}
            <div className="flex items-center justify-center gap-3 pt-1">
              <button
                onClick={() => {
                  hapticLight();
                  setActiveModal('location');
                }}
                className="w-10 h-10 rounded-full border border-border-subtle bg-border-subtle hover:bg-surface-card hover:border-gold-base/50 flex items-center justify-center text-gold-base transition-all active:scale-95 shadow-md group"
                title="Endereço & Mapa"
                aria-label="Endereço e Mapa"
              >
                <motion.div animate={{ y: [0, -2, 0] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}><MapPin className="w-4 h-4" /></motion.div>
              </button>

              <button
                onClick={() => {
                  hapticLight();
                  setActiveModal('hours');
                }}
                className="w-10 h-10 rounded-full border border-border-subtle bg-border-subtle hover:bg-surface-card hover:border-gold-base/50 flex items-center justify-center text-gold-base transition-all active:scale-95 shadow-md group"
                title="Horário de Funcionamento"
                aria-label="Horário de Funcionamento"
              >
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 10, ease: "linear" }}><Clock className="w-4 h-4" /></motion.div>
              </button>

              <button
                onClick={() => {
                  hapticLight();
                  setActiveModal('contact');
                }}
                className="w-10 h-10 rounded-full border border-border-subtle bg-border-subtle hover:bg-surface-card hover:border-gold-base/50 flex items-center justify-center text-gold-base transition-all active:scale-95 shadow-md group"
                title="Canais de Contato"
                aria-label="Canais de Contato"
              >
                <motion.div animate={{ rotate: [0, -10, 10, -10, 10, 0], scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 3, repeatDelay: 2 }}><Phone className="w-4 h-4" /></motion.div>
              </button>
            </div>
          </div>
        </div>

        {/* Scroll Down Indicator */}
        <div className="relative z-10 pb-4 pt-1 flex justify-center">
          <button
            onClick={() => {
              hapticLight();
              const section = document.getElementById('filosofia-section');
              if (section) {
                section.scrollIntoView({ behavior: 'smooth' });
              } else {
                window.scrollBy({ top: 400, behavior: 'smooth' });
              }
            }}
            className="flex flex-col items-center gap-1 text-content-muted/80 hover:text-gold-base transition-colors group cursor-pointer"
            aria-label="Role para baixo"
          >
            <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-content-muted group-hover:text-gold-base transition-colors">
              Role para baixo
            </span>
            <ChevronDown className="w-4 h-4 text-gold-base animate-bounce" />
          </button>
        </div>
      </section>

            {/* ===== NOSSA FILOSOFIA ===== */}
      <section id="filosofia-section" className="relative overflow-hidden mb-10 px-4 sm:px-6 shrink-0 snap-center flex flex-col justify-center min-h-[calc(100svh-10rem)]">
        {/* Background Image with Dark Gradient Overlays */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=75&w=800&auto=format&fit=crop" 
            alt="Barber Shop Tools" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-surface-base via-surface-base/80 to-surface-base"></div>
        </div>

        {/* Contêiner de conteúdo */}
        <div className="relative z-10 w-full rounded-2xl border border-border-subtle bg-surface-card/95 backdrop-blur-md overflow-hidden shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="p-6 sm:p-8 md:p-10 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 text-gold-base text-xs sm:text-sm font-bold uppercase tracking-[0.2em]">
                  <span className="w-6 h-[1.5px] bg-gold-deep inline-block" />
                  <span>NOSSA FILOSOFIA</span>
                </div>

                <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif text-content-base leading-snug">
                  Precisão é o nosso <em className="italic text-gold-base">padrão</em>.
                </h2>

                <p className="text-sm sm:text-base md:text-lg text-content-muted leading-relaxed">
                  Atendimento sem pressa, cuidado em cada detalhe e um acabamento à altura da experiência Monarca.
                </p>
              </div>

              <div className="pt-3 border-t border-border-subtle flex items-center justify-between text-xs sm:text-sm uppercase tracking-wider text-content-muted font-medium">
                <span>Monarca BarberX</span>
                <span className="text-gold-base font-semibold">Tradição &amp; Precisão</span>
              </div>
            </div>

            <div className="relative h-[250px] sm:h-[300px] md:h-auto md:min-h-[350px] w-full p-6 sm:p-8 md:p-10 pt-0 md:pt-10 md:pl-0 flex">
              <div className="w-full h-full relative flex-1 rounded-2xl overflow-hidden border border-border-subtle shadow-md">
                <img 
                  src="https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=75&w=800&auto=format&fit=crop" 
                  alt="Interior da Barbearia Monarca BarberX"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== O ESPAÇO ===== */}
      <section id="espaco-section" className="relative overflow-hidden mb-10 px-4 sm:px-6 shrink-0 snap-center flex flex-col justify-center min-h-[calc(100svh-10rem)]">
        {/* Background Image with Dark Gradient Overlays */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1599351431202-1e0f0137899a?q=75&w=800&auto=format&fit=crop" 
            alt="Ambiente Salão" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-surface-base via-surface-base/80 to-surface-base"></div>
        </div>

        {/* Contêiner de conteúdo */}
        <div className="relative z-10 w-full rounded-2xl border border-border-subtle bg-surface-card/95 backdrop-blur-md overflow-hidden shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="p-6 sm:p-8 md:p-10 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 text-gold-base text-xs sm:text-sm font-bold uppercase tracking-[0.2em]">
                  <span className="w-6 h-[1.5px] bg-gold-deep inline-block" />
                  <span>O ESPAÇO</span>
                </div>

                <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif text-content-base leading-snug">
                  Mais que um salão. Um <em className="italic text-gold-base">refúgio</em>.
                </h2>

                <p className="text-sm sm:text-base md:text-lg text-content-muted leading-relaxed">
                  Ambiente pensado para oferecer conforto, tranquilidade e uma experiência completa.
                </p>
              </div>

              <div className="pt-3 border-t border-border-subtle w-full">
                <div className="flex flex-wrap gap-2">
                  {['Bar', 'Wi-Fi', 'Estacionamento', 'Climatização', 'Café & Cerveja', 'PS5'].map((tag, tIdx) => (
                    <span key={tIdx} className="px-3 py-1 rounded-full bg-border-subtle border border-border-subtle text-xs sm:text-sm text-content-muted font-semibold uppercase tracking-wider">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="relative h-[250px] sm:h-[300px] md:h-auto md:min-h-[350px] w-full p-6 sm:p-8 md:p-10 pt-0 md:pt-10 md:pl-0 flex">
              <div className="w-full h-full relative flex-1 rounded-2xl overflow-hidden border border-border-subtle shadow-md">
                <img 
                  src="https://images.unsplash.com/photo-1599351431202-1e0f0137899a?q=75&w=800&auto=format&fit=crop" 
                  alt="Salão Monarca BarberX"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* ===== GALERIA ===== */}
      <section className="relative overflow-hidden mb-10 px-4 sm:px-6 shrink-0 snap-center flex flex-col justify-center min-h-[calc(100svh-10rem)]">
        {/* Background Image with Dark Gradient Overlays */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1622286342621-4bd786c2447c?q=75&w=800&auto=format&fit=crop" 
            alt="Barber Shop Interior" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-surface-base via-surface-base/80 to-surface-base"></div>
        </div>
        
        <div className="relative z-10 space-y-5">
          <div className="inline-flex items-center gap-2 text-gold-base text-xs sm:text-sm font-bold uppercase tracking-[0.2em]">
            <span className="w-6 h-[1.5px] bg-gold-deep inline-block" />
            <span>GALERIA DE FOTOS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-content-base leading-tight">
            Registros do <em className="italic text-gold-base">ofício</em> em movimento.
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 h-72 sm:h-80">
          <div className="col-span-2 relative rounded-card overflow-hidden border border-border-subtle group">
            <img 
              src="https://images.unsplash.com/photo-1622296089863-eb7fc530daa8?q=75&w=800&auto=format&fit=crop" 
              alt="Corte de precisão"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
              <span className="text-xs sm:text-sm font-bold text-content-base uppercase tracking-wider">Precisão no corte</span>
            </div>
          </div>

          <div className="relative rounded-card overflow-hidden border border-border-subtle group">
            <img 
              src="https://images.unsplash.com/photo-1519345182560-3f2917c472ef?q=75&w=800&auto=format&fit=crop" 
              alt="Barba desenhada"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
              <span className="text-xs sm:text-sm font-bold text-content-base uppercase tracking-wider">Barba desenhada</span>
            </div>
          </div>

          <div className="relative rounded-card overflow-hidden border border-border-subtle group">
            <img 
              src="https://images.unsplash.com/photo-1622287162716-f311baa1a2b8?q=75&w=800&auto=format&fit=crop" 
              alt="Instrumentos"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
              <span className="text-xs sm:text-sm font-bold text-content-base uppercase tracking-wider">Instrumentos nobres</span>
            </div>
          </div>
        </div>
        </div>
      </section>

      {/* ===== BOOKING CTA FOOTER CARD ===== */}
      <section className="bg-surface-card border border-border-subtle rounded-card p-8 sm:p-14 text-center space-y-6 relative shadow-lg mx-4 sm:mx-6 mb-10 shrink-0 snap-center flex flex-col justify-center min-h-[calc(100svh-10rem)] overflow-hidden">
        {/* Background Image with Dark Gradient Overlays */}
        <div className="absolute inset-0 z-0 rounded-card overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=75&w=800&auto=format&fit=crop" 
            alt="Barber Shop Chair" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-surface-card/60 via-surface-card/90 to-surface-card/60 backdrop-blur-sm"></div>
        </div>
        
        <div className="relative z-10 max-w-2xl mx-auto space-y-5">
          <div className="inline-flex items-center justify-center gap-2 text-gold-base text-xs sm:text-sm font-bold uppercase tracking-[0.2em]">
            <span className="w-6 h-[1.5px] bg-gold-deep inline-block" />
            <span>RESERVE SEU HORÁRIO</span>
            <span className="w-6 h-[1.5px] bg-gold-deep inline-block" />
          </div>

          <h2 className="text-3xl sm:text-5xl md:text-6xl font-serif text-content-base leading-tight">
            Seu próximo corte começa com <em className="italic text-gold-base">um clique</em>.
          </h2>

          <p className="text-sm sm:text-base md:text-lg text-content-muted leading-relaxed">
            Escolha o profissional, o serviço e o horário que melhor se encaixam na sua rotina. Confirmação imediata, sem espera na porta.
          </p>

          <div className="pt-3">
            <button
              onClick={() => {
                hapticMedium();
                onGoToBooking();
              }}
              className="px-9 py-4 rounded-btn bg-gold-base text-surface-base font-black text-xs sm:text-sm uppercase tracking-widest shadow-md hover:opacity-95 active:scale-95 transition-all inline-flex items-center gap-2.5"
            >
              <motion.div whileHover={{ scale: 1.1, rotate: [-5, 5, -5, 0] }} transition={{ duration: 0.5 }}><Calendar className="w-5 h-5 stroke-[2.5]" /></motion.div>
              <span>AGENDAR AGORA MESMO</span>
            </button>
          </div>
        </div>
      </section>

      {/* ===== VOLTAR AO TOPO ===== */}
      <div className="flex justify-center pb-24 pt-4 shrink-0 snap-center min-h-[100px]">
        <button
          onClick={() => {
            const mainContent = document.getElementById('main-content');
            if (mainContent) {
              mainContent.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
          className="flex flex-col items-center gap-2 text-content-muted hover:text-gold-base transition-colors group p-4 cursor-pointer"
        >
          <ChevronUp className="w-5 h-5 group-hover:-translate-y-1 transition-transform animate-pulse" />
          <span className="text-[10px] font-extrabold uppercase tracking-[0.2em]">Voltar ao topo</span>
        </button>
      </div>

      {/* ===== FLOATING STICKY AGENDAR HORÁRIO BUTTON ON SCROLL ===== */}
      <AnimatePresence>
        {scrolled && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-sm px-2"
          >
            <button
              onClick={() => {
                hapticMedium();
                onGoToBooking();
              }}
              className="w-full py-4 px-6 rounded-full bg-gold-base text-surface-base font-black text-xs sm:text-sm uppercase tracking-widest shadow-lg hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-2 border border-border-subtle backdrop-blur-md"
            >
              <motion.div whileHover={{ scale: 1.1, rotate: [-5, 5, -5, 0] }} transition={{ duration: 0.5 }}><Calendar className="w-4 h-4 stroke-[2.5]" /></motion.div>
              <span>AGENDAR HORÁRIO</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== MODAIS INFORMATIVOS (ENDEREÇO, HORÁRIOS, CONTATO) ===== */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveModal(null)}
              className="absolute inset-0 bg-surface-base/80 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="relative z-10 w-full max-w-md bg-surface-card border border-border-subtle rounded-2xl shadow-2xl overflow-hidden p-6 text-content-base"
            >
              {/* Close Button */}
              <button
                onClick={() => setActiveModal(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full border border-border-subtle bg-border-subtle hover:bg-surface-card flex items-center justify-center text-content-muted hover:text-content-base transition-all"
                aria-label="Fechar modal"
              >
                <X className="w-4 h-4" />
              </button>

              {/* MODAL 1: ENDEREÇO + MAPA */}
              {activeModal === 'location' && (
                <div className="space-y-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl border border-gold-base/40 bg-gold-base/10 text-gold-base flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5 text-gold-base" />
                    </div>
                    <div>
                      <h3 className="text-lg font-serif text-content-base">Nosso Endereço</h3>
                      <p className="text-xs text-content-muted">Monarca BarberX — Jardins / Paulista</p>
                    </div>
                  </div>

                  <div className="bg-surface-card border border-border-subtle rounded-xl p-4 space-y-1.5">
                    <p className="text-sm font-semibold text-content-base">Av. Paulista, 1000 — Bela Vista</p>
                    <p className="text-xs text-content-muted">São Paulo - SP, CEP 01310-100</p>
                    <p className="text-[11px] text-gold-base pt-1">Ponto de referência: Próximo ao Metrô Trianon-Masp</p>
                  </div>

                  {/* Embedded Google Map */}
                  <div className="relative w-full h-44 rounded-xl overflow-hidden border border-border-subtle bg-surface-base">
                    <iframe
                      title="Mapa de Localização Barbearia Monarca"
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3657.097615286591!2d-46.65390542381297!3d-23.56314816178051!2m3!1f0!0!0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94ce59c8da0aa315%3A0xd59f9431f2c9776a!2sAv.%20Paulista%2C%201000%20-%20Bela%20Vista%2C%20S%C3%A3o%20Paulo%20-%20SP%2C%2001310-100!5e0!3m2!1spt-BR!2sbr!4v1700000000000!5m2!1spt-BR!2sbr"
                      width="100%"
                      height="100%"
                      style={{ border: 0, filter: 'grayscale(0.6) invert(0.9) contrast(1.2)' }}
                      allowFullScreen={false}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <a
                      href="https://maps.google.com/?q=Av.+Paulista,+1000+-+Bela+Vista,+S%C3%A3o+Paulo+-+SP"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-3 px-4 rounded-xl bg-gold-base text-surface-base font-extrabold text-xs uppercase tracking-wider text-center flex items-center justify-center gap-2 hover:brightness-110 transition-all"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Abrir no Google Maps</span>
                    </a>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText('Av. Paulista, 1000 - Bela Vista, São Paulo - SP');
                        setCopiedAddress(true);
                        setTimeout(() => setCopiedAddress(false), 2000);
                      }}
                      className="py-3 px-3 rounded-xl border border-border-subtle bg-border-subtle hover:bg-surface-card text-xs font-semibold text-content-base flex items-center justify-center gap-1.5 transition-all"
                      title="Copiar Endereço"
                    >
                      {copiedAddress ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-content-muted" />}
                      <span className="hidden sm:inline">{copiedAddress ? 'Copiado!' : 'Copiar'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* MODAL 2: HORÁRIO DE FUNCIONAMENTO */}
              {activeModal === 'hours' && (
                <div className="space-y-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl border border-gold-base/40 bg-gold-base/10 text-gold-base flex items-center justify-center shrink-0">
                      <Clock className="w-5 h-5 text-gold-base" />
                    </div>
                    <div>
                      <h3 className="text-lg font-serif text-content-base">Horário de Funcionamento</h3>
                      <p className="text-xs text-content-muted">Atendimento com agendamento prévio</p>
                    </div>
                  </div>

                  <div className="bg-surface-card border border-border-subtle rounded-xl divide-y divide-border-subtle">
                    <div className="p-3.5 flex items-center justify-between text-xs">
                      <span className="text-content-muted font-medium">Terça a Sexta-feira</span>
                      <span className="text-content-base font-bold">09:00 — 20:00</span>
                    </div>
                    <div className="p-3.5 flex items-center justify-between text-xs">
                      <span className="text-content-muted font-medium">Sábado</span>
                      <span className="text-content-base font-bold">09:00 — 18:00</span>
                    </div>
                    <div className="p-3.5 flex items-center justify-between text-xs">
                      <span className="text-content-muted font-medium">Domingo e Segunda</span>
                      <span className="text-rose-400 font-bold uppercase tracking-wider text-[11px]">Fechado</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-gold-base/10 border border-gold-base/20 text-xs text-gold-base flex items-start gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-gold-base shrink-0 mt-0.5" />
                    <p className="leading-relaxed">
                      Atendimento prioritário para agendamentos confirmados pelo aplicativo. Chegue com 5 minutos de antecedência.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setActiveModal(null);
                      onGoToBooking();
                    }}
                    className="w-full py-3 px-4 rounded-xl bg-gold-base text-surface-base font-extrabold text-xs uppercase tracking-wider text-center flex items-center justify-center gap-2 hover:brightness-110 transition-all"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Agendar Horário Agora</span>
                  </button>
                </div>
              )}

              {/* MODAL 3: CONTATO */}
              {activeModal === 'contact' && (
                <div className="space-y-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl border border-gold-base/40 bg-gold-base/10 text-gold-base flex items-center justify-center shrink-0">
                      <Phone className="w-5 h-5 text-gold-base" />
                    </div>
                    <div>
                      <h3 className="text-lg font-serif text-content-base">Canais de Contato</h3>
                      <p className="text-xs text-content-muted">Fale com nossa equipe e tirar dúvidas</p>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    {/* WhatsApp / Telefone */}
                    <a
                      href="https://wa.me/5511999998888"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3.5 rounded-xl bg-surface-card border border-border-subtle hover:border-emerald-500/50 flex items-center justify-between group transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                          <MessageSquare className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-content-muted block">WhatsApp &amp; Telefone</span>
                          <span className="text-xs font-semibold text-content-base group-hover:text-emerald-400 transition-colors">(11) 99999-8888</span>
                        </div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-content-muted group-hover:text-emerald-400 transition-colors" />
                    </a>

                    {/* Email */}
                    <div className="p-3.5 rounded-xl bg-surface-card border border-border-subtle flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gold-base/10 border border-gold-base/30 text-gold-base flex items-center justify-center">
                          <Mail className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-content-muted block">E-mail</span>
                          <span className="text-xs font-semibold text-content-base">contato@barberx.com.br</span>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText('contato@barberx.com.br');
                          setCopiedEmail(true);
                          setTimeout(() => setCopiedEmail(false), 2000);
                        }}
                        className="p-1.5 rounded-lg border border-border-subtle hover:bg-surface-card text-xs text-content-muted hover:text-content-base transition-all"
                        title="Copiar e-mail"
                      >
                        {copiedEmail ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Instagram */}
                    <a
                      href="https://instagram.com/barberx.sp"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3.5 rounded-xl bg-surface-card border border-border-subtle hover:border-purple-500/50 flex items-center justify-between group transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center">
                          <Instagram className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-content-muted block">Instagram</span>
                          <span className="text-xs font-semibold text-content-base group-hover:text-purple-400 transition-colors">@barberx.sp</span>
                        </div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-content-muted group-hover:text-purple-400 transition-colors" />
                    </a>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
