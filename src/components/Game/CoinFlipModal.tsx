import React, { useState } from "react"
import Modal from "react-modal"
import NavButton from "../Widget/NavButton"
import InteractiveButton from "../Widget/InteractiveButton"
import { AnimatePresence, motion, useAnimation } from "framer-motion"

Modal.setAppElement("#__next")

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

interface CoinFlipModalProps {
  isOpen
  onClose
  isRedFirst: boolean
}

const CoinFlipModal: React.FC<CoinFlipModalProps> = ({
  isOpen,
  onClose,
  isRedFirst,
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
      backgroundColor: "rgba(0, 0, 0, 0)",
    },
  }
  const modalVariants = {
    open: { opacity: 1 },
    closed: { opacity: 0 },
  }

  const redCoin = "/img/Wooden_UI/red_coin.png.png"
  const blueCoin = "/img/Wooden_UI/blue_coin.png"

  const [flipping, setFlipping] = useState(null)

  React.useEffect(() => {
    for (let i = 0; i < 6; i++) {
      delay(150).then(() => {
        setFlipping(true)
      })
      delay(300).then(() => {
        setFlipping(false)
      })
      delay(450).then(() => {
        setFlipping(true)
      })
      delay(600).then(() => {
        setFlipping(false)
      })
      delay(750).then(() => {
        setFlipping(true)
      })
      delay(900).then(() => {
        setFlipping(false)
      })
      delay(1050).then(() => {
        setFlipping(true)
      })
      delay(1200).then(() => {
        setFlipping(false)
      })
      delay(1350).then(() => {
        setFlipping(true)
      })
      delay(1500).then(() => {
        setFlipping(false)
      })
      delay(1650).then(() => {
        setFlipping(null)
      })
    }
  }, [isRedFirst])

  const coinFlipVariants = {
    start: { rotateX: 0 },
    end: { rotateX: 180 },
  }

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      style={customStyles}
      className="flex flex-col justify-center items-center h-75vh w-75vw align-middle absolute top-10"
    >
      <motion.div
        className="flex flex-col"
        initial="closed"
        animate={isOpen ? "open" : "closed"}
        variants={modalVariants}
      >
        <motion.div className="flex flex-col md:flex-row text-xl md:text-3xl font-carta-marina self-center items-center align-middle text-center">
          <AnimatePresence>
            {flipping && (
              <motion.img
                src={isRedFirst ? blueCoin : redCoin}
                alt="Blue Coin"
                initial="start"
                animate="end"
                variants={coinFlipVariants}
                transition={{ duration: 0.5 }}
              />
            )}
            {!flipping && (
              <motion.img
                src={isRedFirst ? redCoin : blueCoin}
                alt={isRedFirst ? "Red Coin" : "Blue Coin"}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              />
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </Modal>
  )
}

export default CoinFlipModal
