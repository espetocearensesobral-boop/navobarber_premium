import React, { useState, useRef } from 'react';
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
  ArrowUp
} from 'lucide-react';
import { hapticMedium, hapticLight } from '../../lib/haptics';

interface LandingPageProps {
  onGoToBooking: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGoToBooking }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeCategory, setActiveCategory] = useState<'todos' | 'cabelo' | 'barba'>('todos');

  const scrollToTop = () => {
    hapticLight();
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const services = [
    {
      id: 'srv_1',
      title: 'Corte Clássico',
      category: 'cabelo',
      price: 60,
      duration: '45 min',
      description: 'Tesoura e máquina com acabamento.',
      image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=400&auto=format&fit=crop',
    },
    {
      id: 'srv_2',
      title: 'Barba Premium',
      category: 'barba',
      price: 45,
      duration: '30 min',
      description: 'Toalha quente e navalha.',
      image: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=400&auto=format&fit=crop',
    },
    {
      id: 'srv_3',
      title: 'Combo Corte + Barba',
      category: 'cabelo',
      price: 95,
      duration: '75 min',
      description: 'Experiência completa Nobre.',
      image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=400&auto=format&fit=crop',
    }
  ];

  const filteredServices = services.filter(s => {
    if (activeCategory === 'todos') return true;
    if (activeCategory === 'cabelo') return s.category === 'cabelo';
    if (activeCategory === 'barba') return s.category === 'barba';
    return true;
  });

  const differentials = [
    { icon: Award, label: 'Profissionais experientes' },
    { icon: Snowflake, label: 'Ambiente climatizado' },
    { icon: Coffee, label: 'Café cortesia' },
    { icon: Wifi, label: 'Wi-Fi gratuito' },
    { icon: Car, label: 'Estacionamento' },
    { icon: Clock, label: 'Horário marcado' }
  ];

  const galleryImages = [
    { src: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=600&auto=format&fit=crop', title: 'Fade Moderno' },
    { src: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=600&auto=format&fit=crop', title: 'Barboterapia' },
    { src: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=600&auto=format&fit=crop', title: 'Espaço Premium' },
    { src: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?q=80&w=600&auto=format&fit=crop', title: 'Acabamento' },
    { src: 'https://images.unsplash.com/photo-1517832606299-7ae9b720a186?q=80&w=600&auto=format&fit=crop', title: 'Café & Tesoura' },
    { src: 'https://images.unsplash.com/photo-1593728612741-2461ccce8fdb?q=80&w=600&auto=format&fit=crop', title: 'Acabamento Mestre' }
  ];

  const testimonials = [
    {
      name: 'Rafael M.',
      rating: 5,
      text: 'Melhor barbearia da cidade. Atendimento impecável e resultado sempre perfeito.',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'
    },
    {
      name: 'Lucas S.',
      rating: 5,
      text: 'Ambiente sensacional e um corte de primeira. Recomendo demais!',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=150'
    }
  ];

  const handleOpenGoogleMaps = () => {
    hapticLight();
    window.open('https://maps.google.com/?q=Rua+Augusta+1420+Jardins+Sao+Paulo', '_blank', 'noopener,noreferrer');
  };

  const handleOpenWhatsApp = () => {
    hapticLight();
    window.open('https://wa.me/5511999998888?text=Olá!%20Gostaria%20de%20agendar%20um%20horário%20na%20Nobre.', '_blank', 'noopener,noreferrer');
  };

  return (
    <div ref={containerRef} className="w-full h-[100dvh] overflow-y-auto snap-y snap-mandatory scroll-smooth bg-white text-neutral-900 font-sans antialiased relative selection:bg-[#C8A96A]/20 selection:text-neutral-900 no-scrollbar">
      {/* SECTION 0: HERO */}
      <section className="relative w-full h-[100dvh] min-h-[100dvh] snap-start snap-always shrink-0 bg-neutral-950 text-white overflow-hidden flex flex-col justify-center">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=1200&auto=format&fit=crop" 
            alt="Nobre Barbearia" 
            className="w-full h-full object-cover object-center filter brightness-[0.45] contrast-105"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-neutral-950/90" />
        </div>

        {/* HERO CONTENT */}
        <div className="relative z-10 px-6 sm:px-8 md:px-12 lg:px-16 max-w-md md:max-w-4xl lg:max-w-6xl mx-auto w-full py-8 md:py-16 flex flex-col items-start justify-center flex-1">
          {/* RATING */}
          <div className="flex items-center gap-2 text-xs sm:text-sm md:text-base text-white/90 font-medium mb-3 md:mb-6">
            <div className="flex text-amber-400 gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 fill-current" />
              ))}
            </div>
            <span>4.9 · 1.2k avaliações</span>
          </div>

          {/* HEADLINE */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.1] mb-4 md:mb-6">
            Seu melhor visual<br />começa aqui.
          </h1>

          {/* SUBTITLE */}
          <p className="text-sm sm:text-base md:text-xl text-white/85 font-normal leading-relaxed max-w-xs sm:max-w-md md:max-w-2xl mb-8 md:mb-12">
            Barbearia moderna com atendimento premium por horário marcado. Estilo, precisão e conforto.
          </p>

          {/* CTA BUTTON */}
          <button 
            onClick={() => { hapticMedium(); onGoToBooking(); }}
            className="w-full md:w-auto md:px-10 md:py-4 bg-white hover:bg-neutral-100 text-neutral-900 font-semibold text-sm md:text-base py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2.5 shadow-xl hover:scale-102 active:scale-98 transition-all"
          >
            <CalendarCheck className="w-4 h-4 md:w-5 md:h-5 text-neutral-900" />
            <span>Agendar Agora</span>
          </button>
        </div>
      </section>

      {/* SECTION 1: POR QUE A NOBRE */}
      <section className="w-full h-[100dvh] min-h-[100dvh] snap-start snap-always shrink-0 flex flex-col justify-center px-5 sm:px-8 md:px-12 lg:px-16 py-6 sm:py-8 md:py-12 bg-white overflow-hidden">
        <div className="max-w-md md:max-w-4xl lg:max-w-6xl mx-auto w-full flex flex-col justify-between h-full py-4 sm:py-6 md:py-8">
          <div className="shrink-0">
            <span className="text-[#C8A96A] text-[11px] sm:text-xs md:text-sm font-bold tracking-widest uppercase block mb-1.5 md:mb-2">
              POR QUE A NOBRE
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-neutral-900 tracking-tight">
              Feito para você relaxar
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 lg:gap-8 my-auto flex-1 items-center py-2">
            {differentials.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div 
                  key={idx}
                  className="bg-white border border-neutral-200/80 rounded-2xl p-4 sm:p-5 md:p-6 lg:p-8 flex flex-col justify-between gap-3 sm:gap-4 md:gap-6 shadow-xs hover:border-[#C8A96A]/60 hover:shadow-md transition-all duration-300 group h-full min-h-[110px] sm:min-h-[130px] md:min-h-[160px]"
                >
                  <Icon className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-[#C8A96A] stroke-[1.75] group-hover:scale-110 transition-transform" />
                  <span className="text-xs sm:text-sm md:text-base font-semibold text-neutral-900 leading-snug">
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 2: SERVIÇOS */}
      <section className="w-full h-[100dvh] min-h-[100dvh] snap-start snap-always shrink-0 flex flex-col justify-center px-5 sm:px-8 md:px-12 lg:px-16 py-6 sm:py-8 md:py-12 bg-white overflow-hidden">
        <div className="max-w-md md:max-w-4xl lg:max-w-6xl mx-auto w-full flex flex-col justify-between h-full py-4 sm:py-6 md:py-8">
          <div className="shrink-0">
            <span className="text-[#C8A96A] text-[11px] sm:text-xs md:text-sm font-bold tracking-widest uppercase block mb-1.5 md:mb-2">
              SERVIÇOS
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-neutral-900 tracking-tight mb-3 md:mb-4">
              Escolha seu serviço
            </h2>

            {/* TABS */}
            <div className="flex bg-neutral-100 p-1 rounded-2xl md:max-w-md md:mx-auto w-full">
              {(['todos', 'cabelo', 'barba'] as const).map(cat => (
                <button
                  key={cat}
                  onClick={() => { hapticLight(); setActiveCategory(cat); }}
                  className={`flex-1 py-2 text-xs md:text-sm font-medium rounded-xl capitalize transition-all ${
                    activeCategory === cat
                      ? 'bg-white text-neutral-900 shadow-xs font-semibold'
                      : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  {cat === 'todos' ? 'Todos' : cat === 'cabelo' ? 'Cabelo' : 'Barba'}
                </button>
              ))}
            </div>
          </div>

          {/* SERVICE CARDS */}
          <div className="space-y-3 sm:space-y-4 md:space-y-0 md:grid md:grid-cols-3 md:gap-6 lg:gap-8 my-auto flex-1 items-center py-2">
            {filteredServices.map(service => (
              <div 
                key={service.id}
                className="bg-white border border-neutral-200/80 rounded-2xl p-3.5 sm:p-4 md:p-5 lg:p-6 flex md:flex-col gap-3.5 sm:gap-4 md:gap-5 shadow-xs hover:border-[#C8A96A]/60 hover:shadow-lg transition-all duration-300 md:h-full justify-between"
              >
                <img 
                  src={service.image} 
                  alt={service.title}
                  className="w-20 h-20 sm:w-24 sm:h-24 md:w-full md:h-44 lg:h-52 rounded-xl object-cover shrink-0"
                />

                <div className="flex flex-col justify-between flex-1 min-w-0">
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="text-xs sm:text-sm md:text-base lg:text-lg font-bold text-neutral-900 truncate">
                        {service.title}
                      </h3>
                      <span className="text-xs sm:text-sm md:text-base lg:text-lg font-bold text-[#C8A96A] shrink-0">
                        R$ {service.price}
                      </span>
                    </div>

                    <p className="text-[11px] sm:text-xs md:text-sm text-neutral-500 mt-1 line-clamp-2">
                      {service.description}
                    </p>

                    <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-neutral-400 mt-2">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{service.duration}</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => { hapticMedium(); onGoToBooking(); }}
                    className="mt-3 w-full bg-neutral-900 hover:bg-neutral-800 text-white font-medium text-xs sm:text-sm md:text-base py-2.5 rounded-xl transition-all active:scale-98"
                  >
                    Agendar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3: GALERIA */}
      <section className="w-full h-[100dvh] min-h-[100dvh] snap-start snap-always shrink-0 flex flex-col justify-center px-4 sm:px-6 md:px-10 lg:px-16 py-4 sm:py-6 md:py-8 bg-white overflow-hidden">
        <div className="max-w-md md:max-w-4xl lg:max-w-6xl mx-auto w-full flex flex-col justify-between h-full">
          {/* Header */}
          <div className="flex justify-between items-end mb-2.5 sm:mb-4 shrink-0">
            <div>
              <span className="text-[#C8A96A] text-[11px] sm:text-xs md:text-sm font-bold tracking-widest uppercase block mb-1">
                GALERIA
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-neutral-900 tracking-tight">
                Cortes reais
              </h2>
            </div>
            <button 
              onClick={() => { hapticLight(); onGoToBooking(); }}
              className="text-xs sm:text-sm md:text-base font-semibold text-neutral-500 hover:text-neutral-900 transition-colors"
            >
              Ver tudo
            </button>
          </div>

          {/* Bento Grid Composition - Asymmetric premium gallery */}
          <div className="grid grid-cols-12 grid-rows-6 gap-2 sm:gap-3 md:gap-4 flex-1 w-full h-full min-h-0">
            {/* 1. Foto Vertical Grande (Destaque) - Esquerda (Cols 1-5, Rows 1-4) */}
            <div className="col-span-5 row-span-4 rounded-xl sm:rounded-2xl overflow-hidden relative group bg-neutral-900 shadow-xs border border-neutral-200/50">
              <img 
                src={galleryImages[0].src} 
                alt={galleryImages[0].title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent flex flex-col justify-end p-2.5 sm:p-4">
                <span className="bg-[#C8A96A] text-neutral-950 text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-md w-max mb-1 uppercase tracking-wider">
                  Destaque
                </span>
                <h3 className="text-white font-bold text-xs sm:text-base md:text-lg lg:text-xl leading-snug">
                  {galleryImages[0].title}
                </h3>
              </div>
            </div>

            {/* 2. Fotos Menores - Centro/Direita (Cols 6-12, Rows 1-2) */}
            <div className="col-span-7 row-span-2 grid grid-cols-2 gap-2 sm:gap-3">
              <div className="rounded-xl sm:rounded-2xl overflow-hidden relative group bg-neutral-900 shadow-xs border border-neutral-200/50">
                <img 
                  src={galleryImages[1].src} 
                  alt={galleryImages[1].title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent flex items-end p-2 sm:p-3">
                  <span className="text-white font-semibold text-[11px] sm:text-xs md:text-sm line-clamp-1">{galleryImages[1].title}</span>
                </div>
              </div>
              <div className="rounded-xl sm:rounded-2xl overflow-hidden relative group bg-neutral-900 shadow-xs border border-neutral-200/50">
                <img 
                  src={galleryImages[3].src} 
                  alt={galleryImages[3].title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent flex items-end p-2 sm:p-3">
                  <span className="text-white font-semibold text-[11px] sm:text-xs md:text-sm line-clamp-1">{galleryImages[3].title}</span>
                </div>
              </div>
            </div>

            {/* 3. Card Informativo / Promocional Integrado ao Grid (Cols 6-12, Rows 3-4) */}
            <div className="col-span-7 row-span-2 bg-gradient-to-br from-neutral-900 via-neutral-950 to-neutral-900 text-white rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 flex flex-col justify-between border border-neutral-800 shadow-xs relative overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 w-28 h-28 bg-[#C8A96A]/15 rounded-full blur-2xl group-hover:bg-[#C8A96A]/25 transition-all duration-500 pointer-events-none" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[#C8A96A]">
                  <Scissors className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">Acabamento Mestre</span>
                </div>
                <div className="flex text-amber-400 gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-current" />
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-xs sm:text-sm md:text-base font-bold text-white mb-0.5 leading-tight">
                  Detalhes que fazem toda a diferença.
                </h4>
                <p className="text-[10px] sm:text-xs text-neutral-400 font-normal line-clamp-1 sm:line-clamp-2">
                  Cortes precisos, barba bem desenhada e produtos de excelência.
                </p>
              </div>
            </div>

            {/* 4. Foto Horizontal Grande na Base (Cols 1-12, Rows 5-6) */}
            <div className="col-span-12 row-span-2 rounded-xl sm:rounded-2xl overflow-hidden relative group bg-neutral-900 shadow-xs border border-neutral-200/50">
              <img 
                src={galleryImages[2].src} 
                alt={galleryImages[2].title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent flex items-end justify-between p-3 sm:p-4">
                <div>
                  <span className="text-white font-bold text-xs sm:text-base md:text-lg block leading-tight">
                    {galleryImages[2].title}
                  </span>
                  <span className="text-neutral-300 text-[10px] sm:text-xs line-clamp-1">
                    Ambiente climatizado e estrutura de alto padrão para você relaxar.
                  </span>
                </div>
                <button 
                  onClick={() => { hapticMedium(); onGoToBooking(); }}
                  className="bg-white/95 hover:bg-white text-neutral-900 font-bold text-xs px-3 sm:px-4 py-1.5 rounded-xl transition-all active:scale-95 shrink-0 shadow-md ml-2"
                >
                  Agendar
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: DEPOIMENTOS */}
      <section className="w-full h-[100dvh] min-h-[100dvh] snap-start snap-always shrink-0 flex flex-col justify-center px-5 sm:px-8 md:px-12 lg:px-16 py-6 sm:py-8 md:py-12 bg-white overflow-hidden">
        <div className="max-w-md md:max-w-4xl lg:max-w-6xl mx-auto w-full flex flex-col justify-between h-full py-4 sm:py-6 md:py-8">
          <div className="shrink-0 mb-2 md:mb-4">
            <span className="text-[#C8A96A] text-[11px] sm:text-xs md:text-sm font-bold tracking-widest uppercase block mb-1.5 md:mb-2">
              DEPOIMENTOS
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-neutral-900 tracking-tight">
              Quem já passou por aqui
            </h2>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none -mx-5 px-5 md:mx-0 md:px-0 md:grid md:grid-cols-2 md:gap-8 md:overflow-visible my-auto flex-1 items-center py-2">
            {testimonials.map((item, idx) => (
              <div 
                key={idx}
                className="bg-white border border-neutral-200/80 rounded-2xl md:rounded-3xl p-5 sm:p-6 md:p-8 lg:p-10 min-w-[280px] max-w-[300px] md:min-w-0 md:max-w-none shrink-0 md:shrink flex flex-col justify-between gap-4 sm:gap-6 shadow-xs hover:border-[#C8A96A]/50 hover:shadow-md transition-all md:h-full"
              >
                <div>
                  <div className="flex items-center gap-3.5 mb-4 sm:mb-6">
                    <img 
                      src={item.avatar} 
                      alt={item.name}
                      className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full object-cover"
                    />
                    <div>
                      <h4 className="text-sm sm:text-base md:text-lg font-bold text-neutral-900">
                        {item.name}
                      </h4>
                      <div className="flex text-amber-400 gap-1 mt-1">
                        {[...Array(item.rating)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" />
                        ))}
                      </div>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm md:text-base text-neutral-600 leading-relaxed font-normal italic">
                    "{item.text}"
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 5: LOCALIZAÇÃO */}
      <section className="w-full h-[100dvh] min-h-[100dvh] snap-start snap-always shrink-0 flex flex-col justify-center px-5 sm:px-8 md:px-12 lg:px-16 py-6 sm:py-8 md:py-12 bg-white overflow-hidden">
        <div className="max-w-md md:max-w-4xl lg:max-w-6xl mx-auto w-full flex flex-col justify-between h-full py-4 sm:py-6 md:py-8">
          <div className="shrink-0">
            <span className="text-[#C8A96A] text-[11px] sm:text-xs md:text-sm font-bold tracking-widest uppercase block mb-1.5 md:mb-2">
              LOCALIZAÇÃO
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-neutral-900 tracking-tight">
              Onde estamos
            </h2>
          </div>

          <div className="bg-white border border-neutral-200/80 rounded-3xl p-5 sm:p-6 md:p-8 lg:p-10 shadow-xs space-y-5 md:space-y-0 md:grid md:grid-cols-2 md:gap-8 lg:gap-12 items-center my-auto flex-1 py-2">
            {/* Map Image Graphic */}
            <div className="relative h-48 sm:h-56 md:h-72 lg:h-80 rounded-2xl overflow-hidden bg-neutral-100 border border-neutral-200">
              <img 
                src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=800&auto=format&fit=crop" 
                alt="Mapa Nobre" 
                className="w-full h-full object-cover filter contrast-105"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-neutral-900 text-white flex items-center justify-center shadow-lg">
                  <MapPin className="w-5 h-5 md:w-6 md:h-6 fill-current text-white" />
                </div>
              </div>
            </div>

            <div className="space-y-5 md:space-y-8 flex flex-col justify-center">
              <div className="space-y-3 sm:space-y-4 text-xs sm:text-sm md:text-base text-neutral-700">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-[#C8A96A] shrink-0 mt-0.5" />
                  <span className="font-medium">Rua Augusta, 1420 · Jardins, São Paulo</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-[#C8A96A] shrink-0" />
                  <span className="font-medium">Seg a Sáb · 09h às 21h</span>
                </div>
              </div>

              <button 
                onClick={handleOpenGoogleMaps}
                className="w-full bg-white border border-neutral-300 text-neutral-900 font-semibold text-xs sm:text-sm md:text-base py-3.5 md:py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-neutral-50 active:scale-98 transition-all shadow-xs"
              >
                <Navigation className="w-4 h-4" />
                <span>Como chegar</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: PRONTO PARA O SEU NOVO VISUAL? (DARK CARD) */}
      <section className="w-full h-[100dvh] min-h-[100dvh] snap-start snap-always shrink-0 flex flex-col justify-between px-5 sm:px-8 md:px-12 lg:px-16 py-6 md:py-10 bg-white overflow-hidden relative">
        <div className="w-full flex-1 flex flex-col justify-center items-center">
          <div className="max-w-md md:max-w-3xl lg:max-w-4xl w-full bg-neutral-900 text-white rounded-3xl p-6 sm:p-8 md:p-12 lg:p-16 relative overflow-hidden shadow-xl md:text-center md:flex md:flex-col md:items-center">
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-[#C8A96A]/20 border border-[#C8A96A]/30 flex items-center justify-center text-[#C8A96A] mb-5 md:mb-6">
              <Scissors className="w-6 h-6 md:w-8 md:h-8 stroke-[2.2]" />
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 md:mb-4 tracking-tight">
              Pronto para o seu<br />novo visual?
            </h2>

            <p className="text-xs sm:text-sm md:text-base lg:text-lg text-neutral-400 font-normal leading-relaxed mb-6 md:mb-8 md:max-w-lg">
              Garanta seu horário em segundos e viva a experiência Nobre.
            </p>

            <button 
              onClick={handleOpenWhatsApp}
              className="w-full md:w-auto md:px-10 md:py-4 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs sm:text-sm md:text-base py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2.5 shadow-lg hover:scale-102 active:scale-98 transition-all"
            >
              <MessageCircle className="w-4 h-4 md:w-5 md:h-5 fill-current" />
              <span>Agendar pelo WhatsApp</span>
            </button>
          </div>
        </div>

        {/* MINIMALIST BACK TO TOP BUTTON IN THE BOTTOM WHITESPACE */}
        <div className="flex justify-center pt-2 pb-1 shrink-0">
          <button 
            onClick={scrollToTop}
            className="group flex items-center gap-2 text-xs font-medium text-neutral-400 hover:text-neutral-900 transition-all duration-300 px-4 py-2 rounded-full border border-neutral-200/80 bg-neutral-50/80 hover:bg-neutral-100 active:scale-95 shadow-xs"
          >
            <ArrowUp className="w-3.5 h-3.5 text-neutral-400 group-hover:text-neutral-900 group-hover:-translate-y-0.5 transition-transform duration-300" />
            <span>Voltar ao topo</span>
          </button>
        </div>
      </section>
    </div>
  );
};
