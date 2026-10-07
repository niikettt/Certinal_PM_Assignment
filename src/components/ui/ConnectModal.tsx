'use client';

import React, { useState } from 'react';
import { X, Instagram, Youtube, Video, CheckCircle2, ShieldCheck, Lock, ExternalLink } from 'lucide-react';
import { useCreatorStore } from '@/lib/store';

interface ConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ConnectModal: React.FC<ConnectModalProps> = ({ isOpen, onClose }) => {
  const { currentCreator } = useCreatorStore();
  const [connectingPlatform, setConnectingPlatform] = useState<string | null>(null);
  const [connectedState, setConnectedState] = useState<Record<string, boolean>>({
    instagram: true,
    tiktok: true,
    youtube: false,
  });

  if (!isOpen) return null;

  const handleConnect = (platform: string) => {
    setConnectingPlatform(platform);
    setTimeout(() => {
      setConnectedState((prev) => ({ ...prev, [platform]: true }));
      setConnectingPlatform(null);
    }, 1200);
  };

  const handleDisconnect = (platform: string) => {
    setConnectedState((prev) => ({ ...prev, [platform]: false }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg rounded-2xl glass-panel-glow border border-slate-700 bg-slate-900/95 p-6 text-slate-100 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-brand-emerald" />
              Connected Social Accounts
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Syncing analytics for <span className="text-indigo-400 font-semibold">{currentCreator.full_name}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Read-Only Scope Guarantee Banner (from SRS Section 14) */}
        <div className="my-4 p-3 rounded-xl bg-indigo-950/40 border border-indigo-800/50 flex items-start gap-2.5">
          <Lock className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
          <div className="text-xs text-indigo-200 leading-relaxed">
            <span className="font-semibold text-white">Zero-Risk Read-Only Permissions:</span> CreatorPulse never requests write/post permissions and will never post on your behalf. Tokens are encrypted at rest with AES-256.
          </div>
        </div>

        {/* Platform items */}
        <div className="space-y-3 my-4">
          {/* Instagram */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white shadow-md">
                <Instagram className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white flex items-center gap-2">
                  Instagram Professional
                  {connectedState.instagram && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono border border-emerald-500/20">
                      SYNCED
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400">Insights, Reach, Post Metrics & Stories</p>
              </div>
            </div>
            {connectedState.instagram ? (
              <button
                onClick={() => handleDisconnect('instagram')}
                className="text-xs text-rose-400 hover:text-rose-300 font-medium px-3 py-1.5 rounded-lg hover:bg-rose-950/30 transition-colors"
              >
                Disconnect
              </button>
            ) : (
              <button
                onClick={() => handleConnect('instagram')}
                disabled={connectingPlatform === 'instagram'}
                className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 shadow"
              >
                {connectingPlatform === 'instagram' ? 'Connecting...' : 'Connect'}
              </button>
            )}
          </div>

          {/* TikTok */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-950 border border-slate-700 flex items-center justify-center text-white shadow-md">
                <Video className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white flex items-center gap-2">
                  TikTok Creator
                  {connectedState.tiktok && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono border border-emerald-500/20">
                      SYNCED
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400">Video views, completion rates, Spark Ads</p>
              </div>
            </div>
            {connectedState.tiktok ? (
              <button
                onClick={() => handleDisconnect('tiktok')}
                className="text-xs text-rose-400 hover:text-rose-300 font-medium px-3 py-1.5 rounded-lg hover:bg-rose-950/30 transition-colors"
              >
                Disconnect
              </button>
            ) : (
              <button
                onClick={() => handleConnect('tiktok')}
                disabled={connectingPlatform === 'tiktok'}
                className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 shadow"
              >
                {connectingPlatform === 'tiktok' ? 'Connecting...' : 'Connect'}
              </button>
            )}
          </div>

          {/* YouTube */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-600/90 flex items-center justify-center text-white shadow-md">
                <Youtube className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white flex items-center gap-2">
                  YouTube Analytics
                  {connectedState.youtube && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono border border-emerald-500/20">
                      SYNCED
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400">Shorts & Long-form integration views, CPM</p>
              </div>
            </div>
            {connectedState.youtube ? (
              <button
                onClick={() => handleDisconnect('youtube')}
                className="text-xs text-rose-400 hover:text-rose-300 font-medium px-3 py-1.5 rounded-lg hover:bg-rose-950/30 transition-colors"
              >
                Disconnect
              </button>
            ) : (
              <button
                onClick={() => handleConnect('youtube')}
                disabled={connectingPlatform === 'youtube'}
                className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 shadow"
              >
                {connectingPlatform === 'youtube' ? 'Connecting...' : 'Connect OAuth'}
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs text-slate-400">
          <span className="flex items-center gap-1 text-slate-400">
            <CheckCircle2 className="w-3.5 h-3.5 text-brand-emerald" />
            GDPR & DPDP compliant
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
