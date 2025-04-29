import { useCallback, useEffect, useRef, useState } from "react"
import io, { Socket } from "socket.io-client"
import customParser from "socket.io-msgpack-parser"
import { Card } from "src/utils/interfaces"
import { useAnchorWallet } from "@solana/wallet-adapter-react"
import axios from "axios"
import { Metaplex, keypairIdentity } from "@metaplex-foundation/js"
import { Connection, Keypair, PublicKey } from "@solana/web3.js"

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
  board: (BoardCard | null)[][]
  playerOnePublicKey: string
  playerTwoPublicKey: string
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
function capitalizeFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Custom React hook to manage the Dungeon game state
 * This hook is used by the main game component and it should cointain all the
 * logic related to the Dungeon game
 */
export default function useDungeonGame() {
  const socket = useRef<Socket>()
  const [currentMatch, setCurrentMatch] = useState<Match>(null)

  const wallet = useAnchorWallet()
  const publicKey: string = wallet?.publicKey?.toString()
  const [playerData, setPlayerData] = useState({
    playerName: "",
    playerPfp: "",
    energy: 0,
    highestDungeonLevel: 0,
  })
  const [deckNames, setDeckNames] = useState<string[]>(["Default Deck"])
  const [deckName, setDeckName] = useState("Default Deck")
  const [connectedPlayersLength, setConnectedPlayersLength] = useState(null)
  const [previousTurnBoard, setPreviousTurnBoard] =
    useState<BoardCard[][]>(null)

  const [playerName, setPlayerName] = useState(null)
  const [playerPfp, setPlayerPfp] = useState(null)
  const [opponentName, setOpponentName] = useState(null)
  const [opponentPfp, setOpponentPfp] = useState(null)

  const [winnerName, setWinnerName] = useState(null)
  const [winnerPfp, setWinnerPfp] = useState(null)
  const [loserName, setLoserName] = useState(null)
  const [loserPfp, setLoserPfp] = useState(null)
  const [matchDraw, setMatchDraw] = useState(false)

  const [isMatchFoundModalOpen, setIsMatchFoundModalOpen] = useState(false)
  const [isMatchOverModalOpen, setIsMatchOverModalOpen] = useState(false)
  const [isCoinFlipModalOpen, setIsCoinFlipModalOpen] = useState(false)

  const [currentDungeon, setCurrentDungeon] = useState(null)
  const [nextDungeon, setNextDungeon] = useState(null)
  const [energy, setEnergy] = useState(null)
  const [isRedFirst, setIsRedFirst] = useState(null)

  let beginsSound
  let coinFlipSound

  if (typeof window !== "undefined") {
    beginsSound = new Audio("../../sounds/begins.wav")
  }
  if (typeof window !== "undefined") {
    coinFlipSound = new Audio("../../sounds/flip_coin.wav")
  }

  const handleDeckNameChange = (event: {
    target: { value: React.SetStateAction<string> }
  }) => {
    setDeckName(event.target.value)
  }

  const fetchDeckNames = async () => {
    await axios.get(`/api/decks?owner=${publicKey}`).then((response) => {
      const allDecks = response.data.map((deck: { name: any }) => deck.name)
      setDeckNames([...allDecks, "Default Deck"])
    })
  }

  const fetchPlayerData = useCallback(async () => {
    if (publicKey) {
      try {
        const response = await fetch(
          `/api/profiles?publicKey=${publicKey.toString()}`
        )
        const data = await response.json()
        setPlayerData(data)
      } catch (error) {
        console.error("Error fetching player data:", error)
      }
    }
  }, [publicKey])

  useEffect(() => {
    if (publicKey) {
      fetchDeckNames()
    }
  }, [publicKey])

  useEffect(() => {
    fetchPlayerData()
  }, [fetchPlayerData])

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
        document.title = "Dungeon Match (" + match.matchId + ")"
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

    socket.current.on("outOfEnergy", () => {
      alert("You are out of energy!")
      setCurrentMatch(null)
      document.title = "Loot Heroes Dungeon"
    })

    socket.current.on(
      "dungeonMatchOver",
      (
        winnerName,
        playerName,
        playerPfp,
        matchDraw,
        currentDungeon,
        nextDungeon,
        energy
      ) => {
        setWinnerName(winnerName)
        setPlayerName(playerName)
        setPlayerPfp(playerPfp)
        setMatchDraw(matchDraw)
        setCurrentDungeon(currentDungeon)
        setNextDungeon(nextDungeon)
        setIsMatchOverModalOpen(true)
        setEnergy(energy)
      }
    )

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

    socket.current.on("startingDungeon", (isRedFirst) => {
      console.log("match starting")

      setTimeout(() => {
        setIsRedFirst(isRedFirst)
        setIsCoinFlipModalOpen(true)
        setTimeout(() => {
          setIsCoinFlipModalOpen(false)
        }, 3500)
        if (typeof window !== "undefined") {
          delay(500).then(() => {
            coinFlipSound.play()
          })
        }
      }, 5000)
    })

    socket.current.on(
      "dungeonMatchOver",
      (
        winnerName,
        playerName,
        playerPfp,
        matchDraw,
        currentDungeon,
        nextDungeon,
        energy
      ) => {
        setWinnerName(winnerName)
        setPlayerName(playerName)
        setPlayerPfp(playerPfp)
        setMatchDraw(matchDraw)
        setCurrentDungeon(currentDungeon)
        setNextDungeon(nextDungeon)
        setIsMatchOverModalOpen(true)
        setEnergy(energy)
      }
    )

    socket.current.on("opponentDisconnect", () => {
      alert("Your opponent disconnected")
      setCurrentMatch(null)
      document.title = "Loot Heroes Dungeon"
    })

    socket.current.on("disconnect", () => {
      console.log("disconnected")

      // @TODO use the server state here to guarantee that the match is over
      setCurrentMatch(null)
      document.title = "Loot Heroes Dungeon"
    })

    return () => {
      socket.current.close()
    }
  }, [])

  return {
    socket,
    currentMatch,
    setCurrentMatch,
    playerData,
    setPlayerData,
    deckNames,
    setDeckNames,
    deckName,
    setDeckName,
    connectedPlayersLength,
    setConnectedPlayersLength,
    previousTurnBoard,
    setPreviousTurnBoard,
    playerName,
    setPlayerName,
    playerPfp,
    setPlayerPfp,
    opponentName,
    setOpponentName,
    opponentPfp,
    setOpponentPfp,
    winnerName,
    setWinnerName,
    winnerPfp,
    setWinnerPfp,
    loserName,
    setLoserName,
    loserPfp,
    setLoserPfp,
    matchDraw,
    setMatchDraw,
    handleDeckNameChange,
    isMatchFoundModalOpen,
    setIsMatchFoundModalOpen,
    isMatchOverModalOpen,
    setIsMatchOverModalOpen,
  }
}
