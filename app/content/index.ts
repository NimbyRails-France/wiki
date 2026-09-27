import { guides } from './guides'
import { referenceArticles, referenceIndex } from './reference'
import { sfrGuide } from './sfr'
export const groups = [
  'Commencer',
  'Créer un mod',
  'Lire et agir',
  'Référence',
  'Maintenance',
] as const
export const articles = [
  ...guides.filter((a) => a.group !== 'Maintenance'),
  sfrGuide,
  referenceIndex,
  ...referenceArticles,
  ...guides.filter((a) => a.group === 'Maintenance'),
]
