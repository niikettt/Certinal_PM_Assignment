'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Calculator, 
  Microscope, 
  Kanban, 
  Building2, 
  Settings, 
  ChevronDown, 
  TrendingUp, 
  Sparkles, 
  DollarSign, 
  ShieldAlert,
  Zap,
  Menu,
  X
} from 'lucide-react';
import { useCreatorStore } from '@/lib/store';
import { MOCK_CREATORS } from '@/lib/mock-data';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { 
    currentCreator, 
    switchCreator, 
    currency, 
    toggleCurrency, 
    formatCurrency 
  } = useCreatorStore();

  const [creatorDropdownOpen, setCreatorDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      label: 'AI Deal Pricer',
      href: '/pricer',
      icon: Calculator,
      badge: 'CORE',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
    },
    {
      label: 'Content Autopsy',
      href: '/audit',
      icon: Microscope,
      badge: 'AI Engine',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    },
    {
      label: 'Deal Pipeline',
      href: '/deals',
      icon: Kanban,
      badge: null,
    },
    {
      label: 'Brand Shortlist',
      href: '/brands',
      icon: Building2,
      badge: '300+ Brands',
      badgeColor: 'bg-slate-700/60 text-slate-300 border-slate-600/40',
    },
    {
      label: 'Settings & Data',
      href: '/settings',
      icon: Settings,
      badge: null,
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#0b0f19] border-r border-slate-800/80 text-slate-200">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white shadow-lg shadow-indigo-600/25 group-hover:scale-105 transition-transform">
            <Zap className="w-5 h-5 fill-white text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-bold tracking-tight text-white text-base">
              <span>CreatorPulse</span>
              <span className="text-[11px] font-mono px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">AI</span>
            </div>
            <p className="text-[11px] text-slate-400">Growth & Deal Negotiator</p>
          </div>
        </Link>
      </div>

      {/* Creator Profile Switcher Dropdown */}
      <div className="p-3 border-b border-slate-800/60 relative">
        <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-2 mb-1.5 flex items-center justify-between">
          <span>Active Creator Profile</span>
          <span className="text-emerald-400 flex items-center gap-1 text-[10px] font-normal">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Sync Active
          </span>
        </div>

        <button
          onClick={() => setCreatorDropdownOpen(!creatorDropdownOpen)}
          className="w-full flex items-center justify-between p-2 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 text-left transition-all"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src={currentCreator.avatar_url}
              alt={currentCreator.full_name}
              className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-700 shrink-0"
            />
            <div className="min-w-0">
              <div className="text-xs font-semibold text-white truncate flex items-center gap-1.5">
                {currentCreator.full_name}
                {currentCreator.id === 'creator-meera' && (
                  <span title="Low ER Anomaly Test Case" className="w-2 h-2 rounded-full bg-amber-400 shrink-0"></span>
                )}
              </div>
              <div className="text-[11px] text-slate-400 truncate">
                {currentCreator.niche} • {currentCreator.subscription_tier.toUpperCase()}
              </div>
            </div>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
        </button>

        {/* Dropdown Menu */}
        {creatorDropdownOpen && (
          <div className="absolute left-3 right-3 top-full mt-1.5 z-30 rounded-xl bg-slate-900 border border-slate-700/80 shadow-2xl p-1.5 space-y-1 animate-fade-in">
            <div className="text-[10px] px-2 py-1 text-slate-400 font-mono">
              SWITCH TEST PERSONA:
            </div>
            {MOCK_CREATORS.map((creator) => {
              const isSelected = creator.id === currentCreator.id;
              return (
                <button
                  key={creator.id}
                  onClick={() => {
                    switchCreator(creator.id);
                    setCreatorDropdownOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 p-2 rounded-lg text-left transition-all ${
                    isSelected ? 'bg-indigo-600/20 text-white border border-indigo-500/30' : 'hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <img
                    src={creator.avatar_url}
                    alt={creator.full_name}
                    className="w-7 h-7 rounded-md object-cover shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-medium truncate flex items-center justify-between">
                      <span>{creator.full_name}</span>
                      {creator.id === 'creator-meera' && (
                        <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          Low ER Cap
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">
                      {creator.niche} ({creator.id === 'creator-ananya' ? '28.4k' : creator.id === 'creator-aarav' ? '18k' : '85k'})
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Nav Links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-2 py-1 mb-1">
          Co-Pilot Workspace
        </div>
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href === '/dashboard' && pathname === '/');
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-400'} transition-colors`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border ${
                    isActive ? 'bg-white/20 text-white border-white/30' : item.badgeColor
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Creator Pulse Card & Currency Selector */}
      <div className="p-3 border-t border-slate-800/80 space-y-3">
        {/* Currency Switcher */}
        <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-800/40 border border-slate-700/50">
          <span className="text-[11px] text-slate-400 font-medium">Display Currency:</span>
          <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-md border border-slate-800">
            <button
              onClick={() => toggleCurrency('USD')}
              className={`text-[10px] font-bold px-2 py-0.5 rounded transition-all ${
                currency === 'USD' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              USD ($)
            </button>
            <button
              onClick={() => toggleCurrency('INR')}
              className={`text-[10px] font-bold px-2 py-0.5 rounded transition-all ${
                currency === 'INR' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              INR (₹)
            </button>
          </div>
        </div>

        {/* Monetized Revenue Mini Widget */}
        <div className="p-3 rounded-xl bg-gradient-to-br from-slate-800/80 to-slate-900 border border-slate-700/70">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
            <span className="flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-brand-emerald" />
              Creator Revenue (CMR)
            </span>
            <span className="text-emerald-400 font-bold">+18% MoM</span>
          </div>
          <div className="text-lg font-bold text-white tracking-tight">
            {formatCurrency(currentCreator.monthly_revenue)}
            <span className="text-xs text-slate-400 font-normal"> / mo</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
            <div 
              className="bg-brand-emerald h-full rounded-full transition-all duration-500" 
              style={{ width: `${Math.min(100, (currentCreator.monthly_revenue / currentCreator.revenue_target) * 100)}%` }}
            ></div>
          </div>
          <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1">
            <span>Goal: {formatCurrency(currentCreator.revenue_target)}</span>
            <span>{Math.round((currentCreator.monthly_revenue / currentCreator.revenue_target) * 100)}%</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Hamburger toggle */}
      <div className="lg:hidden fixed top-3 left-3 z-50">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-white shadow-lg"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Desktop fixed sidebar */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 h-screen sticky top-0 z-40">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)}></div>
          <div className="relative w-72 h-full z-50 shadow-2xl">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
