import type { Drawn } from './cards'

export interface Reading {
  text: string
  source: 'claude' | 'fallback'
}

/** Asks the server for bloub's reading. Never throws: the page has the fixed texts. */
export async function fetchReading(question: string, hand: Drawn[], signal?: AbortSignal): Promise<Reading> {
  try {
    const res = await fetch('/api/reading', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      signal,
      body: JSON.stringify({
        question,
        cards: hand.map((h) => ({ n: h.card.n, zh: h.card.zh, en: h.card.en, reversed: h.reversed, text: h.card.text }))
      })
    })
    if (!res.ok) return { text: '', source: 'fallback' }
    return (await res.json()) as Reading
  } catch {
    return { text: '', source: 'fallback' }
  }
}
