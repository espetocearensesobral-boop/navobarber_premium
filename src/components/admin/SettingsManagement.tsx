import React, { useState } from 'react';
import { Store, Phone, Link as LinkIcon, Save, Camera, CheckCircle2, Globe, Clock, MapPin } from 'lucide-react';

type SettingsTab = 'profile' | 'contacts' | 'links';

export const SettingsManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      showToast('Configurações salvas com sucesso!');
    }, 600);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileSettings />;
      case 'contacts':
        return <ContactSettings />;
      case 'links':
        return <LinkSettings />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300 min-w-0">
      {/* HEADER & SAVE BUTTON */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-surface-card p-3.5 sm:p-5 rounded-2xl border border-border-subtle">
        <div className="min-w-0 flex-1">
          <h1 className="text-lg sm:text-xl font-serif text-content-base font-semibold tracking-tight flex items-center gap-2 flex-wrap">
            <span>Configurações do Sistema</span>
            <span className="text-[10px] bg-gold-base/15 text-gold-hover border border-[#FFFFFF]/30 px-2 py-0.5 rounded-full uppercase font-bold">
              Geral
            </span>
          </h1>
          <p className="text-content-muted text-xs mt-1 leading-relaxed">
            Gerencie a identidade da barbearia, canais de contato e links sociais.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full sm:w-auto bg-gold-base text-surface-base px-4 py-2.5 sm:py-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 hover:bg-gold-base/80 transition-all shadow-md active:scale-95 disabled:opacity-50 shrink-0"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Salvando...' : 'Salvar Alterações'}</span>
        </button>
      </div>

      {/* TOAST MESSAGE */}
      {toastMsg && (
        <div className="bg-status-success/10 border border-status-success/30 text-status-success p-3 rounded-xl flex items-center gap-2 text-xs font-bold animate-fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* MOBILE TABS (SCROLLABLE BAR) */}
      <div className="bg-surface-card border border-border-subtle rounded-2xl p-1.5 flex items-center gap-1.5 overflow-x-auto custom-scrollbar">
        <TabButton active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon={Store} label="Perfil & Unidade" />
        <TabButton active={activeTab === 'contacts'} onClick={() => setActiveTab('contacts')} icon={Phone} label="Canais de Contato" />
        <TabButton active={activeTab === 'links'} onClick={() => setActiveTab('links')} icon={LinkIcon} label="Links & Redes" />
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="bg-surface-card border border-border-subtle rounded-2xl p-3.5 sm:p-6 shadow-lg min-w-0">
        {renderContent()}
      </div>
    </div>
  );
};

const TabButton = ({ active, onClick, icon: Icon, label }: any) => (
  <button
    onClick={onClick}
    className={`
      px-3.5 py-2 flex items-center justify-center gap-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap shrink-0
      ${active ? 'bg-gold-base text-surface-base shadow' : 'text-content-muted hover:text-content-base bg-surface-card/60 hover:bg-surface-card'}
    `}
  >
    <Icon className="w-3.5 h-3.5" />
    <span>{label}</span>
  </button>
);

// --- Subcomponents for each tab ---

const ProfileSettings = () => (
  <div className="space-y-5 max-w-2xl text-xs min-w-0">
    <div>
      <h2 className="text-sm font-bold text-content-base mb-0.5">Identidade Visual da Barbearia</h2>
      <p className="text-[11px] text-content-muted mb-4">Atualize a logomarca e o nome exibidos no app do cliente.</p>

      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 bg-surface-card p-3.5 rounded-2xl border border-border-subtle">
        <div className="w-20 h-20 bg-surface-card rounded-2xl border border-border-subtle flex items-center justify-center relative group shrink-0 shadow-inner">
          <Store className="w-8 h-8 text-gold-hover" />
          <button className="absolute inset-0 bg-surface-base/70 rounded-2xl opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity text-content-base text-[10px] font-bold gap-1">
            <Camera className="w-4 h-4" />
            <span>Alterar</span>
          </button>
        </div>
        <div className="flex-1 space-y-2 w-full min-w-0">
          <div>
            <label className="text-[10px] font-bold text-content-muted uppercase block mb-1">
              Nome Fantasia / Unidade
            </label>
            <input
              type="text"
              defaultValue="Navo Barber & Club - Unidade Principal"
              className="w-full bg-surface-card border border-border-subtle rounded-xl p-2.5 text-xs text-content-base focus:outline-none focus:border-[#FFFFFF] min-w-0"
            />
          </div>
        </div>
      </div>
    </div>

    <hr className="border-border-subtle" />

    <div className="space-y-3">
      <h2 className="text-sm font-bold text-content-base mb-0.5">Informações Gerais & Funcionamento</h2>

      <div>
        <label className="text-[10px] font-bold text-content-muted uppercase block mb-1">Slogan / Subtítulo</label>
        <input
          type="text"
          defaultValue="Estilo, Tradição e Excelência na Medida Certa"
          className="w-full bg-surface-card border border-border-subtle rounded-xl p-2.5 text-xs text-content-base focus:outline-none focus:border-[#FFFFFF] min-w-0"
        />
      </div>

      <div>
        <label className="text-[10px] font-bold text-content-muted uppercase block mb-1">
          <MapPin className="w-3 h-3 inline mr-1 text-gold-hover" /> Endereço Completo
        </label>
        <input
          type="text"
          defaultValue="Av. Paulista, 1000 - Bela Vista, São Paulo - SP"
          className="w-full bg-surface-card border border-border-subtle rounded-xl p-2.5 text-xs text-content-base focus:outline-none focus:border-[#FFFFFF] min-w-0"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-[10px] font-bold text-content-muted uppercase block mb-1">
            <Clock className="w-3 h-3 inline mr-1 text-gold-hover" /> Abertura
          </label>
          <input
            type="time"
            defaultValue="09:00"
            className="w-full bg-surface-card border border-border-subtle rounded-xl p-2.5 text-xs text-content-base focus:outline-none focus:border-[#FFFFFF] min-w-0"
          />
        </div>
        <div>
          <label className="text-[10px] font-bold text-content-muted uppercase block mb-1">
            <Clock className="w-3 h-3 inline mr-1 text-gold-hover" /> Fechamento
          </label>
          <input
            type="time"
            defaultValue="20:00"
            className="w-full bg-surface-card border border-border-subtle rounded-xl p-2.5 text-xs text-content-base focus:outline-none focus:border-[#FFFFFF] min-w-0"
          />
        </div>
      </div>
    </div>
  </div>
);

const ContactSettings = () => (
  <div className="space-y-4 max-w-2xl text-xs min-w-0">
    <div>
      <h2 className="text-sm font-bold text-content-base mb-0.5">Canais de Atendimento</h2>
      <p className="text-[11px] text-content-muted mb-4">
        Defina os contatos oficiais disponíveis no app para suporte aos clientes.
      </p>

      <div className="space-y-3">
        <div>
          <label className="text-[10px] font-bold text-content-muted uppercase block mb-1">
            WhatsApp Oficial de Agendamentos
          </label>
          <input
            type="text"
            defaultValue="(11) 99999-8888"
            className="w-full bg-surface-card border border-border-subtle rounded-xl p-2.5 text-xs text-content-base focus:outline-none focus:border-[#FFFFFF] min-w-0"
          />
        </div>

        <div>
          <label className="text-[10px] font-bold text-content-muted uppercase block mb-1">Telefone Fixo da Recepção</label>
          <input
            type="text"
            defaultValue="(11) 3211-0000"
            className="w-full bg-surface-card border border-border-subtle rounded-xl p-2.5 text-xs text-content-base focus:outline-none focus:border-[#FFFFFF] min-w-0"
          />
        </div>

        <div>
          <label className="text-[10px] font-bold text-content-muted uppercase block mb-1">E-mail de Suporte</label>
          <input
            type="email"
            defaultValue="contato@barberclub.com.br"
            className="w-full bg-surface-card border border-border-subtle rounded-xl p-2.5 text-xs text-content-base focus:outline-none focus:border-[#FFFFFF] min-w-0"
          />
        </div>
      </div>
    </div>
  </div>
);

const LinkSettings = () => (
  <div className="space-y-4 max-w-2xl text-xs min-w-0">
    <div>
      <h2 className="text-sm font-bold text-content-base mb-0.5">Redes Sociais & Links Externos</h2>
      <p className="text-[11px] text-content-muted mb-4">
        Conecte suas redes sociais e página de localização do Google Maps.
      </p>

      <div className="space-y-3">
        <div>
          <label className="text-[10px] font-bold text-content-muted uppercase block mb-1">Instagram (@usuario)</label>
          <div className="flex min-w-0">
            <span className="bg-surface-card border border-r-0 border-border-subtle rounded-l-xl px-3 py-2.5 text-content-muted font-bold shrink-0">
              @
            </span>
            <input
              type="text"
              defaultValue="navobarber_oficial"
              className="flex-1 min-w-0 bg-surface-card border border-border-subtle rounded-r-xl p-2.5 text-xs text-content-base focus:outline-none focus:border-[#FFFFFF]"
            />
          </div>
        </div>

        <div>
          <label className="text-[10px] font-bold text-content-muted uppercase block mb-1">Página do Facebook</label>
          <input
            type="url"
            defaultValue="https://facebook.com/navobarber"
            className="w-full bg-surface-card border border-border-subtle rounded-xl p-2.5 text-xs text-content-base focus:outline-none focus:border-[#FFFFFF] min-w-0"
          />
        </div>

        <div>
          <label className="text-[10px] font-bold text-content-muted uppercase block mb-1">
            <Globe className="w-3 h-3 inline mr-1 text-gold-hover" /> Link do Google Maps / Avaliações
          </label>
          <input
            type="url"
            defaultValue="https://maps.google.com/..."
            className="w-full bg-surface-card border border-border-subtle rounded-xl p-2.5 text-xs text-content-base focus:outline-none focus:border-[#FFFFFF] min-w-0"
          />
        </div>
      </div>
    </div>
  </div>
);
