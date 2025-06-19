import { useCallback, useEffect, useState, useMemo } from "react"
import axios from "axios"
import Image from "next/image"
import Modal from "react-modal"
import { InfinitySpin } from "react-loader-spinner"
import { useRouter } from "next/router"

import { useContext } from "react"
import { EvmWalletContext } from "src/contexts/EvmWalletContext"

import sounds from "../../utils/sounds"

function truncateString(input: string): string {
  if (input.length <= 8) {
    return input
  }

  const firstPart = input.substring(0, 4)
  const lastPart = input.substring(input.length - 4)

  return `${firstPart}...${lastPart}`
}

export default function Home() {
  const [connection, setConnection] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [energy, setEnergy] = useState(0)
  const [gwen, setGwen] = useState(0)
  const [sol, setSol] = useState(0)
  const [isMerchantPurchaseFinishedOpen, setIsMerchantPurchaseFinishedOpen] =
    useState(false)
  const [isMerchantPurchaseFailedOpen, setIsMercantPurchaseFailedOpen] =
    useState(false)
  const [isBuyGwenModalOpen, setIsBuyGwenModalOpen] = useState(false)
  const [isBuyEnergyModalOpen, setIsBuyEnergyModalOpen] = useState(false)
  const [purchasedItemName, setPurchasedItemName] = useState("name")
  const [purchasedItemCost, setPurchasedItemCost] = useState("cost")
  const [solToSpend, setSolToSpend] = useState(0)
  const [gwenToBuy, setGwenToBuy] = useState(0)
  const [energyToBuy, setEnergyToBuy] = useState(0)
  const [gwenToSpend, setGwenToSpend] = useState(0)

  const modalStyles = {
    content: {
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      marginRight: "-50%",
      transform: "translate(-50%, -50%)",
      backgroundColor: "grey",
      color: "black",
      position: "absolute",
    },
    overlay: {
      backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
  }

  const wallet = useContext(EvmWalletContext)
  const address: string = wallet?.address?.toString()

  const fetchPlayerData = useCallback(async () => {
    if (address) {
      try {
        const response = await fetch(
          `/api/profiles?address=${address.toString()}`
        )
        const data = await response.json()
        console.log("Data: ", data)
        setEnergy(data.energy)

        console.log("Energy: ", energy)
      } catch (error) {
        console.error("Error fetching player data:", error)
      }
    }
  }, [address])
  useEffect(() => {
    fetchPlayerData()
  }, [fetchPlayerData])

  // sound variables
  const [soundsEnabled, setSoundsEnabled] = useState(false)
  const handleToggleSounds = () => {
    sounds.toggleSounds()

    sounds.buttonClick()
    const storedValue = localStorage.getItem("soundsEnabled")
    setSoundsEnabled(storedValue === "true")
  }
  // fetch sound state

  useEffect(() => {
    const storedValue = localStorage.getItem("soundsEnabled")
    setSoundsEnabled(storedValue === "true")
  }, [])

  return (
    <div className="bg-merchant-bg bg-cover bg-center bg-no-repeat h-screen w-screen">
      {
        <div className="container mx-auto px-4">
          <div className="flex justify-end pt-1 xl:pt-3">
            <button
              onMouseOver={sounds.highlightButton}
              onClick={() => {
                handleToggleSounds()
              }}
            >
              <Image
                className={`h-14 w-14 mx-3`}
                src={`/img/Wooden_UI/${soundsEnabled ? "volume" : "mute"}.png`}
                width={225}
                height={225}
                alt="Sound"
              />
            </button>
          </div>
          <div className="flex flex-col justify-center bg-plank-12-bg bg-contain shadow-black h-20 bg-no-repeat bg-center text-5xl font-bold mb-8 text-center">
            <p className="-mb-3">Merchant</p>
          </div>

          <div className="bg-bg1 xl:bg-book bg-no-repeat bg-contain bg-stretch bg-center flex flex-col xl:flex-row xl:justify-center xl:gap-16 py-8 xl:py-16 justify-center">
            <div className="flex flex-col font-carta-marina mb-24">
              <div className="flex flex-col mt-4">
                <div className="bg-circle-bg bg-center bg-no-repeat bg-cover w-32 h-32 xl:hidden m-auto mt-6 mb-12">
                  <img
                    className="rounded-full w-28 h-28 xl:w-28  xl:h-28 m-auto mt-2 p-1.5"
                    src={
                      "https://cdn.discordapp.com/attachments/1140068149648179210/1187802314338226216/Merchant_test_1.webp?ex=65b3e59c&is=65a1709c&hm=e796268cbd17a4bd29b60192b0eca81be9b7b2b24328faad03a4316d314a54a3&"
                    }
                  />
                </div>
              </div>
              <div className="align-middle bg-board-frame bg-center bg-no-repeat bg-contain flex flex-col w-72 h-72 self-center justify-center text-white py-7 xl:mt-20">
                <div className="flex items-center self-center justify-center gap-3">
                  <p className=" border px-1">{`${gwen} 💰 GWEN`}</p>
                  <p className="border px-1">{`${energy} ⚡ Energy`}</p>
                </div>
                <button
                  onMouseOver={() => {
                    sounds.highlightButton()
                  }}
                  className="bg-plank-07 bg-contain bg-no-repeat bg-center w-60 h-16 self-center text-center"
                  onClick={() => {
                    sounds.buttonClick()
                  }}
                >
                  <p className="font-carta shadow-black text-2xl">{`Buy GWEN`}</p>
                </button>
                <button
                  disabled={false}
                  onMouseOver={() => {
                    sounds.highlightButton()
                  }}
                  className="bg-plank-07 bg-contain bg-no-repeat bg-center w-60 h-16 self-center text-center"
                  onClick={() => {
                    sounds.buttonClick()
                  }}
                >
                  <p className="font-carta shadow-black text-2xl">{`Buy Energy`}</p>
                </button>
                {/*}
                <button
                  onMouseOver={() => {
                    sounds.highlightButton()
                  }}
                  className="bg-plank-07 bg-contain bg-no-repeat bg-center w-60 h-16 self-center text-center opacity-50"
                  disabled={!address || isLoading}
                  onClick={() => {
                    sounds.buttonClick()
                    mint()
                  }}
                >
                  <p className="font-carta shadow-black text-2xl">
                    {isLoading ? "Minting your Ticket..." : "Mint Ticket"}
                  </p>
                </button>
                */}
                <button
                  onMouseOver={() => {
                    sounds.highlightButton()
                  }}
                  className="bg-plank-07 bg-contain bg-no-repeat bg-center w-60 h-16 self-center text-center"
                  onClick={() => {
                    sounds.backButton()
                    window.location.href = "/game/"
                  }}
                >
                  <p className="font-carta shadow-black text-2xl">{`Go Back`}</p>
                </button>
              </div>
            </div>
            <div className="xl:mt-8 h-48 w-48 xl:h-80 xl:w-80 hidden xl:flex xl:flex-col font-carta-marina self-center mb-40 ml-1 pl-5 ">
              <div className="ml-2">
                <Image
                  src="/img/merchant.png"
                  alt="Merchant"
                  width={353}
                  height={474}
                />
              </div>
            </div>
          </div>
        </div>
      }
      <Modal isOpen={isLoading} style={modalStyles}>
        <div className="flex flex-col items-center">
          <h2 className="text-2xl font-bold text-white shadow-black m-3">
            Transaction in progress...
          </h2>
          <p>
            Attempting to purchase {purchasedItemName} for {purchasedItemCost}
          </p>
          <InfinitySpin color="black" />
        </div>
      </Modal>
      <Modal isOpen={isMerchantPurchaseFailedOpen} style={modalStyles}>
        <div className="flex flex-col items-center">
          <h2 className="text-2xl font-bold text-red-500 shadow-black m-3">
            Purchase Failed!
          </h2>
          <p>{error}</p>
          <button
            onMouseOver={() => {
              sounds.highlightButton()
            }}
            className="m-2 border border-gray-800 rounded-md p-1 bg-gray-500"
            onClick={() => {
              sounds.buttonClick()
              setIsMercantPurchaseFailedOpen(false)
            }}
          >
            Close
          </button>
        </div>
      </Modal>
      <Modal isOpen={isMerchantPurchaseFinishedOpen} style={modalStyles}>
        <div className="flex flex-col items-center">
          <h2 className="text-4xl font-bold text-yellow-300 shadow-black m-3">
            Purchase Success!
          </h2>
          <p className=" text-xl font-carta text-white shadow-black">
            You have purchased:
          </p>
          <p>
            {purchasedItemName} for {purchasedItemCost}.
          </p>
          <p>
            {purchasedItemName.includes("Energy")
              ? "Energy may take up to 30 seconds to be received"
              : ""}
          </p>
          <button
            onMouseOver={() => {
              sounds.highlightButton()
            }}
            className="m-2 border border-gray-800 rounded-md p-1 bg-gray-500"
            onClick={() => {
              sounds.buttonClick()
              setIsMerchantPurchaseFinishedOpen(false)
            }}
          >
            Close
          </button>
        </div>
      </Modal>
      <Modal isOpen={isBuyGwenModalOpen} style={modalStyles}>
        <div className="flex flex-col items-center gap-2">
          <h2 className="text-4xl font-bold m-3 text-yellow-300 shadow-black">
            Buy GWEN
          </h2>
          <div className="border rounded flex flex-col items-center">
            <label className="font-carta text-white shadow-black m-1 text-xl font-bold">
              Receive
            </label>
            <div className="flex">
              <input
                className="w-16 m-2 text-center"
                type="number"
                step="100"
                value={gwenToBuy}
              />
              <p className="font-carta text-white shadow-black text-xl m-2">
                GWEN
              </p>
            </div>
          </div>
          <div className="border rounded flex flex-col items-center">
            <label className="font-carta text-white shadow-black m-1 text-xl font-bold">
              Spend
            </label>
            <div className="flex">
              <input
                className="w-16 m-2 ml-5 text-center"
                type="number"
                step="0.01"
                value={solToSpend}
              />
              <p className="font-carta text-white shadow-black text-xl m-2 mr-5">
                SOL
              </p>
            </div>
          </div>

          <div className="mt-6">
            <button
              onMouseOver={() => {
                sounds.highlightButton()
              }}
              className="text-2xl font-carta text-white shadow-black m-2 border border-gray-800 rounded-md px-3 p-1 bg-yellow-400"
              onClick={() => {
                sounds.buttonClick()
                setIsBuyGwenModalOpen(false)
              }}
            >
              Purchase
            </button>
            <button
              onMouseOver={() => {
                sounds.highlightButton()
              }}
              className="text-2xl font-carta text-white shadow-black m-2 border border-gray-800 rounded-md px-3 p-1 bg-gray-500"
              onClick={() => {
                sounds.backButton()
                setIsBuyGwenModalOpen(false)
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
      <Modal isOpen={isBuyEnergyModalOpen} style={modalStyles}>
        <div className="flex flex-col items-center gap-2">
          <h2 className="text-4xl font-bold m-3 text-yellow-300 shadow-black">
            Buy Energy
          </h2>
          <div className="border rounded flex flex-col items-center">
            <label className="font-carta text-white shadow-black m-1 text-xl font-bold">
              Receive
            </label>
            <div className="flex">
              <input
                className="w-16 m-2 text-center"
                type="number"
                step="10"
                value={energyToBuy}
              />
              <p className="font-carta text-white shadow-black text-xl m-2">
                Energy
              </p>
            </div>
          </div>
          <div className="border rounded flex flex-col items-center">
            <label className="font-carta text-white shadow-black m-1 text-xl font-bold">
              Spend
            </label>
            <div className="flex">
              <input
                className="w-16 m-2 ml-3 text-center"
                type="number"
                step="10"
                value={gwenToSpend}
              />
              <p className="font-carta text-white shadow-black text-xl m-2 mr-3">
                GWEN
              </p>
            </div>
          </div>

          <div className="mt-6">
            <button
              onMouseOver={() => {
                sounds.highlightButton()
              }}
              className="text-2xl font-carta text-white shadow-black m-2 border border-gray-800 rounded-md px-3 p-1 bg-yellow-400"
              onClick={() => {
                sounds.buttonClick()
                setIsBuyEnergyModalOpen(false)
              }}
            >
              Purchase
            </button>
            <button
              onMouseOver={() => {
                sounds.highlightButton()
              }}
              className="text-2xl font-carta text-white shadow-black m-2 border border-gray-800 rounded-md px-3 p-1 bg-gray-500"
              onClick={() => {
                sounds.backButton()
                setIsBuyEnergyModalOpen(false)
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
