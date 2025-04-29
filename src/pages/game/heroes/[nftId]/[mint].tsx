import React, { useEffect, useState } from "react"
import { LegendaryLootService } from "src/library/legendaryloot.service"

import Tippy from "@tippyjs/react"
import { followCursor } from "tippy.js"
import "tippy.js/animations/scale.css"

import environment from "src/environments/production"

import { Loading } from "src/components/Widget/Loading"
import { useRouter } from "next/router"
import {
  LegendaryLootHero,
  LegendaryLootItem,
  LegendaryLootItemSlot,
} from "src/library/legendaryloot.interface"
import useAsyncEffect from "use-async-effect"

import { HideIfLoading } from "src/components/Widget/HideIfLoading"

import { WalletAware } from "src/components/Game/Common"
import InteractiveButton from "src/components/Widget/InteractiveButton"
import {
  useAnchorWallet,
  useConnection,
  useWallet,
} from "@solana/wallet-adapter-react"
import { RevealService } from "src/library/reveal.service"
import { BurnGearTransaction, BurnService } from "src/library/burn.service"
import {
  PublicKey,
  sendAndConfirmTransaction,
  Transaction,
} from "@solana/web3.js"
import {
  WalletOperation,
  WalletOperationStep,
} from "src/components/Game/Widget/WalletOperation"
import { Errors, GenericError } from "src/library/errors"
import { ItemTooltip } from "src/components/Game/Widget/Tooltip"
import { ItemListGenericSelection } from "src/components/Game/Widget/ItemList"
import { BetaWhitelist } from "src/library/beta-whitelist"
import { Container } from "src/components/Container"
import Header from "src/components/Game/Header"
import { ItemsList } from "src/components/Game/ItemsList"
import {
  PROGRAM_ID,
  createInitializeHeroGearsInstruction,
} from "src/library/lootheroes/generated"
import { web3 } from "@project-serum/anchor"
import {
  Metaplex,
  bundlrStorage,
  keypairIdentity,
} from "@metaplex-foundation/js"
import { LegendaryLootItemSlotName } from "src/library/legendaryloot.interface"
import NavButton from "src/components/Widget/NavButton"
import { ArrowLeftIcon } from "@heroicons/react/solid"
import {
  TOKEN_PROGRAM_ID,
  createBurnInstruction,
  createCloseAccountInstruction,
} from "@solana/spl-token"

interface LoadoutElementProps {
  backgroundImage: string
  blankImage: string
  size: string
  slot: LegendaryLootItemSlot
  item?: LegendaryLootItem
  selection: LegendaryLootItem[]
}

function comingSoon() {
  alert("Apologies, Our Code Monkeys are working on this as we speak!")
}

export const LoadoutElement = (props: LoadoutElementProps) => {
  const selectedInSlot = props.selection?.find(
    (i) => i.getSlot() === props.slot
  )

  const elementToShow = selectedInSlot
    ? selectedInSlot
    : props.item
    ? props.item
    : undefined
  const isReplacement = selectedInSlot && props.item

  return (
    <>
      <Tippy
        content={elementToShow ? <ItemTooltip item={elementToShow} /> : <></>}
        disabled={!elementToShow}
        followCursor={true}
        plugins={[followCursor]}
        arrow={false}
        duration={[500, 0]}
        animation={"shift-away"}
      >
        <div className={`w-${props.size} mx-auto relative hover:opacity-90`}>
          {elementToShow ? (
            <div
              className={`absolute w-full h-full flex cursor-pointer`}
              style={{ padding: "12%" }}
            >
              <img
                src={elementToShow.getImage()}
                className={`max-h-full w-auto mx-auto my-auto ${
                  isReplacement ? "border-2 border-red-500" : ""
                }`}
                alt={""}
              />
            </div>
          ) : (
            ""
          )}
          <img
            className={"object-contain w-full mx-auto"}
            src={elementToShow ? props.blankImage : props.backgroundImage}
            alt={""}
          />
        </div>
      </Tippy>
    </>
  )
}

export const Hero: React.FC<WalletAware> = (props: WalletAware) => {
  const { query } = useRouter()

  const [loadout, setLoadout] = useState<LegendaryLootHero>()
  const [isLoading, setIsLoading] = useState(false)

  const selection = useState<LegendaryLootItem[]>([])
  const [lootScoreSelection, setLootScoreSelection] = useState<
    number | undefined
  >(undefined)
  const wallet = useAnchorWallet()
  const { connection } = useConnection()

  const nftBridge = new LegendaryLootService(connection)

  const burnService = new BurnService()

  const [revealMessage, setRevealMessage] = useState<string>()

  const revealService = new RevealService()

  const solanaWallet = useWallet()

  const [burningOperation, setBurningOperation] = useState<boolean>(false)
  const [burningSettleOperation, setBurningSettleOperation] =
    useState<boolean>(false)

  const betaWhitelist = new BetaWhitelist()

  const [pendingBurns, setPendingBurns] = useState<BurnGearTransaction[]>([])

  const [burnTxIds, setBurnTxIds] = useState<string[]>([])

  const burnGearSettleOperation = [
    {
      title: `Burn gear`,
      action: async () => {
        if (!solanaWallet.signMessage) {
          throw GenericError.new(Errors.IncompatibleWalletError).build()
        }

        let hero = loadout as LegendaryLootHero
        let result = await burnService.burnGear(
          burnTxIds,
          hero.getTokenMint(),
          solanaWallet.signMessage,
          solanaWallet.publicKey as PublicKey
        )

        if (!result.id) {
          throw GenericError.new(Errors.WalletOperationGenericError)
            .withParameter("txid", hero.getNftId())
            .withParameter("result", result)
            .withOwnerWallet(wallet.publicKey)
            .build()
        }

        let jobResult = await burnService.waitForJobCompletion(result.id, 60)

        if (!jobResult.success) {
          throw GenericError.new(
            Errors.WalletOperationGenericError
          ).withParameter("result", result)
        }
      },
      description:
        "Please confirm the message signature; we need this to verify the item you just burned corresponds to this hero!",
    },
  ] as WalletOperationStep[]

  const burnGearOperationSteps = [
    {
      title: `Burn gear`,
      action: async (_: any) => {
        try {
          if (!solanaWallet.signMessage) {
            throw GenericError.new(Errors.IncompatibleWalletError).build()
          }

          const selected = selection[0].map((item) => {
            return {
              ...item,
              id: item.getAttribute("itemID"),
              slotName: item.getSlot().toLowerCase(),
            }
          })

          console.log(selected)

          const gearEquipRawTx: { data: Buffer } = await (
            await fetch("/api/gears", {
              method: "POST",
              body: JSON.stringify({
                owner: wallet.publicKey.toString(),
                mint: loadout.getTokenMint().toString(),
                selected,
              }),
              headers: {
                "Content-Type": "application/json",
              },
            })
          ).json()

          console.log(gearEquipRawTx.data)

          const tx = Transaction.from(gearEquipRawTx.data)
          tx.feePayer = wallet.publicKey
          const signed = await solanaWallet.signTransaction(tx)

          const txId = await connection.sendRawTransaction(signed.serialize())

          console.log(txId)

          await connection.confirmTransaction(txId)

          return txId
        } catch (e) {
          console.log(e)
          throw e
        }
      },
      description:
        "In this step we will first burn your NFT into the void. WARNING! This step is irreversible, once the gear is burned, is gone for good and part of your hero! In addition, if there is an item burned into the slot already, it will be replaced by the new one!",
    },
  ]

  const burnGearWalletOperation = (
    <WalletOperation
      title={<p>Burning gear into your hero</p>}
      intro={<p>Please follow the steps to burn the gear into your hero.</p>}
      steps={burnGearOperationSteps}
      toggle={burningOperation}
      success={
        <p>
          Item burned in your hero successfully! You can now close this popup
        </p>
      }
      closeCallback={() => {
        setBurningOperation(false)
        selection[1]([])
        setLoadout(undefined)
      }}
    />
  )

  const burnGearSettleWalletOperation = (
    <WalletOperation
      title={<p>Retry a failed burn</p>}
      intro={
        <p>Please follow the steps to retry burning the items into your hero</p>
      }
      steps={burnGearSettleOperation}
      toggle={burningSettleOperation}
      success={
        <p>
          Item burned in your hero successfully! You can now close this popup
        </p>
      }
      closeCallback={() => {
        setBurningSettleOperation(false)
        selection[1]([])
        setLoadout(undefined)
      }}
    />
  )

  useAsyncEffect(async () => {
    if (wallet?.publicKey) {
      if (loadout !== undefined || isLoading) return
      setIsLoading(true)

      const loadoutFrom = await nftBridge.getLoadout(
        wallet.publicKey,
        query.nftId as string,
        query.mint as string
      )

      console.log(loadoutFrom.loot)

      // if (loadoutFrom) {
      //   const pendingBurns = await burnService.pendingBurns(
      //     wallet.publicKey,
      //     loadoutFrom.getTokenMint()
      //   )
      //   setPendingBurns(pendingBurns)
      // }

      setLoadout(loadoutFrom)
      setIsLoading(false)
    }
  }, [loadout, wallet])

  const revealHero = async () => {
    if (!loadout) return

    setRevealMessage("Revealing hero... please wait for a few seconds!")

    let revealStartResult

    try {
      revealStartResult = await revealService.launchReveal(
        loadout.getTokenMint(),
        "hero"
      )
    } catch (e) {
      setRevealMessage(
        "Unable to reveal hero at this moment. Please contact us at #support for help!"
      )
      return
    }

    if (!revealStartResult) {
      setRevealMessage(
        "Unable to reveal hero at this moment. Please contact us at #support for help!"
      )
      return
    }

    let revealComplete = await revealService.waitForJobCompletion(
      revealStartResult,
      "hero",
      100
    )

    if (revealComplete.success) {
      setLoadout(undefined)
      return
    }

    setRevealMessage(
      "Unable to reveal hero at this moment. Please contact us at #support for help!"
    )
  }

  useAsyncEffect(async () => {
    if (selection[0].length == 0 || !loadout) {
      setLootScoreSelection(undefined)
      return
    }

    let currentLootScore = loadout.getLootScore()
    let selectionLootScore = loadout.getHeroLootScore()

    selection[0].forEach((i) => {
      selectionLootScore += i.getLootScore()
    })

    loadout.loot.forEach((item, slot) => {
      let selectionItem = selection[0].find((s) => s.getSlot() === slot)

      if (!selectionItem) {
        selectionLootScore += item.getLootScore()
      }
    })

    setLootScoreSelection(
      selectionLootScore - (currentLootScore ? currentLootScore : 0)
    )
  }, [selection[0]])

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
          {!wallet?.publicKey ? (
            "Please, connect your wallet first."
          ) : (
            <>
              <Loading isLoading={isLoading}>Loading your hero...</Loading>
              <HideIfLoading isLoading={isLoading}>
                {loadout ? (
                  <>
                    {loadout.isRevealed() ? (
                      <div className="flex flex-col space-y-4 text-2xl p-2">
                        <div className="flex flex-col">
                          <div>
                            <h1 className="font-bold text-center text-3xl">
                              Hero #{loadout.getNftId()}{" "}
                              {loadout.isStaked() ? <>(Staked)</> : <></>}
                            </h1>
                          </div>

                          <div className="flex flex-row justify-center">
                            <div className="relative grid inline-block w-1/3 max-h-full">
                              <div
                                className="absolute w-full h-full place-items-center items-center"
                                style={{ padding: "0% 0%" }}
                              >
                                <img
                                  src={loadout.getHeroClassImage()}
                                  className="h-full mx-auto pb-8 pt-8"
                                  alt={""}
                                />
                              </div>

                              <img
                                src={"/img/loadout-frame.png"}
                                className="place-self-start w-full"
                                alt={""}
                              />
                            </div>
                            <div
                              className="relative grid inline-block w-1/3 max-h-full"
                              id="loadoutimage"
                            >
                              <div
                                className="absolute grid grid-cols-3 gap-4 w-full h-full place-items-center items-center"
                                style={{ padding: "5% 5%" }}
                              >
                                <div className="text-right">
                                  <LoadoutElement
                                    size="4/5"
                                    backgroundImage={
                                      "/img/emptyslot_shoulder.png"
                                    }
                                    blankImage={"/img/frame_shoulder_blank.png"}
                                    item={loadout.getItemInSlot(
                                      LegendaryLootItemSlot.Shoulder
                                    )}
                                    slot={LegendaryLootItemSlot.Shoulder}
                                    selection={selection[0]}
                                  />
                                  <LoadoutElement
                                    size="full"
                                    backgroundImage={"/img/emptyslot_sword.png"}
                                    blankImage={"/img/frame_weapon_blank.png"}
                                    item={loadout.getItemInSlot(
                                      LegendaryLootItemSlot.Weapon
                                    )}
                                    slot={LegendaryLootItemSlot.Weapon}
                                    selection={selection[0]}
                                  />
                                </div>
                                <div>
                                  <LoadoutElement
                                    size="4/5"
                                    backgroundImage={"/img/emptyslot_helm.png"}
                                    blankImage={"/img/frame_helmet_blank.png"}
                                    item={loadout.getItemInSlot(
                                      LegendaryLootItemSlot.Helm
                                    )}
                                    slot={LegendaryLootItemSlot.Helm}
                                    selection={selection[0]}
                                  />
                                  <LoadoutElement
                                    size="full"
                                    backgroundImage={"/img/emptyslot_armor.png"}
                                    blankImage={"/img/frame_chest_blank.png"}
                                    item={loadout.getItemInSlot(
                                      LegendaryLootItemSlot.Chest
                                    )}
                                    slot={LegendaryLootItemSlot.Chest}
                                    selection={selection[0]}
                                  />
                                  <LoadoutElement
                                    size="full"
                                    backgroundImage={"/img/emptyslot_legs.png"}
                                    blankImage={"/img/frame_boots_blank.png"}
                                    item={loadout.getItemInSlot(
                                      LegendaryLootItemSlot.Legs
                                    )}
                                    slot={LegendaryLootItemSlot.Legs}
                                    selection={selection[0]}
                                  />
                                </div>
                                <div>
                                  <LoadoutElement
                                    size="4/5"
                                    backgroundImage={
                                      "/img/emptyslot_amulet.png"
                                    }
                                    blankImage={"/img/frame_amulet_blank.png"}
                                    item={loadout.getItemInSlot(
                                      LegendaryLootItemSlot.Neck
                                    )}
                                    slot={LegendaryLootItemSlot.Neck}
                                    selection={selection[0]}
                                  />
                                  <LoadoutElement
                                    size="full"
                                    backgroundImage={"/img/emptyslot_arm.png"}
                                    blankImage={"/img/frame_arm_blank.png"}
                                    item={loadout.getItemInSlot(
                                      LegendaryLootItemSlot.Hands
                                    )}
                                    slot={LegendaryLootItemSlot.Hands}
                                    selection={selection[0]}
                                  />
                                  <LoadoutElement
                                    size="4/5"
                                    backgroundImage={"/img/emptyslot_ring.png"}
                                    blankImage={"/img/frame_ring_blank.png"}
                                    item={loadout.getItemInSlot(
                                      LegendaryLootItemSlot.Ring
                                    )}
                                    slot={LegendaryLootItemSlot.Ring}
                                    selection={selection[0]}
                                  />
                                </div>
                              </div>
                              <img
                                src={"/img/loadout-frame.png"}
                                className="place-self-start w-full"
                                alt={""}
                              />
                            </div>
                            <div className="relative grid inline-block w-1/3 max-h-full">
                              <div
                                className="absolute w-full h-full place-items-center items-center md:text-xl text-xs"
                                style={{ padding: "10% 10%" }}
                              >
                                <div>
                                  <p>
                                    <strong>Hero ID: </strong>{" "}
                                    {loadout.getNftId()}
                                  </p>
                                  <p>
                                    <strong>Loot Score: </strong>
                                    {loadout.getLootScore()}{" "}
                                    {lootScoreSelection !== undefined ? (
                                      lootScoreSelection == 0 ? (
                                        <span className={"text-green-500"}>
                                          <strong>=</strong>
                                        </span>
                                      ) : lootScoreSelection > 0 ? (
                                        <span className={"text-green-500"}>
                                          <strong>+{lootScoreSelection}</strong>
                                        </span>
                                      ) : (
                                        <span className={"text-red-500"}>
                                          <strong>-{lootScoreSelection}</strong>
                                        </span>
                                      )
                                    ) : (
                                      <></>
                                    )}
                                  </p>
                                  <p>
                                    <strong>Class: </strong>{" "}
                                    {loadout.getHeroClassName()}
                                  </p>
                                  <p>
                                    <strong>Title: </strong>{" "}
                                    {loadout.getRarity()}
                                  </p>
                                  <p>
                                    <strong>Star rating: </strong>{" "}
                                    {loadout.getStarRating()}
                                  </p>
                                  <p>
                                    <strong>Attack type: </strong>{" "}
                                    {loadout.getHeroAttackType()}
                                  </p>
                                  <p>
                                    <strong>Mint address: </strong>{" "}
                                    <span className="text-xs md:text-sm">
                                      {`${loadout
                                        .getTokenMint()
                                        .toString()
                                        .slice(0, 15)}...`}
                                    </span>
                                  </p>
                                  <div className="mx-auto text-center md:mt-10">
                                    {selection[0].length > 0 ? (
                                      <>
                                        <InteractiveButton
                                          onClick={() => {
                                            setBurningOperation(true)
                                          }}
                                        >
                                          Burn {selection[0].length} items into
                                          your hero!
                                        </InteractiveButton>
                                      </>
                                    ) : (
                                      <>
                                        Select items below to burn into your
                                        hero!
                                      </>
                                    )}
                                  </div>
                                </div>
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
                        {environment.heroReveal ? (
                          <>
                            <p>
                              <h2>
                                Your hero is not revealed! Click the button to
                                reveal it now!
                              </h2>
                            </p>
                            <p>
                              <InteractiveButton
                                disabled={revealMessage}
                                onClick={revealHero}
                              >
                                Reveal hero!
                              </InteractiveButton>
                            </p>
                            <Loading isLoading={revealMessage}>
                              {revealMessage}
                            </Loading>
                          </>
                        ) : (
                          <>
                            <p>
                              <h2>
                                Your hero is not revealed! Please stay tuned on
                                our Discord to find out when heroes are gonna be
                                revealed!
                              </h2>
                            </p>
                          </>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <div>Invalid NFT</div>
                )}
              </HideIfLoading>

              {loadout?.isRevealed() ? (
                <>
                  {pendingBurns.length > 0 ? (
                    <div className="flex flex-col space-y-4 mx-4">
                      {pendingBurns.map((burn) => {
                        return (
                          <div className="bg-yellow-400 border-yellow-800 border-4 w-full p-8 text-red-900 font-semibold rounded-lg shadow-lg flex flex-col">
                            <span className="text-2xl">
                              We detected a pending burn message for{" "}
                              {burn.items.length} items.{" "}
                              <button
                                onClick={() => {
                                  setBurnTxIds([burn.txId])
                                  setBurningSettleOperation(true)
                                }}
                              >
                                <u>Click here to retry again</u>
                              </button>
                            </span>
                            <span className="text-sm font-thin">
                              Intent ID: {burn.intentId}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <></>
                  )}
                  <ItemsList
                    listComponent={ItemListGenericSelection}
                    listChildren={selection}
                  />
                </>
              ) : (
                <></>
              )}

              {burnGearWalletOperation}
              {burnGearSettleWalletOperation}
            </>
          )}
        </div>
      </div>
    </Container>
  )
}

export default Hero
