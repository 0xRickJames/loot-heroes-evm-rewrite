import { Connection } from "@metaplex/js"
import { address } from "@solana/web3.js"
import gearSets from "src/assets/sets.json"

// @ts-ignore
import environment from "src/environments/production"
import {
  ChestCoin,
  ChestCoinType,
  GearSet,
  HeroMetadata,
  LegendaryLootHero,
  LegendaryLootItem,
  LegendaryLootItemAttributeEntry,
  LegendaryLootItemSlot,
} from "./legendaryloot.interface"

import {
  ExternalMetaplexNft,
  MetaplexMetadataCacheEntry,
} from "./metaplex.interface"
import { MetaplexService } from "./metaplex.service"
import { SolanaService } from "./solana.service"
import { Errors, GenericError } from "./errors"
import HeroesMints from "../assets/mints.json"
import { TokenQueryOptions } from "./solana.interface"

import { BurnService } from "./burn.service"
import { HeroGears, PROGRAM_ID } from "./lootheroes/generated"

export const symbolLoadout = "HERO"
export const symbolItem = "GEAR"

export class LegendaryLootService {
  private gearMetadata: LegendaryLootItemAttributeEntry[] = []
  private gearSetMetadata: GearSet[] = []
  private heroMetadata: HeroMetadata[] = []
  private burnService: BurnService = new BurnService()

  constructor(
    private readonly connection: Connection,
    private solanaService: SolanaService = new SolanaService(connection),
    private metaplexService: MetaplexService = new MetaplexService(connection)
  ) {}

  async getGearMetadata(): Promise<LegendaryLootItemAttributeEntry[]> {
    if (this.gearMetadata.length === 0) {
      this.gearMetadata = (await fetch(
        `${environment.assetBaseUrl}/common/config/gear.json`
      )
        .then((response) => response.json())
        .catch(console.error)) as LegendaryLootItemAttributeEntry[]
    }

    return this.gearMetadata
  }

  async getGearSetMetadata() {
    return gearSets
  }

  async getHeroMetadata(): Promise<HeroMetadata[]> {
    if (this.heroMetadata.length === 0) {
      this.heroMetadata = (await fetch(
        `${environment.assetBaseUrl}/common/config/hero.json`
      )
        .then((response) => response.json())
        .catch(console.error)) as HeroMetadata[]
    }

    return this.heroMetadata
  }

  getHeroFromMetadata = async (
    token: ExternalMetaplexNft,
    staked: boolean = false
  ): Promise<LegendaryLootHero> => {
    let hero = new LegendaryLootHero(token)

    if (staked) {
      hero.staked = true
    }

    if (!hero.isRevealed()) {
      // unrevealed
      return hero
    }

    let gearMetadata = await this.getGearMetadata()
    let gearSet = await this.getGearSetMetadata()

    try {
      hero.loot = hero
        .getRawSlots()
        .map((metadataJsonAttribute) => {
          let dbItem = gearMetadata.find(
            (i) => i.itemID === metadataJsonAttribute.value
          )

          if (!dbItem) {
            throw new GenericError(Errors.UnableToFindItem).withParameter(
              "itemId",
              metadataJsonAttribute.value
            )
          }

          let set = gearSet.find((g) => g.setID === dbItem?.set) as GearSet

          let item = new LegendaryLootItem({
            amount: 1,
            externalMetadata: {
              name: dbItem.name,
              image: dbItem.image,
              internalAttributes: [
                { trait_type: "rarity", value: dbItem.rarity },
                { trait_type: "slot", value: dbItem.slot },
                { trait_type: "set", value: dbItem.set },
                { trait_type: "element", value: dbItem.element },
                { trait_type: "lootScore", value: dbItem.lootScore.toString() },
              ],
            },
          } as ExternalMetaplexNft)

          item.set = set

          return item
        })
        .reduce(
          (
            map: Map<LegendaryLootItemSlot, LegendaryLootItem>,
            item: LegendaryLootItem
          ) => {
            if (!item) {
              return map
            }

            map.set(item.getSlot(), item)
            return map
          },
          new Map()
        )
      return hero
    } catch (e) {
      return hero
    }
  }

  getAllLoadouts = async (
    address: address,
    filterByMint: string | null = null
  ): Promise<LegendaryLootHero[]> => {
    let queryOptions = {
      symbol: symbolLoadout,
      owner: address,
      mints: HeroesMints,
      decimalsAmount: 0,
      tokensAmount: 1,
    } as TokenQueryOptions

    if (filterByMint) {
      queryOptions.mints = [filterByMint]
    }

    let tokenMetadata =
      await this.metaplexService.getTokensBySymbolWithExternalMetadata(
        queryOptions
      )

    let fetches = tokenMetadata.map(
      async (element): Promise<LegendaryLootHero> => {
        return this.getHeroFromMetadata(element)
      }
    )

    return Promise.all(fetches)
  }

  async getAllItems(
    address: address,
    filterByMint: string | null = null
  ): Promise<LegendaryLootItem[]> {
    let queryOptions = {
      symbol: symbolItem,
      owner: address,
      decimalsAmount: 0,
      tokensAmount: 1,
    } as TokenQueryOptions

    if (filterByMint) {
      queryOptions.mints = [filterByMint]
    }

    let tokenMetadata =
      await this.metaplexService.getTokensBySymbolWithExternalMetadata(
        queryOptions
      )

    let fetches = tokenMetadata.map(
      async (token): Promise<LegendaryLootItem> => {
        let gearSet = await this.getGearSetMetadata()
        let item = new LegendaryLootItem(token)
        item.set = gearSet.find((g) => g.setID === item.getSet()) as GearSet
        return item
      }
    )

    return Promise.all(fetches)
  }

  async getChestCoins(address: address): Promise<ChestCoin[]> {
    let tokens = await this.solanaService.getTokensByOwner({
      owner: address,
      decimalsAmount: 0,
      tokensAmount: -1,
    })

    let bronzeChestCoins = tokens.filter(
      (t) => environment.chestCoins.bronze.token === t.mint.toString()
    )
    let silverChestCoins = tokens.filter(
      (t) => environment.chestCoins.silver.token === t.mint.toString()
    )
    let goldChestCoins = tokens.filter(
      (t) => environment.chestCoins.gold.token === t.mint.toString()
    )

    return [
      {
        type: ChestCoinType.Bronze,
        amount: bronzeChestCoins[0] ? bronzeChestCoins[0].amount : 0,
      },
      {
        type: ChestCoinType.Silver,
        amount: silverChestCoins[0] ? silverChestCoins[0].amount : 0,
      },
      {
        type: ChestCoinType.Gold,
        amount: goldChestCoins[0] ? goldChestCoins[0].amount : 0,
      },
    ]
  }

  async getLoadout(
    address: address,
    nftId: string,
    mint: string
  ): Promise<LegendaryLootHero | undefined> {
    let heroes = await this.getAllLoadouts(address, mint)

    return heroes.find((h) => h.getNftId() === nftId)
  }

  async getItem(
    address: address,
    nftId: string
  ): Promise<LegendaryLootItem | undefined> {
    let items = await this.getAllItems(address, nftId)

    return items.find((h) => h.getNftId() === nftId)
  }
}
