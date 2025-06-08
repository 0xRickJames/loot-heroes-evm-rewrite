import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import io, { Socket } from "socket.io-client"
import customParser from "socket.io-msgpack-parser"
import PvpMatch from "src/components/Game/Pvp/Match"
import { Card } from "src/utils/interfaces"
import axios from "axios"
import { GameLayout } from "src/components/Game/GameLayout"

import { Connection, address } from "@solana/web3.js"
import { useRouter } from "next/router"

import { fromTxError } from "../../utils/errors"
import NavButton from "src/components/Widget/NavButton"

import { createUmi } from "@metaplex-foundation/umi-bundle-defaults"
import {
  CandyGuard,
  CandyMachine,
  DefaultGuardSetMintArgs,
  mplCandyMachine,
} from "@metaplex-foundation/mpl-candy-machine"
import {
  address as umiaddress,
  some,
  unwrapOption,
} from "@metaplex-foundation/umi"
import {
  fetchCandyMachine,
  fetchCandyGuard,
} from "@metaplex-foundation/mpl-candy-machine"
import { walletAdapterIdentity as umiWalletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters"
import { mintV2 } from "@metaplex-foundation/mpl-candy-machine"
import { setComputeUnitLimit } from "@metaplex-foundation/mpl-toolbox"
import { transactionBuilder, generateSigner } from "@metaplex-foundation/umi"
import { useWallet } from "@solana/wallet-adapter-react"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import Head from "next/head"
import { Metaplex, walletAdapterIdentity } from "@metaplex-foundation/js"
import production from "src/environments/production"

type MatchPlayer = {
  socketId: string
  // Cards that the player has in their hand
  deck: string[]
  // Initial cards that the player starts with, *only used for reference*
  deckInitialCards: Card[]
  // The players color and score
  color: string
  score: number
}
export type Match = {
  players: {
    [socketId: string]: MatchPlayer
  }
  playerOneaddress: string
  playerTwoaddress: string
  board: (BoardCard | null)[][]
  matchId: string
  turnNumber: number
  isRedFirst: boolean
}

export type BoardCard = {
  id: string
  color: string
  turnsBuffed: number[]
  isVoid?: boolean
  turnsOnBoard: number
}

// Sounds

let beginsSound
let archangelAttackSound
let assassinAttackSound
let bardAttackSound
let bowAttackSound
let demonHunterAttackSound
let justicarAttackSound
let magicAttackSound
let necromancerAttackSound
let pirateAttackSound
let swordAttackSound

if (typeof window !== "undefined") {
  beginsSound = new Audio("../../sounds/begins.wav")
  archangelAttackSound = new Audio("../../sounds/attack/Angel.wav")
  assassinAttackSound = new Audio("../../sounds/attack/Assassin.wav")
  bardAttackSound = new Audio("../../sounds/attack/Bard.wav")
  bowAttackSound = new Audio("../../sounds/attack/bow.wav")
  demonHunterAttackSound = new Audio("../../sounds/attack/DemonHunter.wav")
  justicarAttackSound = new Audio("../../sounds/attack/Justicar.wav")
  magicAttackSound = new Audio("../../sounds/attack/magic.wav")
  necromancerAttackSound = new Audio("../../sounds/attack/Necromancer.wav")
  pirateAttackSound = new Audio("../../sounds/attack/Pirate.wav")
  swordAttackSound = new Audio("../../sounds/attack/sword.wav")
}

// Use the RPC endpoint of your choice.
const umi = createUmi(production.solana.rpcHost).use(mplCandyMachine())

const candyMachineId = process.env.NEXT_PUBLIC_CANDY_MACHINE_ID

export default function TournamentPvpPage() {
  const router = useRouter()

  const handleReload = () => {
    router.reload()
  }
  const [hasTicket, setHasTicket] = useState(false)

  // Create a connection to the Solana network
  const connection = new Connection(
    "https://lively-ultra-lambo.solana-mainnet.quiknode.pro/72c8ec506f45d1f495fcfe29fe00c039a322a863/"
  )

  const [metaplex, setMetaplex] = useState<Metaplex | null>(null)

  const socket = useRef<Socket>()
  const [isFinding, setIsFinding] = useState(false)
  const [currentMatch, setCurrentMatch] = useState<Match>(null)

  const wallet = useWallet()
  const address: address = wallet?.address
  const addressString: string = wallet?.address?.toString()

  const [deckNames, setDeckNames] = useState<string[]>(["Default Deck"])
  const [deckName, setDeckName] = useState("Default Deck")
  const [connectedPlayersLength, setConnectedPlayersLength] = useState(null)
  const [previousTurnBoard, setPreviousTurnBoard] =
    useState<BoardCard[][]>(null)

  const handleDeckNameChange = (event: {
    target: { value: React.SetStateAction<string> }
  }) => {
    setDeckName(event.target.value)
  }

  const fetchDeckNames = async () => {
    await axios.get(`/api/decks?owner=${address}`).then((response) => {
      const allDecks = response.data.map((deck: { name: any }) => deck.name)
      setDeckNames([...allDecks, "Default Deck"])
    })
  }

  let beginsSound

  if (typeof window !== "undefined") {
    beginsSound = new Audio("../../sounds/begins.wav")
  }

  useEffect(() => {
    if (address) {
      fetchDeckNames()
    }
  }, [address])

  // Listen to state changes and re-attach the listener
  // So that we can have the `currentMatch` variable updated in the callback
  useEffect(() => {
    if (socket.current) {
      socket.current.removeListener("match")
      socket.current.on("match", (match: Match) => {
        // Save the previous board to run animations
        const previousBoard = currentMatch?.board
        if (previousBoard) {
          setPreviousTurnBoard(previousBoard)
        }

        setCurrentMatch(match)
        document.title = "PvP Match (" + match.matchId + ")"
      })
    }
  }, [socket.current, currentMatch])

  // connect to the socket on mount
  useEffect(() => {
    socket.current = io("http://localhost:3000/", {
      //socket.current = io("https://lootheroes-quadra-server.xyz:3000/", {
      parser: customParser,
      extraHeaders: {
        "ngrok-skip-browser-warning": "true",
      },
    })

    socket.current.on("playSound", (sound: string) => {
      switch (sound) {
        case "begins":
          if (typeof window !== "undefined") {
            beginsSound.play()
          }
          break
        case "archangel":
          if (typeof window !== "undefined") {
            archangelAttackSound.play()
          }
          break
        case "assassin":
          if (typeof window !== "undefined") {
            assassinAttackSound.play()
          }
          break
        case "bard":
          if (typeof window !== "undefined") {
            bardAttackSound.play()
          }
          break
        case "ranged":
          if (typeof window !== "undefined") {
            bowAttackSound.play()
          }
          break
        case "demonHunter":
          if (typeof window !== "undefined") {
            demonHunterAttackSound.play()
          }
          break
        case "justicar":
          if (typeof window !== "undefined") {
            justicarAttackSound.play()
          }
          break
        case "magic":
          if (typeof window !== "undefined") {
            magicAttackSound.play()
          }
          break
        case "necromancer":
          if (typeof window !== "undefined") {
            necromancerAttackSound.play()
          }
          break
        case "pirate":
          if (typeof window !== "undefined") {
            pirateAttackSound.play()
          }
          break
        case "melee":
          if (typeof window !== "undefined") {
            swordAttackSound.play()
          }
          break
        default:
          break
      }
    })

    socket.current.on(
      "connectedPlayersLength",
      (connectedPlayersLength: number) => {
        setConnectedPlayersLength(connectedPlayersLength)
      }
    )

    socket.current.on("matches", (matches: { [matchId: string]: Match }) => {
      console.log("all matches", matches)
    })

    socket.current.on("connect", () => {
      console.log("connected")
    })

    socket.current.on("findingMatch", () => {
      setIsFinding(true)
    })

    socket.current.on("matchFound", () => {
      console.log("match found")
      if (typeof window !== "undefined") {
        beginsSound.play()
      }
    })

    socket.current.on("opponentDisconnect", () => {
      alert("Your opponent disconnected")
      setIsFinding(false)
      setCurrentMatch(null)
      document.title = "Loot Heroes PvP"
    })

    socket.current.on("disconnect", () => {
      console.log("disconnected")

      // @TODO use the server state here to guarantee that the match is over
      setIsFinding(false)
      setCurrentMatch(null)
      document.title = "Loot Heroes PvP"
    })

    return () => {
      socket.current.close()
    }
  }, [])

  const [formMessage, setFormMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const [candyMachine, setCandyMachine] = useState<CandyMachine | null>(null)
  const [candyGuard, setCandyGuard] = useState<CandyGuard | null>(null)

  const fetchCandyMachineData = useCallback(async () => {
    if (!candyMachineId) throw new Error("candyMachineId not found")
    const candyMachineaddress = umiaddress(candyMachineId)
    const candyMachine = await fetchCandyMachine(umi, candyMachineaddress)
    const candyGuard = await fetchCandyGuard(umi, candyMachine.mintAuthority)

    setCandyMachine(candyMachine)
    setCandyGuard(candyGuard)
  }, [candyMachineId])

  // Fetch candy machine on mount
  useEffect(() => {
    fetchCandyMachineData()
  }, [fetchCandyMachineData])

  const solPaymentGuard = useMemo(() => {
    return candyGuard ? unwrapOption(candyGuard.guards.solPayment) : null
  }, [candyGuard])

  const cost = useMemo(
    () =>
      candyGuard
        ? solPaymentGuard
          ? Number(solPaymentGuard.lamports.basisPoints) / 1e9 + " SOL"
          : "Free mint"
        : "...",
    [candyGuard]
  )

  /**
   * Setup guards arguments and mint from the candy machine
   */
  const mint = async () => {
    if (!candyMachine) throw new Error("No candy machine")
    if (!candyGuard)
      throw new Error(
        "No candy guard found. Set up a guard for your candy machine."
      )

    setIsLoading(true)
    const { guards } = candyGuard

    const enabledGuardsKeys =
      guards && Object.keys(guards).filter((guardKey) => guards[guardKey])

    let mintArgs: Partial<DefaultGuardSetMintArgs> = {}

    // If there are enabled guards, set the mintArgs
    if (enabledGuardsKeys.length) {
      // Map enabled guards and set mintArgs automatically based on the fields defined in each guard
      enabledGuardsKeys.forEach((guardKey) => {
        const guardObject = unwrapOption(candyGuard.guards[guardKey])
        if (!guardObject) return null

        mintArgs = { ...mintArgs, [guardKey]: some(guardObject) }
      })
    }

    const umiWalletAdapter = umi.use(umiWalletAdapterIdentity(wallet))
    const nftMint = generateSigner(umiWalletAdapter)

    try {
      await transactionBuilder()
        .add(setComputeUnitLimit(umiWalletAdapter, { units: 800_000 }))
        .add(
          mintV2(umiWalletAdapter, {
            candyMachine: candyMachine.address,
            nftMint,
            collectionMint: candyMachine.collectionMint,
            collectionUpdateAuthority: candyMachine.authority,
            tokenStandard: candyMachine.tokenStandard,
            candyGuard: candyGuard?.address,
            mintArgs,
          })
        )
        .sendAndConfirm(umiWalletAdapter)

      setFormMessage("Minted successfully!")
    } catch (e: any) {
      const msg = fromTxError(e)

      if (msg) {
        setFormMessage(msg.message)
      } else {
        const msg = e.message || e.toString()
        setFormMessage(msg)
      }
    } finally {
      setIsLoading(false)

      setTimeout(() => {
        setFormMessage(null)
      }, 5000)
    }

    setIsLoading(false)
  }

  return (
    <>
      {!hasTicket ? (
        <main className="flex flex-col bg-mobile-wrapper lg:bg-match-wrapper bg-center bg-contain bg-no-repeat items-center px-12 pb-12 lg:p-24">
          <div className="flex self-end pt-10 lg:hidden md:pr-48">
            <NavButton link="/game">Back</NavButton>
          </div>
          <h1 className="text-2xl lg:text-5xl font-bold mt-16">
            You do not have a ticket!
          </h1>
          <h1 className="text-2xl lg:text-5xl font-bold mb-5">
            Please mint one below:
          </h1>
          <div className="flex lg:flex-row flex-col gap-2 lg:gap-8 items-start">
            <img
              className="self-center w-11/12 lg:max-w-sm rounded-lg"
              // src={collection?.json?.image}
            />

            <div className="flex flex-col w-11/12 lg:w-72 self-center p-4 px-3 rounded-xl bg-custom-purple">
              <div className="flex justify-between">
                <span>Public</span>
                <b>{cost}</b>
              </div>
              <div className="flex justify-between mb-4">
                <span className="text-xs">Live</span>
                {/* <span style={{ fontSize: "11px" }}>512/1024</span> */}
              </div>
              <button
                className="bg-button bg-center bg-contain bg-no-repeat h-12 w-48 self-center lg:h-20 text-black font-bold text-xl lg:text-3xl lg:p-6"
                disabled={!address || isLoading}
                onClick={mint}
              >
                {isLoading ? "Minting your NFT..." : "Mint Ticket"}
              </button>
              <WalletMultiButton
                style={{
                  width: "100%",
                  height: "auto",
                  marginTop: "8px",
                  padding: "8px 0",
                  justifyContent: "center",
                  fontSize: "13px",
                  backgroundColor: "#111",
                  lineHeight: "1.45",
                }}
              />
              <p className="text-center mt-1">{formMessage}</p>
            </div>
          </div>
        </main>
      ) : !currentMatch ? (
        <GameLayout
          backgroundImage="/img/pvp/bg-desktop.png"
          connectedPlayersLength={connectedPlayersLength}
        >
          <div className="matchmaking">
            {/* <h2 className="welcome-text ll-font-head text-2xl text-white">
              Welcome to Looterra
            </h2> */}

            <div className="matchmaking__content">
              <label className="m-2 font-bold">
                Select your deck: &nbsp;
                <select
                  className="text-black font-bold "
                  value={deckName}
                  onChange={handleDeckNameChange}
                >
                  {deckNames.map((option, index) => (
                    <option key={index} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              {!address ? (
                <WalletMultiButton
                  className="px-4 py-2 group bg-button inline-block group-hover:bg-opacity-75"
                  style={{ backgroundSize: "100% 100%" }}
                >
                  <span
                    className={`text-black group-hover:text-gray-700 font-semibold inline-flex items-center play-button`}
                  >
                    {!wallet
                      ? "Connect"
                      : addressString.slice(0, 4) +
                        ".." +
                        addressString.slice(-4)}
                  </span>
                </WalletMultiButton>
              ) : (
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    if (address !== wallet?.address) {
                      handleReload()
                    } else {
                      socket.current.emit("findMatch", {
                        address: addressString,
                        deckName: deckName,
                        matchType: "tournament",
                      })
                    }
                  }}
                  // href={props.button}
                  className={`px-4 py-2 group bg-button inline-block group-hover:bg-opacity-75`}
                  style={{ backgroundSize: "100% 100%" }}
                  disabled={isFinding || !!currentMatch}
                >
                  <span
                    className={`text-black group-hover:text-gray-700 font-semibold inline-flex items-center play-button`}
                  >
                    {isFinding ? "Finding Match..." : "Find Match"}
                  </span>
                </button>
              )}
            </div>
          </div>
        </GameLayout>
      ) : (
        <>
          <PvpMatch
            match={currentMatch}
            previousTurnBoard={previousTurnBoard}
            socket={socket.current}
            isRedFirst={currentMatch.isRedFirst}
          />{" "}
        </>
      )}

      <style jsx>
        {`
          .matchmaking {
            margin-top: auto;
            margin-bottom: 32px;
          }
          .welcome-text {
            align-self: center;
            margin-top: auto;
          }
          button:disabled {
            opacity: 0.7;
            cursor: not-allowed;
          }
          .matchmaking__content {
            margin-top: auto;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
          }

          .play-button {
            font-size: 22px;
            padding: 8px 16px;
          }

          img.background {
            max-width: 100%;
          }

          .background.desktop {
            display: none;
          }

          @media (min-width: 780px) {
            .matchmaking__content {
              margin-bottom: 32px;
            }
            .play-button {
              font-size: 28px;
              padding: 16px 24px;
            }
          }
        `}
      </style>
    </>
  )
}
