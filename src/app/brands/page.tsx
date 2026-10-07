'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Building2, 
  Search, 
  Sparkles, 
  DollarSign, 
  Send, 
  Instagram, 
  Youtube, 
  Video, 
  ExternalLink,
  Filter,
  CheckCircle2,
  Mail
} from 'lucide-react';
import { useCreatorStore } from '@/lib/store';
import { NicheType } from '@/lib/types';

export default function BrandsPage() {
  const router = useRouter();
  const { brandDirectory, currentCreator } = useCreatorStore();

  const [selectedNiche, setSelectedNiche] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredBrands = brandDirectory.filter((brand) => {
    const matchesNiche = selectedNiche === 'all' || brand.category.toLowerCase() === selectedNiche.toLowerCase();
    const matchesSearch = 
      brand.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      brand.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesNiche && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" />
              Creator-Friendly Brands
            </span>
            <span className="text-xs text-slate-400 font-mono">Curated Shortlist</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
            Brand Collab Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Pre-vetted sponsor directory actively booking micro-influencers. Click any brand to immediately calculate rate cards and generate targeted cold pitches.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search brands (e.g. Gymshark, Notion)..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-800/80 border border-slate-700/80 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Niche Filter Pills */}
        <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
          {['all', 'Fitness', 'Tech', 'Fashion', 'Lifestyle', 'Beauty'].map((niche) => (
            <button
              key={niche}
              onClick={() => setSelectedNiche(niche)}
              className={`text-xs px-3 py-1.5 rounded-xl font-medium transition-all ${
                selectedNiche === niche
                  ? 'bg-indigo-600 text-white shadow'
                  : 'bg-slate-800/70 text-slate-400 hover:text-white border border-slate-700/60'
              }`}
            >
              {niche === 'all' ? 'All Niches' : niche}
            </button>
          ))}
        </div>
      </div>

      {/* Brand Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredBrands.map((brand) => (
          <div
            key={brand.id}
            className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between group shadow-xl"
          >
            <div>
              {/* Brand Top Header */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <img
                    src={brand.logo_url}
                    alt={brand.name}
                    className="w-10 h-10 rounded-xl object-contain bg-slate-800 p-1 ring-1 ring-slate-700"
                  />
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">
                      {brand.name}
                    </h3>
                    <span className="text-[10px] font-mono uppercase text-slate-400">
                      {brand.category}
                    </span>
                  </div>
                </div>

                <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                  {brand.typical_budget_tier}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                {brand.description}
              </p>

              {/* Preferred Platforms & Contact */}
              <div className="flex items-center justify-between text-xs text-slate-400 py-2 border-t border-slate-800 mb-4">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono text-slate-500">PLATFORMS:</span>
                  {brand.preferred_platforms.map((p) => (
                    <span key={p} className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                      {p}
                    </span>
                  ))}
                </div>
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Mail className="w-3 h-3 text-indigo-400" />
                  {brand.contact_email}
                </span>
              </div>
            </div>

            {/* Launch Pricer Button */}
            <button
              onClick={() => router.push(`/pricer?brand=${encodeURIComponent(brand.name)}`)}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-indigo-600/25 transition-all active:scale-[0.99]"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Pitch with AI</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
