import { getUsage } from './loader.ts';

/**
 * Pattern A: optional chaining on the awaited value of `Promise<Usage | null>`.
 *
 * `result` is `Usage | null`, so the optional chaining is needed to type-check and the
 * nullish coalescing is needed to satisfy the declared `Promise<string>` return type.
 * Biome 2.5.5 reports "guaranteed to be non-nullish" and flags both. Biome 2.5.2 does not.
 */
export async function patternA(userId: string): Promise<string> {
  const result = await getUsage(userId);
  return result?.range.startDate ?? 'N/A';
}
