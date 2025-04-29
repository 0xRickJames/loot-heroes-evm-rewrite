import { useCallback, useEffect, useRef, useState } from "react"
import io, { Socket } from "socket.io-client"
import customParser from "socket.io-msgpack-parser"
import PvpMatch from "src/components/Game/Pvp/Match"
import { Card } from "src/utils/interfaces"
import { useAnchorWallet } from "@solana/wallet-adapter-react"
import axios from "axios"
import { Metaplex, keypairIdentity } from "@metaplex-foundation/js"
import NavButton from "src/components/Widget/NavButton"
import { ArrowLeftIcon } from "@heroicons/react/solid"
import Modal from "react-modal"
import DungeonMatchOverModal from "src/components/Game/DungeonMatchOverModal"
import DungeonMatchFoundModal from "src/components/Game/DungeonMatchFoundModal"
import Image from "next/image"
import { set } from "@project-serum/anchor/dist/cjs/utils/features"
import CoinFlipModal from "src/components/Game/CoinFlipModal"
import sounds from "../../utils/sounds"

// Element icons
const lightElement = "/img/game/light.png"
const darkElement = "/img/game/dark.png"
const lightningElement = "/img/game/lightning.png"
const fireElement = "/img/game/fire.png"
const waterElement = "/img/game/water.png"
const iceElement = "/img/game/ice.png"
const windElement = "/img/game/wind.png"
const earthElement = "/img/game/earth.png"
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
  playerOnePublicKey: string
  playerTwoPublicKey: string
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

// Function to determine the status icon
function getStatusIcon(dungeonElement, level, highestLevel, highestDarkLevel) {
  let currentHighestLevel =
    dungeonElement === "dark" ? highestDarkLevel : highestLevel

  if (level > currentHighestLevel + 1) {
    return "🔒 " // Level is locked
  } else if (level === currentHighestLevel + 1) {
    return "" // Level is next to be unlocked
  } else {
    return "✅ " // Level is unlocked
  }
}

function capitalizeFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export default function DungeonPage() {
  function startingDungeon() {
    setIsDungeonMatchFoundModalOpen(true)
    setTimeout(() => {
      setIsDungeonMatchFoundModalOpen(false)
    }, 6000)
    if (typeof window !== "undefined") {
      sounds.playBegins()
    }
  }

  // Dungeon selection state variables
  const [dungeonElement, setDungeonElement] = useState("fire")
  const [dungeonLevel, setDungeonLevel] = useState(0)
  const [hasDungeonTicket, setHasDungeonTicket] = useState(false)
  // Dungeon Modal state variables
  const [isDungeonModalOpen, setIsDungeonModalOpen] = useState(false)
  const openDungeonModal = () => {
    setIsDungeonModalOpen(true)
  }
  const closeDungeonModal = () => {
    setIsDungeonModalOpen(false)
  }
  const dungeonModalStyles = {
    content: {
      maxWidth: "80%",
      maxHeight: "90%",
      top: "0",
      left: "0",
      right: "0",
      bottom: "0",
      margin: "auto",
      backgroundImage: `url('/img/Wooden_UI/mobile_bg.png')`,
      backgroundSize: "100% 100%",
      backgroundRepeat: "no-repeat",
      backgroundColor: "transparent",
      border: "none",
      color: "black",
    },
    overlay: {
      backgroundColor: "rgba(0, 0, 0, 0.75)",
    },
  }
  // Dungeon Match Modal state variables
  const [isDungeonMatchOverModalOpen, setIsDungeonMatchOverModalOpen] =
    useState(false)
  const [isDungeonMatchFoundModalOpen, setIsDungeonMatchFoundModalOpen] =
    useState(false)
  const [isCoinFlipModalOpen, setIsCoinFlipModalOpen] = useState(false)

  const socket = useRef<Socket>()
  const [isFinding, setIsFinding] = useState(false)
  const [currentMatch, setCurrentMatch] = useState<Match>(null)
  const [openDungeon, setOpenDungeon] = useState(null)
  const [highestLevel, setHighestLevel] = useState(null)
  const [highestDarkLevel, setHighestDarkLevel] = useState(null)
  const [energy, setEnergy] = useState(1)
  const [isRedFirst, setIsRedFirst] = useState(null)

  const [gwenRewards, setGwenRewards] = useState(null)
  const [renownRewards, setRenownRewards] = useState(null)

  const [connection, setConnection] = useState(null)

  const [gwen, setGwen] = useState(0)

  const [soundsEnabled, setSoundsEnabled] = useState(false)
  const handleToggleSounds = () => {
    sounds.toggleSounds()

    sounds.buttonClick()
    const storedValue = localStorage.getItem("soundsEnabled")
    setSoundsEnabled(storedValue === "true")
  }

  const wallet = useAnchorWallet()
  const publicKey: string = wallet?.publicKey?.toString()
  const [playerData, setPlayerData] = useState({
    playerName: "",
    playerPfp: "",
  })

  const [deckNames, setDeckNames] = useState<string[]>(["Default Deck"])
  const [deckName, setDeckName] = useState("Default Deck")
  const [connectedPlayersLength, setConnectedPlayersLength] = useState(null)
  const [previousTurnBoard, setPreviousTurnBoard] =
    useState<BoardCard[][]>(null)

  const updateLastUsedDeck = async (
    publicKey: string,
    lastUsedDeck: string
  ) => {
    try {
      const encodedPublicKey = encodeURIComponent(publicKey)
      const encodedLastUsedDeck = encodeURIComponent(lastUsedDeck)
      const response = await axios.put(
        `/api/last-used-deck?publicKey=${encodedPublicKey}&lastUsedDeck=${encodedLastUsedDeck}`
      )
      // ... rest of your logic
    } catch (error) {
      console.error(error) // Handle any errors that occur during the API call
    }
  }

  const handleDeckNameChange = (event: {
    target: { value: React.SetStateAction<string> }
  }) => {
    setDeckName(event.target.value.toString())
    if (publicKey) {
      updateLastUsedDeck(publicKey, event.target.value.toString())
    }
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
        setPlayerName(data.playerName)
        setPlayerPfp(data.playerPfp)
        setDeckName(data.lastUsedDeck)
        setHighestLevel(data.highestDungeonLevel)
        setHighestDarkLevel(data.highestDarkDungeonLevel)
        setEnergy(data.energy)
      } catch (error) {
        console.error("Error fetching player data:", error)
      }
    }
  }, [publicKey])
  useEffect(() => {
    const storedValue = localStorage.getItem("soundsEnabled")
    setSoundsEnabled(storedValue === "true")
  }, [])

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

    socket.current.emit("sendOpenDungeon", {})

    socket.current.on("outOfEnergy", () => {
      alert("You are out of energy!")
      setIsFinding(false)
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
        energy,
        gwenRewards,
        renownRewards,
        hasDungeonTicket
      ) => {
        if (matchDraw) {
          sounds.playDrawSong()
        } else if (winnerName === playerName) {
          sounds.playVictorySong()
        } else {
          sounds.playDefeatSong()
        }
        setWinnerName(winnerName)
        setPlayerName(playerName)
        setPlayerPfp(playerPfp)
        setMatchDraw(matchDraw)
        setCurrentDungeon(currentDungeon)
        setNextDungeon(nextDungeon)
        setIsDungeonMatchOverModalOpen(true)
        setEnergy(energy)
        setIsRedFirst(null)
        setGwenRewards(gwenRewards)
        setRenownRewards(renownRewards)
        setHasDungeonTicket(hasDungeonTicket)
      }
    )

    socket.current.on("connect", () => {
      console.log("connected")
    })

    socket.current.on("playSound", (sound: string) => {
      switch (sound) {
        case "begins":
          if (typeof window !== "undefined") {
            sounds.playBegins()
          }
          break
        case "archangel":
          if (typeof window !== "undefined") {
            sounds.playArchangel()
          }
          break
        case "assassin":
          if (typeof window !== "undefined") {
            sounds.playAssassin()
          }
          break
        case "bard":
          if (typeof window !== "undefined") {
            sounds.playBard()
          }
          break
        case "ranged":
          if (typeof window !== "undefined") {
            sounds.playRanged()
          }
          break
        case "demonHunter":
          if (typeof window !== "undefined") {
            sounds.playDemonHunter()
          }
          break
        case "justicar":
          if (typeof window !== "undefined") {
            sounds.playJusticar()
          }
          break
        case "magic":
          if (typeof window !== "undefined") {
            sounds.playMagic()
          }
          break
        case "necromancer":
          if (typeof window !== "undefined") {
            sounds.playNecromancer()
          }
          break
        case "pirate":
          if (typeof window !== "undefined") {
            sounds.playPirate()
          }
          break
        case "melee":
          if (typeof window !== "undefined") {
            sounds.playMelee()
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
    /*
    socket.current.on("matches", (matches: { [matchId: string]: Match }) => {
      console.log("all matches", matches)
    })
*/
    socket.current.on("openDungeon", (openDungeon) => {
      console.log(`Open Dungeon: ${openDungeon}`)
      setOpenDungeon(openDungeon)
    })

    socket.current.on("findingMatch", () => {
      setIsFinding(true)
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
            sounds.playCoinFlip()
          })
        }
      }, 5000)
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
      document.title = "Loot Heroes Dungeon"
    })

    return () => {
      socket.current.close()
    }
  }, [])

  const [playerName, setPlayerName] = useState(null)
  const [playerPfp, setPlayerPfp] = useState(null)
  const [dungeonName, setDungeonName] = useState("none0")
  const [dungeonPfp, setDungeonPfp] = useState(null)

  const [winnerName, setWinnerName] = useState(null)
  const [matchDraw, setMatchDraw] = useState(false)
  const [currentDungeon, setCurrentDungeon] = useState(null)
  const [nextDungeon, setNextDungeon] = useState(null)

  return (
    <>
      {!currentMatch ? (
        <div className="h-screen w-screen flex flex-col font-carta justify-center items-center">
          <div className="flex justify-center  text-6xl md:text-7xl lg:text-8xl xl:text-9xl">
            <h1>Dungeons</h1>
          </div>
          <div className="flex top-button">
            <div className="m-6 justify-center items-center text-center  hidden md:flex">
              <NavButton
                onMouseOver={() => {
                  sounds.highlightButton()
                }}
                onClick={() => {
                  sounds.backButton()
                }}
                className=""
                link="/game"
              >
                <ArrowLeftIcon className="h-5 w-5" />
                Back
              </NavButton>
              <button
                onMouseOver={sounds.highlightButton}
                onClick={() => {
                  handleToggleSounds()
                }}
              >
                <Image
                  className={`h-14 w-14 mx-3`}
                  src={`/img/Wooden_UI/${
                    soundsEnabled ? "volume" : "mute"
                  }.png`}
                  width={225}
                  height={225}
                  alt="Sound"
                />
              </button>
              <label className="font-bold flex flex-col md:text-2xl">
                Select your deck: &nbsp;
                <select
                  onClick={() => {
                    sounds.highlightButton()
                  }}
                  className="text-black font-bold -pt-2"
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
            </div>
            <p className="flex self-center text-center mr-2 border rounded px-2 text-xl lg:text-3xl p-1 lg:p-2">{`${gwen} $GWEN 💰`}</p>
            <p className="flex self-center text-center ml-2 border rounded px-2 text-xl lg:text-3xl p-1 lg:p-2">{`${energy} Energy ⚡`}</p>
          </div>
          <div className="map-selector">
            <div className="bg-map-loadout md:bg-hero h-55vh w-95vw lg:h-95vw xl:w-85vw bg-contain lg:bg-cover bg-center bg-no-repeat justify-center flex   overflow-auto">
              <div className="flex flex-col justify-evenly">
                <div className="flex gap-4 md:gap-40 lg:gap-64 xl:gap-76 md:-mb-6 md:mt-8 lg:mt-12 xl:mt-20 xl:-mb-12">
                  <button
                    onMouseOver={() => {
                      if (openDungeon === "Fire") {
                        sounds.highlightButton()
                      }
                    }}
                    className={`relative ${
                      openDungeon === "Fire"
                        ? "transform hover:scale-125"
                        : "hover:opacity-80"
                    }`}
                    onClick={(e) => {
                      e.preventDefault()
                      if (openDungeon === "Fire") {
                        sounds.buttonClick()
                        setDungeonElement("fire")
                        setDungeonPfp(`/img/game/fire.png`)
                        setIsDungeonModalOpen(true)
                      } else {
                        sounds.closedDungeonClick()
                        alert("This dungeon is locked!")
                      }
                    }}
                  >
                    <Image
                      className={`h-28 w-28 mt-5 xl:mt-8 ${
                        openDungeon === "Fire" ? "" : "opacity-60"
                      }`}
                      src="/img/game/fire.png"
                      width={225}
                      height={225}
                      alt="Fire"
                    />
                    {openDungeon !== "Fire" && (
                      <span className="absolute inset-0 flex items-center justify-center text-4xl mt-5 xl:mt-8">
                        🔒
                      </span>
                    )}
                  </button>
                  <button
                    onMouseOver={() => {
                      if (openDungeon === "Ice") {
                        sounds.highlightButton()
                      }
                    }}
                    className={`relative ${
                      openDungeon === "Ice"
                        ? "transform hover:scale-125"
                        : "hover:opacity-80"
                    }`}
                    onClick={(e) => {
                      e.preventDefault()
                      if (openDungeon === "Ice") {
                        sounds.buttonClick()
                        setDungeonElement("ice")
                        setDungeonPfp(`/img/game/ice.png`)
                        setIsDungeonModalOpen(true)
                      } else {
                        sounds.closedDungeonClick()
                        alert("This dungeon is locked!")
                      }
                    }}
                  >
                    <Image
                      className={`h-28 w-28 lg:-mt-6 xl:-mt-10 ${
                        openDungeon === "Ice" ? "" : "opacity-60"
                      }`}
                      src="/img/game/ice.png"
                      width={225}
                      height={225}
                      alt="Ice"
                    />
                    {openDungeon !== "Ice" && (
                      <span className="absolute inset-0 flex items-center justify-center text-4xl lg:-mt-6 xl:-mt-10">
                        🔒
                      </span>
                    )}
                  </button>
                  <button
                    onMouseOver={() => {
                      if (openDungeon === "Wind") {
                        sounds.highlightButton()
                      }
                    }}
                    className={`relative ${
                      openDungeon === "Wind"
                        ? "transform hover:scale-125"
                        : "hover:opacity-80"
                    }`}
                    onClick={(e) => {
                      e.preventDefault()
                      if (openDungeon === "Wind") {
                        sounds.buttonClick()
                        setDungeonElement("wind")
                        setDungeonPfp(`/img/game/wind.png`)
                        setIsDungeonModalOpen(true)
                      } else {
                        sounds.closedDungeonClick()
                        alert("This dungeon is locked!")
                      }
                    }}
                  >
                    <Image
                      className={`h-28 w-28  mt-5 xl:mt-8 ${
                        openDungeon === "Wind" ? "" : "opacity-60"
                      }`}
                      src="/img/game/wind.png"
                      width={225}
                      height={225}
                      alt="Wind"
                    />
                    {openDungeon !== "Wind" && (
                      <span className="absolute inset-0 flex items-center justify-center text-4xl mt-5 xl:mt-8">
                        🔒
                      </span>
                    )}
                  </button>
                </div>
                <div className="flex justify-evenly">
                  <button
                    onMouseOver={() => {
                      if (openDungeon === "LightDark") {
                        sounds.highlightButton()
                      }
                    }}
                    className={`relative ${
                      openDungeon === "LightDark"
                        ? "transform hover:scale-125"
                        : "hover:opacity-80"
                    }`}
                    onClick={(e) => {
                      e.preventDefault()
                      if (openDungeon === "LightDark") {
                        sounds.buttonClick()
                        setDungeonElement("light")
                        setDungeonPfp(`/img/game/light.png`)
                        setIsDungeonModalOpen(true)
                      } else {
                        sounds.closedDungeonClick()
                        alert("This dungeon is locked!")
                      }
                    }}
                  >
                    <Image
                      className={`h-28 w-28 ${
                        openDungeon === "LightDark" ? "" : "opacity-60"
                      }`}
                      src="/img/game/light.png"
                      width={225}
                      height={225}
                      alt="Light"
                    />
                    {openDungeon !== "LightDark" && (
                      <span className="absolute inset-0 flex items-center justify-center text-4xl">
                        🔒
                      </span>
                    )}
                  </button>
                  <button
                    onMouseOver={() => {
                      if (openDungeon === "LightDark") {
                        sounds.highlightButton()
                      }
                    }}
                    className={`relative ${
                      openDungeon === "LightDark"
                        ? "transform hover:scale-125"
                        : "hover:opacity-80"
                    }`}
                    onClick={(e) => {
                      e.preventDefault()
                      if (openDungeon === "LightDark") {
                        sounds.buttonClick()
                        setDungeonElement("dark")
                        setDungeonPfp(`/img/game/dark.png`)
                        setIsDungeonModalOpen(true)

                        console.log(dungeonElement)
                        console.log(dungeonLevel)
                        console.log(highestLevel)
                        console.log(highestDarkLevel)
                      } else {
                        sounds.closedDungeonClick()
                        alert("This dungeon is locked!")
                      }
                    }}
                  >
                    <Image
                      className={`h-28 w-28 ${
                        openDungeon === "LightDark" ? "" : "opacity-60"
                      }`}
                      src="/img/game/dark.png"
                      width={225}
                      height={225}
                      alt="Dark"
                    />
                    {openDungeon !== "LightDark" && (
                      <span className="absolute inset-0 flex items-center justify-center text-4xl">
                        🔒
                      </span>
                    )}
                  </button>
                </div>
                <div className="flex justify-center gap-4 md:gap-40 lg:gap-64 xl:gap-76 md:-mt-6 md:mb-8">
                  <button
                    onMouseOver={() => {
                      if (openDungeon === "Water") {
                        sounds.highlightButton()
                      }
                    }}
                    className={`relative ${
                      openDungeon === "Water"
                        ? "transform hover:scale-125"
                        : "hover:opacity-80"
                    }`}
                    onClick={(e) => {
                      e.preventDefault()
                      if (openDungeon === "Water") {
                        sounds.buttonClick()
                        setDungeonElement("water")
                        setDungeonPfp(`/img/game/water.png`)
                        setIsDungeonModalOpen(true)
                      } else {
                        sounds.closedDungeonClick()
                        alert("This dungeon is locked!")
                      }
                    }}
                  >
                    <Image
                      className={`h-28 w-28 lg:-mt-6 xl:-mt-10 ${
                        openDungeon === "Water" ? "" : "opacity-60"
                      }`}
                      src="/img/game/water.png"
                      width={225}
                      height={225}
                      alt="Water"
                    />
                    {openDungeon !== "Water" && (
                      <span className="absolute inset-0 flex items-center justify-center text-4xl lg:-mt-6 xl:-mt-10">
                        🔒
                      </span>
                    )}
                  </button>
                  <button
                    onMouseOver={() => {
                      if (openDungeon === "Lightning") {
                        sounds.highlightButton()
                      }
                    }}
                    className={`relative ${
                      openDungeon === "Lightning"
                        ? "transform hover:scale-125"
                        : "hover:opacity-80"
                    }`}
                    onClick={(e) => {
                      e.preventDefault()
                      if (openDungeon === "Lightning") {
                        sounds.buttonClick()
                        setDungeonElement("lightning")
                        setDungeonPfp(`/img/game/lightning.png`)
                        setIsDungeonModalOpen(true)
                      } else {
                        sounds.closedDungeonClick()
                        alert("This dungeon is locked!")
                      }
                    }}
                  >
                    <Image
                      className={`h-28 w-28 mt-5 xl:mt-8 ${
                        openDungeon === "Lightning" ? "" : "opacity-60"
                      }`}
                      src="/img/game/lightning.png"
                      width={225}
                      height={225}
                      alt="Lightning"
                    />
                    {openDungeon !== "Lightning" && (
                      <span className="absolute inset-0 flex items-center justify-center text-4xl mt-5 xl:mt-8">
                        🔒
                      </span>
                    )}
                  </button>
                  <button
                    onMouseOver={() => {
                      if (openDungeon === "Earth") {
                        sounds.highlightButton()
                      }
                    }}
                    className={`relative ${
                      openDungeon === "Earth"
                        ? "transform hover:scale-125"
                        : "hover:opacity-80"
                    }`}
                    onClick={(e) => {
                      e.preventDefault()
                      if (openDungeon === "Earth") {
                        sounds.buttonClick()
                        setDungeonElement("earth")
                        setDungeonPfp(`/img/game/earth.png`)
                        setIsDungeonModalOpen(true)
                      } else {
                        sounds.closedDungeonClick()
                        alert("This dungeon is locked!")
                      }
                    }}
                  >
                    <Image
                      className={`h-28 w-28 lg:-mt-6 xl:-mt-10 ${
                        openDungeon === "Earth" ? "" : "opacity-60"
                      }`}
                      src="/img/game/earth.png"
                      width={225}
                      height={225}
                      alt="Earth"
                    />
                    {openDungeon !== "Earth" && (
                      <span className="absolute inset-0 flex items-center justify-center text-4xl lg:-mt-6 xl:-mt-10">
                        🔒
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="bottom-button mt-2">
            <div className="flex justify-center md:hidden">
              <NavButton
                onMouseOver={() => {
                  sounds.highlightButton()
                }}
                onClick={() => {
                  sounds.backButton()
                }}
                className=""
                link="/game"
              >
                <ArrowLeftIcon className="h-5 w-5" />
                Back
              </NavButton>
              <button
                onMouseOver={sounds.highlightButton}
                onClick={() => {
                  handleToggleSounds()
                }}
              >
                <Image
                  className={`h-12 w-12 mx-3`}
                  src={`/img/Wooden_UI/${
                    soundsEnabled ? "volume" : "mute"
                  }.png`}
                  width={225}
                  height={225}
                  alt="Sound"
                />
              </button>
              <label className=" font-bold flex flex-col md:text-2xl self-center">
                Select your deck: &nbsp;
                <select
                  onClick={() => {
                    sounds.highlightButton()
                  }}
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
            </div>
          </div>
        </div>
      ) : (
        <>
          <PvpMatch
            match={currentMatch}
            previousTurnBoard={previousTurnBoard}
            socket={socket.current}
            isRedFirst={isRedFirst}
          />{" "}
        </>
      )}
      {/* Dungeon Modal */}
      <Modal
        isOpen={isDungeonModalOpen}
        onRequestClose={closeDungeonModal}
        style={dungeonModalStyles}
      >
        <div className="flex flex-col font-bold text-white shadow-black">
          <h1 className="text-4xl md:text-8xl  text-center">
            {capitalizeFirstLetter(dungeonElement)} Dungeon
          </h1>
          <h1 className="text-xl md:text-3xl text-center">
            {`Energy ${energy} ⚡`}
          </h1>
          <div className="flex flex-col md:flex-row md:justify-center">
            <div className="flex flex-col md:mr-8 shadow-black">
              <button
                onMouseOver={() => {
                  sounds.highlightButton()
                }}
                className="bg-plank-18 bg-contain bg-no-repeat text-center px-4 py-2 md:px-12 md:py-6 bg-center mt-2 md:mt-8"
                onClick={(e) => {
                  e.preventDefault()
                  if (energy < 1) {
                    sounds.closedDungeonClick()
                    alert("You are out of energy!")
                  } else {
                    sounds.buttonClick()
                    const dungeon = dungeonElement + "1"
                    setDungeonLevel(1)
                    setDungeonName(dungeon)
                    startingDungeon()
                    closeDungeonModal()
                    socket.current.emit("startDungeon", {
                      publicKey: publicKey,
                      deckName: deckName,
                      matchType: "dungeon",
                      aiDeck: dungeon,
                    })
                  }
                }}
              >
                <p className="text-lg md:text-3xl  shadow-black">{`${
                  dungeonElement !== "dark" && highestLevel >= 1
                    ? "✅  "
                    : dungeonElement === "dark" && highestDarkLevel >= 1
                    ? "✅  "
                    : ""
                }Level 1`}</p>
              </button>
              <button
                onMouseOver={() => {
                  sounds.highlightButton()
                }}
                className="bg-plank-17 bg-contain bg-no-repeat text-center px-4 py-2 md:px-12 md:py-6 bg-center mt-4"
                onClick={(e) => {
                  e.preventDefault()
                  if (energy < 1) {
                    sounds.closedDungeonClick()
                    alert("You are out of energy!")
                  } else {
                    if (
                      (dungeonElement !== "dark" && highestLevel >= 1) ||
                      (dungeonElement === "dark" && highestDarkLevel >= 1)
                    ) {
                      sounds.buttonClick()
                      const dungeon = dungeonElement + "2"
                      setDungeonLevel(2)
                      setDungeonName(dungeon)
                      startingDungeon()
                      closeDungeonModal()
                      socket.current.emit("startDungeon", {
                        publicKey: publicKey,
                        deckName: deckName,
                        matchType: "dungeon",
                        aiDeck: dungeon,
                      })
                    } else {
                      sounds.closedDungeonClick()
                      alert("This dungeon is locked!")
                    }
                  }
                }}
              >
                <p className="text-lg md:text-3xl  shadow-black">{`${getStatusIcon(
                  dungeonElement,
                  2,
                  highestLevel,
                  highestDarkLevel
                )}Level 2`}</p>
              </button>
              <button
                onMouseOver={() => {
                  sounds.highlightButton()
                }}
                className="bg-plank-16 bg-contain bg-no-repeat text-center px-4 py-2 md:px-12 md:py-6 bg-center mt-4"
                onClick={(e) => {
                  e.preventDefault()
                  if (energy < 1) {
                    sounds.closedDungeonClick()
                    alert("You are out of energy!")
                  } else {
                    if (
                      (dungeonElement !== "dark" && highestLevel >= 2) ||
                      (dungeonElement === "dark" && highestDarkLevel >= 2)
                    ) {
                      sounds.buttonClick()
                      const dungeon = dungeonElement + "3"
                      setDungeonLevel(3)
                      setDungeonName(dungeon)
                      startingDungeon()
                      closeDungeonModal()
                      socket.current.emit("startDungeon", {
                        publicKey: publicKey,
                        deckName: deckName,
                        matchType: "dungeon",
                        aiDeck: dungeon,
                      })
                    } else {
                      sounds.closedDungeonClick()
                      alert("This dungeon is locked!")
                    }
                  }
                }}
              >
                <p className="text-lg md:text-3xl shadow-black">{`${getStatusIcon(
                  dungeonElement,
                  3,
                  highestLevel,
                  highestDarkLevel
                )}Level 3`}</p>
              </button>
              <button
                onMouseOver={() => {
                  sounds.highlightButton()
                }}
                className="bg-plank-18 bg-contain bg-no-repeat text-center px-4 py-2 md:px-12 md:py-6 bg-center mt-4"
                onClick={(e) => {
                  e.preventDefault()
                  if (energy < 1) {
                    sounds.closedDungeonClick()
                    alert("You are out of energy!")
                  } else {
                    if (
                      (dungeonElement !== "dark" && highestLevel >= 3) ||
                      (dungeonElement === "dark" && highestDarkLevel >= 3)
                    ) {
                      sounds.buttonClick()
                      const dungeon = dungeonElement + "4"
                      setDungeonLevel(4)
                      setDungeonName(dungeon)
                      startingDungeon()
                      closeDungeonModal()
                      socket.current.emit("startDungeon", {
                        publicKey: publicKey,
                        deckName: deckName,
                        matchType: "dungeon",
                        aiDeck: dungeon,
                      })
                    } else {
                      sounds.closedDungeonClick()
                      alert("This dungeon is locked!")
                    }
                  }
                }}
              >
                <p className="text-lg md:text-3xl shadow-black">{`${getStatusIcon(
                  dungeonElement,
                  4,
                  highestLevel,
                  highestDarkLevel
                )}Level 4`}</p>
              </button>
              <button
                onMouseOver={() => {
                  sounds.highlightButton()
                }}
                className="bg-plank-16 bg-contain bg-no-repeat text-center px-4 py-2 md:px-12 md:py-6 bg-center mt-4"
                onClick={(e) => {
                  e.preventDefault()
                  if (energy < 1) {
                    sounds.closedDungeonClick()
                    alert("You are out of energy!")
                  } else {
                    if (
                      (dungeonElement !== "dark" && highestLevel >= 4) ||
                      (dungeonElement === "dark" && highestDarkLevel >= 4)
                    ) {
                      sounds.buttonClick()
                      const dungeon = dungeonElement + "5"
                      setDungeonLevel(5)
                      setDungeonName(dungeon)
                      startingDungeon()
                      closeDungeonModal()
                      socket.current.emit("startDungeon", {
                        publicKey: publicKey,
                        deckName: deckName,
                        matchType: "dungeon",
                        aiDeck: dungeon,
                      })
                    } else {
                      sounds.closedDungeonClick()
                      alert("This dungeon is locked!")
                    }
                  }
                }}
              >
                <p className="text-17 md:text-3xl shadow-black">{`${getStatusIcon(
                  dungeonElement,
                  5,
                  highestLevel,
                  highestDarkLevel
                )}Level 5`}</p>
              </button>
            </div>

            <div className="flex flex-col md:ml-10">
              <button
                onMouseOver={() => {
                  sounds.highlightButton()
                }}
                className="bg-plank-17 bg-contain bg-no-repeat text-center px-4 py-2 md:px-12 md:py-6 bg-center mt-4 md:mt-8"
                onClick={(e) => {
                  e.preventDefault()
                  if (energy < 1) {
                    sounds.closedDungeonClick()
                    alert("You are out of energy!")
                  } else {
                    if (
                      (dungeonElement !== "dark" && highestLevel >= 5) ||
                      (dungeonElement === "dark" && highestDarkLevel >= 5)
                    ) {
                      sounds.buttonClick()
                      const dungeon = dungeonElement + "6"
                      setDungeonLevel(6)
                      setDungeonName(dungeon)
                      startingDungeon()
                      closeDungeonModal()
                      socket.current.emit("startDungeon", {
                        publicKey: publicKey,
                        deckName: deckName,
                        matchType: "dungeon",
                        aiDeck: dungeon,
                      })
                    } else {
                      sounds.closedDungeonClick()
                      alert("This dungeon is locked!")
                    }
                  }
                }}
              >
                <p className="text-lg md:text-3xl shadow-black">{`${getStatusIcon(
                  dungeonElement,
                  6,
                  highestLevel,
                  highestDarkLevel
                )}Level 6`}</p>
              </button>
              <button
                onMouseOver={() => {
                  sounds.highlightButton()
                }}
                className="bg-plank-18 bg-contain bg-no-repeat text-center px-4 py-2 md:px-12 md:py-6 bg-center mt-4"
                onClick={(e) => {
                  e.preventDefault()
                  if (energy < 1) {
                    sounds.closedDungeonClick()
                    alert("You are out of energy!")
                  } else {
                    if (
                      (dungeonElement !== "dark" && highestLevel >= 6) ||
                      (dungeonElement === "dark" && highestDarkLevel >= 6)
                    ) {
                      sounds.buttonClick()
                      const dungeon = dungeonElement + "7"
                      setDungeonLevel(7)
                      setDungeonName(dungeon)
                      startingDungeon()
                      closeDungeonModal()
                      socket.current.emit("startDungeon", {
                        publicKey: publicKey,
                        deckName: deckName,
                        matchType: "dungeon",
                        aiDeck: dungeon,
                      })
                    } else {
                      sounds.closedDungeonClick()
                      alert("This dungeon is locked!")
                    }
                  }
                }}
              >
                <p className="text-lg md:text-3xl shadow-black">{`${getStatusIcon(
                  dungeonElement,
                  7,
                  highestLevel,
                  highestDarkLevel
                )}Level 7`}</p>
              </button>
              <button
                onMouseOver={() => {
                  sounds.highlightButton()
                }}
                className="bg-plank-18 bg-contain bg-no-repeat text-center px-4 py-2 md:px-12 md:py-6 bg-center mt-4"
                onClick={(e) => {
                  e.preventDefault()
                  if (energy < 1) {
                    sounds.closedDungeonClick()
                    alert("You are out of energy!")
                  } else {
                    if (
                      (dungeonElement !== "dark" && highestLevel >= 7) ||
                      (dungeonElement === "dark" && highestDarkLevel >= 7)
                    ) {
                      sounds.buttonClick()
                      const dungeon = dungeonElement + "8"
                      setDungeonLevel(8)
                      setDungeonName(dungeon)
                      startingDungeon()
                      closeDungeonModal()
                      socket.current.emit("startDungeon", {
                        publicKey: publicKey,
                        deckName: deckName,
                        matchType: "dungeon",
                        aiDeck: dungeon,
                      })
                    } else {
                      sounds.closedDungeonClick()
                      alert("This dungeon is locked!")
                    }
                  }
                }}
              >
                <p className="text-lg md:text-3xl shadow-black">{`${getStatusIcon(
                  dungeonElement,
                  8,
                  highestLevel,
                  highestDarkLevel
                )}Level 8`}</p>
              </button>
              <button
                onMouseOver={() => {
                  sounds.highlightButton()
                }}
                className="bg-plank-16 bg-contain bg-no-repeat text-center px-4 py-2 md:px-12 md:py-6 bg-center mt-4"
                onClick={(e) => {
                  e.preventDefault()
                  if (energy < 1) {
                    sounds.closedDungeonClick()
                    alert("You are out of energy!")
                  } else {
                    if (
                      (dungeonElement !== "dark" && highestLevel >= 8) ||
                      (dungeonElement === "dark" && highestDarkLevel >= 8)
                    ) {
                      sounds.buttonClick()
                      const dungeon = dungeonElement + "9"
                      setDungeonLevel(9)
                      setDungeonName(dungeon)
                      startingDungeon()
                      closeDungeonModal()
                      socket.current.emit("startDungeon", {
                        publicKey: publicKey,
                        deckName: deckName,
                        matchType: "dungeon",
                        aiDeck: dungeon,
                      })
                    } else {
                      sounds.closedDungeonClick()
                      alert("This dungeon is locked!")
                    }
                  }
                }}
              >
                <p className="text-lg md:text-3xl shadow-black">{`${getStatusIcon(
                  dungeonElement,
                  9,
                  highestLevel,
                  highestDarkLevel
                )}Level 9`}</p>
              </button>
              <button
                onMouseOver={() => {
                  sounds.highlightButton()
                }}
                className="bg-plank-17 bg-contain bg-no-repeat text-center px-4 py-2 md:px-12 md:py-6 bg-center mt-4"
                onClick={(e) => {
                  e.preventDefault()
                  if (energy < 1) {
                    sounds.closedDungeonClick()
                    alert("You are out of energy!")
                  } else {
                    if (
                      (dungeonElement !== "dark" && highestLevel >= 9) ||
                      (dungeonElement === "dark" && highestDarkLevel >= 9)
                    ) {
                      sounds.buttonClick()
                      const dungeon = dungeonElement + "10"
                      setDungeonLevel(10)
                      setDungeonName(dungeon)
                      startingDungeon()
                      closeDungeonModal()
                      socket.current.emit("startDungeon", {
                        publicKey: publicKey,
                        deckName: deckName,
                        matchType: "dungeon",
                        aiDeck: dungeon,
                      })
                    } else {
                      sounds.closedDungeonClick()
                      alert("This dungeon is locked!")
                    }
                  }
                }}
              >
                <p className="text-lg md:text-3xl shadow-black">{`${getStatusIcon(
                  dungeonElement,
                  10,
                  highestLevel,
                  highestDarkLevel
                )}Level 10`}</p>
              </button>
            </div>
          </div>

          <button
            className="bg-plank-18 bg-contain bg-no-repeat text-center px-4 py-2 md:px-12 md:py-6 bg-center mt-10"
            onMouseOver={(e) => {
              e.preventDefault()
              sounds.highlightButton()
            }}
            onClick={(e) => {
              e.preventDefault()
              sounds.backButton()
              closeDungeonModal()
            }}
          >
            <p className="text-lg md:text-3xl shadow-black">Close</p>
          </button>
        </div>
      </Modal>
      <DungeonMatchOverModal
        isOpen={isDungeonMatchOverModalOpen}
        onClose={() => {
          socket.current.emit("cleanUpDungeonMatch", {})
          setIsDungeonMatchOverModalOpen(false)
        }}
        winnerName={winnerName}
        playerName={playerName}
        playerPfp={playerPfp}
        matchDraw={matchDraw}
        socket={socket.current}
        currentDungeon={currentDungeon}
        nextDungeon={nextDungeon}
        publicKey={publicKey}
        deckName={deckName}
        setDungeonName={setDungeonName}
        startingDungeon={startingDungeon}
        energy={energy}
        gwenRewards={gwenRewards}
        renownRewards={renownRewards}
        hasDungeonTicket={hasDungeonTicket}
      />
      <DungeonMatchFoundModal
        isOpen={isDungeonMatchFoundModalOpen}
        onClose={() => setIsDungeonMatchFoundModalOpen(false)}
        playerName={playerName}
        playerPfp={playerPfp}
        dungeonName={dungeonName}
        dungeonPfp={dungeonPfp}
      />
      <CoinFlipModal
        isOpen={isCoinFlipModalOpen}
        onClose={() => setIsCoinFlipModalOpen(false)}
        isRedFirst={isRedFirst}
      />
    </>
  )
}
