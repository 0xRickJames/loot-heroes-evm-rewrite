import React, { useMemo, useRef } from "react"
import { Socket } from "socket.io-client"
import HeroCard from "../Pvp/HeroCard"
import BlankCard from "src/components/Game/Pvp/BlankCard"
import { Match, BoardCard } from "src/hooks/usePvpGame"
import MagicAttackModal from "./MagicAttackModal"
import { Card } from "src/utils/interfaces"
import { DndProvider } from "react-dnd-multi-backend"
import { HTML5toTouch } from "rdndmb-html5-to-touch"
import BoardTile from "./BoardTile"
import { motion, useAnimation } from "framer-motion"
import VoidSquare from "./VoidSquare"
import { DragCardPreview } from "./DragCardPreview"
import { useMediaQuery } from "@mui/material"
import { useRouter } from "next/router"
import QuitMatchModal from "./QuitMatchModal"
import sounds from "../../../utils/sounds"
import Image from "next/image"

export interface AttackAnimationData {
  attacker: string
  attackedSides: string[]
  attackType: string
  attackElement: string
  isMagicAttackRanged: boolean
}

export default function PvpMatch({
  match,
  socket,
  previousTurnBoard,
  isRedFirst,
}: {
  match: Match
  socket: Socket
  previousTurnBoard: BoardCard[][]
  isRedFirst: boolean
}) {
  // Attack data
  const [attackAnimationData, setAttackAnimationData] =
    React.useState<AttackAnimationData>(null)

  const router = useRouter()
  const board = match.board
  const [gameOver, setGameOver] = React.useState<boolean>(false)

  // This deck never changes, it is only a reference, to render the cards properly.
  const [playerStartingCards, setPlayerStartingCards] =
    React.useState<Card[]>(null)

  // This deck changes in every move.
  const [playerDeck, setPlayerDeck] = React.useState<string[]>(null)

  const [droppableStatus, setDroppableStatus] = React.useState<{
    [deck: string]: boolean
  }>({})

  const isDesktop = useMediaQuery("(min-width:768px)")

  // Variables and functions for the magic attack modal
  const [magicAttackModalOpen, setMagicAttackModalOpen] =
    React.useState<boolean>(false)
  const [magicAttackModalOnClose, setMagicAttackModalOnClose] =
    React.useState<Function>(() => {})
  const handleOpenMagicAttackModal = (onClose) => {
    // Save the onClose function in the state
    setMagicAttackModalOnClose(() => onClose)
    setMagicAttackModalOpen(true)
  }
  const handleCloseMagicAttackModal = (isRanged) => {
    setMagicAttackModalOpen(false)
    // Call the saved onClose function
    magicAttackModalOnClose(isRanged)
  }

  const [quitMatchModalOpen, setQuitMatchModalOpen] =
    React.useState<boolean>(false)
  const handleOpenQuitMatchModal = () => {
    setQuitMatchModalOpen(true)
  }
  const handleCloseQuitMatchModal = () => {
    setQuitMatchModalOpen(false)
  }

  // Sounds variables
  const [soundsEnabled, setSoundsEnabled] = React.useState(false)
  const handleToggleSounds = () => {
    sounds.toggleSounds()

    sounds.buttonClick()
    const storedValue = localStorage.getItem("soundsEnabled")
    setSoundsEnabled(storedValue === "true")
  }

  // Get sounds state
  React.useEffect(() => {
    const storedValue = localStorage.getItem("soundsEnabled")
    setSoundsEnabled(storedValue === "true")
  }, [])

  // Set up the component state whenever the match prop changes
  React.useEffect(() => {
    if (match && socket) {
      if (match.turnNumber !== 0) {
        sounds.playCardDrop()

        animationControls.start(shakeAnimation)
      }

      const board = match.board
      // Map everything and set disabled drop areas
      const newDroppableStatus: { [deck: string]: boolean } = {}

      board.forEach((row, x) => {
        row.forEach((column, y) => {
          if (column !== null) {
            newDroppableStatus[`cardslot-${x}-${y}`] = true
          }
        })
      })

      // Set the component states

      setDroppableStatus(newDroppableStatus)

      const playerCards = match.players[socket.id].deckInitialCards
      setPlayerStartingCards(playerCards)

      const deck = match.players[socket.id].deck
      setPlayerDeck(deck)
    }
  }, [match, socket])
  React.useEffect(() => {
    if (redScore + blueScore === 14) {
      if (!gameOver) {
        setGameOver(true)
      }
    }
  }, [match, socket])

  // useEffect to handle attack animations

  React.useEffect(() => {
    if (socket && socket.on) {
      socket.on(
        "ranged-attack",
        (attackingCard, attackedCards, isMagicAttackRanged, element) => {
          setAttackAnimationData({
            attacker: attackingCard,
            attackedSides: attackedCards,
            attackType: "ranged",
            attackElement: element,
            isMagicAttackRanged: isMagicAttackRanged,
          })
        }
      )

      socket.on(
        "magic-attack",
        (attackingCard, attackedCards, isMagicAttackRanged, element) => {
          setAttackAnimationData({
            attacker: attackingCard,
            attackedSides: attackedCards,
            attackType: "magic",
            attackElement: element,
            isMagicAttackRanged: isMagicAttackRanged,
          })
        }
      )

      socket.on(
        "melee-attack",
        (attackingCard, attackedCards, isMagicAttackRanged, element) => {
          setAttackAnimationData({
            attacker: attackingCard,
            attackedSides: attackedCards,
            attackType: "melee",
            attackElement: element,
            isMagicAttackRanged: isMagicAttackRanged,
          })
        }
      )

      // Clean up the event listeners when the component unmounts
      return () => {
        socket.off("ranged-attack")
        socket.off("magic-attack")
        socket.off("melee-attack")
      }
    }
  }, [socket]) // Make sure to add socket to the dependency array

  //const [showAbility, setShowAbility] = React.useState(false)

  async function addCardToBoard(itemId: string, x: string, y: string) {
    // grab the row and the column from the destinationId using regex
    const row = parseInt(x)
    const column = parseInt(y)
    // If the card is a magic user, open the modal
    const card = playerStartingCards.find((card) => {
      return card.id === itemId
    })
    if (
      (match.turnNumber % 2 === 0 &&
        match.isRedFirst &&
        matchPlayer.color === "blue") ||
      (match.turnNumber % 2 !== 0 &&
        !match.isRedFirst &&
        matchPlayer.color === "blue") ||
      (match.turnNumber % 2 === 0 &&
        !match.isRedFirst &&
        matchPlayer.color === "red") ||
      (match.turnNumber % 2 !== 0 &&
        match.isRedFirst &&
        matchPlayer.color === "red")
    ) {
      return
    } else if (card.type === "magic" && match.turnNumber !== 0) {
      handleOpenMagicAttackModal((isRanged) => {
        if (isRanged === "cancelled") {
          return
        } else if (isRanged === "ranged") {
          socket.emit("move", {
            matchId: match.matchId,
            from: itemId,
            to: {
              x: row,
              y: column,
            },
            isMagicAttackRanged: isRanged,
          })
        } else if (isRanged === "melee") {
          socket.emit("move", {
            matchId: match.matchId,
            from: itemId,
            to: {
              x: row,
              y: column,
            },
            isMagicAttackRanged: false,
          })
        }
        // This function will be called when the modal closes
      })
    } else {
      socket.emit("move", {
        matchId: match.matchId,
        from: itemId,
        to: {
          x: row,
          y: column,
        },
        isMagicAttackRanged: false,
      })
    }
    /*
    if (card.specialAbility2 !== "none") {
      setShowAbility(true)
      setTimeout(() => setShowAbility(false), 15000) // hide the text after 2 seconds
    }
    */
  }

  const playerDeckWithCards = useMemo(() => {
    if (!playerDeck || !playerStartingCards) return null

    return playerDeck.map((cardId) => {
      const card = playerStartingCards.find((card) => {
        return card.id === cardId
      })

      if (!card) throw new Error(`Card ${cardId} not found on the client.`)

      return card
    })
  }, [playerDeck, playerStartingCards])

  const cardColors = {
    red: "#5a1d21",
    blue: "#4750a6",
  }

  const matchPlayer = useMemo(() => match.players[socket.id], [match, socket])

  const isPlayerTurn = useMemo(() => {
    if (
      (match.turnNumber % 2 === 0 &&
        match.isRedFirst &&
        matchPlayer.color === "blue") ||
      (match.turnNumber % 2 !== 0 &&
        !match.isRedFirst &&
        matchPlayer.color === "blue") ||
      (match.turnNumber % 2 === 0 &&
        !match.isRedFirst &&
        matchPlayer.color === "red") ||
      (match.turnNumber % 2 !== 0 &&
        match.isRedFirst &&
        matchPlayer.color === "red")
    ) {
      return false
    } else {
      return true
    }
  }, [match, matchPlayer])

  const blueScore = useMemo(() => {
    const id = Object.keys(match.players).find(
      (playerId) => match.players[playerId].color === "blue"
    )

    return match.players[id].score
  }, [match.players])

  const redScore = useMemo(() => {
    const id = Object.keys(match.players).find(
      (playerId) => match.players[playerId].color === "red"
    )

    return match.players[id].score
  }, [match.players])

  const animationControls = useAnimation()

  const shakeAnimation = {
    x: [0, -10, 10, -10, 10, 0],
    y: [0, 10, -10, 10, -10, 0],
    transition: { duration: 0.2 },
  }

  return (
    <motion.div animate={animationControls}>
      <div className=" bg-mobile-wrapper bg-contain pb-48 max-w-screen bg-no-repeat bg-top lg:bg-none">
        <div className="match-wrapper bg-contain min-h-full lg:bg-contain lg:bg-match-wrapper bg-center bg-no-repeat m-auto lg:max-w-6xl flex lg:pl-20 lg:pt-12 lg:mt-2 flex-col items-center lg:flex-row">
          <div>
            <MagicAttackModal
              isOpen={magicAttackModalOpen}
              onRequestClose={(isRanged) =>
                handleCloseMagicAttackModal(isRanged)
              }
            />
            {/* {isMagicAttackRanged ? (
          <p>Magic attack is ranged</p>
        ) : (
          <p>Magic attack is melee</p>
        )} */}
          </div>

          <DndProvider options={HTML5toTouch}>
            <div className="flex items-center bg-black-500 order-2 lg:order-1">
              {playerDeckWithCards ? (
                <>
                  <div className="max-w-4xl mx-auto relative player-deck md:mt-12">
                    <div className="flex absolute deck-paper bg-mobile-deck-paper lg:bg-deck-paper bg-contain bg-center bg-no-repeat -top-1 -bottom-8 -left-3 -right-5 lg:-top-32 md:-top-1 lg:-bottom-12 md:-bottom-9 lg:mt-1 lg:-left-12 md:-left-5 md:-right-9 lg:-right-9" />

                    <h2 className="hidden ll-font-head text-gray-800 hover:text-gray-900">
                      Player {socket.id.slice(0, 6) + "..."} (you)
                    </h2>
                    <ul className="mt-6 characters grid deck-background">
                      {/**
                       * @TODO render the player deck with fixed card indexes
                       * so that the cards don't move around when the player
                       * draws a card, similar to the PvE game.
                       */}
                      {playerDeckWithCards.map((card, index) => {
                        return (
                          <li onDragStart={sounds.playCardPickupSound}>
                            <HeroCard
                              size={isDesktop ? "small" : "xsmall"}
                              card={card}
                              style={{
                                backgroundColor: cardColors[matchPlayer.color],
                              }}
                              attackAnimationData={attackAnimationData}
                            />
                          </li>
                        )
                      })}
                      {Array(8 - playerDeckWithCards.length)
                        .fill(null)
                        .map(() => (
                          <BlankCard size={isDesktop ? "small" : "xsmall"} />
                        ))}
                    </ul>
                  </div>
                </>
              ) : (
                "Loading player deck..."
              )}
            </div>

            <div className="flex mt-8 lg:mt-0 order-1 lg:order-2 mx-2">
              {board && playerDeck && playerStartingCards ? (
                <>
                  <div className="match-board flex-1 max-w-4xl mx-auto">
                    <div className="justify-end lg:justify-between mb-6 md:mb-1 flex align-center">
                      <button
                        onMouseOver={sounds.highlightButton}
                        onClick={() => {
                          handleToggleSounds()
                        }}
                      >
                        <Image
                          className={`h-10 w-10 md:h-14 md:w-14 mx-3`}
                          src={`/img/Wooden_UI/${
                            soundsEnabled ? "volume" : "mute"
                          }.png`}
                          width={225}
                          height={225}
                          alt="Sound"
                        />
                      </button>
                      <button
                        onMouseOver={() => {
                          sounds.highlightButton()
                        }}
                        className="bg-plank-18 bg-cover md:bg-contain bg-center bg-no-repeat flex text-white shadow-black  font-carta text-xl text-center px-8 py-2 md:mt-4 md:mb-4 lg:-mr-9"
                        onClick={() => {
                          sounds.buttonClick()
                          if (match.turnNumber < 14) {
                            handleOpenQuitMatchModal()
                          } else {
                            router.reload()
                          }
                        }}
                      >
                        {match.turnNumber < 14 ? "Forfeit" : "Back"}
                      </button>
                    </div>
                    {/** Player turn */}
                    <div className="scores">
                      <h3 className="ll-font-head text-white shadow-black font-carta">
                        {isPlayerTurn ? "Your turn" : "Opponent's turn"}
                      </h3>
                      <div className="scores-numbers">
                        <div className="scores__score">
                          <span className="ll-font-head">{blueScore}</span>
                          <img src="/img/pvp/blue_card.png" />
                        </div>
                        <div className="scores__score">
                          <span className="ll-font-head">{redScore}</span>
                          <img src="/img/pvp/red_card.png" />
                        </div>
                      </div>
                    </div>
                    <div className="lg:ml-3 grid grid-background">
                      {board
                        .map((row, x) =>
                          row.map((boardCard, y) => {
                            let card: Card
                            let previousTurnBoardCard: BoardCard
                            //const isOpponentCard =
                            //boardCard?.color !== matchPlayer.color

                            if (boardCard !== null) {
                              // If the opponent has played a card, we need to
                              // find the card in the opponent's starting cards
                              const opponentStartingCards = Object.values(
                                match.players
                              ).find(
                                (player) => player.color !== matchPlayer.color
                              ).deckInitialCards

                              const masterDeck: Card[] = [
                                ...opponentStartingCards,
                                ...playerStartingCards,
                              ]

                              card = masterDeck.find(
                                (card) => card.id === boardCard.id
                              )

                              if (previousTurnBoard) {
                                previousTurnBoardCard = previousTurnBoard[x][y]
                              }
                            } else {
                              card = null
                            }

                            return (
                              <div
                                id={`cardslot-${x}-${y}`}
                                key={`${x}-${y}`}
                                className="flex items-center justify-center align-middle"
                              >
                                {card !== null && boardCard.isVoid !== true ? (
                                  <HeroCard
                                    size={isDesktop ? "small" : "xsmall"}
                                    card={card}
                                    boardCard={boardCard}
                                    previousTurnBoardCard={
                                      previousTurnBoardCard
                                    }
                                    style={{
                                      backgroundColor:
                                        cardColors[boardCard.color],
                                    }}
                                    attackAnimationData={attackAnimationData}
                                  />
                                ) : card !== null &&
                                  boardCard.isVoid == true ? (
                                  <VoidSquare
                                    size={isDesktop ? "small" : "xsmall"}
                                  />
                                ) : (
                                  <BoardTile
                                    x={x}
                                    y={y}
                                    onDrop={addCardToBoard}
                                    size={isDesktop ? "small" : "xsmall"}
                                  />
                                )}
                              </div>
                            )
                          })
                        )
                        .flat()}
                    </div>
                  </div>
                </>
              ) : (
                "Loading board..."
              )}
            </div>

            <div className="hidden lg:block flex items-center bg-black-500 order-3">
              {playerDeckWithCards ? (
                <>
                  <div className="max-w-4xl mx-auto player-deck relative lg:block hidden md:mt-12">
                    <div className="hidden lg:block flex absolute deck-paper bg-mobile-deck-paper lg:bg-deck-paper bg-contain bg-center bg-no-repeat -top-1 -bottom-8 -left-3 -right-5 lg:-top-32 lg:-bottom-12 lg:mt-1 lg:-left-16 lg:-right-24" />
                    <h2 className="hidden lg:block ll-font-head text-gray-800 hover:text-gray-900">
                      Your opponent
                    </h2>
                    <ul className="characters grid deck-background">
                      {Array(8)
                        .fill(null)
                        .map(() => (
                          <BlankCard size={isDesktop ? "small" : "xsmall"} />
                        ))}
                    </ul>
                  </div>
                </>
              ) : (
                "Loading player deck..."
              )}
            </div>
            {/* */}

            <div>
              <DragCardPreview />
            </div>
          </DndProvider>

          <style jsx>{`
            @media (min-width: 1024px) {
              .match-board {
                padding: 2.5rem;
              }

              .scores {
                padding: 0;
              }
            }
            .scores-numbers {
              display: flex;
              gap: 8px;
            }
            .scores {
              display: flex;
              justify-content: space-between;
              align-items: baseline;
              padding: 0 2.5rem;
            }

            .scores__score span {
              position: absolute;
              font-size: 22px;
            }

            .scores__score {
              max-width: 42px;
              display: flex;
              align-items: center;
              justify-content: center;
            }

            .grid-background {
              background-image: url("/img/pvp/board_background.png");
              background-size: cover;
              background-position: center;
              object-fit: contain;
              display: grid;
              grid-template-columns: 1fr 1fr 1fr 1fr;
              grid-template-rows: 1fr 1fr 1fr 1fr;
              justify-items: center;
              align-items: center;
              background-repeat: no-repeat;
              padding: 34px;
              gap: 1px;
              max-width: 487px;
            }

            @media (min-width: 768px) {
              .grid-background {
                padding: 50px;
              }
            }
            .HeroCard,
            .VoidSquare {
              display: flex;
              justify-content: center;
              align-items: center;
            }

            .grid li {
              display: flex !important;
            }

            .characters {
              display: grid;
              align-items: start;
              grid-template-columns: repeat(4, 1fr);
              grid-template-rows: repeat(2, 1fr);
              overflow: auto;
              overflow: hidden;
              gap: 2px;
            }
            
          @media (min-width: 1024px) {
            .characters {
              grid-template-columns: repeat(2, 1fr);
              grid-template-rows: repeat(4, 1fr);
            }
          `}</style>
        </div>
      </div>
      <QuitMatchModal
        isOpen={quitMatchModalOpen}
        onRequestClose={handleCloseQuitMatchModal}
        router={router}
      />
    </motion.div>
  )
}
