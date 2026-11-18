import { Context } from 'hono';

export const handleRoot = (c: Context) => {
  return c.json({ text: 'Medication tracking API running' });
};
