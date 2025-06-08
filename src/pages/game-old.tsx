import PvpMatch from "src/components/Game/Pvp/Match"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import { GameLayout } from "src/components/Game/GameLayout"
import MatchFoundModal from "src/components/Game/MatchFoundModal"
import MatchOverModal from "src/components/Game/MatchOverModal"
import usePvpGame from "src/hooks/usePvpGame"
import { useWallet } from "@solana/wallet-adapter-react"

export default function PvpPage() {
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
  const { address } = useWallet()

  const matchOverModalModalStyles = {
    content: {
      maxWidth: "80%",
      maxHeight: "90%",
      top: "0",
      left: "0",
      right: "0",
      bottom: "0",
      margin: "auto",
      backgroundImage: `url('https://cdn.discordapp.com/attachments/1152274140141735936/1161846691109011628/modal_bg.png')`,
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

  return (
    <>
      {!currentMatch ? (
        <GameLayout
          backgroundImage="/img/pvp/bg-desktop.png"
          connectedPlayersLength={connectedPlayersLength}
        >
          <div className="matchmaking">
            {/* <h2 className="welcome-text ll-font-head text-2xl text-white">
              Welcome to Looterra
            </h2> */}

            <div className="matchmaking__content pb-12 lg:pb-0 bg-match-bg-mobile bg-contain bg-center bg-no-repeat h-45vh lg:h-auto lg:bg-none">
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
                    {!address
                      ? "Connect"
                      : address.toString().slice(0, 4) +
                        ".." +
                        address.toString().slice(-4)}
                  </span>
                </WalletMultiButton>
              ) : (
                <button
                  onClick={(e) => {
                    e.preventDefault()

                    socket.current.emit("findMatch", {
                      address: address,
                      deckName: deckName,
                      matchType: "normal",
                    })
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
            margin-top: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: end;
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

          @media (min-width: 1024px) {
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
