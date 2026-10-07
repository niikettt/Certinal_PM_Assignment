'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  Activity, 
  DollarSign, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  Sparkles, 
  Play, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Eye, 
  Share2, 
  Bookmark, 
  ChevronRight,
  Calculator,
  Microscope,
  Calendar,
  Layers
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Bar, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from 'recharts';
import { useCreatorStore } from '@/lib/store';

export default function DashboardPage() {
  const router = useRouter();
  const { 
    currentCreator, 
    primaryAccount, 
    currentPosts, 
    formatCurrency 
  } = useCreatorStore();

  const [activeChartMetric, setActiveChartMetric] = useState<'both' | 'views' | 'er'>('both');

  // Chart data from current posts
  const chartData = currentPosts.map((post, idx) => ({
    name: `Post ${currentPosts.length - idx}`,
    title: post.title.length > 25 ? post.title.substring(0, 22) + '...' : post.title,
    views: post.views_count,
    engagementRate: post.engagement_rate,
    status: post.status,
  })).reverse();

  // Benchmark ER comparison
  const benchmarkER = 2.0;
  const erDelta = (primaryAccount.avg_engagement_rate - benchmarkER).toFixed(1);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fade-in">
      {/* Top Banner / Welcome & Quick Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-indigo-950/60 via-slate-900 to-slate-900 border border-indigo-900/40">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
              Executive Co-Pilot
            </span>
            <span className="text-xs text-slate-400 font-mono">Q4 Growth Trajectory</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
            Welcome back, {currentCreator.full_name} 👋
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Here is your live commercial performance. Your audience engagement is{' '}
            <span className="text-emerald-400 font-semibold">
              {Number(erDelta) >= 0 ? `+${erDelta}% above` : `${erDelta}% below`}
            </span>{' '}
            industry benchmarks for {currentCreator.niche}.
          </p>
        </div>

        {/* Quick launch tools */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/pricer"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/40"
          >
            <Calculator className="w-4 h-4" />
            <span>Price a Brand Deal</span>
          </Link>
          <Link
            href="/audit"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold text-xs border border-slate-700 transition-all"
          >
            <Microscope className="w-4 h-4 text-emerald-400" />
            <span>Autopsy Content</span>
          </Link>
        </div>
      </div>

      {/* "Today's Focus" AI Action Card (SRS FR-2.2) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/30 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0 mt-0.5">
            <Sparkles className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <div className="text-xs font-mono font-semibold text-indigo-300 uppercase tracking-wider flex items-center gap-2">
              <span>Today’s High-Leverage AI Focus</span>
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping"></span>
            </div>
            <p className="text-sm font-medium text-white mt-0.5">
              {currentCreator.id === 'creator-ananya' && (
                <>Negotiate Casetify counter-offer: Anchor rate at <span className="text-emerald-400 font-bold">$650</span> using your 2.4% engagement leverage.</>
              )}
              {currentCreator.id === 'creator-aarav' && (
                <>Pitch Notion with your Terminal Tools reel stats (4.2% ER) to land your first <span className="text-emerald-400 font-bold">$850</span> brand partnership.</>
              )}
              {currentCreator.id === 'creator-meera' && (
                <>Autopsy flopped Reel from Tuesday: 54% 3s hook drop-off identified. Split-test opening transformation.</>
              )}
            </p>
          </div>
        </div>
        <Link
          href={currentCreator.id === 'creator-meera' ? '/audit' : '/pricer'}
          className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 shrink-0 group bg-indigo-500/10 px-3 py-1.5 rounded-lg border border-indigo-500/20"
        >
          <span>Take Action</span>
          <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Metric 1: Follower Growth */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800/80 hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-medium uppercase tracking-wider">Total Followers</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
              {primaryAccount.follower_count.toLocaleString()}
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+4.2% MoM</span>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Active on {primaryAccount.platform.toUpperCase()} ({primaryAccount.handle})
          </p>
        </div>

        {/* Metric 2: Avg Engagement Rate */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800/80 hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-medium uppercase tracking-wider">Avg. Engagement Rate</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
              {primaryAccount.avg_engagement_rate}%
            </div>
            <div className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full border ${
              Number(erDelta) >= 0 
                ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' 
                : 'text-amber-400 bg-amber-500/10 border-amber-500/20'
            }`}>
              {Number(erDelta) >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
              <span>vs {benchmarkER}% benchmark</span>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Industry median for {currentCreator.niche} is {benchmarkER}%
          </p>
        </div>

        {/* Metric 3: Net Creator Revenue */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800/80 hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-medium uppercase tracking-wider">Net Creator Revenue (CMR)</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight font-mono">
              {formatCurrency(currentCreator.monthly_revenue)}
            </div>
            <span className="text-xs font-semibold text-slate-400">
              Target: {formatCurrency(currentCreator.revenue_target)}
            </span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 mt-3 overflow-hidden">
            <div 
              className="bg-brand-emerald h-full rounded-full transition-all duration-500" 
              style={{ width: `${Math.min(100, (currentCreator.monthly_revenue / currentCreator.revenue_target) * 100)}%` }}
            ></div>
          </div>
          <p className="text-xs text-slate-400 mt-2 flex justify-between">
            <span>Progress: {Math.round((currentCreator.monthly_revenue / currentCreator.revenue_target) * 100)}%</span>
            <span className="text-emerald-400 font-medium">3 closed deals</span>
          </p>
        </div>
      </div>

      {/* Analytics Chart Section: Post Views vs. Engagement Rate */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              Content Performance: Views vs. Engagement Rate
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Evaluating algorithmic reach against audience interaction across recent uploads
            </p>
          </div>

          {/* Metric Selector Pill */}
          <div className="flex items-center gap-1 bg-slate-800/70 p-1 rounded-xl border border-slate-700/60 text-xs">
            <button
              onClick={() => setActiveChartMetric('both')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                activeChartMetric === 'both' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Dual Axis
            </button>
            <button
              onClick={() => setActiveChartMetric('views')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                activeChartMetric === 'views' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Views Only
            </button>
            <button
              onClick={() => setActiveChartMetric('er')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                activeChartMetric === 'er' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Engagement %
            </button>
          </div>
        </div>

        {/* Recharts Container */}
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis 
                dataKey="name" 
                stroke="#64748b" 
                fontSize={11} 
                tickLine={false} 
              />
              <YAxis 
                yAxisId="left" 
                stroke="#64748b" 
                fontSize={11} 
                tickLine={false}
                tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`} 
              />
              <YAxis 
                yAxisId="right" 
                orientation="right" 
                stroke="#10b981" 
                fontSize={11} 
                tickLine={false}
                tickFormatter={(val) => `${val}%`} 
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#0f172a', 
                  borderColor: '#334155', 
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)',
                  color: '#f8fafc',
                  fontSize: '12px'
                }} 
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />

              {(activeChartMetric === 'both' || activeChartMetric === 'views') && (
                <Bar 
                  yAxisId="left" 
                  dataKey="views" 
                  name="Views (Plays)" 
                  fill="#6366F1" 
                  radius={[6, 6, 0, 0]} 
                  barSize={32}
                />
              )}
              {(activeChartMetric === 'both' || activeChartMetric === 'er') && (
                <Line 
                  yAxisId="right" 
                  type="monotone" 
                  dataKey="engagementRate" 
                  name="Engagement Rate (%)" 
                  stroke="#10B981" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: '#10B981' }} 
                  activeDot={{ r: 6 }} 
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Content Diagnostics List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              Recent Content Diagnostics
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Algorithm-audited uploads sorted by recent publication
            </p>
          </div>
          <Link
            href="/audit"
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
          >
            <span>View Full Autopsy Suite</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Post Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentPosts.map((post) => {
            const isOptimal = post.status === 'optimal';
            return (
              <div 
                key={post.id}
                className="group p-4 rounded-2xl bg-slate-900/90 border border-slate-800/80 hover:border-slate-700 flex flex-col justify-between transition-all hover:shadow-xl"
              >
                <div>
                  {/* Top tags */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {new Date(post.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                      isOptimal 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    }`}>
                      {isOptimal ? 'OPTIMAL' : 'NEEDS AUDIT'}
                    </span>
                  </div>

                  {/* Thumbnail & Title */}
                  <div className="flex gap-3 mb-3">
                    {post.thumbnail_url && (
                      <img 
                        src={post.thumbnail_url} 
                        alt={post.title} 
                        className="w-16 h-16 rounded-xl object-cover ring-1 ring-slate-800 shrink-0" 
                      />
                    )}
                    <div>
                      <h3 className="text-xs font-bold text-white line-clamp-2 leading-snug group-hover:text-indigo-300 transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                        {post.caption}
                      </p>
                    </div>
                  </div>

                  {/* Metrics preview */}
                  <div className="grid grid-cols-3 gap-2 py-2 px-3 rounded-xl bg-slate-800/40 border border-slate-800 text-center mb-4">
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-mono">Views</div>
                      <div className="text-xs font-bold text-white font-mono mt-0.5">
                        {post.views_count.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-mono">ER %</div>
                      <div className={`text-xs font-bold font-mono mt-0.5 ${
                        post.engagement_rate >= 2.0 ? 'text-emerald-400' : 'text-amber-400'
                      }`}>
                        {post.engagement_rate}%
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-mono">Retention</div>
                      <div className="text-xs font-bold text-white font-mono mt-0.5">
                        {post.retention_rate}%
                      </div>
                    </div>
                  </div>
                </div>

                {/* Audit Action Button */}
                <button
                  onClick={() => router.push(`/audit?postId=${post.id}`)}
                  className={`w-full py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    !isOptimal 
                      ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/20' 
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700'
                  }`}
                >
                  <Microscope className="w-3.5 h-3.5" />
                  <span>Audit Post Performance</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
