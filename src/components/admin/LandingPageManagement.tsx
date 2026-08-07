import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Save, 
  CheckCircle2, 
  Image as ImageIcon, 
  Type, 
  Sparkles, 
  Star, 
  MapPin, 
  MessageSquare, 
  Plus, 
  Trash2, 
  RotateCcw, 
  Eye, 
  Clock, 
  Phone, 
  Info,
  Sliders,
  Scissors
} from 'lucide-react';
import { 
  fetchLandingPageConfigFromSupabase, 
  saveLandingPageConfigInSupabase, 
  LandingPageConfig, 
  DEFAULT_LANDING_PAGE_CONFIG,
  DifferentialItem,
  GalleryItem,
  TestimonialItem
} from '../../services/supabaseDataService';

type ActiveTab = 'hero' | 'differentials' | 'gallery' | 'testimonials' | 'location' | 'cta';

export const LandingPageManagement: React.FC = () => {
  const [config, setConfig] = useState<LandingPageConfig>(DEFAULT_LANDING_PAGE_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('hero');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    setLoading(true);
    try {
      const data = await fetchLandingPageConfigFromSupabase();
      setConfig(data);
    } catch (err) {
      console.error('Erro ao carregar configurações da Landing Page:', err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveLandingPageConfigInSupabase(config);
      showToast('Landing Page atualizada com sucesso! As alterações já estão ao vivo.');
    } catch (err: any) {
      console.error('Erro ao salvar landing page:', err);
      showToast('Erro ao salvar alterações na Landing Page.');
    } finally {
      setSaving(false);
    }
  };

  const handleResetToDefault = () => {
    if (window.confirm('Tem certeza que deseja restaurar o texto e fotos originais da Landing Page?')) {
      setConfig(DEFAULT_LANDING_PAGE_CONFIG);
      showToast('Restaurado para os padrões do sistema. Clique em Salvar para publicar.');
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="w-8 h-8 border-4 border-gold-base/20 border-t-gold-base rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-in fade-in duration-300 min-w-0">
      {/* HEADER & TOP ACTIONS */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface-card p-4 sm:p-5 rounded-2xl border border-border-subtle shadow-md">
        <div className="min-w-0 flex-1">
          <h1 className="text-lg sm:text-xl font-serif text-content-base font-semibold tracking-tight flex items-center gap-2.5 flex-wrap">
            <Globe className="w-5 h-5 text-gold-base" />
            <span>Gerenciar Landing Page</span>
            <span className="text-[10px] bg-gold-base/15 text-gold-hover border border-gold-base/30 px-2.5 py-0.5 rounded-full uppercase font-bold tracking-wider">
              Módulo Admin
            </span>
          </h1>
          <p className="text-content-muted text-xs mt-1 leading-relaxed">
            Personalize textos, imagens, banners, depoimentos e informações de contato do site sem alterar a estrutura original.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0">
          <button
            onClick={handleResetToDefault}
            className="px-3 py-2 bg-surface-base border border-border-subtle text-content-muted hover:text-content-base rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-surface-card transition-all active:scale-95"
            title="Restaurar valores padrão"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Restaurar Padrões</span>
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 sm:flex-none bg-gold-base text-surface-base px-5 py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 hover:bg-gold-base/80 transition-all shadow-md active:scale-95 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Salvando...' : 'Salvar Alterações'}</span>
          </button>
        </div>
      </div>

      {/* TOAST MESSAGE */}
      {toastMsg && (
        <div className="bg-status-success/10 border border-status-success/30 text-status-success p-3.5 rounded-xl flex items-center gap-2 text-xs font-bold animate-fade-in shadow-xs">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-status-success" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* NAVIGATION TABS */}
      <div className="bg-surface-card border border-border-subtle rounded-2xl p-1.5 flex items-center gap-1.5 overflow-x-auto custom-scrollbar">
        <TabButton 
          active={activeTab === 'hero'} 
          onClick={() => setActiveTab('hero')} 
          icon={Type} 
          label="Hero & Banner Principal" 
        />
        <TabButton 
          active={activeTab === 'differentials'} 
          onClick={() => setActiveTab('differentials')} 
          icon={Sparkles} 
          label="Diferenciais" 
        />
        <TabButton 
          active={activeTab === 'gallery'} 
          onClick={() => setActiveTab('gallery')} 
          icon={ImageIcon} 
          label="Galeria de Fotos" 
        />
        <TabButton 
          active={activeTab === 'testimonials'} 
          onClick={() => setActiveTab('testimonials')} 
          icon={Star} 
          label="Depoimentos" 
        />
        <TabButton 
          active={activeTab === 'location'} 
          onClick={() => setActiveTab('location')} 
          icon={MapPin} 
          label="Localização & Contato" 
        />
        <TabButton 
          active={activeTab === 'cta'} 
          onClick={() => setActiveTab('cta')} 
          icon={MessageSquare} 
          label="Chamada Final & Footer" 
        />
      </div>

      {/* TAB CONTENT PANEL */}
      <div className="bg-surface-card border border-border-subtle rounded-2xl p-4 sm:p-6 shadow-lg min-w-0">
        {activeTab === 'hero' && (
          <HeroSettings config={config} setConfig={setConfig} />
        )}
        {activeTab === 'differentials' && (
          <DifferentialsSettings config={config} setConfig={setConfig} />
        )}
        {activeTab === 'gallery' && (
          <GallerySettings config={config} setConfig={setConfig} />
        )}
        {activeTab === 'testimonials' && (
          <TestimonialsSettings config={config} setConfig={setConfig} />
        )}
        {activeTab === 'location' && (
          <LocationSettings config={config} setConfig={setConfig} />
        )}
        {activeTab === 'cta' && (
          <CtaSettings config={config} setConfig={setConfig} />
        )}

        <div className="mt-8 pt-5 border-t border-border-subtle flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full sm:w-auto bg-gold-base text-surface-base px-6 py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 hover:bg-gold-base/80 transition-all shadow-md active:scale-95 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Publicando...' : 'Salvar Alterações'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const TabButton = ({ active, onClick, icon: Icon, label }: any) => (
  <button
    onClick={onClick}
    className={`
      px-3.5 py-2.5 flex items-center justify-center gap-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap shrink-0
      ${active ? 'bg-gold-base text-surface-base shadow' : 'text-content-muted hover:text-content-base bg-surface-card/60 hover:bg-surface-card'}
    `}
  >
    <Icon className="w-4 h-4 shrink-0" />
    <span>{label}</span>
  </button>
);

// =====================================
// SUB-COMPONENTS FOR EACH SECTION
// =====================================

// 1. HERO SECTION
const HeroSettings: React.FC<{ config: LandingPageConfig; setConfig: React.Dispatch<React.SetStateAction<LandingPageConfig>> }> = ({ config, setConfig }) => {
  const updateHero = (field: string, value: string) => {
    setConfig(prev => ({
      ...prev,
      hero: {
        ...prev.hero,
        [field]: value
      }
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-bold text-content-base flex items-center gap-2">
          <Type className="w-4 h-4 text-gold-base" />
          <span>Cabeçalho & Hero Principal</span>
        </h2>
        <p className="text-xs text-content-muted mt-0.5">
          Edite a primeira impressão do site, incluindo nome da marca, slogans, imagem de fundo e destaques.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-content-base mb-1">Nome Principal da Marca</label>
          <input
            type="text"
            value={config.hero.brandPrefix}
            onChange={(e) => updateHero('brandPrefix', e.target.value)}
            className="w-full bg-surface-base border border-border-subtle rounded-xl px-3.5 py-2 text-xs font-medium text-content-base focus:border-gold-base focus:outline-none"
            placeholder="Ex: NAVO"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-content-base mb-1">Sufixo em Destaque (Dourado)</label>
          <input
            type="text"
            value={config.hero.brandSuffix}
            onChange={(e) => updateHero('brandSuffix', e.target.value)}
            className="w-full bg-surface-base border border-border-subtle rounded-xl px-3.5 py-2 text-xs font-medium text-content-base focus:border-gold-base focus:outline-none"
            placeholder="Ex: PREMIUM"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-bold text-content-base mb-1">Título - Linha 1</label>
          <input
            type="text"
            value={config.hero.titleLine1}
            onChange={(e) => updateHero('titleLine1', e.target.value)}
            className="w-full bg-surface-base border border-border-subtle rounded-xl px-3.5 py-2 text-xs font-medium text-content-base focus:border-gold-base focus:outline-none"
            placeholder="Ex: Seu melhor"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-content-base mb-1">Palavra em Destaque (Dourado)</label>
          <input
            type="text"
            value={config.hero.titleHighlight}
            onChange={(e) => updateHero('titleHighlight', e.target.value)}
            className="w-full bg-surface-base border border-border-subtle rounded-xl px-3.5 py-2 text-xs font-medium text-content-base focus:border-gold-base focus:outline-none"
            placeholder="Ex: visual"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-content-base mb-1">Título - Linha 2</label>
          <input
            type="text"
            value={config.hero.titleLine2}
            onChange={(e) => updateHero('titleLine2', e.target.value)}
            className="w-full bg-surface-base border border-border-subtle rounded-xl px-3.5 py-2 text-xs font-medium text-content-base focus:border-gold-base focus:outline-none"
            placeholder="Ex: começa aqui."
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-content-base mb-1">Subtítulo Explicativo</label>
        <textarea
          rows={3}
          value={config.hero.subtitle}
          onChange={(e) => updateHero('subtitle', e.target.value)}
          className="w-full bg-surface-base border border-border-subtle rounded-xl p-3 text-xs font-medium text-content-base focus:border-gold-base focus:outline-none"
          placeholder="Ex: Agende online, chegue na hora certa..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-content-base mb-1">Selo de Avaliação / Badge</label>
          <input
            type="text"
            value={config.hero.ratingBadgeText}
            onChange={(e) => updateHero('ratingBadgeText', e.target.value)}
            className="w-full bg-surface-base border border-border-subtle rounded-xl px-3.5 py-2 text-xs font-medium text-content-base focus:border-gold-base focus:outline-none"
            placeholder="Ex: 4.9 · 1.2k avaliações"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-content-base mb-1">Texto do Botão Principal CTA</label>
          <input
            type="text"
            value={config.hero.ctaButtonText}
            onChange={(e) => updateHero('ctaButtonText', e.target.value)}
            className="w-full bg-surface-base border border-border-subtle rounded-xl px-3.5 py-2 text-xs font-medium text-content-base focus:border-gold-base focus:outline-none"
            placeholder="Ex: Agendar meu horário"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-content-base mb-1">URL da Imagem de Fundo (Hero Background)</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={config.hero.bgImageUrl}
            onChange={(e) => updateHero('bgImageUrl', e.target.value)}
            className="flex-1 bg-surface-base border border-border-subtle rounded-xl px-3.5 py-2 text-xs font-medium text-content-base focus:border-gold-base focus:outline-none"
            placeholder="https://images.unsplash.com/..."
          />
        </div>
        {config.hero.bgImageUrl && (
          <div className="mt-2.5 h-32 w-full max-w-sm rounded-xl overflow-hidden border border-border-subtle relative group bg-neutral-900">
            <img src={config.hero.bgImageUrl} alt="Hero Preview" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-xs font-bold">
              Prévia do Fundo
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-surface-base border border-border-subtle rounded-xl space-y-3">
        <h3 className="text-xs font-bold text-content-base flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-gold-base" />
          <span>Indicadores de Rodapé do Hero</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] text-content-muted mb-1 font-semibold">Próximo Horário</label>
            <input
              type="text"
              value={config.hero.statNextSlot}
              onChange={(e) => updateHero('statNextSlot', e.target.value)}
              className="w-full bg-surface-card border border-border-subtle rounded-lg px-2.5 py-1.5 text-xs font-medium text-content-base"
            />
          </div>
          <div>
            <label className="block text-[11px] text-content-muted mb-1 font-semibold">Status Atual</label>
            <input
              type="text"
              value={config.hero.statStatus}
              onChange={(e) => updateHero('statStatus', e.target.value)}
              className="w-full bg-surface-card border border-border-subtle rounded-lg px-2.5 py-1.5 text-xs font-medium text-content-base"
            />
          </div>
          <div>
            <label className="block text-[11px] text-content-muted mb-1 font-semibold">Tempo Médio</label>
            <input
              type="text"
              value={config.hero.statAvgTime}
              onChange={(e) => updateHero('statAvgTime', e.target.value)}
              className="w-full bg-surface-card border border-border-subtle rounded-lg px-2.5 py-1.5 text-xs font-medium text-content-base"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// 2. DIFFERENTIALS SECTION
const DifferentialsSettings: React.FC<{ config: LandingPageConfig; setConfig: React.Dispatch<React.SetStateAction<LandingPageConfig>> }> = ({ config, setConfig }) => {
  const updateSection = (field: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      differentialsSection: {
        ...prev.differentialsSection,
        [field]: value
      }
    }));
  };

  const handleUpdateItem = (index: number, field: keyof DifferentialItem, value: string) => {
    const updated = [...config.differentialsSection.items];
    updated[index] = { ...updated[index], [field]: value };
    updateSection('items', updated);
  };

  const handleAddItem = () => {
    const newItem: DifferentialItem = {
      id: `diff_${Date.now()}`,
      iconName: 'Sparkles',
      label: 'Novo Diferencial',
      strokeColor: '#b89060',
      bgColor: '#f5eedc'
    };
    updateSection('items', [...config.differentialsSection.items, newItem]);
  };

  const handleRemoveItem = (index: number) => {
    const updated = config.differentialsSection.items.filter((_, i) => i !== index);
    updateSection('items', updated);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-bold text-content-base flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-gold-base" />
          <span>Seção: Por que a Navo (Diferenciais)</span>
        </h2>
        <p className="text-xs text-content-muted mt-0.5">
          Configure os pilares e diferenciais competitivos exibidos para o cliente.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-bold text-content-base mb-1">Tag Superior (Eyebrow)</label>
          <input
            type="text"
            value={config.differentialsSection.eyebrow}
            onChange={(e) => updateSection('eyebrow', e.target.value)}
            className="w-full bg-surface-base border border-border-subtle rounded-xl px-3.5 py-2 text-xs font-medium text-content-base focus:border-gold-base focus:outline-none"
            placeholder="Ex: POR QUE A NAVO"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-content-base mb-1">Título Principal</label>
          <input
            type="text"
            value={config.differentialsSection.title}
            onChange={(e) => updateSection('title', e.target.value)}
            className="w-full bg-surface-base border border-border-subtle rounded-xl px-3.5 py-2 text-xs font-medium text-content-base focus:border-gold-base focus:outline-none"
            placeholder="Ex: Feito para você"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-content-base mb-1">Palavra Destaque (Dourado)</label>
          <input
            type="text"
            value={config.differentialsSection.titleHighlight}
            onChange={(e) => updateSection('titleHighlight', e.target.value)}
            className="w-full bg-surface-base border border-border-subtle rounded-xl px-3.5 py-2 text-xs font-medium text-content-base focus:border-gold-base focus:outline-none"
            placeholder="Ex: relaxar"
          />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <label className="block text-xs font-bold text-content-base">Lista de Diferenciais ({config.differentialsSection.items.length})</label>
          <button
            onClick={handleAddItem}
            className="bg-gold-base/15 text-gold-hover border border-gold-base/30 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 hover:bg-gold-base/25 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Adicionar Card</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {config.differentialsSection.items.map((item, idx) => (
            <div key={item.id || idx} className="p-3.5 bg-surface-base border border-border-subtle rounded-xl flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-xs font-bold"
                style={{ backgroundColor: item.bgColor, color: item.strokeColor }}
              >
                ★
              </div>

              <div className="flex-1 min-w-0 space-y-2">
                <input
                  type="text"
                  value={item.label}
                  onChange={(e) => handleUpdateItem(idx, 'label', e.target.value)}
                  className="w-full bg-surface-card border border-border-subtle rounded-lg px-2.5 py-1 text-xs font-bold text-content-base"
                  placeholder="Descrição do diferencial"
                />
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-content-muted">Cor Ícone:</span>
                  <input
                    type="color"
                    value={item.strokeColor}
                    onChange={(e) => handleUpdateItem(idx, 'strokeColor', e.target.value)}
                    className="w-6 h-6 rounded cursor-pointer border border-border-subtle bg-transparent"
                  />
                  <span className="text-[10px] text-content-muted ml-2">Fundo:</span>
                  <input
                    type="color"
                    value={item.bgColor}
                    onChange={(e) => handleUpdateItem(idx, 'bgColor', e.target.value)}
                    className="w-6 h-6 rounded cursor-pointer border border-border-subtle bg-transparent"
                  />
                </div>
              </div>

              <button
                onClick={() => handleRemoveItem(idx)}
                className="p-1.5 text-content-muted hover:text-status-danger rounded-lg transition-colors"
                title="Excluir"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// 3. GALLERY SECTION
const GallerySettings: React.FC<{ config: LandingPageConfig; setConfig: React.Dispatch<React.SetStateAction<LandingPageConfig>> }> = ({ config, setConfig }) => {
  const updateGallery = (field: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      gallerySection: {
        ...prev.gallerySection,
        [field]: value
      }
    }));
  };

  const handleUpdateImage = (index: number, field: keyof GalleryItem, value: string) => {
    const updated = [...config.gallerySection.images];
    updated[index] = { ...updated[index], [field]: value };
    updateGallery('images', updated);
  };

  const handleAddImage = () => {
    const newImg: GalleryItem = {
      id: `gal_${Date.now()}`,
      src: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=600&auto=format&fit=crop',
      title: 'Novo Corte'
    };
    updateGallery('images', [...config.gallerySection.images, newImg]);
  };

  const handleRemoveImage = (index: number) => {
    const updated = config.gallerySection.images.filter((_, i) => i !== index);
    updateGallery('images', updated);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-bold text-content-base flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-gold-base" />
          <span>Seção: Galeria de Fotos</span>
        </h2>
        <p className="text-xs text-content-muted mt-0.5">
          Adicione ou modifique os trabalhos reais exibidos na galeria em estilo Bento Grid.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-content-base mb-1">Tag Superior (Eyebrow)</label>
          <input
            type="text"
            value={config.gallerySection.eyebrow}
            onChange={(e) => updateGallery('eyebrow', e.target.value)}
            className="w-full bg-surface-base border border-border-subtle rounded-xl px-3.5 py-2 text-xs font-medium text-content-base focus:border-gold-base focus:outline-none"
            placeholder="Ex: GALERIA"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-content-base mb-1">Título da Galeria</label>
          <input
            type="text"
            value={config.gallerySection.title}
            onChange={(e) => updateGallery('title', e.target.value)}
            className="w-full bg-surface-base border border-border-subtle rounded-xl px-3.5 py-2 text-xs font-medium text-content-base focus:border-gold-base focus:outline-none"
            placeholder="Ex: Cortes reais"
          />
        </div>
      </div>

      <div className="p-4 bg-surface-base border border-border-subtle rounded-xl space-y-3">
        <h3 className="text-xs font-bold text-content-base">Card Promocional Integrado na Galeria</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] text-content-muted mb-1 font-semibold">Título do Card Promocional</label>
            <input
              type="text"
              value={config.gallerySection.promoTitle}
              onChange={(e) => updateGallery('promoTitle', e.target.value)}
              className="w-full bg-surface-card border border-border-subtle rounded-lg px-2.5 py-1.5 text-xs font-medium text-content-base"
            />
          </div>
          <div>
            <label className="block text-[11px] text-content-muted mb-1 font-semibold">Subtítulo do Card Promocional</label>
            <input
              type="text"
              value={config.gallerySection.promoSubtitle}
              onChange={(e) => updateGallery('promoSubtitle', e.target.value)}
              className="w-full bg-surface-card border border-border-subtle rounded-lg px-2.5 py-1.5 text-xs font-medium text-content-base"
            />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <label className="block text-xs font-bold text-content-base">Imagens da Galeria ({config.gallerySection.images.length})</label>
          <button
            onClick={handleAddImage}
            className="bg-gold-base/15 text-gold-hover border border-gold-base/30 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 hover:bg-gold-base/25 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Adicionar Foto</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {config.gallerySection.images.map((item, idx) => (
            <div key={item.id || idx} className="p-3 bg-surface-base border border-border-subtle rounded-xl space-y-2.5">
              <div className="h-28 rounded-lg overflow-hidden border border-border-subtle bg-neutral-900 relative">
                <img src={item.src} alt={item.title} className="w-full h-full object-cover" />
                <button
                  onClick={() => handleRemoveImage(idx)}
                  className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-red-600 text-white rounded-lg transition-colors"
                  title="Excluir"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div>
                <label className="block text-[10px] text-content-muted mb-1 font-bold">Legenda / Título</label>
                <input
                  type="text"
                  value={item.title}
                  onChange={(e) => handleUpdateImage(idx, 'title', e.target.value)}
                  className="w-full bg-surface-card border border-border-subtle rounded-lg px-2.5 py-1 text-xs font-bold text-content-base"
                  placeholder="Ex: Fade Moderno"
                />
              </div>

              <div>
                <label className="block text-[10px] text-content-muted mb-1 font-bold">URL da Imagem</label>
                <input
                  type="text"
                  value={item.src}
                  onChange={(e) => handleUpdateImage(idx, 'src', e.target.value)}
                  className="w-full bg-surface-card border border-border-subtle rounded-lg px-2.5 py-1 text-[11px] font-mono text-content-muted"
                  placeholder="https://..."
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// 4. TESTIMONIALS SECTION
const TestimonialsSettings: React.FC<{ config: LandingPageConfig; setConfig: React.Dispatch<React.SetStateAction<LandingPageConfig>> }> = ({ config, setConfig }) => {
  const updateTestimonials = (field: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      testimonialsSection: {
        ...prev.testimonialsSection,
        [field]: value
      }
    }));
  };

  const handleUpdateItem = (index: number, field: keyof TestimonialItem, value: any) => {
    const updated = [...config.testimonialsSection.items];
    updated[index] = { ...updated[index], [field]: value };
    updateTestimonials('items', updated);
  };

  const handleAddItem = () => {
    const newItem: TestimonialItem = {
      id: `test_${Date.now()}`,
      name: 'Novo Cliente',
      rating: 5,
      date: 'Hoje',
      text: 'Excelente atendimento e qualidade insuperável.',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'
    };
    updateTestimonials('items', [...config.testimonialsSection.items, newItem]);
  };

  const handleRemoveItem = (index: number) => {
    const updated = config.testimonialsSection.items.filter((_, i) => i !== index);
    updateTestimonials('items', updated);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-bold text-content-base flex items-center gap-2">
          <Star className="w-4 h-4 text-gold-base" />
          <span>Seção: Depoimentos de Clientes</span>
        </h2>
        <p className="text-xs text-content-muted mt-0.5">
          Adicione opiniões de clientes satisfeitos para reforçar a prova social do seu negócio.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-content-base mb-1">Tag Superior (Eyebrow)</label>
          <input
            type="text"
            value={config.testimonialsSection.eyebrow}
            onChange={(e) => updateTestimonials('eyebrow', e.target.value)}
            className="w-full bg-surface-base border border-border-subtle rounded-xl px-3.5 py-2 text-xs font-medium text-content-base focus:border-gold-base focus:outline-none"
            placeholder="Ex: DEPOIMENTOS"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-content-base mb-1">Título da Seção</label>
          <input
            type="text"
            value={config.testimonialsSection.title}
            onChange={(e) => updateTestimonials('title', e.target.value)}
            className="w-full bg-surface-base border border-border-subtle rounded-xl px-3.5 py-2 text-xs font-medium text-content-base focus:border-gold-base focus:outline-none"
            placeholder="Ex: Quem já passou por aqui"
          />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <label className="block text-xs font-bold text-content-base">Depoimentos Cadastrados ({config.testimonialsSection.items.length})</label>
          <button
            onClick={handleAddItem}
            className="bg-gold-base/15 text-gold-hover border border-gold-base/30 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 hover:bg-gold-base/25 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Adicionar Depoimento</span>
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {config.testimonialsSection.items.map((item, idx) => (
            <div key={item.id || idx} className="p-4 bg-surface-base border border-border-subtle rounded-xl space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img src={item.avatar} alt={item.name} className="w-10 h-10 rounded-full object-cover border border-border-subtle" />
                  <div>
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => handleUpdateItem(idx, 'name', e.target.value)}
                      className="bg-surface-card border border-border-subtle rounded px-2 py-0.5 text-xs font-bold text-content-base"
                      placeholder="Nome do Cliente"
                    />
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="text"
                        value={item.date}
                        onChange={(e) => handleUpdateItem(idx, 'date', e.target.value)}
                        className="bg-surface-card border border-border-subtle rounded px-2 py-0.5 text-[10px] text-content-muted"
                        placeholder="Data"
                      />
                      <select
                        value={item.rating}
                        onChange={(e) => handleUpdateItem(idx, 'rating', Number(e.target.value))}
                        className="bg-surface-card border border-border-subtle rounded px-2 py-0.5 text-[10px] font-bold text-amber-400"
                      >
                        <option value={5}>5 Estrelas ★★★★★</option>
                        <option value={4}>4 Estrelas ★★★★☆</option>
                        <option value={3}>3 Estrelas ★★★☆☆</option>
                      </select>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleRemoveItem(idx)}
                  className="p-1.5 text-content-muted hover:text-status-danger rounded-lg transition-colors"
                  title="Excluir"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div>
                <label className="block text-[10px] text-content-muted mb-1 font-bold">Texto do Depoimento</label>
                <textarea
                  rows={2}
                  value={item.text}
                  onChange={(e) => handleUpdateItem(idx, 'text', e.target.value)}
                  className="w-full bg-surface-card border border-border-subtle rounded-lg p-2 text-xs font-medium text-content-base"
                  placeholder="Relato do cliente..."
                />
              </div>

              <div>
                <label className="block text-[10px] text-content-muted mb-1 font-bold">URL da Foto do Avatar</label>
                <input
                  type="text"
                  value={item.avatar}
                  onChange={(e) => handleUpdateItem(idx, 'avatar', e.target.value)}
                  className="w-full bg-surface-card border border-border-subtle rounded-lg px-2.5 py-1 text-[11px] font-mono text-content-muted"
                  placeholder="https://..."
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// 5. LOCATION SECTION
const LocationSettings: React.FC<{ config: LandingPageConfig; setConfig: React.Dispatch<React.SetStateAction<LandingPageConfig>> }> = ({ config, setConfig }) => {
  const updateLocation = (field: string, value: string) => {
    setConfig(prev => ({
      ...prev,
      locationSection: {
        ...prev.locationSection,
        [field]: value
      }
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-bold text-content-base flex items-center gap-2">
          <MapPin className="w-4 h-4 text-gold-base" />
          <span>Seção: Localização & Contato</span>
        </h2>
        <p className="text-xs text-content-muted mt-0.5">
          Atualize o endereço físico, horário de funcionamento e WhatsApp para contato direto.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-content-base mb-1">Tag Superior (Eyebrow)</label>
          <input
            type="text"
            value={config.locationSection.eyebrow}
            onChange={(e) => updateLocation('eyebrow', e.target.value)}
            className="w-full bg-surface-base border border-border-subtle rounded-xl px-3.5 py-2 text-xs font-medium text-content-base focus:border-gold-base focus:outline-none"
            placeholder="Ex: LOCALIZAÇÃO"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-content-base mb-1">Título da Seção</label>
          <input
            type="text"
            value={config.locationSection.title}
            onChange={(e) => updateLocation('title', e.target.value)}
            className="w-full bg-surface-base border border-border-subtle rounded-xl px-3.5 py-2 text-xs font-medium text-content-base focus:border-gold-base focus:outline-none"
            placeholder="Ex: Onde estamos"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-content-base mb-1">Endereço Completo</label>
        <input
          type="text"
          value={config.locationSection.address}
          onChange={(e) => updateLocation('address', e.target.value)}
          className="w-full bg-surface-base border border-border-subtle rounded-xl px-3.5 py-2 text-xs font-medium text-content-base focus:border-gold-base focus:outline-none"
          placeholder="Ex: Rua Augusta, 1420 · Jardins, São Paulo"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-bold text-content-base mb-1">Horário (Segunda a Sexta)</label>
          <input
            type="text"
            value={config.locationSection.hoursWeekday}
            onChange={(e) => updateLocation('hoursWeekday', e.target.value)}
            className="w-full bg-surface-base border border-border-subtle rounded-xl px-3.5 py-2 text-xs font-medium text-content-base focus:border-gold-base focus:outline-none"
            placeholder="Ex: 09:00 - 22:00"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-content-base mb-1">Horário (Sábado)</label>
          <input
            type="text"
            value={config.locationSection.hoursSaturday}
            onChange={(e) => updateLocation('hoursSaturday', e.target.value)}
            className="w-full bg-surface-base border border-border-subtle rounded-xl px-3.5 py-2 text-xs font-medium text-content-base focus:border-gold-base focus:outline-none"
            placeholder="Ex: 09:00 - 20:00"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-content-base mb-1">Horário (Domingo)</label>
          <input
            type="text"
            value={config.locationSection.hoursSunday}
            onChange={(e) => updateLocation('hoursSunday', e.target.value)}
            className="w-full bg-surface-base border border-border-subtle rounded-xl px-3.5 py-2 text-xs font-medium text-content-base focus:border-gold-base focus:outline-none"
            placeholder="Ex: Fechado"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-content-base mb-1">Número do WhatsApp (Com DDD e País)</label>
          <input
            type="text"
            value={config.locationSection.whatsappNumber}
            onChange={(e) => updateLocation('whatsappNumber', e.target.value)}
            className="w-full bg-surface-base border border-border-subtle rounded-xl px-3.5 py-2 text-xs font-medium text-content-base focus:border-gold-base focus:outline-none"
            placeholder="Ex: 5511999998888"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-content-base mb-1">Mensagem Padrão do WhatsApp</label>
          <input
            type="text"
            value={config.locationSection.whatsappMessage}
            onChange={(e) => updateLocation('whatsappMessage', e.target.value)}
            className="w-full bg-surface-base border border-border-subtle rounded-xl px-3.5 py-2 text-xs font-medium text-content-base focus:border-gold-base focus:outline-none"
            placeholder="Ex: Olá! Gostaria de agendar um horário..."
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-content-base mb-1">Busca no Google Maps (Query do Mapa)</label>
        <input
          type="text"
          value={config.locationSection.mapsQuery}
          onChange={(e) => updateLocation('mapsQuery', e.target.value)}
          className="w-full bg-surface-base border border-border-subtle rounded-xl px-3.5 py-2 text-xs font-medium text-content-base focus:border-gold-base focus:outline-none"
          placeholder="Ex: Rua Augusta 1420 Jardins Sao Paulo"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-content-base mb-1">URL da Imagem do Mapa / Local</label>
        <input
          type="text"
          value={config.locationSection.mapImageUrl}
          onChange={(e) => updateLocation('mapImageUrl', e.target.value)}
          className="w-full bg-surface-base border border-border-subtle rounded-xl px-3.5 py-2 text-xs font-medium text-content-base focus:border-gold-base focus:outline-none"
          placeholder="https://..."
        />
      </div>
    </div>
  );
};

// 6. CTA & FOOTER SECTION
const CtaSettings: React.FC<{ config: LandingPageConfig; setConfig: React.Dispatch<React.SetStateAction<LandingPageConfig>> }> = ({ config, setConfig }) => {
  const updateCta = (field: string, value: string) => {
    setConfig(prev => ({
      ...prev,
      ctaSection: {
        ...prev.ctaSection,
        [field]: value
      }
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-bold text-content-base flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-gold-base" />
          <span>Chamada Final & Rodapé</span>
        </h2>
        <p className="text-xs text-content-muted mt-0.5">
          Configure o bloco de encerramento do site, botões finais e direitos autorais do rodapé.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-content-base mb-1">Título Final - Linha 1</label>
          <input
            type="text"
            value={config.ctaSection.titleLine1}
            onChange={(e) => updateCta('titleLine1', e.target.value)}
            className="w-full bg-surface-base border border-border-subtle rounded-xl px-3.5 py-2 text-xs font-medium text-content-base focus:border-gold-base focus:outline-none"
            placeholder="Ex: Pronto para o seu"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-content-base mb-1">Título Final - Linha 2</label>
          <input
            type="text"
            value={config.ctaSection.titleLine2}
            onChange={(e) => updateCta('titleLine2', e.target.value)}
            className="w-full bg-surface-base border border-border-subtle rounded-xl px-3.5 py-2 text-xs font-medium text-content-base focus:border-gold-base focus:outline-none"
            placeholder="Ex: novo visual?"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-content-base mb-1">Subtítulo do Card Final</label>
        <textarea
          rows={2}
          value={config.ctaSection.subtitle}
          onChange={(e) => updateCta('subtitle', e.target.value)}
          className="w-full bg-surface-base border border-border-subtle rounded-xl p-3 text-xs font-medium text-content-base focus:border-gold-base focus:outline-none"
          placeholder="Ex: Garanta seu horário em segundos e viva a experiência..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-content-base mb-1">Botão Agendar Online</label>
          <input
            type="text"
            value={config.ctaSection.buttonOnlineText}
            onChange={(e) => updateCta('buttonOnlineText', e.target.value)}
            className="w-full bg-surface-base border border-border-subtle rounded-xl px-3.5 py-2 text-xs font-medium text-content-base focus:border-gold-base focus:outline-none"
            placeholder="Ex: Agendar Online"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-content-base mb-1">Botão WhatsApp</label>
          <input
            type="text"
            value={config.ctaSection.buttonWhatsappText}
            onChange={(e) => updateCta('buttonWhatsappText', e.target.value)}
            className="w-full bg-surface-base border border-border-subtle rounded-xl px-3.5 py-2 text-xs font-medium text-content-base focus:border-gold-base focus:outline-none"
            placeholder="Ex: Atendimento WhatsApp"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-content-base mb-1">Texto de Copyright do Rodapé</label>
        <input
          type="text"
          value={config.ctaSection.copyrightText}
          onChange={(e) => updateCta('copyrightText', e.target.value)}
          className="w-full bg-surface-base border border-border-subtle rounded-xl px-3.5 py-2 text-xs font-medium text-content-base focus:border-gold-base focus:outline-none"
          placeholder="Ex: © 2026 Navo Premium. Todos os direitos reservados."
        />
      </div>
    </div>
  );
};
