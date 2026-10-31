import { Context } from 'hono';

export const handleRoot = (c: Context) => {
  return c.json({ text: 'Notes API running' });
};
