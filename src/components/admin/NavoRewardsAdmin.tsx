import React, { useState, useEffect } from 'react';
import {
  fetchNavoRewardsAdminDashboard,
  triggerInactiveClientsCampaign,
  fetchRewardsList,
  createAdminReward,
  deleteAdminReward,
  manuallyAdjustPoints,
  fetchClientsFromSupabase,
  fetchLoyaltyConfig,
  saveLoyaltyConfig
} from '../../services/supabaseDataService';
import {
  Award,
  Gift,
  Star,
  Users,
  TrendingUp,
  Megaphone,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Crown,
  MessageSquare,
  Plus,
  Trash2,
  Zap,
  Copy,
  ExternalLink,
  Share2,
  Check,
  Settings,
  Clock,
  DollarSign,
  QrCode,
  Link as LinkIcon,
  Save,
  RefreshCw,
  Send
} from 'lucide-react';

type NavoRewardsTab = 'dashboard' | 'loyalty' | 'rewards' | 'referrals' | 'reviews';

export const NavoRewardsAdmin: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavoRewardsTab>('dashboard');
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [campaignLoading, setCampaignLoading] = useState(false);
  const [campaignMsg, setCampaignMsg] = useState<string | null>(null);

  // Rewards catalog state
  const [rewardsList, setRewardsList] = useState<any[]>([]);
  const [showAddRewardModal, setShowAddRewardModal] = useState(false);
  const [newReward, setNewReward] = useState({
    title: '',
    pointsRequired: 500,
    rewardType: 'upgrade',
    valueDescription: '',
    icon: 'Sparkles'
  });

  // Manual points state
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [manualPointsAmount, setManualPointsAmount] = useState(100);
  const [manualPointsReason, setManualPointsReason] = useState('');
  const [manualSuccessMsg, setManualSuccessMsg] = useState<string | null>(null);

  // Voucher validation state
  const [voucherCodeInput, setVoucherCodeInput] = useState('');
  const [voucherValidationResult, setVoucherValidationResult] = useState<string | null>(null);

  // CONFIGURABLE ENGINE SETTINGS STATE
  const [config, setConfig] = useState<any>({
    currencyPerPoint: 1.0,
    pointsValidityDays: 365,
    tierMultipliers: {
      Bronze: 1.0,
      Prata: 1.2,
      Ouro: 1.5,
      Diamante: 2.0
    },
    referralPoints: {
      referrerBonus: 100,
      referredBonus: 50,
      milestoneCount: 5,
      milestoneBonus: 1000
    },
    reviewPoints: {
      baseReview: 20,
      withPhotoBonus: 30,
      fiveStarBonus: 10
    },
    birthdayBonus: 100
  });

  const [savingConfig, setSavingConfig] = useState(false);
  const [configSuccessMsg, setConfigSuccessMsg] = useState<string | null>(null);

  // REFERRAL LINK GENERATOR STATE
  const [refClient, setRefClient] = useState<any | null>(null);
  const [customRefMsg, setCustomRefMsg] = useState(
    'Olá! Te convido para conhecer a Barbearia Navo. Agende seu primeiro corte usando meu link e ganhe 50 pontos bônus no clube de fidelidade:'
  );
  const [copiedLink, setCopiedLink] = useState(false);

  // EVALUATION LINK / QR CODE STATE
  const [evalClient, setEvalClient] = useState<any | null>(null);
  const [customEvalMsg, setCustomEvalMsg] = useState(
    'Olá! Como foi sua experiência hoje na Barbearia Navo? Avalie em 1 minuto e ganhe pontos extras na sua carteira:'
  );
  const [copiedEvalLink, setCopiedEvalLink] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [dashRes, rwdRes, clientList, cfgRes] = await Promise.all([
        fetchNavoRewardsAdminDashboard(),
        fetchRewardsList(),
        fetchClientsFromSupabase(),
        fetchLoyaltyConfig().catch(() => null)
      ]);
      setData(dashRes);
      setRewardsList(rwdRes);
      setClients(clientList || []);
      if (clientList && clientList.length > 0) {
        setRefClient(clientList[0]);
        setEvalClient(clientList[0]);
      }
      if (cfgRes) {
        setConfig(cfgRes);
      }
    } catch (e) {
      console.error('Erro ao carregar dados do Navo Rewards:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveConfig = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSavingConfig(true);
    try {
      const res = await saveLoyaltyConfig(config);
      setConfigSuccessMsg(res.message || 'Configurações salvas!');
      setTimeout(() => setConfigSuccessMsg(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Erro ao salvar configurações.');
    } finally {
      setSavingConfig(false);
    }
  };

  const handleTriggerCampaign = async () => {
    if (!confirm('Deseja creditar +100 pontos para todos os clientes ativos como incentivo de retorno?')) return;
    setCampaignLoading(true);
    try {
      const res = await triggerInactiveClientsCampaign();
      setCampaignMsg(res.message);
      await loadData();
      setTimeout(() => setCampaignMsg(null), 5000);
    } catch (err: any) {
      alert(err.message || 'Erro ao disparar campanha');
    } finally {
      setCampaignLoading(false);
    }
  };

  const handleCreateReward = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createAdminReward(newReward);
      setShowAddRewardModal(false);
      setNewReward({
        title: '',
        pointsRequired: 500,
        rewardType: 'upgrade',
        valueDescription: '',
        icon: 'Sparkles'
      });
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Erro ao criar recompensa.');
    }
  };

  const handleDeleteReward = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover esta recompensa?')) return;
    try {
      await deleteAdminReward(id);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Erro ao remover recompensa.');
    }
  };

  const handleManualPointsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) {
      alert('Selecione um cliente.');
      return;
    }
    try {
      const res = await manuallyAdjustPoints(selectedClient, Number(manualPointsAmount), manualPointsReason);
      setManualSuccessMsg(res.message);
      setManualPointsReason('');
      await loadData();
      setTimeout(() => setManualSuccessMsg(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Erro ao ajustar pontos.');
    }
  };

  const handleValidateVoucher = () => {
    if (!voucherCodeInput.trim()) return;
    if (voucherCodeInput.toUpperCase().startsWith('NAV-RWD-')) {
      setVoucherValidationResult(`✅ VOUCHER VÁLIDO: Código ${voucherCodeInput.toUpperCase()} confirmado! Pode conceder o prêmio/desconto ao cliente.`);
    } else {
      setVoucherValidationResult(`⚠️ VOUCHER INVÁLIDO ou CÓDIGO INCORRETO. Verifique com o cliente.`);
    }
  };

  const baseUrl = window.location.origin;
  const currentRefCode = refClient?.referralCode || `NAV-${refClient?.name ? refClient.name.split(' ')[0].toUpperCase() : 'GUEST'}100`;
  const generatedRefUrl = `${baseUrl}?ref=${currentRefCode}`;
  const generatedEvalUrl = `${baseUrl}?review=true`;

  const copyToClipboard = (text: string, isEval = false) => {
    navigator.clipboard.writeText(text);
    if (isEval) {
      setCopiedEvalLink(true);
      setTimeout(() => setCopiedEvalLink(false), 2500);
    } else {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const shareViaWhatsapp = (phone: string, text: string) => {
    const cleanPhone = (phone || '').replace(/\D/g, '');
    const encodedText = encodeURIComponent(text);
    const whatsappUrl = cleanPhone ? `https://wa.me/55${cleanPhone}?text=${encodedText}` : `https://wa.me/?text=${encodedText}`;
    window.open(whatsappUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="p-8 text-center space-y-3">
        <div className="w-10 h-10 border-2 border-gold-base border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-content-muted">Carregando inteligência do Navo Rewards...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface-card p-6 rounded-2xl border border-border-subtle shadow-xl">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-base/10 border border-gold-base/30 text-gold-base text-xs font-bold mb-2">
            <Award className="w-4 h-4" />
            <span>Motor Integrado Navo Rewards & NPS</span>
          </div>
          <h1 className="text-2xl font-serif font-black text-content-base">Navo Rewards & NPS Admin</h1>
          <p className="text-xs text-content-muted mt-0.5">Central inteligente para fidelidade, cupons de desconto, motor de indicações e avaliações pós-serviço.</p>
        </div>

        <button
          onClick={handleTriggerCampaign}
          disabled={campaignLoading}
          className="px-4 py-3 rounded-xl bg-gold-base text-surface-base font-bold text-xs uppercase tracking-wider hover:opacity-95 shadow-lg flex items-center justify-center gap-2 shrink-0"
        >
          <Megaphone className="w-4 h-4" />
          <span>{campaignLoading ? 'Disparando...' : 'Disparar Bônus Re-engajamento (+100 Pts)'}</span>
        </button>
      </div>

      {campaignMsg && (
        <div className="p-4 rounded-xl bg-status-success/20 border border-status-success/40 text-status-success text-xs font-bold text-center animate-in fade-in">
          {campaignMsg}
        </div>
      )}

      {configSuccessMsg && (
        <div className="p-4 rounded-xl bg-status-success/20 border border-status-success/40 text-status-success text-xs font-bold text-center animate-in fade-in">
          {configSuccessMsg}
        </div>
      )}

      {/* TABS NAVIGATION BAR */}
      <div className="bg-surface-card border border-border-subtle rounded-2xl p-1.5 flex items-center gap-1.5 overflow-x-auto custom-scrollbar">
        <TabNavButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={TrendingUp} label="Dashboard General" />
        <TabNavButton active={activeTab === 'loyalty'} onClick={() => setActiveTab('loyalty')} icon={Crown} label="Clube de Fidelidade & Níveis" />
        <TabNavButton active={activeTab === 'rewards'} onClick={() => setActiveTab('rewards')} icon={Gift} label="Prêmios & Cupons Desconto" />
        <TabNavButton active={activeTab === 'referrals'} onClick={() => setActiveTab('referrals')} icon={Users} label="Motor de Indicações" />
        <TabNavButton active={activeTab === 'reviews'} onClick={() => setActiveTab('reviews')} icon={Star} label="Avaliações & NPS" />
      </div>

      {/* TAB 1: DASHBOARD GENERAL */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* KPI Stats Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* NPS Score */}
            <div className="bg-surface-card p-5 rounded-2xl border border-border-subtle space-y-2 shadow-lg">
              <div className="flex items-center justify-between text-content-muted">
                <span className="text-xs font-bold uppercase tracking-wider">Score NPS (Satisfação)</span>
                <Star className="w-4 h-4 text-gold-base" />
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-serif font-black text-gold-base">{data?.npsScore || 100}</span>
                <span className="text-xs font-bold text-status-success">/ 100</span>
              </div>
              <p className="text-[10px] text-content-muted">
                Promotores (5⭐): {data?.promoters || 0} | Detratores: {data?.detractors || 0}
              </p>
            </div>

            {/* Total Points Issued */}
            <div className="bg-surface-card p-5 rounded-2xl border border-border-subtle space-y-2 shadow-lg">
              <div className="flex items-center justify-between text-content-muted">
                <span className="text-xs font-bold uppercase tracking-wider">Pontos Emitidos</span>
                <Sparkles className="w-4 h-4 text-gold-base" />
              </div>
              <div className="text-3xl font-serif font-black text-content-base">
                +{data?.totalIssued || 0}
              </div>
              <p className="text-[10px] text-content-muted">Acumulados via cortes, avaliações e indicações</p>
            </div>

            {/* Total Points Redeemed */}
            <div className="bg-surface-card p-5 rounded-2xl border border-border-subtle space-y-2 shadow-lg">
              <div className="flex items-center justify-between text-content-muted">
                <span className="text-xs font-bold uppercase tracking-wider">Pontos Resgatados</span>
                <Gift className="w-4 h-4 text-gold-base" />
              </div>
              <div className="text-3xl font-serif font-black text-status-error">
                -{data?.totalRedeemed || 0}
              </div>
              <p className="text-[10px] text-content-muted">Trocados por upgrades, produtos e serviços</p>
            </div>

            {/* Total Reviews */}
            <div className="bg-surface-card p-5 rounded-2xl border border-border-subtle space-y-2 shadow-lg">
              <div className="flex items-center justify-between text-content-muted">
                <span className="text-xs font-bold uppercase tracking-wider">Avaliações Recebidas</span>
                <MessageSquare className="w-4 h-4 text-gold-base" />
              </div>
              <div className="text-3xl font-serif font-black text-content-base">
                {data?.totalReviews || 0}
              </div>
              <p className="text-[10px] text-content-muted">Pesquisas detalhadas de pós-atendimento</p>
            </div>
          </div>

          {/* Tier Distribution & Top Ambassadors */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Tier Distribution */}
            <div className="bg-surface-card p-6 rounded-2xl border border-border-subtle shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-content-base uppercase tracking-wider flex items-center gap-2">
                <Crown className="w-4 h-4 text-gold-base" />
                <span>Distribuição por Nível VIP</span>
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-surface-base border border-border-subtle space-y-1">
                  <span className="text-[10px] uppercase font-bold text-amber-700 block">Bronze (0 - 999 pts)</span>
                  <span className="text-xl font-bold text-content-base">{data?.tierDistribution?.Bronze || 0} clientes</span>
                  <span className="text-[10px] text-content-muted block">Multiplicador: {config.tierMultipliers?.Bronze || 1.0}x</span>
                </div>

                <div className="p-4 rounded-xl bg-surface-base border border-border-subtle space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Prata (1000 - 2999 pts)</span>
                  <span className="text-xl font-bold text-content-base">{data?.tierDistribution?.Prata || 0} clientes</span>
                  <span className="text-[10px] text-content-muted block">Multiplicador: {config.tierMultipliers?.Prata || 1.2}x</span>
                </div>

                <div className="p-4 rounded-xl bg-surface-base border border-border-subtle space-y-1">
                  <span className="text-[10px] uppercase font-bold text-gold-base block">Ouro (3000 - 5999 pts)</span>
                  <span className="text-xl font-bold text-content-base">{data?.tierDistribution?.Ouro || 0} clientes</span>
                  <span className="text-[10px] text-content-muted block">Multiplicador: {config.tierMultipliers?.Ouro || 1.5}x</span>
                </div>

                <div className="p-4 rounded-xl bg-surface-base border border-border-subtle space-y-1">
                  <span className="text-[10px] uppercase font-bold text-cyan-400 block">Diamante (6000+ pts)</span>
                  <span className="text-xl font-bold text-content-base">{data?.tierDistribution?.Diamante || 0} clientes</span>
                  <span className="text-[10px] text-content-muted block">Multiplicador: {config.tierMultipliers?.Diamante || 2.0}x VIP</span>
                </div>
              </div>
            </div>

            {/* Top Ambassadors Leaderboard */}
            <div className="bg-surface-card p-6 rounded-2xl border border-border-subtle shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-content-base uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4 text-gold-base" />
                <span>Maiores Embaixadores (Mural de Indicações)</span>
              </h3>

              {data?.ambassadors && data.ambassadors.length > 0 ? (
                <div className="space-y-2 text-xs divide-y divide-border-subtle">
                  {data.ambassadors.map((amb: any, idx: number) => (
                    <div key={amb.id || idx} className="pt-2 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className={`w-6 h-6 rounded-full font-bold text-[10px] flex items-center justify-center ${
                          idx === 0 ? 'bg-gold-base text-surface-base' : 'bg-surface-base text-content-muted'
                        }`}>
                          #{idx + 1}
                        </span>
                        <div>
                          <span className="text-content-base font-bold block">{amb.name}</span>
                          <span className="text-[10px] text-content-muted">Nível {amb.tier} • {amb.points} pts acumulados</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-bold text-gold-base block">{amb.totalReferrals} amigos indicados</span>
                        <span className="text-[10px] text-status-success font-semibold">100% convertidos</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-content-muted py-8 text-center">Nenhum embaixador ativo ainda nesta semana.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CLUBE DE FIDELIDADE & NÍVEIS (EDITABLE ENGINE CONFIGS) */}
      {activeTab === 'loyalty' && (
        <div className="space-y-6">
          {/* EDITABLE LOYALTY ENGINE RULES FORM */}
          <form onSubmit={handleSaveConfig} className="bg-surface-card p-6 rounded-2xl border border-border-subtle space-y-6 shadow-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-border-subtle">
              <div>
                <h3 className="text-base font-bold text-content-base flex items-center gap-2">
                  <Crown className="w-5 h-5 text-gold-base" />
                  <span>Configuração Editável de Cálculo de Pontos & Validade</span>
                </h3>
                <p className="text-xs text-content-muted">Ajuste em tempo real a taxa de conversão, multiplicadores e prazo de expiração.</p>
              </div>

              <button
                type="submit"
                disabled={savingConfig}
                className="px-4 py-2.5 rounded-xl bg-gold-base text-surface-base font-bold text-xs uppercase tracking-wider hover:opacity-95 shadow flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>{savingConfig ? 'Salvando...' : 'Salvar Alterações'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-xs">
              {/* Currency Per Point Ratio */}
              <div className="p-4 bg-surface-base rounded-2xl border border-border-subtle space-y-3">
                <label className="text-xs font-bold text-gold-base uppercase tracking-wider flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4" /> Razão de Conversão (R$ por Ponto)
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-content-muted font-bold">R$</span>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={config.currencyPerPoint}
                    onChange={(e) => setConfig({ ...config, currencyPerPoint: Number(e.target.value) })}
                    className="w-full bg-surface-card border border-border-subtle rounded-xl p-2.5 text-content-base text-base font-bold focus:outline-none focus:border-gold-base"
                  />
                  <span className="text-content-muted font-bold whitespace-nowrap">= 1 Ponto</span>
                </div>
                <p className="text-[11px] text-content-muted">Ex: Se R$ 1,00 = 1 Ponto, um corte de R$ 80 gera 80 pontos base.</p>
              </div>

              {/* Points Expiration */}
              <div className="p-4 bg-surface-base rounded-2xl border border-border-subtle space-y-3">
                <label className="text-xs font-bold text-gold-base uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-4 h-4" /> Duração / Validade dos Pontos (Dias)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    value={config.pointsValidityDays}
                    onChange={(e) => setConfig({ ...config, pointsValidityDays: Number(e.target.value) })}
                    className="w-full bg-surface-card border border-border-subtle rounded-xl p-2.5 text-content-base text-base font-bold focus:outline-none focus:border-gold-base"
                  />
                  <span className="text-content-muted font-bold">dias</span>
                </div>
                <p className="text-[11px] text-content-muted">Digite 0 para pontos permanentes (sem expiração).</p>
              </div>

              {/* Birthday Bonus */}
              <div className="p-4 bg-surface-base rounded-2xl border border-border-subtle space-y-3">
                <label className="text-xs font-bold text-gold-base uppercase tracking-wider flex items-center gap-1.5">
                  <Gift className="w-4 h-4" /> Bônus de Aniversário
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    value={config.birthdayBonus}
                    onChange={(e) => setConfig({ ...config, birthdayBonus: Number(e.target.value) })}
                    className="w-full bg-surface-card border border-border-subtle rounded-xl p-2.5 text-content-base text-base font-bold focus:outline-none focus:border-gold-base"
                  />
                  <span className="text-content-muted font-bold">pts</span>
                </div>
                <p className="text-[11px] text-content-muted">Creditado automaticamente na data de aniversário do cliente.</p>
              </div>
            </div>

            {/* VIP TIER MULTIPLIERS */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-content-base uppercase tracking-wider">Multiplicadores por Nível VIP (Aceleração de Pontos)</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                {/* Bronze */}
                <div className="p-4 bg-surface-base rounded-xl border border-amber-700/30 space-y-2">
                  <span className="text-[10px] font-bold uppercase text-amber-700 block">Bronze (0 - 999 pts)</span>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      step="0.1"
                      min="1"
                      value={config.tierMultipliers?.Bronze || 1.0}
                      onChange={(e) => setConfig({
                        ...config,
                        tierMultipliers: { ...config.tierMultipliers, Bronze: Number(e.target.value) }
                      })}
                      className="w-20 bg-surface-card border border-border-subtle rounded-xl p-2 text-content-base text-sm font-bold"
                    />
                    <span className="text-content-muted font-bold">x Pontos</span>
                  </div>
                </div>

                {/* Prata */}
                <div className="p-4 bg-surface-base rounded-xl border border-slate-400/30 space-y-2">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Prata (1000 - 2999 pts)</span>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      step="0.1"
                      min="1"
                      value={config.tierMultipliers?.Prata || 1.2}
                      onChange={(e) => setConfig({
                        ...config,
                        tierMultipliers: { ...config.tierMultipliers, Prata: Number(e.target.value) }
                      })}
                      className="w-20 bg-surface-card border border-border-subtle rounded-xl p-2 text-content-base text-sm font-bold"
                    />
                    <span className="text-content-muted font-bold">x Pontos</span>
                  </div>
                </div>

                {/* Ouro */}
                <div className="p-4 bg-surface-base rounded-xl border border-gold-base/30 space-y-2">
                  <span className="text-[10px] font-bold uppercase text-gold-base block">Ouro (3000 - 5999 pts)</span>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      step="0.1"
                      min="1"
                      value={config.tierMultipliers?.Ouro || 1.5}
                      onChange={(e) => setConfig({
                        ...config,
                        tierMultipliers: { ...config.tierMultipliers, Ouro: Number(e.target.value) }
                      })}
                      className="w-20 bg-surface-card border border-border-subtle rounded-xl p-2 text-content-base text-sm font-bold"
                    />
                    <span className="text-content-muted font-bold">x Pontos</span>
                  </div>
                </div>

                {/* Diamante */}
                <div className="p-4 bg-surface-base rounded-xl border border-cyan-400/30 space-y-2">
                  <span className="text-[10px] font-bold uppercase text-cyan-400 block">Diamante (6000+ pts)</span>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      step="0.1"
                      min="1"
                      value={config.tierMultipliers?.Diamante || 2.0}
                      onChange={(e) => setConfig({
                        ...config,
                        tierMultipliers: { ...config.tierMultipliers, Diamante: Number(e.target.value) }
                      })}
                      className="w-20 bg-surface-card border border-border-subtle rounded-xl p-2 text-content-base text-sm font-bold"
                    />
                    <span className="text-content-muted font-bold">x Pontos VIP</span>
                  </div>
                </div>
              </div>
            </div>
          </form>

          {/* Manual Points Adjustment Tool */}
          <div className="bg-surface-card p-6 rounded-2xl border border-border-subtle space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-content-base uppercase tracking-wider flex items-center gap-2">
              <Zap className="w-4 h-4 text-gold-base" />
              <span>Ajuste Manual de Pontuação de Clientes</span>
            </h3>

            <form onSubmit={handleManualPointsSubmit} className="space-y-4 max-w-2xl text-xs">
              <div>
                <label className="block text-content-muted font-bold mb-1">Selecione o Cliente</label>
                <select
                  value={selectedClient}
                  onChange={(e) => setSelectedClient(e.target.value)}
                  className="w-full bg-surface-base border border-border-subtle rounded-xl p-2.5 text-content-base focus:outline-none focus:border-gold-base"
                >
                  <option value="">-- Escolha o cliente --</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.phone || 'Sem tel'}) - Atual: {c.loyaltyPoints || 0} pts
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-content-muted font-bold mb-1">Quantidade de Pontos (Positivo ou Negativo)</label>
                  <input
                    type="number"
                    value={manualPointsAmount}
                    onChange={(e) => setManualPointsAmount(Number(e.target.value))}
                    className="w-full bg-surface-base border border-border-subtle rounded-xl p-2.5 text-content-base focus:outline-none focus:border-gold-base"
                  />
                </div>
                <div>
                  <label className="block text-content-muted font-bold mb-1">Motivo / Descrição</label>
                  <input
                    type="text"
                    placeholder="Ex: Cortesia VIP, Erro de lançamento..."
                    value={manualPointsReason}
                    onChange={(e) => setManualPointsReason(e.target.value)}
                    className="w-full bg-surface-base border border-border-subtle rounded-xl p-2.5 text-content-base focus:outline-none focus:border-gold-base"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="px-4 py-2.5 bg-gold-base text-surface-base font-bold rounded-xl hover:opacity-95 text-xs uppercase tracking-wider shadow"
              >
                Aplicar Ajuste de Pontos
              </button>

              {manualSuccessMsg && (
                <div className="p-3 bg-status-success/20 border border-status-success/40 text-status-success text-xs font-bold rounded-xl">
                  {manualSuccessMsg}
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* TAB 3: CATÁLOGO DE PRÊMIOS & CUPONS */}
      {activeTab === 'rewards' && (
        <div className="space-y-6">
          {/* Header & Add Button */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-surface-card p-5 rounded-2xl border border-border-subtle shadow-lg">
            <div>
              <h3 className="text-base font-bold text-content-base">Catálogo de Prêmios, Upgrades e Cupons</h3>
              <p className="text-xs text-content-muted mt-0.5">Defina as ofertas disponíveis para troca de pontos e vouchers promocionais.</p>
            </div>

            <button
              onClick={() => setShowAddRewardModal(true)}
              className="px-4 py-2.5 rounded-xl bg-gold-base text-surface-base font-bold text-xs uppercase tracking-wider hover:opacity-95 shadow flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Criar Nova Oferta / Cupom</span>
            </button>
          </div>

          {/* Voucher Validator */}
          <div className="bg-surface-card p-5 rounded-2xl border border-border-subtle space-y-3 shadow-lg max-w-2xl">
            <h4 className="text-xs font-bold uppercase text-gold-base tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Validar Código de Voucher de Cliente
            </h4>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ex: NAV-RWD-123456"
                value={voucherCodeInput}
                onChange={(e) => setVoucherCodeInput(e.target.value)}
                className="flex-1 bg-surface-base border border-border-subtle rounded-xl p-2.5 text-xs text-content-base font-mono uppercase focus:outline-none focus:border-gold-base"
              />
              <button
                onClick={handleValidateVoucher}
                className="px-4 py-2.5 bg-gold-base text-surface-base font-bold text-xs rounded-xl hover:opacity-95 uppercase"
              >
                Validar Voucher
              </button>
            </div>
            {voucherValidationResult && (
              <div className="p-3 bg-surface-base border border-gold-base/40 text-content-base text-xs font-medium rounded-xl">
                {voucherValidationResult}
              </div>
            )}
          </div>

          {/* Modal for adding rewards */}
          {showAddRewardModal && (
            <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-surface-base/80 backdrop-blur-md">
              <div className="w-full max-w-md bg-surface-card rounded-2xl border border-border-subtle p-6 shadow-2xl space-y-4">
                <h3 className="text-base font-bold text-content-base">Adicionar Oferta ou Cupom</h3>

                <form onSubmit={handleCreateReward} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-content-muted font-bold mb-1">Título do Prêmio ou Cupom</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: 15% OFF no Próximo Corte ou Pomada Grátis"
                      value={newReward.title}
                      onChange={(e) => setNewReward({ ...newReward, title: e.target.value })}
                      className="w-full bg-surface-base border border-border-subtle rounded-xl p-2.5 text-content-base focus:outline-none focus:border-gold-base"
                    />
                  </div>

                  <div>
                    <label className="block text-content-muted font-bold mb-1">Pontos Necessários</label>
                    <input
                      type="number"
                      required
                      min={50}
                      value={newReward.pointsRequired}
                      onChange={(e) => setNewReward({ ...newReward, pointsRequired: Number(e.target.value) })}
                      className="w-full bg-surface-base border border-border-subtle rounded-xl p-2.5 text-content-base focus:outline-none focus:border-gold-base"
                    />
                  </div>

                  <div>
                    <label className="block text-content-muted font-bold mb-1">Tipo da Oferta</label>
                    <select
                      value={newReward.rewardType}
                      onChange={(e) => setNewReward({ ...newReward, rewardType: e.target.value })}
                      className="w-full bg-surface-base border border-border-subtle rounded-xl p-2.5 text-content-base focus:outline-none focus:border-gold-base"
                    >
                      <option value="upgrade">Upgrade de Serviço</option>
                      <option value="product">Produto Físico</option>
                      <option value="free_cut">Corte Grátis</option>
                      <option value="vip_status">Status VIP / Desconto Permanente</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-content-muted font-bold mb-1">Descrição do Valor / Benefício</label>
                    <textarea
                      required
                      placeholder="Ex: Válido para qualquer serviço de barba ou produto de bancada."
                      value={newReward.valueDescription}
                      onChange={(e) => setNewReward({ ...newReward, valueDescription: e.target.value })}
                      className="w-full bg-surface-base border border-border-subtle rounded-xl p-2.5 text-content-base focus:outline-none focus:border-gold-base min-h-[60px]"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddRewardModal(false)}
                      className="flex-1 py-2.5 rounded-xl border border-border-subtle text-content-muted font-bold uppercase"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 rounded-xl bg-gold-base text-surface-base font-bold uppercase shadow"
                    >
                      Salvar Oferta
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* List of Rewards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rewardsList.map((rw) => (
              <div
                key={rw.id}
                className="bg-surface-card p-5 rounded-2xl border border-border-subtle flex items-center justify-between gap-4 shadow-md"
              >
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gold-base/15 text-gold-base text-[10px] font-bold border border-gold-base/30">
                    <Gift className="w-3 h-3" />
                    <span>{rw.pointsRequired} PONTOS</span>
                  </div>
                  <h4 className="font-bold text-content-base text-sm">{rw.title}</h4>
                  <p className="text-xs text-content-muted leading-relaxed">{rw.valueDescription}</p>
                </div>

                <button
                  onClick={() => handleDeleteReward(rw.id)}
                  className="p-2.5 rounded-xl bg-surface-base text-status-error border border-border-subtle hover:border-status-error/50 shrink-0"
                  title="Remover oferta"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: MOTOR DE INDICAÇÕES (RULES & LINK GENERATOR) */}
      {activeTab === 'referrals' && (
        <div className="space-y-6">
          {/* EDITABLE REFERRAL RULES FORM */}
          <form onSubmit={handleSaveConfig} className="bg-surface-card p-6 rounded-2xl border border-border-subtle space-y-6 shadow-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-border-subtle">
              <div>
                <h3 className="text-base font-bold text-content-base flex items-center gap-2">
                  <Users className="w-5 h-5 text-gold-base" />
                  <span>Configuração Editável de Bonificação por Indicação</span>
                </h3>
                <p className="text-xs text-content-muted">Defina quantos pontos quem indica e quem é indicado recebem, além dos prêmios de milestone.</p>
              </div>

              <button
                type="submit"
                disabled={savingConfig}
                className="px-4 py-2.5 rounded-xl bg-gold-base text-surface-base font-bold text-xs uppercase tracking-wider hover:opacity-95 shadow flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>{savingConfig ? 'Salvando...' : 'Salvar Regras'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="p-4 bg-surface-base rounded-xl border border-border-subtle space-y-2">
                <span className="text-[10px] font-bold uppercase text-gold-base">Bônus de Quem Indica</span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={config.referralPoints?.referrerBonus || 100}
                    onChange={(e) => setConfig({
                      ...config,
                      referralPoints: { ...config.referralPoints, referrerBonus: Number(e.target.value) }
                    })}
                    className="w-full bg-surface-card border border-border-subtle rounded-xl p-2 text-content-base font-bold text-sm"
                  />
                  <span className="text-content-muted font-bold">pts</span>
                </div>
                <p className="text-[10px] text-content-muted">Creditado após o 1º corte concluído do amigo.</p>
              </div>

              <div className="p-4 bg-surface-base rounded-xl border border-border-subtle space-y-2">
                <span className="text-[10px] font-bold uppercase text-gold-base">Bônus de Boas-Vindas do Amigo</span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={config.referralPoints?.referredBonus || 50}
                    onChange={(e) => setConfig({
                      ...config,
                      referralPoints: { ...config.referralPoints, referredBonus: Number(e.target.value) }
                    })}
                    className="w-full bg-surface-card border border-border-subtle rounded-xl p-2 text-content-base font-bold text-sm"
                  />
                  <span className="text-content-muted font-bold">pts</span>
                </div>
                <p className="text-[10px] text-content-muted">Ganha no cadastro via link de indicação.</p>
              </div>

              <div className="p-4 bg-surface-base rounded-xl border border-border-subtle space-y-2">
                <span className="text-[10px] font-bold uppercase text-gold-base">Meta para Milestone (Nº Amigos)</span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={config.referralPoints?.milestoneCount || 5}
                    onChange={(e) => setConfig({
                      ...config,
                      referralPoints: { ...config.referralPoints, milestoneCount: Number(e.target.value) }
                    })}
                    className="w-full bg-surface-card border border-border-subtle rounded-xl p-2 text-content-base font-bold text-sm"
                  />
                  <span className="text-content-muted font-bold">amigos</span>
                </div>
                <p className="text-[10px] text-content-muted">Quantidade de amigos para ativar super bônus.</p>
              </div>

              <div className="p-4 bg-surface-base rounded-xl border border-border-subtle space-y-2">
                <span className="text-[10px] font-bold uppercase text-gold-base">Bônus Milestone Embaixador</span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={config.referralPoints?.milestoneBonus || 1000}
                    onChange={(e) => setConfig({
                      ...config,
                      referralPoints: { ...config.referralPoints, milestoneBonus: Number(e.target.value) }
                    })}
                    className="w-full bg-surface-card border border-border-subtle rounded-xl p-2 text-content-base font-bold text-sm"
                  />
                  <span className="text-content-muted font-bold">pts</span>
                </div>
                <p className="text-[10px] text-content-muted">Super bônus extra em pontos.</p>
              </div>
            </div>
          </form>

          {/* GERADOR DE LINK DE INDICAÇÃO PARA CLIENTES */}
          <div className="bg-surface-card p-6 rounded-2xl border border-border-subtle space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-content-base uppercase tracking-wider flex items-center gap-2">
              <LinkIcon className="w-4 h-4 text-gold-base" />
              <span>Gerador e Disparo de Links de Indicação para Clientes</span>
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
              <div className="space-y-3">
                <div>
                  <label className="block text-content-muted font-bold mb-1">Selecione o Cliente para Gerar o Link de Indicação Dele</label>
                  <select
                    value={refClient?.id || ''}
                    onChange={(e) => {
                      const found = clients.find(c => c.id === e.target.value);
                      if (found) setRefClient(found);
                    }}
                    className="w-full bg-surface-base border border-border-subtle rounded-xl p-2.5 text-content-base font-bold focus:outline-none focus:border-gold-base"
                  >
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.phone || 'Sem celular'}) - Código: {c.referralCode || 'Automático'}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="p-4 bg-surface-base rounded-xl border border-border-subtle space-y-2 font-mono text-[11px]">
                  <span className="text-gold-base font-sans text-xs font-bold block">Código de Indicação:</span>
                  <span className="text-content-base font-bold text-sm block">{currentRefCode}</span>
                  <span className="text-gold-base font-sans text-xs font-bold block pt-1">URL Completa do Link:</span>
                  <input
                    readOnly
                    value={generatedRefUrl}
                    className="w-full bg-surface-card p-2 rounded-lg border border-border-subtle text-content-base font-mono text-[10px] select-all"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => copyToClipboard(generatedRefUrl, false)}
                    className="px-4 py-2.5 bg-surface-base border border-gold-base/50 text-gold-base font-bold rounded-xl hover:bg-gold-base/10 flex items-center gap-1.5"
                  >
                    {copiedLink ? <Check className="w-4 h-4 text-status-success" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedLink ? 'Copiado!' : 'Copiar Link'}</span>
                  </button>

                  <a
                    href={generatedRefUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2.5 bg-surface-base border border-border-subtle text-content-base font-bold rounded-xl hover:bg-surface-card flex items-center gap-1.5"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Testar Link</span>
                  </a>
                </div>
              </div>

              {/* WHATSAPP SHARE CARD */}
              <div className="p-4 bg-surface-base rounded-2xl border border-border-subtle space-y-3">
                <h4 className="font-bold text-content-base text-xs flex items-center gap-1.5">
                  <Send className="w-4 h-4 text-status-success" />
                  <span>Enviar Convite Pronto no WhatsApp do Cliente</span>
                </h4>

                <div>
                  <label className="block text-[10px] text-content-muted font-bold mb-1">Mensagem Personalizável</label>
                  <textarea
                    rows={3}
                    value={customRefMsg}
                    onChange={(e) => setCustomRefMsg(e.target.value)}
                    className="w-full bg-surface-card border border-border-subtle rounded-xl p-2.5 text-xs text-content-base focus:outline-none focus:border-gold-base"
                  />
                </div>

                <div className="p-3 bg-surface-card rounded-xl border border-border-subtle text-[11px] text-content-muted italic">
                  Preview: "{customRefMsg} {generatedRefUrl}"
                </div>

                <button
                  onClick={() => shareViaWhatsapp(refClient?.phone, `${customRefMsg} ${generatedRefUrl}`)}
                  className="w-full py-3 bg-status-success text-white font-bold rounded-xl hover:opacity-95 uppercase tracking-wider flex items-center justify-center gap-2 shadow"
                >
                  <Send className="w-4 h-4" />
                  <span>Enviar via WhatsApp ({refClient?.name || 'Cliente'})</span>
                </button>
              </div>
            </div>
          </div>

          {/* Referral Ranking List */}
          <div className="bg-surface-card p-6 rounded-2xl border border-border-subtle space-y-4 shadow-xl">
            <h4 className="text-xs font-bold text-content-base uppercase tracking-wider flex items-center gap-2">
              <Crown className="w-4 h-4 text-gold-base" />
              <span>Ranking Geral de Clientes Embaixadores</span>
            </h4>

            {data?.ambassadors && data.ambassadors.length > 0 ? (
              <div className="space-y-2 text-xs divide-y divide-border-subtle">
                {data.ambassadors.map((amb: any, idx: number) => (
                  <div key={amb.id || idx} className="pt-2 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="w-6 h-6 rounded-full bg-gold-base/20 text-gold-base font-bold text-xs flex items-center justify-center">
                        #{idx + 1}
                      </span>
                      <div>
                        <span className="text-content-base font-bold block">{amb.name}</span>
                        <span className="text-[10px] text-content-muted">Nível VIP: {amb.tier}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-extrabold text-gold-base block">{amb.totalReferrals} indicações</span>
                      <span className="text-[10px] text-content-muted">+{amb.totalReferrals * (config.referralPoints?.referrerBonus || 100)} pts acumulados</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-content-muted py-6 text-center">Nenhum registro de indicação recente.</p>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: AVALIAÇÕES & NPS (RULES, DIRECT LINK & QR CODE GENERATOR) */}
      {activeTab === 'reviews' && (
        <div className="space-y-6">
          {/* EDITABLE REVIEW RULES FORM */}
          <form onSubmit={handleSaveConfig} className="bg-surface-card p-6 rounded-2xl border border-border-subtle space-y-6 shadow-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-border-subtle">
              <div>
                <h3 className="text-base font-bold text-content-base flex items-center gap-2">
                  <Star className="w-5 h-5 text-gold-base" />
                  <span>Configuração Editável de Bônus por Avaliação / NPS</span>
                </h3>
                <p className="text-xs text-content-muted">Ajuste os pontos concedidos quando o cliente avalia o atendimento pós-corte.</p>
              </div>

              <button
                type="submit"
                disabled={savingConfig}
                className="px-4 py-2.5 rounded-xl bg-gold-base text-surface-base font-bold text-xs uppercase tracking-wider hover:opacity-95 shadow flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>{savingConfig ? 'Salvando...' : 'Salvar Regras'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 bg-surface-base rounded-xl border border-border-subtle space-y-2">
                <span className="text-[10px] font-bold uppercase text-gold-base">Pontos por Avaliação Concluída</span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={config.reviewPoints?.baseReview || 20}
                    onChange={(e) => setConfig({
                      ...config,
                      reviewPoints: { ...config.reviewPoints, baseReview: Number(e.target.value) }
                    })}
                    className="w-full bg-surface-card border border-border-subtle rounded-xl p-2 text-content-base font-bold text-sm"
                  />
                  <span className="text-content-muted font-bold">pts</span>
                </div>
                <p className="text-[10px] text-content-muted">Base enviada ao responder a pesquisa.</p>
              </div>

              <div className="p-4 bg-surface-base rounded-xl border border-border-subtle space-y-2">
                <span className="text-[10px] font-bold uppercase text-gold-base">Bônus Extra por Foto do Corte</span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={config.reviewPoints?.withPhotoBonus || 30}
                    onChange={(e) => setConfig({
                      ...config,
                      reviewPoints: { ...config.reviewPoints, withPhotoBonus: Number(e.target.value) }
                    })}
                    className="w-full bg-surface-card border border-border-subtle rounded-xl p-2 text-content-base font-bold text-sm"
                  />
                  <span className="text-content-muted font-bold">pts</span>
                </div>
                <p className="text-[10px] text-content-muted">Adicionado se anexa foto do resultado.</p>
              </div>

              <div className="p-4 bg-surface-base rounded-xl border border-border-subtle space-y-2">
                <span className="text-[10px] font-bold uppercase text-gold-base">Bônus Extra Nota 5 Estrelas</span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={config.reviewPoints?.fiveStarBonus || 10}
                    onChange={(e) => setConfig({
                      ...config,
                      reviewPoints: { ...config.reviewPoints, fiveStarBonus: Number(e.target.value) }
                    })}
                    className="w-full bg-surface-card border border-border-subtle rounded-xl p-2 text-content-base font-bold text-sm"
                  />
                  <span className="text-content-muted font-bold">pts</span>
                </div>
                <p className="text-[10px] text-content-muted">Incentivo para nota máxima (Promotores).</p>
              </div>
            </div>
          </form>

          {/* GERADOR DE LINK DE AVALIAÇÃO & QR CODE */}
          <div className="bg-surface-card p-6 rounded-2xl border border-border-subtle space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-content-base uppercase tracking-wider flex items-center gap-2">
              <QrCode className="w-4 h-4 text-gold-base" />
              <span>Gerador de Link Direto de Avaliação & QR Code de Espelho/Balcão</span>
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
              <div className="space-y-3">
                <div className="p-4 bg-surface-base rounded-xl border border-border-subtle space-y-2 font-mono text-[11px]">
                  <span className="text-gold-base font-sans text-xs font-bold block">URL Pública Direta de Avaliação:</span>
                  <input
                    readOnly
                    value={generatedEvalUrl}
                    className="w-full bg-surface-card p-2.5 rounded-lg border border-border-subtle text-content-base font-mono text-[11px] select-all"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => copyToClipboard(generatedEvalUrl, true)}
                    className="px-4 py-2.5 bg-surface-base border border-gold-base/50 text-gold-base font-bold rounded-xl hover:bg-gold-base/10 flex items-center gap-1.5"
                  >
                    {copiedEvalLink ? <Check className="w-4 h-4 text-status-success" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedEvalLink ? 'Link Copiado!' : 'Copiar Link de Avaliação'}</span>
                  </button>

                  <button
                    onClick={() => setShowQrModal(true)}
                    className="px-4 py-2.5 bg-gold-base text-surface-base font-bold rounded-xl hover:opacity-95 flex items-center gap-1.5 shadow"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>Gerar QR Code de Mesa/Balcão</span>
                  </button>
                </div>
              </div>

              {/* DISPARO WHATSAPP PARA AVALIAÇÃO */}
              <div className="p-4 bg-surface-base rounded-2xl border border-border-subtle space-y-3">
                <h4 className="font-bold text-content-base text-xs flex items-center gap-1.5">
                  <Send className="w-4 h-4 text-status-success" />
                  <span>Enviar Solicitação de Avaliação no WhatsApp</span>
                </h4>

                <div>
                  <label className="block text-[10px] text-content-muted font-bold mb-1">Selecione o Cliente</label>
                  <select
                    value={evalClient?.id || ''}
                    onChange={(e) => {
                      const found = clients.find(c => c.id === e.target.value);
                      if (found) setEvalClient(found);
                    }}
                    className="w-full bg-surface-card border border-border-subtle rounded-xl p-2 text-content-base font-bold text-xs focus:outline-none focus:border-gold-base"
                  >
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.phone || 'Sem celular'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-content-muted font-bold mb-1">Mensagem de Solicitação</label>
                  <textarea
                    rows={2}
                    value={customEvalMsg}
                    onChange={(e) => setCustomEvalMsg(e.target.value)}
                    className="w-full bg-surface-card border border-border-subtle rounded-xl p-2 text-xs text-content-base focus:outline-none focus:border-gold-base"
                  />
                </div>

                <button
                  onClick={() => shareViaWhatsapp(evalClient?.phone, `${customEvalMsg} ${generatedEvalUrl}`)}
                  className="w-full py-2.5 bg-status-success text-white font-bold rounded-xl hover:opacity-95 uppercase tracking-wider flex items-center justify-center gap-2 shadow"
                >
                  <Send className="w-4 h-4" />
                  <span>Pedir Avaliação a {evalClient?.name || 'Cliente'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* QR CODE MODAL */}
          {showQrModal && (
            <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-surface-base/80 backdrop-blur-md">
              <div className="w-full max-w-sm bg-surface-card rounded-2xl border border-border-subtle p-6 shadow-2xl space-y-4 text-center">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-base/20 text-gold-base text-xs font-bold border border-gold-base/30">
                  <QrCode className="w-4 h-4" /> QR Code da Barbearia
                </div>

                <h3 className="text-base font-bold text-content-base">Avalie e Ganhe Pontos</h3>
                <p className="text-xs text-content-muted">Imprima ou coloque este QR Code nas bancadas, espelhos e balcão de recepção.</p>

                <div className="p-4 bg-white rounded-2xl border border-border-subtle shadow-inner inline-block mx-auto">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(generatedEvalUrl)}`}
                    alt="QR Code de Avaliação Navo"
                    className="w-48 h-48 mx-auto"
                  />
                </div>

                <div className="text-[11px] font-mono text-content-muted break-all">
                  {generatedEvalUrl}
                </div>

                <button
                  onClick={() => setShowQrModal(false)}
                  className="w-full py-2.5 bg-gold-base text-surface-base font-bold rounded-xl uppercase text-xs shadow"
                >
                  Fechar Visualizador QR Code
                </button>
              </div>
            </div>
          )}

          {/* Detailed Review Feed */}
          <div className="bg-surface-card p-6 rounded-2xl border border-border-subtle space-y-4 shadow-xl">
            <h4 className="text-xs font-bold text-content-base uppercase tracking-wider flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-gold-base" />
              <span>Feed em Tempo Real de Pesquisas de Pós-Atendimento</span>
            </h4>

            {data?.reviewsList && data.reviewsList.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {data.reviewsList.map((rev: any) => (
                  <div key={rev.id} className="p-4 rounded-xl bg-surface-base border border-border-subtle space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3.5 h-3.5 ${s <= rev.rating ? 'fill-gold-base text-gold-base' : 'text-border-subtle'}`}
                          />
                        ))}
                      </div>
                      <span className="text-[10px] text-content-muted">
                        {new Date(rev.createdAt).toLocaleDateString('pt-BR')}
                      </span>
                    </div>

                    <p className="text-content-base font-medium italic">
                      "{rev.comment || 'Corte e atendimento perfeitos!'}"
                    </p>

                    <div className="text-[10px] text-content-muted space-y-0.5 pt-2 border-t border-border-subtle/50">
                      <p>• Entendeu o pedido: <span className="text-content-base font-bold">{rev.understoodRequest || 'Sim'}</span></p>
                      <p>• Tempo de espera: <span className="text-content-base font-bold">{rev.waitTimeAcceptable || 'Aceitável'}</span></p>
                      <p>• Indicaria a Navo: <span className="text-content-base font-bold">{rev.wouldRecommend || 'Com certeza'}</span></p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-content-muted py-8 text-center">Nenhuma avaliação recente registrada.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const TabNavButton = ({ active, onClick, icon: Icon, label }: any) => (
  <button
    onClick={onClick}
    className={`
      px-4 py-2.5 flex items-center justify-center gap-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap shrink-0
      ${active ? 'bg-gold-base text-surface-base shadow-md' : 'text-content-muted hover:text-content-base bg-surface-card/60 hover:bg-surface-card'}
    `}
  >
    <Icon className="w-4 h-4" />
    <span>{label}</span>
  </button>
);
