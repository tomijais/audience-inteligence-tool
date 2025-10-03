import { AITOutput, YAMLInput } from '../schemas/ait.schema';

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Cross-field validation for AIT output
 */
export function validateCrossFields(data: AITOutput): string[] {
  const warnings: string[] = [];

  // 1. Check all channels_by_segment reference existing segments
  const segmentNames = new Set(data.audience_segments.map(s => s.name));
  for (const channelHint of data.channels_by_segment) {
    if (!segmentNames.has(channelHint.segment)) {
      throw new ValidationError(
        `Channel hint references non-existent segment: "${channelHint.segment}"`
      );
    }
  }

  // 2. Check segment names are unique
  if (segmentNames.size !== data.audience_segments.length) {
    throw new ValidationError('Segment names must be unique');
  }

  // 3. Check sum of segment sizes doesn't exceed market size
  const totalSegmentSize = data.audience_segments.reduce(
    (sum, seg) => sum + seg.size_estimation,
    0
  );
  if (totalSegmentSize > data.data_summary.third_party.market_size_est) {
    warnings.push(
      `Total segment size (${totalSegmentSize}) exceeds market size estimate (${data.data_summary.third_party.market_size_est})`
    );
  }

  // 4. Privacy validation: if PII present, must have consent notes
  if (data.privacy_notes.pii_present && !data.privacy_notes.consent_gap_notes.trim()) {
    throw new ValidationError(
      'When pii_present is true, consent_gap_notes must not be empty'
    );
  }

  return warnings;
}

/**
 * Validate YAML input structure
 */
export function validateYAMLInput(input: unknown): YAMLInput {
  const { YAMLInputSchema } = require('../schemas/ait.schema');
  return YAMLInputSchema.parse(input);
}

/**
 * Validate AIT output with cross-field checks
 */
export function validateAITOutput(output: unknown): { data: AITOutput; warnings: string[] } {
  const { AITOutputSchema } = require('../schemas/ait.schema');

  // First validate against schema
  const data = AITOutputSchema.parse(output);

  // Then run cross-field validation
  const warnings = validateCrossFields(data);

  return { data, warnings };
}
