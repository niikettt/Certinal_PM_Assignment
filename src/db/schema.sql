-- ==============================================================================
-- CreatorPulse AI - Production Supabase PostgreSQL Schema
-- Includes Row Level Security (RLS), Enums, Indexes, and Multi-Tenancy
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ENUMS
CREATE TYPE subscription_tier_enum AS ENUM ('free', 'pro');
CREATE TYPE platform_enum AS ENUM ('instagram', 'tiktok', 'youtube');
CREATE TYPE post_status_enum AS ENUM ('optimal', 'need_audit');
CREATE TYPE deal_status_enum AS ENUM ('pitching', 'accepted', 'declined');
CREATE TYPE deal_stage_enum AS ENUM (
  'idea', 
  'pitched', 
  'negotiating', 
  'won', 
  'delivered', 
  'invoiced', 
  'paid', 
  'lost'
);

-- 2. CREATORS TABLE
CREATE TABLE IF NOT EXISTS creators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  niche TEXT NOT NULL CHECK (niche IN ('Fitness', 'Tech', 'Fashion', 'Lifestyle', 'Beauty')),
  subscription_tier subscription_tier_enum NOT NULL DEFAULT 'free',
  currency TEXT NOT NULL DEFAULT 'USD',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. SOCIAL ACCOUNTS TABLE
CREATE TABLE IF NOT EXISTS social_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id UUID NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  platform platform_enum NOT NULL,
  handle TEXT NOT NULL,
  follower_count INTEGER NOT NULL DEFAULT 0,
  avg_engagement_rate FLOAT NOT NULL DEFAULT 0.0,
  avatar_url TEXT,
  token_encrypted TEXT,
  last_synced_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(creator_id, platform)
);

-- 4. POSTS TABLE
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id UUID NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  post_url TEXT NOT NULL,
  title TEXT,
  format TEXT DEFAULT 'reel', -- reel, story, video, carousel
  views_count INTEGER NOT NULL DEFAULT 0,
  engagement_rate FLOAT NOT NULL DEFAULT 0.0,
  retention_rate FLOAT NOT NULL DEFAULT 0.0,
  status post_status_enum NOT NULL DEFAULT 'optimal',
  likes INTEGER NOT NULL DEFAULT 0,
  comments INTEGER NOT NULL DEFAULT 0,
  shares INTEGER NOT NULL DEFAULT 0,
  saves INTEGER NOT NULL DEFAULT 0,
  duration_s INTEGER DEFAULT 45,
  hook_dropoff_pct FLOAT DEFAULT 35.0,
  caption TEXT,
  hashtags TEXT[] DEFAULT '{}',
  published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. BRAND DEALS TABLE
CREATE TABLE IF NOT EXISTS brand_deals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id UUID NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  brand_name TEXT NOT NULL,
  brand_logo_url TEXT,
  deliverables JSONB NOT NULL DEFAULT '{"reels": 1, "stories": 1}',
  quoted_rate FLOAT NOT NULL DEFAULT 0.0,
  ai_suggested_rate FLOAT NOT NULL DEFAULT 0.0,
  status deal_status_enum NOT NULL DEFAULT 'pitching',
  stage deal_stage_enum NOT NULL DEFAULT 'pitched',
  ftc_compliant BOOLEAN NOT NULL DEFAULT true,
  usage_rights TEXT DEFAULT 'organic', -- organic, 30_day_ads, 90_day_ads, full_buyout
  due_dates JSONB DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. BENCHMARKS TABLE (Industry reference table for CPM & ER)
CREATE TABLE IF NOT EXISTS benchmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  platform platform_enum NOT NULL,
  niche TEXT NOT NULL,
  follower_tier TEXT NOT NULL, -- nano (1k-10k), micro (10k-50k), mid (50k-250k)
  median_er FLOAT NOT NULL,
  cpm_low FLOAT NOT NULL,
  cpm_mid FLOAT NOT NULL,
  cpm_high FLOAT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. BRANDS DIRECTORY (Curated brand shortlists)
CREATE TABLE IF NOT EXISTS brands (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  typical_budget_tier TEXT NOT NULL, -- $500-$1.5k, $1.5k-$5k, $5k+
  contact_email TEXT,
  website TEXT,
  description TEXT
);

-- 8. AI RUNS AUDIT LOG (Prompt versioning, evidence JSON & Guardrails ledger)
CREATE TABLE IF NOT EXISTS ai_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id UUID REFERENCES creators(id) ON DELETE CASCADE,
  feature TEXT NOT NULL, -- pricer, pitch, autopsy
  prompt_version TEXT NOT NULL,
  model TEXT NOT NULL,
  evidence_json JSONB NOT NULL,
  output_json JSONB,
  guardrail_flags JSONB DEFAULT '[]',
  latency_ms INTEGER,
  cost_usd FLOAT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_social_accounts_creator ON social_accounts(creator_id);
CREATE INDEX IF NOT EXISTS idx_posts_creator_published ON posts(creator_id, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_brand_deals_creator_stage ON brand_deals(creator_id, stage);
CREATE INDEX IF NOT EXISTS idx_ai_runs_creator ON ai_runs(creator_id, created_at DESC);

-- 10. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE creators ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_runs ENABLE ROW LEVEL SECURITY;

-- Policy templates for authenticated users (mapped to auth.uid() = id or creator_id)
CREATE POLICY "Creators can view and edit own profile" 
  ON creators FOR ALL 
  USING (auth.uid() = id);

CREATE POLICY "Creators can view and edit own social accounts" 
  ON social_accounts FOR ALL 
  USING (auth.uid() = creator_id);

CREATE POLICY "Creators can manage own posts" 
  ON posts FOR ALL 
  USING (auth.uid() = creator_id);

CREATE POLICY "Creators can manage own brand deals" 
  ON brand_deals FOR ALL 
  USING (auth.uid() = creator_id);

CREATE POLICY "Creators can view own AI runs" 
  ON ai_runs FOR ALL 
  USING (auth.uid() = creator_id);
