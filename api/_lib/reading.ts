import Anthropic from '@anthropic-ai/sdk'

export interface DrawnCard {
  /** roman numeral, e.g. "XVI" */
  n: string
  zh: string
  en: string
  reversed: boolean
  /** the fixed one-line meaning shown on the page */
  text: string
}

export interface ReadingRequest {
  question: string
  cards: [DrawnCard, DrawnCard, DrawnCard]
}

export interface ReadingResponse {
  /** bloub's reading, 3–5 short sentences; empty when no key is configured */
  text: string
  /** "claude" or "fallback" */
  source: 'claude' | 'fallback'
}

const POS = ['过去', '现在', '将来']
const MAX_QUESTION = 200

const SYSTEM = `你是 bloub，一个黑色的圆球，今晚在一个小剧场里当塔罗占卜师。
你不会说自己是 AI，也不会说塔罗准不准——你只是看牌，然后说话。

风格：
- 中文，口语，短句。三到五句话，一百字以内。
- 直接回应提问者的问题，把三张牌串成一句连贯的话，而不是逐张解释。
- 温和但不空洞。可以有一点幽默，不要鸡汤，不要感叹号堆砌，不要 emoji。
- 逆位就是把那张牌的意思反过来听。
- 绝不预测健康、法律、投资结果；遇到这类问题，只谈心态和下一步。`

export async function generateReading(req: ReadingRequest, apiKey?: string | undefined): Promise<ReadingResponse> {
  const question = String(req.question ?? '').slice(0, MAX_QUESTION).trim() || '（没有说问题）'

  // No key passed: the SDK still resolves ANTHROPIC_API_KEY / an `ant auth login`
  // profile on its own (handy in dev). Nothing there either -> the call fails
  // fast and the fixed texts carry the reading.
  const spread = req.cards
    .map((c, i) => `${POS[i]}：${c.n} ${c.zh}（${c.en}）${c.reversed ? '，逆位' : ''}。牌义：${c.text}`)
    .join('\n')

  try {
    // Constructing with no credentials at all throws here, inside the net.
    const client = new Anthropic({ ...(apiKey ? { apiKey } : {}), timeout: 30_000 })
    const response = await client.messages.create({
      model: 'claude-opus-5',
      max_tokens: 400,
      system: SYSTEM,
      output_config: { effort: 'low' },
      messages: [
        {
          role: 'user',
          content: `提问者问：「${question}」\n\n抽到的三张牌：\n${spread}\n\n请以 bloub 的口吻给出解读。`
        }
      ]
    })
    if (response.stop_reason === 'refusal') return { text: '', source: 'fallback' }
    const text = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map((b) => b.text)
      .join('')
      .trim()
    return text ? { text, source: 'claude' } : { text: '', source: 'fallback' }
  } catch (err) {
    // A rate limit or an outage should never break the show: the fixed texts carry it.
    console.error('[reading]', err instanceof Error ? err.message : err)
    return { text: '', source: 'fallback' }
  }
}
