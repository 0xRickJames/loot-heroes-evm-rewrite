import React, { useState } from "react"
import Modal from "react-modal"
import { motion } from "framer-motion"
import NavButton from "../Widget/NavButton"
import InteractiveButton from "../Widget/InteractiveButton"

Modal.setAppElement("#__next")

interface MatchOverModalProps {
  isOpen
  onClose
  winnerName: string
  playerName: string
  playerPfp: string
  matchDraw: boolean
}

const MatchOverModal: React.FC<MatchOverModalProps> = ({
  isOpen,
  onClose,
  winnerName,
  playerName,
  playerPfp,
  matchDraw,
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
      color: "black",
    },
    overlay: {
      backgroundColor: "rgba(0, 0, 0, 0.75)",
    },
  }

  const modalVariants = {
    open: { opacity: 1 },
    closed: { opacity: 0 },
  }

  const playerVariants = {
    open: { opacity: 1, x: 0 },
    closed: { opacity: 0, x: "-100%" },
  }

  const opponentVariants = {
    open: { opacity: 1, x: 0 },
    closed: { opacity: 0, x: "100%" },
  }

  const vsVariants = {
    open: { opacity: 1, scale: 2 },
    closed: { opacity: 0, scale: 1 },
  }
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      style={customStyles}
      className=" bg-bg1 lg:bg-bg1-side bg-no-repeat bg-contain bg-center flex flex-col justify-center items-center h-75vh w-75vw align-middle absolute top-10 font-carta "
    >
      <motion.div
        className="flex flex-col -mt-24 lg:mt-0"
        initial="closed"
        animate={isOpen ? "open" : "closed"}
        variants={modalVariants}
      >
        <motion.div
          className="mb-8 lg:mx-8 text-3xl lg:text-5xl font-carta-marina text-center lg:mb-10 text-white shadow-black"
          variants={vsVariants}
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
        <motion.div className="flex flex-col lg:flex-row text-xl lg:text-3xl font-carta-marina self-center items-center align-middle text-center lg:mr-20 ">
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
            <motion.div className="bg-title bg-no-repeat bg-center bg-contain pb-4 w-48 lg:w-72 mb-10 text-white shadow-black">
              <motion.h1 className="">
                {playerName ? playerName.slice(0, 12) : "Player"}
              </motion.h1>
            </motion.div>
          </motion.div>
          <motion.div
            className="lg:pb-10 lg:pl-5"
            variants={vsVariants}
            transition={{ delay: 2.5, duration: 1 }}
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
      </motion.div>
    </Modal>
  )
}

export default MatchOverModal
