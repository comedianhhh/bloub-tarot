# bloub 塔罗

A tarot reader played by [bloub](https://github.com/jeremy-prt/bloub): a curtain
opens, one black ball asks what you want to know, thinks (it literally becomes
three dots), deals three cards, and turns into each card as you flip it — its
shape, its face, its colour, its move. All 22 major arcana are the same ball,
frozen mid-state by the engine; there is not a single image on the page.

## Run it

```bash
pnpm install
pnpm dev        # http://localhost:5192
pnpm build      # tsc --noEmit && vite build
```

`bloub-react` is linked from `../bloub-react` until it is on npm.

## The reading

After the third card, the page asks `/api/reading` for bloub's own reading of
the spread. That is a Vercel function (`api/reading.ts`) calling Claude
(`claude-opus-5`, low effort, ~100 characters of Chinese). In dev, Vite serves
the same handler through `vite.config.ts`.

Set `ANTHROPIC_API_KEY` (see `.env.example`). Without it — or when the API is
down or refuses — the page shows only the fixed one-line meanings. Nothing
breaks.

## How it's laid out

| | |
|---|---|
| `src/App.tsx` | The show: phases (`closed → open → cards → done`), the timed beats, the spread, export |
| `src/Seer.tsx` | `BloubBot` plus a tint lerp: the seer blushes into a card's colour and fades back |
| `src/Card.tsx` | A card face is a `BloubBot` frozen at `at` seconds, inside a 120×200 SVG frame |
| `src/cards.ts` | The 22 arcana as `{state, at, shape, expression, react, color}` |
| `src/export.ts` | The three rendered faces + question → one 1920×1280 PNG |
| `api/_lib/reading.ts` | The Claude call and its fallback; shared by Vercel and Vite |

Type and palette follow leerob.com: a serif reading face, warm greys, one accent
(the reversed mark). Light and dark both work; card SVGs re-render on theme
change because the engine bakes colours in.

## License

MIT. bloub is MIT by Jérémy Perret; see `LICENSE.bloub` in `bloub-react`.
