// Interfaces for Card and Deck types

export interface Card {
  mint?: string
  id: string
  lootScore: number
  sprite: string
  element: string
  type: string
  topAttack: number
  rightAttack: number
  bottomAttack: number
  leftAttack: number
  specialAbility1?: string
  specialAbility2?: string
  starRating: string
  hasEpicSet?: boolean
  helm?: string
  shoulder?: string
  neck?: string
  hands?: string
  legs?: string
  ring?: string
  weapon?: string
  chest?: string
  topAttackBoost?: number
  rightAttackBoost?: number
  bottomAttackBoost?: number
  leftAttackBoost?: number
}

export interface Deck {
  owner: string
  lootScore: number
  name: string
  cards: [string, string, string, string, string, string, string]
}
