import type { Drawn } from './cards'

/**
 * bloub's reading. It never answers the question; it talks around it, the way
 * a fortune teller who has seen too much does. Everything is local: a few
 * fragments per card, a handful of frames, a dice roll.
 */

/** Two lines of mist per card, by numeral. Short, concrete, and beside the point. */
const MIST: Record<string, [string, string]> = {
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
}

const OPENERS = [
  '嗯。',
  '我看到了一点东西，但不多。',
  '牌没有说清楚。它们从来不。',
  '……先别急。',
  '你问的不是这个。不过没关系，牌听见了。',
  '这三张凑在一起，不常见。'
]

const PAST = [
  (m: string) => `${m}。那是身后的事了，但它还在走。`,
  (m: string) => `你来之前，${m}。你自己知道。`,
  (m: string) => `过去这张牌只说了一句：${m}。`
]

const PRESENT = [
  (m: string) => `眼下呢——${m}。`,
  (m: string) => `现在这张牌在看你。${m}。`,
  (m: string) => `此刻的样子是这样的：${m}。`
]

const FUTURE = [
  (m: string) => `至于你问的那件事……${m}。牌只肯说到这里。`,
  (m: string) => `往前看，${m}。别问我什么时候。`,
  (m: string) => `将来的牌翻过来是这样：${m}。信不信随你。`
]

const REVERSED = [
  (m: string) => `牌是倒的——${m}，反着听。`,
  (m: string) => `${m}。可这张牌头朝下，所以也许正好相反。`
]

const CLOSERS = [
  '会不会？牌不回答"会不会"。',
  '今晚就到这里。',
  '去做那件你一直在推的事，然后再来。',
  '它转过去了，我就看到这么多。',
  '剩下的，你比牌清楚。',
  '别回头看牌了，看路。'
]

const pick = <T>(xs: readonly T[]): T => xs[Math.floor(Math.random() * xs.length)]!

function fragment(d: Drawn): string {
  const m = pick(MIST[d.card.n] ?? [d.card.text, d.card.text])
  return d.reversed ? pick(REVERSED)(m) : m
}

/** Three to five short lines. */
export function divine(question: string, hand: Drawn[]): string[] {
  const [p, n, f] = hand
  if (!p || !n || !f) return []
  const lines: string[] = []
  const q = question.trim()
  if (q && Math.random() < 0.5) lines.push(`「${q.length > 24 ? q.slice(0, 24) + '……' : q}」`)
  lines.push(pick(OPENERS))
  lines.push(p.reversed ? fragment(p) : pick(PAST)(fragment(p)))
  lines.push(n.reversed ? fragment(n) : pick(PRESENT)(fragment(n)))
  lines.push(f.reversed ? fragment(f) : pick(FUTURE)(fragment(f)))
  lines.push(pick(CLOSERS))
  return lines
}
