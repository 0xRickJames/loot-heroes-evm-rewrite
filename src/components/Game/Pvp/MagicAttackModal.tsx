import React, { useState } from "react"
import Modal from "react-modal"
import { meleeAttack, rangedAttack } from "./HeroCard"
import { highlightButton, backButton, buttonClick } from "../../../utils/sounds"
import { button } from "@material-tailwind/react"

// Make sure to bind modal to your appElement (http://reactcommunity.org/react-modal/accessibility/)
Modal.setAppElement("#__next")

interface MagicAttackModalProps {
  isOpen: boolean
  onRequestClose: (isRanged: string) => void
}

const MagicAttackModal: React.FC<MagicAttackModalProps> = ({
  isOpen,
  onRequestClose,
}) => {
  const [isMagicAttackRanged, setMagicAttackRanged] = useState<string>("melee")
  const [isCancelled, setIsCancelled] = useState<boolean>(false)

  const handleMeleeClick = () => {
    setMagicAttackRanged("melee")
    onRequestClose("melee")
  }

  const handleRangedClick = () => {
    setMagicAttackRanged("ranged")
    onRequestClose("ranged")
  }

  const handleCancelClick = () => {
    setMagicAttackRanged("cancelled")
    onRequestClose("cancelled")
  }

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
    },
    overlay: {
      backgroundColor: "rgba(0, 0, 0, 0.75)",
    },
  }

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={() => onRequestClose(isMagicAttackRanged)}
      style={customStyles}
    >
      <h2 className="text-center">Select Attack Type</h2>
      <button
        onMouseOver={() => {
          highlightButton()
        }}
        onClick={() => {
          buttonClick()
          handleMeleeClick()
        }}
      >
        <img src={meleeAttack} alt="Melee" width="100" />
      </button>
      <button
        onMouseOver={() => {
          highlightButton()
        }}
        onClick={() => {
          buttonClick()
          handleRangedClick()
        }}
      >
        <img src={rangedAttack} alt="Ranged" width="100" />
      </button>
      <button
        onMouseOver={() => {
          highlightButton()
        }}
        onClick={() => {
          backButton()
          handleCancelClick()
        }}
      >
        <img src="/img/Wooden_UI/close.png" alt="Cancel" width="100" />
      </button>
    </Modal>
  )
}

export default MagicAttackModal
