import { useAnchorWallet } from "@solana/wallet-adapter-react"
import MinHeader from "../Widget/MinHeader"

import React, { useState } from "react"

import Loot from "../Widget/Loot"
import { HideIfLoading } from "../Widget/HideIfLoading"
import ModalGeneric from "../Widget/Modal"

function RecrutingBoard(props) {
  const wallet = useAnchorWallet()
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <div className="flex flex-col space-y-4">
        <div className="p-8">
          <img src={props.image} className="w-72 mx-auto" />
        </div>
        <div>
          <MinHeader className="text-4xl">{props.title}</MinHeader>
        </div>
        <div className="px-8">{props.children}</div>
        <div className="h-72 align-middle flex justify-center place-items-center shadow-lg bg-gray-700 bg-opacity-25">
          <div className="text-red-500 text-2xl font-bold p-4">
            {wallet ? (
              <>No {props.title} owned!</>
            ) : (
              <>
                <p>Please connect your wallet</p>
              </>
            )}
          </div>
        </div>
        <HideIfLoading isLoading={props.isLoading}>
          <div
            className="bg-white pt-5 pb-5 cursor-pointer hover:bg-gray-300"
            onClick={(e) => setShowModal(true)}
          >
            <MinHeader className="text-gray-800 font-bold text-2xl hover:text-gray-900">
              Recruit!
            </MinHeader>
          </div>
        </HideIfLoading>
        <HideIfLoading isLoading={!props.isLoading}>
          <div className="bg-gray-700 pt-5 pb-5 cursor-not-allowed">
            <MinHeader className="text-gray-600 font-bold text-2xl">
              Cannot recruit!
            </MinHeader>
          </div>
        </HideIfLoading>
      </div>
      <ModalGeneric showModal={showModal} setShowModal={setShowModal} />
    </>
  )
}

function Recruiting() {
  return (
    <>
      <div className="text-center w-full flex flex-col p-4 mt-10 border-4 bg-gray-900 bg-opacity-10">
        <div className="text-center">
          <MinHeader className="text-6xl mb-8">Recruiting</MinHeader>
        </div>
        <div className="grid grid-flow-row md:grid-flow-col md:space-x-4">
          <RecrutingBoard title="Lords" image={"/img/lords.png"}>
            The most noble heroes. Can recruit a new hero for <Loot>3000</Loot>{" "}
            once every 5 days
          </RecrutingBoard>
          <RecrutingBoard title="Knights" image={"/img/knights.png"}>
            Two knights can jointly recruit new heroes for <Loot>4500</Loot>{" "}
            once every 5 days
          </RecrutingBoard>
          <RecrutingBoard
            title="Soldiers"
            image={"/img/soldiers.png"}
            isLoading={true}
          >
            Essential for battles. Soldiers are fit for war and cannot recruit
            other heroes!
          </RecrutingBoard>
        </div>
        <div className="text-6xl text-center p-8 ll-font-head text-yellow-600">
          $LOOT OWNED: 0
        </div>
      </div>
    </>
  )
}

export default Recruiting
