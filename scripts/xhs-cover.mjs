// Renders a 3:4 小红书 cover (public/xhs-cover.svg, 1080×1440) from the engine, like the
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

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1440" viewBox="0 0 1080 1440" font-family="'Iowan Old Style','Palatino Linotype',Palatino,Georgia,serif">
<rect width="1080" height="1440" fill="${BG}"/>
<g transform="translate(300,150)">${bloub('idle', 1.2, 'cercle', 'attentif', 480)}</g>
<text x="540" y="760" font-size="84" font-weight="600" fill="${INK}" text-anchor="middle">一颗黑球给你读塔罗</text>
<text x="540" y="822" font-size="30" fill="${SECONDARY}" text-anchor="middle" font-style="italic">One question, three cards.</text>
<text x="540" y="870" font-size="28" fill="${SECONDARY}" text-anchor="middle">问一个问题，抽三张牌，它会变成那张牌</text>
${card(CARDS[0], 285, 960)}${card(CARDS[1], 465, 960)}${card(CARDS[2], 645, 960)}
<text x="540" y="1300" font-size="26" fill="${SECONDARY}" text-anchor="middle" letter-spacing=".1em">bloub tarot</text>
</svg>`
writeFileSync(new URL('../public/xhs-cover.svg', import.meta.url), svg)
console.log('public/xhs-cover.svg', svg.length, 'bytes')
