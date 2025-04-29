import React, { useState } from "react"
import Modal from "react-modal"
import { Router } from "next/router"
import Image from "next/image"
import { set } from "@project-serum/anchor/dist/cjs/utils/features"

// Make sure to bind modal to your appElement (http://reactcommunity.org/react-modal/accessibility/)
Modal.setAppElement("#__next")

interface DungeonMapModalProps {
  isOpen: boolean
  onRequestClose: () => void
  router
  openDungeon
  setIsDungeonLevelModalOpen: (isOpen: boolean) => void
  setDungeonElement: (element: string) => void
  setDungeonPfp: (pfp: string) => void
}

const DungeonMapModal: React.FC<DungeonMapModalProps> = ({
  isOpen,
  onRequestClose,
  router,
  openDungeon,
  setIsDungeonLevelModalOpen,
  setDungeonElement,
  setDungeonPfp,
}) => {
  const customStyles = {
    content: {
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      marginRight: "-50%",
      transform: "translate(-50%, -50%)",
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
      <div className="map-selector">
        <div className="bg-map-loadout md:bg-hero h-65vh w-95vw lg:h-95vw xl:w-85vw bg-contain lg:bg-cover bg-center bg-no-repeat justify-center flex   overflow-auto">
          <div className="flex flex-col justify-evenly">
            <div className="flex gap-4 md:gap-40 lg:gap-64 xl:gap-76 md:-mb-6 md:mt-8 lg:mt-12 xl:mt-20 xl:-mb-12">
              <button
                className=" hover:opacity-80"
                onClick={(e) => {
                  e.preventDefault()
                  if (openDungeon === "Fire") {
                    setDungeonElement("fire")
                    setDungeonPfp(`/img/game/fire.png`)
                    setIsDungeonLevelModalOpen(true)
                  } else {
                    alert("This dungeon is locked!")
                  }
                }}
              >
                <Image
                  className="h-28 w-28 mt-5 xl:mt-8"
                  src="/img/game/fire.png"
                  width={225}
                  height={225}
                  alt="Fire"
                />
              </button>
              <button
                className=" hover:opacity-80"
                onClick={(e) => {
                  e.preventDefault()
                  if (openDungeon === "Ice") {
                    setDungeonElement("ice")
                    setDungeonPfp(`/img/game/ice.png`)
                    setIsDungeonLevelModalOpen(true)
                  } else {
                    alert("This dungeon is locked!")
                  }
                }}
              >
                <Image
                  className="h-28 w-28 lg:-mt-6 xl:-mt-10"
                  src="/img/game/ice.png"
                  width={225}
                  height={225}
                  alt="Ice"
                />
              </button>
              <button
                className=" hover:opacity-80"
                onClick={(e) => {
                  e.preventDefault()
                  if (openDungeon === "Wind") {
                    setDungeonElement("wind")
                    setDungeonPfp(`/img/game/wind.png`)
                    setIsDungeonLevelModalOpen(true)
                  } else {
                    alert("This dungeon is locked!")
                  }
                }}
              >
                <Image
                  className="h-28 w-28 mt-5 xl:mt-8"
                  src="/img/game/wind.png"
                  width={225}
                  height={225}
                  alt="Wind"
                />
              </button>
            </div>
            <div className="flex justify-evenly">
              <button
                className=" hover:opacity-80"
                onClick={(e) => {
                  e.preventDefault()
                  if (openDungeon === "LightDark") {
                    setDungeonElement("light")
                    setDungeonPfp(`/img/game/light.png`)
                    setIsDungeonLevelModalOpen(true)
                  } else {
                    alert("This dungeon is locked!")
                  }
                }}
              >
                <Image
                  className="h-28 w-28"
                  src="/img/game/light.png"
                  width={225}
                  height={225}
                  alt="Light"
                />
              </button>
              <button
                className=" hover:opacity-80"
                onClick={(e) => {
                  e.preventDefault()
                  if (openDungeon === "LightDark") {
                    setDungeonElement("dark")
                    setDungeonPfp(`/img/game/dark.png`)
                    setIsDungeonLevelModalOpen(true)
                  } else {
                    alert("This dungeon is locked!")
                  }
                }}
              >
                <Image
                  className="h-28 w-28"
                  src="/img/game/dark.png"
                  width={225}
                  height={225}
                  alt="Dark"
                />
              </button>
            </div>
            <div className="flex justify-center gap-4 md:gap-40 lg:gap-64 xl:gap-76 md:-mt-6 md:mb-8">
              <button
                className=" hover:opacity-80"
                onClick={(e) => {
                  e.preventDefault()
                  if (openDungeon === "Water") {
                    setDungeonElement("water")
                    setDungeonPfp(`/img/game/water.png`)
                    setIsDungeonLevelModalOpen(true)
                  } else {
                    alert("This dungeon is locked!")
                  }
                }}
              >
                <Image
                  className="h-28 w-28 lg:-mt-6 xl:-mt-10"
                  src="/img/game/water.png"
                  width={225}
                  height={225}
                  alt="Water"
                />
              </button>
              <button
                className=" hover:opacity-80"
                onClick={(e) => {
                  e.preventDefault()
                  if (openDungeon === "Lightning") {
                    setDungeonElement("lightning")
                    setDungeonPfp(`/img/game/lightning.png`)
                    setIsDungeonLevelModalOpen(true)
                  } else {
                    alert("This dungeon is locked!")
                  }
                }}
              >
                <Image
                  className="h-28 w-28 mt-5 xl:mt-8"
                  src="/img/game/lightning.png"
                  width={225}
                  height={225}
                  alt="Lightning"
                />
              </button>
              <button
                className=" hover:opacity-80"
                onClick={(e) => {
                  e.preventDefault()
                  if (openDungeon === "Earth") {
                    setDungeonElement("earth")
                    setDungeonPfp(`/img/game/earth.png`)
                    setIsDungeonLevelModalOpen(true)
                  } else {
                    alert("This dungeon is locked!")
                  }
                }}
              >
                <Image
                  className="h-28 w-28 lg:-mt-6 xl:-mt-10"
                  src="/img/game/earth.png"
                  width={225}
                  height={225}
                  alt="Earth"
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default DungeonMapModal
