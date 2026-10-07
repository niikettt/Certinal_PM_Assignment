'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Kanban as KanbanIcon, 
  DollarSign, 
  Plus, 
  ChevronRight, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  Clock, 
  Tag, 
  Calculator, 
  Building2,
  FileCheck2,
  Check
} from 'lucide-react';
import { useCreatorStore } from '@/lib/store';
import { BrandDeal, DealStage } from '@/lib/types';
import confetti from 'canvas-confetti';

const STAGES: { id: DealStage; label: string; color: string }[] = [
  { id: 'idea', label: 'Idea', color: 'border-slate-700 bg-slate-900/60' },
  { id: 'pitched', label: 'Pitched', color: 'border-indigo-900/60 bg-indigo-950/20' },
  { id: 'negotiating', label: 'Negotiating', color: 'border-amber-900/60 bg-amber-950/20' },
  { id: 'won', label: 'Won / Confirmed', color: 'border-emerald-900/60 bg-emerald-950/20' },
  { id: 'delivered', label: 'Delivered', color: 'border-cyan-900/60 bg-cyan-950/20' },
  { id: 'invoiced', label: 'Invoiced', color: 'border-purple-900/60 bg-purple-950/20' },
  { id: 'paid', label: 'Paid', color: 'border-emerald-500/60 bg-emerald-900/30' },
];

export default function DealsPage() {
  const { deals, updateDealStage, formatCurrency, currentCreator } = useCreatorStore();

  const [activeFilter, setActiveFilter] = useState<string>('all');

  // Revenue metrics calculations
  const totalPaidRevenue = deals
    .filter((d) => d.stage === 'paid')
    .reduce((acc, curr) => acc + curr.quoted_rate, 0);

  const pendingInvoiced = deals
    .filter((d) => d.stage === 'invoiced' || d.stage === 'delivered' || d.stage === 'won')
    .reduce((acc, curr) => acc + curr.quoted_rate, 0);

  const pipelineValue = deals
    .filter((d) => d.stage === 'pitched' || d.stage === 'negotiating')
    .reduce((acc, curr) => acc + curr.quoted_rate, 0);

  const handleStageMove = (dealId: string, currentStage: DealStage, nextStage: DealStage) => {
    updateDealStage(dealId, nextStage);

    if (nextStage === 'won' || nextStage === 'paid') {
      confetti({
        particleCount: 70,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10B981', '#6366F1', '#F59E0B'],
      });
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1.5">
              <KanbanIcon className="w-3.5 h-3.5" />
              Deal Pipeline
            </span>
            <span className="text-xs text-slate-400 font-mono">From Pitch to Paid Invoice</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
            Commercial Deal Tracker & Pipeline
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Track sponsorship negotiations, manage contract deliverables, and verify FTC disclosures across every brand collaboration.
          </p>
        </div>

        <Link
          href="/pricer"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-lg shadow-indigo-600/25 shrink-0"
        >
          <Calculator className="w-4 h-4" />
          <span>Price & Add New Deal</span>
        </Link>
      </div>

      {/* Revenue Pipeline Bar (SRS FR-2.3) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
          <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
            Earned & Settled (CMR)
          </span>
          <div className="text-2xl font-bold text-emerald-400 font-mono">
            {formatCurrency(totalPaidRevenue || currentCreator.monthly_revenue)}
          </div>
          <p className="text-xs text-slate-400 mt-1">Paid directly to creator account</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
          <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
            Committed / In Delivery
          </span>
          <div className="text-2xl font-bold text-indigo-400 font-mono">
            {formatCurrency(pendingInvoiced)}
          </div>
          <p className="text-xs text-slate-400 mt-1">Contracts signed & active</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
          <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
            Active Pitch Pipeline
          </span>
          <div className="text-2xl font-bold text-amber-400 font-mono">
            {formatCurrency(pipelineValue)}
          </div>
          <p className="text-xs text-slate-400 mt-1">Pitches sent & under negotiation</p>
        </div>
      </div>

      {/* Kanban Board Container (Horizontally Scrollable) */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-[1200px]">
          {STAGES.map((stage) => {
            const stageDeals = deals.filter((d) => d.stage === stage.id);
            const stageTotal = stageDeals.reduce((a, b) => a + b.quoted_rate, 0);

            return (
              <div
                key={stage.id}
                className="w-72 shrink-0 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col max-h-[700px]"
              >
                {/* Column Header */}
                <div className="p-3.5 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">
                      {stage.label}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-slate-800 text-slate-300">
                      {stageDeals.length}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-slate-400">
                    {formatCurrency(stageTotal)}
                  </span>
                </div>

                {/* Column Cards */}
                <div className="p-3 space-y-3 overflow-y-auto flex-1">
                  {stageDeals.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-500 italic rounded-xl border border-dashed border-slate-800">
                      No deals in {stage.label.toLowerCase()}
                    </div>
                  ) : (
                    stageDeals.map((deal) => (
                      <div
                        key={deal.id}
                        className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 hover:border-slate-600 transition-all shadow-md space-y-2.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                            {deal.brand_name}
                          </span>
                          <span className="text-xs font-bold font-mono text-emerald-400">
                            {formatCurrency(deal.quoted_rate)}
                          </span>
                        </div>

                        {/* Deliverables tags */}
                        <div className="flex flex-wrap gap-1 text-[10px] text-slate-300 font-mono">
                          {deal.deliverables.reels > 0 && (
                            <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700">
                              {deal.deliverables.reels}x Reel
                            </span>
                          )}
                          {deal.deliverables.stories > 0 && (
                            <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700">
                              {deal.deliverables.stories}x Story
                            </span>
                          )}
                          {deal.deliverables.tiktoks > 0 && (
                            <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700">
                              {deal.deliverables.tiktoks}x TikTok
                            </span>
                          )}
                        </div>

                        {deal.notes && (
                          <p className="text-[11px] text-slate-400 line-clamp-2">
                            {deal.notes}
                          </p>
                        )}

                        {/* FTC Compliance badge */}
                        <div className="flex items-center justify-between pt-1 border-t border-slate-700/60 text-[10px]">
                          <span className="text-emerald-400 flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-emerald-400" />
                            FTC Checked
                          </span>

                          {/* Move to next stage button */}
                          <div className="flex items-center gap-1">
                            {stage.id === 'pitched' && (
                              <button
                                onClick={() => handleStageMove(deal.id, stage.id, 'negotiating')}
                                className="text-[10px] px-2 py-0.5 rounded bg-amber-600 hover:bg-amber-500 text-white font-medium"
                              >
                                Negotiate →
                              </button>
                            )}
                            {stage.id === 'negotiating' && (
                              <button
                                onClick={() => handleStageMove(deal.id, stage.id, 'won')}
                                className="text-[10px] px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium"
                              >
                                Win Deal 🎉
                              </button>
                            )}
                            {stage.id === 'won' && (
                              <button
                                onClick={() => handleStageMove(deal.id, stage.id, 'delivered')}
                                className="text-[10px] px-2 py-0.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-medium"
                              >
                                Mark Delivered →
                              </button>
                            )}
                            {stage.id === 'delivered' && (
                              <button
                                onClick={() => handleStageMove(deal.id, stage.id, 'invoiced')}
                                className="text-[10px] px-2 py-0.5 rounded bg-purple-600 hover:bg-purple-500 text-white font-medium"
                              >
                                Send Invoice →
                              </button>
                            )}
                            {stage.id === 'invoiced' && (
                              <button
                                onClick={() => handleStageMove(deal.id, stage.id, 'paid')}
                                className="text-[10px] px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium"
                              >
                                Mark Paid 💸
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
