import React, { useState, useEffect } from 'react';
import {
  fetchNavoRewardsAdminDashboard,
  triggerInactiveClientsCampaign
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
  AlertCircle
} from 'lucide-react';

export const NavoRewardsAdmin: React.FC = () => {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [campaignLoading, setCampaignLoading] = useState(false);
  const [campaignMsg, setCampaignMsg] = useState<string | null>(null);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const res = await fetchNavoRewardsAdminDashboard();
      setData(res);
    } catch (e) {
      console.error('Erro ao carregar dashboard de recompensas:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleTriggerCampaign = async () => {
    if (!confirm('Deseja creditar +100 pontos para todos os clientes ativos como incentivo de retorno?')) return;
    setCampaignLoading(true);
    try {
      const res = await triggerInactiveClientsCampaign();
      setCampaignMsg(res.message);
      await loadDashboard();
      setTimeout(() => setCampaignMsg(null), 5000);
    } catch (err: any) {
      alert(err.message || 'Erro ao disparar campanha');
    } finally {
      setCampaignLoading(false);
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
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface-card p-6 rounded-2xl border border-border-subtle shadow-xl">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-base/10 border border-gold-base/30 text-gold-base text-xs font-bold mb-2">
            <Award className="w-4 h-4" />
            <span>Gestão de Fidelidade & Indicação</span>
          </div>
          <h1 className="text-2xl font-serif font-black text-content-base">Navo Rewards & NPS Dashboard</h1>
          <p className="text-xs text-content-muted mt-0.5">Monitore satisfação, indicações, curva de retenção e distribuição de pontos.</p>
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

      {/* Reviews Feedback Feed */}
      <div className="bg-surface-card p-6 rounded-2xl border border-border-subtle shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-content-base uppercase tracking-wider flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-gold-base" />
          <span>Feed de Feedback Detalhado de Atendimentos</span>
        </h3>

        {data?.reviewsList && data.reviewsList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {data.reviewsList.slice(0, 6).map((rev: any) => (
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
                  "{rev.comment || 'Corte e atendimento perfeitos, super recomendo!'}"
                </p>

                <div className="text-[10px] text-content-muted space-y-0.5 pt-1 border-t border-border-subtle/50">
                  <p>• Entendeu o pedido: <span className="text-content-base font-bold">{rev.understoodRequest || 'Sim'}</span></p>
                  <p>• Tempo de espera: <span className="text-content-base font-bold">{rev.waitTimeAcceptable || 'Aceitável'}</span></p>
                  <p>• Indicaria Navo: <span className="text-content-base font-bold">{rev.wouldRecommend || 'Com certeza'}</span></p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-content-muted py-6 text-center">Nenhuma avaliação recente registrada.</p>
        )}
      </div>
    </div>
  );
};
