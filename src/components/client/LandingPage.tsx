import React, { useState } from 'react';
import { Clock, MapPin, Star, ChevronDown, CheckCircle2, Phone } from 'lucide-react';
import { hapticMedium } from '../../lib/haptics';

interface LandingPageProps {
  onGoToBooking: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGoToBooking }) => {
  return (
    <div className="w-full flex-1 flex flex-col bg-surface-base">
      <HeroSection onGoToBooking={onGoToBooking} />
      <ServicesSection onGoToBooking={onGoToBooking} />
      <TeamSection />
      <TestimonialsSection />
      <FinalCTASection onGoToBooking={onGoToBooking} />
      <Footer onGoToBooking={onGoToBooking} />
    </div>
  );
};

const HeroSection: React.FC<{ onGoToBooking: () => void }> = ({ onGoToBooking }) => {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=75&w=1200&auto=format&fit=crop" 
          alt="Barbearia BarberX" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/70"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto pt-20">
        {/* Badge */}
        <div className="inline-block bg-gold-base/20 border border-gold-base/50 rounded-full px-4 py-2 mb-6 animate-fade-in">
          <span className="text-gold-base text-sm font-bold flex items-center gap-2">
            <Star className="w-4 h-4 fill-current" /> 4.9/5 • +2.500 Clientes Atendidos
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl md:text-6xl font-black text-white mb-4 leading-tight tracking-tight">
          Corte Perfeito em
          <span className="text-gold-base block mt-2">35 Minutos</span>
        </h1>

        {/* Subheadline */}
        <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto font-medium">
          Agende online, chegue na hora certa e saia renovado. 
          Sem filas, sem espera, sem complicação.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            onClick={() => { hapticMedium(); onGoToBooking(); }}
            className="bg-gold-base text-black font-bold py-4 px-8 rounded-full hover:bg-gold-hover transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(212,175,55,0.3)]"
          >
            Agendar Meu Horário →
          </button>
          <button 
            onClick={() => {
              hapticMedium();
              document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="bg-white/10 text-white font-bold py-4 px-8 rounded-full border border-white/30 hover:bg-white/20 transition-all backdrop-blur-sm"
          >
            Ver Serviços
          </button>
        </div>

        {/* Trust Indicators */}
        <div className="mt-12 flex flex-wrap justify-center gap-6 md:gap-10 text-sm text-gray-300 font-medium">
          <div className="flex items-center gap-2 bg-black/40 px-4 py-2 rounded-full backdrop-blur-sm">
            <Clock className="w-4 h-4 text-gold-base" />
            <span>Aberto até 22h</span>
          </div>
          <div className="flex items-center gap-2 bg-black/40 px-4 py-2 rounded-full backdrop-blur-sm">
            <MapPin className="w-4 h-4 text-gold-base" />
            <span>Centro da Cidade</span>
          </div>
          <div className="flex items-center gap-2 bg-black/40 px-4 py-2 rounded-full backdrop-blur-sm">
            <Star className="w-4 h-4 text-gold-base fill-current" />
            <span>5 Estrelas no Google</span>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <ChevronDown className="w-6 h-6 text-white/50" />
      </div>
    </section>
  );
};

const ServicesSection: React.FC<{ onGoToBooking: () => void }> = ({ onGoToBooking }) => {
  const services = [
    { name: 'Corte Moderno', price: 60, duration: '35min', popular: true, description: 'Degradê perfeito, fade alinhado ou corte na tesoura clássico.' },
    { name: 'Barba Completa', price: 45, duration: '25min', popular: false, description: 'Modelagem completa com toalha quente e finalização premium.' },
    { name: 'Corte + Barba', price: 90, duration: '50min', popular: true, description: 'O combo completo. Saia com o visual 100% renovado e economize.' },
    { name: 'Pigmentação', price: 80, duration: '40min', popular: false, description: 'Disfarce de fios brancos e realce do contorno do corte ou barba.' },
  ];

  return (
    <section id="services" className="py-16 md:py-24 bg-surface-base">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-black text-content-base mb-4 tracking-tight">
            Nossos Serviços
          </h2>
          <p className="text-content-muted md:text-lg max-w-xl mx-auto">
            Escolha seu serviço e agende em segundos. Preços justos e qualidade premium.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map(service => (
            <div 
              key={service.name}
              className="bg-surface-card p-6 rounded-3xl border border-border-subtle hover:border-gold-base/50 transition-all hover:-translate-y-1 hover:shadow-[0_10px_30px_-15px_rgba(212,175,55,0.2)] flex flex-col"
            >
              <div className="mb-4 h-6">
                {service.popular && (
                  <span className="inline-block bg-gold-base text-black text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    Mais Popular
                  </span>
                )}
              </div>
              
              <h3 className="text-xl font-bold text-content-base mb-2">
                {service.name}
              </h3>
              
              <p className="text-sm text-content-muted mb-6 flex-1">
                {service.description}
              </p>
              
              <div className="flex items-end justify-between mb-6">
                <div>
                  <span className="text-xs text-content-muted block mb-1">A partir de</span>
                  <span className="text-2xl font-black text-gold-base leading-none">
                    R$ {service.price}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-content-muted bg-surface-base px-2 py-1 rounded-lg">
                  <Clock className="w-3.5 h-3.5" />
                  {service.duration}
                </div>
              </div>

              <button 
                onClick={() => { hapticMedium(); onGoToBooking(); }}
                className="w-full bg-surface-base text-gold-hover font-bold py-3.5 rounded-xl border border-border-subtle hover:bg-gold-base hover:text-black hover:border-gold-base transition-colors"
              >
                Agendar Agora
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const TeamSection: React.FC = () => {
  const barbers = [
    { name: 'Carlos Silva', specialty: 'Cortes Clássicos & Fade', rating: 4.9, img: 'https://images.unsplash.com/photo-1618306398902-601e3b6e838b?q=80&w=200&auto=format&fit=crop' },
    { name: 'Rafael Costa', specialty: 'Degradês & Pigmentação', rating: 5.0, img: 'https://images.unsplash.com/photo-1595152772835-219674b2a8a6?q=80&w=200&auto=format&fit=crop' },
    { name: 'Matheus Santos', specialty: 'Barbas & Terapia Capilar', rating: 4.8, img: 'https://images.unsplash.com/photo-1593728612741-2461ccce8fdb?q=80&w=200&auto=format&fit=crop' },
  ];

  return (
    <section id="team" className="py-16 md:py-24 bg-surface-card border-y border-border-subtle">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-black text-content-base mb-4 tracking-tight">
            Nossa Equipe
          </h2>
          <p className="text-content-muted md:text-lg max-w-xl mx-auto">
            Barbeiros especialistas apaixonados pelo que fazem, prontos para entregar o seu melhor visual.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {barbers.map(barber => (
            <div key={barber.name} className="text-center group">
              <div className="w-32 h-32 md:w-40 md:h-40 mx-auto mb-6 rounded-full overflow-hidden border-4 border-surface-base group-hover:border-gold-base transition-colors duration-300">
                <img 
                  src={barber.img}
                  alt={barber.name}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <h3 className="text-xl font-bold text-content-base mb-1">
                {barber.name}
              </h3>
              <p className="text-sm text-content-muted mb-3 font-medium">{barber.specialty}</p>
              <div className="flex items-center justify-center gap-1.5 bg-surface-base inline-flex px-3 py-1.5 rounded-full">
                <Star className="w-4 h-4 text-gold-base fill-current" />
                <span className="text-sm font-bold text-content-base">{barber.rating}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const TestimonialsSection: React.FC = () => {
  const testimonials = [
    {
      name: 'João Pedro',
      rating: 5,
      text: 'Melhor barbearia da cidade! Atendimento impecável e corte perfeito. O ambiente é super agradável.',
      service: 'Corte + Barba'
    },
    {
      name: 'Marcos Oliveira',
      rating: 5,
      text: 'Agendei pelo site, cheguei na hora e fui atendido sem espera nenhuma. Muito prático e o resultado ficou top!',
      service: 'Corte Moderno'
    },
    {
      name: 'Lucas Ferreira',
      rating: 5,
      text: 'O Rafael é fera no degradê. Recomendo muito! Melhor fade que já fiz, além do papo ser super de boa.',
      service: 'Degradê'
    }
  ];

  return (
    <section className="py-16 md:py-24 bg-surface-base">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-black text-content-base mb-4 tracking-tight">
            O Que Nossos Clientes Dizem
          </h2>
          <div className="flex items-center justify-center gap-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 text-gold-base fill-current" />
              ))}
            </div>
            <span className="text-content-muted font-medium">4.9/5 no Google</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((test, idx) => (
            <div key={idx} className="bg-surface-card p-8 rounded-3xl border border-border-subtle hover:border-gold-base/30 transition-colors">
              <div className="flex gap-1 mb-6">
                {[...Array(test.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-gold-base fill-current" />
                ))}
              </div>
              <p className="text-content-base md:text-lg mb-8 leading-relaxed font-medium">"{test.text}"</p>
              <div className="flex items-center justify-between mt-auto">
                <div>
                  <span className="font-bold text-content-base block">{test.name}</span>
                  <span className="text-xs text-content-muted flex items-center gap-1 mt-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-status-success" />
                    Cliente Verificado
                  </span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gold-base bg-gold-base/10 px-2 py-1 rounded-md">{test.service}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const FinalCTASection: React.FC<{ onGoToBooking: () => void }> = ({ onGoToBooking }) => {
  return (
    <section className="py-16 md:py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-gold-base/10 via-surface-card to-surface-base z-0"></div>
      
      <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
        <h2 className="text-3xl md:text-5xl font-black text-content-base mb-6 tracking-tight">
          Pronto Para um Corte Perfeito?
        </h2>
        <p className="text-content-muted text-lg md:text-xl mb-10 max-w-2xl mx-auto font-medium">
          Agende agora e garanta seu horário. Nosso sistema é simples, rápido e leva menos de 30 segundos!
        </p>
        
        <button 
          onClick={() => { hapticMedium(); onGoToBooking(); }}
          className="bg-gold-base text-black font-bold py-4 px-12 md:px-16 rounded-full text-lg hover:bg-gold-hover transition-all transform hover:scale-105 shadow-[0_0_30px_rgba(212,175,55,0.4)]"
        >
          Agendar Meu Horário Agora →
        </button>

        <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm text-content-muted font-medium">
          <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-status-success" /> Agendamento rápido</span>
          <span className="hidden sm:inline">•</span>
          <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-status-success" /> Confirmação instantânea</span>
        </div>
      </div>
    </section>
  );
};

const Footer: React.FC<{ onGoToBooking: () => void }> = ({ onGoToBooking }) => {
  return (
    <footer className="bg-surface-card border-t border-border-subtle pt-16 pb-8">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
          {/* Logo + Descrição */}
          <div className="md:col-span-1">
            <h3 className="text-2xl font-black text-gold-base mb-4 tracking-wider">BarberX</h3>
            <p className="text-sm text-content-muted leading-relaxed mb-6">
              A melhor barbearia da cidade. Cortes modernos, ambiente climatizado e atendimento premium para você.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-bold text-content-base mb-6 text-sm uppercase tracking-wider">Links Rápidos</h4>
            <ul className="space-y-4 text-sm font-medium">
              <li>
                <button onClick={() => { hapticMedium(); document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' }); }} className="text-content-muted hover:text-gold-base transition-colors">
                  Nossos Serviços
                </button>
              </li>
              <li>
                <button onClick={() => { hapticMedium(); document.getElementById('team')?.scrollIntoView({ behavior: 'smooth' }); }} className="text-content-muted hover:text-gold-base transition-colors">
                  Nossa Equipe
                </button>
              </li>
              <li>
                <button onClick={() => { hapticMedium(); onGoToBooking(); }} className="text-content-muted hover:text-gold-base transition-colors">
                  Fazer Agendamento
                </button>
              </li>
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h4 className="font-bold text-content-base mb-6 text-sm uppercase tracking-wider">Contato</h4>
            <ul className="space-y-4 text-sm text-content-muted font-medium">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gold-base shrink-0" />
                <span>Rua da Barbearia, 123<br/>Centro, Cidade - UF</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gold-base shrink-0" />
                <span>(11) 99999-9999</span>
              </li>
            </ul>
          </div>

          {/* Horário */}
          <div>
            <h4 className="font-bold text-content-base mb-6 text-sm uppercase tracking-wider">Horário</h4>
            <ul className="space-y-4 text-sm font-medium">
              <li className="flex justify-between items-center text-content-muted">
                <span>Seg - Sex</span>
                <span className="text-content-base">09:00 - 22:00</span>
              </li>
              <li className="flex justify-between items-center text-content-muted">
                <span>Sábado</span>
                <span className="text-content-base">09:00 - 20:00</span>
              </li>
              <li className="flex justify-between items-center text-content-muted">
                <span>Domingo</span>
                <span className="text-status-error font-bold">Fechado</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-border-subtle flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-content-muted font-medium">
            © {new Date().getFullYear()} BarberX Premium. Todos os direitos reservados.
          </div>
          <div className="text-sm text-content-muted">
            Desenvolvido por <span className="font-bold text-gold-base">Navo</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
