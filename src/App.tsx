import { defaultCycle } from 'bloub-react'
import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'
import { CardBack, CardFace } from './Card'
import { drawThree, type Drawn } from './cards'
import { downloadBlob, spreadToPng } from './export'
import { STRINGS, useLang, type Lang } from './i18n'
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
  const { lang, t, setLang } = useLang()
  const { later, clear } = useScript()
  const [phase, setPhase] = useState<Phase>('closed')
  const [asking, setAsking] = useState(false)
  const [question, setQuestion] = useState(t.defaultQuestion)
  const [touched, setTouched] = useState(false)
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
  const switchLang = (l: Lang) => {
    setLang(l)
    if (!touched) setQuestion(STRINGS[l].defaultQuestion)
    // a finished reading is re-spoken in the new language (a new roll, same cards)
    if (Array.isArray(reading)) setReading(divine(l, question, hand))
  }
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
      setSay(t.greeting)
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
    later(() => setSay(t.thinking), 1200)
    later(() => {
      patch({ state: 'notify' })
      setHand(drawThree())
      setPhase('cards')
      setSay(t.dealt)
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
    setSay(t.reveal(t.positions[k]!, lang === 'zh' ? c.zh : c.en, h.reversed))
    // it becomes the card: its shape, its face, its colour, its move
    later(() => patch({ shape: c.shape, expression: c.expr, color: c.color, state: h.reversed && c.react !== 'alert' ? 'thinking' : c.react }), 700)
    later(() => patch({ state: 'idle', follow: true }), 3100)
    later(() => patch({ shape: 'cercle', color: null, expression: h.reversed ? 'triste' : 'heureux' }), 4600)
    later(() => patch({ expression: 'neutre' }), 6400)

    if (next.every(Boolean)) {
      setReading('loading')
      const lines = divine(lang, question, hand)
      lines.forEach((_, i) => later(() => setReading(lines.slice(0, i + 1)), 3400 + i * 1100))
      later(() => {
        setSay(t.done)
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
      const blob = await spreadToPng(question, hand, faces, theme, lang, t)
      setSheet({ url: URL.createObjectURL(blob), blob })
      patch({ state: 'wink', cycle: null })
      later(() => patch({ state: 'idle' }), 1800)
    } catch {
      setSay(t.exportFailed)
    }
  }

  const copyPng = async () => {
    if (!sheet) return
    try {
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': sheet.blob })])
      setCopied(t.copied)
    } catch {
      setCopied(t.copyFailed)
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
        <span>
          {t.tagline}
          <span className="lang" role="group" aria-label="Language">
            <button type="button" className={lang === 'en' ? 'on' : ''} onClick={() => switchLang('en')}>EN</button>
            <button type="button" className={lang === 'zh' ? 'on' : ''} onClick={() => switchLang('zh')}>中文</button>
          </span>
        </span>
      </header>

      <div className={stageClass} data-phase={phase} ref={stageRef}>
        <div className="scene">
          <div className="spot" />
          <div className="floor" />
          <div className="table" />
          <div className="line">{say}</div>

          <form className="bubble" onSubmit={ask}>
            <p>{t.askPrompt}</p>
            <div className="row">
              <input
                ref={inputRef}
                value={question}
                onChange={(e) => {
                  setQuestion(e.target.value)
                  setTouched(true)
                }}
                maxLength={120}
                aria-label={t.askPrompt}
                autoComplete="off"
              />
              <button type="submit">{t.askButton}</button>
            </div>
          </form>

          <div className="cards">
            {hand.map((h, k) => (
              <div
                key={`${h.card.n}-${k}`}
                className={`flip${opened[k] ? ' open' : ''}`}
                role="button"
                tabIndex={0}
                aria-label={t.positions[k]}
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
          <h2>{t.marqueeTitle}</h2>
          <small>{t.marqueeSub}</small>
          <button type="button" onClick={openCurtain}>
            {t.openCurtain}
          </button>
        </div>
      </div>

      {hand.length > 0 && (
        <div className="reading">
          {hand.map((h, k) =>
            opened[k] ? (
              <div key={k}>
                <b>
                  {t.positions[k]} · {lang === 'zh' ? h.card.zh : h.card.en}
                  {h.reversed && <span className="rev"> {t.reversed}</span>}
                </b>
                <span>
                  {h.card.text[lang]}
                  {h.reversed && <span className="rev"> {t.reversedNote}</span>}
                </span>
              </div>
            ) : null
          )}
          {reading === 'loading' && <p className="bloub-says muted">{t.bloubThinks}</p>}
          {Array.isArray(reading) && (
            <div className="bloub-says">
              <b>{t.bloubSays}</b>
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
            {t.again}
          </button>
          <button type="button" className="quiet" onClick={exportPng}>
            {t.save}
          </button>
        </div>
      )}

      {sheet && (
        <div className="sheet" onClick={(e) => e.target === e.currentTarget && setSheet(null)}>
          <div>
            <img src={sheet.url} alt="" />
            <div className="row">
              <button type="button" onClick={() => downloadBlob(sheet.blob, 'bloub-tarot.png')}>
                {t.download}
              </button>
              <button type="button" className="quiet" onClick={copyPng}>
                {copied ?? t.copy}
              </button>
              <button type="button" className="quiet" onClick={() => setSheet(null)}>
                {t.close}
              </button>
              <span className="hint">{t.saveHint}</span>
            </div>
          </div>
        </div>
      )}

      <footer>
        {t.footerMade} <a href="https://github.com/comedianhhh">Alan</a> · {t.footerEngine}{' '}
        <a href="https://github.com/jeremy-prt/bloub">bloub</a> (Jérémy Perret, MIT).
      </footer>
    </main>
  )
}
