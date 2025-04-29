import {
  Metadata,
  Metaplex,
  walletAdapterIdentity,
} from "@metaplex-foundation/js"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import React, { useCallback, useEffect } from "react"
import { LootHeroesNft } from "src/pages/api/gears"
import fullGear from "src/assets/fullGear.json"

type Props = {
  children: React.ReactNode
}

export const WalletNFTsContext = React.createContext<{
  allGearNfts: LootHeroesNft[]
  gearNfts: LootHeroesNft[]
  heroNfts: LootHeroesNft[]
  nfts: LootHeroesNft[]
  fetchNfts: () => Promise<void>
}>({
  allGearNfts: null,
  gearNfts: null,
  heroNfts: null,
  nfts: null,
  fetchNfts: async () => {},
})

const LH_COLLECTION_CREATOR_ADDRESSES = [
  "A7k2VaxWgftNfhsufvmUtiKP37JFydWkR51zokWQ5cwR",
  "79XjRxfmHsugKCNJRFXtQoZ8JEnLywstSadezho77QaE",
  "AaMBmepCxwpGsfTJtiXi1wE9xj5pNMaDizXVsyG91mK9",
]

export function WalletNFTsProvider(props: Props) {
  const wallet = useWallet()
  const { connection } = useConnection()
  const [allGearNfts, setAllGearNfts] = React.useState(null)
  const [gearNfts, setGearNfts] = React.useState(null)
  const [heroNfts, setHeroNfts] = React.useState(null)
  const [nfts, setNfts] = React.useState(null)

  const fetchNfts = useCallback(async () => {
    console.log("fetching...")
    const metaplex = new Metaplex(connection).use(walletAdapterIdentity(wallet))

    const allWalletNfts = (await metaplex
      .nfts()
      .findAllByOwner({ owner: wallet.publicKey })) as Metadata[]
    setNfts(allWalletNfts)
    /** Filter by creator */
    const allLootHeroesNfts = allWalletNfts.filter((NFT) => {
      const obj = NFT.creators?.find((value) => {
        return (
          LH_COLLECTION_CREATOR_ADDRESSES.indexOf(value.address.toString()) !==
          -1
        )
      })

      return obj
    })

    const allNamedLootHeroesNfts = allLootHeroesNfts.filter((nft) => nft.name)

    /** Load metadata */
    const loaded = await Promise.all(
      allNamedLootHeroesNfts.map(async (nft) => {
        const loaded = {
          ...(await metaplex.nfts().load({
            metadata: nft,
          })),
          address: nft.address,
        }

        return loaded
      })
    )

    const heroes = loaded.filter((nft) => {
      return nft.symbol.includes("HERO")
    })

    const gears = loaded.filter((nft) => {
      return nft.symbol.includes("GEAR")
    })

    setHeroNfts(heroes)
    setGearNfts(gears)

    setAllGearNfts(fullGear)
  }, [wallet, connection])
  useEffect(() => {
    if (wallet.publicKey && connection) {
      fetchNfts()
    }
  }, [wallet, connection, fetchNfts])

  return (
    <WalletNFTsContext.Provider
      value={{ allGearNfts, nfts, gearNfts, heroNfts, fetchNfts }}
    >
      {props.children}
    </WalletNFTsContext.Provider>
  )
}
