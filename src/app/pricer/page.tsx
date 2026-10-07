'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Calculator, 
  Sparkles, 
  DollarSign, 
  ShieldCheck, 
  ShieldAlert, 
  Copy, 
  Check, 
  ArrowRight, 
  RefreshCw, 
  Layers, 
  Send, 
  FileText, 
  Tag, 
  Zap, 
  Sliders, 
  Info,
  ExternalLink,
  ChevronRight,
  Kanban
} from 'lucide-react';
import { useCreatorStore } from '@/lib/store';
import { calculateDeterministicPricing } from '@/lib/evidence-engine';
import { NicheType, PricingResult } from '@/lib/types';
import confetti from 'canvas-confetti';

function PricerContent() {
  const searchParams = useSearchParams();
  const urlBrand = searchParams.get('brand');

  const { 
    currentCreator, 
    primaryAccount, 
    currentPosts, 
    formatCurrency, 
    addDeal, 
    brandDirectory 
  } = useCreatorStore();

  // Form Inputs
  const [brandName, setBrandName] = useState<string>(urlBrand || 'Glossier');
  const [niche, setNiche] = useState<NicheType>(currentCreator.niche);
  const [reelsCount, setReelsCount] = useState<number>(1);
  const [tiktoksCount, setTiktoksCount] = useState<number>(0);
  const [storiesCount, setStoriesCount] = useState<number>(2);
  const [youtubeCount, setYoutubeCount] = useState<number>(0);
  const [usageRights, setUsageRights] = useState<'organic' | '30_day_ads' | '90_day_ads' | 'full_buyout'>('organic');
  const [exclusivityDays, setExclusivityDays] = useState<0 | 30 | 90>(0);
  const [isRush, setIsRush] = useState<boolean>(false);
  const [brandOffer, setBrandOffer] = useState<number>(450);

  // Active Output Tabs & Streaming state
  const [activeTab, setActiveTab] = useState<'pitch' | 'counter' | 'caption'>('pitch');
  const [pricingResult, setPricingResult] = useState<PricingResult | null>(null);
  const [pitchText, setPitchText] = useState<string>('');
  const [counterText, setCounterText] = useState<string>('');
  const [captionText, setCaptionText] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [dealSavedMessage, setDealSavedMessage] = useState<string | null>(null);

  useEffect(() => {
    if (urlBrand) {
      setBrandName(urlBrand);
    }
  }, [urlBrand]);

  // Sync niche when creator changes
  useEffect(() => {
    setNiche(currentCreator.niche);
  }, [currentCreator]);

  // Recalculate deterministic pricing whenever inputs change
  useEffect(() => {
    const result = calculateDeterministicPricing({
      creator: currentCreator,
      account: primaryAccount,
      brandName,
      niche,
      deliverables: {
        reels: reelsCount,
        tiktoks: tiktoksCount,
        stories: storiesCount,
        youtube_integrations: youtubeCount,
      },
      usageRights,
      exclusivityDays,
      isRush,
      recentPosts: currentPosts,
    });
    setPricingResult(result);
  }, [
    currentCreator, 
    primaryAccount, 
    brandName, 
    niche, 
    reelsCount, 
    tiktoksCount, 
    storiesCount, 
    youtubeCount, 
    usageRights, 
    exclusivityDays, 
    isRush, 
    currentPosts
  ]);

  // Trigger streaming AI Pitch Generation
  const generatePitchContent = async (selectedType: 'pitch' | 'counter' | 'caption') => {
    if (!pricingResult) return;
    setIsStreaming(true);

    if (selectedType === 'pitch') setPitchText('');
    if (selectedType === 'counter') setCounterText('');
    if (selectedType === 'caption') setCaptionText('');

    try {
      const res = await fetch('/api/ai/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: selectedType,
          creatorName: currentCreator.full_name,
          handle: primaryAccount.handle,
          followers: primaryAccount.follower_count,
          engagementRate: primaryAccount.avg_engagement_rate,
          brandName,
          niche,
          rateTiers: pricingResult,
          deliverables: {
            reels: reelsCount,
            tiktoks: tiktoksCount,
            stories: storiesCount,
            youtube_integrations: youtubeCount,
          },
          brandOffer: brandOffer,
          usageRights: usageRights.replace(/_/g, ' '),
        }),
      });

      if (!res.body) throw new Error('No readable stream returned');
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });

        if (selectedType === 'pitch') setPitchText(accumulated);
        if (selectedType === 'counter') setCounterText(accumulated);
        if (selectedType === 'caption') setCaptionText(accumulated);
      }
    } catch (err) {
      console.error('Streaming failed:', err);
    } finally {
      setIsStreaming(false);
    }
  };

  // Initial stream on load if empty
  useEffect(() => {
    if (pricingResult && !pitchText && !isStreaming) {
      generatePitchContent('pitch');
    }
  }, [pricingResult]);

  const handleTabChange = (tab: 'pitch' | 'counter' | 'caption') => {
    setActiveTab(tab);
    if (tab === 'pitch' && !pitchText) generatePitchContent('pitch');
    if (tab === 'counter' && !counterText) generatePitchContent('counter');
    if (tab === 'caption' && !captionText) generatePitchContent('caption');
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSaveToPipeline = () => {
    if (!pricingResult) return;
    const newDeal = addDeal({
      creator_id: currentCreator.id,
      brand_name: brandName,
      brand_category: niche,
      deliverables: {
        reels: reelsCount,
        tiktoks: tiktoksCount,
        stories: storiesCount,
        youtube_integrations: youtubeCount,
      },
      quoted_rate: pricingResult.fair_market,
      ai_suggested_rate: pricingResult.fair_market,
      status: 'pitching',
      stage: 'pitched',
      ftc_compliant: true,
      usage_rights: usageRights,
      notes: `Priced via CreatorPulse AI. CPM: $${pricingResult.cpm_baseline}, Realized Plays: ~${pricingResult.realized_plays.toLocaleString()}`,
    });

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#6366F1', '#10B981', '#38BDF8'],
    });

    setDealSavedMessage(`Deal "${brandName}" added to Deal Pipeline!`);
    setTimeout(() => setDealSavedMessage(null), 3500);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" />
              Core Engine
            </span>
            <span className="text-xs text-slate-400 font-mono">Evidence-Based Deal Valuation</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
            AI Brand Deal Pricer & Pitch Engine
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Never underprice or ask arbitrary rates. Pricing is calculated deterministically from your verified engagement quality and realized CPM benchmarks.
          </p>
        </div>

        {dealSavedMessage && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold animate-fade-in">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{dealSavedMessage}</span>
          </div>
        )}
      </div>

      {/* Split Pane: Form Left vs Output Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ================= LEFT PANE: INPUT FORM (5 Cols) ================= */}
        <div className="lg:col-span-5 space-y-5 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-400" />
              Campaign & Deliverable Scope
            </h2>
            <span className="text-[10px] font-mono text-slate-400">Step 1 of 2</span>
          </div>

          {/* Quick-Brand Selectors */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Brand Name
            </label>
            <div className="relative">
              <input
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="e.g. Glossier, Notion, Gymshark"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            {/* Brand Quick Picks */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              <span className="text-[10px] text-slate-500 font-medium py-0.5">Quick picks:</span>
              {brandDirectory.slice(0, 4).map((brand) => (
                <button
                  key={brand.id}
                  onClick={() => {
                    setBrandName(brand.name);
                    setNiche(brand.category);
                  }}
                  className={`text-[10px] px-2 py-0.5 rounded-md font-medium transition-colors ${
                    brandName.toLowerCase() === brand.name.toLowerCase()
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {brand.name}
                </button>
              ))}
            </div>
          </div>

          {/* Niche Category */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Niche Category (Defines CPM Baseline)
            </label>
            <select
              value={niche}
              onChange={(e) => setNiche(e.target.value as NicheType)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-white text-xs focus:outline-none focus:border-indigo-500 transition-colors"
            >
              <option value="Fashion">Fashion ($20 - $35 CPM)</option>
              <option value="Tech">Tech ($25 - $45 CPM)</option>
              <option value="Lifestyle">Lifestyle ($12 - $25 CPM)</option>
              <option value="Beauty">Beauty ($22 - $40 CPM)</option>
              <option value="Fitness">Fitness ($18 - $36 CPM)</option>
            </select>
          </div>

          {/* Deliverables Selectors */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <span className="text-xs font-semibold text-slate-300 block">
              Deliverables Volume
            </span>

            {/* Reels Counter */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/40 border border-slate-800">
              <div>
                <div className="text-xs font-semibold text-white">Instagram Reels / Short Video</div>
                <div className="text-[10px] text-slate-400">1.0x unit rate basis</div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setReelsCount(Math.max(0, reelsCount - 1))}
                  className="w-7 h-7 rounded-lg bg-slate-700 text-white font-bold flex items-center justify-center hover:bg-slate-600 transition-colors"
                >
                  -
                </button>
                <span className="w-5 text-center font-mono font-bold text-xs text-white">
                  {reelsCount}
                </span>
                <button
                  onClick={() => setReelsCount(reelsCount + 1)}
                  className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center hover:bg-indigo-500 transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Stories Counter */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/40 border border-slate-800">
              <div>
                <div className="text-xs font-semibold text-white">Story Frames (with Link Sticker)</div>
                <div className="text-[10px] text-slate-400">0.30x unit rate basis</div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setStoriesCount(Math.max(0, storiesCount - 1))}
                  className="w-7 h-7 rounded-lg bg-slate-700 text-white font-bold flex items-center justify-center hover:bg-slate-600 transition-colors"
                >
                  -
                </button>
                <span className="w-5 text-center font-mono font-bold text-xs text-white">
                  {storiesCount}
                </span>
                <button
                  onClick={() => setStoriesCount(storiesCount + 1)}
                  className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center hover:bg-indigo-500 transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* TikTok Counter */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/40 border border-slate-800">
              <div>
                <div className="text-xs font-semibold text-white">TikTok Post / Cross-post</div>
                <div className="text-[10px] text-slate-400">0.85x unit rate basis</div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setTiktoksCount(Math.max(0, tiktoksCount - 1))}
                  className="w-7 h-7 rounded-lg bg-slate-700 text-white font-bold flex items-center justify-center hover:bg-slate-600 transition-colors"
                >
                  -
                </button>
                <span className="w-5 text-center font-mono font-bold text-xs text-white">
                  {tiktoksCount}
                </span>
                <button
                  onClick={() => setTiktoksCount(tiktoksCount + 1)}
                  className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center hover:bg-indigo-500 transition-colors"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Usage Rights Options */}
          <div className="pt-2 border-t border-slate-800">
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Usage Rights (Paid Ad Amplification)
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setUsageRights('organic')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  usageRights === 'organic'
                    ? 'border-indigo-500 bg-indigo-600/20 text-white'
                    : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:text-white'
                }`}
              >
                <div className="font-semibold text-white">Organic Only</div>
                <div className="text-[10px] text-slate-400">1.0x (No paid ads)</div>
              </button>
              <button
                type="button"
                onClick={() => setUsageRights('30_day_ads')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  usageRights === '30_day_ads'
                    ? 'border-indigo-500 bg-indigo-600/20 text-white'
                    : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:text-white'
                }`}
              >
                <div className="font-semibold text-white">30-Day Spark Ads</div>
                <div className="text-[10px] text-slate-400">+25% premium</div>
              </button>
              <button
                type="button"
                onClick={() => setUsageRights('90_day_ads')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  usageRights === '90_day_ads'
                    ? 'border-indigo-500 bg-indigo-600/20 text-white'
                    : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:text-white'
                }`}
              >
                <div className="font-semibold text-white">90-Day Whitelisting</div>
                <div className="text-[10px] text-slate-400">+50% premium</div>
              </button>
              <button
                type="button"
                onClick={() => setUsageRights('full_buyout')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  usageRights === 'full_buyout'
                    ? 'border-indigo-500 bg-indigo-600/20 text-white'
                    : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:text-white'
                }`}
              >
                <div className="font-semibold text-white">Full Buyout (365d)</div>
                <div className="text-[10px] text-slate-400">+100% premium (2.0x)</div>
              </button>
            </div>
          </div>

          {/* Exclusivity & Rush Checkboxes */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800 text-xs">
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Category Exclusivity
              </label>
              <select
                value={exclusivityDays}
                onChange={(e) => setExclusivityDays(Number(e.target.value) as 0 | 30 | 90)}
                className="w-full p-2 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs focus:outline-none"
              >
                <option value={0}>None (Standard)</option>
                <option value={30}>30 Days (+20%)</option>
                <option value={90}>90 Days (+40%)</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Turnaround Time
              </label>
              <button
                type="button"
                onClick={() => setIsRush(!isRush)}
                className={`w-full p-2 rounded-xl border text-center font-medium transition-all ${
                  isRush
                    ? 'border-amber-500 bg-amber-500/20 text-amber-300'
                    : 'border-slate-800 bg-slate-800/80 text-slate-400'
                }`}
              >
                {isRush ? '⚡ Rush 72h (+30%)' : 'Standard 14 Days'}
              </button>
            </div>
          </div>

          {/* Lowball offer counter field */}
          <div className="pt-2 border-t border-slate-800">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between mb-1">
              <span>Brand's Proposed Offer (for Counter-Offers)</span>
              <span className="text-[10px] font-normal text-slate-500">Optional</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs text-slate-500 font-mono">$</span>
              <input
                type="number"
                value={brandOffer}
                onChange={(e) => setBrandOffer(Number(e.target.value))}
                placeholder="450"
                className="w-full pl-7 pr-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700/80 text-white text-xs font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Action Trigger */}
          <button
            onClick={() => generatePitchContent(activeTab)}
            disabled={isStreaming}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50"
          >
            <Sparkles className={`w-4 h-4 ${isStreaming ? 'animate-spin' : ''}`} />
            <span>{isStreaming ? 'Synthesizing with Guardrails...' : 'Calculate Rate Card & Generate Pitch'}</span>
          </button>
        </div>


        {/* ================= RIGHT PANE: INTERACTIVE OUTPUT (7 Cols) ================= */}
        <div className="lg:col-span-7 space-y-6">

          {/* 1. Low Engagement Anomaly Cap Warning (Guardrail G3) */}
          {pricingResult?.has_low_er_anomaly && (
            <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-800/60 text-slate-200 animate-slide-up">
              <div className="flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
                    <span>Guardrail G3 Active: Low Engagement Valuation Cap</span>
                    <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[10px] border border-amber-500/30">
                      ENFORCED
                    </span>
                  </div>
                  <p className="text-xs text-amber-100 leading-relaxed">
                    {pricingResult.anomaly_warning}
                  </p>
                  <p className="text-[11px] text-slate-400 pt-1">
                    Naive follower calculation (85,000 × $0.01) would quote <span className="line-through text-rose-400 font-mono">$850</span>, which brands reject due to poor click-through. CreatorPulse protects your professional standing by pricing at true delivered reach.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 2. 3-Tier Rate Card Display */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-brand-emerald" />
                  Calculated Commercial Rate Card
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Based on {pricingResult?.realized_plays.toLocaleString()} median plays & ${pricingResult?.cpm_baseline} CPM
                </p>
              </div>

              {/* Add to deal pipeline CTA */}
              <button
                onClick={handleSaveToPipeline}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all shadow-md shadow-emerald-600/20 active:scale-95"
              >
                <Kanban className="w-3.5 h-3.5" />
                <span>Save Deal to Pipeline</span>
              </button>
            </div>

            {/* The 3 Tiers Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Conservative Rate */}
              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                    Floor Rate
                  </span>
                  <div className="text-xs font-semibold text-slate-200 mt-0.5">
                    Conservative
                  </div>
                  <div className="text-xl font-black text-slate-200 font-mono mt-2">
                    {formatCurrency(pricingResult?.conservative || 450)}
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 mt-3">
                  Base reach, single post without ad rights.
                </p>
              </div>

              {/* Fair Market Value (RECOMMENDED) */}
              <div className="p-4 rounded-xl bg-indigo-950/40 border-2 border-indigo-500 flex flex-col justify-between relative shadow-xl shadow-indigo-600/10">
                <span className="absolute -top-2.5 right-3 text-[9px] font-bold font-mono px-2 py-0.5 rounded-full bg-indigo-600 text-white uppercase tracking-wider shadow">
                  ★ RECOMMENDED
                </span>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-300">
                    Defensible Anchor
                  </span>
                  <div className="text-xs font-bold text-white mt-0.5 flex items-center gap-1">
                    Fair Market Value
                  </div>
                  <div className="text-2xl font-black text-emerald-400 font-mono mt-2">
                    {formatCurrency(pricingResult?.fair_market || 650)}
                  </div>
                </div>
                <p className="text-[10px] text-indigo-200/80 mt-3 font-medium">
                  Optimized conversion value with current engagement leverage.
                </p>
              </div>

              {/* Aggressive Rate */}
              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                    High Anchor
                  </span>
                  <div className="text-xs font-semibold text-slate-200 mt-0.5">
                    Aggressive / Walk-away
                  </div>
                  <div className="text-xl font-black text-slate-200 font-mono mt-2">
                    {formatCurrency(pricingResult?.aggressive || 880)}
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 mt-3">
                  Includes multi-platform bundle & extended usage rights.
                </p>
              </div>
            </div>

            {/* CPM Breakdown Callout Box */}
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 space-y-1.5">
              <div className="font-semibold text-white flex items-center gap-2">
                <Info className="w-3.5 h-3.5 text-indigo-400" />
                <span>Deterministic Evidence Layer Breakdown</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {pricingResult?.rationale_summary}
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {pricingResult?.evidence_ids.map((id) => (
                  <span
                    key={id}
                    className="text-[9px] font-mono px-2 py-0.5 rounded bg-slate-800 text-indigo-300 border border-slate-700"
                  >
                    {id}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* 3. Interactive Pitch Generator Card (Tabbed) */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              {/* Tabs */}
              <div className="flex items-center gap-1 bg-slate-800/70 p-1 rounded-xl border border-slate-700/60 text-xs">
                <button
                  onClick={() => handleTabChange('pitch')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                    activeTab === 'pitch' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Cold Pitch Email</span>
                </button>
                <button
                  onClick={() => handleTabChange('counter')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                    activeTab === 'counter' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>Negotiation Counter</span>
                </button>
                <button
                  onClick={() => handleTabChange('caption')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                    activeTab === 'caption' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Tag className="w-3.5 h-3.5" />
                  <span>FTC Caption</span>
                </button>
              </div>

              {/* Actions: Copy & Regenerate */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => generatePitchContent(activeTab)}
                  disabled={isStreaming}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                  title="Regenerate copy"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isStreaming ? 'animate-spin' : ''}`} />
                </button>
                <button
                  onClick={() => {
                    const textToCopy =
                      activeTab === 'pitch' ? pitchText : activeTab === 'counter' ? counterText : captionText;
                    handleCopy(textToCopy, activeTab);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs border border-slate-700 transition-colors"
                >
                  {copiedKey === activeTab ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === activeTab ? 'Copied!' : 'Copy Copy'}</span>
                </button>
              </div>
            </div>

            {/* Tab 3 Notice for FTC Guardrail G2 */}
            {activeTab === 'caption' && (
              <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/30 p-2.5 rounded-xl border border-emerald-800/40">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  <strong className="text-white">Guardrail G2 Enforced:</strong> Mandatory FTC disclosure (#ad / [Paid Partnership]) is automatically validated and embedded.
                </span>
              </div>
            )}

            {/* Content Display Area (Simulated Streaming or Live Result) */}
            <div className="relative min-h-[220px] p-4 rounded-xl bg-slate-950/90 border border-slate-800/80 font-mono text-xs leading-relaxed text-slate-200 overflow-x-auto whitespace-pre-wrap">
              {isStreaming && (
                <div className="absolute top-3 right-3 flex items-center gap-1.5 text-[10px] text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20 font-sans">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
                  <span>Streaming SSE Tokens...</span>
                </div>
              )}

              {activeTab === 'pitch' && (pitchText || (isStreaming ? 'Drafting personalized pitch...' : 'Click "Generate Pitch" to draft'))}
              {activeTab === 'counter' && (counterText || (isStreaming ? 'Calculating counter negotiation strategy...' : 'Click "Generate Pitch" to draft'))}
              {activeTab === 'caption' && (captionText || (isStreaming ? 'Structuring FTC compliant copy...' : 'Click "Generate Pitch" to draft'))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

export default function PricerPage() {
  return (
    <Suspense fallback={
      <div className="p-8 text-center text-xs text-slate-400">
        Loading AI brand pricer...
      </div>
    }>
      <PricerContent />
    </Suspense>
  );
}
