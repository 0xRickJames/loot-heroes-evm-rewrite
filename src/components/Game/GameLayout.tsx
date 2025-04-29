import React, { useCallback } from "react"
import NavButton from "../Widget/NavButton"
import { useWallet } from "@solana/wallet-adapter-react"
import ProfileModal from "./ProfileModal"
import axios from "axios"
import { useRouter } from "next/router"

type Props = {
  children: React.ReactNode
  backgroundImage?: string
  connectedPlayersLength?: number
}

export function GameLayout({
  children,
  backgroundImage,
  connectedPlayersLength,
}: Props) {
  const { publicKey } = useWallet()
  const [isMobileNavOpen, setIsMobileNavOpen] = React.useState(false)

  const [playerData, setPlayerData] = React.useState(null)

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

  React.useEffect(() => {
    fetchPlayerData()
  }, [fetchPlayerData])

  // Variables and functions for the update profile modal
  const [modalOpen, setModalOpen] = React.useState<boolean>(false)
  const [modalOnClose, setModalOnClose] = React.useState<Function>(() => {})
  const handleOpenModal = (onClose) => {
    // Save the onClose function in the state
    setModalOnClose(() => onClose)
    setModalOpen(true)
  }
  const handleCloseModal = async (profileUrl, username) => {
    await updatePlayerProfile(publicKey.toString(), profileUrl, username)
    fetchPlayerData()
    setModalOpen(false)
    // Call the saved onClose function
    modalOnClose()
  }
  const updatePlayerProfile = async (
    publicKey: string,
    profileUrl: string,
    username: string
  ) => {
    try {
      const response = await axios.put(
        `/api/profiles?publicKey=${publicKey}&playerName=${username}&playerPfp=${profileUrl}`
      )
    } catch (error) {
      console.error(error) // Handle any errors that occur during the API call
    }
  }

  const router = useRouter()

  return (
    <div className="game-layout">
      <ProfileModal
        isOpen={modalOpen}
        onRequestClose={(profileUrl, username) =>
          handleCloseModal(profileUrl, username)
        }
      />
      <div className="left-panel">
        <div className="game-layout__nav--info">
          <img
            className="frame-desktop"
            style={
              {
                // maxHeight: "30vh",
              }
            }
            src="/img/game/info_frame.png"
          />

          <img className="frame-mobile h-35vh " src="/img/frame-mobile.png" />

          <div className="nav-info">
            <div className="flex flex-col w-full  ">
              <img
                className="pfp"
                style={{
                  //width: "50%",
                  marginBottom: "8px",
                }}
                src={playerData ? playerData.playerPfp : "/img/game/pfp.png"}
                onClick={() => handleOpenModal(() => {})}
              />
              <p className="text-lg">
                {playerData
                  ? playerData.playerName.length > 20
                    ? playerData.playerName.slice(0, 20) + "..."
                    : playerData.playerName
                  : null}
              </p>

              <p className="text-lg">
                {playerData
                  ? `Valor: ${
                      router.pathname === "/game"
                        ? playerData.eloNormal
                        : router.pathname === "/game/tournament"
                        ? playerData.eloTournament
                        : ""
                    }`
                  : null}
              </p>
              <p className="text-lg">
                {playerData
                  ? `W-${
                      router.pathname === "/game"
                        ? playerData.winsNormal
                        : router.pathname === "/game/tournament"
                        ? playerData.winsTournament
                        : ""
                    } L-${
                      router.pathname === "/game"
                        ? playerData.lossesNormal
                        : router.pathname === "/game/tournament"
                        ? playerData.lossesTournament
                        : ""
                    } T-${
                      router.pathname === "/game"
                        ? playerData.tiesNormal
                        : router.pathname === "/game/tournament"
                        ? playerData.tiesTournament
                        : ""
                    }`
                  : null}
              </p>
              {/*
              {publicKey ? (
                <>
                  {" "}
                  <p className="text-lg">
                    {publicKey
                      ? publicKey.toString().slice(0, 12) + "..."
                      : null}
                  </p>
                   <p className="">
                  Level <b className="text-green-600 text-lg">23</b>
                </p>
                <p className="">
                  MMR&nbsp;<b className="text-green-600 text-lg">1260</b>
                </p> 
                </>
              ) : null}*/}
            </div>

            <div className="mobile-nav ">
              <svg
                onClick={() => setIsMobileNavOpen(true)}
                className="mobile-nav-button--open"
                xmlns="http://www.w3.org/2000/svg"
                width="44"
                height="44"
                fill="none"
                stroke="#e3ddc3"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <path stroke="none" d="M0 0h24v24H0z"></path>
                <path d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>

              <div className="mobile-nav-modal lg:hidden">
                <svg
                  onClick={() => setIsMobileNavOpen(false)}
                  className="mobile-nav-button--close"
                  xmlns="http://www.w3.org/2000/svg"
                  width="44"
                  height="44"
                  fill="none"
                  stroke="#e3ddc3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                >
                  <path stroke="none" d="M0 0h24v24H0z"></path>
                  <path d="M10 10l4 4m0-4l-4 4M12 3c7.2 0 9 1.8 9 9s-1.8 9-9 9-9-1.8-9-9 1.8-9 9-9z"></path>
                </svg>
                <div className="nav-buttons">
                  <NavButton wrapperClass="nav-button" link="/game">
                    PvP
                  </NavButton>
                  <NavButton wrapperClass="nav-button" link="/game/dungeons">
                    Dungeons 2.0
                  </NavButton>
                  <NavButton wrapperClass="nav-button" link="/game/tournament">
                    Tournament
                  </NavButton>
                  <NavButton wrapperClass="nav-button" link="/game/heroes">
                    Heroes
                  </NavButton>
                  <NavButton wrapperClass="nav-button" link="/game/items">
                    Items
                  </NavButton>
                  <NavButton wrapperClass="nav-button" link="/decks">
                    Decks
                  </NavButton>
                  <NavButton wrapperClass="nav-button" link="/dungeons">
                    Dungeons
                  </NavButton>
                  <NavButton wrapperClass="nav-button" link="/game/expeditions">
                    Expeditions
                  </NavButton>
                  <NavButton wrapperClass="nav-button" link="/game/leaderboard">
                    Leaderboard
                  </NavButton>
                </div>
                <div>
                  {connectedPlayersLength ? (
                    <p className="text-green-500">
                      &#x2022; {connectedPlayersLength} players online
                    </p>
                  ) : null}
                </div>
              </div>
            </div>

            {/* <NavButton link="#">Settings</NavButton> */}
          </div>
        </div>

        <div className="game-layout__nav--links">
          <img
            style={
              {
                // maxHeight: "60vh",
              }
            }
            src="/img/game/left-panel.png"
          />

          <div className="nav-links">
            <div className="nav-buttons">
              <NavButton link="/game">PvP</NavButton>
              <NavButton link="/game/dungeons">Dungeons 2.0</NavButton>
              <NavButton link="/game/heroes">Heroes</NavButton>
              <NavButton link="/game/items">Items</NavButton>
              <NavButton link="/decks">Decks</NavButton>
              <NavButton link="/dungeons">Dungeons</NavButton>
              <NavButton link="/game/expeditions">Expeditions</NavButton>
              <NavButton link="/game/leaderboard">Leaderboard</NavButton>
              <NavButton link="/game/tournament">Tournament</NavButton>
            </div>
            <div>
              {connectedPlayersLength ? (
                <p className="text-green-500">
                  &#x2022; {connectedPlayersLength} players online
                </p>
              ) : null}
            </div>
          </div>
        </div>

        {/* <div className="game-layout__nav">
          <img src="/img/game/info_frame.png" />

          <div className="nav-info">
            <p className="">
              <b className="text-green-600 text-lg">23</b> players online
            </p>
            <NavButton link="#">Settings</NavButton>
          </div>
        </div> */}
      </div>

      <div className="game-layout__content">
        <img
          className="hidden lg:block"
          style={{
            zIndex: backgroundImage ? "initial" : "1",
            pointerEvents: "none",
            // maxHeight: "90vh",
          }}
          src={backgroundImage || "/img/game/loadout_frame.png"}
        />

        <div className="content-wrapper">{children}</div>
      </div>

      <style jsx>{`
        .game-layout__nav--links {
          display: none;
        }

        .content-wrapper {
          position: absolute;
          display: flex;
          flex-direction: column;
          left: 0;
          right: 0;
          padding: 0%;
          gap: 8px;
          height: 100%;
          background: ${backgroundImage ? "initial" : "#262425"};
        }

        .nav-buttons {
          gap: 8px;
          display: flex;
          flex-direction: column;
        }

        .nav-links {
          position: absolute;
          display: flex;
          flex-direction: column;
          left: 0;
          right: 0;
          top: 0;
          bottom: 0;
          padding: 15%;
          overflow: hidden;
          justify-content: space-between;
        }

        .nav-info {
          position: absolute;
          display: flex;

          left: 10%;
          right: 10%;
          top: 15%;
          bottom: 0;
          gap: 8px;
          overflow: hidden;
        }

        .nav-info {
          gap: 0;
        }

        .left-panel {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .game-layout__nav--info,
        .game-layout__nav--links {
          display: flex;
          flex-direction: column;
          position: relative;
        }

        .game-layout__content {
          display: flex;
          flex-direction: column;
          position: relative;
        }

        .game-layout {
          display: flex;
          align-items: stretch;
          justify-content: center;
          max-width: 1440px;
          margin: 0px;
          flex-direction: column;
        }

        .game-layout__nav--links {
          display: none;
        }

        .game-layout__nav--info .frame-desktop {
          display: none;
        }

        .mobile-nav-modal {
          display: flex;
          flex-direction: column;
          opacity: ${isMobileNavOpen ? "1" : "0"};
          visibility: ${isMobileNavOpen ? "visible" : "hidden"};
          padding: 32px 48px;
          align-items: center;
          gap: 16px;
          position: fixed;
          left: 0;
          right: 0;
          top: 0;
          bottom: 0;
          background: #272626;
          z-index: 10;
        }

        .mobile-nav-button--close {
          align-self: flex-end;
        }

        @media (min-width: 1024px) {
          .content-wrapper {
            padding: 4%;
          }
          .game-layout__nav--links,
          .game-layout__nav--info .frame-desktop {
            display: flex;
          }

          .game-layout__nav--info .frame-mobile {
            display: none;
          }

          .game-layout {
            flex-direction: row;
            margin: 32px auto;
          }

          .nav-info {
            flex-direction: column;
          }

          .mobile-nav {
            display: none;
          }
          .pfp {
            max-width: 40%;
          }
        }

        @media (max-width: 1024px) {
          .nav-info img {
            max-width: 40%;
          }

          .nav-button {
            min-width: 190px !important;
          }
          .pfp {
            max-width: 40%;
          }
        }
      `}</style>
      <style jsx global>{`
        @media (max-width: 1024px) {
          .nav-button {
            min-width: 190px !important;
          }
        }
      `}</style>
    </div>
  )
}
