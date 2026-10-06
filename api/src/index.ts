import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { HTTPException } from 'hono/http-exception';
import { z } from 'zod';
import { AISLE_KEYS } from './aisles.ts';
import { db, itemsFromText, LINE_KEYS, save, uid, type Line } from './db.ts';

const createLine = z.object({
  name: z.string().trim().min(1).max(100),
  line: z.enum(LINE_KEYS),
  text: z.string().optional(), // optional free-text items to start with
});
const patchLine = z
  .object({ name: z.string().trim().min(1).max(100), line: z.enum(LINE_KEYS) })
  .partial()
  .refine((v) => Object.keys(v).length > 0, 'Nothing to update');
const createItems = z.object({ text: z.string().trim().min(1).max(2000) });
const patchItem = z
  .object({
    done: z.boolean(),
    toggle: z.literal(true),
    aisle: z.enum(AISLE_KEYS),
    name: z.string().trim().min(1).max(100),
    qty: z.string().trim().max(30).nullable(),
  })
  .partial()
  .refine((v) => Object.keys(v).length > 0, 'Nothing to update')
  .refine((v) => !(v.toggle && v.done !== undefined), 'Use either toggle or done, not both');

async function body<T extends z.ZodType>(c: { req: { json: () => Promise<unknown> } }, schema: T): Promise<z.infer<T>> {
  const raw = await c.req.json().catch(() => {
    throw new HTTPException(400, { message: 'Body must be JSON' });
  });
  const r = schema.safeParse(raw);
  if (!r.success) throw new HTTPException(400, { res: Response.json({ error: 'Invalid body', issues: r.error.issues }, { status: 400 }) });
  return r.data;
}

const findLine = (id: string): Line => {
  const l = db.lines.find((x) => x.id === id);
  if (!l) throw new HTTPException(404, { message: 'Line not found' });
  return l;
};
const findItem = (l: Line, id: string) => {
  const i = l.items.find((x) => x.id === id);
  if (!i) throw new HTTPException(404, { message: 'Item not found' });
  return i;
};

const app = new Hono();
app.use(logger());
app.use(cors());

app.get('/health', (c) => c.json({ ok: true, lines: db.lines.length, time: new Date().toISOString() }));

// Lines
app.get('/lines', (c) => c.json(db.lines));
app.post('/lines', async (c) => {
  const b = await body(c, createLine);
  const l: Line = { id: uid(), name: b.name, line: b.line, items: b.text ? itemsFromText(b.text) : [], createdAt: Date.now() };
  db.lines.unshift(l);
  save();
  return c.json(l, 201);
});
app.get('/lines/:id', (c) => c.json(findLine(c.req.param('id'))));
app.patch('/lines/:id', async (c) => {
  const l = findLine(c.req.param('id'));
  Object.assign(l, await body(c, patchLine));
  save();
  return c.json(l);
});
app.delete('/lines/:id', (c) => {
  const l = findLine(c.req.param('id'));
  db.lines = db.lines.filter((x) => x !== l);
  save();
  return c.body(null, 204);
});
// Bulk helpers mirroring the app's clearDone / resetLine.
app.post('/lines/:id/clear-done', (c) => {
  const l = findLine(c.req.param('id'));
  l.items = l.items.filter((i) => !i.done);
  save();
  return c.json(l);
});
app.post('/lines/:id/reset', (c) => {
  const l = findLine(c.req.param('id'));
  l.items.forEach((i) => (i.done = false));
  save();
  return c.json(l);
});

// Items
app.get('/lines/:id/items', (c) => c.json(findLine(c.req.param('id')).items));
app.post('/lines/:id/items', async (c) => {
  const l = findLine(c.req.param('id'));
  const { text } = await body(c, createItems);
  const added = itemsFromText(text);
  if (added.length === 0) throw new HTTPException(400, { message: 'No items found in text' });
  l.items.push(...added);
  save();
  return c.json(added, 201);
});
app.get('/lines/:id/items/:itemId', (c) => c.json(findItem(findLine(c.req.param('id')), c.req.param('itemId'))));
app.patch('/lines/:id/items/:itemId', async (c) => {
  const it = findItem(findLine(c.req.param('id')), c.req.param('itemId'));
  const { toggle, qty, ...rest } = await body(c, patchItem);
  Object.assign(it, rest);
  if (toggle) it.done = !it.done;
  if (qty === null || qty === '') delete it.qty;
  else if (qty !== undefined) it.qty = qty;
  save();
  return c.json(it);
});
app.delete('/lines/:id/items/:itemId', (c) => {
  const l = findLine(c.req.param('id'));
  const it = findItem(l, c.req.param('itemId'));
  l.items = l.items.filter((x) => x !== it);
  save();
  return c.body(null, 204);
});

app.notFound((c) => c.json({ error: 'Not found' }, 404));
app.onError((err, c) => {
  if (err instanceof HTTPException) return err.res ?? c.json({ error: err.message }, err.status);
  console.error(err);
  return c.json({ error: 'Internal error' }, 500);
});

const port = Number(process.env.PORT ?? 8787);
serve({ fetch: app.fetch, port, hostname: '0.0.0.0' }, (info) => {
  console.log(`transit-list api on http://0.0.0.0:${info.port}`);
});
