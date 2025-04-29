import React, { useMemo, useState } from "react"

import { LegendaryLootService } from "../../library/legendaryloot.service"
import { Loading } from "../Widget/Loading"
import { HideIfLoading } from "../Widget/HideIfLoading"

import "rc-slider/assets/index.css"
import { LegendaryLootHero } from "../../library/legendaryloot.interface"
import useAsyncEffect from "use-async-effect"
import { HeroList, HeroListGenericItem } from "./Widget/HeroList"

import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react"
import { useMediaQuery } from "@mui/material"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"

const Heroes = () => {
  const [heroes, setHeroes] = useState<LegendaryLootHero[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const wallet = useAnchorWallet()
  const { connection } = useConnection()

  const nftBridge = useMemo(
    () => (wallet ? new LegendaryLootService(connection) : null),
    [connection, wallet]
  )

  useAsyncEffect(async () => {
    if (nftBridge) {
      setIsLoading(true)

      let fetchedHeroes = await nftBridge.getAllLoadouts(wallet.publicKey)

      setHeroes(fetchedHeroes)
      setIsLoading(false)
    }
  }, [nftBridge])

  return (
    <div>
      {wallet ? (
        <>
          {" "}
          <Loading isLoading={isLoading} />
          <HideIfLoading
            isLoading={isLoading}
            className="flex flex-col space-y-4"
          >
            <HeroList
              items={heroes}
              perPage={8}
              noHeroes={<p>No heroes available</p>}
              showFilters={true}
              children={{ component: HeroListGenericItem, extraArgs: null }}
            />
          </HideIfLoading>
        </>
      ) : (
        <>
          Please, connect your wallet first. <WalletMultiButton />
        </>
      )}
    </div>
  )
}

export default Heroes
