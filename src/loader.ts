export type Usage = {
  range: { startDate: string; endDate: string };
};

export type LogEntry = {
  id: string;
  createdAt: Date;
};

/** Returns `null` when there is no match, so the return type is a `| null` union. */
export async function getUsage(userId: string): Promise<Usage | null> {
  return userId === 'user-1'
    ? { range: { startDate: '2026-01-29', endDate: '2026-02-04' } }
    : null;
}

export async function getLogs(): Promise<LogEntry[]> {
  return [];
}
