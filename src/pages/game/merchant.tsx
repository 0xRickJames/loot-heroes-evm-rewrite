import { useCallback, useEffect, useState, useMemo } from "react"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import {
  Connection,
  Transaction,
  TransactionInstruction,
  LAMPORTS_PER_SOL,
  clusterApiUrl,
  Keypair,
  PublicKey,
} from "@solana/web3.js"
import {
  TOKEN_PROGRAM_ID,
  AccountLayout,
  createTransferInstruction,
  getOrCreateAssociatedTokenAccount,
  getAssociatedTokenAddress,
} from "@solana/spl-token"
import * as bs58 from "bs58"
import axios from "axios"
import { WalletProvider, useWallet } from "@solana/wallet-adapter-react"
import Image from "next/image"
import Modal from "react-modal"
import { InfinitySpin } from "react-loader-spinner"
import { useRouter } from "next/router"

import { fromTxError } from "../../utils/errors"

import { createUmi } from "@metaplex-foundation/umi-bundle-defaults"
import {
  CandyGuard,
  CandyMachine,
  DefaultGuardSetMintArgs,
  mplCandyMachine,
} from "@metaplex-foundation/mpl-candy-machine"
import {
  publicKey as umiPublicKey,
  some,
  unwrapOption,
} from "@metaplex-foundation/umi"
import {
  fetchCandyMachine,
  fetchCandyGuard,
} from "@metaplex-foundation/mpl-candy-machine"
import { walletAdapterIdentity as umiWalletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters"
import { mintV2 } from "@metaplex-foundation/mpl-candy-machine"
import { setComputeUnitLimit } from "@metaplex-foundation/mpl-toolbox"
import { transactionBuilder, generateSigner } from "@metaplex-foundation/umi"
import production from "src/environments/production"
import sounds from "../../utils/sounds"
import { delay } from "src/components/Game/Pvp/HeroCard"
import { ArrowLeftIcon } from "@heroicons/react/solid"

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
  const { publicKey, sendTransaction, connected, signTransaction } = useWallet()
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

  const merchantPublicKey = new PublicKey(
    "AaMBmepCxwpGsfTJtiXi1wE9xj5pNMaDizXVsyG91mK9"
  )
  const gwenAddress = process.env.NEXT_PUBLIC_GWEN_ADDRESS
  const [formMessage, setFormMessage] = useState<string | null>(null)

  const [candyMachine, setCandyMachine] = useState<CandyMachine | null>(null)
  const [candyGuard, setCandyGuard] = useState<CandyGuard | null>(null)
  const umi = createUmi(
    "https://lively-ultra-lambo.solana-mainnet.quiknode.pro/72c8ec506f45d1f495fcfe29fe00c039a322a863/"
  ).use(mplCandyMachine())
  const wallet = useWallet()
  const candyMachineId = process.env.NEXT_PUBLIC_CANDY_MACHINE_ID

  // logic for minting tournament tickets
  const fetchCandyMachineData = useCallback(async () => {
    if (!candyMachineId) throw new Error("candyMachineId not found")
    const candyMachinePublicKey = umiPublicKey(candyMachineId)
    const candyMachine = await fetchCandyMachine(umi, candyMachinePublicKey)
    const candyGuard = await fetchCandyGuard(umi, candyMachine.mintAuthority)

    setCandyMachine(candyMachine)
    setCandyGuard(candyGuard)
  }, [candyMachineId])

  // Fetch candy machine on mount
  useEffect(() => {
    fetchCandyMachineData()
  }, [fetchCandyMachineData])

  const solPaymentGuard = useMemo(() => {
    return candyGuard ? unwrapOption(candyGuard.guards.solPayment) : null
  }, [candyGuard])

  const cost = useMemo(
    () =>
      candyGuard
        ? solPaymentGuard
          ? Number(solPaymentGuard.lamports.basisPoints) / 1e9 + " SOL"
          : "Free mint"
        : "...",
    [candyGuard]
  )

  /**
   * Setup guards arguments and mint from the candy machine
   */
  const mint = async () => {
    if (!candyMachine) throw new Error("No candy machine")
    if (!candyGuard)
      throw new Error(
        "No candy guard found. Set up a guard for your candy machine."
      )

    setIsLoading(true)
    const { guards } = candyGuard

    const enabledGuardsKeys =
      guards && Object.keys(guards).filter((guardKey) => guards[guardKey])

    let mintArgs: Partial<DefaultGuardSetMintArgs> = {}

    // If there are enabled guards, set the mintArgs
    if (enabledGuardsKeys.length) {
      // Map enabled guards and set mintArgs automatically based on the fields defined in each guard
      enabledGuardsKeys.forEach((guardKey) => {
        const guardObject = unwrapOption(candyGuard.guards[guardKey])
        if (!guardObject) return null

        mintArgs = { ...mintArgs, [guardKey]: some(guardObject) }
      })
    }

    const umiWalletAdapter = umi.use(umiWalletAdapterIdentity(wallet))
    const nftMint = generateSigner(umiWalletAdapter)

    try {
      await transactionBuilder()
        .add(setComputeUnitLimit(umiWalletAdapter, { units: 800_000 }))
        .add(
          mintV2(umiWalletAdapter, {
            candyMachine: candyMachine.publicKey,
            nftMint,
            collectionMint: candyMachine.collectionMint,
            collectionUpdateAuthority: candyMachine.authority,
            tokenStandard: candyMachine.tokenStandard,
            candyGuard: candyGuard?.publicKey,
            mintArgs,
          })
        )
        .sendAndConfirm(umiWalletAdapter)

      setFormMessage("Minted successfully!")
    } catch (e: any) {
      const msg = fromTxError(e)

      if (msg) {
        setFormMessage(msg.message)
      } else {
        const msg = e.message || e.toString()
        setFormMessage(msg)
      }
    } finally {
      setIsLoading(false)

      setTimeout(() => {
        setFormMessage(null)
      }, 5000)
    }

    setIsLoading(false)
  }

  // Function to handle changes in the sell SOL input field
  const handleSolSellChange = (event) => {
    sounds.highlightButton()
    let newSolAmount = parseFloat(event.target.value)
    if (newSolAmount >= 0.01) {
      let newGwenAmount = Math.round(newSolAmount * 120 * 100) // Round to nearest hundredth
      setSolToSpend(newSolAmount)
      setGwenToBuy(newGwenAmount)
    } else {
      setSolToSpend(0.01)
      setGwenToBuy(120)
    }
  }

  // Function to handle changes in the buy GWEN input field
  const handleGwenBuyChange = (event) => {
    sounds.highlightButton()
    let newGwenAmount = parseFloat(event.target.value)
    if (newGwenAmount >= 100) {
      let newSolAmount = Math.round((newGwenAmount / 100) * 100) / 10000 // Round to nearest hundredth
      setGwenToBuy(newGwenAmount)
      setSolToSpend(newSolAmount)
    } else {
      setGwenToBuy(100)
      setSolToSpend(0.01)
    }
  }

  // Function to handle changes in the buy Energy input field
  const handleEnergyBuyChange = (event) => {
    sounds.highlightButton()
    let newEnergyAmount = parseFloat(event.target.value)
    if (newEnergyAmount >= 10) {
      let newGwenAmount = Math.round(newEnergyAmount) // Round to nearest hundredth
      setEnergyToBuy(newEnergyAmount)
      setGwenToSpend(newGwenAmount)
    } else {
      setEnergyToBuy(10)
      setGwenToSpend(10)
    }
  }

  // Function to handle changes in the sell GWEN input field
  const handleGwenSellChange = (event) => {
    sounds.highlightButton()
    let newGwenAmount = parseFloat(event.target.value)
    if (newGwenAmount >= 5) {
      let newEnergyAmount = Math.round((newGwenAmount / 5) * 100) / 10 // Round to nearest hundredth
      setGwenToSpend(newGwenAmount)
      setEnergyToBuy(newEnergyAmount)
    } else {
      setGwenToSpend(5)
      setEnergyToBuy(10)
    }
  }

  const fetchPlayerData = useCallback(async () => {
    if (publicKey) {
      try {
        const response = await fetch(
          `/api/profiles?publicKey=${publicKey.toString()}`
        )
        const data = await response.json()
        console.log("Data: ", data)
        setEnergy(data.energy)

        console.log("Energy: ", energy)
      } catch (error) {
        console.error("Error fetching player data:", error)
      }
    }
  }, [publicKey])
  useEffect(() => {
    fetchPlayerData()
  }, [fetchPlayerData])

  async function getSolBalance(publicKey: PublicKey) {
    const balance = await connection.getBalance(publicKey)
    setSol(balance / LAMPORTS_PER_SOL)
    return balance / LAMPORTS_PER_SOL
  }

  async function getSPLTokenBalance(ownerAddress: PublicKey): Promise<number> {
    const connection = new Connection(
      "https://lively-ultra-lambo.solana-mainnet.quiknode.pro/72c8ec506f45d1f495fcfe29fe00c039a322a863/"
    )
    const tokenAccounts = await connection.getTokenAccountsByOwner(
      ownerAddress,
      {
        programId: TOKEN_PROGRAM_ID,
      }
    )
    const tokenMintAddress = new PublicKey(gwenAddress)
    let balance = 0
    for (const tokenAccount of tokenAccounts.value) {
      const accountInfo = await connection.getAccountInfo(tokenAccount.pubkey)
      if (accountInfo && accountInfo.data) {
        const parsedAccountData = AccountLayout.decode(accountInfo.data)
        if (parsedAccountData.mint.equals(tokenMintAddress)) {
          balance +=
            Number(parsedAccountData.amount.toString()) / Math.pow(10, 2)
        }
      }
    }
    setGwen(balance)
    return balance
  }

  const refillEnergy = async (publicKey: string, energyAmount: number) => {
    try {
      const response = await axios.put(
        `/api/energy-refill?publicKey=${publicKey}&energyAmount=${energyAmount}`
      )
    } catch (error) {
      console.error(error) // Handle any errors that occur during the API call
    }
  }

  useEffect(() => {
    setConnection(
      new Connection(
        "https://lively-ultra-lambo.solana-mainnet.quiknode.pro/72c8ec506f45d1f495fcfe29fe00c039a322a863/"
      )
    )
    if (publicKey) {
      //getSolBalance(publicKey).then((balance) =>
      //  console.log("User's SOL balance: ", balance)
      //)
      getSPLTokenBalance(publicKey)
        .then((balance) => console.log("User's GWEN balance: ", balance))
        .catch((error) =>
          console.error("Error retrieving GWEN balance: ", error)
        )
    }
  }, [publicKey])

  const handleSolTransaction = async (
    solAmount: number,
    splTokenAmount: number
  ) => {
    setIsLoading(true)
    setError(null)
    setPurchasedItemName(`${splTokenAmount} GWEN`)
    setPurchasedItemCost(`${solAmount} SOL`)

    try {
      console.log("Starting transaction with amount TO merchant: ", solAmount)
      if (!publicKey || !connection) {
        console.log("No public key or connection available")
        setIsLoading(false)
        return
      }

      const mintPublicKey = new PublicKey(gwenAddress)

      const gwenRawTx: { data: Buffer } = await (
        await fetch("/api/createBuyGwenTransaction", {
          method: "POST",
          body: JSON.stringify({
            solAmount,
            publicKey: publicKey.toString(),
          }),
          headers: {
            "Content-Type": "application/json",
          },
        })
      ).json()
      console.log("parse response")
      // Parse the response
      const tx = Transaction.from(gwenRawTx.data)
      console.log("add feepayer")
      tx.feePayer = publicKey
      console.log("Sign tx")
      const signed = await signTransaction(tx)
      console.log("send tx")
      const txId = await connection.sendRawTransaction(signed.serialize(), {
        // skipPreflight: true,
      })

      console.log(txId)

      await connection.confirmTransaction(txId, "confirmed")
      getSolBalance(publicKey).then((balance) =>
        console.log("User's SOL balance: ", balance)
      )
      getSPLTokenBalance(publicKey)
        .then((balance) => console.log("User's GWEN balance: ", balance))
        .catch((error) =>
          console.error("Error retrieving GWEN balance: ", error)
        )
      setIsLoading(false)
      setIsMerchantPurchaseFinishedOpen(true)
      return txId
    } catch (err) {
      console.error(err)
      setError(err.message)
      setIsLoading(false)
      setIsMercantPurchaseFailedOpen(true)
    }
  }

  async function getNumberDecimals(mintAddress: string): Promise<number> {
    const info = await connection.getParsedAccountInfo(
      new PublicKey(gwenAddress)
    )
    const result = (info.value?.data).parsed.info.decimals as number
    return result
  }

  async function handleGwenTransaction(
    gwenAmount: number,
    energyAmount: number
  ) {
    setIsLoading(true)
    setError(null)
    setPurchasedItemName(`${energyAmount} Energy`)
    setPurchasedItemCost(`${gwenAmount} GWEN`)
    console.log(
      `Sending ${gwenAmount} ${gwenAddress} from ${publicKey.toString()} to ${merchantPublicKey}.`
    )
    try {
      console.log("Starting transaction with amount TO merchant: ", gwenAmount)
      if (!publicKey || !connection) {
        console.log("No public key or connection available")
        setIsLoading(false)
        return
      }

      let userGwenAccount = await getAssociatedTokenAddress(
        new PublicKey(gwenAddress),
        new PublicKey(publicKey)
      )
      let merchantGwenAccount = await getAssociatedTokenAddress(
        new PublicKey(gwenAddress),
        new PublicKey(merchantPublicKey)
      )
      // Create a new transaction
      const transaction = new Transaction()

      // Set the recent blockhash
      transaction.recentBlockhash = (
        await connection.getLatestBlockhash()
      ).blockhash

      // Set the fee payer
      transaction.feePayer = new PublicKey(publicKey)

      transaction.add(
        createTransferInstruction(
          userGwenAccount,
          merchantGwenAccount,
          new PublicKey(publicKey),
          gwenAmount * Math.pow(10, 2)
        )
      )

      // Send the transaction
      const tx = await sendTransaction(transaction, connection)
      console.log(
        "\x1b[32m", //Green Text
        `   Transaction Success!🎉`,
        `\n    https://explorer.solana.com/tx/${tx}?cluster=mainnet`
      )
      console.log(tx)
      fetch("/api/confirmBuyEnergyTransaction", {
        method: "POST",
        body: JSON.stringify({
          tx,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      })

      fetchPlayerData()
      getSolBalance(publicKey).then((balance) =>
        console.log("User's SOL balance: ", balance)
      )
      getSPLTokenBalance(publicKey)
        .then((balance) => console.log("User's GWEN balance: ", balance))
        .catch((error) =>
          console.error("Error retrieving GWEN balance: ", error)
        )

      setIsLoading(false)
      setIsMerchantPurchaseFinishedOpen(true)
    } catch (err) {
      console.error(err)
      setIsLoading(false)
      setError(err.message)
      setIsMercantPurchaseFailedOpen(true)
    }
  }

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
            <WalletMultiButton
              style={{
                alignSelf: "stretch",
                flex: 1,
              }}
            >
              {!publicKey ? "Connect" : truncateString(publicKey.toString())}
            </WalletMultiButton>
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
                    setSolToSpend(0.01)
                    setGwenToBuy(100)
                    setIsBuyGwenModalOpen(true)
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
                    setEnergyToBuy(10)
                    setGwenToSpend(10)
                    setIsBuyEnergyModalOpen(true)
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
                  disabled={!publicKey || isLoading}
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
                onChange={handleGwenBuyChange}
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
                onChange={handleSolSellChange}
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
                handleSolTransaction(solToSpend, gwenToBuy)
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
                onChange={handleEnergyBuyChange}
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
                onChange={handleGwenSellChange}
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
                handleGwenTransaction(gwenToSpend, energyToBuy)
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
