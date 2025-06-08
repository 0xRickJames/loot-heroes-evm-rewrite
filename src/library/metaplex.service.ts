import { Connection, address } from "@solana/web3.js"
import { asError, Errors, GenericError, NullArgumentError } from "./errors"

// @ts-ignore
import environment from "src/environments/production"
import {
  ExternalMetaplexNft,
  MetaplexExternalMetadata,
  MetaplexMetadataCacheEntry,
  MetaplexNft,
} from "./metaplex.interface"
import { SolanaService } from "./solana.service"
import { TokenQueryOptions } from "./solana.interface"
import { Metaplex } from "@metaplex-foundation/js"

export class MetaplexService {
  constructor(
    private connection: Connection,
    private solanaService: SolanaService = new SolanaService(connection),
    private metaplex = new Metaplex(connection)
  ) {}

  async getMetaplexMetadata(
    mint: address
  ): Promise<MetaplexMetadataCacheEntry | null> {
    if (!mint) {
      throw NullArgumentError.new("mint")
    }

    try {
      let metadata = await this.metaplex.nfts().findByMint({
        mintAddress: mint,
      })

      if (!metadata.uri) {
        return null
      }

      let cachedMetadata = {
        mint: mint.toString(),
        uri: metadata.uri,
        symbol: metadata.symbol,
        name: metadata.name,
        creators: metadata.creators?.map((c) => {
          return { address: c.address.toString(), verified: c.verified }
        }),
      }

      return cachedMetadata
    } catch (e) {
      // FT are indistinguishable from NFTs, I have to ignore
      // errors failing to fetch this PDA
      if (asError(e).message.includes("Unable to find account")) {
        return null
      }

      throw GenericError.new(
        Errors.MetaplexErrorFetchingMetadata
      ).withOriginalException(e)
    }
  }

  async getTokensBySymbol(
    queryOptions: TokenQueryOptions
  ): Promise<MetaplexNft[]> {
    let tokensByowner = await this.solanaService.getTokensByOwner(queryOptions)

    let tokenMetadata = await Promise.all(
      tokensByowner.map(async (t) => {
        return {
          address: t.address,
          mint: t.mint,
          metaplexMetadata: await this.getMetaplexMetadata(t.mint),
        } as MetaplexNft
      })
    )

    return tokenMetadata.filter((token) => {
      if (!token.metaplexMetadata) return false
      let isCorrectSymbol =
        token.metaplexMetadata.symbol === queryOptions.symbol
      return isCorrectSymbol && this.isCreatorVerified(token.metaplexMetadata)
    })
  }

  async sleep(ms: number) {
    return new Promise((r) => setTimeout(r, ms))
  }

  async getExternalMetadata(
    token: MetaplexNft
  ): Promise<MetaplexExternalMetadata> {
    if (!token.metaplexMetadata.uri) {
      return {} as MetaplexExternalMetadata
    }

    return (await fetch(token.metaplexMetadata.uri).then((response) =>
      response.json()
    )) as MetaplexExternalMetadata
  }

  async getTokensBySymbolWithExternalMetadata(
    queryOptions: TokenQueryOptions
  ): Promise<ExternalMetaplexNft[]> {
    let tokensBySymbol = await this.getTokensBySymbol(queryOptions)

    return await Promise.all(
      tokensBySymbol.map(async (token) => {
        return await this.getExternalMetaplexNft(token)
      })
    )
  }

  async getExternalMetaplexNft(
    token: MetaplexNft
  ): Promise<ExternalMetaplexNft> {
    return {
      amount: 1,
      address: token.address,
      mint: token.mint,
      metaplexMetadata: token.metaplexMetadata,
      externalMetadata: await this.getExternalMetadata(token),
    }
  }

  isCreatorVerified = (metadata: MetaplexMetadataCacheEntry): boolean => {
    let creators = metadata.creators

    if (!creators) {
      return false
    }

    let verifiedCandyMachinesIds = environment.candyMachines

    let firstVerifiedCreator = creators.find((creator) => {
      return (
        creator.verified && verifiedCandyMachinesIds.includes(creator.address)
      )
    })

    return firstVerifiedCreator !== null
  }
}
