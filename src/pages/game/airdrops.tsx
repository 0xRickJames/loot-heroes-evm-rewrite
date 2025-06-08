import React, { useState } from "react"
import { WalletAware } from "src/components/Game/Common"
import { ChestCoin, ChestCoinType } from "../../library/legendaryloot.interface"
import { LegendaryLootService } from "../../library/legendaryloot.service"
import useAsyncEffect from "use-async-effect"
import { Loading } from "src/components/Widget/Loading"
import { HideIfLoading } from "src/components/Widget/HideIfLoading"

import InteractiveButton from "src/components/Widget/InteractiveButton"
import Link from "next/link"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { Container } from "src/components/Container"

export const Airdrops: React.FC<WalletAware> = () => {
  const [isLoading, setIsLoading] = useState(true)
  const { connection } = useConnection()
  const wallet = useWallet()

  const { address } = wallet
  const [chestCoins, setChestCoins] = useState<ChestCoin[]>()

  const nftBridge = new LegendaryLootService(connection)

  useAsyncEffect(async () => {
    if (wallet.address) {
      if (chestCoins !== undefined) return
      setIsLoading(true)

      const itemsFrom = await nftBridge.getChestCoins(address)

      setChestCoins(itemsFrom)
      setIsLoading(false)
    }
  }, [chestCoins, wallet])

  const chestDescriptions = {
    bronze: (
      <p>
        This bronze chest contains essential gear for your adventure, and
        ocassionally amazing and rare pieces!
      </p>
    ),
    silver: (
      <p>
        You can expect to find amazing rewards and gear that will help you with
        your adventure!
      </p>
    ),
    gold: (
      <p>
        The best of the best, you will ocassionally find truly epic and
        outstanding gear in those gold chests
      </p>
    ),
  }

  return (
    <Container header={null}>
      <div className="container mb-8 mt-10">
        <div className="w-full">
          {!wallet.address ? (
            "Please, connect your wallet first!"
          ) : (
            <>
              <Loading isLoading={isLoading} />
              <HideIfLoading isLoading={isLoading}>
                <div className="flex flex-col space-y-4 content-start">
                  <div>
                    <h1 className="font-bold text-center text-3xl">Airdrops</h1>
                  </div>
                  <div className="flex flex-row space-x-4">
                    {chestCoins?.map((chest) => {
                      return (
                        <div className="text-center w-1/3 flex flex-col p-4 mt-10 border-4 bg-gray-900 bg-opacity-30">
                          <div>
                            <img
                              src={
                                chest.type === ChestCoinType.Bronze
                                  ? "/img/chest_bronze.png"
                                  : chest.type === ChestCoinType.Silver
                                  ? "/img/chest_silver.png"
                                  : "/img/chest_gold.png"
                              }
                            />
                          </div>
                          <div className={"text-center pt-5"}>
                            <p className="mb-5">
                              {chestDescriptions[chest.type]}
                            </p>
                            <p>
                              Available to open: <strong>{chest.amount}</strong>
                            </p>
                            <p>
                              <InteractiveButton>
                                Coming Soon!
                              </InteractiveButton>
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </HideIfLoading>
            </>
          )}
        </div>
      </div>
    </Container>
  )
}

export default Airdrops
