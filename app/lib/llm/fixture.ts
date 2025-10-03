import { AITOutput } from '../schemas/ait.schema';

/**
 * Deterministic dry-run fixture for testing
 */
export const DRY_RUN_FIXTURE: AITOutput = {
  client: {
    business_name: "Green Fork",
    industry: "casual restaurant",
    city: "Albuquerque, NM",
    zip: "87106",
    goal: "foot_traffic",
    monthly_budget_usd: 4000,
    time_horizon_days: 30
  },
  data_summary: {
    first_party: {
      crm_records: 800,
      website_events: 6000,
      email_engagements: 1200
    },
    third_party: {
      market_size_est: 45000,
      notes: "university neighborhood with lunch rush and seasonal demand"
    },
    key_signals: [
      "High visits on /menu and /order-online pages",
      "Lunch specials show strong midday demand"
    ]
  },
  audience_segments: [
    {
      name: "UNM Students & Staff",
      size_estimation: 18000,
      demographics: {
        age_range: "18-34",
        gender: "all",
        geo: "87106"
      },
      priority_score: 92,
      why_priority: "Campus-adjacent; lunch deals & fast service resonate."
    },
    {
      name: "Nearby Professionals (Lunch Crowd)",
      size_estimation: 12000,
      demographics: {
        age_range: "25-54",
        gender: "all",
        geo: "87106, 87110"
      },
      priority_score: 85,
      why_priority: "Weekday foot traffic; value + speed at noon."
    },
    {
      name: "Health-Conscious Locals",
      size_estimation: 8000,
      demographics: {
        age_range: "25-44",
        gender: "all",
        geo: "87106"
      },
      priority_score: 78,
      why_priority: "Brand fit; salads/bowls/veg-forward menu."
    }
  ],
  personas: [
    {
      name: "Busy Grad",
      quote: "I need a quick, healthy lunch between classes."
    },
    {
      name: "Nurse on Break",
      quote: "Fast, filling, not greasy."
    }
  ],
  positioning: {
    value_proposition: "Fast, fresh, affordable bowls and salads near campus.",
    key_messages: [
      "Under-10-minute lunch",
      "Veg-forward options",
      "Student-friendly pricing"
    ],
    proof_points: [
      "4.6★ Google rating",
      "2-minute walk from campus"
    ],
    tagline_options: [
      "Fast. Fresh. Fork.",
      "Campus Fuel, Done Right"
    ]
  },
  targets: {
    geos: ["87106", "87110"],
    age_range: "18-54",
    interests: ["healthy eating", "salads", "meal prep", "campus life"],
    keywords: [
      "healthy lunch near me",
      "salad bowls",
      "quick lunch 87106"
    ],
    lookalike_seeds: ["site_visitors_30d", "instagram_engagers_30d"]
  },
  channels_by_segment: [
    {
      segment: "UNM Students & Staff",
      channels: ["facebook_instagram", "billboards"],
      rationale: "IG Reels + campus-adjacent OOH"
    },
    {
      segment: "Nearby Professionals (Lunch Crowd)",
      channels: ["facebook_instagram", "billboards"],
      rationale: "FB feed + commuter arterials"
    },
    {
      segment: "Health-Conscious Locals",
      channels: ["facebook_instagram"],
      rationale: "IG content + stories"
    }
  ],
  goals_kpis: [
    {
      name: "Foot Traffic Uplift",
      target: "+15% lunch rush visits",
      why: "Based on historical midday sales and budget allocation"
    },
    {
      name: "Average Ticket Size",
      target: "$12+",
      why: "Healthy upsell with smoothies and wraps"
    }
  ],
  assumptions: [
    "Lunch specials remain competitively priced",
    "University semester in session during campaign window",
    "Operational capacity to handle increased rush-hour demand"
  ],
  risks: [
    "Semester breaks reduce demand",
    "Competing restaurants with aggressive lunch promotions",
    "Weather events impacting foot traffic"
  ],
  privacy_notes: {
    pii_present: false,
    consent_gap_notes: ""
  }
};

export const DRY_RUN_MARKDOWN = `# Audience Intelligence Report

## Client Overview

**Business:** Green Fork  
**Industry:** casual restaurant  
**Location:** Albuquerque, NM (87106)  
**Goal:** foot traffic  
**Budget:** $4,000/month  
**Timeframe:** 30 days

---

## Data Summary

### First-Party Data
- CRM Records: 800
- Website Events: 6,000
- Email Engagements: 1,200

### Third-Party Insights
- Market Size: 45,000
- Notes: university neighborhood with lunch rush and seasonal demand

### Key Signals
- High visits on /menu and /order-online pages
- Lunch specials show strong midday demand

---

## Audience Segments

### 1. UNM Students & Staff (Priority: 92/100)
**Size:** ~18,000  
**Demographics:** 18-34, all genders, 87106  
**Why Priority:** Campus-adjacent; lunch deals & fast service resonate.

### 2. Nearby Professionals (Lunch Crowd) (Priority: 85/100)
**Size:** ~12,000  
**Demographics:** 25-54, all genders, 87106, 87110  
**Why Priority:** Weekday foot traffic; value + speed at noon.

### 3. Health-Conscious Locals (Priority: 78/100)
**Size:** ~8,000  
**Demographics:** 25-44, all genders, 87106  
**Why Priority:** Brand fit; salads/bowls/veg-forward menu.

---

## Personas

### Busy Grad
> "I need a quick, healthy lunch between classes."

### Nurse on Break
> "Fast, filling, not greasy."

---

## Positioning & Messaging

**Value Proposition:** Fast, fresh, affordable bowls and salads near campus.

### Key Messages
- Under-10-minute lunch
- Veg-forward options
- Student-friendly pricing

### Proof Points
- 4.6★ Google rating
- 2-minute walk from campus

### Tagline Options
- Fast. Fresh. Fork.
- Campus Fuel, Done Right

---

## Targets & Keywords

**Geography:** 87106, 87110  
**Age Range:** 18-54  

**Interests:** healthy eating, salads, meal prep, campus life  

**Keywords:** healthy lunch near me, salad bowls, quick lunch 87106  

**Lookalike Seeds:** site_visitors_30d, instagram_engagers_30d

---

## Channel Recommendations per Segment

### UNM Students & Staff
**Channels:** Facebook/Instagram, Billboards  
**Rationale:** IG Reels + campus-adjacent OOH

### Nearby Professionals (Lunch Crowd)
**Channels:** Facebook/Instagram, Billboards  
**Rationale:** FB feed + commuter arterials

### Health-Conscious Locals
**Channels:** Facebook/Instagram  
**Rationale:** IG content + stories

---

## Goals & KPIs

| KPI | Target | Why |
|-----|--------|-----|
| Foot Traffic Uplift | +15% lunch rush visits | Based on historical midday sales and budget allocation |
| Average Ticket Size | $12+ | Healthy upsell with smoothies and wraps |

---

## Assumptions & Risks

### Assumptions
- Lunch specials remain competitively priced  
- University semester in session during campaign window  
- Operational capacity to handle increased rush-hour demand  

### Risks
- Semester breaks reduce demand  
- Competing restaurants with aggressive lunch promotions  
- Weather events impacting foot traffic  

---

## Privacy Notes

**PII Present:** No  
**Consent Gaps:** None identified  

---

*Generated by Audience Intelligence Tool*
`;
