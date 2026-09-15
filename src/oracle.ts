import type { Drawn } from './cards'
import type { Lang } from './i18n'

/**
 * bloub's reading. It never answers the question; it talks around it, the way
 * a fortune teller who has seen too much does. Everything is local: two
 * fragments of mist per card, a handful of frames, a dice roll.
 */

type Frame = (m: string) => string

interface Voice {
  /** two lines per card, by numeral: short, concrete, beside the point */
  mist: Record<string, [string, string]>
  openers: string[]
  past: Frame[]
  present: Frame[]
  future: Frame[]
  reversed: Frame[]
  closers: string[]
  /** how the question is echoed back */
  echo: (q: string) => string
}

const lower = (m: string) => m.charAt(0).toLowerCase() + m.slice(1)

const VOICES: Record<Lang, Voice> = {
  zh: {
    mist: {
      '0': ['一只脚已经在悬崖外面了', '口袋里什么都没有，所以也没什么好丢的'],
      I: ['桌上的东西都齐了，只差一只手', '你以为在等机会，其实机会在等你动'],
      II: ['帘子后面有东西，但她不打算掀', '你早就知道了，别装'],
      III: ['有东西在长，只是慢', '别老拔出来看根'],
      IV: ['椅子是硬的，坐上去就得坐直', '规矩是写给害怕的人的'],
      V: ['老路上有脚印，不是你的', '去问吧，问了就得听'],
      VI: ['两条路，走一条，另一条会一直跟着你', '选了就别回头数'],
      VII: ['方向对了，但缰绳在抖', '快，不等于到'],
      VIII: ['嘴闭着，手没松', '轻一点，它就不咬了'],
      IX: ['灯只照一步远，够了', '有些答案怕人多'],
      X: ['它转了一格，你听见了吗', '上面的人和下面的人，一会儿就换'],
      XI: ['秤还在晃，先别读数', '欠的会到，给的也会'],
      XII: ['倒过来看，房子没变，你变了', '卡住的时候，最好别使劲'],
      XIII: ['一扇门关了，风从另一边来', '那件事本来就该谢幕了'],
      XIV: ['一半一半，刚好', '别倒太快，杯子会满'],
      XV: ['链子很松，你没拽', '你喜欢的那个坑，你认识它'],
      XVI: ['先倒的，是本来就站不稳的', '等灰落完了再看'],
      XVII: ['远，但亮着', '喝口水，抬头'],
      XVIII: ['晚上看到的，白天别信', '影子比东西大'],
      XIX: ['就是好，别问为什么', '晒一晒，什么都干了'],
      XX: ['有人在叫你的名字，听出来是谁', '回音到了'],
      XXI: ['一圈走完了', '收下，然后再来一圈']
    },
    openers: ['嗯。', '我看到了一点东西，但不多。', '牌没有说清楚。它们从来不。', '……先别急。', '你问的不是这个。不过没关系，牌听见了。', '这三张凑在一起，不常见。'],
    past: [(m) => `${m}。那是身后的事了，但它还在走。`, (m) => `你来之前，${m}。你自己知道。`, (m) => `过去这张牌只说了一句：${m}。`],
    present: [(m) => `眼下呢——${m}。`, (m) => `现在这张牌在看你。${m}。`, (m) => `此刻的样子是这样的：${m}。`],
    future: [(m) => `至于你问的那件事……${m}。牌只肯说到这里。`, (m) => `往前看，${m}。别问我什么时候。`, (m) => `将来的牌翻过来是这样：${m}。信不信随你。`],
    reversed: [(m) => `牌是倒的——${m}，反着听。`, (m) => `${m}。可这张牌头朝下，所以也许正好相反。`],
    closers: ['会不会？牌不回答"会不会"。', '今晚就到这里。', '去做那件你一直在推的事，然后再来。', '它转过去了，我就看到这么多。', '剩下的，你比牌清楚。', '别回头看牌了，看路。'],
    echo: (q) => `「${q}」`
  },
  en: {
    mist: {
      '0': ['One foot is already over the edge', 'Nothing in the pockets, so nothing to lose'],
      I: ["Everything's on the table; all it lacks is a hand", "You think you're waiting for the chance. It's waiting for you to move"],
      II: ["There's something behind the curtain, and she isn't lifting it", "You knew already. Don't pretend"],
      III: ['Something is growing, just slowly', 'Stop pulling it up to look at the roots'],
      IV: ['The chair is hard; sit up straight', 'Rules are written for the frightened'],
      V: ['There are footprints on the old road, and they are not yours', 'Ask, then. But asking means listening'],
      VI: ['Two roads. Take one and the other follows you', 'Once chosen, stop counting back'],
      VII: ['Right direction, shaky reins', 'Fast is not the same as arrived'],
      VIII: ['Mouth shut, grip steady', 'Gentler, and it stops biting'],
      IX: ["The lamp lights one step. That's enough", 'Some answers dislike crowds'],
      X: ['It turned one notch. Did you hear it?', 'Those on top and those below trade places soon'],
      XI: ["The scale is still swinging; don't read it yet", "What's owed arrives. So does what's given"],
      XII: ["Upside down, the house didn't change. You did", 'When stuck, the worst thing is to push'],
      XIII: ['A door closed; the wind comes from the other side', 'That act was due to end'],
      XIV: ['Half and half, exactly', 'Pour slower or the cup spills'],
      XV: ['The chain is slack; you never pulled', 'That hole you like — you know it well'],
      XVI: ['What fell first was never standing straight', 'Wait for the dust before you look'],
      XVII: ['Far, but lit', 'Drink some water. Look up'],
      XVIII: ["What you see at night, don't trust by day", 'The shadow is bigger than the thing'],
      XIX: ["Just good. Don't ask why", 'Sun on it, and everything dries'],
      XX: ['Someone is calling your name. Hear who', 'The echo is here'],
      XXI: ['A full circle', 'Take it, then go around again']
    },
    openers: ['Hm.', 'I see a little. Not much.', "The cards didn't say it clearly. They never do.", "…Don't rush.", "That isn't really what you're asking. Never mind — the cards heard you.", "These three together. That's not common."],
    past: [(m) => `${m}. That's behind you now, but it's still walking.`, (m) => `Before you came here, ${lower(m)}. You know that yourself.`, (m) => `The past card said one thing only: ${lower(m)}.`],
    present: [(m) => `And now — ${lower(m)}.`, (m) => `The present card is looking at you. ${m}.`, (m) => `This is how it stands right now: ${lower(m)}.`],
    future: [(m) => `As for what you asked… ${lower(m)}. That's as far as the cards go.`, (m) => `Ahead, ${lower(m)}. Don't ask me when.`, (m) => `Turned over, the future card reads: ${lower(m)}. Believe it or not.`],
    reversed: [(m) => `The card is upside down — ${lower(m)}, heard backwards.`, (m) => `${m}. But this one is head-down, so maybe the opposite.`],
    closers: ["Will it? The cards don't answer “will it”.", "That's all for tonight.", 'Go do the thing you keep putting off, then come back.', "It turned away. That's all I saw.", 'The rest, you know better than the cards.', 'Stop looking at the cards. Look at the road.'],
    echo: (q) => `“${q}”`
  }
}

const pick = <T>(xs: readonly T[]): T => xs[Math.floor(Math.random() * xs.length)]!

/** Three to five short lines. */
export function divine(lang: Lang, question: string, hand: Drawn[]): string[] {
  const v = VOICES[lang]
  const [p, n, f] = hand
  if (!p || !n || !f) return []
  const fragment = (d: Drawn) => {
    const m = pick(v.mist[d.card.n] ?? [d.card.text[lang], d.card.text[lang]])
    return d.reversed ? pick(v.reversed)(m) : m
  }
  const lines: string[] = []
  const q = question.trim()
  if (q && Math.random() < 0.5) lines.push(v.echo(q.length > 40 ? q.slice(0, 40) + '…' : q))
  lines.push(pick(v.openers))
  lines.push(p.reversed ? fragment(p) : pick(v.past)(fragment(p)))
  lines.push(n.reversed ? fragment(n) : pick(v.present)(fragment(n)))
  lines.push(f.reversed ? fragment(f) : pick(v.future)(fragment(f)))
  lines.push(pick(v.closers))
  return lines
}
