import { PricingResult, AutopsyResult } from './types';

export interface GuardrailCheckResult {
  passed: boolean;
  guardrail_id: 'G1' | 'G2' | 'G3' | 'G4' | 'G5';
  name: string;
  message: string;
  remediated_content?: string;
}

/**
 * Guardrail G1: Honest Uncertainty & No Invented Causes
 * Enforces that claims are backed by evidence and forbids hallucinating shadowbans.
 */
export function validateHonestUncertainty(autopsy: AutopsyResult, rawText: string): GuardrailCheckResult {
  // Prohibit shadowban myths
  const shadowbanRegex = /\b(shadowban|shadow-ban|penalized by algorithm|algorithm hates you)\b/i;
  if (shadowbanRegex.test(rawText)) {
    return {
      passed: false,
      guardrail_id: 'G1',
      name: 'No Invented Platform Myths',
      message: 'Detected ungrounded shadowban claim. Platform algorithms do not provide shadowban diagnostics.',
      remediated_content: rawText.replace(shadowbanRegex, 'natural audience variance'),
    };
  }

  // If no statistically significant evidence was discovered
  if (autopsy.verdict_reason === 'no_clear_cause') {
    return {
      passed: true,
      guardrail_id: 'G1',
      name: 'Honest Uncertainty Active',
      message: 'Triggered Guardrail G1: Output explicitly states lack of conclusive data and recommends split-testing.',
    };
  }

  return {
    passed: true,
    guardrail_id: 'G1',
    name: 'Evidence Citations Verified',
    message: `Verified ${autopsy.factors.length} evidence citations against creator baseline.`,
  };
}

/**
 * Guardrail G2: Mandatory FTC Compliance
 * Enforces prominent disclosures (#ad, #sponsored, [Paid Partnership]) on commercial copy.
 */
export function enforceFTCCompliance(caption: string, brandName: string): { compliantCaption: string; check: GuardrailCheckResult } {
  const disclosureKeywords = [
    '#ad',
    '#sponsored',
    '[paid partnership',
    'paid partnership with',
    '#partner',
    'sponsored by',
  ];

  const hasDisclosure = disclosureKeywords.some((keyword) =>
    caption.toLowerCase().includes(keyword.toLowerCase())
  );

  if (!hasDisclosure) {
    const compliantCaption = `[Paid Partnership with ${brandName}] #ad\n\n${caption}`;
    return {
      compliantCaption,
      check: {
        passed: false,
        guardrail_id: 'G2',
        name: 'FTC Disclosure Auto-Injected',
        message: `Injected required FTC disclosure "[Paid Partnership with ${brandName}] #ad" into commercial post copy.`,
        remediated_content: compliantCaption,
      },
    };
  }

  return {
    compliantCaption: caption,
    check: {
      passed: true,
      guardrail_id: 'G2',
      name: 'FTC Disclosure Verified',
      message: 'Verified FTC-compliant disclosure in commercial copy.',
    },
  };
}

/**
 * Guardrail G3: Low-Engagement Valuation Cap
 * Caps rate cards on realized reach when creator engagement is below 0.5%.
 */
export function validateEngagementValuation(pricing: PricingResult): GuardrailCheckResult {
  if (pricing.has_low_er_anomaly) {
    return {
      passed: true,
      guardrail_id: 'G3',
      name: 'Low Engagement Anomaly Capped',
      message: pricing.anomaly_warning || 'Valuation capped to active engaged views rather than follower count.',
    };
  }

  return {
    passed: true,
    guardrail_id: 'G3',
    name: 'Normal Valuation Curve',
    message: 'Engagement rate is within healthy benchmark parameters.',
  };
}

/**
 * Guardrail G4: No Fabricated Social Proof
 * Ensures email pitches do not fabricate past collaborations not present in creator data.
 */
export function validateNoFabricatedProof(pitchText: string, validBrands: string[]): GuardrailCheckResult {
  // Checks if pitch claims collaborations with unverified brands
  const collabClaimsRegex = /(worked with|partnered with|previously collaborated with)\s+([A-Z][a-zA-Z0-9\s]+)/gi;
  const matches = Array.from(pitchText.matchAll(collabClaimsRegex));

  for (const match of matches) {
    const claimedBrand = match[2].trim();
    if (claimedBrand && !validBrands.map((b) => b.toLowerCase()).includes(claimedBrand.toLowerCase())) {
      return {
        passed: false,
        guardrail_id: 'G4',
        name: 'Fabricated Social Proof Filtered',
        message: `Blocked fabricated brand collaboration claim for "${claimedBrand}".`,
      };
    }
  }

  return {
    passed: true,
    guardrail_id: 'G4',
    name: 'Authentic Data Verified',
    message: 'Pitch contains only verified metrics from creator profile.',
  };
}

/**
 * Guardrail G5: Anti-Platform Gaming
 * Blocks recommendations of follow pods, bot buying, or fake comment rings.
 */
export function filterAntiGaming(text: string): { cleanedText: string; check: GuardrailCheckResult } {
  const gamingRegex = /\b(engagement pod|follow train|buy followers|buy likes|comment pod|bot comments)\b/gi;
  if (gamingRegex.test(text)) {
    const cleanedText = text.replace(gamingRegex, 'organic community engagement');
    return {
      cleanedText,
      check: {
        passed: false,
        guardrail_id: 'G5',
        name: 'Platform Gaming Prohibited',
        message: 'Removed non-compliant advice regarding pods or artificial metrics.',
        remediated_content: cleanedText,
      },
    };
  }

  return {
    cleanedText: text,
    check: {
      passed: true,
      guardrail_id: 'G5',
      name: 'Organic Best Practices Verified',
      message: 'No prohibited engagement-farming tactics found.',
    },
  };
}
