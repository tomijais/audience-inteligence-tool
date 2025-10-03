import * as yaml from 'js-yaml';
import { generateCompletion, loadSystemPrompt } from '../llm/provider';
import { DRY_RUN_FIXTURE, DRY_RUN_MARKDOWN } from '../llm/fixture';
import { validateYAMLInput, validateAITOutput } from '../utils/validation';
import { savePlan } from '../utils/storage';
import { AITOutput, GeneratePlanResponse } from '../schemas/ait.schema';

export interface GeneratePlanOptions {
  dry_run?: boolean;
}

/**
 * Parse and extract JSON and Markdown from LLM response
 */
function parseLLMResponse(response: string): { json: unknown; markdown: string } {
  // Try to find JSON first (should be wrapped in ```json or just be a JSON object)
  const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/) ||
                    response.match(/^(\{[\s\S]*?\})\s*(?:#+|\n\n)/m);

  if (!jsonMatch) {
    throw new Error('Could not find JSON in LLM response');
  }

  const jsonText = jsonMatch[1].trim();
  const json = JSON.parse(jsonText);

  // Extract markdown (everything after the JSON)
  const jsonEnd = response.indexOf(jsonMatch[0]) + jsonMatch[0].length;
  let markdown = response.substring(jsonEnd).trim();

  // Remove markdown code fence if present at start
  markdown = markdown.replace(/^```markdown\s*/i, '').replace(/```\s*$/, '');

  if (!markdown) {
    throw new Error('Could not find Markdown in LLM response');
  }

  return { json, markdown };
}

/**
 * Main service to generate audience intelligence plan
 */
export async function generatePlan(
  yamlInput: string,
  options: GeneratePlanOptions = {}
): Promise<GeneratePlanResponse> {
  const { dry_run = false } = options;

  // Parse and validate YAML input
  let parsedYAML: unknown;
  try {
    parsedYAML = yaml.load(yamlInput);
  } catch (error) {
    throw new Error(`Invalid YAML: ${error}`);
  }

  const validatedInput = validateYAMLInput(parsedYAML);

  // Dry run: return fixture
  if (dry_run) {
    const id = await savePlan(DRY_RUN_FIXTURE, DRY_RUN_MARKDOWN);
    return {
      json: DRY_RUN_FIXTURE,
      markdown: DRY_RUN_MARKDOWN,
      id,
    };
  }

  // Real LLM call
  const systemPrompt = await loadSystemPrompt();

  const userMessage = `Please analyze this client data and generate audience intelligence:\n\n\`\`\`yaml\n${yamlInput}\n\`\`\``;

  const llmResponse = await generateCompletion([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userMessage },
  ]);

  // Parse response
  const { json: rawJson, markdown } = parseLLMResponse(llmResponse.content);

  // Validate output
  const { data: validatedJson, warnings } = validateAITOutput(rawJson);

  // Save to disk
  const id = await savePlan(validatedJson, markdown);

  const response: GeneratePlanResponse = {
    json: validatedJson,
    markdown,
    id,
  };

  if (warnings.length > 0) {
    response.warnings = warnings;
  }

  return response;
}
