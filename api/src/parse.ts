// Ported verbatim from ../../src/parse.ts.
import { guessAisle, type AisleKey } from './aisles.ts';

export type ParsedItem = { name: string; qty?: string; aisle: AisleKey };

// "2 avocados, oat milk and 6 eggs" → three stops.
export function parseItems(input: string): ParsedItem[] {
  return input
    .split(/,|;|\n| and | & /i)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((raw) => {
      const m = raw.match(/^(\d+(?:[.,]\d+)?\s*(?:x|kg|g|lb|lbs|l|ml|oz|pack|packs|bags?|cans?|bottles?|dozen)?)\s+(.+)$/i);
      const qty = m ? m[1].replace(/\s*x$/i, '').trim() : undefined;
      const rest = m ? m[2] : raw;
      const name = rest.charAt(0).toUpperCase() + rest.slice(1);
      return { name, qty, aisle: guessAisle(name) };
    });
}
