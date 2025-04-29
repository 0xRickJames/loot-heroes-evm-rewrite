// @ts-ignore
import environment from "src/environments/production"
import { plainToClass, Transform } from "class-transformer"
import { ExternalMetaplexNft } from "./metaplex.interface"
import { PublicKey } from "@solana/web3.js"
import { Errors, GenericError } from "./errors"

export interface LegendaryLootEntity {
  getStat(stat: LegendaryLootEntityStats): number
  getResistance(res: LegendaryLootEntityResistances): number
  getNftId(): string
}

export enum LegendaryLootHeroRarity {
  Lord = "lord",
  Knight = "knight",
  Soldier = "soldier",
}

export enum LegendaryLootItemRarity {
  Rare = "rare",
  Epic = "epic",
}

export enum LegendaryLootItemDamageType {
  Slashing,
}

export enum LegendaryLootItemSlot {
  Helm = "helm",
  Shoulder = "shoulders",
  Chest = "chest",
  Hands = "hands",
  Legs = "legs",
  Weapon = "weapon",
  Ring = "ring",
  Neck = "neck",
}

export interface GearSet {
  setID: string
  setName: string
  itemList: string[]
}

export interface HeroMetadata {
  classID: string
  heroLootScore: number
}

export function LegendaryLootHeroRarityName(entry: LegendaryLootHeroRarity) {
  switch (entry) {
    case LegendaryLootHeroRarity.Knight:
      return "Knight"
    case LegendaryLootHeroRarity.Lord:
      return "Lord"
    case LegendaryLootHeroRarity.Soldier:
      return "Soldier"
  }
}

export function LegendaryLootItemSlotName(entry: LegendaryLootItemSlot) {
  switch (entry) {
    case LegendaryLootItemSlot.Helm:
      return "Helm"
    case LegendaryLootItemSlot.Shoulder:
      return "Shoulder"
    case LegendaryLootItemSlot.Chest:
      return "Chest"
    case LegendaryLootItemSlot.Hands:
      return "Hands"
    case LegendaryLootItemSlot.Legs:
      return "Legs"
    case LegendaryLootItemSlot.Weapon:
      return "Weapon"
    case LegendaryLootItemSlot.Ring:
      return "Ring"
    case LegendaryLootItemSlot.Neck:
      return "Neck"
  }
}

export function LegendaryLootItemRarityName(entry: string) {
  switch (entry) {
    case LegendaryLootItemRarity.Epic:
      return "Epic"
    case LegendaryLootItemRarity.Rare:
      return "Rare"
  }
}

export const LegendaryLootSlotAmount = Object.keys(LegendaryLootItemSlot).length

export enum LegendaryLootEntityStats {
  Attack = "Attack",
  Armor = "Armor",
  Speed = "Speed",
  Constitution = "Constitution",
  Intelligence = "Intelligence",
  CritChance = "CritChance",
  BonusCritDamage = "BonusCritDamage",
  Parry = "Parry",
  Dodge = "Dodge",
  Resilience = "Resilience",
  Penetration = "Penetration",
  Lifesteal = "Lifesteal",
  Stun = "Stun",
  BonusMagDamage = "BonusMagDamage",
}

export enum LegendaryLootEntityResistances {
  Bludgeon = "Bludgeon",
  Piercing = "Piercing",
  Slashing = "Slashing",
  Magic = "Magic",
  Physical = "Physical",
  Fire = "Fire",
  Ice = "Ice",
  Hydro = "Hydro",
  Dark = "Dark",
  Aero = "Aero",
  Geo = "Geo",
  Gaia = "Gaia",
  Holy = "Holy",
  Void = "Void",
}

export class LegendaryLootIterator {
  getStats() {
    return {}
  }
}

export interface LegendaryLootItemAttributeEntry {
  itemID: string
  name: string
  set: string
  slot: string
  rarity: string
  lootScore: number
  image: string
  element: string
}

export interface LegendaryLootItemSet {
  PieceBonus4: LegendaryLootEntityStats
  PieceBonus8: LegendaryLootEntityStats
}

export enum ChestCoinType {
  Bronze = "bronze",
  Silver = "silver",
  Gold = "gold",
}

export interface ChestCoin {
  type: ChestCoinType
  amount: number
}

abstract class BaseLegendaryLootEntity implements LegendaryLootEntity {
  protected nftId: string | null = null

  constructor(protected externalMetaplexNft: ExternalMetaplexNft) {}

  isRevealed(): boolean {
    if (!this.externalMetaplexNft.externalMetadata.internalAttributes) {
      return false
    }

    return (
      this.externalMetaplexNft.externalMetadata.internalAttributes.length > 0
    )
  }

  getImage(): string {
    return this.externalMetaplexNft.externalMetadata.image
  }

  getTokenAccount(): PublicKey {
    return this.externalMetaplexNft.publicKey
  }

  getTokenMint(): PublicKey {
    return this.externalMetaplexNft.mint
  }

  getAttributeNumber(attributeName: string): number {
    let attribute =
      this.externalMetaplexNft.externalMetadata.internalAttributes.find(
        (a) => a.trait_type === attributeName
      )

    if (!attribute) {
      throw GenericError.new(Errors.InvalidAttributeError)
        .withParameter("attribute", attributeName)
        .withParameter(
          "attributes",
          this.externalMetaplexNft.externalMetadata.internalAttributes
        )
        .build()
    }

    if (!isNaN(parseInt(attribute.value))) {
      return parseInt(attribute.value)
    }

    throw GenericError.new(Errors.InvalidAttributeType)
      .withParameter("attribute", attributeName)
      .withParameter("type", "number")
      .withParameter(
        "attributes",
        this.externalMetaplexNft.externalMetadata.internalAttributes
      )
      .build()
  }

  getAttribute(
    attributeName: string,
    defaultValue: string | null = null
  ): string | null {
    if (!this.isRevealed()) {
      return defaultValue
    }

    let attribute =
      this.externalMetaplexNft.externalMetadata.internalAttributes.find(
        (a) => a.trait_type === attributeName
      )

    if (!attribute && defaultValue !== undefined) {
      return defaultValue
    }

    if (!attribute) {
      throw GenericError.new(Errors.InvalidAttributeError)
        .withParameter("attribute", attributeName)
        .build()
    }

    return attribute.value
  }

  getName(): string {
    return this.externalMetaplexNft.externalMetadata.name
  }

  abstract getResistance(res: LegendaryLootEntityResistances): number
  abstract getStat(stat: LegendaryLootEntityStats): number
  abstract getNftId(): string
}

export class LegendaryLootItem extends BaseLegendaryLootEntity {
  // @ts-ignore
  @Transform(
    (value) => {
      let map = new Map<LegendaryLootEntityStats, number>()
      for (let entry of Object.entries(value.value))
        map.set(entry[0] as LegendaryLootEntityStats, entry[1] as number)
      return map
    },
    { toClassOnly: true }
  )
  public itemStats: Map<LegendaryLootEntityStats, number> = new Map<
    LegendaryLootEntityStats,
    number
  >()

  // @ts-ignore
  @Transform(
    (value) => {
      let map = new Map<LegendaryLootEntityResistances, number>()
      for (let entry of Object.entries(value.value))
        map.set(entry[0] as LegendaryLootEntityResistances, entry[1] as number)
      return map
    },
    { toClassOnly: true }
  )
  public itemResistances: Map<LegendaryLootEntityResistances, number> = new Map<
    LegendaryLootEntityResistances,
    number
  >()
  public set: GearSet

  getLootScore(): number {
    if (!this.isRevealed()) {
      return 0
    }

    return this.getAttributeNumber("lootScore")
  }

  getStat(stat: LegendaryLootEntityStats): number {
    return this.itemStats.has(stat) ? (this.itemStats.get(stat) as number) : 0
  }

  getResistance(res: LegendaryLootEntityResistances): number {
    return this.itemResistances.get(res)
      ? (this.itemResistances.get(res) as number)
      : 0
  }

  getSlot(): LegendaryLootItemSlot {
    return this.getAttribute("slot") as LegendaryLootItemSlot
  }

  getRarity(): string {
    return this.getAttribute("rarity") as string
  }

  getSet(): string {
    return this.getAttribute("set") as string
  }

  getElement(): string {
    return this.getAttribute("element") as string
  }

  getNftId(): string {
    return this.externalMetaplexNft.mint.toString()
  }
}

export class LegendaryLootHero extends BaseLegendaryLootEntity {
  // @ts-ignore
  @Transform(
    (value) => {
      let map = new Map<LegendaryLootItemSlot, LegendaryLootItem>()
      for (let entry of Object.entries(value.value))
        map.set(
          entry[0] as LegendaryLootItemSlot,
          plainToClass(LegendaryLootItem, entry[1])
        )
      return map
    },
    { toClassOnly: true }
  )
  public loot: Map<LegendaryLootItemSlot, LegendaryLootItem> = new Map<
    LegendaryLootItemSlot,
    LegendaryLootItem
  >()
  public staked: boolean = false

  public isStaked(): boolean {
    return this.staked
  }

  public getHeroClassImage(): string {
    return `${
      environment.assetBaseUrl
    }/common/hero/${this.getHeroClassId()}.png`
  }

  public getHeroClassImageSquare(): string {
    return `${
      environment.assetBaseUrl
    }/common/hero/${this.getHeroClassId()}-square.png`
  }

  getHeroClassId(): string {
    return this.getAttribute("classID") as string
  }

  getHeroClassName(): string {
    return this.getAttribute("className") as string
  }

  getHeroAttackType(): string {
    return this.getAttribute("heroAttackType") as string
  }

  getStarRating(): string {
    return this.getAttribute("starRating") as string
  }

  public getEquippedCount(): number {
    return this.loot.size
  }

  public getHeroLootScore(): number {
    try {
      return this.getAttributeNumber("heroLootScore")
    } catch (e) {
      return 0
    }
  }

  public getLootScore(): number {
    let baseLootScore = this.getHeroLootScore()

    // @ts-ignore
    let itemLootScore = [...this.loot.entries()]
      .map((slot) => {
        return this.loot.get(slot[0])?.getLootScore() as number
      })
      .reduce((a, b) => a + b, 0)

    return baseLootScore + itemLootScore
  }

  public getStat(stat: LegendaryLootEntityStats): number {
    // @ts-ignore
    return [...this.loot.entries()]
      .map((slot) => {
        return this.loot.get(slot[0])?.getStat(stat) as number
      })
      .reduce((a, b) => a + b, 0)
  }

  public getResistance(res: LegendaryLootEntityResistances): number {
    // @ts-ignore
    return [...this.loot.entries()]
      .map((slot) => {
        return this.loot.get(slot[0])?.getResistance(res) as number
      })
      .reduce((a, b) => a + b, 0)
  }

  public getItemInSlot(
    slot: LegendaryLootItemSlot
  ): LegendaryLootItem | undefined {
    return this.loot.get(slot)
  }

  public getRawSlots() {
    return this.externalMetaplexNft.externalMetadata.internalAttributes.filter(
      (a) => a.trait_type.includes("slot_")
    )
  }

  public getRarity(): LegendaryLootHeroRarity {
    return this.getAttribute("heroRarity") as LegendaryLootHeroRarity
  }

  getNftId(): string {
    if (this.nftId !== null) {
      return this.nftId
    }

    let encodedAttributeNftId = this.getAttribute("nftId", null)

    if (encodedAttributeNftId) {
      let candidateNumber = encodedAttributeNftId

      if (!isNaN(parseInt(candidateNumber))) {
        this.nftId = candidateNumber
        return this.nftId
      }
    }

    let parsedName = this.externalMetaplexNft.metaplexMetadata.name.split("#")

    if (parsedName.length === 2) {
      this.nftId = parsedName[1]
      return this.nftId
    }

    throw GenericError.new(Errors.UnableToDetermineNftId)
      .withParameter("nft", this.externalMetaplexNft)
      .build()
  }
}
