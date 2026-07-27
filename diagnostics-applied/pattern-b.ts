import { getLogs } from '../src/loader.ts';

/**
 * Pattern B with the reported optional chaining and nullish coalescing removed, as the
 * diagnostics instruct. Biome 2.5.5 is satisfied, but `tsc` now fails with
 * TS2532 and TS18048 because of `noUncheckedIndexedAccess`.
 */
export async function patternB(): Promise<string[]> {
  const logs = await getLogs();

  const byIndex = logs[0].id;

  const [first] = logs;
  const byDestructuring = first.createdAt.toISOString();

  return [byIndex, byDestructuring];
}
