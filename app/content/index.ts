import { guides } from './guides'
import { referenceArticles, referenceIndex } from './reference'
import { details } from './details'
import { translationsGuide } from './translations'
import { capabilities } from './capabilities'
import { authoring } from './authoring'
import { toolAuthoring } from './tool-authoring'
export const groups = [
  'Commencer',
  'Créer un mod',
  'Lire et agir',
  'Référence',
  'Maintenance',
] as const
const expandedGuides = guides.map((article) => ({
  ...article,
  sections: [...article.sections, ...(details[article.slug] || [])],
}))
export const articles = [
  ...expandedGuides.filter((a) => a.group !== 'Maintenance'),
  ...capabilities,
  ...authoring,
  ...toolAuthoring,
  translationsGuide,
  referenceIndex,
  ...referenceArticles,
  ...expandedGuides.filter((a) => a.group === 'Maintenance'),
]
