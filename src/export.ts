import type { Drawn } from './cards'
import type { Lang, Strings } from './i18n'
import type { Theme } from './theme'

const W = 960
const H = 640
const CW = 180
const CH = 300
const GAP = 24
const FONT = 'Iowan Old Style, Palatino Linotype, Palatino, Book Antiqua, Georgia, serif'

const esc = (t: string) => t.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!)

/**
 * One PNG of the spread: title, question, the three card faces as rendered on
 * the page (their SVG is self-contained: hex colours, no CSS), and a caption.
 */
export async function spreadToPng(question: string, hand: Drawn[], faces: SVGSVGElement[], theme: Theme, lang: Lang, t: Strings): Promise<Blob> {
  const x0 = (W - (3 * CW + 2 * GAP)) / 2
  const y0 = 168
  const cards = hand
    .map((h, k) => {
      const x = x0 + k * (CW + GAP)
      const inner = faces[k]!.outerHTML.replace(/<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '')
      return `<text x="${x + CW / 2}" y="${y0 - 14}" font-size="13" letter-spacing="2" fill="${theme.nav}" text-anchor="middle">${t.positions[k]}</text>
        <g transform="translate(${x},${y0}) scale(${CW / 120})">${inner}</g>`
    })
    .join('')
  const names = hand.map((h, k) => t.exportCaption(t.positions[k]!, lang === 'zh' ? h.card.zh : h.card.en, h.reversed)).join(' · ')
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="${FONT}">
    <rect width="${W}" height="${H}" fill="${theme.bg}"/>
    <text x="48" y="64" font-size="26" font-weight="600" fill="${theme.ink}">@bloub<tspan fill="${theme.ember}">.</tspan>tarot</text>
    <text x="48" y="108" font-size="22" font-style="italic" fill="${theme.copy}">${esc(lang === 'zh' ? `「${question}」` : `“${question}”`)}</text>
    ${cards}
    <text x="${W / 2}" y="${H - 52}" font-size="16" fill="${theme.secondary}" text-anchor="middle">${esc(names)}</text>
  </svg>`

  const img = new Image()
  await new Promise<void>((ok, no) => {
    img.onload = () => ok()
    img.onerror = () => no(new Error('svg failed to rasterise'))
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg)
  })
  const scale = 2
  const canvas = document.createElement('canvas')
  canvas.width = W * scale
  canvas.height = H * scale
  canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
  return new Promise((ok, no) => canvas.toBlob((b) => (b ? ok(b) : no(new Error('toBlob failed'))), 'image/png'))
}

export function downloadBlob(blob: Blob, filename: string) {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = filename
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 2000)
}
