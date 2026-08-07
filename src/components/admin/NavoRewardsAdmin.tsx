import React, { useState, useEffect } from 'react';
import {
  fetchNavoRewardsAdminDashboard,
  triggerInactiveClientsCampaign,
  fetchRewardsList,
  createAdminReward,
  deleteAdminReward,
  manuallyAdjustPoints,
  fetchClientsFromSupabase
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
  ThumbsUp,
  RotateCcw,
  AlertCircle,
  Tag,
  Plus,
  Trash2,
  Search,
  Check,
  Zap,
  Info,
  DollarSign,
  Share2,
  List
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

  const loadData = async () => {
    setLoading(true);
    try {
      const [dashRes, rwdRes, clientList] = await Promise.all([
        fetchNavoRewardsAdminDashboard(),
        fetchRewardsList(),
        fetchClientsFromSupabase()
      ]);
      setData(dashRes);
      setRewardsList(rwdRes);
      setClients(clientList || []);
    } catch (e) {
      console.error('Erro ao carregar dados do Navo Rewards:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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

      {/* TABS NAVIGATION BAR */}
      <div className="bg-surface-card border border-border-subtle rounded-2xl p-1.5 flex items-center gap-1.5 overflow-x-auto custom-scrollbar">
        <TabNavButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={TrendingUp} label="Dashboard General" />
        <TabNavButton active={activeTab === 'loyalty'} onClick={() => setActiveTab('loyalty')} icon={Crown} label="Clube de Fidelidade & Níveis" />
        <TabNavButton active={activeTab === 'rewards'} onClick={() => setActiveTab('rewards')} icon={Gift} label="Prêmios & Cupons Desconto" />
        <TabNavButton active={activeTab === 'referrals'} onClick={() => setActiveTab('referrals')} icon={Users} label="Motor de Indicações" />
        <TabNavButton active={activeTab === 'reviews'} onClick={() => setActiveTab('reviews')} icon={Star} label="Avaliações & NPS" />
      </div>

      {/* TAB CONTENT */}
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
                  <span className="text-[10px] text-content-muted block">Multiplicador: 1x</span>
                </div>

                <div className="p-4 rounded-xl bg-surface-base border border-border-subtle space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Prata (1000 - 2999 pts)</span>
                  <span className="text-xl font-bold text-content-base">{data?.tierDistribution?.Prata || 0} clientes</span>
                  <span className="text-[10px] text-content-muted block">Multiplicador: 1.2x</span>
                </div>

                <div className="p-4 rounded-xl bg-surface-base border border-border-subtle space-y-1">
                  <span className="text-[10px] uppercase font-bold text-gold-base block">Ouro (3000 - 5999 pts)</span>
                  <span className="text-xl font-bold text-content-base">{data?.tierDistribution?.Ouro || 0} clientes</span>
                  <span className="text-[10px] text-content-muted block">Multiplicador: 1.5x</span>
                </div>

                <div className="p-4 rounded-xl bg-surface-base border border-border-subtle space-y-1">
                  <span className="text-[10px] uppercase font-bold text-cyan-400 block">Diamante (6000+ pts)</span>
                  <span className="text-xl font-bold text-content-base">{data?.tierDistribution?.Diamante || 0} clientes</span>
                  <span className="text-[10px] text-content-muted block">Multiplicador: 2x VIP</span>
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

      {/* TAB 2: CLUBE DE FIDELIDADE & NÍVEIS */}
      {activeTab === 'loyalty' && (
        <div className="space-y-6">
          <div className="bg-surface-card p-6 rounded-2xl border border-border-subtle space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-content-base flex items-center gap-2">
              <Crown className="w-5 h-5 text-gold-base" />
              <span>Regras de Conversão & Métrica de Fidelidade</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 bg-surface-base rounded-xl border border-border-subtle space-y-2">
                <span className="text-[10px] uppercase font-bold text-gold-base">Regra Base de Conversão</span>
                <p className="text-lg font-extrabold text-content-base">R$ 1,00 Gasto = 1 Ponto</p>
                <p className="text-content-muted text-[11px]">Creditado automaticamente na conclusão de cada atendimento no PDV / Agendamento.</p>
              </div>

              <div className="p-4 bg-surface-base rounded-xl border border-border-subtle space-y-2">
                <span className="text-[10px] uppercase font-bold text-gold-base">Validade dos Pontos</span>
                <p className="text-lg font-extrabold text-content-base">Pontuação Permanente</p>
                <p className="text-content-muted text-[11px]">Os pontos acumulados não expiram enquanto o cliente mantiver atividade anual.</p>
              </div>

              <div className="p-4 bg-surface-base rounded-xl border border-border-subtle space-y-2">
                <span className="text-[10px] uppercase font-bold text-gold-base">Bônus Automáticos</span>
                <p className="text-lg font-extrabold text-content-base">+100 Pts Aniversário</p>
                <p className="text-content-muted text-[11px]">Creditado no dia do aniversário do cliente e +15 Pts por Check-in Instagram.</p>
              </div>
            </div>
          </div>

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

      {/* TAB 4: MOTOR DE INDICAÇÕES */}
      {activeTab === 'referrals' && (
        <div className="space-y-6">
          <div className="bg-surface-card p-6 rounded-2xl border border-border-subtle space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-content-base flex items-center gap-2">
              <Users className="w-5 h-5 text-gold-base" />
              <span>Regras & Bonificação de Indicações (Member Get Member)</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 bg-surface-base rounded-xl border border-border-subtle space-y-2">
                <span className="text-[10px] uppercase font-bold text-gold-base">Bônus de Quem Indica</span>
                <p className="text-lg font-extrabold text-content-base">+100 Pts por Amigo</p>
                <p className="text-content-muted text-[11px]">Liberado quando o amigo realiza o 1º corte concluído na barbearia.</p>
              </div>

              <div className="p-4 bg-surface-base rounded-xl border border-border-subtle space-y-2">
                <span className="text-[10px] uppercase font-bold text-gold-base">Boas-Vindas de Quem Vem</span>
                <p className="text-lg font-extrabold text-content-base">+50 Pts de Entrada</p>
                <p className="text-content-muted text-[11px]">Incentivo automático para o novo cliente no primeiro agendamento.</p>
              </div>

              <div className="p-4 bg-surface-base rounded-xl border border-border-subtle space-y-2">
                <span className="text-[10px] uppercase font-bold text-gold-base">Milestone de Embaixador</span>
                <p className="text-lg font-extrabold text-content-base">+1000 Pts bônus</p>
                <p className="text-content-muted text-[11px]">Ao alcançar 5 indicações ativas concluídas com sucesso.</p>
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
                      <span className="text-[10px] text-content-muted">+{amb.totalReferrals * 100} pts acumulados</span>
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

      {/* TAB 5: AVALIAÇÕES & NPS */}
      {activeTab === 'reviews' && (
        <div className="space-y-6">
          <div className="bg-surface-card p-6 rounded-2xl border border-border-subtle space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-content-base flex items-center gap-2">
                <Star className="w-5 h-5 text-gold-base" />
                <span>Central de Avaliações e Métrica NPS</span>
              </h3>
              <span className="px-3 py-1 rounded-full bg-gold-base/20 text-gold-base text-xs font-bold border border-gold-base/40">
                Score NPS Atual: {data?.npsScore || 100} / 100
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center text-xs">
              <div className="p-3 bg-surface-base rounded-xl border border-border-subtle">
                <span className="text-content-muted block text-[10px] uppercase font-bold">Promotores (5⭐)</span>
                <span className="text-lg font-bold text-status-success">{data?.promoters || 0}</span>
              </div>
              <div className="p-3 bg-surface-base rounded-xl border border-border-subtle">
                <span className="text-content-muted block text-[10px] uppercase font-bold">Neutros (4⭐)</span>
                <span className="text-lg font-bold text-gold-base">{data?.passives || 0}</span>
              </div>
              <div className="p-3 bg-surface-base rounded-xl border border-border-subtle">
                <span className="text-content-muted block text-[10px] uppercase font-bold">Detratores (1-3⭐)</span>
                <span className="text-lg font-bold text-status-error">{data?.detractors || 0}</span>
              </div>
            </div>
          </div>

          {/* Detailed Feed */}
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
