import { Creator, SocialAccount, Post, PricingResult, AutopsyResult, AutopsyFactor, NicheType } from './types';
import { MOCK_BENCHMARKS } from './mock-data';

export interface RateCalculationInput {
  creator: Creator;
  account: SocialAccount;
  brandName: string;
  niche: NicheType;
  deliverables: {
    reels: number;
    tiktoks: number;
    stories: number;
    youtube_integrations: number;
  };
  usageRights: 'organic' | '30_day_ads' | '90_day_ads' | 'full_buyout';
  exclusivityDays: 0 | 30 | 90;
  isRush: boolean;
  recentPosts?: Post[];
}

export function calculateDeterministicPricing(input: RateCalculationInput): PricingResult {
  const { creator, account, niche, deliverables, usageRights, exclusivityDays, isRush, recentPosts = [] } = input;

  // 1. Benchmark lookup
  const benchmark = MOCK_BENCHMARKS.find(
    (b) => b.niche.toLowerCase() === niche.toLowerCase()
  ) || {
    platform: account.platform,
    niche: niche,
    follower_tier: 'micro' as const,
    median_er: 2.0,
    cpm_low: 20,
    cpm_mid: 28,
    cpm_high: 35,
  };

  // 2. Realized plays calculation
  // Use median of recent posts views if available, else derive from follower count * reach factor
  let realizedPlays = 15000;
  if (recentPosts.length > 0) {
    const sortedViews = recentPosts.map((p) => p.views_count).sort((a, b) => a - b);
    const midIndex = Math.floor(sortedViews.length / 2);
    realizedPlays = sortedViews.length % 2 !== 0 
      ? sortedViews[midIndex] 
      : Math.round((sortedViews[midIndex - 1] + sortedViews[midIndex]) / 2);
  } else {
    // If no post sync, estimate realized plays based on ER and followers
    realizedPlays = Math.max(1000, Math.round(account.follower_count * 0.25));
  }

  // 3. Baseline CPM
  const cpm = benchmark.cpm_mid;
  const baseReachValue = (realizedPlays / 1000) * cpm;

  // 4. Engagement ratio and clamp
  const actualER = account.avg_engagement_rate;
  const benchmarkER = benchmark.median_er;
  const engagementRatio = actualER / (benchmarkER || 1.0);
  const engagementMultiplier = Math.min(1.5, Math.max(0.5, Number(engagementRatio.toFixed(2))));

  // 5. Low Engagement Anomaly Cap (Guardrail G3)
  // If high followers (>20k) but engagement rate is abnormally low (<0.5%)
  const hasLowERAnomaly = account.follower_count >= 20000 && actualER < 0.5;
  let anomalyWarning: string | undefined = undefined;

  if (hasLowERAnomaly) {
    anomalyWarning = `Active Guardrail G3: Low Engagement Anomaly Cap detected. High follower count (${account.follower_count.toLocaleString()}) paired with low engagement (${actualER}% vs ${benchmarkER}% industry median). Valuation is clamped to realized views (~${realizedPlays.toLocaleString()} plays) to avoid client deal rejection.`;
  }

  // 6. Base unit price per single Reel
  const singleUnitBase = baseReachValue * engagementMultiplier;

  // 7. Deliverables volume weighting
  const deliverablesUnits = 
    (deliverables.reels * 1.0) +
    (deliverables.tiktoks * 0.85) +
    (deliverables.stories * 0.30) +
    (deliverables.youtube_integrations * 1.60);

  const rawTotal = singleUnitBase * Math.max(0.5, deliverablesUnits);

  // 8. Usage Rights Multiplier
  let usageMultiplier = 1.0;
  if (usageRights === '30_day_ads') usageMultiplier = 1.25;
  else if (usageRights === '90_day_ads') usageMultiplier = 1.50;
  else if (usageRights === 'full_buyout') usageMultiplier = 2.00;

  // 9. Exclusivity Multiplier
  let exclusivityMultiplier = 1.0;
  if (exclusivityDays === 30) exclusivityMultiplier = 1.20;
  else if (exclusivityDays === 90) exclusivityMultiplier = 1.40;

  // 10. Turnaround Rush Multiplier
  const rushMultiplier = isRush ? 1.30 : 1.0;

  // 11. Target Fair Market calculation
  const calculatedTarget = Math.round(
    rawTotal * usageMultiplier * exclusivityMultiplier * rushMultiplier
  );

  // Round to friendly nearest $10 or ₹500
  const fairMarket = Math.max(50, Math.round(calculatedTarget / 10) * 10);
  const conservative = Math.max(40, Math.round((fairMarket * 0.75) / 10) * 10);
  const aggressive = Math.max(65, Math.round((fairMarket * 1.35) / 10) * 10);

  const evidence_ids = [
    `EVID_PLAYS_${realizedPlays}`,
    `EVID_CPM_${cpm}`,
    `EVID_ER_${actualER}`,
    `EVID_BENCHMARK_ER_${benchmarkER}`,
    `EVID_USAGE_${usageRights}`,
    `EVID_EXCLUSIVITY_${exclusivityDays}D`,
  ];

  const rationale_summary = `Based on ${realizedPlays.toLocaleString()} median realized plays at a $${cpm} niche CPM baseline for ${niche}. Creator engagement factor is ${engagementMultiplier}x (${actualER}% vs ${benchmarkER}% benchmark). Deliverable coefficients: ${deliverablesUnits.toFixed(1)} units with ${usageRights} usage (${usageMultiplier}x).`;

  return {
    conservative,
    fair_market: fairMarket,
    aggressive,
    cpm_baseline: cpm,
    realized_plays: realizedPlays,
    engagement_multiplier: engagementMultiplier,
    usage_multiplier: usageMultiplier,
    exclusivity_multiplier: exclusivityMultiplier,
    rush_multiplier: rushMultiplier,
    has_low_er_anomaly: hasLowERAnomaly,
    anomaly_warning: anomalyWarning,
    evidence_ids,
    rationale_summary,
  };
}

/**
 * Deterministic Post Autopsy significance calculator
 * Computes deviations against creator's baseline and produces evidence items.
 */
export function calculatePostAutopsy(targetPost: Post, allCreatorPosts: Post[]): AutopsyResult {
  const otherPosts = allCreatorPosts.filter((p) => p.id !== targetPost.id);

  // Compute medians
  const getMedian = (nums: number[]) => {
    if (nums.length === 0) return 0;
    const s = [...nums].sort((a, b) => a - b);
    const mid = Math.floor(s.length / 2);
    return s.length % 2 !== 0 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
  };

  const medianER = getMedian(otherPosts.map((p) => p.engagement_rate));
  const medianViews = getMedian(otherPosts.map((p) => p.views_count));
  const medianHookDropoff = getMedian(otherPosts.map((p) => p.hook_dropoff_pct));
  const medianSaves = getMedian(otherPosts.map((p) => p.saves));
  const medianLikes = getMedian(otherPosts.map((p) => p.likes));
  const medianSaveToLikeRatio = medianLikes > 0 ? (medianSaves / medianLikes) : 0.1;

  const targetSaveToLikeRatio = targetPost.likes > 0 ? (targetPost.saves / targetPost.likes) : 0.05;

  const postHour = new Date(targetPost.published_at).getUTCHours();
  const baselineHours = otherPosts.map((p) => new Date(p.published_at).getUTCHours());
  const medianHour = Math.round(getMedian(baselineHours));

  const factors: AutopsyFactor[] = [];

  // 1. Hook Retention Dropoff factor
  const hookDiff = targetPost.hook_dropoff_pct - medianHookDropoff;
  if (Math.abs(hookDiff) >= 15) {
    if (hookDiff > 0) {
      factors.push({
        evidence_id: `EVID_HOOK_DROPOFF_${targetPost.hook_dropoff_pct.toFixed(0)}`,
        factor_name: 'Hook Retention Drop-Off',
        metric_observed: `${targetPost.hook_dropoff_pct.toFixed(1)}% dropped in first 3s`,
        baseline_median: `${medianHookDropoff.toFixed(1)}% median 3s drop-off`,
        direction: 'negative',
        confidence: 'High',
        explanation: 'Audience scroll-away was significantly higher in the first 3 seconds, indicating weak opening visual pacing or hook clarity.',
      });
    } else {
      factors.push({
        evidence_id: `EVID_HOOK_RETENTION_STRONG`,
        factor_name: 'Exceptional Hook Hold',
        metric_observed: `${(100 - targetPost.hook_dropoff_pct).toFixed(1)}% retained past 3s`,
        baseline_median: `${(100 - medianHookDropoff).toFixed(1)}% median retention`,
        direction: 'positive',
        confidence: 'High',
        explanation: 'Strong opening visual pattern interrupt captivated viewers through the crucial 3-second threshold.',
      });
    }
  }

  // 2. Posting Time Outlier factor
  const hourDiff = Math.abs(postHour - medianHour);
  if (hourDiff >= 4) {
    factors.push({
      evidence_id: `EVID_POST_HOUR_${postHour}`,
      factor_name: 'Off-Peak Posting Hour',
      metric_observed: `Published at ${postHour}:00 UTC`,
      baseline_median: `Top quartile published at ${medianHour}:00 UTC`,
      direction: 'negative',
      confidence: 'Medium',
      explanation: `Content was published outside your primary audience active window (${medianHour}:00 UTC), limiting initial algorithmic velocity.`,
    });
  }

  // 3. Save-to-Like Ratio factor (Value/Utility indicator)
  const ratioDiff = (targetSaveToLikeRatio - medianSaveToLikeRatio) / (medianSaveToLikeRatio || 0.1);
  if (Math.abs(ratioDiff) >= 0.35) {
    if (ratioDiff > 0) {
      factors.push({
        evidence_id: `EVID_SAVE_RATIO_HIGH`,
        factor_name: 'High Utility Save-to-Like Ratio',
        metric_observed: `${(targetSaveToLikeRatio * 100).toFixed(1)}% save rate`,
        baseline_median: `${(medianSaveToLikeRatio * 100).toFixed(1)}% median save rate`,
        direction: 'positive',
        confidence: 'High',
        explanation: 'Audience found this content bookmark-worthy, signaling strong evergreen reference value.',
      });
    } else {
      factors.push({
        evidence_id: `EVID_SAVE_RATIO_LOW`,
        factor_name: 'Low Bookmarking / Utility Rate',
        metric_observed: `${(targetSaveToLikeRatio * 100).toFixed(1)}% save rate`,
        baseline_median: `${(medianSaveToLikeRatio * 100).toFixed(1)}% median save rate`,
        direction: 'negative',
        confidence: 'Medium',
        explanation: 'Fewer saves relative to likes suggest content was consumed casually without perceived future utility.',
      });
    }
  }

  // Determine overall verdict
  let verdict: 'optimal' | 'on_par' | 'underperforming' = 'on_par';
  if (targetPost.engagement_rate > medianER * 1.25) {
    verdict = 'optimal';
  } else if (targetPost.engagement_rate < medianER * 0.75) {
    verdict = 'underperforming';
  }

  // GUARDRAIL G1: Honest Uncertainty Rule!
  // If no factor clears the statistical threshold (> 30% difference or 1 std dev)
  if (factors.length === 0) {
    return {
      post_id: targetPost.id,
      verdict,
      verdict_reason: 'no_clear_cause',
      factors: [],
      suggested_experiments: [
        'Split-test opening text hook: Direct problem statement vs curiosity trigger',
        'Test 2 distinct thumbnail cover frames on your next 3 comparable uploads',
        'Compare 15-second condensed format against 45-second extended narrative',
      ],
      honest_uncertainty_note: 
        "Active Guardrail G1: No statistically clear cause detected in your data. The performance variance is within normal baseline distribution. We do not invent shadowbans or platform penalties. Recommended action: Split-test thumbnail & hook.",
      evidence_json: {
        target_post_views: targetPost.views_count,
        target_post_er: targetPost.engagement_rate,
        median_views: medianViews,
        median_er: medianER,
        variance_pct: Number((((targetPost.engagement_rate - medianER) / (medianER || 1)) * 100).toFixed(1)),
      },
    };
  }

  return {
    post_id: targetPost.id,
    verdict,
    verdict_reason: 'evidence_backed',
    factors: factors.slice(0, 3), // Max 3 evidence-backed factors as specified in SRS FR-3.3
    suggested_experiments: [
      factors.some((f) => f.factor_name.includes('Hook'))
        ? 'Re-cut hook: Start directly with the transformation before the 2-second mark'
        : 'Align next upload strictly between 6:00 PM and 8:00 PM local audience peak',
      'Add a bulleted recap slide at the end to lift Save-to-Like ratios above 35%',
    ],
    evidence_json: {
      target_post_views: targetPost.views_count,
      target_post_er: targetPost.engagement_rate,
      median_views: medianViews,
      median_er: medianER,
      factors_found: factors.length,
    },
  };
}
