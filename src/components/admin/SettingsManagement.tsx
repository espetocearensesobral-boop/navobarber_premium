import React, { useState, useEffect } from 'react';
import { Store, Phone, Link as LinkIcon, Tag, Award, Save, Camera, Plus, Trash2, Edit2, Info, CheckCircle2, Globe, Clock, MapPin, Key, RefreshCw, AlertTriangle, Database, ShieldCheck, ShieldAlert } from 'lucide-react';

type SettingsTab = 'profile' | 'contacts' | 'links' | 'coupons' | 'loyalty' | 'apikeys';

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
      case 'coupons':
        return <CouponSettings showToast={showToast} />;
      case 'loyalty':
        return <LoyaltySettings />;
      case 'apikeys':
        return <ApiKeysSettings showToast={showToast} />;
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
            Gerencie a identidade da barbearia, canais de contato, chaves secretas de API e clube de fidelidade.
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
        <TabButton active={activeTab === 'apikeys'} onClick={() => setActiveTab('apikeys')} icon={Key} label="Validação de Chaves API" />
        <TabButton active={activeTab === 'coupons'} onClick={() => setActiveTab('coupons')} icon={Tag} label="Cupons Desconto" />
        <TabButton active={activeTab === 'loyalty'} onClick={() => setActiveTab('loyalty')} icon={Award} label="Clube Fidelidade" />
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

const CouponSettings = ({ showToast }: { showToast: (m: string) => void }) => {
  const [couponsEnabled, setCouponsEnabled] = useState(() => localStorage.getItem('app_coupons_enabled') !== 'false');

  const toggleCoupons = () => {
    const val = !couponsEnabled;
    setCouponsEnabled(val);
    localStorage.setItem('app_coupons_enabled', val.toString());
  };

  const [coupons, setCoupons] = useState([
    { id: 1, code: 'BEMVINDO10', discount: '10%', expires: '2026-12-31', active: true },
    { id: 2, code: 'CLIENTEFIDEL', discount: 'R$ 15,00', expires: '2026-10-01', active: false },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ code: '', discount: '', expires: '', active: true });

  const handleEdit = (coupon: any) => {
    setEditingId(coupon.id);
    setFormData(coupon);
    setShowForm(true);
  };

  const handleDelete = (id: number, code: string) => {
    if (window.confirm(`Tem certeza que deseja remover o cupom ${code}?`)) {
      setCoupons(coupons.filter((c) => c.id !== id));
      showToast(`Cupom ${code} removido!`);
    }
  };

  const handleSaveCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      setCoupons(coupons.map((c) => (c.id === editingId ? { ...formData, id: editingId } : c)));
      showToast('Cupom atualizado com sucesso!');
    } else {
      setCoupons([...coupons, { ...formData, id: Date.now() }]);
      showToast('Novo cupom criado com sucesso!');
    }
    setShowForm(false);
    setEditingId(null);
    setFormData({ code: '', discount: '', expires: '', active: true });
  };

  return (
    <div className="space-y-4 text-xs min-w-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 bg-surface-card p-3.5 rounded-2xl border border-border-subtle">
        <div>
          <h2 className="text-xs font-bold text-content-base">Sistema de Cupons & Promoções</h2>
          <p className="text-[10px] text-content-muted mt-0.5">
            Ative ou desative o uso de cupons de desconto no agendamento do cliente.
          </p>
        </div>
        <button
          onClick={toggleCoupons}
          className={`w-full sm:w-auto px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
            couponsEnabled ? 'bg-status-success/20 text-status-success border border-status-success/30' : 'bg-surface-card text-content-muted'
          }`}
        >
          {couponsEnabled ? 'Habilitado' : 'Desabilitado'}
        </button>
      </div>

      {couponsEnabled && (
        <>
          <div className="flex justify-end">
            <button
              onClick={() => {
                setEditingId(null);
                setFormData({ code: '', discount: '', expires: '', active: true });
                setShowForm(true);
              }}
              className="w-full sm:w-auto bg-gold-base text-surface-base px-3.5 py-2 rounded-xl font-extrabold flex items-center justify-center gap-1.5 shadow hover:bg-gold-base/80"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Novo Cupom</span>
            </button>
          </div>

          {showForm && (
            <div className="bg-surface-card border border-border-subtle rounded-2xl p-4 space-y-3">
              <h3 className="text-content-base font-bold text-xs">{editingId ? 'Editar Cupom' : 'Novo Cupom'}</h3>
              <form onSubmit={handleSaveCoupon} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[10px] font-bold text-content-muted uppercase block mb-1">Código do Cupom</label>
                    <input
                      required
                      type="text"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      placeholder="EX: CORTE10"
                      className="w-full bg-surface-card border border-border-subtle rounded-xl p-2.5 text-xs text-content-base focus:outline-none focus:border-[#FFFFFF] uppercase"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-content-muted uppercase block mb-1">Valor de Desconto</label>
                    <input
                      required
                      type="text"
                      value={formData.discount}
                      onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                      placeholder="10% ou R$ 15,00"
                      className="w-full bg-surface-card border border-border-subtle rounded-xl p-2.5 text-xs text-content-base focus:outline-none focus:border-[#FFFFFF]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-content-muted uppercase block mb-1">Data de Validade</label>
                    <input
                      required
                      type="date"
                      value={formData.expires}
                      onChange={(e) => setFormData({ ...formData, expires: e.target.value })}
                      className="w-full bg-surface-card border border-border-subtle rounded-xl p-2.5 text-xs text-content-base focus:outline-none focus:border-[#FFFFFF]"
                    />
                  </div>
                  <div className="flex items-center pt-2 sm:pt-5">
                    <label className="text-xs font-bold text-content-base flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.active}
                        onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                        className="rounded bg-surface-card border-border-subtle"
                      />
                      Cupom Ativo para uso
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-border-subtle">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-3 py-1.5 rounded-xl bg-surface-card text-content-muted hover:text-content-base"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="bg-gold-base text-surface-base px-4 py-1.5 rounded-xl font-extrabold"
                  >
                    Salvar Cupom
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* MOBILE CARDS VIEW */}
          <div className="block sm:hidden space-y-2">
            {coupons.map((coupon) => (
              <div key={coupon.id} className="bg-surface-card border border-border-subtle p-3 rounded-2xl flex items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-gold-hover">{coupon.code}</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${coupon.active ? 'bg-status-success/15 text-status-success' : 'bg-red-500/15 text-red-400'}`}>
                      {coupon.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                  <p className="text-xs text-content-base font-bold mt-1">{coupon.discount} de desconto</p>
                  <p className="text-[10px] text-content-muted">Validade: {coupon.expires}</p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleEdit(coupon)}
                    className="p-2 rounded-xl bg-surface-card text-content-muted hover:text-content-base border border-border-subtle"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(coupon.id, coupon.code)}
                    className="p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* DESKTOP TABLE VIEW */}
          <div className="hidden sm:block bg-surface-card border border-border-subtle rounded-2xl overflow-hidden p-1">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="bg-surface-base text-content-muted border-b border-border-subtle">
                  <tr>
                    <th className="p-3 font-bold uppercase text-[10px]">Código</th>
                    <th className="p-3 font-bold uppercase text-[10px]">Desconto</th>
                    <th className="p-3 font-bold uppercase text-[10px]">Validade</th>
                    <th className="p-3 font-bold uppercase text-[10px]">Status</th>
                    <th className="p-3 font-bold uppercase text-[10px] text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {coupons.map((coupon) => (
                    <tr key={coupon.id} className="hover:bg-surface-card transition-colors">
                      <td className="p-3 font-extrabold text-gold-hover tracking-wider">{coupon.code}</td>
                      <td className="p-3 text-content-base">{coupon.discount}</td>
                      <td className="p-3 text-content-muted">{coupon.expires}</td>
                      <td className="p-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            coupon.active ? 'bg-status-success/15 text-status-success' : 'bg-red-500/15 text-red-400'
                          }`}
                        >
                          {coupon.active ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => handleEdit(coupon)}
                            className="p-1.5 rounded-lg bg-surface-card text-content-muted hover:text-content-base border border-border-subtle"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(coupon.id, coupon.code)}
                            className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const LoyaltySettings = () => {
  const [loyaltyEnabled, setLoyaltyEnabled] = useState(() => localStorage.getItem('app_loyalty_enabled') !== 'false');

  const toggleLoyalty = () => {
    const val = !loyaltyEnabled;
    setLoyaltyEnabled(val);
    localStorage.setItem('app_loyalty_enabled', val.toString());
  };

  const [tiers] = useState([
    { id: 1, name: 'Bronze', range: '0 - 499 pt', cashback: '0%', color: '#FFFFFF' },
    { id: 2, name: 'Prata', range: '500 - 999 pt', cashback: '5%', color: '#C0C0C0' },
    { id: 3, name: 'Ouro', range: '1000+ pt', cashback: '10%', color: '#FFD700' },
  ]);

  return (
    <div className="space-y-4 max-w-3xl text-xs min-w-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 bg-surface-card p-3.5 rounded-2xl border border-border-subtle">
        <div>
          <h2 className="text-xs font-bold text-content-base">Clube de Fidelidade & Gamificação</h2>
          <p className="text-[10px] text-content-muted mt-0.5">
            Premie os clientes frequentes com pontos, níveis e recompensas exclusivas.
          </p>
        </div>
        <button
          onClick={toggleLoyalty}
          className={`w-full sm:w-auto px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
            loyaltyEnabled ? 'bg-status-success/20 text-status-success border border-status-success/30' : 'bg-surface-card text-content-muted'
          }`}
        >
          {loyaltyEnabled ? 'Ativo' : 'Inativo'}
        </button>
      </div>

      {loyaltyEnabled && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          <div className="bg-surface-card p-3.5 sm:p-4 rounded-2xl border border-border-subtle space-y-3 min-w-0">
            <div className="flex items-center gap-2 text-gold-hover">
              <Info className="w-4 h-4" />
              <span className="font-bold text-xs text-content-base">Regras de Acúmulo</span>
            </div>

            <div>
              <label className="text-[10px] font-bold text-content-muted uppercase block mb-1">
                A cada R$ 1,00 gasto gera:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  defaultValue="1"
                  className="w-20 bg-surface-card border border-border-subtle rounded-xl p-2 text-xs text-content-base focus:outline-none focus:border-[#FFFFFF]"
                />
                <span className="text-xs text-content-base">Ponto(s)</span>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-content-muted uppercase block mb-1">
                Bônus ao realizar 1º Agendamento:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  defaultValue="50"
                  className="w-20 bg-surface-card border border-border-subtle rounded-xl p-2 text-xs text-content-base focus:outline-none focus:border-[#FFFFFF]"
                />
                <span className="text-xs text-content-base">Pontos</span>
              </div>
            </div>
          </div>

          <div className="bg-surface-card p-3.5 sm:p-4 rounded-2xl border border-border-subtle space-y-3 min-w-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gold-hover">
                <Award className="w-4 h-4" />
                <span className="font-bold text-xs text-content-base">Níveis de Categoria (Tiers)</span>
              </div>
            </div>

            <div className="space-y-2">
              {tiers.map((tier) => (
                <div
                  key={tier.id}
                  className="flex items-center justify-between bg-surface-card p-2.5 rounded-xl border border-border-subtle"
                >
                  <div>
                    <span className="text-xs font-bold block" style={{ color: tier.color }}>
                      {tier.name}
                    </span>
                    <span className="text-[10px] text-content-muted">{tier.range}</span>
                  </div>
                  <span className="text-[10px] bg-surface-card border border-border-subtle px-2 py-0.5 rounded text-content-base font-bold">
                    {tier.cashback} Cashback
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ApiKeysSettings = ({ showToast }: { showToast: (m: string) => void }) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  const fetchKeysStatus = async () => {
    setLoading(true);
    try {
      const { authFetch } = await import('../../lib/api');
      const res = await authFetch('/api/admin/validate-keys');
      if (res.ok) {
        const json = await res.json();
        setData(json);
        showToast('Validação das chaves de API concluída!');
      } else {
        showToast('Erro ao consultar endpoint de validação');
      }
    } catch (e: any) {
      showToast('Falha na comunicação com o servidor');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKeysStatus();
  }, []);

  return (
    <div className="space-y-5 max-w-3xl text-xs min-w-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-surface-card p-4 rounded-2xl border border-border-subtle">
        <div>
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-gold-hover" />
            <h2 className="text-sm font-bold text-content-base">Validação em Tempo Real de Chaves de API</h2>
          </div>
          <p className="text-[11px] text-content-muted mt-1 leading-relaxed">
            Diagnóstico de autenticação do servidor para Gemini AI, Banco de Dados PostgreSQL, JWT e segredos do ecossistema.
          </p>
        </div>

        <button
          onClick={fetchKeysStatus}
          disabled={loading}
          className="w-full sm:w-auto bg-gold-base text-surface-base px-4 py-2.5 rounded-xl font-extrabold flex items-center justify-center gap-2 hover:bg-gold-base/80 transition-all shadow active:scale-95 disabled:opacity-50 shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Testando Chaves...' : 'Validar Novamente'}</span>
        </button>
      </div>

      {data && data.summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="bg-surface-card p-3 rounded-xl border border-border-subtle">
            <span className="text-[10px] text-content-muted font-bold block uppercase">Chaves Testadas</span>
            <span className="text-base font-extrabold text-content-base mt-0.5 block">{data.summary.totalKeysTested}</span>
          </div>
          <div className="bg-surface-card p-3 rounded-xl border border-border-subtle">
            <span className="text-[10px] text-content-muted font-bold block uppercase">Configuradas</span>
            <span className="text-base font-extrabold text-gold-hover mt-0.5 block">{data.summary.configuredKeys}</span>
          </div>
          <div className="bg-surface-card p-3 rounded-xl border border-border-subtle">
            <span className="text-[10px] text-content-muted font-bold block uppercase">100% Válidas</span>
            <span className="text-base font-extrabold text-status-success mt-0.5 block">{data.summary.validKeys}</span>
          </div>
          <div className="bg-surface-card p-3 rounded-xl border border-border-subtle">
            <span className="text-[10px] text-content-muted font-bold block uppercase">Latência Diagnóstico</span>
            <span className="text-base font-extrabold text-content-base mt-0.5 block">{data.latencyMs} ms</span>
          </div>
        </div>
      )}

      {loading && !data && (
        <div className="py-12 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-gold-hover animate-spin mx-auto" />
          <p className="text-xs text-content-muted font-medium">Executando chamadas de teste nas APIs do sistema...</p>
        </div>
      )}

      {data && data.keys && (
        <div className="space-y-3 pt-1">
          {data.keys.map((item: any, idx: number) => {
            let statusBadge = (
              <span className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold bg-status-success/15 text-status-success border border-status-success/30 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> VÁLIDA
              </span>
            );

            if (item.status === 'invalid') {
              statusBadge = (
                <span className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold bg-red-500/15 text-red-400 border border-red-500/30 flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3" /> ERRO / INVÁLIDA
                </span>
              );
            } else if (item.status === 'warning') {
              statusBadge = (
                <span className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> ALERTA
                </span>
              );
            } else if (item.status === 'fallback') {
              statusBadge = (
                <span className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold bg-blue-500/15 text-blue-400 border border-blue-500/30 flex items-center gap-1">
                  <Database className="w-3 h-3" /> IN-MEMORY / MOCK
                </span>
              );
            } else if (item.status === 'missing' || item.status === 'optional') {
              statusBadge = (
                <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-surface-base text-content-muted border border-border-subtle">
                  NÃO CONFIGURADA
                </span>
              );
            }

            return (
              <div key={idx} className="bg-surface-card p-4 rounded-2xl border border-border-subtle space-y-2 hover:border-border-subtle/80 transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-content-base text-xs">{item.name}</span>
                      <code className="px-2 py-0.5 rounded bg-surface-base border border-border-subtle font-mono text-[10px] text-gold-hover">
                        {item.key}
                      </code>
                    </div>
                  </div>
                  <div className="shrink-0">{statusBadge}</div>
                </div>

                <p className="text-[11px] text-content-muted leading-relaxed">
                  {item.message}
                </p>

                {item.maskedKey && (
                  <div className="text-[10px] text-content-muted font-mono bg-surface-base/50 px-2.5 py-1 rounded-md inline-block border border-border-subtle">
                    Preview: {item.maskedKey}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="p-3.5 rounded-2xl bg-gold-base/10 border border-gold-base/20 text-xs text-gold-hover flex items-start gap-2.5">
        <Info className="w-4 h-4 shrink-0 mt-0.5" />
        <div>
          <strong className="block text-content-base mb-0.5">Gestão Segura de Chaves Secretas</strong>
          Todas as chamadas de API do modelo Gemini e banco de dados rodam estritamente no lado do servidor Node.js/Express (`/api/*`), garantindo que nenhuma chave privada ou credencial secreta seja vazada no navegador do cliente.
        </div>
      </div>
    </div>
  );
};




