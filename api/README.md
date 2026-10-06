# Transit List API

Hono + Node API for the transit-map shopping list app. Self-contained: its own
`package.json`, separate from the app's pinned root package.

## Run

```sh
cd api
npm install
npm run dev        # tsx watch, binds 0.0.0.0:8787
npm run typecheck
```

Env: `PORT` (default `8787`), `DATA_FILE` (default `api/data/lines.json`).
Data persists to a JSON file (atomic write). On first start it's seeded with the
same three lines as the app; delete the file to reset.

## Model

- `Line` `{ id, name, line: G|M|H|T|C|Y|Z|N|F, items: Item[], createdAt }`
- `Item` `{ id, name, qty?, aisle, done }`
- `aisle`: `produce | bakery | dairy | meat | pantry | frozen | drinks | household | other`

Free text is parsed exactly like the app (`src/parse.ts` / `src/aisles.ts`,
ported to `api/src`): split on `,` `;` newline ` and ` ` & `, a leading
quantity (`2`, `1 kg`, `2 bottles`…) becomes `qty`, aisle is guessed by keyword.

## Endpoints

| Method | Path | Body | Returns |
|---|---|---|---|
| GET | `/health` | | `{ ok, lines, time }` |
| GET | `/lines` | | `Line[]` |
| POST | `/lines` | `{ name, line, text? }` | `201 Line` (newest first) |
| GET | `/lines/:id` | | `Line` |
| PATCH | `/lines/:id` | `{ name?, line? }` | `Line` |
| DELETE | `/lines/:id` | | `204` |
| POST | `/lines/:id/clear-done` | | `Line` (done items removed) |
| POST | `/lines/:id/reset` | | `Line` (all items undone) |
| GET | `/lines/:id/items` | | `Item[]` |
| POST | `/lines/:id/items` | `{ text }` e.g. `"2 avocados, oat milk and 6 eggs"` | `201 Item[]` (added) |
| GET | `/lines/:id/items/:itemId` | | `Item` |
| PATCH | `/lines/:id/items/:itemId` | `{ toggle?: true, done?, aisle?, name?, qty? }` | `Item` |
| DELETE | `/lines/:id/items/:itemId` | | `204` |

PATCH item: `{"toggle":true}` flips `done`; `{"aisle":"frozen"}` moves it;
`qty: null` clears the quantity. Errors are JSON: `400 { error, issues? }`
(zod validation), `404 { error }`. CORS is open (`*`).

```sh
curl -X POST localhost:8787/lines -H 'content-type: application/json' \
  -d '{"name":"Brunch","line":"H","text":"2 avocados, sourdough and 6 eggs"}'
```
