import type { VercelRequest, VercelResponse } from '@vercel/node'
import { generateReading, type ReadingRequest } from './_lib/reading'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).end()
    return
  }
  const body = (typeof req.body === 'string' ? JSON.parse(req.body) : req.body) as ReadingRequest
  if (!body || !Array.isArray(body.cards) || body.cards.length !== 3) {
    res.status(400).json({ error: 'expected { question, cards[3] }' })
    return
  }
  const out = await generateReading(body, process.env.ANTHROPIC_API_KEY)
  res.setHeader('cache-control', 'no-store')
  res.status(200).json(out)
}
