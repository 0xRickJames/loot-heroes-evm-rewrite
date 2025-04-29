import Marquee from "react-fast-marquee"

import MinHeader from "../Widget/MinHeader"
import React, { useState } from "react"
import ModalGeneric from "../Widget/Modal"

function GearV2() {
  const [showModal, setShowModal] = useState(false)
  return (
    <>
      <div className="text-center p-8 border-4 mt-8">
        <MinHeader className="text-6xl">Gear</MinHeader>
        <div className="text-2xl">
          Heroes need gear to improve their skills in battle. View your gear
          here.
        </div>
        <Marquee
          className="main-bg-drop bg-bg2 content mt-10 inline-flex"
          id="ll-content-gear"
          gradientColor={[38, 38, 38]}
        >
          <img src={"/img/flame_axe.png"} className="h-36" alt={""} />
          <img src={"/img/icearmor_pauldron.png"} className="h-36" alt={""} />
          <img src={"/img/flame_gaunlet.png"} className="h-36" alt={""} />
          <img src={"/img/icearmor_chest.png"} className="h-36" alt={""} />
          <img src={"/img/flame_helmet.png"} className="h-36" alt={""} />
          <img src={"/img/flame_pauldron.png"} className="h-36" alt={""} />
          <img src={"/img/icearmor_ring.png"} className="h-36" alt={""} />
          <img src={"/img/flame_ring.png"} className="h-36" alt={""} />
          <img src={"/img/flame_boots.png"} className="h-36" alt={""} />
          <img src={"/img/icearmor_spear.png"} className="h-36" alt={""} />
          <img src={"/img/icearmor_boots.png"} className="h-36" alt={""} />
          <img src={"/img/flame_breastplate.png"} className="h-36" alt={""} />
          <img src={"/img/icearmor_arm.png"} className="h-36" alt={""} />
          <img src={"/img/icearmor_helmet.png"} className="h-36" alt={""} />
        </Marquee>
        <div
          className="bg-white pt-2 pb-2 cursor-pointer hover:bg-gray-300 px-8 md:px-32 inline-block text-4xl mt-8"
          onClick={(e) => setShowModal(true)}
        >
          <MinHeader className="text-gray-800 hover:text-gray-900 uppercase">
            Manage Gear
          </MinHeader>
        </div>
      </div>
      <ModalGeneric showModal={showModal} setShowModal={setShowModal} />
    </>
  )
}

export default GearV2
