import { defaultCycle } from 'bloub-react'
import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'
import { CardBack, CardFace } from './Card'
import { drawThree, POSITIONS, type Drawn } from './cards'
import { downloadBlob, spreadToPng } from './export'
import { divine } from './oracle'
import { REST, Seer, type SeerLook } from './Seer'
import { useTheme } from './theme'

type Phase = 'closed' | 'open' | 'cards' | 'done'

/** bloub's reference montage, minus the interface transition and the sleepers. */
const MONTAGE = defaultCycle().blocks.filter((b) => !['sleep', 'egg'].includes(b.state))

/** Timers that a new beat cancels: the show never plays two scripts at once. */
function useScript() {
  const timers = useRef<number[]>([])
  const clear = useCallback(() => {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }, [])
  const later = useCallback((fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms))
  }, [])
  useEffect(() => clear, [clear])
  return { later, clear }
}

export default function App() {
  const theme = useTheme()
  const { later, clear } = useScript()
  const [phase, setPhase] = useState<Phase>('closed')
  const [asking, setAsking] = useState(false)
  const [question, setQuestion] = useState('这份申请会有回音吗？')
  const [say, setSay] = useState('')
  const [look, setLook] = useState<SeerLook>({ ...REST, state: 'sleep', follow: false })
  const [hand, setHand] = useState<Drawn[]>([])
  const [opened, setOpenedState] = useState<boolean[]>([false, false, false])
  // Two quick taps must not read the same stale `opened`: the ref is the truth.
  const openedRef = useRef(opened)
  const setOpened = (next: boolean[]) => {
    openedRef.current = next
    setOpenedState(next)
  }
  // bloub's lines, shown one at a time; 'loading' while it pretends to think
  const [reading, setReading] = useState<string[] | 'loading' | null>(null)
  const [sheet, setSheet] = useState<{ url: string; blob: Blob } | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)

  const patch = (p: Partial<SeerLook>) => setLook((l) => ({ ...l, ...p }))
  const askOn = () => {
    setAsking(true)
    later(() => {
      inputRef.current?.focus({ preventScroll: true })
      inputRef.current?.select()
    }, 50)
  }

  /* ---- beats ---- */

  const openCurtain = () => {
    setPhase('open')
    patch({ state: 'sleep', cycle: null, follow: false })
    later(() => patch({ state: 'wide' }), 1500)
    later(() => {
      patch({ state: 'idle', follow: true })
      setSay('……晚上好。')
    }, 2400)
    later(() => {
      patch({ state: 'notify' })
      askOn()
    }, 3600)
    later(() => patch({ cycle: MONTAGE }), 5400)
  }

  const ask = (e: FormEvent) => {
    e.preventDefault()
    clear()
    setAsking(false)
    setReading(null)
    setOpened([false, false, false])
    setPhase('open')
    setSay(`"${question.trim() || '……'}"`)
    patch({ ...REST, state: 'thinking', follow: false })
    later(() => setSay('嗯……'), 1200)
    later(() => {
      patch({ state: 'notify' })
      setHand(drawThree())
      setPhase('cards')
      setSay('三张。翻一张。')
    }, 3600)
    later(() => patch({ state: 'idle', follow: true }), 5200)
  }

  const reveal = (k: number) => {
    if (openedRef.current[k]) return
    const h = hand[k]!
    const c = h.card
    const next = openedRef.current.map((o, i) => o || i === k)
    setOpened(next)
    clear()
    patch({ state: 'wide', cycle: null, follow: false })
    setSay(`${POSITIONS[k]}：${c.zh}${h.reversed ? '，逆位' : ''}……`)
    // it becomes the card: its shape, its face, its colour, its move
    later(() => patch({ shape: c.shape, expression: c.expr, color: c.color, state: h.reversed && c.react !== 'alert' ? 'thinking' : c.react }), 700)
    later(() => patch({ state: 'idle', follow: true }), 3100)
    later(() => patch({ shape: 'cercle', color: null, expression: h.reversed ? 'triste' : 'heureux' }), 4600)
    later(() => patch({ expression: 'neutre' }), 6400)

    if (next.every(Boolean)) {
      setReading('loading')
      const lines = divine(question, hand)
      lines.forEach((_, i) => later(() => setReading(lines.slice(0, i + 1)), 3400 + i * 1100))
      later(() => {
        setSay('就这些。往下看。')
        setPhase('done')
      }, 3200)
      later(() => patch({ cycle: MONTAGE }), 7000)
    }
  }

  const again = () => {
    clear()
    setReading(null)
    setOpened([false, false, false])
    setPhase('open')
    patch({ ...REST })
    stageRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' })
    later(askOn, 500)
    later(() => patch({ cycle: MONTAGE }), 2000)
  }

  const exportPng = async () => {
    const faces = [...document.querySelectorAll<SVGSVGElement>('.face.front .card-svg')]
    if (faces.length !== 3) return
    try {
      const blob = await spreadToPng(question, hand, faces, theme)
      setSheet({ url: URL.createObjectURL(blob), blob })
      patch({ state: 'wink', cycle: null })
      later(() => patch({ state: 'idle' }), 1800)
    } catch {
      setSay('导出失败了，再试一次。')
    }
  }

  const copyPng = async () => {
    if (!sheet) return
    try {
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': sheet.blob })])
      setCopied('已复制')
    } catch {
      setCopied('复制不了，右键图片另存为')
    }
  }

  const stageClass = `stage${asking ? ' asking' : ''}`
  const seerSize = phase === 'cards' || phase === 'done' ? 200 : 320

  return (
    <main>
      <header>
        <h1>
          @bloub<span className="dot">.</span>tarot
        </h1>
        <span>一个问题，三张牌</span>
      </header>

      <div className={stageClass} data-phase={phase} ref={stageRef}>
        <div className="scene">
          <div className="spot" />
          <div className="floor" />
          <div className="table" />
          <div className="line">{say}</div>

          <form className="bubble" onSubmit={ask}>
            <p>你今天想问什么？</p>
            <div className="row">
              <input ref={inputRef} value={question} onChange={(e) => setQuestion(e.target.value)} maxLength={120} aria-label="你的问题" autoComplete="off" />
              <button type="submit">问它</button>
            </div>
          </form>

          <div className="cards">
            {hand.map((h, k) => (
              <div
                key={`${h.card.n}-${k}`}
                className={`flip${opened[k] ? ' open' : ''}`}
                role="button"
                tabIndex={0}
                aria-label={`翻开${POSITIONS[k]}这张牌`}
                onClick={() => reveal(k)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    reveal(k)
                  }
                }}
              >
                <div className="in">
                  <div className="face back">
                    <CardBack theme={theme} />
                  </div>
                  <div className="face front">
                    <CardFace card={h.card} reversed={h.reversed} theme={theme} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="seer">
            <Seer look={look} theme={theme} size={seerSize} />
          </div>
        </div>

        <div className="curtain l" />
        <div className="curtain r" />
        <div className="marquee">
          <h2>bloub 塔罗</h2>
          <small>今晚的占卜师：一个黑球</small>
          <button type="button" onClick={openCurtain}>
            拉开幕布
          </button>
        </div>
      </div>

      {hand.length > 0 && (
        <div className="reading">
          {hand.map((h, k) =>
            opened[k] ? (
              <div key={k}>
                <b>
                  {POSITIONS[k]} · {h.card.zh}
                  {h.reversed && <span className="rev"> 逆位</span>}
                </b>
                <span>
                  {h.card.text}
                  {h.reversed && <span className="rev"> 逆位——把这句话反过来听。</span>}
                </span>
              </div>
            ) : null
          )}
          {reading === 'loading' && <p className="bloub-says muted">bloub 想了想……</p>}
          {Array.isArray(reading) && (
            <div className="bloub-says">
              <b>bloub 说：</b>
              {reading.map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
          )}
        </div>
      )}

      {phase === 'done' && (
        <div className="after">
          <button type="button" onClick={again}>
            再问一个
          </button>
          <button type="button" className="quiet" onClick={exportPng}>
            导出为图片
          </button>
        </div>
      )}

      {sheet && (
        <div className="sheet" onClick={(e) => e.target === e.currentTarget && setSheet(null)}>
          <div>
            <img src={sheet.url} alt="三张牌的合影" />
            <div className="row">
              <button type="button" onClick={() => downloadBlob(sheet.blob, 'bloub-tarot.png')}>
                下载 PNG
              </button>
              <button type="button" className="quiet" onClick={copyPng}>
                {copied ?? '复制到剪贴板'}
              </button>
              <button type="button" className="quiet" onClick={() => setSheet(null)}>
                关闭
              </button>
              <span className="hint">或者右键 / 长按图片另存为。</span>
            </div>
          </div>
        </div>
      )}

      <footer>
        <a href="https://github.com/comedianhhh">Alan</a> 做的 · 占卜师和 22 张牌都是 <a href="https://github.com/jeremy-prt/bloub">bloub</a>（Jérémy Perret，MIT）。
      </footer>
    </main>
  )
}
