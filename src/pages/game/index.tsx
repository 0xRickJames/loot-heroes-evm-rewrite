import Link from "next/link"
import { useRouter } from "next/router"
import React from "react"
import DungeonMapModal from "src/components/Game/DungeonMapModal"
import GameHeader from "src/components/Game/Header"
import MatchFoundModal from "src/components/Game/MatchFoundModal"
import MatchOverModal from "src/components/Game/MatchOverModal"
import PvpMatch from "src/components/Game/Pvp/Match"
import { NewButton } from "src/components/NewButton"
import usePvpGame from "src/hooks/usePvpGame"
import sounds from "../../utils/sounds"
import Image from "next/image"
import Modal from "react-modal"
import { useCallback, useEffect, useState, useMemo } from "react"
import { InfinitySpin } from "react-loader-spinner"
import { useContext } from "react"
import { EvmWalletContext } from "src/contexts/EvmWalletContext"

function truncateString(input: string): string {
  if (input.length <= 8) {
    return input
  }

  const firstPart = input.substring(0, 4)
  const lastPart = input.substring(input.length - 4)

  return `${firstPart}...${lastPart}`
}

type Props = {}

const isOlderThanFiveMinutes = (timestamp: number): boolean => {
  const currentTime = Date.now() // Current time in seconds
  return currentTime - timestamp > 300000 // Check if difference is greater than  5 minutes (300 seconds)
}

export default function GameNew(props: Props) {
  const {
    socket,
    playerName,
    playerPfp,
    opponentName,
    opponentPfp,
    winnerName,
    matchDraw,
    connectedPlayersLength,
    currentMatch,
    previousTurnBoard,
    isFinding,
    deckName,
    handleDeckNameChange,
    deckNames,
    playerData,
    isMatchFoundModalOpen,
    setIsMatchFoundModalOpen,
    isMatchOverModalOpen,
    setIsMatchOverModalOpen,
  } = usePvpGame()

  const customStyles = {
    content: {
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      marginRight: "-50%",
      transform: "translate(-50%, -50%)",
      backgroundColor: "grey",
      color: "black",
      position: "absolute",
    },
    overlay: {
      backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
  }
  const { address, connect, disconnect, signer, provider } =
    useContext(EvmWalletContext)

  const [unclaimedGwen, setUnclaimeGwen] = useState(0)
  const [lastClaimTimestamp, setLastClaimTimestamp] = useState(0)
  const [isClaimGwenModalOpen, setIsClaimGwenModalOpen] = useState(false)
  const [isClaimButtonDisabled, setIsClaimButtonDisabled] = useState(false)
  const [isClaiming, setIsClaiming] = useState(false)
  const [isGwenClaimFinishedOpen, setIsGwenClaimFinishedOpen] = useState(false)
  const [isGwenClaimFailedOpen, setIsGwenClaimFailedOpen] = useState(false)
  const [error, setError] = useState(null)
  // Fetch stats for unclaimed GWEN rewards and the timestamp for the last claim
  const fetchPlayerData = useCallback(async () => {
    if (address) {
      try {
        const response = await fetch(
          `/api/profiles?address=${address.toString()}`
        )
        const data = await response.json()
        console.log(data.unclaimedGwen, data.lastClaimTimestamp)
        setUnclaimeGwen(data.unclaimedGwen)
        setLastClaimTimestamp(data.lastClaimTimestamp)
      } catch (error) {
        console.error("Error fetching player data:", error)
      }
    }
  }, [address])
  React.useEffect(() => {
    fetchPlayerData()
  }, [fetchPlayerData])
  async function handleGwenClaim(address: string, timestamp: number) {
    setIsClaiming(true)
    setError(null)
  }

  // sounds variables
  const [soundsEnabled, setSoundsEnabled] = React.useState(false)
  const handleToggleSounds = () => {
    sounds.toggleSounds()

    sounds.buttonClick()
    const storedValue = localStorage.getItem("soundsEnabled")
    setSoundsEnabled(storedValue === "true")
  }

  const [selectedMatchType, setSelectedMatchType] = React.useState<
    "pvp" | "pve"
  >("pve")
  const { push } = useRouter()
  const handlePlay = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    switch (selectedMatchType) {
      case "pvp":
        socket.current.emit("findMatch", {
          address: address,
          deckName: deckName,
          matchType: "normal",
        })
        break
      case "pve":
        push("/game/dungeons")
        break
    }
  }

  React.useEffect(() => {
    const storedValue = localStorage.getItem("soundsEnabled")
    setSoundsEnabled(storedValue === "true")
  }, [])
  return (
    <div className="page-container">
      {!currentMatch ? (
        <>
          <GameHeader />
          <main>
            <div className="panel">
              <nav>
                <div className="flex">
                  <Link
                    onClick={() => {
                      sounds.buttonClick()
                    }}
                    href={`/game/inventory`}
                    className="game-nav__header"
                  >
                    <img
                      src={playerPfp || "/img/game/pfp.png"}
                      alt="User Profile Picture"
                    />
                    <span>
                      <h3>{playerName || "Hero"}</h3>
                    </span>
                  </Link>
                  <button
                    className="mb-4"
                    onMouseOver={sounds.highlightButton}
                    onClick={() => {
                      handleToggleSounds()
                    }}
                  >
                    <Image
                      className={`h-12 w-12`}
                      src={`/img/Wooden_UI/${
                        soundsEnabled ? "volume" : "mute"
                      }.png`}
                      width={225}
                      height={225}
                      alt="Sound"
                    />
                  </button>
                </div>
                <div className="game-nav__links">
                  <Link
                    onClick={() => {
                      sounds.buttonClick()
                    }}
                    href="/game/inventory"
                  >
                    <p
                      onMouseOver={() => {
                        sounds.highlightButton()
                      }}
                    >
                      My Inventory
                    </p>
                  </Link>
                  <hr />
                  <Link
                    onClick={() => {
                      sounds.buttonClick()
                    }}
                    href="/game/decks"
                  >
                    <p
                      onMouseOver={() => {
                        sounds.highlightButton()
                      }}
                    >
                      Decks
                    </p>
                  </Link>
                  <hr />
                  <Link
                    onClick={() => {
                      sounds.buttonClick()
                    }}
                    href="/game/leaderboard"
                  >
                    <p
                      onMouseOver={() => {
                        sounds.highlightButton()
                      }}
                    >
                      Leaderboard
                    </p>
                  </Link>
                  {/*<hr />
                  <Link href="/game/tournament">Tournament</Link>*/}
                  <hr />
                  <Link
                    onClick={() => {
                      sounds.buttonClick()
                    }}
                    href="/game/merchant"
                  >
                    <p
                      onMouseOver={() => {
                        sounds.highlightButton()
                      }}
                    >
                      Merchant
                    </p>
                  </Link>
                  <hr />

                  <button
                    className={`font-carta text-2xl ${
                      isOlderThanFiveMinutes(lastClaimTimestamp) &&
                      !isClaimButtonDisabled &&
                      unclaimedGwen > 0
                        ? "hover:text-green-400"
                        : "hover:text-red-400"
                    }`}
                    disabled={
                      !isOlderThanFiveMinutes(lastClaimTimestamp) ||
                      isClaimButtonDisabled ||
                      unclaimedGwen === 0
                    }
                    onClick={() => {
                      sounds.buttonClick()
                      setIsClaimGwenModalOpen(true)

                      console.log(unclaimedGwen, lastClaimTimestamp)
                    }}
                    onMouseOver={() => {
                      sounds.highlightButton()
                    }}
                  >
                    {`Claim GWEN ${
                      isOlderThanFiveMinutes(lastClaimTimestamp) &&
                      unclaimedGwen > 0
                        ? `(${unclaimedGwen})`
                        : ""
                    }`}
                  </button>
                </div>
              </nav>

              <label className="mt-2 font-bold">
                Select your deck: &nbsp;
                <select
                  onClick={() => {
                    sounds.highlightButton()
                  }}
                  className="text-black font-bold"
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
              {address ? (
                <NewButton
                  onMouseOver={() => {
                    sounds.highlightButton()
                  }}
                  onClick={() => {
                    sounds.buttonClick()
                  }}
                  form="play"
                  size="large"
                  disabled={isFinding}
                >
                  {isFinding ? "Finding..." : "Play"}
                </NewButton>
              ) : (
                <button
                  className="new-button text-2xl text-white bg-yellow-600 hover:bg-yellow-500 rounded-md px-4 py-2"
                  onMouseOver={() => {
                    sounds.highlightButton()
                  }}
                  onClick={() => {
                    sounds.buttonClick()
                    connect()
                  }}
                >
                  Connect Wallet
                </button>
              )}
            </div>
            <div className="select-match-type">
              <h2>Play</h2>
              <form id="play" onSubmit={handlePlay}>
                <input
                  type="hidden"
                  name="matchType"
                  value={selectedMatchType}
                />
                <button
                  onMouseOver={() => {
                    sounds.highlightButton()
                  }}
                  type="button"
                  className={
                    "match-type-button bots" +
                    `${selectedMatchType === "pve" ? " active" : ""}`
                  }
                  onClick={() => {
                    sounds.buttonClick()
                    setSelectedMatchType("pve")
                  }}
                >
                  vs <span>Bots</span>
                </button>
                <button
                  onMouseOver={() => {
                    sounds.highlightButton()
                  }}
                  type="button"
                  className={
                    "match-type-button players" +
                    `${selectedMatchType === "pvp" ? " active" : ""}`
                  }
                  onClick={() => {
                    sounds.buttonClick()
                    setSelectedMatchType("pvp")
                  }}
                >
                  vs <span>Players</span>
                </button>
                {/* <button className="match-type-button campaign">
                  <span>Tournament</span>
                </button> */}
              </form>
            </div>
          </main>
        </>
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
      <MatchOverModal
        isOpen={isMatchOverModalOpen}
        onClose={() => setIsMatchOverModalOpen(false)}
        winnerName={winnerName}
        playerName={playerData.playerName}
        playerPfp={playerData.playerPfp}
        matchDraw={matchDraw}
      />
      <MatchFoundModal
        isOpen={isMatchFoundModalOpen}
        onClose={() => setIsMatchFoundModalOpen(false)}
        playerName={playerName}
        playerPfp={playerPfp}
        opponentName={opponentName}
        opponentPfp={opponentPfp}
      />
      <Modal isOpen={isClaimGwenModalOpen} style={customStyles}>
        <div className="flex flex-col items-center gap-2">
          <h2 className="text-4xl font-bold m-3 text-yellow-300 shadow-black">
            Claim GWEN
          </h2>
          <div className="border rounded flex flex-col items-center">
            <label className="font-carta text-white shadow-black m-1 text-xl font-bold">
              Receive:
            </label>
            <div className="flex">
              <p className="font-carta text-white shadow-black text-xl m-2">
                {unclaimedGwen} GWEN
              </p>
            </div>
          </div>

          <div className="mt-6">
            <button
              onMouseOver={() => {
                sounds.highlightButton()
              }}
              className="text-2xl font-carta text-white shadow-black m-2 border border-gray-800 rounded-md px-3 p-1 bg-yellow-400"
              onClick={() => {
                sounds.buttonClick()
                setIsClaimGwenModalOpen(false)
                setIsClaimButtonDisabled(true)
                handleGwenClaim(address.toString(), Date.now())
              }}
            >
              Claim
            </button>
            <button
              onMouseOver={() => {
                sounds.highlightButton()
              }}
              className="text-2xl font-carta text-white shadow-black m-2 border border-gray-800 rounded-md px-3 p-1 bg-gray-500"
              onClick={() => {
                sounds.backButton()
                setIsClaimGwenModalOpen(false)
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
      <Modal isOpen={isGwenClaimFinishedOpen} style={customStyles}>
        <div className="flex flex-col items-center gap-2">
          <h2 className="text-4xl font-bold m-3 text-yellow-300 shadow-black">
            GWEN Sent!
          </h2>
          <div className="border rounded flex flex-col items-center">
            <div className="flex">
              <p className="font-carta text-white shadow-black text-xl m-2">
                You should receive {unclaimedGwen} GWEN in your wallet within 5
                minutes.
              </p>
            </div>
          </div>

          <div className="mt-6">
            <button
              onMouseOver={() => {
                sounds.highlightButton()
              }}
              className="text-2xl font-carta text-white shadow-black m-2 border border-gray-800 rounded-md px-3 p-1 bg-gray-500"
              onClick={() => {
                sounds.buttonClick()
                setIsGwenClaimFinishedOpen(false)
              }}
            >
              OK
            </button>
          </div>
        </div>
      </Modal>
      <Modal isOpen={isClaiming} style={customStyles}>
        <div className="flex flex-col items-center">
          <h2 className="text-2xl font-bold text-white shadow-black m-3">
            Claiming GWEN Rewards...
          </h2>
          <p>Attempting to claim {unclaimedGwen} GWEN</p>
          <InfinitySpin color="black" />
        </div>
      </Modal>

      <style jsx>{`
        :global(.wallet-adapter-dropdown button) {
          width: 100%;
        }
        .match-type-button:hover,
        .match-type-button:active {
          box-shadow: 0px 0px 50px 0px #21212b inset;
        }
        .match-type-button.players::before {
          background: url(/img/game/match-players.png) center/cover no-repeat;
        }
        .match-type-button.active {
          box-shadow: 0px 0px 50px 0px #fafad2 inset;
          border: 1px solid #fafad2;
        }
        .match-type-button.bots::before {
          background: url(/img/game/match-bots.png) center/cover no-repeat;
        }
        .match-type-button.campaign::before {
          background: url(/img/game/match-campaign.png) center/cover no-repeat;
        }
        .match-type-button::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          bottom: 0;
          right: 0;
          opacity: 1;
          z-index: -1;
          pointer-events: none;
        }
        .match-type-button span {
          display: inline-block;
          color: #fff;
          font-family: carta-marina, sans-serif;
          font-size: 32px;
          font-style: normal;
          font-weight: 400;
          line-height: normal;
          margin-top: -4px;
        }
        .match-type-button {
          display: flex;
          padding: 64px 16px 16px 16px;
          align-items: flex-start;
          gap: 10px;
          flex: 1 0 0;
          align-self: stretch;
          max-height: 760px;
          position: relative;

          border: 1px solid #55575c;
          box-shadow: 0px 4px 50px 0px rgba(0, 0, 0, 0.5) inset;
          background-blend-mode: darken;

          color: #fff;
          font-family: carta-marina, sans-serif;
          font-size: 24px;
          font-style: normal;
          font-weight: 400;
          line-height: normal;
        }
        .select-match-type form {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 10px;
          flex: 1 0 0;
          align-self: stretch;
        }
        .panel {
          gap: 12px;
          display: flex;
          flex-direction: column;
        }
        .game-nav__links :global(a:hover),
        .game-nav__links :global(a:focus),
        .game-nav__links :global(a:active) {
          text-shadow: 0px 0px 8px 0px #21212b inset !important;
          color: #c5b18f;
        }
        .game-nav__links :global(a) {
          color: #fff;
          font-family: carta-marina, sans-serif;
          font-size: 24px;
          font-style: normal;
          font-weight: 400;
          line-height: normal;
        }
        .game-nav__links hr {
          display: flex;
          margin: 4px 0;
          align-items: flex-start;
          gap: 10px;
          align-self: stretch;
          border-color: #454649;
        }
        .game-nav__links {
          display: flex;
          padding: 8px 24px;
          flex-direction: column;
          justify-content: center;
          align-items: flex-start;
          gap: 6px;
          align-self: stretch;
          border: 1px solid #55575c;
          background: rgba(60, 60, 60, 0.8);
          box-shadow: 0px 0px 8px 0px #21212b inset;
        }
        :global(.game-nav__header) h3 {
          overflow: hidden;
          color: #fff;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-family: carta-marina, sans-serif;
          font-size: 20px;
          font-style: normal;
          font-weight: 400;
          line-height: normal;
        }
        :global(.game-nav__header) span {
          display: flex;
          width: 190px;
          padding: 12px 8px 12px 38px;
          align-items: center;
          gap: 10px;

          border: 1px solid #55575c;
          background: #3c3c3c;
          box-shadow: 0px 0px 8px 0px #21212b inset;
        }
        :global(.game-nav__header) img {
          width: 64px;
          height: 64px;
          border-radius: 64px;
          margin-right: -32px;
          border: 1px solid #c5b18f;
          z-index: 1;
        }
        :global(.game-nav__header) {
          display: flex;
          margin: 0px 16px 16px 16px;
          align-items: center;
          align-self: stretch;
          position: relative;
        }
        .select-match-type h2 {
          color: #fff;
          font-family: carta-marina, sans-serif;
          font-size: 32px;
          font-weight: 400;
        }
        .select-match-type {
          display: flex;
          padding: 22px 32px 32px 32px;
          flex-direction: column;
          align-items: flex-start;
          gap: 10px;
          flex: 1 0 0;
          align-self: stretch;

          border: 1px solid #55575c;
          background: rgba(60, 60, 60, 0.7);
        }

        main {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 22px;
          flex: 1 0 0;
          align-self: stretch;
        }

        @media (min-width: 1024px) {
          .select-match-type form {
            flex-direction: row;
          }
          main {
            flex-direction: row;
            align-items: flex-start;
          }
        }
        .page-container {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          max-width: 1366px;
          margin: 0 auto;
          padding: 0 16px 32px 16px;
          gap: 24px;
        }
      `}</style>
    </div>
  )
}
