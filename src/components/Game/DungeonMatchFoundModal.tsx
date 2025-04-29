import React, { useState } from "react"
import Modal from "react-modal"
import NavButton from "../Widget/NavButton"
import InteractiveButton from "../Widget/InteractiveButton"
import { motion } from "framer-motion"

Modal.setAppElement("#__next")

interface DungeonMatchFoundModalProps {
  isOpen
  onClose
  playerName: string
  playerPfp: string
  dungeonName: string
  dungeonPfp: string
}

const DungeonMatchFoundModal: React.FC<DungeonMatchFoundModalProps> = ({
  isOpen,
  onClose,
  playerName,
  playerPfp,
  dungeonName,
  dungeonPfp,
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

  function capitalizeFirstLetter(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }
  // split the dungeon name into it's element and level number

  let dungeonLevel = dungeonName.match(/\d+$/)
  let dungeonElement = dungeonName.match(/^[a-zA-Z]+/)
  let element = dungeonElement ? dungeonElement[0] : "fire"
  let level: number = dungeonLevel ? +dungeonLevel[0] : 0

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      style={customStyles}
      className=" bg-bg1 lg:bg-bg1-side bg-no-repeat bg-contain bg-center flex flex-col justify-center items-center h-75vh w-75vw align-middle absolute top-10 font-carta"
    >
      <motion.div
        className="flex flex-col"
        initial="closed"
        animate={isOpen ? "open" : "closed"}
        variants={modalVariants}
      >
        <motion.div className="flex flex-col md:flex-row text-xl md:text-3xl font-carta-marina self-center items-center align-middle text-center">
          <motion.div
            className="flex flex-col"
            variants={playerVariants}
            transition={{ delay: 1, duration: 1.5 }}
          >
            <motion.div className="bg-circle-bg bg-repeat bg-contain bg-center w-36 h-36 lg:w-56 lg:h-56 justify-center self-center items-center">
              <motion.img
                src={playerPfp ? playerPfp : "/img/game/pfp.png"}
                className="w-36 h-36 rounded-full p-3 pb-3.5 lg:h-56 lg:w-56 lg:p-5 lg:pb-6 lg:mt-px"
              />
            </motion.div>
            <motion.div className="bg-title bg-no-repeat bg-center bg-contain pb-4 w-48 lg:w-72">
              <motion.h1 className=" text-white shadow-black">
                {playerName ? playerName.slice(0, 12) : "Player"}
              </motion.h1>
            </motion.div>
          </motion.div>
          <motion.div
            className="my-8 md:mx-8 md:my-0 text-white shadow-black"
            variants={vsVariants}
            transition={{ delay: 2.5, duration: 1.5 }}
          >
            VS
          </motion.div>
          <motion.div
            className="flex flex-col self-center items-center align-middle"
            variants={opponentVariants}
            transition={{ delay: 1, duration: 1.5 }}
          >
            <motion.div className="bg-circle-bg bg-repeat bg-contain bg-center w-36 h-36 lg:w-56 lg:h-56 justify-center items-center self-center">
              <motion.img
                src={dungeonPfp ? dungeonPfp : "/img/game/pfp.png"}
                className="w-36 h-36 rounded-full p-3 pb-3.5 lg:h-56 lg:w-56 lg:p-5 lg:pb-6 lg:mt-px"
              />
            </motion.div>

            <motion.div className="bg-title bg-no-repeat bg-center bg-contain  pb-4 w-48 lg:w-72">
              <motion.h1 className=" text-white shadow-black">
                {dungeonName
                  ? `${capitalizeFirstLetter(element)} ${level}`
                  : "Opponent"}
              </motion.h1>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </Modal>
  )
}

export default DungeonMatchFoundModal
