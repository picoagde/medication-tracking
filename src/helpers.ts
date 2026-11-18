import { Context } from 'hono';

export type JsonBody = { data?: any; error?: boolean };

export async function readJson(c: Context): Promise<JsonBody> {
  try {
    return { data: await c.req.json() };
  } catch {
    return { error: true };
  }
}

// A medication is considered taken only if it was marked on the current day;
// the taken state naturally expires the next day.
export function isTakenToday(takenDate: string | null | undefined): boolean {
  if (!takenDate) {
    return false;
  }
  const today = new Date().toISOString().slice(0, 10);
  return takenDate.slice(0, 10) === today;
}
