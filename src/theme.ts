import { useEffect, useState } from 'react'

/**
 * The page's ink and paper as hex. The engine bakes colours into SVG
 * attributes (eye holes are paper-filled, particles are ink-to-paper mixes),
 * so components that draw a bloub need real values, not `var(--ink)`.
 */
export interface Theme {
  bg: string
  ink: string
  surface: string
  rule: string
  copy: string
  secondary: string
  nav: string
  ember: string
}

const NAMES: (keyof Theme)[] = ['bg', 'ink', 'surface', 'rule', 'copy', 'secondary', 'nav', 'ember']

function read(): Theme {
  const cs = getComputedStyle(document.documentElement)
  const t = {} as Theme
  for (const n of NAMES) t[n] = cs.getPropertyValue(`--${n}`).trim()
  return t
}

export function useTheme(): Theme {
  const [theme, setTheme] = useState<Theme>(read)
  useEffect(() => {
    const update = () => setTheme(read())
    const mq = matchMedia('(prefers-color-scheme: dark)')
    mq.addEventListener('change', update)
    const mo = new MutationObserver(update)
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'class'] })
    return () => {
      mq.removeEventListener('change', update)
      mo.disconnect()
    }
  }, [])
  return theme
}
