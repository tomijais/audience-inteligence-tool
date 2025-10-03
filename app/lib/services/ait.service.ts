import * as yaml from 'js-yaml';
import { generateCompletion, loadSystemPrompt } from '../llm/provider';
import { DRY_RUN_FIXTURE, DRY_RUN_MARKDOWN } from '../llm/fixture';
import { validateYAMLInput, validateAITOutput } from '../utils/validation';
import { savePlan } from '../utils/storage';
import { GeneratePlanResponse } from '../schemas/ait.schema';

export interface GeneratePlanOptions {
  dry_run?: boolean;
}

function parseLLMResponse(response: string): { json: unknown; markdown: string } {
  const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/) ||
                    response.match(/^(\{[\s\S]*?\})\s*(?:#+|\n\n)/m);

  if (!jsonMatch) {
    throw new Error('Could not find JSON in LLM response');
  }

  const jsonText = jsonMatch[1].trim();
  const json = JSON.parse(jsonText);

  const jsonEnd = response.indexOf(jsonMatch[0]) + jsonMatch[0].length;
  let markdown = response.substring(jsonEnd).trim();
  markdown = markdown.replace(/^```markdown\s*/i, '').replace(/```\s*$/, '');

  if (!markdown) {
    throw new Error('Could not find Markdown in LLM response');
  }

  return { json, markdown };
}

export async function generatePlan(
  yamlInput: string,
  options: GeneratePlanOptions = {}
): Promise<GeneratePlanResponse> {
  const { dry_run = false } = options;

  let parsedYAML: unknown;
  try {
    parsedYAML = yaml.load(yamlInput);
  } catch (error) {
    throw new Error(`Invalid YAML: ${error}`);
  }

  validateYAMLInput(parsedYAML);

  if (dry_run) {
    const id = await savePlan(DRY_RUN_FIXTURE, DRY_RUN_MARKDOWN);
    return {
      json: DRY_RUN_FIXTURE,
      markdown: DRY_RUN_MARKDOWN,
      id,
    };
  }

  const systemPrompt = await loadSystemPrompt();
  const userMessage = `Please analyze this client data and generate audience intelligence:\n\n\`\`\`yaml\n${yamlInput}\n\`\`\``;

  const llmResponse = await generateCompletion([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userMessage },
  ]);

  const { json: rawJson, markdown } = parseLLMResponse(llmResponse.content);
  const { data: validatedJson, warnings } = validateAITOutput(rawJson);
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
