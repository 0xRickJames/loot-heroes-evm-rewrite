import React, { useEffect, useState } from "react"
import { LegendaryLootService } from "src/library/legendaryloot.service"
import "tippy.js/animations/scale.css"

import { Loading } from "src/components/Widget/Loading"
import { useRouter } from "next/router"
import {
  LegendaryLootItem,
  LegendaryLootItemRarityName,
} from "src/library/legendaryloot.interface"
import { HideIfLoading } from "src/components/Widget/HideIfLoading"

import { WalletAware } from "src/components/Game/Common"
import InteractiveButton from "src/components/Widget/InteractiveButton"
import { RevealService } from "src/library/reveal.service"
import { PublicKey } from "@solana/web3.js"
import { metaplexCache } from "src/library/metaplex.interface"
import { Container } from "src/components/Container"
import Header from "src/components/Game/Header"
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react"
import Image from "next/image"
import NavButton from "src/components/Widget/NavButton"
import { ArrowLeftIcon } from "@heroicons/react/solid"

export const Item: React.FC<WalletAware> = (props: WalletAware) => {
  const { query } = useRouter()

  const [item, setItem] = useState<LegendaryLootItem>()
  const [isLoading, setIsLoading] = useState(false)
  const { connection } = useConnection()
  const wallet = useAnchorWallet()

  const [revealMessage, setRevealMessage] = useState<string>()

  const nftBridge = new LegendaryLootService(connection)

  const revealService = new RevealService()

  useEffect(() => {
    ;(async () => {
      if (item === undefined && !isLoading && wallet?.publicKey) {
        setIsLoading(true)

        await metaplexCache.metaplexMetadatas.delete(query.nftId as string)

        const itemFrom = await nftBridge.getItem(
          wallet?.publicKey,
          query.nftId as string
        )

        setItem(itemFrom)
        setIsLoading(false)
      }
    })()
  }, [item, wallet?.publicKey])

  const revealItem = async () => {
    if (!item) return

    setRevealMessage("Revealing item... please wait for a few seconds!")

    let revealStartResult

    try {
      revealStartResult = await revealService.launchReveal(
        item.getTokenMint(),
        "gear"
      )
    } catch (e) {
      setRevealMessage(
        "Unable to reveal item at this moment. Please contact us at #support for help!"
      )
      return
    }

    if (!revealStartResult) {
      setRevealMessage(
        "Unable to reveal item at this moment. Please contact us at #support for help!"
      )
      return
    }

    let revealComplete = await revealService.waitForJobCompletion(
      revealStartResult,
      "gear",
      100
    )

    if (revealComplete.success) {
      setRevealMessage("")
      setIsLoading(false)
      setItem(undefined)
      return
    }

    setRevealMessage(
      "Unable to reveal hero at this moment. Please contact us at #support for help!"
    )
  }

  return (
    <Container header={null}>
      <div className="container mb-8 mt-10">
        <div className="gap-2 mt-4 flex justify-start align-center">
          <NavButton link="/game">
            <ArrowLeftIcon className="h-5 w-5" />
            Back
          </NavButton>
        </div>
        <div className="w-full">
          <Loading isLoading={isLoading}>Loading your item...</Loading>
          <HideIfLoading isLoading={isLoading}>
            {item ? (
              <>
                {item.isRevealed() ? (
                  <div className="flex flex-col space-y-4 text-2xl p-2">
                    <div className="flex flex-col">
                      <div>
                        <h1 className="font-bold text-center text-3xl">
                          {item.getName()}
                        </h1>
                      </div>

                      <div className="flex flex-row justify-center">
                        <div className="relative grid inline-block w-1/2 max-h-full">
                          <div
                            className="absolute w-full h-full flex"
                            style={{ padding: "0% 0%" }}
                          >
                            <Image
                              src={item.getImage()}
                              className="h-auto max-h-full w-auto mx-auto my-auto pb-8 pt-8"
                              alt={`Hero #${item.getNftId()}`}
                              width={350}
                              height={350}
                              quality={90}
                            />
                          </div>

                          <Image
                            src={"/img/loadout-frame.png"}
                            className="place-self-start w-full"
                            alt=""
                            width={350}
                            height={350}
                          />
                        </div>
                        <div className="relative grid inline-block w-1/2 max-h-full">
                          <div
                            className="absolute w-full h-full place-items-center items-center"
                            style={{ padding: "10% 10%" }}
                          >
                            <p>
                              <strong>Item name: </strong> {item.getName()}
                            </p>
                            <p>
                              <strong>Loot Score: </strong>{" "}
                              {item.getLootScore()}
                            </p>
                            <p>
                              <strong>Rarity: </strong>{" "}
                              {LegendaryLootItemRarityName(item.getRarity())}
                            </p>
                            <p className="capitalize">
                              <strong>Slot: </strong> {item.getSlot()}
                            </p>
                            <p>
                              <strong>Gear set: </strong> {item.set.setName}
                            </p>
                            <p className="capitalize">
                              <strong>Element: </strong> {item.getElement()}
                            </p>
                            <p>
                              <strong>Mint address: </strong>
                            </p>
                            <p>
                              <span className="text-lg">
                                {item.getTokenMint().toString()}
                              </span>
                            </p>
                          </div>

                          <img
                            src={"/img/loadout-frame.png"}
                            className="place-self-start w-full"
                            alt={""}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex space-y-4 flex-col w-full text-center">
                    <div>
                      <h2>
                        Your item is not revealed! Click the button to reveal it
                        now!
                      </h2>
                    </div>
                    <div>
                      <InteractiveButton
                        disabled={revealMessage}
                        onClick={revealItem}
                      >
                        Reveal item!
                      </InteractiveButton>
                    </div>
                    <Loading isLoading={revealMessage}>{revealMessage}</Loading>
                  </div>
                )}
              </>
            ) : (
              <div>Invalid NFT</div>
            )}
          </HideIfLoading>
        </div>
      </div>
    </Container>
  )
}

export default Item
