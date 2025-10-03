import { z } from 'zod';

// Input YAML Schema
export const ClientGoalSchema = z.enum(['awareness', 'foot_traffic', 'leads', 'online_sales']);

export const ClientSchema = z.object({
  business_name: z.string().min(1),
  industry: z.string().min(1),
  city: z.string().min(1),
  zip: z.string().min(1),
  goal: ClientGoalSchema,
  monthly_budget_usd: z.number().int().min(0),
  time_horizon_days: z.number().int().min(7),
});

export const FirstPartyDataSchema = z.object({
  crm_sample_rows: z.number().int().min(0),
  website_event_sample_rows: z.number().int().min(0),
  email_engagement_rows: z.number().int().min(0),
});

export const ThirdPartyDataSchema = z.object({
  market_size_est: z.number().int().min(0),
  notes: z.string().optional(),
});

export const DataSchema = z.object({
  first_party: FirstPartyDataSchema,
  third_party: ThirdPartyDataSchema,
});

export const ConstraintsSchema = z.object({
  local_focus: z.boolean().optional(),
  max_segments: z.number().int().min(2).max(5).optional(),
  tone: z.string().optional(),
  require_json_then_markdown: z.boolean().optional(),
});

export const AttachmentsSchema = z.object({
  crm_top_products: z.string().optional(),
  website_top_pages: z.string().optional(),
}).optional();

export const YAMLInputSchema = z.object({
  client: ClientSchema,
  data: DataSchema,
  constraints: ConstraintsSchema.optional(),
  attachments: AttachmentsSchema,
});

// Output JSON Schema
export const DataSummarySchema = z.object({
  first_party: z.object({
    crm_records: z.number().int().min(0),
    website_events: z.number().int().min(0),
    email_engagements: z.number().int().min(0),
  }),
  third_party: z.object({
    market_size_est: z.number().int().min(0),
    notes: z.string(),
  }),
  key_signals: z.array(z.string()).min(1),
});

export const DemographicsSchema = z.object({
  age_range: z.string(),
  gender: z.string(),
  geo: z.string(),
});

export const AudienceSegmentSchema = z.object({
  name: z.string(),
  size_estimation: z.number().int().min(0),
  demographics: DemographicsSchema,
  priority_score: z.number().int().min(0).max(100),
  why_priority: z.string(),
});

export const PersonaSchema = z.object({
  name: z.string(),
  quote: z.string(),
});

export const PositioningSchema = z.object({
  value_proposition: z.string(),
  key_messages: z.array(z.string()).min(1),
  proof_points: z.array(z.string()).min(1),
  tagline_options: z.array(z.string()).min(1),
});

export const KPISchema = z.object({
  name: z.string(),
  target: z.string(),
  why: z.string(),
});

export const TargetsSchema = z.object({
  geos: z.array(z.string()).min(1),
  age_range: z.string(),
  interests: z.array(z.string()).min(1),
  keywords: z.array(z.string()).min(1),
  lookalike_seeds: z.array(z.string()).min(1),
});

export const ChannelNameSchema = z.enum([
  'billboards',
  'facebook_instagram',
  'google_search',
  'tiktok',
  'radio',
]);

export const ChannelBySegmentSchema = z.object({
  segment: z.string(),
  channels: z.array(ChannelNameSchema).min(1),
  rationale: z.string(),
});

export const PrivacyNotesSchema = z.object({
  pii_present: z.boolean(),
  consent_gap_notes: z.string(),
});

export const AITOutputSchema = z.object({
  client: ClientSchema,
  data_summary: DataSummarySchema,
  audience_segments: z.array(AudienceSegmentSchema).min(2).max(5),
  personas: z.array(PersonaSchema).min(2),
  positioning: PositioningSchema,
  targets: TargetsSchema,
  channels_by_segment: z.array(ChannelBySegmentSchema).min(1),
  goals_kpis: z.array(KPISchema).min(2),
  assumptions: z.array(z.string()).min(1),
  risks: z.array(z.string()).min(1),
  privacy_notes: PrivacyNotesSchema,
});

// API Request/Response Schemas
export const GeneratePlanRequestSchema = z.object({
  yaml_input: z.string().min(1),
  options: z.object({
    dry_run: z.boolean().optional().default(false),
  }).optional().default({}),
});

export const GeneratePlanResponseSchema = z.object({
  json: AITOutputSchema,
  markdown: z.string(),
  id: z.string(),
  warnings: z.array(z.string()).optional(),
});

// Type exports
export type ClientGoal = z.infer<typeof ClientGoalSchema>;
export type Client = z.infer<typeof ClientSchema>;
export type YAMLInput = z.infer<typeof YAMLInputSchema>;
export type AITOutput = z.infer<typeof AITOutputSchema>;
export type AudienceSegment = z.infer<typeof AudienceSegmentSchema>;
export type Persona = z.infer<typeof PersonaSchema>;
export type ChannelName = z.infer<typeof ChannelNameSchema>;
export type ChannelBySegment = z.infer<typeof ChannelBySegmentSchema>;
export type GeneratePlanRequest = z.infer<typeof GeneratePlanRequestSchema>;
export type GeneratePlanResponse = z.infer<typeof GeneratePlanResponseSchema>;
