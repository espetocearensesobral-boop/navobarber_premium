import React, { useState, useRef, useEffect } from 'react';
import { 
  Clock, 
  MapPin, 
  Star, 
  Scissors, 
  CalendarCheck, 
  Award, 
  Snowflake, 
  Coffee, 
  Wifi, 
  Car, 
  MessageCircle, 
  Navigation,
  ArrowUp,
  ArrowRight,
  List,
  Menu,
  X,
  User,
  Check,
  Sparkles
} from 'lucide-react';
import { hapticMedium, hapticLight } from '../../lib/haptics';
import { 
  fetchLandingPageConfigFromSupabase, 
  LandingPageConfig, 
  DEFAULT_LANDING_PAGE_CONFIG 
} from '../../services/supabaseDataService';

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

const trackEvent = (action: string, category: string, label: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, { 
      event_category: category, 
      event_label: label 
    });
  }
};

interface LandingPageProps {
  onGoToBooking: () => void;
  onGoToAppointments?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGoToBooking, onGoToAppointments }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [config, setConfig] = useState<LandingPageConfig>(DEFAULT_LANDING_PAGE_CONFIG);
  const [activeCategory, setActiveCategory] = useState<'todos' | 'cabelo' | 'barba'>('todos');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHoursModalOpen, setIsHoursModalOpen] = useState(false);

  useEffect(() => {
    fetchLandingPageConfigFromSupabase().then(data => {
      if (data) setConfig(data);
    });
  }, []);

  const toggleMenu = () => {
    hapticLight();
    setIsMenuOpen(prev => !prev);
  };

  const toggleHoursModal = () => {
    hapticLight();
    setIsHoursModalOpen(prev => !prev);
  };

  const scrollToSection = (index: number) => {
    hapticLight();
    if (containerRef.current) {
      const sections = containerRef.current.querySelectorAll('section');
      if (sections[index]) {
        sections[index].scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const scrollToTop = () => {
    scrollToSection(0);
  };

  const handleOpenGoogleMaps = () => {
    hapticLight();
    const query = config.locationSection.mapsQuery || 'Rua Augusta 1420 Jardins Sao Paulo';
    window.open(`https://maps.google.com/?q=${encodeURIComponent(query)}`, '_blank', 'noopener,noreferrer');
  };

  const handleOpenWhatsApp = () => {
    hapticLight();
    const num = config.locationSection.whatsappNumber || '5511999998888';
    const msg = config.locationSection.whatsappMessage || 'Olá! Gostaria de agendar um horário.';
    window.open(`https://wa.me/${num}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer');
  };

  const galleryImages = config.gallerySection.images.length > 0 
    ? config.gallerySection.images 
    : DEFAULT_LANDING_PAGE_CONFIG.gallerySection.images;

  return (
    <div ref={containerRef} className="w-full h-full min-h-0 overflow-y-scroll snap-y snap-mandatory bg-white text-neutral-900 font-sans antialiased relative selection:bg-[#C8A96A]/20 selection:text-neutral-900 no-scrollbar">
      {/* HOURS MODAL OVERLAY */}
      <div className={`fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex flex-col items-center justify-center transition-opacity duration-300 ${isHoursModalOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <button 
          onClick={toggleHoursModal} 
          className="absolute top-5 right-5 w-11 h-11 rounded-full bg-white/8 border border-white/10 text-white text-xl flex items-center justify-center active:scale-95 transition-transform cursor-pointer"
          aria-label="Fechar modal"
        >
          ✕
        </button>
        <div className="bg-[#141414] border border-white/10 rounded-2xl p-8 w-full max-w-sm flex flex-col gap-5">
          <h3 className="text-white text-xl font-extrabold mb-1 tracking-wide uppercase">Horário de Atendimento</h3>
          <div className="flex justify-between items-center text-[#f5f5f5] text-lg font-medium">
            <span className="text-[#a0a0a0]">Seg - Sex</span>
            <span>{config.locationSection.hoursWeekday || '09:00 - 22:00'}</span>
          </div>
          <div className="flex justify-between items-center text-[#f5f5f5] text-lg font-medium">
            <span className="text-[#a0a0a0]">Sábado</span>
            <span>{config.locationSection.hoursSaturday || '09:00 - 20:00'}</span>
          </div>
          <div className="flex justify-between items-center text-lg font-medium">
            <span className="text-[#a0a0a0]">Domingo</span>
            <span className="text-red-500">{config.locationSection.hoursSunday || 'Fechado'}</span>
          </div>
          <button
            onClick={handleOpenWhatsApp}
            className="mt-3 w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2.5 transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
            </svg>
            Falar no WhatsApp
          </button>
        </div>
      </div>

      {/* MENU OVERLAY */}
      <div className={`fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex flex-col items-center justify-center gap-8 transition-opacity duration-300 ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <button 
          onClick={toggleMenu} 
          className="absolute top-5 right-5 w-11 h-11 rounded-full bg-white/8 border border-white/10 text-white text-xl flex items-center justify-center active:scale-95 transition-transform cursor-pointer"
          aria-label="Fechar menu"
        >
          ✕
        </button>
        <a href="#servicos" onClick={(e) => { e.preventDefault(); toggleMenu(); onGoToBooking(); }} className="text-white text-2xl font-semibold opacity-80 hover:opacity-100 transition-opacity">Serviços</a>
        <a href="#diferenciais" onClick={(e) => { e.preventDefault(); toggleMenu(); scrollToSection(1); }} className="text-white text-2xl font-semibold opacity-80 hover:opacity-100 transition-opacity">Diferenciais</a>
        <a href="#galeria" onClick={(e) => { e.preventDefault(); toggleMenu(); scrollToSection(2); }} className="text-white text-2xl font-semibold opacity-80 hover:opacity-100 transition-opacity">Galeria</a>
        <a href="#contato" onClick={(e) => { e.preventDefault(); toggleMenu(); scrollToSection(4); }} className="text-white text-2xl font-semibold opacity-80 hover:opacity-100 transition-opacity">Contato</a>
        <button 
          onClick={() => { 
            toggleMenu(); 
            if (onGoToAppointments) onGoToAppointments(); 
          }} 
          className="text-[#d4a853] text-2xl font-semibold hover:opacity-100 transition-opacity flex items-center gap-2 cursor-pointer mt-2"
        >
          Meus Cortes
        </button>
      </div>

      {/* SECTION 0: HERO */}
      <section className="relative w-full h-full min-h-full max-h-full snap-start snap-always shrink-0 bg-[#0a0a0a] text-[#f5f5f5] overflow-hidden flex flex-col justify-between box-border">
        {/* Background Image with Gradient Overlay */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{
            backgroundImage: `linear-gradient(180deg, rgba(10,10,10,0.25) 0%, rgba(10,10,10,0.7) 45%, #0a0a0a 85%), url('${config.hero.bgImageUrl}')`
          }}
        />

        {/* HEADER */}
        <header className="relative z-20 flex items-center justify-between p-5 shrink-0">
          <div className="font-extrabold text-lg tracking-tight text-white flex items-center gap-1">
            <span>{config.hero.brandPrefix}</span><span className="text-[#d4a853]">{config.hero.brandSuffix}</span>
          </div>
          <button 
            onClick={toggleMenu} 
            className="w-10 h-10 rounded-full bg-white/8 border border-white/10 text-white flex items-center justify-center backdrop-blur-md active:scale-95 transition-transform cursor-pointer"
            aria-label="Menu"
          >
            <Menu className="w-5 h-5 text-white" />
          </button>
        </header>

        {/* HERO CONTENT */}
        <div className="relative z-10 p-5 pb-6 flex flex-col justify-end items-start my-auto min-h-0 w-full max-w-md md:max-w-2xl mx-auto">
          {/* RATING BADGE */}
          <div className="inline-flex items-center gap-2 bg-[#d4a853]/12 border border-[#d4a853]/25 px-3.5 py-1.5 rounded-full text-xs font-semibold text-[#d4a853] mb-4 backdrop-blur-xs">
            <span className="tracking-widest text-[0.7rem] font-bold">★★★★★</span>
            <span>{config.hero.ratingBadgeText}</span>
          </div>

          {/* TITLE */}
          <h1 className="text-[clamp(1.85rem,4.5vh,2.8rem)] font-extrabold leading-[1.08] tracking-tight text-white mb-3">
            {config.hero.titleLine1} <span className="text-[#d4a853]">{config.hero.titleHighlight}</span><br />
            {config.hero.titleLine2}
          </h1>

          {/* SUBTITLE */}
          <p className="text-[clamp(0.9rem,1.6vh,1.1rem)] leading-relaxed text-[#a0a0a0] mb-5 max-w-xs sm:max-w-md">
            {config.hero.subtitle}
          </p>

          {/* CTA GROUP */}
          <div className="flex flex-col gap-5 w-full items-center">
            <button 
              onClick={() => { 
                hapticMedium(); 
                trackEvent('cta_click', 'landing', 'agendar_horario_hero');
                onGoToBooking(); 
              }}
              className="w-full bg-[#d4a853] hover:bg-[#c49a4a] text-[#0a0a0a] font-bold text-base py-4 px-8 rounded-2xl flex items-center justify-center gap-2 shadow-[0_4px_30px_rgba(212,168,83,0.3)] active:scale-98 transition-all shrink-0 cursor-pointer"
            >
              <span>{config.hero.ctaButtonText}</span>
              <ArrowRight className="w-5 h-5 text-[#0a0a0a]" />
            </button>

            <button 
              onClick={() => onGoToAppointments && onGoToAppointments()}
              className="flex items-center gap-1.5 text-[0.85rem] text-[#a0a0a0] cursor-pointer hover:text-white transition-colors active:scale-95"
            >
              <span>Já possui agendamento? Clique aqui.</span>
            </button>
          </div>
        </div>

        {/* HERO FOOTER / TRUST TAGS */}
        <div className="relative z-10 w-full max-w-md md:max-w-2xl mx-auto px-5 pb-6 shrink-0 mt-auto">
          <div className="w-full h-px bg-white/10 mb-6"></div>

          <div className="flex justify-between items-center w-full px-2">
            <div className="flex flex-col items-center gap-1">
              <span className="text-[#a0a0a0] text-[0.65rem] font-bold tracking-widest uppercase">PRÓXIMO</span>
              <span className="text-white font-bold text-sm">{config.hero.statNextSlot}</span>
            </div>

            <button onClick={toggleHoursModal} className="flex flex-col items-center gap-1 cursor-pointer active:scale-95 transition-transform hover:opacity-80">
              <span className="text-[#a0a0a0] text-[0.65rem] font-bold tracking-widest uppercase">STATUS</span>
              <div className="flex items-center gap-1.5">
                <span className="text-green-500 font-semibold text-sm whitespace-nowrap">{config.hero.statStatus}</span>
              </div>
            </button>

            <div className="flex flex-col items-center gap-1">
              <span className="text-[#a0a0a0] text-[0.65rem] font-bold tracking-widest uppercase">TEMPO MÉDIO</span>
              <span className="text-white font-bold text-sm">{config.hero.statAvgTime}</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 1: POR QUE A NAVO */}
      <section className="relative w-full h-full min-h-full max-h-full snap-start snap-always shrink-0 flex flex-col justify-between p-[clamp(0.75rem,2vh,2rem)] bg-white overflow-hidden box-border">
        <div className="max-w-md md:max-w-4xl lg:max-w-6xl mx-auto w-full h-full flex flex-col justify-between items-stretch min-h-0 my-auto">
          <div className="shrink-0 mb-[clamp(0.25rem,0.8vh,0.75rem)]">
            <span className="text-[#C8A96A] text-[clamp(0.6rem,1.1vh,0.8rem)] font-bold tracking-widest uppercase block mb-0.5">
              {config.differentialsSection.eyebrow}
            </span>
            <h2 className="text-[clamp(1.25rem,3.2vh,2.5rem)] font-extrabold text-neutral-900 tracking-tight leading-tight">
              {config.differentialsSection.title} <span className="text-[#b89060]">{config.differentialsSection.titleHighlight}</span>
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 grid-rows-3 md:grid-rows-2 gap-[clamp(0.375rem,1vh,1rem)] flex-1 min-h-0 my-auto py-[clamp(0.25rem,0.5vh,0.5rem)] items-stretch">
            {config.differentialsSection.items.map((item, idx) => {
              return (
                <div 
                  key={item.id || idx}
                  className="bg-white border border-neutral-200/80 rounded-2xl p-[clamp(0.75rem,1.5vh,1.25rem)] flex flex-col items-center justify-center gap-[clamp(0.5rem,1.5vh,1rem)] text-center shadow-xs hover:shadow-md transition-all duration-300 group h-full min-h-0"
                >
                  <div 
                    className="w-[clamp(3.5rem,8vh,4.5rem)] h-[clamp(3.5rem,8vh,4.5rem)] rounded-full flex items-center justify-center relative shrink-0 transition-transform group-hover:scale-105"
                    style={{ backgroundColor: item.bgColor }}
                  >
                    <Sparkles 
                      className="w-[clamp(1.75rem,4vh,2.25rem)] h-[clamp(1.75rem,4vh,2.25rem)] stroke-[1.5]" 
                      style={{ color: item.strokeColor }} 
                    />
                  </div>
                  <span className="text-[clamp(0.75rem,1.4vh,0.9rem)] font-bold text-neutral-800 leading-[1.2] px-1 max-w-[80%]">
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 3: GALERIA */}
      <section className="relative w-full h-full min-h-full max-h-full snap-start snap-always shrink-0 flex flex-col justify-between p-[clamp(0.75rem,2vh,2rem)] bg-white overflow-hidden box-border">
        <div className="max-w-md md:max-w-4xl lg:max-w-6xl mx-auto w-full h-full flex flex-col justify-between items-stretch min-h-0 my-auto">
          {/* Header */}
          <div className="flex justify-between items-end mb-[clamp(0.25rem,0.8vh,0.75rem)] shrink-0">
            <div>
              <span className="text-[#C8A96A] text-[clamp(0.6rem,1.1vh,0.8rem)] font-bold tracking-widest uppercase block mb-0.5">
                {config.gallerySection.eyebrow}
              </span>
              <h2 className="text-[clamp(1.25rem,3.2vh,2.5rem)] font-bold text-neutral-900 tracking-tight leading-tight">
                {config.gallerySection.title}
              </h2>
            </div>
            <button 
              onClick={() => { hapticLight(); onGoToBooking(); }}
              className="text-[clamp(0.65rem,1.3vh,0.875rem)] font-semibold text-neutral-500 hover:text-neutral-900 transition-colors cursor-pointer"
            >
              Ver tudo
            </button>
          </div>

          {/* Bento Grid Composition */}
          <div className="grid grid-cols-12 grid-rows-6 gap-[clamp(0.25rem,0.8vh,0.75rem)] flex-1 min-h-0 w-full h-full">
            {/* 1. Foto Vertical Grande (Destaque) */}
            {galleryImages[0] && (
              <div className="col-span-5 row-span-4 rounded-[clamp(0.5rem,1vh,0.875rem)] overflow-hidden relative group bg-neutral-900 shadow-xs border border-neutral-200/50 min-h-0 h-full">
                <img 
                  loading="lazy"
                  src={galleryImages[0].src} 
                  alt={galleryImages[0].title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent flex flex-col justify-end p-[clamp(0.375rem,0.8vh,0.75rem)]">
                  <span className="bg-[#C8A96A] text-neutral-950 text-[clamp(0.5rem,0.9vh,0.65rem)] font-bold px-1 py-0.5 rounded w-max mb-0.5 uppercase tracking-wider">
                    Destaque
                  </span>
                  <h3 className="text-white font-bold text-[clamp(0.65rem,1.3vh,0.95rem)] leading-snug line-clamp-2">
                    {galleryImages[0].title}
                  </h3>
                </div>
              </div>
            )}

            {/* 2. Fotos Menores - Centro/Direita */}
            <div className="col-span-7 row-span-2 grid grid-cols-2 gap-[clamp(0.25rem,0.8vh,0.75rem)] min-h-0 h-full">
              {galleryImages[1] && (
                <div className="rounded-[clamp(0.5rem,1vh,0.875rem)] overflow-hidden relative group bg-neutral-900 shadow-xs border border-neutral-200/50 min-h-0 h-full">
                  <img 
                    loading="lazy"
                    src={galleryImages[1].src} 
                    alt={galleryImages[1].title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent flex items-end p-[clamp(0.25rem,0.6vh,0.5rem)]">
                    <span className="text-white font-semibold text-[clamp(0.55rem,1vh,0.75rem)] line-clamp-1">{galleryImages[1].title}</span>
                  </div>
                </div>
              )}
              {galleryImages[3] && (
                <div className="rounded-[clamp(0.5rem,1vh,0.875rem)] overflow-hidden relative group bg-neutral-900 shadow-xs border border-neutral-200/50 min-h-0 h-full">
                  <img 
                    loading="lazy"
                    src={galleryImages[3].src} 
                    alt={galleryImages[3].title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent flex items-end p-[clamp(0.25rem,0.6vh,0.5rem)]">
                    <span className="text-white font-semibold text-[clamp(0.55rem,1vh,0.75rem)] line-clamp-1">{galleryImages[3].title}</span>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Card Informativo / Promocional */}
            <div className="col-span-7 row-span-2 bg-gradient-to-br from-neutral-900 via-neutral-950 to-neutral-900 text-white rounded-[clamp(0.5rem,1vh,0.875rem)] p-[clamp(0.375rem,0.8vh,0.75rem)] flex flex-col justify-between border border-neutral-800 shadow-xs relative overflow-hidden group min-h-0 h-full">
              <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-[#C8A96A]/15 rounded-full blur-xl group-hover:bg-[#C8A96A]/25 transition-all duration-500 pointer-events-none" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-[#C8A96A]">
                  <Scissors className="w-[clamp(0.65rem,1.1vh,0.85rem)] h-[clamp(0.65rem,1.1vh,0.85rem)] stroke-[2.5]" />
                  <span className="text-[clamp(0.5rem,0.9vh,0.65rem)] font-bold uppercase tracking-wider">Acabamento Mestre</span>
                </div>
                <div className="flex text-amber-400 gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-[clamp(0.45rem,0.8vh,0.65rem)] h-[clamp(0.45rem,0.8vh,0.65rem)] fill-current" />
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-[clamp(0.65rem,1.2vh,0.875rem)] font-bold text-white leading-tight">
                  {config.gallerySection.promoTitle}
                </h4>
                <p className="text-[clamp(0.5rem,0.9vh,0.65rem)] text-neutral-400 font-normal line-clamp-1">
                  {config.gallerySection.promoSubtitle}
                </p>
              </div>
            </div>

            {/* 4. Foto Horizontal Grande na Base */}
            {galleryImages[2] && (
              <div className="col-span-12 row-span-2 rounded-[clamp(0.5rem,1vh,0.875rem)] overflow-hidden relative group bg-neutral-900 shadow-xs border border-neutral-200/50 min-h-0 h-full">
                <img 
                  loading="lazy"
                  src={galleryImages[2].src} 
                  alt={galleryImages[2].title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent flex items-end justify-between p-[clamp(0.375rem,0.8vh,0.75rem)]">
                  <div>
                    <span className="text-white font-bold text-[clamp(0.65rem,1.3vh,0.95rem)] block leading-tight">
                      {galleryImages[2].title}
                    </span>
                    <span className="text-neutral-300 text-[clamp(0.5rem,0.9vh,0.65rem)] line-clamp-1">
                      Ambiente climatizado e estrutura de alto padrão para você relaxar.
                    </span>
                  </div>
                  <button 
                    onClick={() => { hapticMedium(); onGoToBooking(); }}
                    className="bg-white/95 hover:bg-white text-neutral-900 font-bold text-[clamp(0.55rem,1vh,0.7rem)] px-[clamp(0.5rem,1vw,0.75rem)] py-[clamp(0.2rem,0.5vh,0.3rem)] rounded-lg transition-all active:scale-95 shrink-0 shadow-md ml-2 cursor-pointer"
                  >
                    Agendar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* SECTION 4: DEPOIMENTOS */}
      <section className="relative w-full h-full min-h-full max-h-full snap-start snap-always shrink-0 flex flex-col justify-between p-[clamp(0.75rem,2vh,2rem)] bg-white overflow-hidden box-border">
        <div className="max-w-md md:max-w-4xl lg:max-w-6xl mx-auto w-full h-full flex flex-col justify-between items-stretch min-h-0 my-auto">
          <div className="shrink-0 mb-[clamp(0.25rem,0.8vh,0.75rem)]">
            <span className="text-[#C8A96A] text-[clamp(0.6rem,1.1vh,0.8rem)] font-bold tracking-widest uppercase block mb-0.5">
              {config.testimonialsSection.eyebrow}
            </span>
            <h2 className="text-[clamp(1.25rem,3.2vh,2.5rem)] font-bold text-neutral-900 tracking-tight leading-tight">
              {config.testimonialsSection.title}
            </h2>
          </div>

          <div className="flex flex-col gap-[clamp(0.375rem,1vh,1rem)] flex-1 min-h-0 justify-center items-stretch my-auto py-[clamp(0.25rem,0.5vh,0.5rem)] w-full">
            {config.testimonialsSection.items.slice(0, 3).map((item, idx) => (
              <div 
                key={item.id || idx}
                className="w-full bg-white border border-neutral-200/80 rounded-[clamp(0.625rem,1.4vh,1.125rem)] p-[clamp(0.5rem,1.2vh,1rem)] flex flex-col justify-between gap-[clamp(0.25rem,0.8vh,0.625rem)] shadow-xs hover:border-[#C8A96A]/50 hover:shadow-md transition-all flex-1 min-h-0"
              >
                <div>
                  <div className="flex items-center justify-between gap-[clamp(0.375rem,1vw,0.75rem)] mb-[clamp(0.25rem,0.8vh,0.625rem)]">
                    <div className="flex items-center gap-[clamp(0.375rem,1vw,0.75rem)]">
                      <img 
                        src={item.avatar} 
                        alt={item.name}
                        className="w-[clamp(1.75rem,3.5vh,2.5rem)] h-[clamp(1.75rem,3.5vh,2.5rem)] rounded-full object-cover shrink-0"
                      />
                      <div>
                        <h4 className="text-[clamp(0.7rem,1.4vh,1rem)] font-bold text-neutral-900">
                          {item.name}
                        </h4>
                        <div className="flex text-amber-400 gap-0.5 mt-0.5">
                          {[...Array(item.rating)].map((_, i) => (
                            <Star key={i} className="w-[clamp(0.6rem,1.1vh,0.8rem)] h-[clamp(0.6rem,1.1vh,0.8rem)] fill-current" />
                          ))}
                        </div>
                      </div>
                    </div>
                    <span className="text-[clamp(0.55rem,1vh,0.75rem)] text-neutral-400 self-start mt-1">
                      {item.date}
                    </span>
                  </div>

                  <p className="text-[clamp(0.625rem,1.25vh,0.875rem)] text-neutral-600 leading-relaxed font-normal italic line-clamp-3">
                    "{item.text}"
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 5: LOCALIZAÇÃO */}
      <section className="relative w-full h-full min-h-full max-h-full snap-start snap-always shrink-0 flex flex-col justify-between p-[clamp(0.75rem,2vh,2rem)] bg-white overflow-hidden box-border">
        <div className="max-w-md md:max-w-4xl lg:max-w-6xl mx-auto w-full h-full flex flex-col justify-between items-stretch min-h-0 my-auto">
          <div className="shrink-0 mb-[clamp(0.25rem,0.8vh,0.75rem)]">
            <span className="text-[#C8A96A] text-[clamp(0.6rem,1.1vh,0.8rem)] font-bold tracking-widest uppercase block mb-0.5">
              {config.locationSection.eyebrow}
            </span>
            <h2 className="text-[clamp(1.25rem,3.2vh,2.5rem)] font-bold text-neutral-900 tracking-tight leading-tight">
              {config.locationSection.title}
            </h2>
          </div>

          <div className="bg-white border border-neutral-200/80 rounded-[clamp(0.625rem,1.4vh,1.125rem)] p-[clamp(0.5rem,1.2vh,1rem)] shadow-xs flex-1 min-h-0 my-auto flex flex-col md:grid md:grid-cols-2 gap-[clamp(0.5rem,1.2vh,1.25rem)] items-center justify-between">
            {/* Map Image Graphic */}
            <div className="relative w-full flex-1 min-h-[clamp(4.5rem,12vh,10rem)] rounded-[clamp(0.5rem,1vh,0.875rem)] overflow-hidden bg-neutral-100 border border-neutral-200 shrink-0 md:shrink">
              <img 
                src={config.locationSection.mapImageUrl} 
                alt="Mapa Navo Premium" 
                className="w-full h-full object-cover filter contrast-105"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-[clamp(1.75rem,3.5vh,2.5rem)] h-[clamp(1.75rem,3.5vh,2.5rem)] rounded-full bg-neutral-900 text-white flex items-center justify-center shadow-lg">
                  <MapPin className="w-[clamp(0.875rem,1.8vh,1.25rem)] h-[clamp(0.875rem,1.8vh,1.25rem)] fill-current text-white" />
                </div>
              </div>
            </div>

            <div className="space-y-[clamp(0.375rem,1vh,0.875rem)] flex flex-col justify-between w-full min-h-0">
              <div className="space-y-[clamp(0.25rem,0.8vh,0.625rem)] text-[clamp(0.625rem,1.25vh,0.875rem)] text-neutral-700">
                <div className="flex items-start gap-2">
                  <MapPin className="w-[clamp(0.75rem,1.4vh,1rem)] h-[clamp(0.75rem,1.4vh,1rem)] text-[#C8A96A] shrink-0 mt-0.5" />
                  <span className="font-medium">{config.locationSection.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-[clamp(0.75rem,1.4vh,1rem)] h-[clamp(0.75rem,1.4vh,1rem)] text-[#C8A96A] shrink-0" />
                  <span className="font-medium">Seg-Sex: {config.locationSection.hoursWeekday} · Sáb: {config.locationSection.hoursSaturday}</span>
                </div>
              </div>

              <button 
                onClick={handleOpenGoogleMaps}
                className="w-full bg-white border border-neutral-300 text-neutral-900 font-semibold text-[clamp(0.65rem,1.3vh,0.875rem)] py-[clamp(0.375rem,0.9vh,0.625rem)] rounded-xl flex items-center justify-center gap-2 hover:bg-neutral-50 active:scale-98 transition-all shadow-xs shrink-0 cursor-pointer"
              >
                <Navigation className="w-[clamp(0.75rem,1.4vh,1rem)] h-[clamp(0.75rem,1.4vh,1rem)]" />
                <span>Como chegar</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: PRONTO PARA O SEU NOVO VISUAL? (DARK CARD) */}
      <section className="relative w-full h-full min-h-full max-h-full snap-start snap-always shrink-0 flex flex-col justify-between pt-[clamp(0.75rem,2vh,2rem)] bg-white overflow-hidden box-border">
        <div className="w-full flex-1 flex flex-col justify-center items-center max-h-full my-auto py-1 px-[clamp(0.75rem,2vh,2rem)] min-h-0">
          <div className="max-w-md md:max-w-3xl lg:max-w-4xl w-full bg-neutral-900 text-white rounded-[clamp(0.875rem,2vh,1.5rem)] p-[clamp(0.875rem,2.2vh,2rem)] relative overflow-hidden shadow-xl text-center flex flex-col items-center justify-center my-auto min-h-0">
            <div className="w-[clamp(2rem,4vh,3rem)] h-[clamp(2rem,4vh,3rem)] rounded-2xl bg-[#C8A96A]/20 border border-[#C8A96A]/30 flex items-center justify-center text-[#C8A96A] mb-[clamp(0.375rem,1vh,1rem)] shrink-0">
              <Scissors className="w-[clamp(1rem,2.2vh,1.625rem)] h-[clamp(1rem,2.2vh,1.625rem)] stroke-[2.2]" />
            </div>

            <h2 className="text-[clamp(1.25rem,3.2vh,2.5rem)] font-bold text-white mb-[clamp(0.2rem,0.6vh,0.5rem)] tracking-tight leading-tight">
              {config.ctaSection.titleLine1}<br />
              {config.ctaSection.titleLine2}
            </h2>

            <p className="text-[clamp(0.65rem,1.3vh,0.875rem)] text-neutral-400 font-normal leading-relaxed mb-[clamp(0.5rem,1.5vh,1.25rem)] max-w-xs sm:max-w-md md:max-w-lg">
              {config.ctaSection.subtitle}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
              <button 
                onClick={() => {
                  hapticMedium();
                  trackEvent('cta_click', 'landing', 'agendar_online_footer');
                  onGoToBooking();
                }}
                className="w-full sm:w-auto px-6 py-[clamp(0.5rem,1.2vh,0.875rem)] bg-[#d4a853] hover:bg-[#c49a4a] text-[#0a0a0a] font-bold text-[clamp(0.7rem,1.4vh,0.925rem)] rounded-xl flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(212,168,83,0.3)] hover:scale-102 active:scale-98 transition-all shrink-0 cursor-pointer"
              >
                <CalendarCheck className="w-[clamp(0.875rem,1.8vh,1.125rem)] h-[clamp(0.875rem,1.8vh,1.125rem)]" />
                <span>{config.ctaSection.buttonOnlineText}</span>
              </button>

              <button 
                onClick={() => {
                  trackEvent('cta_click', 'landing', 'agendar_whatsapp_footer');
                  handleOpenWhatsApp();
                }}
                className="w-full sm:w-auto px-6 py-[clamp(0.5rem,1.2vh,0.875rem)] bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/40 text-[#25D366] font-bold text-[clamp(0.7rem,1.4vh,0.925rem)] rounded-xl flex items-center justify-center gap-2 hover:scale-102 active:scale-98 transition-all shrink-0 cursor-pointer"
              >
                <MessageCircle className="w-[clamp(0.875rem,1.8vh,1.125rem)] h-[clamp(0.875rem,1.8vh,1.125rem)] fill-current" />
                <span>{config.ctaSection.buttonWhatsappText}</span>
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-4 mt-[clamp(0.5rem,1.5vh,1.25rem)] text-neutral-400 text-[clamp(0.6rem,1.2vh,0.75rem)]">
              <span className="flex items-center gap-1"><span className="text-[#25D366]">✓</span> Sem taxa de cancelamento</span>
              <span className="flex items-center gap-1"><span className="text-[#25D366]">✓</span> Confirmação instantânea</span>
            </div>
          </div>
        </div>

        {/* MINIMALIST BACK TO TOP BUTTON IN THE BOTTOM WHITESPACE */}
        <div className="flex justify-center pt-2 pb-[clamp(1rem,3vh,2rem)] shrink-0 px-[clamp(0.75rem,2vh,2rem)]">
          <button 
            onClick={scrollToTop}
            className="group flex items-center gap-2 text-[clamp(0.6rem,1.1vh,0.7rem)] font-medium text-neutral-400 hover:text-neutral-900 transition-all duration-300 px-3 py-[clamp(0.2rem,0.5vh,0.4rem)] rounded-full border border-neutral-200/80 bg-neutral-50/80 hover:bg-neutral-100 active:scale-95 shadow-xs cursor-pointer"
          >
            <ArrowUp className="w-3 h-3 text-neutral-400 group-hover:text-neutral-900 group-hover:-translate-y-0.5 transition-transform duration-300" />
            <span>Voltar ao topo</span>
          </button>
        </div>

        {/* FOOTER */}
        <footer className="w-full bg-[#0a0a0a] border-t border-white/10 px-5 py-4 shrink-0 flex flex-col sm:flex-row justify-between items-center gap-2 mt-auto">
          <p className="text-[0.7rem] text-[#a0a0a0]">
            {config.ctaSection.copyrightText}
          </p>
          <p className="text-[0.7rem] text-[#a0a0a0]">
            Desenvolvido por <span className="text-[#d4a853] font-semibold">Navo</span>
          </p>
        </footer>
      </section>
    </div>
  );
};

