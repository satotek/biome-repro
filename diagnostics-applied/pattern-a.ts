import { getUsage } from '../src/loader.ts';

/**
 * Pattern A with the reported optional chaining and nullish coalescing removed, as the
 * diagnostics instruct. Biome 2.5.5 is satisfied, but `tsc` now fails with
 * TS18047: 'result' is possibly 'null'.
 */
export async function patternA(userId: string): Promise<string> {
  const result = await getUsage(userId);
  return result.range.startDate;
}
