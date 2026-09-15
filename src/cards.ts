import type { ColorId, ExpressionId, ShapeId, StateId } from 'bloub-react'

/**
 * The 22 major arcana, each one a bloub: a catalogue state frozen `at` seconds
 * in, on a body shape, wearing a rest expression. `react` is what the seer does
 * when the card is turned, `color` the ink it borrows for that moment.
 */
export interface ArcanaCard {
  n: string
  zh: string
  en: string
  state: StateId
  at: number
  shape: ShapeId
  expr: ExpressionId
  react: StateId
  color: ColorId | null
  /** drawn upside-down when upright (the Hanged Man) */
  flip?: boolean
  text: string
}

export const CARDS: ArcanaCard[] = [
  { n: '0', zh: '愚者', en: 'The Fool', state: 'idle', at: 1.2, shape: 'nuage', expr: 'excite', react: 'play', color: 'vert', text: '什么都还没定，所以什么都可以。轻装出发。' },
  { n: 'I', zh: '魔术师', en: 'The Magician', state: 'play', at: 1.0, shape: 'cercle', expr: 'neutre', react: 'play', color: 'violet', text: '工具都在手边。缺的不是条件，是开始。' },
  { n: 'II', zh: '女祭司', en: 'The High Priestess', state: 'idle', at: 1.2, shape: 'cercle', expr: 'mefiant', react: 'wink', color: 'bleu', text: '先别说。你其实已经知道答案，只是还没承认。' },
  { n: 'III', zh: '皇后', en: 'The Empress', state: 'idle', at: 1.2, shape: 'goutte', expr: 'heureux', react: 'wide', color: 'rose', text: '慢慢长。给它水和时间，不要一直拔出来看根。' },
  { n: 'IV', zh: '皇帝', en: 'The Emperor', state: 'idle', at: 1.2, shape: 'hexagone', expr: 'fier', react: 'hexagon', color: 'rouge', text: '立规矩的时候到了。写下来，然后照做。' },
  { n: 'V', zh: '教皇', en: 'The Hierophant', state: 'idle', at: 1.2, shape: 'squircle', expr: 'attentif', react: 'thinking', color: 'brun', text: '去问懂的人。老办法之所以老，是因为它管用。' },
  { n: 'VI', zh: '恋人', en: 'The Lovers', state: 'notify', at: 1.0, shape: 'cercle', expr: 'neutre', react: 'notify', color: 'rose', text: '一个选择，两个方向。选你会为之负责的那个。' },
  { n: 'VII', zh: '战车', en: 'The Chariot', state: 'comet', at: 1.0, shape: 'cercle', expr: 'neutre', react: 'comet', color: 'orange', text: '方向对了就别停，速度会替你说话。' },
  { n: 'VIII', zh: '力量', en: 'Strength', state: 'idle', at: 1.2, shape: 'capsule', expr: 'fier', react: 'wide', color: 'orange', text: '不用喊。稳稳地做，比大声更有力气。' },
  { n: 'IX', zh: '隐士', en: 'The Hermit', state: 'idle', at: 1.2, shape: 'galet', expr: 'somnolent', react: 'sleep', color: 'gris', text: '关掉通知，一个人待一会儿。答案在安静里。' },
  { n: 'X', zh: '命运之轮', en: 'Wheel of Fortune', state: 'orbit', at: 1.4, shape: 'cercle', expr: 'neutre', react: 'orbit', color: 'turquoise', text: '轮到你了——不管是哪一面，它都会再转。' },
  { n: 'XI', zh: '正义', en: 'Justice', state: 'hexagon', at: 1.0, shape: 'cercle', expr: 'neutre', react: 'hexagon', color: 'bleu', text: '账会算清楚的。你付出的和拿到的，最终对得上。' },
  { n: 'XII', zh: '倒吊人', en: 'The Hanged Man', state: 'idle', at: 1.2, shape: 'galet', expr: 'confus', react: 'wide', color: 'turquoise', flip: true, text: '换个角度看。卡住不是失败，是视角问题。' },
  { n: 'XIII', zh: '死神', en: 'Death', state: 'egg', at: 1.0, shape: 'cercle', expr: 'neutre', react: 'egg', color: null, text: '有些东西该结束了。让它结束，腾出位置。' },
  { n: 'XIV', zh: '节制', en: 'Temperance', state: 'idle', at: 1.2, shape: 'capsule', expr: 'neutre', react: 'idle', color: 'turquoise', text: '不多不少。这一次，中间那条路是对的。' },
  { n: 'XV', zh: '恶魔', en: 'The Devil', state: 'idle', at: 1.2, shape: 'triangle', expr: 'colere', react: 'alert', color: 'rouge', text: '是什么把你拴住了？链子其实很松，你只是没拽。' },
  { n: 'XVI', zh: '塔', en: 'The Tower', state: 'burst', at: 0.3, shape: 'triangle', expr: 'effraye', react: 'burst', color: 'rouge', text: '会塌的东西本来就站不稳。塌了，反而清楚了。' },
  { n: 'XVII', zh: '星星', en: 'The Star', state: 'burst', at: 0.5, shape: 'cercle', expr: 'neutre', react: 'burst', color: 'bleu', text: '还没到，但方向是对的。抬头，不要低头。' },
  { n: 'XVIII', zh: '月亮', en: 'The Moon', state: 'idle', at: 1.2, shape: 'galet', expr: 'blase', react: 'sleep', color: 'violet', text: '现在看不清是正常的。别在夜里做决定。' },
  { n: 'XIX', zh: '太阳', en: 'The Sun', state: 'idle', at: 1.2, shape: 'cercle', expr: 'hilare', react: 'wink', color: 'ambre', text: '就是好。不需要解释的那种好。' },
  { n: 'XX', zh: '审判', en: 'Judgement', state: 'exclaim', at: 0.8, shape: 'cercle', expr: 'neutre', react: 'exclaim', color: 'orange', text: '回音来了。听清它在叫谁。' },
  { n: 'XXI', zh: '世界', en: 'The World', state: 'swirl', at: 0.9, shape: 'cercle', expr: 'neutre', react: 'swirl', color: 'vert', text: '一圈走完了。收下它，然后开始下一圈。' }
]

export const POSITIONS = ['过去', '现在', '将来'] as const

export interface Drawn {
  card: ArcanaCard
  reversed: boolean
}

/** Three distinct cards, each reversed with probability `reversedRate`. */
export function drawThree(reversedRate = 0.3): [Drawn, Drawn, Drawn] {
  const pool = [...CARDS]
  const pick = (): Drawn => {
    const card = pool.splice(Math.floor(Math.random() * pool.length), 1)[0]!
    return { card, reversed: Math.random() < reversedRate }
  }
  return [pick(), pick(), pick()]
}
