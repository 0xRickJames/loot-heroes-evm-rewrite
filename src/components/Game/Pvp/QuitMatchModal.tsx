import React, { useState } from "react"
import Modal from "react-modal"
import { meleeAttack, rangedAttack } from "./HeroCard"
import { Router } from "next/router"
import {
  buttonClick,
  highlightButton,
  backButton,
  closedDungeonClick,
} from "../../../utils/sounds"

// Make sure to bind modal to your appElement (http://reactcommunity.org/react-modal/accessibility/)
Modal.setAppElement("#__next")

interface QuitMatchModalProps {
  isOpen: boolean
  onRequestClose: () => void
  router
}

const QuitMatchModal: React.FC<QuitMatchModalProps> = ({
  isOpen,
  onRequestClose,
  router,
}) => {
  const customStyles = {
    content: {
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      marginRight: "-50%",
      transform: "translate(-50%, -50%)",
      backgroundImage: "url(/img/Wooden_UI/bg_01_02_side.png)",
      backgroundSize: "contain",
      backgroundRepeat: "no-repeat",
      backgroundPosition: "center",
      color: "black",
      backgroundColor: "rgba(0, 0, 0, 0)",
      border: "none",
    },
    overlay: {
      backgroundColor: "rgba(0, 0, 0, 0.75)",
    },
  }

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      style={customStyles}
      router={router}
    >
      <div className="flex flex-col font-carta justify-center text-2xl lg:text-4xl lg:m-4">
        <div className="text-center bg-plank-12-bg bg-center bg-no-repeat bg-contain px-10 pt-2 lg:px-20 lg:py-3 text-white shadow-black ">
          <h2 className="">Forfeit</h2>
        </div>
        <h2 className="text-white shadow-black text-center flex self-center my-3">
          Are you sure?
        </h2>
        <div className="flex justify-evenly ">
          <button
            onMouseOver={() => {
              highlightButton()
            }}
            className="bg-plank-17 bg-center bg-contain bg-no-repeat px-5 py-1 lg:px-10 lg:py-2 text-center"
            onClick={(e) => {
              e.preventDefault()
              buttonClick()
              router.reload()
            }}
          >
            <p className="mt-1">✅</p>
          </button>
          <button
            onMouseOver={() => {
              highlightButton()
            }}
            className="bg-plank-18 bg-center bg-contain bg-no-repeat px-5 py-1 lg:px-10 lg:py-2 text-center"
            onClick={() => {
              backButton()
              onRequestClose()
            }}
          >
            <p className="mt-1">❌</p>
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default QuitMatchModal
