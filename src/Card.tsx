import { BloubBot } from 'bloub-react'
import type { ArcanaCard } from './cards'
import type { Theme } from './theme'

/** Card face in a 120×200 box: numeral, the bloub frozen mid-state, the name. */
export function CardFace({ card, reversed, theme, id }: { card: ArcanaCard; reversed: boolean; theme: Theme; id?: string }) {
  const rot = reversed !== !!card.flip ? 180 : 0
  const size = 96 // 316 viewBox units × 0.3, as in the mock
  return (
    <svg id={id} className="card-svg" viewBox="0 0 120 200" role="img" aria-label={`${card.zh}${reversed ? ' 逆位' : ''}`}>
      <rect x=".5" y=".5" width="119" height="199" rx="7" fill={theme.bg} stroke={theme.rule} />
      <text x="12" y="20" fontSize="11" fill={reversed ? theme.ember : theme.secondary} letterSpacing=".08em">
        {card.n}
      </text>
      {reversed && (
        <text x="108" y="20" fontSize="9" fill={theme.ember} textAnchor="end" letterSpacing=".08em">
          逆
        </text>
      )}
      <g transform={`translate(60,92) rotate(${rot}) translate(${-size / 2},${-size / 2})`}>
        <BloubBot
          size={size}
          state={card.state}
          frozenAt={card.at}
          shape={card.shape}
          expression={card.expr}
          color={theme.ink}
          paper={theme.bg}
          label=""
        />
      </g>
      <text x="60" y="170" fontSize="13" fontWeight="600" fill={theme.ink} textAnchor="middle">
        {card.zh}
      </text>
      <text x="60" y="185" fontSize="8.5" fill={theme.secondary} textAnchor="middle" letterSpacing=".06em">
        {card.en.toUpperCase()}
      </text>
    </svg>
  )
}

/** Card back: a question mark, like the sketch. */
export function CardBack({ theme }: { theme: Theme }) {
  return (
    <svg className="card-svg" viewBox="0 0 120 200" aria-label="未翻开的牌">
      <rect x=".5" y=".5" width="119" height="199" rx="7" fill={theme.ink} stroke={theme.ink} />
      <rect x="8.5" y="8.5" width="103" height="183" rx="4" fill="none" stroke={theme.bg} strokeOpacity=".3" />
      <text x="60" y="118" fontSize="64" fill={theme.bg} textAnchor="middle">
        ?
      </text>
    </svg>
  )
}
