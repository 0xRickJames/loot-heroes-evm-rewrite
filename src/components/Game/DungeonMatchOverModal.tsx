import React, { useEffect, useState } from "react"
import Modal from "react-modal"
import { motion } from "framer-motion"
import { Socket } from "socket.io-client"
import { button } from "@material-tailwind/react"
import sounds from "../../utils/sounds"

Modal.setAppElement("#__next")

interface DungeonMatchOverModalProps {
  isOpen
  onClose
  winnerName: string
  playerName: string
  playerPfp: string
  matchDraw: boolean
  socket: Socket
  currentDungeon: string
  nextDungeon: string
  address: string
  deckName: string
  setDungeonName: (dungeonName: string) => void
  startingDungeon: () => void
  energy: number
  gwenRewards: number
  renownRewards: number
  hasDungeonTicket: boolean
}

const DungeonMatchOverModal: React.FC<DungeonMatchOverModalProps> = ({
  isOpen,
  onClose,
  winnerName,
  playerName,
  playerPfp,
  matchDraw,
  socket,
  currentDungeon,
  nextDungeon,
  address,
  deckName,
  setDungeonName,
  startingDungeon,
  energy,
  gwenRewards,
  renownRewards,
  hasDungeonTicket,
}) => {
  const customStyles = {
    content: {
      maxWidth: "80%",
      maxHeight: "90%",
      top: "0",
      left: "0",
      right: "0",
      bottom: "0",
      margin: "auto",
      backgroundSize: "100% 100%",
      backgroundRepeat: "no-repeat",
      backgroundColor: "transparent",
    },
    overlay: {
      backgroundColor: "rgba(0, 0, 0, 0.85)",
    },
  }

  const modalVariants = {
    open: { opacity: 1 },
    closed: { opacity: 0 },
  }

  const titleVariants = {
    open: { opacity: 1, scale: 2 },
    closed: { opacity: 0, scale: 1 },
  }

  const playerVariants = {
    open: { opacity: 1, x: 0, scale: 1 },
    closed: { opacity: 0, x: "-100%", scale: 0.5 },
  }

  const iconVariants = {
    open: { opacity: 1, x: 0, scale: 2 },
    closed: { opacity: 0, x: "100%", scale: 1 },
  }

  const optionsVariants = {
    open: { opacity: 1 },
    closed: { opacity: 0 },
  }

  const rewardVariants = {
    open: { opacity: 1 },
    closed: { opacity: 0 },
  }

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      style={customStyles}
      className=" flex flex-col justify-center items-center h-75vh w-75vw align-middle absolute top-10 font-carta shadow-black"
    >
      <motion.div
        className="flex flex-col -mt-0 lg:mt-0"
        initial="closed"
        animate={isOpen ? "open" : "closed"}
        variants={modalVariants}
      >
        <motion.div
          className="mb-8 lg:mx-8 text-3xl lg:text-5xl text-center lg:mb-10"
          variants={titleVariants}
          transition={{ delay: 0.5, duration: 1 }}
        >
          {matchDraw
            ? "Draw"
            : winnerName === playerName
            ? "Victory"
            : winnerName !== playerName
            ? "Defeat"
            : "Game Over"}
        </motion.div>
        <motion.div className="flex flex-col lg:flex-row text-xl lg:text-3xl self-center items-center align-middle text-center lg:mr-20 ">
          <motion.div
            className="flex flex-col lg:mr-8"
            variants={playerVariants}
            transition={{ delay: 1, duration: 1 }}
          >
            <motion.div className="bg-circle-bg bg-repeat bg-contain bg-center w-36 h-36 lg:w-56 lg:h-56 justify-center self-center items-center">
              <motion.img
                src={playerPfp ? playerPfp : "/img/game/pfp.png"}
                className="w-36 h-36 rounded-full p-3 pb-3.5 lg:h-56 lg:w-56 lg:p-5 lg:pb-6 lg:mt-px"
              />
            </motion.div>
            <motion.div className="bg-title bg-no-repeat bg-center bg-contain pb-4 w-48 lg:w-72 mb-10">
              <motion.h1 className="">
                {playerName ? playerName.slice(0, 12) : "Player"}
              </motion.h1>
            </motion.div>
          </motion.div>
          <motion.div
            className={`lg:pb-10 lg:pl-5 ${
              winnerName !== playerName || matchDraw ? "mb-10 lg:mb-0" : "mb-0"
            }`}
            variants={iconVariants}
            transition={{ delay: 1.5, duration: 1 }}
          >
            <img
              src={
                matchDraw
                  ? "/img/Wooden_UI/draw.png"
                  : winnerName === playerName
                  ? "/img/Wooden_UI/win.png"
                  : winnerName !== playerName
                  ? "/img/Wooden_UI/skull.png"
                  : "Game Over"
              }
              className="w-16 h-16 lg:w-28 lg:h-28"
            />
          </motion.div>
        </motion.div>
        <motion.div
          className={`${
            winnerName !== playerName || matchDraw || !hasDungeonTicket
              ? "hidden"
              : "flex"
          } mb-4 lg:mx-8 text-xl lg:text-3xl text-center self-center  mt-12 lg:-mt-6`}
          variants={rewardVariants}
          transition={{ delay: 2.5, duration: 1 }}
        >
          {`You have been rewarded ${gwenRewards} $GWEN`}
        </motion.div>
        <motion.div
          className={`${
            winnerName !== playerName || matchDraw || !hasDungeonTicket
              ? "hidden"
              : "flex"
          } mb-4 lg:mx-8 text-xl lg:text-3xl text-center self-center`}
          variants={rewardVariants}
          transition={{ delay: 2.5, duration: 1 }}
        >
          {`and ${renownRewards} Renown!`}
        </motion.div>
        <motion.div
          className={`${
            winnerName !== playerName || matchDraw || hasDungeonTicket
              ? "hidden"
              : "flex"
          } mb-2 lg:mx-8 text-xl lg:text-3xl text-center self-center  mt-12 lg:-mt-6`}
          variants={rewardVariants}
          transition={{ delay: 2.5, duration: 1 }}
        >
          {`You have been rewarded ${gwenRewards} $GWEN, but missed out on ${renownRewards} Renown!`}
        </motion.div>
        <motion.div
          className={`${
            winnerName !== playerName || matchDraw || hasDungeonTicket
              ? "hidden"
              : "flex"
          } mb-4 lg:mx-8 text-xl lg:text-3xl text-center self-center`}
          variants={rewardVariants}
          transition={{ delay: 2.5, duration: 1 }}
        >
          {`Purchase a Hero NFT to receive Renown rewards next time!`}
        </motion.div>
        <motion.div
          className="flex flex-col text-center w-56 h-56 lg:h-72 lg:w-72 bg-frame-c2-01 bg-cover bg-no-repeat bg-center self-center text-white text-lg lg:text-2xl font-carta-marina justify-center"
          variants={optionsVariants}
          transition={{ delay: 2, duration: 1 }}
        >
          {/** Next Level Button */}
          <div
            className={`${
              winnerName === playerName && !matchDraw ? "" : "hidden"
            }`}
          >
            <button
              onMouseOver={() => {
                sounds.highlightButton()
              }}
              className="mb-1 xl:mb-3"
              onClick={(e) => {
                e.preventDefault()
                if (energy > 0) {
                  sounds.buttonClick()
                  setDungeonName(nextDungeon)
                  startingDungeon()
                  socket.emit("startDungeon", {
                    address: address,
                    deckName: deckName,
                    matchType: "dungeon",
                    aiDeck: nextDungeon,
                  })
                } else {
                  sounds.closedDungeonClick()
                  alert("You don't have enough energy to start a dungeon!")
                }

                onClose()
              }}
              // close the modal
            >
              {"Next Level"}
            </button>
          </div>
          {/** Retry current level button */}
          <button
            onMouseOver={() => {
              sounds.highlightButton()
            }}
            className="mb-1 xl:mb-3"
            onClick={(e) => {
              e.preventDefault()
              if (energy > 0) {
                sounds.buttonClick()
                setDungeonName(currentDungeon)
                startingDungeon()
                socket.emit("startDungeon", {
                  address: address,
                  deckName: deckName,
                  matchType: "dungeon",
                  aiDeck: currentDungeon,
                })
              } else {
                sounds.closedDungeonClick()
                alert("You don't have enough energy to start a dungeon!")
              }

              onClose()
            }}
            // close the modal
          >
            {"Replay Level"}
          </button>
          <button
            onMouseOver={() => {
              sounds.highlightButton()
            }}
            className="mb-1 xl:mb-3"
            onClick={() => {
              sounds.buttonClick()
              window.location.href = "/game/dungeons"
            }}
          >
            Dungeon Map
          </button>
          <button
            onMouseOver={() => {
              sounds.highlightButton()
            }}
            className="mb-1 xl:mb-3"
            onClick={() => {
              sounds.buttonClick()
              window.location.href = "/game/merchant"
            }}
          >
            Merchant
          </button>
          <button
            onMouseOver={() => {
              sounds.highlightButton()
            }}
            onClick={() => {
              sounds.buttonClick()
              window.location.href = "/game/leaderboard"
            }}
          >
            Leaderboard
          </button>
        </motion.div>
      </motion.div>
    </Modal>
  )
}

export default DungeonMatchOverModal
