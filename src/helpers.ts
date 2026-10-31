import { Context } from 'hono';

export type JsonBody = { data?: any; error?: boolean };

export async function readJson(c: Context): Promise<JsonBody> {
  try {
    return { data: await c.req.json() };
  } catch {
    return { error: true };
  }
}
