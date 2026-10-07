'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Microscope, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  Clock, 
  Share2, 
  Bookmark, 
  Heart, 
  ShieldAlert, 
  TrendingDown, 
  TrendingUp, 
  ExternalLink,
  ChevronRight,
  Filter,
  Flame,
  ArrowRight
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { useCreatorStore } from '@/lib/store';
import { calculatePostAutopsy } from '@/lib/evidence-engine';
import { Post, AutopsyResult } from '@/lib/types';

function AuditContent() {
  const searchParams = useSearchParams();
  const urlPostId = searchParams.get('postId');
  
  const { currentCreator, currentPosts } = useCreatorStore();

  const [selectedPostId, setSelectedPostId] = useState<string>(
    urlPostId || (currentPosts[1] ? currentPosts[1].id : currentPosts[0]?.id || '')
  );
  const [autopsyResult, setAutopsyResult] = useState<AutopsyResult | null>(null);

  // Selected Post object
  const selectedPost = currentPosts.find((p) => p.id === selectedPostId) || currentPosts[0];

  useEffect(() => {
    if (urlPostId) {
      setSelectedPostId(urlPostId);
    }
  }, [urlPostId]);

  useEffect(() => {
    if (selectedPost) {
      const result = calculatePostAutopsy(selectedPost, currentPosts);
      setAutopsyResult(result);
    }
  }, [selectedPost, currentPosts]);

  // Hook drop-off chart curve data
  const retentionData = selectedPost?.retention_curve || [
    { second: 0, retentionPct: 100 },
    { second: 3, retentionPct: Math.max(10, 100 - (selectedPost?.hook_dropoff_pct || 30)) },
    { second: 15, retentionPct: Math.max(8, 100 - (selectedPost?.hook_dropoff_pct || 30) - 18) },
    { second: 30, retentionPct: Math.max(5, 100 - (selectedPost?.hook_dropoff_pct || 30) - 26) },
    { second: selectedPost?.duration_s || 45, retentionPct: Math.round(selectedPost?.retention_rate || 40) },
  ];

  const isHonestUncertainty = autopsyResult?.verdict_reason === 'no_clear_cause';

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1.5">
              <Microscope className="w-3.5 h-3.5" />
              Algorithmic Autopsy
            </span>
            <span className="text-xs text-slate-400 font-mono">Evidence-Based Diagnostics</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
            Post-Mortem & Content Performance Audit
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Analyze why a post over- or under-performed against your baseline. Grounded in deterministic metrics, with an AI that honestly says &quot;I can&apos;t tell&quot; when the data does not support a cause.
          </p>
        </div>
      </div>

      {/* Post Selector Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex-1">
          <label className="text-xs font-semibold text-slate-300 block mb-1.5">
            Select Synced Post from Account ({currentPosts.length} posts analyzed)
          </label>
          <select
            value={selectedPostId}
            onChange={(e) => setSelectedPostId(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-white text-xs focus:outline-none focus:border-indigo-500"
          >
            {currentPosts.map((p) => (
              <option key={p.id} value={p.id}>
                {p.status === 'optimal' ? '🟢' : '🔴'} {p.title} ({p.engagement_rate}% ER • {p.views_count.toLocaleString()} views)
              </option>
            ))}
          </select>
        </div>

        {/* Quick shortcut buttons to test Guardrail G1 vs Outlier */}
        <div className="flex items-center gap-2 self-end md:self-auto pt-2 md:pt-4">
          {currentPosts[1] && (
            <button
              onClick={() => setSelectedPostId(currentPosts[1].id)}
              className={`text-xs px-3 py-2 rounded-xl font-medium transition-colors border ${
                selectedPostId === currentPosts[1].id
                  ? 'bg-rose-600 text-white border-rose-500'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
              }`}
            >
              Test Flop Post (Outlier)
            </button>
          )}
          {currentPosts[4] && (
            <button
              onClick={() => setSelectedPostId(currentPosts[4].id)}
              className={`text-xs px-3 py-2 rounded-xl font-medium transition-colors border ${
                selectedPostId === currentPosts[4].id
                  ? 'bg-indigo-600 text-white border-indigo-500'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
              }`}
            >
              Test Ambiguous Post (Guardrail G1)
            </button>
          )}
        </div>
      </div>

      {/* Selected Post Summary Overview */}
      {selectedPost && (
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row gap-5 items-start md:items-center justify-between">
          <div className="flex items-center gap-4">
            {selectedPost.thumbnail_url && (
              <img
                src={selectedPost.thumbnail_url}
                alt={selectedPost.title}
                className="w-20 h-20 rounded-xl object-cover ring-1 ring-slate-700 shrink-0"
              />
            )}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-indigo-300 border border-slate-700">
                  {selectedPost.format.toUpperCase()}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Published {new Date(selectedPost.published_at).toLocaleString()}
                </span>
              </div>
              <h2 className="text-base font-bold text-white leading-snug">
                {selectedPost.title}
              </h2>
              <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                {selectedPost.caption}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0 border-t md:border-t-0 md:border-l border-slate-800 pt-3 md:pt-0 md:pl-5 w-full md:w-auto justify-between md:justify-end">
            <div className="text-center">
              <div className="text-[10px] text-slate-400 font-mono uppercase">Views</div>
              <div className="text-base font-bold text-white font-mono">{selectedPost.views_count.toLocaleString()}</div>
            </div>
            <div className="text-center">
              <div className="text-[10px] text-slate-400 font-mono uppercase">ER %</div>
              <div className="text-base font-bold text-emerald-400 font-mono">{selectedPost.engagement_rate}%</div>
            </div>
            <div className="text-center">
              <div className="text-[10px] text-slate-400 font-mono uppercase">Likes</div>
              <div className="text-base font-bold text-white font-mono">{selectedPost.likes.toLocaleString()}</div>
            </div>
            <div className="text-center">
              <div className="text-[10px] text-slate-400 font-mono uppercase">Saves</div>
              <div className="text-base font-bold text-white font-mono">{selectedPost.saves.toLocaleString()}</div>
            </div>
          </div>
        </div>
      )}

      {/* Main Diagnostic Area: Retention Curve + AI Evidence Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* Left: Video Hook Drop-off Curve (6 Cols) */}
        <div className="lg:col-span-6 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-rose-400" />
                Video Hook Drop-Off Curve
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Audience retention trajectory across video timeline
              </p>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-slate-400 uppercase font-mono">3s Hook Drop</div>
              <div className={`text-xs font-bold font-mono ${
                (selectedPost?.hook_dropoff_pct || 0) > 35 ? 'text-rose-400' : 'text-emerald-400'
              }`}>
                {selectedPost?.hook_dropoff_pct}% Lost
              </div>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={retentionData} margin={{ top: 10, right: 10, bottom: 20, left: -10 }}>
                <defs>
                  <linearGradient id="retentionGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis 
                  dataKey="second" 
                  stroke="#64748b" 
                  fontSize={11} 
                  tickFormatter={(val) => `${val}s`} 
                />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={11} 
                  domain={[0, 100]} 
                  tickFormatter={(val) => `${val}%`} 
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0f172a', 
                    borderColor: '#334155', 
                    borderRadius: '12px',
                    color: '#f8fafc',
                    fontSize: '12px'
                  }} 
                  formatter={(val: any) => [`${val}% retained`, 'Retention']}
                  labelFormatter={(lbl) => `At ${lbl} seconds`}
                />
                <Area 
                  type="monotone" 
                  dataKey="retentionPct" 
                  stroke="#818cf8" 
                  strokeWidth={2.5} 
                  fillOpacity={1} 
                  fill="url(#retentionGrad)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-400">
            <span className="font-semibold text-slate-200">Retention Benchmark Insight:</span> Top quartile content in {currentCreator.niche} maintains over 75% retention past the 3-second mark.
          </div>
        </div>

        {/* Right: AI Evidence Analysis & Guardrails (6 Cols) */}
        <div className="lg:col-span-6 space-y-4">

          {/* GUARDRAIL G1 ACTIVE BANNER: Honest Uncertainty */}
          {isHonestUncertainty && (
            <div className="p-5 rounded-2xl bg-indigo-950/40 border border-indigo-700/60 shadow-xl space-y-3 animate-slide-up">
              <div className="flex items-start gap-3">
                <HelpCircle className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <div className="space-y-1.5">
                  <div className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-2">
                    <span>Guardrail G1 Enforced: Honest Uncertainty Protocol</span>
                    <span className="px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 text-[10px] border border-indigo-500/30">
                      ACTIVE
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white">
                    &quot;I don&apos;t have enough data to determine why this post underperformed.&quot;
                  </h4>
                  <p className="text-xs text-indigo-100/90 leading-relaxed">
                    {autopsyResult?.honest_uncertainty_note}
                  </p>
                  <div className="pt-2 border-t border-indigo-900/60 text-xs text-slate-300">
                    <span className="font-semibold text-white">Why this happens:</span> The metrics of this post (ER: {selectedPost?.engagement_rate}%, views: {selectedPost?.views_count.toLocaleString()}) differ from your median baseline by less than 1 standard deviation. Inventing causes would give you bad creative advice.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Evidence-Backed Diagnostic Factors */}
          {!isHonestUncertainty && (
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    Evidence-Backed Root Cause Factors ({autopsyResult?.factors.length})
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Statistically significant deviations exceeding 1 standard deviation
                  </p>
                </div>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                  autopsyResult?.verdict === 'optimal'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                }`}>
                  {autopsyResult?.verdict?.toUpperCase()}
                </span>
              </div>

              <div className="space-y-3">
                {autopsyResult?.factors.map((factor) => (
                  <div
                    key={factor.evidence_id}
                    className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">
                        {factor.factor_name}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-900 text-slate-400 border border-slate-700">
                          {factor.evidence_id}
                        </span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                          factor.confidence === 'High'
                            ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30'
                            : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                        }`}>
                          {factor.confidence} Confidence
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-300 pt-1">
                      <div>Observed: <span className="text-amber-300">{factor.metric_observed}</span></div>
                      <div>Baseline: <span className="text-slate-400">{factor.baseline_median}</span></div>
                    </div>

                    <p className="text-xs text-slate-300 pt-1 leading-relaxed">
                      {factor.explanation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actionable Next Experiments */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-brand-emerald" />
              Prescribed Controlled Experiments
            </h3>
            <div className="space-y-2">
              {autopsyResult?.suggested_experiments.map((exp, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 text-xs text-slate-200 flex items-start gap-2.5"
                >
                  <span className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-300 font-bold font-mono text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed">{exp}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

export default function AuditPage() {
  return (
    <Suspense fallback={
      <div className="p-8 text-center text-xs text-slate-400">
        Loading post-mortem diagnostics...
      </div>
    }>
      <AuditContent />
    </Suspense>
  );
}
