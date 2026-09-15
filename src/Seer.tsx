import { BloubBot, COLOR_BY_ID, mixHex, type Block, type ColorId, type ExpressionId, type ShapeId, type StateId } from 'bloub-react'
import { useEffect, useRef, useState } from 'react'
import type { Theme } from './theme'

export interface SeerLook {
  state: StateId
  shape: ShapeId
  expression: ExpressionId
  /** a catalogue colour worn for a moment; null = the page's ink */
  color: ColorId | null
  /** when set, the montage drives the state and `state` is ignored */
  cycle: Block[] | null
  follow: boolean
}

export const REST: SeerLook = { state: 'idle', shape: 'cercle', expression: 'neutre', color: null, cycle: null, follow: true }

/**
 * The engine takes a colour and jumps to it; the seer should blush into a
 * card's colour and fade back. A small rAF lerp between ink and the target.
 */
function useTint(ink: string, target: string | null, inMs = 500, outMs = 1100): string {
  const [hex, setHex] = useState(ink)
  const from = useRef(ink)
  useEffect(() => {
    const start = performance.now()
    const startHex = from.current
    const endHex = target ?? ink
    const dur = target ? inMs : outMs
    let raf = 0
    const tick = (now: number) => {
      const k = Math.min(1, (now - start) / dur)
      const e = 1 - Math.pow(1 - k, 3)
      const cur = mixHex(startHex, endHex, e)
      from.current = cur
      setHex(cur)
      if (k < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [ink, target, inMs, outMs])
  return hex
}

export function Seer({ look, theme, size }: { look: SeerLook; theme: Theme; size: number }) {
  const target = look.color ? (COLOR_BY_ID.get(look.color)?.hex ?? null) : null
  const ink = useTint(theme.ink, target)
  const common = { size, shape: look.shape, expression: look.expression, color: ink, paper: theme.surface, follow: look.follow, label: 'bloub 占卜师' }
  // `cycle` and `state` are alternatives in BloubBot: pass one or the other.
  return look.cycle ? <BloubBot {...common} cycle={look.cycle} /> : <BloubBot {...common} state={look.state} />
}
