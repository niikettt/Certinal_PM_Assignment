export type NicheType = 'Fitness' | 'Tech' | 'Fashion' | 'Lifestyle' | 'Beauty';

export type SubscriptionTier = 'free' | 'pro';

export type PlatformType = 'instagram' | 'tiktok' | 'youtube';

export type PostStatus = 'optimal' | 'need_audit';

export type DealStatus = 'pitching' | 'accepted' | 'declined';

export type DealStage = 
  | 'idea' 
  | 'pitched' 
  | 'negotiating' 
  | 'won' 
  | 'delivered' 
  | 'invoiced' 
  | 'paid' 
  | 'lost';

export interface Creator {
  id: string;
  email: string;
  full_name: string;
  niche: NicheType;
  subscription_tier: SubscriptionTier;
  currency: 'USD' | 'INR';
  avatar_url: string;
  bio: string;
  monthly_revenue: number;
  revenue_target: number;
  created_at: string;
}

export interface SocialAccount {
  id: string;
  creator_id: string;
  platform: PlatformType;
  handle: string;
  follower_count: number;
  avg_engagement_rate: number; // e.g. 2.4 for 2.4%
  last_synced_at: string;
  connected: boolean;
}

export interface Post {
  id: string;
  creator_id: string;
  platform: PlatformType;
  post_url: string;
  title: string;
  format: 'reel' | 'story' | 'video' | 'carousel';
  views_count: number;
  engagement_rate: number; // percentage
  retention_rate: number; // percentage
  status: PostStatus;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  duration_s: number;
  hook_dropoff_pct: number;
  caption: string;
  hashtags: string[];
  published_at: string;
  thumbnail_url?: string;
  // Hook retention data points: [0s, 3s, 15s, 30s, 60s]
  retention_curve?: { second: number; retentionPct: number }[];
}

export interface BrandDeal {
  id: string;
  creator_id: string;
  brand_name: string;
  brand_category: NicheType;
  brand_logo_url?: string;
  deliverables: {
    reels: number;
    tiktoks: number;
    stories: number;
    youtube_integrations: number;
  };
  quoted_rate: number;
  ai_suggested_rate: number;
  status: DealStatus;
  stage: DealStage;
  ftc_compliant: boolean;
  usage_rights: 'organic' | '30_day_ads' | '90_day_ads' | 'full_buyout';
  notes?: string;
  created_at: string;
}

export interface Benchmark {
  platform: PlatformType;
  niche: NicheType;
  follower_tier: 'nano' | 'micro' | 'mid';
  median_er: number;
  cpm_low: number;
  cpm_mid: number;
  cpm_high: number;
}

export interface BrandDirectoryItem {
  id: string;
  name: string;
  category: NicheType;
  typical_budget_tier: string;
  min_budget: number;
  max_budget: number;
  preferred_platforms: PlatformType[];
  contact_email: string;
  logo_url: string;
  description: string;
}

export interface PricingResult {
  conservative: number;
  fair_market: number; // recommended
  aggressive: number;
  cpm_baseline: number;
  realized_plays: number;
  engagement_multiplier: number;
  usage_multiplier: number;
  exclusivity_multiplier: number;
  rush_multiplier: number;
  has_low_er_anomaly: boolean;
  anomaly_warning?: string;
  evidence_ids: string[];
  rationale_summary: string;
}

export interface AutopsyFactor {
  evidence_id: string;
  factor_name: string;
  metric_observed: string;
  baseline_median: string;
  direction: 'positive' | 'negative' | 'neutral';
  confidence: 'High' | 'Medium' | 'Low';
  explanation: string;
}

export interface AutopsyResult {
  post_id: string;
  verdict: 'optimal' | 'on_par' | 'underperforming';
  verdict_reason: 'evidence_backed' | 'no_clear_cause';
  factors: AutopsyFactor[];
  suggested_experiments: string[];
  honest_uncertainty_note?: string;
  evidence_json: Record<string, any>;
}
