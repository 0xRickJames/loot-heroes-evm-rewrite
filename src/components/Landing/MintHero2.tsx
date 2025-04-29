import { useAnchorWallet } from "@solana/wallet-adapter-react"
import MinHeader from "../Widget/MinHeader"

import React from "react"

function MintHero2() {
  const wallet = useAnchorWallet()

  return (
    <>
      <div className="text-center w-full flex flex-col border-4 border-white mt-10 p-8">
        <div className="text-center">
          <MinHeader className="text-4xl md:text-6xl mb-8">
            Mint Heroes into Looterra
          </MinHeader>
          <img
            src={"/img/models/angel.png"}
            className="inline-block md:hidden"
          />
        </div>
        <div className="flex">
          <div className="w-1/5 hidden md:inline-block">
            <img src={"/img/models/angel.png"} className="object-right" />
          </div>
          <div className="flex flex-col w-full md:w-3/5 text-left">
            <div className="flex flex-col md:flex-row border-4 p-2 text-center">
              <div className="flex-1 flex flex-col border-b-4 md:border-b-0 md:border-r-4">
                <p>Genesis</p>
                <p>1150/1150 1.6 SOL</p>
              </div>
              <div className="flex-1 flex flex-col border-b-4 md:border-b-0 md:border-r-4">
                <p>Recruits</p>
                <p>0/XXXXX $LOOT</p>
              </div>
              <div className="flex-1 flex flex-col">
                <p>Alpha</p>
                <p>0/XXXX SOL</p>
              </div>
            </div>
            <div className="text-center p-8">
              {wallet ? (
                <>
                  <p>
                    Connected wallet:{" "}
                    <strong>{wallet.publicKey.toBase58()}</strong>
                  </p>
                </>
              ) : (
                <></>
              )}
            </div>
          </div>
          <div className="w-1/5 hidden md:inline-block">
            <img src={"/img/models/mage_base.png"} className="ml-auto" />
          </div>
        </div>
        <div>
          <img
            src={"/img/models/mage_base.png"}
            className="inline-block md:hidden"
          />
          <div className="font-bold mt-8 bg-gradient-to-r from-yellow-800 via-gray-800 to-yellow-800 p-2 rounded-xl shadow-lg text-2xl">
            1150/1150 Genesis Minted
          </div>
        </div>
      </div>
    </>
  )
}

export default MintHero2
