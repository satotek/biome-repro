import { getLogs } from './loader.ts';

/**
 * Pattern B: index access and array destructuring under `noUncheckedIndexedAccess: true`.
 *
 * TypeScript infers `LogEntry | undefined` for both, so the optional chaining is needed to
 * type-check and the nullish coalescing is needed to satisfy the declared `Promise<string[]>`
 * return type. Biome does not take the `noUncheckedIndexedAccess` compiler option into
 * account and treats the values as non-nullish.
 */
export async function patternB(): Promise<string[]> {
  const logs = await getLogs();

  const byIndex = logs[0]?.id ?? '';

  const [first] = logs;
  const byDestructuring = first?.createdAt.toISOString() ?? '';

  return [byIndex, byDestructuring];
}
