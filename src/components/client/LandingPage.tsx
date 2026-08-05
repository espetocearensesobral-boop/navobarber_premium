import React, { useState } from 'react';
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
  Navigation
} from 'lucide-react';
import { hapticMedium, hapticLight } from '../../lib/haptics';

interface LandingPageProps {
  onGoToBooking: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGoToBooking }) => {
  const [activeCategory, setActiveCategory] = useState<'todos' | 'cabelo' | 'barba'>('todos');

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
    <div className="w-full min-h-screen bg-neutral-50 text-neutral-900 flex flex-col pb-12 font-sans antialiased">
      {/* HERO WITH OVERLAY HEADER */}
      <section className="relative w-full min-h-[480px] sm:min-h-[520px] bg-neutral-950 text-white overflow-hidden flex flex-col justify-center items-center">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=1200&auto=format&fit=crop" 
            alt="Nobre Barbearia" 
            className="w-full h-full object-cover object-center filter brightness-[0.35] contrast-110"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-neutral-950" />
        </div>

        {/* HERO CONTENT */}
        <div className="relative z-10 px-6 py-12 max-w-md mx-auto w-full flex flex-col items-center text-center">
          {/* RATING */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs text-white font-medium mb-5 shadow-lg">
            <div className="flex text-[#C8A96A] gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-current" />
              ))}
            </div>
            <span className="font-semibold">4.9 · 1.2k avaliações</span>
          </div>

          {/* HEADLINE */}
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight mb-3">
            Seu melhor visual começa aqui
          </h1>

          {/* SUBTITLE */}
          <p className="text-xs sm:text-sm text-neutral-300 font-normal leading-relaxed max-w-sm mb-7">
            Agende online, chegue na hora certa e saia renovado. Sem filas, sem espera, sem complicação.
          </p>

          {/* CTA BUTTON */}
          <button 
            onClick={() => { hapticMedium(); onGoToBooking(); }}
            className="w-full max-w-xs bg-[#C8A96A] hover:bg-[#b89859] text-neutral-950 font-bold text-sm py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-2xl active:scale-98 transition-all"
          >
            <CalendarCheck className="w-4 h-4 text-neutral-950" />
            <span>Agendar Agora</span>
          </button>
        </div>
      </section>

      {/* SECTION 1: POR QUE A NOBRE */}
      <section className="pt-12 pb-8 px-5 max-w-md mx-auto w-full">
        <span className="text-[#C8A96A] text-[11px] font-bold tracking-widest uppercase block mb-1">
          POR QUE A NOBRE
        </span>
        <h2 className="text-2xl font-extrabold text-neutral-950 tracking-tight mb-6">
          Feito para você relaxar
        </h2>

        <div className="grid grid-cols-2 gap-3">
          {differentials.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div 
                key={idx}
                className="bg-white border border-neutral-200/90 rounded-2xl p-4 flex flex-col gap-3 shadow-xs hover:border-neutral-900 transition-all group"
              >
                <div className="w-9 h-9 rounded-xl bg-neutral-950 text-[#C8A96A] flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Icon className="w-4 h-4 stroke-[2]" />
                </div>
                <span className="text-xs font-bold text-neutral-950 leading-snug">
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION 2: SERVIÇOS */}
      <section className="py-8 px-5 max-w-md mx-auto w-full">
        <span className="text-[#C8A96A] text-[11px] font-bold tracking-widest uppercase block mb-1">
          SERVIÇOS
        </span>
        <h2 className="text-2xl font-extrabold text-neutral-950 tracking-tight mb-5">
          Escolha seu serviço
        </h2>

        {/* TABS */}
        <div className="flex bg-neutral-200/80 p-1 rounded-2xl mb-6">
          {(['todos', 'cabelo', 'barba'] as const).map(cat => (
            <button
              key={cat}
              onClick={() => { hapticLight(); setActiveCategory(cat); }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl capitalize transition-all ${
                activeCategory === cat
                  ? 'bg-neutral-950 text-white shadow-md'
                  : 'text-neutral-600 hover:text-neutral-950'
              }`}
            >
              {cat === 'todos' ? 'Todos' : cat === 'cabelo' ? 'Cabelo' : 'Barba'}
            </button>
          ))}
        </div>

        {/* SERVICE CARDS */}
        <div className="space-y-4">
          {filteredServices.map(service => (
            <div 
              key={service.id}
              className="bg-white border border-neutral-200/90 hover:border-neutral-900/30 rounded-2xl p-4 flex gap-4 shadow-xs transition-all"
            >
              <img 
                src={service.image} 
                alt={service.title}
                className="w-20 h-20 rounded-xl object-cover shrink-0 border border-neutral-100"
              />

              <div className="flex flex-col justify-between flex-1 min-w-0">
                <div>
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="text-sm font-bold text-neutral-950 truncate">
                      {service.title}
                    </h3>
                    <span className="text-sm font-extrabold text-[#C8A96A] shrink-0">
                      R$ {service.price}
                    </span>
                  </div>

                  <p className="text-xs text-neutral-500 mt-1 line-clamp-1">
                    {service.description}
                  </p>

                  <div className="flex items-center gap-1 text-[11px] text-neutral-400 mt-1">
                    <Clock className="w-3 h-3 text-neutral-600" />
                    <span>{service.duration}</span>
                  </div>
                </div>

                <button 
                  onClick={() => { hapticMedium(); onGoToBooking(); }}
                  className="mt-3 w-full bg-neutral-950 hover:bg-neutral-800 text-white font-bold text-xs py-2.5 rounded-xl transition-colors active:scale-98 shadow-sm"
                >
                  Agendar
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 3: GALERIA */}
      <section className="py-8 px-5 max-w-md mx-auto w-full">
        <div className="flex justify-between items-end mb-5">
          <div>
            <span className="text-[#C8A96A] text-[11px] font-bold tracking-widest uppercase block mb-1">
              GALERIA
            </span>
            <h2 className="text-2xl font-extrabold text-neutral-950 tracking-tight">
              Cortes reais
            </h2>
          </div>
          <button 
            onClick={() => { hapticLight(); onGoToBooking(); }}
            className="text-xs font-bold text-neutral-700 hover:text-neutral-950 transition-colors"
          >
            Ver tudo
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          {galleryImages.map((img, idx) => (
            <div 
              key={idx}
              className="rounded-xl overflow-hidden aspect-square bg-neutral-200 border border-neutral-300/60 shadow-xs group"
            >
              <img 
                src={img.src} 
                alt={img.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 4: DEPOIMENTOS */}
      <section className="py-8 px-5 max-w-md mx-auto w-full">
        <span className="text-[#C8A96A] text-[11px] font-bold tracking-widest uppercase block mb-1">
          DEPOIMENTOS
        </span>
        <h2 className="text-2xl font-extrabold text-neutral-950 tracking-tight mb-5">
          Quem já passou por aqui
        </h2>

        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none -mx-5 px-5">
          {testimonials.map((item, idx) => (
            <div 
              key={idx}
              className="bg-white border border-neutral-200/90 rounded-2xl p-4.5 min-w-[260px] max-w-[280px] shrink-0 flex flex-col justify-between gap-3 shadow-xs"
            >
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <img 
                    src={item.avatar} 
                    alt={item.name}
                    className="w-9 h-9 rounded-full object-cover border border-neutral-300"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-neutral-950">
                      {item.name}
                    </h4>
                    <div className="flex text-[#C8A96A] gap-0.5 mt-0.5">
                      {[...Array(item.rating)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-current" />
                      ))}
                    </div>
                  </div>
                </div>

                <p className="text-xs text-neutral-600 leading-relaxed font-normal">
                  "{item.text}"
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 5: LOCALIZAÇÃO */}
      <section className="py-8 px-5 max-w-md mx-auto w-full">
        <span className="text-[#C8A96A] text-[11px] font-bold tracking-widest uppercase block mb-1">
          LOCALIZAÇÃO
        </span>
        <h2 className="text-2xl font-extrabold text-neutral-950 tracking-tight mb-5">
          Onde estamos
        </h2>

        <div className="bg-white border border-neutral-200/90 rounded-3xl p-4 shadow-xs space-y-4">
          {/* Map Image Graphic */}
          <div className="relative h-44 rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-200">
            <img 
              src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=800&auto=format&fit=crop" 
              alt="Mapa Nobre" 
              className="w-full h-full object-cover filter contrast-110 opacity-80"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-neutral-950 text-[#C8A96A] flex items-center justify-center shadow-2xl border border-white/20">
                <MapPin className="w-5 h-5 fill-current text-[#C8A96A]" />
              </div>
            </div>
          </div>

          <div className="space-y-2 text-xs text-neutral-800">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-[#C8A96A] shrink-0 mt-0.5" />
              <span className="font-semibold text-neutral-950">Rua Augusta, 1420 · Jardins, São Paulo</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#C8A96A] shrink-0" />
              <span className="font-medium text-neutral-700">Seg a Sáb · 09h às 21h</span>
            </div>
          </div>

          <button 
            onClick={handleOpenGoogleMaps}
            className="w-full bg-neutral-950 text-white font-bold text-xs py-3 rounded-2xl flex items-center justify-center gap-2 hover:bg-neutral-800 active:scale-98 transition-colors shadow-sm"
          >
            <Navigation className="w-3.5 h-3.5 text-[#C8A96A]" />
            <span>Como chegar</span>
          </button>
        </div>
      </section>

      {/* SECTION 6: PRONTO PARA O SEU NOVO VISUAL? (DARK CARD) */}
      <section className="py-8 px-5 max-w-md mx-auto w-full">
        <div className="bg-neutral-950 text-white rounded-3xl p-7 relative overflow-hidden shadow-2xl border border-neutral-800">
          <div className="w-11 h-11 rounded-2xl bg-[#C8A96A]/20 border border-[#C8A96A]/40 flex items-center justify-center text-[#C8A96A] mb-5 shadow-inner">
            <Scissors className="w-5 h-5 stroke-[2.2]" />
          </div>

          <h2 className="text-2xl font-extrabold text-white mb-3 tracking-tight">
            Pronto para o seu<br />novo visual?
          </h2>

          <p className="text-xs text-neutral-300 font-normal leading-relaxed mb-6">
            Garanta seu horário em segundos e viva a experiência Nobre.
          </p>

          <button 
            onClick={handleOpenWhatsApp}
            className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg active:scale-98 transition-all"
          >
            <MessageCircle className="w-4 h-4 fill-current" />
            <span>Agendar pelo WhatsApp</span>
          </button>
        </div>
      </section>
    </div>
  );
};
