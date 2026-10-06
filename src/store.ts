import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createMMKV } from 'react-native-mmkv';
import type { AisleKey } from './aisles';
import type { LineKey } from './theme';
import { parseItems } from './parse';

export type Item = { id: string; name: string; qty?: string; aisle: AisleKey; done: boolean };
export type Line = { id: string; name: string; line: LineKey; items: Item[]; createdAt: number };

const mmkv = createMMKV({ id: 'transit-list' });
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

const seed = (name: string, line: LineKey, text: string, doneCount = 0): Line => ({
  id: uid(),
  name,
  line,
  createdAt: Date.now(),
  items: parseItems(text).map((p, i) => ({ id: uid() + i, ...p, done: i < doneCount })),
});

type State = {
  lines: Line[];
  addLine: (name: string, line: LineKey) => string;
  removeLine: (id: string) => void;
  renameLine: (id: string, name: string) => void;
  addItems: (lineId: string, text: string) => number;
  toggleItem: (lineId: string, itemId: string) => void;
  removeItem: (lineId: string, itemId: string) => void;
  moveItem: (lineId: string, itemId: string, aisle: AisleKey) => void;
  clearDone: (lineId: string) => void;
  resetLine: (lineId: string) => void;
};

const mapLine = (lines: Line[], id: string, fn: (l: Line) => Line) =>
  lines.map((l) => (l.id === id ? fn(l) : l));

export const useStore = create<State>()(
  persist(
    (set) => ({
      lines: [
        seed('Weekly groceries', 'G', 'Bananas, 2 avocados, spinach, sourdough, oat milk, 6 eggs, greek yogurt, salmon, rice, olive oil, dish soap', 3),
        seed('Taco Friday', 'M', '12 tortillas, limes, cilantro, 1 kg beef mince, salsa, cheddar, sparkling water'),
        seed('House restock', 'Z', 'Paper towels, laundry detergent, batteries, trash bags'),
      ],
      addLine: (name, line) => {
        const l: Line = { id: uid(), name, line, items: [], createdAt: Date.now() };
        set((s) => ({ lines: [l, ...s.lines] }));
        return l.id;
      },
      removeLine: (id) => set((s) => ({ lines: s.lines.filter((l) => l.id !== id) })),
      renameLine: (id, name) => set((s) => ({ lines: mapLine(s.lines, id, (l) => ({ ...l, name })) })),
      addItems: (lineId, text) => {
        const parsed = parseItems(text);
        set((s) => ({
          lines: mapLine(s.lines, lineId, (l) => ({
            ...l,
            items: [...l.items, ...parsed.map((p) => ({ id: uid(), ...p, done: false }))],
          })),
        }));
        return parsed.length;
      },
      toggleItem: (lineId, itemId) =>
        set((s) => ({
          lines: mapLine(s.lines, lineId, (l) => ({
            ...l,
            items: l.items.map((i) => (i.id === itemId ? { ...i, done: !i.done } : i)),
          })),
        })),
      removeItem: (lineId, itemId) =>
        set((s) => ({ lines: mapLine(s.lines, lineId, (l) => ({ ...l, items: l.items.filter((i) => i.id !== itemId) })) })),
      moveItem: (lineId, itemId, aisle) =>
        set((s) => ({
          lines: mapLine(s.lines, lineId, (l) => ({
            ...l,
            items: l.items.map((i) => (i.id === itemId ? { ...i, aisle } : i)),
          })),
        })),
      clearDone: (lineId) =>
        set((s) => ({ lines: mapLine(s.lines, lineId, (l) => ({ ...l, items: l.items.filter((i) => !i.done) })) })),
      resetLine: (lineId) =>
        set((s) => ({ lines: mapLine(s.lines, lineId, (l) => ({ ...l, items: l.items.map((i) => ({ ...i, done: false })) })) })),
    }),
    {
      name: 'transit-list-v1',
      storage: createJSONStorage(() => ({
        getItem: (k) => mmkv.getString(k) ?? null,
        setItem: (k, v) => mmkv.set(k, v),
        removeItem: (k) => {
          mmkv.remove(k);
        },
      })),
      partialize: (s) => ({ lines: s.lines }),
    },
  ),
);

export const useLine = (id: string) => useStore((s) => s.lines.find((l) => l.id === id));
