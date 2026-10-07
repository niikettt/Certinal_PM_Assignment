# CreatorPulse AI — Growth Co-Pilot & Commercial Deal Negotiator

> **Production-Ready Full-Stack Web Application for Social Media Creators & Micro-Influencers (5k–250k followers).**  
> Inspired by the *Crest* Co-Pilot SRS Specification.

![Tech Stack](https://img.shields.io/badge/Stack-Next.js%2014%20App%20Router%20%7C%20TypeScript%20%7C%20TailwindCSS%20%7C%20Supabase-indigo)
![Engine](https://img.shields.io/badge/AI%20Engine-Evidence--Layer%20%2B%20SSE%20Streaming-emerald)
![Guardrails](https://img.shields.io/badge/Guardrails-G1%20through%20G5%20Active-blue)

---

## 🌟 Key Capabilities

1. **Executive Creator Dashboard (`/dashboard`)**:
   - Connected social account switchers (`@AnanyaStyle`, `Aarav Tech`, `Meera Skincare`).
   - Net Creator Revenue (CMR) tracking with target goal progress.
   - Dual-axis interactive **Recharts** analytics (Post Views vs. Engagement Rate).
   - Recent content diagnostics with `[OPTIMAL]` and `[NEEDS AUDIT]` status pills.
   - **Today's Focus** AI card highlighting the highest-leverage commercial action.

2. **Dynamic AI Brand Deal Pricer & Pitch Engine (`/pricer`) — CORE FEATURE**:
   - Split-pane interface calculating rate cards deterministically from verified engagement quality and realized CPMs ($20–$35 niche baselines).
   - **3-Tier Rate Card**: Floor (Conservative), Fair Market Value (Recommended), and Aggressive (Walk-away bundle).
   - **Low Engagement Anomaly Cap (Guardrail G3)**: Automatically detects when a creator has high followers (>20k) but poor engagement (<0.5%, e.g., Meera Iyer with 85k followers & 0.22% ER), capping rate cards at realized reach to prevent client rejection.
   - **Typewriter SSE Streaming Generator**:
     - *Cold Pitch Email* with personalized audience demographics.
     - *Negotiation Counter-Offer Script* for lowball offers.
     - *FTC-Compliant Caption* with auto-enforced `#ad` / `[Paid Partnership]` disclosures.
   - 1-Click "Save Deal to Pipeline" saving directly to the Kanban board.

3. **Algorithmic Post-Mortem & Content Autopsy (`/audit`)**:
   - Post selector and metrics analyzer.
   - Video Hook Drop-off curve chart (Recharts AreaChart showing retention past the 3-second mark).
   - Save-to-like ratio, posting time, and duration evaluations vs. creator 90-day medians.
   - **Honest Uncertainty Protocol (Guardrail G1)**: When post variance is within normal distribution, the AI explicitly states: *"I don't have enough data to determine why this post underperformed. Recommended action: Split-test thumbnail & hook."* (Never hallucinates shadowbans or algorithm penalties).

4. **Deal Pipeline Kanban Tracker (`/deals`)**:
   - Full commercial pipeline: `Idea` ➔ `Pitched` ➔ `Negotiating` ➔ `Won` ➔ `Delivered` ➔ `Invoiced` ➔ `Paid`.
   - Real-time revenue tally (Settled CMR, In Delivery, and Active Pipeline).
   - Stage progression controls with celebration confetti.

5. **Curated Brand Shortlist (`/brands`)**:
   - Pre-vetted sponsor directory filterable by niche (Fitness, Tech, Fashion, Lifestyle, Beauty) and budget tier.
   - 1-Click "Pitch with AI" pre-filling campaign scopes.

6. **Settings & Creator Data Ownership (`/settings`)**:
   - 2-Tap data purge and OAuth token revocation (FR-1.5 GDPR / DPDP Article 17 compliance).
   - Clean JSON export of all creator records and deals.
   - Inference mode toggle (Zero-Config Smart Streamer or Bring Your Own Key for Claude 3.5 Sonnet / GPT-4o).

---

## 🏗️ Architecture & Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Lucide Icons, Recharts, Canvas-Confetti.
- **Backend & APIs**: Next.js Route Handlers with Server-Sent Events (`/api/ai/stream`).
- **Database Schema**: Supabase PostgreSQL with Row Level Security (RLS) policies (`src/db/schema.sql`).
- **Deterministic Math Engine**: All valuation formulas and z-score significance tests are computed in code (`src/lib/evidence-engine.ts`), never left to LLM guesswork.
- **Guardrails Engine**: Strict adherence to G1 (No invented causes), G2 (Mandatory FTC disclosure), G3 (Low-engagement cap), G4 (No fabricated proof), and G5 (Anti-gaming).

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Node.js 18+ (tested on Node v22.18.0)
- npm or pnpm

### 2. Run Locally
```bash
# Navigate to the project directory
cd creatorpulse-ai

# Install dependencies (if not already installed)
npm install

# Run the deterministic math and guardrails test suite
npm run test:math

# Start development server
npm run dev
# OR build and start production server
npm run build
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Built-In Test Personas

Use the dropdown in the sidebar to switch between pre-seeded creator profiles:
1. **Ananya Verma (`@AnanyaStyle`)**:
   - 28.4k Followers, 2.4% ER (Fashion), $1,850/mo active revenue.
   - Demonstrates standard high-performance rate cards and recent diagnostic audits.
2. **Aarav Patel (`@aaravtech`)**:
   - 18k Followers, 3.4% ER (Tech), seeking first paid brand deal.
   - Demonstrates conversion from zero to first brand pitch.
3. **Meera Iyer (`@meera.glow`)**:
   - 85k Followers, **0.22% Low Engagement Anomaly** (Lifestyle).
   - Test case for **Guardrail G3**: Observe how CreatorPulse caps her rate card on realized reach (~20k plays) rather than naive follower pricing ($850).

---

## 📂 Project Directory Structure

```
creatorpulse-ai/
├── src/
│   ├── app/
│   │   ├── api/ai/stream/route.ts  # SSE streaming API handler
│   │   ├── audit/page.tsx          # Screen 3: Post Autopsy
│   │   ├── brands/page.tsx         # Screen 5: Brand Directory
│   │   ├── dashboard/page.tsx      # Screen 1: Executive Dashboard
│   │   ├── deals/page.tsx          # Screen 4: Deal Pipeline Kanban
│   │   ├── pricer/page.tsx         # Screen 2: Brand Deal Pricer (CORE)
│   │   ├── settings/page.tsx       # Screen 6: Data Ownership & Settings
│   │   ├── globals.css             # Dark mode theme & glassmorphism
│   │   └── layout.tsx              # Root app layout
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.tsx          # Top bar with CMR badge & sync
│   │   │   └── Sidebar.tsx         # Responsive sidebar & persona switcher
│   │   └── ui/
│   │       └── ConnectModal.tsx    # OAuth platform connection modal
│   ├── db/
│   │   └── schema.sql              # Supabase PostgreSQL DDL with RLS
│   └── lib/
│       ├── ai-system-prompt.ts     # System prompt with strict principles
│       ├── evidence-engine.ts      # Deterministic CPM & deviation math
│       ├── guardrails.ts           # G1-G5 validation & auto-remediation
│       ├── mock-data.ts            # Seed fixtures for the 3 personas
│       ├── store.ts                # Client reactive state & storage
│       └── types.ts                # Full TypeScript type definitions
├── scripts/
│   └── test-engine.mjs             # Automated unit tests for engine & guardrails
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```
