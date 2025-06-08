import { useCallback, useEffect, useRef, useState } from "react"
import io, { Socket } from "socket.io-client"
import customParser from "socket.io-msgpack-parser"
import { Card } from "src/utils/interfaces"
import axios from "axios"
import { useContext } from "react"
import { EvmWalletContext } from "src/contexts/EvmWalletContext"

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
  playerOneaddress: string
  playerTwoaddress: string
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

/**
 * Custom React hook to manage the PvP game state
 * This hook is used by the main game component and it should cointain all the
 * logic related to the PvP game
 */
export default function usePvpGame() {
  const socket = useRef<Socket>()
  const [isFinding, setIsFinding] = useState(false)
  const [currentMatch, setCurrentMatch] = useState<Match>(null)

  const wallet = useContext(EvmWalletContext)
  const address: string = wallet?.address?.toString()
  const [playerData, setPlayerData] = useState({
    playerName: "",
    playerPfp: "",
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

  const updateLastUsedDeck = async (address: string, lastUsedDeck: string) => {
    try {
      const response = await axios.put(
        `/api/last-used-deck?address=${address}&lastUsedDeck=${lastUsedDeck}`
      )
    } catch (error) {
      console.error(error) // Handle any errors that occur during the API call
    }
  }

  const handleDeckNameChange = (event: {
    target: { value: React.SetStateAction<string> }
  }) => {
    setDeckName(event.target.value)
    if (address) {
      updateLastUsedDeck(address, event.target.value.toString())
    }
  }

  const fetchDeckNames = async () => {
    await axios.get(`/api/decks?owner=${address}`).then((response) => {
      const allDecks = response.data.map((deck: { name: any }) => deck.name)
      setDeckNames([...allDecks, "Default Deck"])
    })
  }

  const fetchPlayerData = useCallback(async () => {
    if (address) {
      try {
        const response = await fetch(
          `/api/profiles?address=${address.toString()}`
        )
        const data = await response.json()
        setPlayerData(data)
        setPlayerName(data.playerName)
        setPlayerPfp(data.playerPfp)
        setDeckName(data.lastUsedDeck)
      } catch (error) {
        console.error("Error fetching player data:", error)
      }
    }
  }, [address])

  useEffect(() => {
    if (address) {
      fetchDeckNames()
    }
  }, [address])

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

    socket.current.on(
      "matchFound",
      (
        playerOneName: string,
        playerOnePfp: string,
        playerTwoName: string,
        playerTwoPfp: string
      ) => {
        console.log("match found")
        console.log(playerOneName, playerTwoName)
        setPlayerName(playerOneName)
        setPlayerPfp(playerOnePfp)
        setOpponentName(playerTwoName)
        setOpponentPfp(playerTwoPfp)

        setIsMatchFoundModalOpen(true)
        setTimeout(() => {
          setIsMatchFoundModalOpen(false)
        }, 5000)

        if (typeof window !== "undefined") {
          beginsSound.play()
        }
      }
    )

    socket.current.on(
      "matchOver",
      (winnerName, winnerPfp, loserName, loserPfp, matchDraw) => {
        setWinnerName(winnerName)
        setWinnerPfp(winnerPfp)
        setLoserName(loserName)
        setLoserPfp(loserPfp)
        setMatchDraw(matchDraw)
        console.log(winnerName)
        console.log(playerName)
        setIsMatchOverModalOpen(true)
      }
    )

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

  return {
    socket,
    isFinding,
    setIsFinding,
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
