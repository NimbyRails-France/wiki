export type Block =
  | { kind: 'text'; text: string }
  | { kind: 'code'; code: string; language?: string; title?: string }
  | { kind: 'note'; text: string; title?: string }
  | { kind: 'list'; items: string[] }
  | { kind: 'table'; columns: string[]; rows: string[][] }
  | { kind: 'links'; items: { label: string; to: string }[] }

export interface Section {
  id: string
  title: string
  blocks: Block[]
}
export interface Article {
  slug: string
  title: string
  description: string
  group: 'Commencer' | 'Créer un mod' | 'Lire et agir' | 'Référence' | 'Maintenance'
  status?: 'experimental' | 'development'
  sections: Section[]
}
export const text = (text: string): Block => ({ kind: 'text', text })
export const code = (code: string, title?: string, language = 'kotlin'): Block => ({
  kind: 'code',
  code,
  title,
  language,
})
export const note = (text: string, title = 'À retenir'): Block => ({ kind: 'note', text, title })
export const list = (...items: string[]): Block => ({ kind: 'list', items })
export const table = (columns: string[], rows: string[][]): Block => ({
  kind: 'table',
  columns,
  rows,
})
export const links = (...items: { label: string; to: string }[]): Block => ({
  kind: 'links',
  items,
})
