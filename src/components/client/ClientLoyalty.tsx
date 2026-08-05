import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { LOYALTY_REWARDS } from '../../data/constants';
import { Award, Gift, Tag, Package, Check, Sparkles, TrendingUp, History } from 'lucide-react';

export const ClientLoyalty: React.FC<{ currentUser: any }> = ({ currentUser }) => {
  const [pointsBalance, setPointsBalance] = useState(currentUser?.loyalty_points || 0); // 480
  const [claimedRewards, setClaimedRewards] = useState<string[]>([]);

  const handleClaim = (rewardId: string, requiredPts: number, title: string) => {
    if (pointsBalance < requiredPts) return;

    setPointsBalance(prev => prev - requiredPts);
    setClaimedRewards(prev => [...prev, rewardId]);

    try {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#C9A96E', '#F2EFE7', '#121212', '#000000']
      });
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div className="space-y-6 pb-6 px-4">
      {/* Program Explanation Banner */}
      <div className="bg-surface-card/80 p-4 rounded-2xl border border-border-subtle backdrop-blur-md flex items-start gap-3 shadow-lg">
        <div className="w-10 h-10 rounded-xl bg-gold-base/10 border border-gold-base/30 text-gold-base flex items-center justify-center shrink-0">
          <Sparkles className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h4 className="text-xs font-serif text-content-base font-semibold uppercase tracking-wider">Como Funciona o Programa VIP</h4>
          <p className="text-xs text-content-muted leading-relaxed">
            A cada <strong className="text-gold-base">R$ 1,00</strong> gasto em serviços na barbearia, você ganha <strong className="text-gold-base">1 ponto</strong>. Acumule pontos e troque por descontos no checkout e cortes grátis!
          </p>
        </div>
      </div>

      {/* Points & Level Card */}
      <div className="bg-gradient-to-br from-surface-card via-surface-base to-surface-card p-5 rounded-2xl border border-gold-base/40 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] text-content-muted uppercase font-bold tracking-widest block">Nível Atual</span>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-black text-gold-base">{currentUser?.loyalty_tier || 'Bronze'}</span>
              <span className="px-2 py-0.5 rounded-full bg-gold-base/20 text-content-base text-[10px] font-bold border border-gold-base/30">
                VIP Tier 3
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-2xl font-serif text-content-base font-semibold block">{pointsBalance}</span>
            <span className="text-[10px] text-content-base font-bold uppercase">Pontos Acumulados</span>
          </div>
        </div>

        {/* Progress Bar to Next Level */}
        <div className="space-y-1.5 pt-2">
          <div className="flex justify-between text-[11px] text-content-muted">
            <span>Progresso para Nível Diamante</span>
            <span className="text-content-base font-bold">{pointsBalance} / 600 pts</span>
          </div>
          <div className="w-full h-2.5 bg-surface-base rounded-full overflow-hidden p-0.5 border border-border-subtle">
            <div
              className="h-full bg-gold-base text-surface-base rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (pointsBalance / 600) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Rewards Catalog */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-gold-hover uppercase tracking-wider flex items-center space-x-1.5">
          <Gift className="w-4 h-4 text-content-base" />
          <span>Resgatar Recompensas</span>
        </h3>

        <div className="space-y-3">
          {LOYALTY_REWARDS.map((reward) => {
            const isClaimed = claimedRewards.includes(reward.id);
            const canAfford = pointsBalance >= reward.points_required;

            return (
              <div
                key={reward.id}
                className="bg-border-subtle backdrop-blur-[10px] p-4 rounded-2xl border border-border-subtle flex items-center justify-between gap-3"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-xl bg-surface-card border border-border-subtle flex items-center justify-center text-content-base">
                    {reward.reward_type === 'discount' && <Tag className="w-6 h-6" />}
                    {reward.reward_type === 'free_product' && <Package className="w-6 h-6" />}
                    {reward.reward_type === 'free_service' && <Gift className="w-6 h-6" />}
                  </div>

                  <div>
                    <h4 className="font-bold text-content-base text-xs">{reward.title}</h4>
                    <span className="text-[10px] text-content-muted block mt-0.5">{reward.value_description}</span>
                    <span className="text-[11px] font-extrabold text-content-base block mt-1">
                      {reward.points_required} PONTOS
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleClaim(reward.id, reward.points_required, reward.title)}
                  disabled={isClaimed || !canAfford}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
                    isClaimed
                      ? 'bg-status-success/20 text-status-success border border-status-success/40 cursor-default'
                      : canAfford
                      ? 'bg-gold-base text-surface-base hover:opacity-95 shadow-md'
                      : 'bg-surface-card text-content-muted cursor-not-allowed'
                  }`}
                >
                  {isClaimed ? '✓ Resgatado' : canAfford ? 'Resgatar' : 'Pontos Insuficientes'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Points History */}
      <div className="bg-border-subtle backdrop-blur-[10px] p-4 rounded-2xl border border-border-subtle space-y-3">
        <h4 className="text-xs font-bold text-gold-hover uppercase tracking-wider flex items-center space-x-1.5">
          <History className="w-4 h-4 text-content-base" />
          <span>Histórico de Extrato</span>
        </h4>

        <div className="space-y-2 text-xs">
          <div className="flex justify-between items-center py-2 border-b border-border-subtle">
            <div>
              <span className="text-content-base font-semibold block">Combo Executivo Concluído</span>
              <span className="text-[10px] text-content-muted">28/07/2026 • BarberX Jardins</span>
            </div>
            <span className="text-status-success font-bold">+95 pts</span>
          </div>

          <div className="flex justify-between items-center py-2 border-b border-border-subtle">
            <div>
              <span className="text-content-base font-semibold block">Barboterapia Terapêutica</span>
              <span className="text-[10px] text-content-muted">14/07/2026 • BarberX Jardins</span>
            </div>
            <span className="text-status-success font-bold">+50 pts</span>
          </div>

          <div className="flex justify-between items-center py-2">
            <div>
              <span className="text-content-base font-semibold block">Bônus de Aniversário</span>
              <span className="text-[10px] text-content-muted">01/07/2026 • Sistema</span>
            </div>
            <span className="text-status-success font-bold">+100 pts</span>
          </div>
        </div>
      </div>
    </div>
  );
};
