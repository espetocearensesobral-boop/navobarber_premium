import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  ShopProfile, 
  defaultShopProfile, 
  fetchShopProfile, 
  daysOfWeekMap 
} from '../../services/shopProfileService';
import { fetchServicesFromSupabase } from '../../services/supabaseDataService';
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
  Compass,
  ExternalLink,
  Phone,
  Instagram,
  ArrowUp,
  ArrowRight,
  List,
  Menu,
  X,
  User,
  Check,
  ChevronLeft,
  ChevronRight,
  Eye,
  Plus,
  ZoomIn,
  Sparkles
} from 'lucide-react';
import { hapticMedium, hapticLight } from '../../lib/haptics';

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
  const [activeCategory, setActiveCategory] = useState<'todos' | 'cabelo' | 'barba'>('todos');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHoursModalOpen, setIsHoursModalOpen] = useState(false);
  const [shopProfile, setShopProfile] = useState<ShopProfile>(defaultShopProfile);
  const [dbServices, setDbServices] = useState<any[]>([]);

  useEffect(() => {
    fetchShopProfile().then(data => {
      if (data) setShopProfile(data);
    });
    fetchServicesFromSupabase().then(data => {
      if (data && data.length > 0) setDbServices(data);
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

  const nextAvailableTimeSlot = useMemo(() => {
    const now = new Date();
    const dayIndex = now.getDay();
    const dayItem = daysOfWeekMap.find(item => item.dayIndex === dayIndex);
    
    if (dayItem && shopProfile.operatingSchedule?.[dayItem.key]?.active) {
      const sch = shopProfile.operatingSchedule[dayItem.key];
      const [openH, openM] = (sch.open || shopProfile.openTime || '09:00').split(':').map(Number);
      const [closeH, closeM] = (sch.close || shopProfile.closeTime || '20:00').split(':').map(Number);
      
      const currentMins = now.getHours() * 60 + now.getMinutes();
      const openMins = openH * 60 + openM;
      const closeMins = closeH * 60 + closeM;
      
      if (currentMins < openMins) {
        return sch.open || shopProfile.openTime || '09:00';
      } else if (currentMins < closeMins - 30) {
        const nextTotalMins = Math.ceil((currentMins + 1) / 30) * 30;
        const h = Math.floor(nextTotalMins / 60);
        const m = nextTotalMins % 60;
        if (h * 60 + m <= closeMins) {
          return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
        }
      }
    }

    for (let i = 1; i <= 7; i++) {
      const nextDate = new Date();
      nextDate.setDate(now.getDate() + i);
      const nextDayIndex = nextDate.getDay();
      const nextDayItem = daysOfWeekMap.find(item => item.dayIndex === nextDayIndex);
      if (nextDayItem && shopProfile.operatingSchedule?.[nextDayItem.key]?.active) {
        const openTime = shopProfile.operatingSchedule[nextDayItem.key].open || shopProfile.openTime || '09:00';
        const dayLabel = i === 1 ? 'Amanhã' : nextDayItem.label.split('-')[0].trim();
        return `${dayLabel} ${openTime}`;
      }
    }

    return '09:00';
  }, [shopProfile]);

  const defaultServices = [
    {
      id: 'srv_1',
      title: 'Corte Clássico',
      category: 'cabelo',
      price: 60,
      duration_minutes: 45,
      description: 'Tesoura e máquina com acabamento.',
      image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=400&auto=format&fit=crop',
    },
    {
      id: 'srv_2',
      title: 'Barba Premium',
      category: 'barba',
      price: 45,
      duration_minutes: 30,
      description: 'Toalha quente e navalha.',
      image: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=400&auto=format&fit=crop',
    },
    {
      id: 'srv_3',
      title: 'Combo Corte + Barba',
      category: 'cabelo',
      price: 95,
      duration_minutes: 75,
      description: 'Experiência completa Navo Premium.',
      image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=400&auto=format&fit=crop',
    }
  ];

  const servicesToDisplay = dbServices.length > 0 ? dbServices : defaultServices;

  const filteredServices = servicesToDisplay.filter(s => {
    if (activeCategory === 'todos') return true;
    const cat = (s.category || '').toLowerCase();
    if (activeCategory === 'cabelo') return cat.includes('cabelo') || cat.includes('corte');
    if (activeCategory === 'barba') return cat.includes('barba');
    return true;
  });

  const differentials = [
    { icon: User, secondaryIcon: Scissors, label: 'Profissionais experientes', strokeColor: '#b89060', bgColor: '#f5eedc' },
    { icon: Snowflake, label: 'Ambiente climatizado', strokeColor: '#80b6c6', bgColor: '#e3f4f8' },
    { icon: Coffee, label: 'Café cortesia', strokeColor: '#9e795a', bgColor: '#f5efe9' },
    { icon: Wifi, label: 'Wi-Fi gratuito', strokeColor: '#71a67a', bgColor: '#e6f5ea' },
    { icon: Car, label: 'Estacionamento próprio', strokeColor: '#9a9bc4', bgColor: '#edeefc' },
    { icon: Clock, secondaryIcon: Check, secondaryColor: '#4ade80', label: 'Horário marcado', strokeColor: '#c1877f', bgColor: '#faece9' }
  ];

  const [selectedGalleryIndex, setSelectedGalleryIndex] = useState<number | null>(null);

  const galleryFeaturedItems = useMemo(() => {
    const all = dbServices.length > 0 ? dbServices : defaultServices;
    // Serviços com selo de destaque (popular, is_popular, badge, is_featured, is_combo)
    let list = all.filter(s => Boolean(s.popular || s.is_popular || s.badge || s.is_featured || s.isFeatured || s.is_combo));
    if (list.length === 0) {
      list = all;
    }

    const defaultCutPresets = [
      { id: 'cut_1', title: 'Fade Moderno', price: 60, duration_minutes: 45, description: 'Degradê na navalha com alinhamento cirúrgico.', badge: 'Mais Vendido', image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=1000&auto=format&fit=crop' },
      { id: 'cut_2', title: 'Barboterapia VIP', price: 50, duration_minutes: 35, description: 'Toalha quente, massagem facial e navalha amolada.', badge: 'Destaque', image: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=1000&auto=format&fit=crop' },
      { id: 'cut_3', title: 'Combo Imperador', price: 100, duration_minutes: 75, description: 'Corte + Barba + Sobrancelha com hidratação.', badge: 'Experiência Completa', image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=1000&auto=format&fit=crop' },
      { id: 'cut_4', title: 'Corte Tesoura & Freestyle', price: 70, duration_minutes: 50, description: 'Design exclusivo na tesoura e acabamento preciso.', badge: 'Corte Mestre', image: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?q=80&w=1000&auto=format&fit=crop' },
      { id: 'cut_5', title: 'Design de Barba & Pigmentação', price: 65, duration_minutes: 40, description: 'Alinhamento com pigmentação e finalização.', badge: 'Exclusivo', image: 'https://images.unsplash.com/photo-1517832606299-7ae9b720a186?q=80&w=1000&auto=format&fit=crop' },
      { id: 'cut_6', title: 'Tratamento & Styling', price: 55, duration_minutes: 30, description: 'Lavagem especial, hidratação e pomada matte.', badge: 'Cuidado VIP', image: 'https://images.unsplash.com/photo-1593728612741-2461ccce8fdb?q=80&w=1000&auto=format&fit=crop' }
    ];

    const combined = [...list];
    if (combined.length < 6) {
      for (const preset of defaultCutPresets) {
        if (combined.length >= 6) break;
        if (!combined.some(item => (item.title || '').toLowerCase() === preset.title.toLowerCase())) {
          combined.push(preset as any);
        }
      }
    }

    const featured = combined.slice(0, 6);
    const defaultPhotos = defaultCutPresets.map(p => p.image);

    return featured.map((service, idx) => {
      const preset = defaultCutPresets[idx % defaultCutPresets.length];
      return {
        service,
        id: service.id || `feat_${idx}`,
        title: service.title || preset.title,
        price: Number(service.price) || preset.price,
        duration: service.duration_minutes || service.duration || preset.duration_minutes,
        description: service.description || preset.description,
        badge: service.badge || (service.is_combo ? 'Combo Especial' : (service.popular || service.is_popular) ? 'Mais Vendido' : preset.badge),
        src: service.image || service.image_url || defaultPhotos[idx % defaultPhotos.length]
      };
    });
  }, [dbServices, defaultServices]);

  useEffect(() => {
    if (selectedGalleryIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setSelectedGalleryIndex(prev => (prev !== null && prev > 0 ? prev - 1 : galleryFeaturedItems.length - 1));
      } else if (e.key === 'ArrowRight') {
        setSelectedGalleryIndex(prev => (prev !== null ? (prev + 1) % galleryFeaturedItems.length : 0));
      } else if (e.key === 'Escape') {
        setSelectedGalleryIndex(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedGalleryIndex, galleryFeaturedItems]);

  const testimonials = [
    {
      name: 'Rafael M.',
      rating: 5,
      date: '10 de Julho, 2026',
      text: 'Melhor barbearia da cidade. Atendimento impecável e resultado sempre perfeito.',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'
    },
    {
      name: 'Lucas S.',
      rating: 5,
      date: '02 de Agosto, 2026',
      text: 'Ambiente sensacional e um corte de primeira. Recomendo demais!',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=150'
    },
    {
      name: 'Felipe C.',
      rating: 5,
      date: '28 de Julho, 2026',
      text: 'Experiência incrível! O café é ótimo e os profissionais sabem exatamente o que estão fazendo.',
      avatar: 'https://images.unsplash.com/photo-1600486913747-55e5470d6f40?auto=format&fit=crop&q=80&w=150'
    },
    {
      name: 'Thiago R.',
      rating: 5,
      date: '15 de Junho, 2026',
      text: 'Finalmente encontrei uma barbearia que acerta em cheio no corte que eu quero.',
      avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=150'
    },
    {
      name: 'Marcos V.',
      rating: 5,
      date: '05 de Agosto, 2026',
      text: 'Estrutura de ponta e equipe muito simpática. O corte com toalha quente é sensacional.',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150'
    },
    {
      name: 'João P.',
      rating: 5,
      date: '20 de Julho, 2026',
      text: 'Sempre saio renovado. O ambiente climatizado e o wi-fi grátis ajudam muito na espera.',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150'
    }
  ];

  const handleOpenGoogleMaps = () => {
    hapticLight();
    const url = shopProfile.mapsUrl || `https://maps.google.com/?q=${encodeURIComponent(shopProfile.address)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleOpenWhatsApp = () => {
    hapticLight();
    const num = shopProfile.whatsapp ? shopProfile.whatsapp.replace(/\D/g, '') : '5511999998888';
    window.open(`https://wa.me/${num}?text=Olá!%20Gostaria%20de%20agendar%20um%20horário%20na%20${encodeURIComponent(shopProfile.name)}.`, '_blank', 'noopener,noreferrer');
  };

  const handleOpenWaze = () => {
    hapticLight();
    const address = shopProfile.address || 'Rua Augusta 1420 Jardins São Paulo';
    const url = `https://waze.com/ul?q=${encodeURIComponent(address)}&navigate=yes`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const isShopOpenNow = (() => {
    const now = new Date();
    const dayIndex = now.getDay();
    const dayItem = daysOfWeekMap.find(item => item.dayIndex === dayIndex);
    if (!dayItem) return true;
    const sch = shopProfile.operatingSchedule?.[dayItem.key];
    if (!sch || !sch.active) return false;

    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const [openH, openM] = (sch.open || shopProfile.openTime || '09:00').split(':').map(Number);
    const [closeH, closeM] = (sch.close || shopProfile.closeTime || '20:00').split(':').map(Number);
    const openMinutes = (openH || 9) * 60 + (openM || 0);
    const closeMinutes = (closeH || 20) * 60 + (closeM || 0);

    return currentMinutes >= openMinutes && currentMinutes < closeMinutes;
  })();

  return (
    <div ref={containerRef} className="w-full h-full min-h-0 overflow-y-scroll snap-y snap-mandatory bg-white text-neutral-900 font-sans antialiased relative selection:bg-[#C8A96A]/20 selection:text-neutral-900 no-scrollbar">
      {/* HOURS MODAL OVERLAY */}
      <div className={`fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex flex-col items-center justify-center transition-opacity duration-300 ${isHoursModalOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <button 
          onClick={toggleHoursModal} 
          className="absolute top-5 right-5 w-11 h-11 rounded-full bg-white/8 border border-white/10 text-white text-xl flex items-center justify-center active:scale-95 transition-transform"
          aria-label="Fechar modal"
        >
          ✕
        </button>
        <div className="bg-[#141414] border border-white/10 rounded-2xl p-6 sm:p-8 w-full max-w-sm flex flex-col gap-4">
          <h3 className="text-white text-xl font-extrabold mb-1 tracking-wide uppercase">Horário de Funcionamento</h3>
          
          <div className="space-y-2">
            {daysOfWeekMap.map(d => {
              const sch = shopProfile.operatingSchedule?.[d.key];
              if (!sch) return null;
              return (
                <div key={d.key} className="flex justify-between items-center text-[#f5f5f5] text-sm font-medium">
                  <span className="text-[#a0a0a0]">{d.label}</span>
                  {sch.active ? (
                    <span className="font-mono text-amber-400">{sch.open} - {sch.close}</span>
                  ) : (
                    <span className="text-red-500 font-bold">Fechado</span>
                  )}
                </div>
              );
            })}
          </div>

          <button
            onClick={handleOpenWhatsApp}
            className="mt-3 w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2.5 transition-colors text-sm"
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
          className="absolute top-5 right-5 w-11 h-11 rounded-full bg-white/8 border border-white/10 text-white text-xl flex items-center justify-center active:scale-95 transition-transform"
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
            backgroundImage: `linear-gradient(180deg, rgba(10,10,10,0.25) 0%, rgba(10,10,10,0.7) 45%, #0a0a0a 85%), url('https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=800&q=80')`
          }}
        />

        {/* HEADER */}
        <header className="relative z-20 flex items-center justify-between p-5 shrink-0">
          <div className="font-extrabold text-lg tracking-tight text-white flex items-center gap-1">
            <span>NAVO</span><span className="text-[#d4a853]">PREMIUM</span>
          </div>
          <button 
            onClick={toggleMenu} 
            className="w-10 h-10 rounded-full bg-white/8 border border-white/10 text-white flex items-center justify-center backdrop-blur-md active:scale-95 transition-transform"
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
            <span>4.9 · 1.2k avaliações</span>
          </div>

          {/* TITLE */}
          <h1 className="text-[clamp(1.85rem,4.5vh,2.8rem)] font-extrabold leading-[1.08] tracking-tight text-white mb-3">
            Seu melhor <span className="text-[#d4a853]">visual</span><br />
            começa aqui.
          </h1>

          {/* SUBTITLE */}
          <p className="text-[clamp(0.9rem,1.6vh,1.1rem)] leading-relaxed text-[#a0a0a0] mb-5 max-w-xs sm:max-w-md">
            Agende online, chegue na hora certa e saia renovado. Sem filas, sem espera, sem complicação.
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
              <span>Agendar meu horário</span>
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
              <span className="text-white font-bold text-sm">{nextAvailableTimeSlot}</span>
            </div>

            <button onClick={toggleHoursModal} className="flex flex-col items-center gap-1 cursor-pointer active:scale-95 transition-transform hover:opacity-80">
              <span className="text-[#a0a0a0] text-[0.65rem] font-bold tracking-widest uppercase">STATUS</span>
              <div className="flex items-center gap-1.5">
                <span className="text-green-500 font-semibold text-sm whitespace-nowrap">Aberto</span>
              </div>
            </button>

            <div className="flex flex-col items-center gap-1">
              <span className="text-[#a0a0a0] text-[0.65rem] font-bold tracking-widest uppercase">TEMPO MÉDIO</span>
              <span className="text-white font-bold text-sm">30 min</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 1: POR QUE A NAVO */}
      <section className="relative w-full h-full min-h-full max-h-full snap-start snap-always shrink-0 flex flex-col justify-between p-[clamp(0.75rem,2vh,2rem)] bg-white overflow-hidden box-border">
        <div className="max-w-md md:max-w-4xl lg:max-w-6xl mx-auto w-full h-full flex flex-col justify-between items-stretch min-h-0 my-auto">
          <div className="shrink-0 mb-[clamp(0.25rem,0.8vh,0.75rem)]">
            <span className="text-[#C8A96A] text-[clamp(0.6rem,1.1vh,0.8rem)] font-bold tracking-widest uppercase block mb-0.5">
              POR QUE A NAVO
            </span>
            <h2 className="text-[clamp(1.25rem,3.2vh,2.5rem)] font-extrabold text-neutral-900 tracking-tight leading-tight">
              Feito para você <span className="text-[#b89060]">relaxar</span>
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 grid-rows-3 md:grid-rows-2 gap-[clamp(0.375rem,1vh,1rem)] flex-1 min-h-0 my-auto py-[clamp(0.25rem,0.5vh,0.5rem)] items-stretch">
            {differentials.map((item, idx) => {
              const Icon = item.icon;
              const SecondaryIcon = item.secondaryIcon;
              return (
                <div 
                  key={idx}
                  className="bg-white border border-neutral-200/80 rounded-2xl p-[clamp(0.75rem,1.5vh,1.25rem)] flex flex-col items-center justify-center gap-[clamp(0.5rem,1.5vh,1rem)] text-center shadow-xs hover:shadow-md transition-all duration-300 group h-full min-h-0"
                >
                  <div 
                    className="w-[clamp(3.5rem,8vh,4.5rem)] h-[clamp(3.5rem,8vh,4.5rem)] rounded-full flex items-center justify-center relative shrink-0 transition-transform group-hover:scale-105"
                    style={{ backgroundColor: item.bgColor }}
                  >
                    <Icon 
                      className="w-[clamp(1.75rem,4vh,2.25rem)] h-[clamp(1.75rem,4vh,2.25rem)] stroke-[1.5]" 
                      style={{ color: item.strokeColor }} 
                    />
                    {SecondaryIcon && (
                      <div className="absolute bottom-1 right-1 bg-white rounded-full p-[2px] shadow-sm">
                        <SecondaryIcon 
                          className="w-[clamp(0.875rem,2vh,1.125rem)] h-[clamp(0.875rem,2vh,1.125rem)] stroke-[2.5]" 
                          style={{ color: item.secondaryColor || item.strokeColor }} 
                        />
                      </div>
                    )}
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
      <section id="galeria" className="relative w-full h-full min-h-full max-h-full snap-start snap-always shrink-0 flex flex-col justify-between p-[clamp(0.75rem,2vh,2rem)] bg-white overflow-hidden box-border">
        <div className="max-w-md md:max-w-4xl lg:max-w-6xl mx-auto w-full h-full flex flex-col justify-between items-stretch min-h-0 my-auto">
          {/* Header */}
          <div className="flex justify-between items-end mb-[clamp(0.25rem,0.8vh,0.75rem)] shrink-0">
            <div>
              <span className="text-[#C8A96A] text-[clamp(0.6rem,1.1vh,0.8rem)] font-bold tracking-widest uppercase block mb-0.5 flex items-center gap-1">
                <Star className="w-3 h-3 fill-[#C8A96A]" />
                <span>GALERIA • DESTAQUES</span>
              </span>
              <h2 className="text-[clamp(1.25rem,3.2vh,2.5rem)] font-bold text-neutral-900 tracking-tight leading-tight">
                Cortes reais
              </h2>
            </div>
            <button 
              onClick={() => { hapticLight(); onGoToBooking(); }}
              className="text-[clamp(0.65rem,1.3vh,0.875rem)] font-semibold text-neutral-500 hover:text-neutral-900 transition-colors flex items-center gap-1"
            >
              <span>Ver todos os serviços</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Galeria Bento Grid dos Serviços com Selo de Destaque (no máximo 6 fotos) */}
          <div className="grid grid-cols-12 grid-rows-6 gap-[clamp(0.25rem,0.6vh,0.65rem)] flex-1 min-h-0 w-full h-full">
            {galleryFeaturedItems.map((item, index) => {
              const isHero = index === 0;
              let gridClass = 'col-span-4 md:col-span-4 row-span-2 md:row-span-2';
              if (index === 0) {
                gridClass = 'col-span-12 md:col-span-8 row-span-2 md:row-span-4';
              } else if (index === 1 || index === 2) {
                gridClass = 'col-span-6 md:col-span-4 row-span-2 md:row-span-2';
              } else if (index >= 3) {
                gridClass = 'col-span-4 md:col-span-4 row-span-2 md:row-span-2';
              }

              return (
                <div
                  key={item.id + '_' + index}
                  onClick={() => {
                    hapticLight();
                    setSelectedGalleryIndex(index);
                  }}
                  className={`${gridClass} rounded-[clamp(0.5rem,1vh,0.875rem)] overflow-hidden relative group bg-neutral-900 border border-neutral-200/50 hover:border-[#C8A96A]/80 shadow-xs min-h-0 h-full cursor-pointer transition-all duration-300`}
                >
                  {/* Photo image */}
                  <img
                    loading="lazy"
                    src={item.src}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/10 flex flex-col justify-between p-[clamp(0.35rem,0.8vh,0.75rem)] select-none">
                    {/* Top Tag & Zoom */}
                    <div className="flex items-center justify-between gap-1">
                      <span className="bg-gradient-to-r from-amber-400 via-[#C8A96A] to-amber-500 text-neutral-950 font-black text-[clamp(0.45rem,0.85vh,0.65rem)] px-2 py-0.5 rounded-full shadow-md uppercase tracking-wider flex items-center gap-1 w-max">
                        <Star className="w-2.5 h-2.5 fill-neutral-950" />
                        <span>{item.badge}</span>
                      </span>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          hapticLight();
                          setSelectedGalleryIndex(index);
                        }}
                        className="p-1.5 rounded-full bg-black/60 text-white/90 hover:text-white backdrop-blur-md hover:bg-black/80 transition-all border border-white/20 active:scale-90"
                        title="Visualizar foto em tamanho cheio"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Bottom Info & Add button */}
                    <div className="space-y-1">
                      <h3 className={`text-white font-extrabold ${isHero ? 'text-[clamp(0.75rem,1.5vh,1.1rem)]' : 'text-[clamp(0.6rem,1.15vh,0.85rem)]'} leading-tight line-clamp-1`}>
                        {item.title}
                      </h3>

                      {isHero && (
                        <p className="text-neutral-300 text-[clamp(0.5rem,0.85vh,0.7rem)] line-clamp-1">
                          {item.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between gap-1 pt-0.5">
                        <span className="text-[#C8A96A] font-black text-[clamp(0.6rem,1.2vh,0.85rem)]">
                          R$ {item.price.toFixed(2)}
                        </span>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            hapticMedium();
                            onGoToBooking(item.service);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-[#C8A96A] hover:bg-amber-500 text-neutral-950 font-black text-[clamp(0.5rem,0.95vh,0.7rem)] transition-all active:scale-95 shadow-md flex items-center gap-1 cursor-pointer shrink-0"
                          title="Adicionar ao agendamento"
                        >
                          <Plus className="w-3 h-3 stroke-[3]" />
                          <span>Adicionar</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 4: DEPOIMENTOS - VERTICAL LAYOUT */}
      <section className="relative w-full h-full min-h-full max-h-full snap-start snap-always shrink-0 flex flex-col justify-between p-[clamp(0.75rem,2vh,2rem)] bg-white overflow-hidden box-border">
        <div className="max-w-md md:max-w-4xl lg:max-w-6xl mx-auto w-full h-full flex flex-col justify-between items-stretch min-h-0 my-auto">
          <div className="shrink-0 mb-[clamp(0.25rem,0.8vh,0.75rem)]">
            <span className="text-[#C8A96A] text-[clamp(0.6rem,1.1vh,0.8rem)] font-bold tracking-widest uppercase block mb-0.5">
              DEPOIMENTOS
            </span>
            <h2 className="text-[clamp(1.25rem,3.2vh,2.5rem)] font-bold text-neutral-900 tracking-tight leading-tight">
              Quem já passou por aqui
            </h2>
          </div>

          <div className="flex flex-col gap-[clamp(0.375rem,1vh,1rem)] flex-1 min-h-0 justify-center items-stretch my-auto py-[clamp(0.25rem,0.5vh,0.5rem)] w-full">
            {testimonials.map((item, idx) => (
              <div 
                key={idx}
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
          {/* Section Header */}
          <div className="shrink-0 mb-[clamp(0.25rem,0.8vh,0.75rem)] flex items-end justify-between gap-3">
            <div>
              <span className="text-[#C8A96A] text-[clamp(0.6rem,1.1vh,0.8rem)] font-bold tracking-widest uppercase flex items-center gap-1.5 mb-0.5">
                <MapPin className="w-3.5 h-3.5 text-[#C8A96A]" />
                LOCALIZAÇÃO & ATENDIMENTO
              </span>
              <h2 className="text-[clamp(1.25rem,3.2vh,2.5rem)] font-bold text-neutral-900 tracking-tight leading-tight font-serif">
                Onde estamos
              </h2>
            </div>

            {/* Live Open/Closed Status Pill */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-100 text-neutral-800 border border-neutral-200/90 shadow-2xs shrink-0">
              <span className={`w-2 h-2 rounded-full ${isShopOpenNow ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
              <span className="text-[clamp(0.6rem,1.1vh,0.75rem)] font-bold uppercase tracking-wider">
                {isShopOpenNow ? 'Aberto Agora' : 'Atendimento Fechado'}
              </span>
            </div>
          </div>

          {/* Main Card Container (Light System Palette) */}
          <div className="bg-white border border-neutral-200/90 rounded-[clamp(0.75rem,1.6vh,1.25rem)] p-[clamp(0.625rem,1.5vh,1.25rem)] shadow-lg flex-1 min-h-0 my-auto flex flex-col md:grid md:grid-cols-12 gap-[clamp(0.625rem,1.5vh,1.25rem)] items-stretch justify-between text-neutral-900 overflow-hidden">
            
            {/* Real Interactive Google Maps Embedded iframe */}
            <div className="relative w-full md:col-span-7 flex-1 min-h-[clamp(8.5rem,18vh,15rem)] rounded-[clamp(0.625rem,1.2vh,1rem)] overflow-hidden bg-neutral-100 border border-neutral-200 shrink-0 md:shrink group shadow-2xs">
              <iframe
                title="Mapa de Localização da Barbearia"
                width="100%"
                height="100%"
                style={{ border: 0, filter: 'contrast(102%) brightness(98%)' }}
                loading="lazy"
                allowFullScreen
                src={`https://maps.google.com/maps?q=${encodeURIComponent(shopProfile.address || 'Rua Augusta, 1420 - Jardins, São Paulo - SP')}&t=&z=16&ie=UTF8&iwloc=&output=embed`}
                className="w-full h-full min-h-full rounded-[clamp(0.5rem,1vh,0.875rem)]"
              />
              
              {/* Map Floating Top Badge & Expand Link */}
              <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
                <div className="bg-white/95 backdrop-blur-md border border-neutral-200 px-2.5 py-1 rounded-lg shadow-xs flex items-center gap-2 pointer-events-auto">
                  <div className="w-2 h-2 rounded-full bg-[#C8A96A]" />
                  <span className="text-[10px] sm:text-[11px] font-bold text-neutral-900 uppercase tracking-wide truncate max-w-[150px] sm:max-w-xs">
                    {shopProfile.unitName || 'Unidade Jardins'}
                  </span>
                </div>

                <button
                  onClick={handleOpenGoogleMaps}
                  className="bg-white/95 hover:bg-neutral-50 text-neutral-800 border border-neutral-200 px-2.5 py-1 rounded-lg shadow-xs transition-all pointer-events-auto flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold"
                  title="Abrir no Google Maps"
                >
                  <ExternalLink className="w-3 h-3 text-[#C8A96A]" />
                  <span className="hidden sm:inline">Ver no Mapa</span>
                </button>
              </div>
            </div>

            {/* Details Panel & Action Buttons */}
            <div className="md:col-span-5 flex flex-col justify-between space-y-[clamp(0.375rem,1vh,0.875rem)] min-h-0">
              
              {/* Highlighted Custom Typography */}
              <div className="space-y-[clamp(0.375rem,1vh,0.75rem)]">
                <div>
                  <span className="text-[clamp(0.6rem,1vh,0.725rem)] font-bold uppercase tracking-widest text-[#C8A96A] block mb-0.5">
                    {shopProfile.unitName || 'Unidade Jardins'}
                  </span>
                  <h3 className="text-[clamp(1.1rem,2.2vh,1.5rem)] font-extrabold text-neutral-900 tracking-tight leading-tight font-serif">
                    {shopProfile.name}
                  </h3>
                </div>

                {/* Big Display Address Highlight Callout */}
                <div className="bg-neutral-50 border border-neutral-200/80 p-[clamp(0.5rem,1.2vh,0.75rem)] rounded-xl space-y-1.5 shadow-2xs">
                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-[#C8A96A]/15 border border-[#C8A96A]/30 text-[#C8A96A] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider block">Endereço de Atendimento</span>
                      <p className="text-[clamp(0.725rem,1.4vh,0.9rem)] font-extrabold text-neutral-900 leading-snug">
                        {shopProfile.address}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Quick Info Grid (Hours & Phone) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="bg-neutral-50 border border-neutral-200/80 p-2 rounded-lg flex items-center gap-2 shadow-2xs">
                    <Clock className="w-3.5 h-3.5 text-[#C8A96A] shrink-0" />
                    <div>
                      <span className="text-[8.5px] text-neutral-500 uppercase tracking-wider block font-bold">Horário Hoje</span>
                      <span className="text-[10.5px] font-bold text-neutral-800">
                        {shopProfile.openTime || '09:00'} às {shopProfile.closeTime || '20:00'}
                      </span>
                    </div>
                  </div>

                  <div className="bg-neutral-50 border border-neutral-200/80 p-2 rounded-lg flex items-center gap-2 shadow-2xs">
                    <Phone className="w-3.5 h-3.5 text-[#C8A96A] shrink-0" />
                    <div>
                      <span className="text-[8.5px] text-neutral-500 uppercase tracking-wider block font-bold">Contato Direto</span>
                      <span className="text-[10.5px] font-bold text-neutral-800">
                        {shopProfile.phone || '(11) 99999-8888'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons Zone */}
              <div className="space-y-2 pt-2 border-t border-neutral-200/80 shrink-0">
                <button 
                  onClick={handleOpenGoogleMaps}
                  className="w-full bg-neutral-900 hover:bg-black text-white font-extrabold text-[clamp(0.68rem,1.3vh,0.85rem)] py-[clamp(0.45rem,1.1vh,0.65rem)] px-3.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 cursor-pointer tracking-wide border border-neutral-900"
                >
                  <Navigation className="w-3.5 h-3.5 fill-[#C8A96A] text-[#C8A96A]" />
                  <span>COMO CHEGAR (GOOGLE MAPS)</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={handleOpenWaze}
                    className="w-full bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-300 font-bold text-[clamp(0.625rem,1.1vh,0.75rem)] py-1.5 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-2xs active:scale-98 cursor-pointer"
                  >
                    <Compass className="w-3.5 h-3.5 text-cyan-600" />
                    <span>ABRIR NO WAZE</span>
                  </button>

                  <button 
                    onClick={handleOpenWhatsApp}
                    className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-[clamp(0.625rem,1.1vh,0.75rem)] py-1.5 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-2xs active:scale-98 cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5 fill-current" />
                    <span>WHATSAPP</span>
                  </button>
                </div>
              </div>

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
              Pronto para o seu<br />novo visual?
            </h2>

            <p className="text-[clamp(0.65rem,1.3vh,0.875rem)] text-neutral-400 font-normal leading-relaxed mb-[clamp(0.5rem,1.5vh,1.25rem)] max-w-xs sm:max-w-md md:max-w-lg">
              Garanta seu horário em segundos e viva a experiência Navo Premium.
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
                <span>Agendar Online</span>
              </button>

              <button 
                onClick={() => {
                  trackEvent('cta_click', 'landing', 'agendar_whatsapp_footer');
                  handleOpenWhatsApp();
                }}
                className="w-full sm:w-auto px-6 py-[clamp(0.5rem,1.2vh,0.875rem)] bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/40 text-[#25D366] font-bold text-[clamp(0.7rem,1.4vh,0.925rem)] rounded-xl flex items-center justify-center gap-2 hover:scale-102 active:scale-98 transition-all shrink-0 cursor-pointer"
              >
                <MessageCircle className="w-[clamp(0.875rem,1.8vh,1.125rem)] h-[clamp(0.875rem,1.8vh,1.125rem)] fill-current" />
                <span>Atendimento WhatsApp</span>
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
            className="group flex items-center gap-2 text-[clamp(0.6rem,1.1vh,0.7rem)] font-medium text-neutral-400 hover:text-neutral-900 transition-all duration-300 px-3 py-[clamp(0.2rem,0.5vh,0.4rem)] rounded-full border border-neutral-200/80 bg-neutral-50/80 hover:bg-neutral-100 active:scale-95 shadow-xs"
          >
            <ArrowUp className="w-3 h-3 text-neutral-400 group-hover:text-neutral-900 group-hover:-translate-y-0.5 transition-transform duration-300" />
            <span>Voltar ao topo</span>
          </button>
        </div>

        {/* FOOTER */}
        <footer className="w-full bg-[#0a0a0a] border-t border-white/10 px-5 py-4 shrink-0 flex flex-col sm:flex-row justify-between items-center gap-2 mt-auto">
          <p className="text-[0.7rem] text-[#a0a0a0]">
            © 2026 Navo Premium. Todos os direitos reservados.
          </p>
          <p className="text-[0.7rem] text-[#a0a0a0]">
            Desenvolvido por <span className="text-[#d4a853] font-semibold">Navo</span>
          </p>
        </footer>
      </section>

      {/* MODAL FULLSCREEN CARROSSEL DE FOTOS DOS CORTES REAIS */}
      {selectedGalleryIndex !== null && galleryFeaturedItems[selectedGalleryIndex] && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex flex-col justify-between p-4 md:p-8 animate-in fade-in duration-200 select-none overflow-hidden">
          {/* Top Bar: Selo de Destaque, Counter, Close */}
          <div className="flex items-center justify-between z-10 w-full max-w-4xl mx-auto">
            <div className="flex items-center gap-2">
              <span className="bg-gradient-to-r from-amber-400 via-[#C8A96A] to-amber-500 text-neutral-950 font-black text-xs px-3 py-1 rounded-full shadow-lg flex items-center gap-1.5 uppercase tracking-wider">
                <Star className="w-3.5 h-3.5 fill-neutral-950" />
                <span>Selo de Destaque</span>
              </span>
              <span className="text-neutral-300 text-xs font-bold font-mono px-2.5 py-1 rounded-lg bg-white/10 border border-white/10">
                {selectedGalleryIndex + 1} / {galleryFeaturedItems.length}
              </span>
            </div>

            <button
              onClick={() => {
                hapticLight();
                setSelectedGalleryIndex(null);
              }}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all active:scale-95 border border-white/10 cursor-pointer"
              title="Fechar (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Center Carousel Display */}
          <div className="relative flex-1 flex items-center justify-center my-3 max-h-[62vh] md:max-h-[72vh] w-full max-w-4xl mx-auto">
            {/* Left Navigation Arrow */}
            <button
              onClick={() => {
                hapticLight();
                setSelectedGalleryIndex(prev => (prev !== null && prev > 0 ? prev - 1 : galleryFeaturedItems.length - 1));
              }}
              className="absolute left-2 md:left-4 z-20 w-11 h-11 md:w-13 md:h-13 rounded-full bg-black/70 hover:bg-black/90 text-white border border-white/20 flex items-center justify-center backdrop-blur-md transition-all active:scale-90 shadow-2xl cursor-pointer"
              title="Anterior"
            >
              <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
            </button>

            {/* Photo Container */}
            <div className="relative w-full h-full flex items-center justify-center rounded-2xl overflow-hidden shadow-2xl border border-white/15 bg-neutral-900 group">
              <img
                src={galleryFeaturedItems[selectedGalleryIndex].src}
                alt={galleryFeaturedItems[selectedGalleryIndex].title}
                className="w-full h-full object-contain md:object-cover max-h-[58vh] md:max-h-[68vh] transition-transform duration-300"
              />
            </div>

            {/* Right Navigation Arrow */}
            <button
              onClick={() => {
                hapticLight();
                setSelectedGalleryIndex(prev => (prev !== null ? (prev + 1) % galleryFeaturedItems.length : 0));
              }}
              className="absolute right-2 md:right-4 z-20 w-11 h-11 md:w-13 md:h-13 rounded-full bg-black/70 hover:bg-black/90 text-white border border-white/20 flex items-center justify-center backdrop-blur-md transition-all active:scale-90 shadow-2xl cursor-pointer"
              title="Próxima"
            >
              <ChevronRight className="w-6 h-6 stroke-[2.5]" />
            </button>
          </div>

          {/* Bottom Info Card & Add to Booking CTA */}
          <div className="w-full max-w-2xl mx-auto bg-neutral-900/95 backdrop-blur-xl p-4 md:p-5 rounded-2xl border border-neutral-800 space-y-3 z-10 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base md:text-lg font-extrabold text-white leading-tight">
                    {galleryFeaturedItems[selectedGalleryIndex].title}
                  </h3>
                  <span className="text-[10px] font-black text-[#C8A96A] bg-[#C8A96A]/20 border border-[#C8A96A]/40 px-2 py-0.5 rounded-md">
                    {galleryFeaturedItems[selectedGalleryIndex].badge}
                  </span>
                </div>
                <p className="text-xs text-neutral-400 mt-1 line-clamp-2">
                  {galleryFeaturedItems[selectedGalleryIndex].description}
                </p>
              </div>

              <div className="text-right shrink-0">
                <span className="text-lg font-black text-[#C8A96A] block">
                  R$ {galleryFeaturedItems[selectedGalleryIndex].price.toFixed(2)}
                </span>
                <span className="text-[11px] text-neutral-400 font-medium">
                  ⏱️ {galleryFeaturedItems[selectedGalleryIndex].duration} min
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                hapticMedium();
                const selectedService = galleryFeaturedItems[selectedGalleryIndex].service;
                setSelectedGalleryIndex(null);
                onGoToBooking(selectedService);
              }}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-400 via-[#C8A96A] to-amber-500 hover:opacity-95 text-neutral-950 font-black text-xs md:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-[#C8A96A]/20 active:scale-[0.98] transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Adicionar ao Agendamento (R$ {galleryFeaturedItems[selectedGalleryIndex].price.toFixed(2)})</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
