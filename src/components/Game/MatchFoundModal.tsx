import React, { useState } from "react"
import Modal from "react-modal"
import NavButton from "../Widget/NavButton"
import InteractiveButton from "../Widget/InteractiveButton"
import { motion } from "framer-motion"

Modal.setAppElement("#__next")

interface MatchFoundModalProps {
  isOpen
  onClose
  playerName: string
  playerPfp: string
  opponentName: string
  opponentPfp: string
}

const MatchFoundModal: React.FC<MatchFoundModalProps> = ({
  isOpen,
  onClose,
  playerName,
  playerPfp,
  opponentName,
  opponentPfp,
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
      border: "none",
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
      className=" bg-bg1 lg:bg-bg1-side bg-no-repeat bg-contain bg-center flex flex-col justify-center items-center h-75vh w-75vw align-middle absolute top-10"
    >
      <motion.div
        className="flex flex-col"
        initial="closed"
        animate={isOpen ? "open" : "closed"}
        variants={modalVariants}
      >
        <motion.div className="flex flex-col md:flex-row text-xl md:text-3xl font-carta-marina self-center items-center align-middle text-center  text-white font-carta shadow-black">
          <motion.div
            className="flex flex-col"
            variants={playerVariants}
            transition={{ delay: 1, duration: 1 }}
          >
            <motion.div className="bg-circle-bg bg-repeat bg-contain bg-center w-36 h-36 lg:w-56 lg:h-56 justify-center self-center items-center">
              <motion.img
                src={playerPfp ? playerPfp : "/img/game/pfp.png"}
                className="w-36 h-36 rounded-full p-3 pb-3.5 lg:h-56 lg:w-56 lg:p-5 lg:pb-6 lg:mt-px"
              />
            </motion.div>
            <motion.div className="bg-title bg-no-repeat bg-center bg-contain pb-4 w-48 lg:w-72">
              <motion.h1 className="">
                {playerName ? playerName.slice(0, 12) : "Player"}
              </motion.h1>
            </motion.div>
          </motion.div>
          <motion.div
            className="my-8 md:mx-8 md:my-0"
            variants={vsVariants}
            transition={{ delay: 2.5, duration: 1 }}
          >
            VS
          </motion.div>
          <motion.div
            className="flex flex-col self-center items-center align-middle"
            variants={opponentVariants}
            transition={{ delay: 1, duration: 1 }}
          >
            <motion.div className="bg-circle-bg bg-repeat bg-contain bg-center w-36 h-36 lg:w-56 lg:h-56 justify-center items-center self-center">
              <motion.img
                src={opponentPfp ? opponentPfp : "/img/game/pfp.png"}
                className="w-36 h-36 rounded-full p-3 pb-3.5 lg:h-56 lg:w-56 lg:p-5 lg:pb-6 lg:mt-px"
              />
            </motion.div>

            <motion.div className="bg-title bg-no-repeat bg-center bg-contain  pb-4 w-48 lg:w-72">
              <motion.h1>
                {opponentName ? opponentName.slice(0, 12) : "Opponent"}
              </motion.h1>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </Modal>
  )
}

export default MatchFoundModal
