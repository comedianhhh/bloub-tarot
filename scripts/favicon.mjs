// Renders one idle frame of the engine as public/favicon.svg, so the tab icon
// is the same bloub as the page (not a hand-drawn approximation).
import { writeFileSync } from 'node:fs'
import { BotEngine, DEMI_VIEWBOX, RAYON } from 'bloub-react'

const VB = DEMI_VIEWBOX
const frame = new BotEngine(RAYON, 'idle', null, null).sample(1.2)
const eyes = frame.eyes.map((e) => `<path d="${e.d}" transform="${e.matrix}" opacity="${e.alpha}" class="p"/>`).join('')
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-RAYON - 8} ${-RAYON - 8} ${RAYON * 2 + 16} ${RAYON * 2 + 16}">
<style>.i{fill:#282828}.p{fill:#fff}@media(prefers-color-scheme:dark){.i{fill:#f4f1eb}.p{fill:#1b1a19}}</style>
<path d="${frame.bodyPath}" class="i"/>${eyes}
</svg>`
writeFileSync(new URL('../public/favicon.svg', import.meta.url), svg)
console.log('public/favicon.svg', svg.length, 'bytes', 'viewBox', VB)
