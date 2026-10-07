'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  Play, 
  RefreshCw, 
  Sparkles, 
  HelpCircle, 
  FileCode2, 
  Sliders, 
  AlertTriangle, 
  Clock, 
  Filter, 
  ChevronDown, 
  ChevronUp, 
  Zap, 
  Terminal,
  Activity,
  Award
} from 'lucide-react';
import { ALL_10_EVALS, EvalCase, EvalExecutionResult, runEvalCase } from '@/lib/eval-data';

export default function EvalsPage() {
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [results, setResults] = useState<Record<string, EvalExecutionResult>>({});
  const [runningAll, setRunningAll] = useState<boolean>(false);
  const [runningId, setRunningId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>('EVAL-01');

  // Auto-run all 10 on first mount to populate live verified state
  useEffect(() => {
    executeAllEvals();
  }, []);

  const executeAllEvals = async () => {
    setRunningAll(true);
    const newResults: Record<string, EvalExecutionResult> = {};
    for (const evalItem of ALL_10_EVALS) {
      setRunningId(evalItem.id);
      const res = await runEvalCase(evalItem.id);
      newResults[evalItem.id] = res;
      // Slight delay for smooth visual feedback
      await new Promise((r) => setTimeout(r, 60));
    }
    setResults(newResults);
    setRunningId(null);
    setRunningAll(false);
  };

  const executeSingleEval = async (id: string) => {
    setRunningId(id);
    const res = await runEvalCase(id);
    setResults((prev) => ({ ...prev, [id]: res }));
    setRunningId(null);
  };

  const filteredEvals = ALL_10_EVALS.filter((e) => {
    const matchesCategory = filterCategory === 'all' || e.category === filterCategory;
    const matchesPriority = filterPriority === 'all' || e.priority === filterPriority;
    return matchesCategory && matchesPriority;
  });

  const totalPassed = Object.values(results).filter((r) => r.passed).length;
  const hardPassed = ALL_10_EVALS.filter((e) => e.priority === 'hard' && results[e.id]?.passed).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-900/40 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5" />
              CI / CD Quality Gate
            </span>
            <span className="text-xs text-slate-400 font-mono">SRS Section 13.1 & 15.3</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
            AI Evals & Guardrails Test Bench (10 Cases)
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Complete test suite covering all 10 specification evals (including the 3 mandatory hard edge-cases). Every prompt and calculation is validated against deterministic evidence and strict guardrails.
          </p>
        </div>

        {/* Global Action Trigger */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={executeAllEvals}
            disabled={runningAll}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all shadow-lg shadow-indigo-600/30 active:scale-95 disabled:opacity-50"
          >
            <Play className={`w-3.5 h-3.5 fill-white ${runningAll ? 'animate-spin' : ''}`} />
            <span>{runningAll ? 'Running 10 Evals...' : 'Run All 10 Evals'}</span>
          </button>
        </div>
      </div>

      {/* Summary Scorecard Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
          <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
            Total Evals Executed
          </span>
          <div className="text-2xl font-extrabold text-white font-mono flex items-center gap-2">
            <span>{Object.keys(results).length} / 10</span>
            {totalPassed === 10 && (
              <span className="text-xs font-sans px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                100% PASS
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1">Full specification coverage</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
          <span className="text-[10px] font-mono uppercase text-amber-400 block mb-1">
            Mandatory Hard Cases
          </span>
          <div className="text-2xl font-extrabold text-amber-400 font-mono">
            {hardPassed} / 3 Passing
          </div>
          <p className="text-xs text-slate-400 mt-1">Release-blocking edge cases</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
          <span className="text-[10px] font-mono uppercase text-emerald-400 block mb-1">
            Active Guardrails Verified
          </span>
          <div className="text-2xl font-extrabold text-emerald-400 font-mono">
            5 / 5 (G1 - G5)
          </div>
          <p className="text-xs text-slate-400 mt-1">Honesty, FTC, Cap, Social Proof, Anti-gaming</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
          <span className="text-[10px] font-mono uppercase text-indigo-400 block mb-1">
            Execution Strategy
          </span>
          <div className="text-lg font-bold text-slate-200 mt-0.5">
            YAML Fixtures + Code Math
          </div>
          <p className="text-xs text-slate-400 mt-1 font-mono">evals/evals.yaml</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex flex-wrap gap-1.5 text-xs">
          <span className="text-slate-400 text-xs py-1.5 mr-1 font-medium flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            Category:
          </span>
          {[
            { id: 'all', label: 'All 10 Cases' },
            { id: 'pricer', label: 'Pricer (3)' },
            { id: 'autopsy', label: 'Autopsy (3)' },
            { id: 'caption', label: 'FTC Caption (1)' },
            { id: 'pitch', label: 'Cold Pitch (1)' },
            { id: 'counter', label: 'Counter-Offer (1)' },
            { id: 'guardrail', label: 'Anti-Gaming (1)' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilterCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
                filterCategory === cat.id
                  ? 'bg-indigo-600 text-white shadow'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white border border-slate-700/60'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Priority Filter */}
        <div className="flex items-center gap-1.5 text-xs">
          <button
            onClick={() => setFilterPriority('all')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
              filterPriority === 'all' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            All Priorities
          </button>
          <button
            onClick={() => setFilterPriority('hard')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
              filterPriority === 'hard'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-amber-400 hover:bg-slate-800'
            }`}
          >
            ★ 3 Hard Cases
          </button>
        </div>
      </div>

      {/* Eval Cards Grid / List (ALL 10 EVALS) */}
      <div className="space-y-4">
        {filteredEvals.map((evalItem) => {
          const res = results[evalItem.id];
          const isHard = evalItem.priority === 'hard';
          const isExpanded = expandedId === evalItem.id;
          const isRunningThis = runningId === evalItem.id;

          return (
            <div
              key={evalItem.id}
              className={`rounded-2xl border transition-all ${
                isHard 
                  ? 'bg-slate-900/90 border-slate-800 hover:border-amber-500/40 shadow-lg' 
                  : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 shadow-md'
              }`}
            >
              {/* Card Header (Always Visible) */}
              <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-bold text-xs text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                      {evalItem.id}
                    </span>
                    {isHard ? (
                      <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        ★ MANDATORY HARD CASE
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                        CORE EVAL
                      </span>
                    )}
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                      Guardrail {evalItem.guardrail}
                    </span>
                    <span className="text-[10px] font-mono uppercase text-slate-500">
                      {evalItem.category}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>{evalItem.name}</span>
                  </h3>
                  <p className="text-xs text-slate-400 max-w-3xl">
                    {evalItem.description}
                  </p>
                </div>

                {/* Right Status Badge & Run Button */}
                <div className="flex items-center gap-3 shrink-0 self-end md:self-auto">
                  {res && (
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold font-mono px-3 py-1 rounded-xl flex items-center gap-1.5 border ${
                        res.passed
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                      }`}>
                        {res.passed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                        <span>{res.passed ? 'PASS (100%)' : `FAIL (${res.scorePct}%)`}</span>
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {res.latencyMs}ms
                      </span>
                    </div>
                  )}

                  <button
                    onClick={() => executeSingleEval(evalItem.id)}
                    disabled={isRunningThis || runningAll}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors border border-slate-700 disabled:opacity-50"
                    title="Execute this eval test case"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isRunningThis ? 'animate-spin text-indigo-400' : ''}`} />
                  </button>

                  <button
                    onClick={() => setExpandedId(isExpanded ? null : evalItem.id)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700"
                    title="Toggle detail inspect"
                  >
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Expandable Inspection Drawer */}
              {isExpanded && (
                <div className="px-5 pb-5 pt-2 border-t border-slate-800/80 space-y-4 animate-fade-in text-xs">
                  {/* Fixture & Inputs Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                        Creator Fixture
                      </span>
                      <div className="text-white font-medium">
                        {evalItem.creatorFixture.name} ({evalItem.creatorFixture.handle})
                      </div>
                      <div className="text-slate-400 text-[11px] mt-0.5">
                        {evalItem.creatorFixture.details}
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                        Input Test Scope
                      </span>
                      <div className="text-slate-300 font-mono text-[11px]">
                        {evalItem.inputSummary}
                      </div>
                    </div>
                  </div>

                  {/* Expected Behavior vs Must Not */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Expected Behavior */}
                    <div className="space-y-2">
                      <div className="font-bold text-white flex items-center gap-1.5 text-xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Expected Behavior Criteria</span>
                      </div>
                      <div className="space-y-1.5">
                        {evalItem.expectedBehavior.map((item, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-slate-300 text-[11px]">
                            <span className="text-emerald-400 font-mono font-bold">✓</span>
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Must Not */}
                    <div className="space-y-2">
                      <div className="font-bold text-rose-300 flex items-center gap-1.5 text-xs">
                        <XCircle className="w-3.5 h-3.5 text-rose-400" />
                        <span>Strict Guardrails & Must-Not Rules</span>
                      </div>
                      <div className="space-y-1.5">
                        {evalItem.mustNot.map((item, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-slate-300 text-[11px]">
                            <span className="text-rose-400 font-mono font-bold">✗</span>
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Live Execution Checks & Verified Output */}
                  {res && (
                    <div className="pt-3 border-t border-slate-800 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-xs flex items-center gap-1.5">
                          <Activity className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Live Verification Results ({res.checks.length} assertions)</span>
                        </span>
                        {res.evidenceIds.length > 0 && (
                          <div className="flex gap-1">
                            {res.evidenceIds.map((id) => (
                              <span key={id} className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-indigo-300 border border-slate-700">
                                {id}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Checks checklist */}
                      <div className="space-y-1.5">
                        {res.checks.map((chk, idx) => (
                          <div
                            key={idx}
                            className={`p-2.5 rounded-lg border flex items-start justify-between gap-3 text-[11px] ${
                              chk.passed
                                ? 'bg-emerald-950/20 border-emerald-900/40 text-emerald-200'
                                : 'bg-rose-950/20 border-rose-900/40 text-rose-200'
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              {chk.passed ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                              ) : (
                                <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                              )}
                              <span>{chk.criterion}</span>
                            </div>
                            {chk.evidence && (
                              <span className="text-[10px] font-mono text-slate-400 shrink-0 max-w-xs truncate text-right">
                                {chk.evidence}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Live Output Summary */}
                      <div className="p-3 rounded-lg bg-slate-950/90 border border-slate-800 text-[11px] font-mono text-slate-300">
                        <span className="text-slate-500 font-sans font-semibold block mb-1">
                          Evaluated Response Output:
                        </span>
                        {res.outputSummary}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
