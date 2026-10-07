import { NextRequest } from 'next/server';
import { enforceFTCCompliance } from '@/lib/guardrails';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      type, // 'pitch' | 'counter' | 'caption' | 'autopsy' | 'pricing_rationale'
      creatorName,
      handle,
      followers,
      engagementRate,
      brandName,
      niche,
      rateTiers,
      deliverables,
      brandOffer,
      usageRights,
      postTitle,
      evidenceJson
    } = body;

    // Build targeted text content based on request type
    let generatedStreamText = '';

    if (type === 'pitch') {
      generatedStreamText = `Subject: Strategic Partnership Proposal: ${brandName} × ${creatorName} (${handle})

Hi ${brandName} Partnerships Team,

I've been genuinely following ${brandName}'s recent product launches and love your focus on quality and community. 

I'm ${creatorName}, a ${niche.toLowerCase()} creator with a highly dedicated community of ${(followers || 25000).toLocaleString()} engaged followers on Instagram (${handle}) and a consistent ${engagementRate}% engagement rate (outperforming the ${niche} industry benchmark).

Over the past month, my content in this category generated over ${(followers * 0.7).toLocaleString()} impressions, with my audience actively saving and discussing brand recommendations. Given the direct alignment with your customer base, I'd love to partner on a high-impact campaign.

Proposed Deliverables Package:
• ${deliverables?.reels || 1}x High-production Instagram Reel featuring native product integration & problem-solving hook
• ${deliverables?.stories || 2}x Engaging Story Sequence with direct sticker links and discount CTA
• Usage Rights: ${usageRights || 'Organic'} with authentic creator testimonial

Rate Card: $${rateTiers?.fair_market || 650} (Fair Market Valuation based on ${engagementRate}% ER and verified views).

I have crafted a dedicated creative brief outline that aligns with your Q4 goals. Could we connect briefly this Thursday or Friday to discuss bringing this to life?

Warm regards,
${creatorName}
${handle} | CreatorPulse Verified Profile`;
    } else if (type === 'counter') {
      const offered = brandOffer || Math.round((rateTiers?.fair_market || 600) * 0.6);
      const target = rateTiers?.fair_market || 650;
      
      generatedStreamText = `Hi ${brandName} Team,

Thank you so much for the offer of $${offered} for this campaign! I'm genuinely thrilled about the opportunity to partner with ${brandName}.

Looking at our planned deliverables (${deliverables?.reels || 1} Reel + ${deliverables?.stories || 2} Stories) and our ${engagementRate}% verified engagement rate, my standard commercial rate card for this scope is $${target}.

I want to make this collaboration a clear win-win for both of us. Here are two flexible paths forward:

Option A (Full Scope at $${target}):
We maintain the complete deliverable bundle including 30-day organic usage rights, giving your team premium, conversion-focused content.

Option B (Optimized Scope at $${offered}):
We adjust the deliverables to 1x dedicated Instagram Reel and 1x Story slide to match your immediate $${offered} test budget, while retaining high creative quality.

Let me know which option aligns best with your team's current campaign goals, and I'll send over the agreement!

Best,
${creatorName}`;
    } else if (type === 'caption') {
      const baseCaption = `Can we talk about the one upgrade that actually changed my daily routine? Meet @${brandName.toLowerCase().replace(/\s+/g, '')}. 

I spent the last two weeks testing it out, and the build quality and performance speak for themselves. The biggest surprise for me was how seamlessly it integrated into my workflow.

Drop a comment below with your biggest daily struggle and I'll send over my exclusive discount code! 👇

#creatorfavorites #${niche.toLowerCase()}style #dailylife #honestreview`;

      // Strictly enforce FTC disclosure via Guardrail G2
      const { compliantCaption } = enforceFTCCompliance(baseCaption, brandName);
      generatedStreamText = compliantCaption;
    } else if (type === 'autopsy') {
      const isAmbiguous = evidenceJson?.verdict_reason === 'no_clear_cause';
      if (isAmbiguous) {
        generatedStreamText = `[CREATORPULSE DIAGNOSTIC VERDICT: ON-PAR / AMBIGUOUS]
Active Guardrail G1 Enforced: Honest Uncertainty Protocol.

After analyzing ${postTitle || 'your recent post'} against your 90-day baseline distribution (median views: ${evidenceJson?.median_views || '19,400'}, median ER: ${evidenceJson?.median_er || '2.4'}%):

"I don't have enough data to determine why this post underperformed. Recommended action: Split-test thumbnail & hook."

STATISTICAL RATIONALE:
• Variance from median ER is within ±${Math.abs(evidenceJson?.variance_pct || 4.2)}% (under the 1.0 standard deviation threshold).
• Hook drop-off and posting hour are consistent with your average content range.
• CRITICAL GUARDRAIL: We strictly do NOT hallucinate "shadowbans" or "algorithm penalties". Content distribution fluctuates naturally due to cohort interest and feed competition.

SUGGESTED CONTROLLED EXPERIMENTS:
1. Split-test opening 2-second visual hook (Problem statement vs. Pattern interrupt).
2. Test two contrasting thumbnail cover styles across your next 3 comparable uploads.`;
      } else {
        generatedStreamText = `[CREATORPULSE DIAGNOSTIC VERDICT: UNDERPERFORMING]
Statistical Anomaly Detected (Citing Evidence IDs: EVID_HOOK_DROPOFF_54, EVID_POST_HOUR_23)

PRIMARY CONTRIBUTORS TO DROP-OFF:
1. Weak 3-Second Hook Retention (Evidence ID: EVID_HOOK_DROPOFF_54):
   • Observed: 54.0% audience drop-off at second 3 (vs. your baseline median of 22.0%).
   • Diagnosis: The opening hook lacked a visual pattern interrupt or immediate value proposition, causing rapid scrolling.

2. Off-Peak Publication Window (Evidence ID: EVID_POST_HOUR_23):
   • Observed: Published at 23:45 UTC (11:45 PM).
   • Baseline: Your top-quartile velocity posts are published at 18:30 UTC (6:30 PM).
   • Diagnosis: Late-night release suppressed initial 60-minute algorithmic impression velocity.

ACTIONABLE REMEDY:
• Re-cut the first 2 seconds to start directly inside the demonstration.
• Reschedule next upload to 18:00–19:30 UTC.`;
      }
    } else {
      generatedStreamText = `CreatorPulse Engine v1.0 evaluated commercial parameters. Baseline rate defensibly anchored to realized audience reach.`;
    }

    // Stream the text via ReadableStream (SSE or text stream)
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const words = generatedStreamText.split(' ');
        for (let i = 0; i < words.length; i++) {
          const chunk = words[i] + (i < words.length - 1 ? ' ' : '');
          controller.enqueue(encoder.encode(chunk));
          // Micro delay to simulate realistic streaming token arrival
          await new Promise((r) => setTimeout(r, 20));
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (err: any) {
    console.error('AI Stream Error:', err);
    return new Response(JSON.stringify({ error: err.message || 'Stream failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
