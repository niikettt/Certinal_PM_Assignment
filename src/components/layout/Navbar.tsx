'use client';

import React, { useState } from 'react';
import { 
  RefreshCw, 
  PlusCircle, 
  Sparkles, 
  ShieldCheck, 
  TrendingUp, 
  Instagram, 
  ExternalLink 
} from 'lucide-react';
import { useCreatorStore } from '@/lib/store';
import { ConnectModal } from '../ui/ConnectModal';

export const Navbar: React.FC = () => {
  const { 
    currentCreator, 
    primaryAccount, 
    lastSyncedText, 
    isSyncing, 
    triggerManualSync, 
    formatCurrency 
  } = useCreatorStore();

  const [connectModalOpen, setConnectModalOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 w-full h-16 border-b border-slate-800/80 bg-[#090d16]/80 backdrop-blur-md px-4 lg:px-8 flex items-center justify-between">
        {/* Left: Connected Account selector & Status */}
        <div className="flex items-center gap-3 pl-12 lg:pl-0">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
            <Instagram className="w-4 h-4 text-pink-400" />
            <span className="font-semibold text-white tracking-tight">
              {primaryAccount.handle}
            </span>
            <span className="text-slate-400 hidden sm:inline">•</span>
            <span className="text-slate-400 hidden sm:inline font-mono">
              {primaryAccount.follower_count.toLocaleString()} Followers
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 hidden sm:inline"></span>
          </div>

          {/* Sync Freshness and Refresh button (FR-2.4) */}
          <div className="hidden md:flex items-center gap-2 text-xs text-slate-400">
            <span className="text-slate-400">{lastSyncedText}</span>
            <button
              onClick={triggerManualSync}
              disabled={isSyncing}
              title="Refresh social analytics"
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-indigo-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Right: Net Monetized Revenue Badge & Connect Account */}
        <div className="flex items-center gap-3">
          {/* Net Monetized Revenue Badge */}
          <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-950/40 border border-emerald-800/50 text-xs">
            <span className="text-emerald-400 font-medium">Net Revenue:</span>
            <span className="font-bold text-white font-mono">
              {formatCurrency(currentCreator.monthly_revenue)}/mo
            </span>
          </div>

          {/* Connect Account button */}
          <button
            onClick={() => setConnectModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-md shadow-indigo-600/20 active:scale-95"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Connect Account</span>
          </button>
        </div>
      </header>

      {/* Connect Account OAuth Modal */}
      <ConnectModal 
        isOpen={connectModalOpen} 
        onClose={() => setConnectModalOpen(false)} 
      />
    </>
  );
};
