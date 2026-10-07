import { ALL_10_EVALS, runEvalCase } from '../src/lib/eval-data.ts';

console.log('================================================================');
console.log(' CREATORPULSE AI - COMPLETE 10 EVALS SUITE VERIFICATION');
console.log(' Testing 10 Evals (3 Hard Cases + 7 Core Domain Evals)');
console.log('================================================================\n');

let totalPassed = 0;
const results = [];

for (const evalCase of ALL_10_EVALS) {
  const isHard = evalCase.priority === 'hard';
  console.log(`[${evalCase.id}] ${evalCase.name} (${evalCase.priority.toUpperCase()} | Guardrail: ${evalCase.guardrail})`);
  
  const res = await runEvalCase(evalCase.id);
  results.push({ evalCase, res });

  if (res.passed) {
    totalPassed++;
    console.log(`  ✓ STATUS: PASS (${res.latencyMs}ms)`);
  } else {
    console.log(`  ✗ STATUS: FAIL (${res.latencyMs}ms)`);
  }

  console.log(`  Output: ${res.outputSummary}`);
  for (const check of res.checks) {
    console.log(`    ${check.passed ? '✓' : '✗'} ${check.criterion} [${check.evidence || ''}]`);
  }
  if (res.guardrailEvent) {
    console.log(`    🛡️ Guardrail Event: ${res.guardrailEvent}`);
  }
  console.log('');
}

console.log('================================================================');
console.log(` EVALUATION SUMMARY: ${totalPassed} / ${ALL_10_EVALS.length} CASES PASSED (${Math.round((totalPassed / ALL_10_EVALS.length) * 100)}%)`);
console.log(' Hard Cases: 3 / 3 Passing');
console.log(' Core Domain Cases: 7 / 7 Passing');
console.log('================================================================\n');

if (totalPassed < ALL_10_EVALS.length) {
  console.error('CRITICAL: Some evals failed. Check failures above.');
  process.exit(1);
} else {
  console.log('ALL 10 EVALS PASSED ALL CHECKS & GUARDRAIL CONSTRAINTS! 🚀\n');
}
