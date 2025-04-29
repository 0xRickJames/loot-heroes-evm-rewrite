import MinHeader from "../Widget/MinHeader"
import React, { useState } from "react"

import ModalGeneric from "../Widget/Modal"

function Gameplay() {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <div className="text-center p-8 border-4 mt-8">
        <MinHeader className="text-6xl">Gameplay</MinHeader>
        <div className="text-2xl">
          Beat dungeons around Looterra with your heroes to claim the gear and
          $LOOT that awaits.
        </div>
        <div>
          <div className="mt-10 px-4">
            <div className="relative xl:px-0 inline-block grid">
              <img
                src={"/img/gameboard.png"}
                className="border-4 border-black rounded-sm"
                alt={""}
              />
            </div>
          </div>
        </div>
        <div
          className="bg-white pt-2 pb-2 cursor-pointer hover:bg-gray-300 px-8 md:px-32 inline-block text-4xl mt-8"
          onClick={(e) => setShowModal(true)}
        >
          <MinHeader className="text-gray-800 hover:text-gray-900 uppercase">
            Challenge Dungeons
          </MinHeader>
        </div>
      </div>
      <ModalGeneric showModal={showModal} setShowModal={setShowModal} />
    </>
  )
}

export default Gameplay
