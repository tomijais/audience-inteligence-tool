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

export function getDataDir(id: string): string {
  const baseDir = process.env.VERCEL ? '/tmp' : process.cwd();
  return join(baseDir, 'data', id);
}

export async function planExists(id: string): Promise<boolean> {
  try {
    const dir = getDataDir(id);
    await access(dir);
    return true;
  } catch {
    return false;
  }
}

export async function savePlan(
  json: AITOutput,
  markdown: string
): Promise<string> {
  const id = ulid();
  const dir = getDataDir(id);

  try {
    await mkdir(dir, { recursive: true });
    await writeFile(
      join(dir, 'ait.json'),
      JSON.stringify(json, null, 2),
      'utf-8'
    );
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

export async function loadPlan(id: string): Promise<{
  json: AITOutput;
  markdown: string;
  pdfExists: boolean;
}> {
  const dir = getDataDir(id);

  try {
    const jsonText = await readFile(join(dir, 'ait.json'), 'utf-8');
    const markdown = await readFile(join(dir, 'ait.md'), 'utf-8');

    let pdfExists = false;
    try {
      await access(join(dir, 'ait.pdf'));
      pdfExists = true;
    } catch {}

    return {
      json: JSON.parse(jsonText),
      markdown,
      pdfExists,
    };
  } catch (error) {
    throw new StorageError(`Failed to load plan: ${error}`);
  }
}

export function getPDFPath(id: string): string {
  return join(getDataDir(id), 'ait.pdf');
}

export function redactYAML(yamlContent: string): string {
  return yamlContent
    .replace(/attachments:[\s\S]*$/m, 'attachments: [REDACTED]')
    .replace(/email[^:]*:\s*\S+/gi, 'email: [REDACTED]')
    .replace(/phone[^:]*:\s*\S+/gi, 'phone: [REDACTED]');
}
