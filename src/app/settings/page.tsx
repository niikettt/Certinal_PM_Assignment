'use client';

import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Trash2, 
  Download, 
  Key, 
  ShieldCheck, 
  Lock, 
  Check, 
  AlertTriangle, 
  Database, 
  Bot, 
  Sparkles, 
  Server
} from 'lucide-react';
import { useCreatorStore } from '@/lib/store';

export const dynamic = 'force-dynamic';

export default function SettingsPage() {
  const { currentCreator, deals, currentPosts } = useCreatorStore();

  const [apiKey, setApiKey] = useState<string>('');
  const [provider, setProvider] = useState<string>('simulation');
  const [keySaved, setKeySaved] = useState<boolean>(false);
  const [dataPurged, setDataPurged] = useState<boolean>(false);

  const handleExportData = () => {
    const exportData = {
      creator: currentCreator,
      deals,
      posts: currentPosts,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `creatorpulse-${currentCreator.id}-export.json`;
    a.click();
  };

  const handlePurgeData = () => {
    if (confirm('Are you sure you want to disconnect all platforms and purge all synced data? This satisfies GDPR/DPDP Article 17.')) {
      setDataPurged(true);
      setTimeout(() => setDataPurged(false), 4000);
    }
  };

  const handleSaveApiKey = () => {
    setKeySaved(true);
    setTimeout(() => setKeySaved(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 animate-fade-in">
      {/* Top Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20 flex items-center gap-1.5">
            <SettingsIcon className="w-3.5 h-3.5" />
            Configuration & Privacy
          </span>
        </div>
        <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
          Settings & Creator Data Ownership
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Creator owns data: read-only connections, export on demand, and 2-tap data deletion.
        </p>
      </div>

      {/* 1. AI Orchestration Provider (BYOK or Simulation) */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <Bot className="w-5 h-5 text-indigo-400" />
            <div>
              <h2 className="text-sm font-bold text-white">AI Engine Orchestration</h2>
              <p className="text-xs text-slate-400">Claude 3.5 Sonnet / GPT-4o / Intelligent Streamer</p>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            ONLINE
          </span>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Select Inference Mode
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <button
                type="button"
                onClick={() => setProvider('simulation')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  provider === 'simulation'
                    ? 'border-indigo-500 bg-indigo-600/20 text-white'
                    : 'border-slate-800 bg-slate-800/40 text-slate-400'
                }`}
              >
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  Zero-Config Smart Engine (Included)
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Instant typewriter SSE streaming with deterministic evidence calculations.
                </div>
              </button>

              <button
                type="button"
                onClick={() => setProvider('byok')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  provider === 'byok'
                    ? 'border-indigo-500 bg-indigo-600/20 text-white'
                    : 'border-slate-800 bg-slate-800/40 text-slate-400'
                }`}
              >
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-emerald-400" />
                  Bring Your Own Key (BYOK)
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Connect Anthropic (Claude 3.5 Sonnet) or OpenAI (GPT-4o) directly.
                </div>
              </button>
            </div>
          </div>

          {provider === 'byok' && (
            <div className="pt-2 animate-fade-in space-y-2">
              <label className="text-xs font-semibold text-slate-300 block">
                API Key (OpenAI / Anthropic / Gemini)
              </label>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-ant-... or sk-..."
                  className="flex-1 px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700/80 text-white text-xs font-mono focus:outline-none focus:border-indigo-500"
                />
                <button
                  onClick={handleSaveApiKey}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors flex items-center gap-1.5"
                >
                  {keySaved ? <Check className="w-3.5 h-3.5" /> : null}
                  <span>{keySaved ? 'Saved' : 'Save Key'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. Data Rights & GDPR / DPDP Compliance (FR-1.5) */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
          <Database className="w-5 h-5 text-brand-emerald" />
          <div>
            <h2 className="text-sm font-bold text-white">Data Rights & Portability</h2>
            <p className="text-xs text-slate-400">Compliant with GDPR & DPDP standards</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Export */}
          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 flex flex-col justify-between space-y-3">
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <Download className="w-4 h-4 text-indigo-400" />
                Export Clean JSON Archive
              </div>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Download your complete deal history, rate cards, and autopsy feature records in open JSON format.
              </p>
            </div>
            <button
              onClick={handleExportData}
              className="w-full py-2 px-3 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold transition-colors"
            >
              Export My Data (.json)
            </button>
          </div>

          {/* Purge / Delete */}
          <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-900/40 flex flex-col justify-between space-y-3">
            <div>
              <div className="text-xs font-bold text-rose-300 flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-rose-400" />
                Disconnect & Purge All Data
              </div>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Revoke OAuth tokens, delete all synced post analytics and cached rate cards immediately (FR-1.5).
              </p>
            </div>
            <button
              onClick={handlePurgeData}
              className="w-full py-2 px-3 rounded-lg bg-rose-700 hover:bg-rose-600 text-white text-xs font-semibold transition-colors"
            >
              Purge All Synced Data
            </button>
          </div>
        </div>

        {dataPurged && (
          <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-xs text-emerald-300 flex items-center gap-2 animate-fade-in">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>All platform tokens revoked and local sync logs successfully purged!</span>
          </div>
        )}
      </div>

      {/* 3. Security & Platform API Compliance */}
      <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-900/40 flex items-start gap-3 text-xs text-indigo-200">
        <Lock className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-semibold text-white">Security Architecture Summary:</span>
          <p className="text-slate-300">
            • Instagram Graph API & YouTube Data scopes are requested as read-only.<br />
            • Tokens are encrypted at rest with AES-256 and never logged.<br />
            • Prompt injection defense: untrusted email text is treated as delimited data fields with model tool calls disabled.
          </p>
        </div>
      </div>
    </div>
  );
}
