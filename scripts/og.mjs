// Renders the share card (public/og.svg, 1200×630) from the engine, like the
// favicon: the seer on the left, three arcana on the right, no bitmap art.
// To refresh public/og.png: open the dev server, and in the console draw
// /og.svg on a 1200×630 canvas and save `canvas.toDataURL()` (no headless
// rasteriser in this repo on purpose).
import { writeFileSync } from 'node:fs'
import { BotEngine, EXPRESSION_BY_ID, RAYON, SHAPE_BY_ID } from 'bloub-react'

const BG = '#1b1a19', INK = '#f4f1eb', SECONDARY = '#cbc6be', RULE = '#3b3936'

function bloub(state, at, shape, expr, size) {
  const e = new BotEngine(RAYON, state, SHAPE_BY_ID.get(shape)?.radii ?? null, EXPRESSION_BY_ID.get(expr) ?? null)
  const f = e.sample(at)
  const k = size / (RAYON * 2 + 16)
  const eyes = f.eyes.map((y) => `<path d="${y.d}" transform="${y.matrix}" opacity="${y.alpha}" fill="${BG}"/>`).join('')
  return `<g transform="translate(${size / 2},${size / 2}) scale(${k})"><path d="${f.bodyPath}" fill="${INK}"/>${eyes}</g>`
}

// Three arcana, the same trio a first reading often lands on.
const CARDS = [
  { n: '0', en: 'The Fool', state: 'idle', at: 1.2, shape: 'nuage', expr: 'excite' },
  { n: 'X', en: 'Wheel of Fortune', state: 'orbit', at: 1.4, shape: 'cercle', expr: 'neutre' },
  { n: 'XIX', en: 'The Sun', state: 'idle', at: 1.2, shape: 'cercle', expr: 'hilare' }
]

function card(c, x, y) {
  const w = 150, h = 250
  return `<g transform="translate(${x},${y})">
<rect x=".5" y=".5" width="${w - 1}" height="${h - 1}" rx="9" fill="${BG}" stroke="${RULE}"/>
<text x="15" y="26" font-size="14" fill="${SECONDARY}" letter-spacing=".08em">${c.n}</text>
<g transform="translate(${w / 2 - 60},${h / 2 - 72})">${bloub(c.state, c.at, c.shape, c.expr, 120)}</g>
<text x="${w / 2}" y="${h - 22}" font-size="13" fill="${INK}" text-anchor="middle" font-weight="600">${c.en}</text>
</g>`
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" font-family="'Iowan Old Style','Palatino Linotype',Palatino,Georgia,serif">
<rect width="1200" height="630" fill="${BG}"/>
<g transform="translate(120,145)">${bloub('idle', 1.2, 'cercle', 'attentif', 340)}</g>
<text x="560" y="230" font-size="72" font-weight="600" fill="${INK}">bloub tarot</text>
<text x="562" y="282" font-size="26" fill="${SECONDARY}" font-style="italic">One question, three cards.</text>
<text x="562" y="318" font-size="22" fill="${SECONDARY}">The reader is a black ball that changes shape.</text>
${card(CARDS[0], 560, 350)}${card(CARDS[1], 730, 350)}${card(CARDS[2], 900, 350)}
</svg>`
writeFileSync(new URL('../public/og.svg', import.meta.url), svg)
console.log('public/og.svg', svg.length, 'bytes')
