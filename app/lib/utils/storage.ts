import { mkdir, writeFile, readFile, access } from 'fs/promises';
import { join } from 'path';
import { ulid } from 'ulid';
import { AITOutput } from '../schemas/ait.schema';

export class StorageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StorageError';
  }
}

/**
 * Get data directory path for a plan
 */
export function getDataDir(id: string): string {
  return join(process.cwd(), 'data', id);
}

/**
 * Check if a plan exists
 */
export async function planExists(id: string): Promise<boolean> {
  try {
    const dir = getDataDir(id);
    await access(dir);
    return true;
  } catch {
    return false;
  }
}

/**
 * Save plan artifacts to disk
 */
export async function savePlan(
  json: AITOutput,
  markdown: string
): Promise<string> {
  const id = ulid();
  const dir = getDataDir(id);

  try {
    // Create directory
    await mkdir(dir, { recursive: true });

    // Save JSON
    await writeFile(
      join(dir, 'ait.json'),
      JSON.stringify(json, null, 2),
      'utf-8'
    );

    // Save Markdown
    await writeFile(
      join(dir, 'ait.md'),
      markdown,
      'utf-8'
    );

    return id;
  } catch (error) {
    throw new StorageError(`Failed to save plan: ${error}`);
  }
}

/**
 * Load plan from disk
 */
export async function loadPlan(id: string): Promise<{
  json: AITOutput;
  markdown: string;
  pdfExists: boolean;
}> {
  const dir = getDataDir(id);

  try {
    const jsonText = await readFile(join(dir, 'ait.json'), 'utf-8');
    const markdown = await readFile(join(dir, 'ait.md'), 'utf-8');

    // Check if PDF exists
    let pdfExists = false;
    try {
      await access(join(dir, 'ait.pdf'));
      pdfExists = true;
    } catch {
      // PDF doesn't exist
    }

    return {
      json: JSON.parse(jsonText),
      markdown,
      pdfExists,
    };
  } catch (error) {
    throw new StorageError(`Failed to load plan: ${error}`);
  }
}

/**
 * Get PDF path for a plan
 */
export function getPDFPath(id: string): string {
  return join(getDataDir(id), 'ait.pdf');
}

/**
 * Redact sensitive data from YAML for logging
 */
export function redactYAML(yamlContent: string): string {
  // Remove attachments section and any potential PII
  return yamlContent
    .replace(/attachments:[\s\S]*$/m, 'attachments: [REDACTED]')
    .replace(/email[^:]*:\s*\S+/gi, 'email: [REDACTED]')
    .replace(/phone[^:]*:\s*\S+/gi, 'phone: [REDACTED]');
}
