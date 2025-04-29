import React, { useState } from "react"
import { LegendaryLootService } from "../../library/legendaryloot.service"
import "tippy.js/animations/scale.css"
import gearSets from "src/assets/sets.json"

import { Loading } from "src/components/Widget/Loading"
import {
  GearSet,
  LegendaryLootItem,
} from "../../library/legendaryloot.interface"
import useAsyncEffect from "use-async-effect"
import { HideIfLoading } from "src/components/Widget/HideIfLoading"
import {
  ItemList,
  ItemListGeneric,
  ItemListGenericItemProps,
} from "src/components/Game/Widget/ItemList"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { useMediaQuery } from "@mui/material"
import { Metadata, Metaplex } from "@metaplex-foundation/js"
import { PublicKey } from "@solana/web3.js"
import { MetaplexMetadataCacheEntry } from "src/library/metaplex.interface"
import { LootHeroesNft } from "src/pages/api/gears"

export type ItemsProps = {
  listComponent?: React.FC<ItemListGenericItemProps>
  listChildren?: any
}

const GEARS_COLLECTION_CREATOR_ADDRESS = new PublicKey(
  "EMYBHGCAeBPRHxfFEuhRjszKsP5YLaFXubjeWJuVdieZ"
)

export function ItemsList(props: ItemsProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [mintFetchProgress, setMintFetchProgress] = useState(0)
  const [mintFetchError, setMintFetchError] = useState(false)

  const [items, setItems] = useState<LegendaryLootItem[]>()
  const { connection } = useConnection()
  const wallet = useWallet()
  const { publicKey } = wallet

  useAsyncEffect(async () => {
    if (wallet.publicKey) {
      setIsLoading(true)

      const metaplex = new Metaplex(connection)

      const nfts = await metaplex.nfts().findAllByOwner({
        owner: publicKey,
      })

      const gearNfts = nfts.filter((nft) =>
        nft.creators[0]?.address.equals(GEARS_COLLECTION_CREATOR_ADDRESS)
      )
      const namedGearNfts = gearNfts.filter((nft) => nft.name)

      // @TODO move loading to the `WalletNFTs` provider
      const loadedNfts: LootHeroesNft[] = await Promise.all(
        gearNfts.map((nft) =>
          metaplex.nfts().load({
            metadata: nft as Metadata,
          })
        )
      )

      // Convert normal Metaplex NFTs to LegendaryLootItem(s)
      const tokenMetadatas = loadedNfts.map((normal) => ({
        mint: normal.mint.address,
        metaplexMetadata: {
          creators: normal.creators.map((creator) => ({
            address: creator.address.toString(),
          })),
          name: normal.name,
          symbol: normal.symbol,
          uri: normal.uri,
          mint: normal.mint.address.toString(),
        } as MetaplexMetadataCacheEntry,
        externalMetadata: normal.json,
        publicKey: normal.address,
        amount: 1,
      }))

      const lootItems = await Promise.all(
        tokenMetadatas.map(async (token): Promise<LegendaryLootItem> => {
          const item = new LegendaryLootItem(token)
          item.set = gearSets.find((g) => g.setID === item.getSet()) as GearSet
          return item
        })
      )

      setItems(lootItems)
      setIsLoading(false)
    }
  }, [wallet])

  return !wallet.publicKey ? (
    <p>Please, connect your wallet first!</p>
  ) : (
    <>
      <Loading isLoading={isLoading}>
        {mintFetchError ? (
          <p>
            Unable to load gear. Please try again later and report further
            issues to #support
          </p>
        ) : (
          <p>Loading gear... {mintFetchProgress}%</p>
        )}
      </Loading>
      <HideIfLoading isLoading={isLoading}>
        <div className="flex flex-col space-y-4 content-start">
          {items ? (
            <ItemList
              items={items}
              perPage={8}
              children={{
                component: props.listComponent || ItemListGeneric,
                extraArgs: props.listChildren || null,
              }}
            />
          ) : (
            ""
          )}
        </div>
      </HideIfLoading>
    </>
  )
}
