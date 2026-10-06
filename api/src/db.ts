import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { AisleKey } from './aisles.ts';
import { parseItems } from './parse.ts';

export const LINE_KEYS = ['G', 'M', 'H', 'T', 'C', 'Y', 'Z', 'N', 'F'] as const;
export type LineKey = (typeof LINE_KEYS)[number];

export type Item = { id: string; name: string; qty?: string; aisle: AisleKey; done: boolean };
export type Line = { id: string; name: string; line: LineKey; items: Item[]; createdAt: number };

const DATA_FILE = process.env.DATA_FILE ?? join(dirname(fileURLToPath(import.meta.url)), '..', 'data', 'lines.json');

export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

export const itemsFromText = (text: string): Item[] =>
  parseItems(text).map((p) => ({ id: uid(), ...p, done: false }));

const seed = (name: string, line: LineKey, text: string, doneCount = 0): Line => ({
  id: uid(),
  name,
  line,
  createdAt: Date.now(),
  items: itemsFromText(text).map((it, i) => ({ ...it, done: i < doneCount })),
});

function load(): Line[] {
  if (existsSync(DATA_FILE)) return JSON.parse(readFileSync(DATA_FILE, 'utf8')).lines;
  // Same starter lines as the app.
  return [
    seed('Weekly groceries', 'G', 'Bananas, 2 avocados, spinach, sourdough, oat milk, 6 eggs, greek yogurt, salmon, rice, olive oil, dish soap', 3),
    seed('Taco Friday', 'M', '12 tortillas, limes, cilantro, 1 kg beef mince, salsa, cheddar, sparkling water'),
    seed('House restock', 'Z', 'Paper towels, laundry detergent, batteries, trash bags'),
  ];
}

export const db = { lines: load() };

// Write to a temp file then rename, so a crash never leaves a half-written file.
export function save() {
  mkdirSync(dirname(DATA_FILE), { recursive: true });
  const tmp = `${DATA_FILE}.tmp`;
  writeFileSync(tmp, JSON.stringify({ lines: db.lines }, null, 2));
  renameSync(tmp, DATA_FILE);
}

if (!existsSync(DATA_FILE)) save();
