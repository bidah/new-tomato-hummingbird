// Ported from ../../src/aisles.ts (minus the SF Symbol field, which is UI-only).
// Keep the word lists in sync with the app.
export const AISLE_KEYS = [
  'produce', 'bakery', 'dairy', 'meat', 'pantry',
  'frozen', 'drinks', 'household', 'other',
] as const;
export type AisleKey = (typeof AISLE_KEYS)[number];

export const aisles: { key: AisleKey; name: string; words: string[] }[] = [
  { key: 'produce', name: 'Produce', words: ['apple', 'banana', 'avocado', 'tomato', 'onion', 'garlic', 'lettuce', 'spinach', 'lime', 'lemon', 'pepper', 'carrot', 'potato', 'cilantro', 'basil', 'berr', 'grape', 'orange', 'cucumber', 'mushroom', 'kale', 'herb', 'fruit', 'veg', 'ginger', 'scallion', 'jalapeño', 'jalapeno', 'corn', 'broccoli', 'celery', 'mango', 'pear', 'peach'] },
  { key: 'bakery', name: 'Bakery', words: ['bread', 'bagel', 'tortilla', 'bun', 'croissant', 'baguette', 'muffin', 'cake', 'roll', 'pita', 'sourdough'] },
  { key: 'dairy', name: 'Dairy & Eggs', words: ['milk', 'cheese', 'yogurt', 'yoghurt', 'butter', 'cream', 'egg', 'feta', 'brie', 'gouda', 'camembert', 'ricotta', 'halloumi', 'parmesan', 'mozzarella', 'cheddar', 'kefir'] },
  { key: 'meat', name: 'Meat & Fish', words: ['chicken', 'beef', 'pork', 'steak', 'salmon', 'tuna', 'fish', 'shrimp', 'bacon', 'sausage', 'turkey', 'ham', 'mince', 'lamb', 'tofu'] },
  { key: 'pantry', name: 'Pantry', words: ['rice', 'pasta', 'flour', 'sugar', 'salt', 'oil', 'vinegar', 'bean', 'lentil', 'cereal', 'oat', 'sauce', 'salsa', 'spice', 'cumin', 'honey', 'jam', 'peanut', 'nut', 'coffee', 'tea', 'soup', 'can', 'chip', 'cracker', 'cookie', 'chocolate', 'noodle', 'stock', 'broth', 'ketchup', 'mustard', 'mayo'] },
  { key: 'frozen', name: 'Frozen', words: ['frozen', 'ice cream', 'ice', 'pizza', 'peas', 'gelato'] },
  { key: 'drinks', name: 'Drinks', words: ['water', 'juice', 'soda', 'beer', 'wine', 'kombucha', 'sparkling', 'cola', 'lemonade'] },
  { key: 'household', name: 'Household', words: ['soap', 'detergent', 'paper', 'towel', 'tissue', 'toilet', 'sponge', 'trash', 'bag', 'foil', 'shampoo', 'toothpaste', 'battery', 'batteries', 'bleach', 'candle'] },
  { key: 'other', name: 'Other', words: [] },
];

export function guessAisle(name: string): AisleKey {
  const n = name.toLowerCase();
  // Frozen wins over its contents ("frozen peas", "frozen berries").
  if (n.includes('frozen')) return 'frozen';
  for (const a of aisles) if (a.words.some((w) => n.includes(w))) return a.key;
  return 'other';
}
