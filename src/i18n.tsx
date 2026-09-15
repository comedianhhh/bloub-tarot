import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export type Lang = 'en' | 'zh'

/** Every string the page shows. Card meanings and the oracle live with the cards. */
export interface Strings {
  tagline: string
  marqueeTitle: string
  marqueeSub: string
  openCurtain: string
  greeting: string
  askPrompt: string
  askButton: string
  defaultQuestion: string
  thinking: string
  dealt: string
  reveal: (pos: string, name: string, reversed: boolean) => string
  done: string
  positions: [string, string, string]
  reversed: string
  reversedNote: string
  reversedMark: string
  bloubThinks: string
  bloubSays: string
  again: string
  save: string
  download: string
  copy: string
  copied: string
  copyFailed: string
  close: string
  saveHint: string
  exportFailed: string
  exportCaption: (pos: string, name: string, reversed: boolean) => string
  footerMade: string
  footerEngine: string
  htmlLang: string
}

export const STRINGS: Record<Lang, Strings> = {
  en: {
    tagline: 'One question, three cards',
    marqueeTitle: 'bloub tarot',
    marqueeSub: "Tonight's reader: a black ball",
    openCurtain: 'Open the curtain',
    greeting: '…Evening.',
    askPrompt: 'What do you want to ask tonight?',
    askButton: 'Ask',
    defaultQuestion: 'Will this application hear back?',
    thinking: 'Hm…',
    dealt: 'Three. Turn one.',
    reveal: (pos, name, reversed) => `${pos}: ${name}${reversed ? ', reversed' : ''}…`,
    done: "That's all. Look below.",
    positions: ['Past', 'Present', 'Future'],
    reversed: 'reversed',
    reversedNote: 'Reversed — hear it the other way round.',
    reversedMark: 'R',
    bloubThinks: 'bloub is thinking…',
    bloubSays: 'bloub says:',
    again: 'Ask another',
    save: 'Save as image',
    download: 'Download PNG',
    copy: 'Copy to clipboard',
    copied: 'Copied',
    copyFailed: "Can't copy — right-click the image",
    close: 'Close',
    saveHint: 'Or right-click / long-press the image to save it.',
    exportFailed: 'Export failed. Try again.',
    exportCaption: (pos, name, reversed) => `${pos} ${name}${reversed ? ' (reversed)' : ''}`,
    footerMade: 'Made by',
    footerEngine: 'The reader and all 22 cards are',
    htmlLang: 'en'
  },
  zh: {
    tagline: '一个问题，三张牌',
    marqueeTitle: 'bloub 塔罗',
    marqueeSub: '今晚的占卜师：一个黑球',
    openCurtain: '拉开幕布',
    greeting: '……晚上好。',
    askPrompt: '你今天想问什么？',
    askButton: '问它',
    defaultQuestion: '这份申请会有回音吗？',
    thinking: '嗯……',
    dealt: '三张。翻一张。',
    reveal: (pos, name, reversed) => `${pos}：${name}${reversed ? '，逆位' : ''}……`,
    done: '就这些。往下看。',
    positions: ['过去', '现在', '将来'],
    reversed: '逆位',
    reversedNote: '逆位——把这句话反过来听。',
    reversedMark: '逆',
    bloubThinks: 'bloub 想了想……',
    bloubSays: 'bloub 说：',
    again: '再问一个',
    save: '导出为图片',
    download: '下载 PNG',
    copy: '复制到剪贴板',
    copied: '已复制',
    copyFailed: '复制不了，右键图片另存为',
    close: '关闭',
    saveHint: '或者右键 / 长按图片另存为。',
    exportFailed: '导出失败了，再试一次。',
    exportCaption: (pos, name, reversed) => `${pos} ${name}${reversed ? '（逆位）' : ''}`,
    footerMade: '做的：',
    footerEngine: '占卜师和 22 张牌都是',
    htmlLang: 'zh-CN'
  }
}

const KEY = 'bloub-tarot-lang'

function initialLang(): Lang {
  try {
    const saved = localStorage.getItem(KEY)
    if (saved === 'en' || saved === 'zh') return saved
  } catch {
    /* private mode */
  }
  return 'en'
}

const LangContext = createContext<{ lang: Lang; t: Strings; setLang: (l: Lang) => void }>({
  lang: 'en',
  t: STRINGS.en,
  setLang: () => {}
})

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang)
  const setLang = (l: Lang) => {
    setLangState(l)
    try {
      localStorage.setItem(KEY, l)
    } catch {
      /* private mode */
    }
  }
  useEffect(() => {
    document.documentElement.lang = STRINGS[lang].htmlLang
    document.title = STRINGS[lang].marqueeTitle
  }, [lang])
  return <LangContext.Provider value={{ lang, t: STRINGS[lang], setLang }}>{children}</LangContext.Provider>
}

export const useLang = () => useContext(LangContext)
