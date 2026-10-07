import { 
  calculateDeterministicPricing, 
  calculatePostAutopsy 
} from '../src/lib/evidence-engine.ts';
import { 
  enforceFTCCompliance, 
  validateHonestUncertainty, 
  validateEngagementValuation,
  filterAntiGaming 
} from '../src/lib/guardrails.ts';
import { 
  MOCK_CREATORS, 
  MOCK_SOCIAL_ACCOUNTS, 
  MOCK_POSTS 
} from '../src/lib/mock-data.ts';

console.log('--- 1. Testing Deterministic Pricing Engine ---');

// Test A: Ananya (Standard micro-influencer, healthy 2.4% ER)
const ananyaCreator = MOCK_CREATORS[0];
const ananyaAccount = MOCK_SOCIAL_ACCOUNTS['creator-ananya'][0];
const ananyaPricing = calculateDeterministicPricing({
  creator: ananyaCreator,
  account: ananyaAccount,
  brandName: 'Glossier',
  niche: 'Fashion',
  deliverables: { reels: 1, tiktoks: 0, stories: 2, youtube_integrations: 0 },
  usageRights: 'organic',
  exclusivityDays: 0,
  isRush: false,
  recentPosts: MOCK_POSTS['creator-ananya'],
});

console.log('Ananya Pricing:', {
  conservative: ananyaPricing.conservative,
  fair_market: ananyaPricing.fair_market,
  aggressive: ananyaPricing.aggressive,
  has_low_er_anomaly: ananyaPricing.has_low_er_anomaly,
  evidence_ids: ananyaPricing.evidence_ids,
});

if (ananyaPricing.fair_market <= 0 || ananyaPricing.conservative >= ananyaPricing.fair_market) {
  throw new Error('Ananya rate tiers calculation failed');
}

// Test B: Meera (High 85k followers, but 0.22% ER anomaly - Guardrail G3)
const meeraCreator = MOCK_CREATORS[2];
const meeraAccount = MOCK_SOCIAL_ACCOUNTS['creator-meera'][0];
const meeraPricing = calculateDeterministicPricing({
  creator: meeraCreator,
  account: meeraAccount,
  brandName: 'Glow Co',
  niche: 'Lifestyle',
  deliverables: { reels: 1, tiktoks: 0, stories: 0, youtube_integrations: 0 },
  usageRights: 'organic',
  exclusivityDays: 0,
  isRush: false,
  recentPosts: MOCK_POSTS['creator-meera'],
});

console.log('Meera Pricing (Low ER Anomaly Test):', {
  conservative: meeraPricing.conservative,
  fair_market: meeraPricing.fair_market,
  aggressive: meeraPricing.aggressive,
  has_low_er_anomaly: meeraPricing.has_low_er_anomaly,
  anomaly_warning: meeraPricing.anomaly_warning,
});

if (!meeraPricing.has_low_er_anomaly) {
  throw new Error('Guardrail G3 did not trigger for Meera 0.22% ER anomaly');
}

// Check valuation guardrail
const g3Check = validateEngagementValuation(meeraPricing);
console.log('Guardrail G3 Check:', g3Check);

console.log('\n--- 2. Testing Post Autopsy & Guardrail G1 (Honest Uncertainty) ---');

// Post with outlier (11:45 PM publish, 54% hook drop-off)
const flopPost = MOCK_POSTS['creator-ananya'][1];
const flopAutopsy = calculatePostAutopsy(flopPost, MOCK_POSTS['creator-ananya']);
console.log('Flop Post Autopsy Verdict:', flopAutopsy.verdict, flopAutopsy.verdict_reason);
console.log('Flop Factors:', flopAutopsy.factors.map(f => f.factor_name));

if (flopAutopsy.factors.length === 0) {
  throw new Error('Expected evidence-backed factors for known flop post');
}

// Ambiguous Post (Variance is within normal distribution - Guardrail G1 test)
const ambiguousPost = MOCK_POSTS['creator-ananya'][4];
const ambiguousAutopsy = calculatePostAutopsy(ambiguousPost, MOCK_POSTS['creator-ananya']);
console.log('Ambiguous Post Autopsy Verdict:', ambiguousAutopsy.verdict, ambiguousAutopsy.verdict_reason);
console.log('Honest Uncertainty Note:', ambiguousAutopsy.honest_uncertainty_note);

if (ambiguousAutopsy.verdict_reason !== 'no_clear_cause') {
  throw new Error('Expected Guardrail G1 (no_clear_cause) for ambiguous post');
}

const g1Check = validateHonestUncertainty(ambiguousAutopsy, 'Natural variation observed.');
console.log('Guardrail G1 Check:', g1Check);

console.log('\n--- 3. Testing Guardrail G2 (FTC Compliance) ---');
const rawSponsoredCaption = 'Loving my new daily skincare bottle from Glossier! Use code ANANYA for 15% off.';
const { compliantCaption, check: g2Check } = enforceFTCCompliance(rawSponsoredCaption, 'Glossier');
console.log('Compliant Caption:', compliantCaption);
console.log('Guardrail G2 Check:', g2Check);

if (!compliantCaption.includes('#ad') || !compliantCaption.includes('Paid Partnership with Glossier')) {
  throw new Error('Guardrail G2 failed to inject FTC disclosure');
}

console.log('\n--- 4. Testing Guardrail G5 (Anti-Platform Gaming) ---');
const shadyText = 'Join our engagement pod and buy followers to boost your algorithmic reach!';
const { cleanedText, check: g5Check } = filterAntiGaming(shadyText);
console.log('Cleaned Text:', cleanedText);
console.log('Guardrail G5 Check:', g5Check);

if (cleanedText.includes('engagement pod') || cleanedText.includes('buy followers')) {
  throw new Error('Guardrail G5 failed to remove gaming terms');
}

console.log('\nALL ENGINE & GUARDRAIL TESTS PASSED SUCCESSFULLY! ✅');
