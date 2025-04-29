import { JsonMetadata } from "@metaplex-foundation/js"
import { SolanaToken } from "./solana.interface"

import Dexie, { Table } from "dexie"
import { MetadataJsonAttribute } from "@metaplex/js"

export interface MetaplexMetadataCacheEntry {
  mint?: string
  name: string
  symbol: string
  uri: string
  creators: { verified: boolean; address: string }[] | undefined
}

export class MetaplexMetadataCache extends Dexie {
  metaplexMetadatas!: Table<MetaplexMetadataCacheEntry>

  constructor() {
    super("MetaplexMetadata")

    this.version(1).stores({
      metaplexMetadatas: "++mint, symbol", // Primary key and indexed props
    })
  }
}

export const metaplexCache = new MetaplexMetadataCache()

export type MetaplexExternalMetadata = JsonMetadata & {
  internalAttributes?: MetadataJsonAttribute[]
}

export type MetaplexNft = SolanaToken & {
  metaplexMetadata: MetaplexMetadataCacheEntry
}

export type ExternalMetaplexNft = MetaplexNft & {
  externalMetadata: MetaplexExternalMetadata
}
