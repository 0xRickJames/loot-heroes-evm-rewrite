import React, { use, useCallback, useEffect, useState } from "react"
import GameHeader from "src/components/Game/Header"
import Link from "next/link"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import Tippy from "@tippyjs/react"
import { followCursor } from "tippy.js"
import { Transaction } from "@solana/web3.js"

import { LoadoutElement } from "./heroes/[nftId]/[mint]"
import {
  LegendaryLootItem,
  LegendaryLootItemSlot,
} from "src/library/legendaryloot.interface"
import { LootHeroesNft } from "../api/gears"
import gear from "src/assets/gear.json"
import gearSets from "src/assets/sets.json"
import { ExternalMetaplexNft } from "src/library/metaplex.interface"
import { ItemTooltip } from "src/components/Game/Widget/Tooltip"
import { Loading } from "src/components/Widget/Loading"
import { NewButton } from "src/components/NewButton"
import Modal from "react-modal"
import { InfinitySpin } from "react-loader-spinner"
import sounds from "../../utils/sounds"
import { backButton } from "../../utils/sounds"
import Image from "next/image"
import fullGear from "src/assets/fullGear.json"

type Props = {}

export default function Inventory(props: Props) {
  const [isFilterGearModalOpen, setIsFilterGearModalOpen] = useState(false)
  const [isFilterHeroModalOpen, setIsFilterHeroModalOpen] = useState(false)
  const { address, signTransaction } = useWallet()
  const { connection } = useConnection()
  const [selectedHeroNft, setSelectedHeroNft] = useState<LootHeroesNft>(null)
  const [selectedHeroNftData, setSelectedHeroNftData] =
    useState<ReturnType<typeof getParsedHeroNftAttributes>>(null)
  const [selectedHeroNftGears, setSelectedHeroNftGears] =
    useState<Map<LegendaryLootItemSlot, LegendaryLootItem>>(null)
  const [selectedGears, setSelectedGears] = useState<LegendaryLootItem[]>([])
  const [isEquipping, setIsEquipping] = useState(false)
  const [isGearEquippingSuccessful, setIsGearEquippingSuccessful] =
    useState(false)
  const [gearError, setGearError] = useState(null)
  const [gearMessage, setGearMessage] = useState(null)

  // Sound variables
  const [soundsEnabled, setSoundsEnabled] = useState(false)
  const handleToggleSounds = () => {
    sounds.toggleSounds()

    sounds.buttonClick()
    const storedValue = localStorage.getItem("soundsEnabled")
    setSoundsEnabled(storedValue === "true")
  }

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
  const equippingModalStyles = {
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
      width: "95vw", // Occupy 95% of the viewport width
      height: "95vh", // Occupy 95% of the viewport height
    },
    overlay: {
      backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
  }
  const handleUpdateSelectedHeroNft = useCallback(
    (heroNft: LootHeroesNft) => {
      setSelectedHeroNft(heroNft)
      const heroData = getParsedHeroNftAttributes(heroNft)
      setSelectedHeroNftData(heroData)
      const heroGears = getHeroNftGears(heroNft)
      setSelectedHeroNftGears(heroGears)
    },
    [setSelectedHeroNftData, setSelectedHeroNft, setSelectedHeroNftGears]
  )

  const fetchRetry = async (url, options, retries = 3): Promise<Response> => {
    const response = await fetch(url, options)
    if (!response.ok) {
      if (retries > 0 && response.status === 504) {
        return new Promise((resolve, reject) => {
          setTimeout(async () => {
            try {
              const retryResponse = await fetchRetry(url, options, retries - 1)
              resolve(retryResponse)
            } catch (err) {
              reject(err)
            }
          }, 500)
        })
      }
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return response
  }
  // fetch sound state
  useEffect(() => {
    const storedValue = localStorage.getItem("soundsEnabled")
    setSoundsEnabled(storedValue === "true")
  }, [])
  // Reset filters on mount

  // Function to filter NFTs by name
  function filterNftsByName(nfts: LootHeroesNft[], name: string) {
    return nfts.filter((nft) => {
      return nft.name.includes(name)
    })
  }

  // Functions for Gear parsing
  function getGearRanking(gear) {
    if (gear && gear.includes("Epic")) {
      return 2
    } else if (gear && gear.includes("Rare")) {
      return 1
    } else {
      return 0
    }
  }
  function isEpic(gear) {
    return getGearRanking(gear) === 2
  }

  function getGearElement(gear) {
    if (gear) {
      if (gear.includes("Gaia")) {
        return "Earth"
      } else if (gear.includes("Gale")) {
        return "Wind"
      } else if (gear.includes("Molten")) {
        return "Fire"
      } else if (gear.includes("Charged")) {
        return "Lightning"
      } else if (gear.includes("Celestial")) {
        return "Light"
      } else if (gear.includes("Chaotic")) {
        return "Dark"
      } else if (gear.includes("Frigid")) {
        return "Ice"
      } else if (gear.includes("Tidal")) {
        return "Water"
      }
    }
    return "none"
  }

  // Filter selector variables

  const gearTraitOptions = [
    {
      type: "Element",
      values: [
        "Light",
        "Dark",
        "Fire",
        "Ice",
        "Wind",
        "Earth",
        "Lightning",
        "Water",
      ],
    },
    {
      type: "Slot",
      values: [
        "Helm",
        "Neck",
        "Chest",
        "Legs",
        "Hands",
        "Ring",
        "Weapon",
        "Shoulders",
      ],
    },
    { type: "Rarity", values: ["Epic", "Rare"] },
  ]

  const [gearTraitType, setGearTraitType] = useState(gearTraitOptions[0].type)
  const [gearTraitValue, setGearTraitValue] = useState(
    gearTraitOptions[0].values[0]
  )

  const handleGearTraitTypeChange = (e) => {
    const selectedType = e.target.value

    // Set Trait Type
    setGearTraitType(selectedType)

    // Set Trait Value to the first value of the selected Trait Type
    const firstValueOfSelectedType = gearTraitOptions.find(
      (option) => option.type === selectedType
    ).values[0]
    setGearTraitValue(firstValueOfSelectedType)
  }
  const heroTraitOptions = [
    {
      type: "Attack Type",
      values: ["Melee", "Ranged", "Magic"],
    },
    {
      type: "Star Rating",
      values: ["1", "2", "3"],
    },
    {
      type: "Element",
      values: [
        "Light",
        "Dark",
        "Fire",
        "Ice",
        "Wind",
        "Earth",
        "Lightning",
        "Water",
      ],
    },
    { type: "Title", values: ["Lord", "Knight", "Soldier"] },
  ]

  const [heroTraitType, setHeroTraitType] = useState(heroTraitOptions[0].type)
  const [heroTraitValue, setHeroTraitValue] = useState(
    heroTraitOptions[0].values[0]
  )

  const handleHeroTraitTypeChange = (e) => {
    const selectedType = e.target.value

    // Set Trait Type
    setHeroTraitType(selectedType)

    // Set Trait Value to the first value of the selected Trait Type
    const firstValueOfSelectedType = heroTraitOptions.find(
      (option) => option.type === selectedType
    ).values[0]
    setHeroTraitValue(firstValueOfSelectedType)
  }

  return (
    <div className="page-container">
      <GameHeader />
      <main>
        <header>
          <Link
            onMouseOver={sounds.highlightButton}
            onClick={sounds.backButton}
            title="Return"
            href="/game"
          >
            {"<"}{" "}
          </Link>
          <span>/</span>
          <h2>Inventory</h2>
          <button
            onMouseOver={sounds.highlightButton}
            onClick={() => {
              handleToggleSounds()
            }}
          >
            <Image
              className={`h-12 w-12 mx-1`}
              src={`/img/Wooden_UI/${soundsEnabled ? "volume" : "mute"}.png`}
              width={225}
              height={225}
              alt="Sound"
            />
          </button>
        </header>

        <p>Please, wait.</p>
      </main>
      <style jsx>{`
        :global(.hero__items button) {
          position: absolute;
          left: 0;
          bottom: -15px;
          right: 0;
          opacity: 1;
          background: rgba(60, 60, 60, 1) !important;
        }
        .hero__info-details-line span {
          color: #789773;
        }
        .hero__info-details-line {
          display: flex;
          justify-content: space-between;
          color: #ddd;
          font-family: carta-marina;
          font-size: 20px;
          font-weight: lighter;
        }
        .hero__info-details {
          display: flex;
          flex-direction: column;
          align-items: stretch;
          align-self: stretch;
        }
        header a {
          font-size: 18px;
        }
        header {
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: carta-marina, sans-serif;
        }
        .decks .heroes-list {
          height: auto;
        }
        .decks-list__item.add {
          color: rgba(255, 255, 255, 0.6);
          font-family: carta-marina, sans-serif;

          font-style: normal;
          font-weight: 400;
          line-height: normal;
          background: #36383d;
        }
        .decks-list__item:hover {
          box-shadow: 0px 0px 16px 0px #55575c inset;
          border: 1px solid #55575c;
        }
        .decks-list__item.active,
        .gears__list-item.active {
          border: 1px solid #8e6b22;
          box-shadow: 0px 0px 16px 0px #8e6b22 inset;
        }
        .decks-list__item {
          display: flex;
          width: 48px;
          height: 48px;
          border: 1px solid #55575c;
          box-shadow: 0px 0px 16px 0px transparent inset;
          align-items: center;
          justify-content: center;
          font-family: carta-marina, sans-serif;
        }
        .decks-list {
          display: flex;
          justify-content: center;
          align-items: flex-start;
          gap: 4px;
          align-self: stretch;
        }
        .heroes-list__item:hover::before {
          box-shadow: 0px 0px 16px 0px #55575c inset;
        }
        .heroes-list__item:hover {
          border: 1px solid #55575c;
        }
        .heroes-list__item.active {
          border: 1px solid #e1e7f5;
        }
        .heroes-list__item.active::before {
          box-shadow: 0px 0px 16px 0px #e1e7f5 inset;
        }
        .heroes-list__item::before {
          content: "";
          display: block;
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
        }
        .heroes-list__item {
          border: 1px solid transparent;
          position: relative;
          border-radius: 4px;
          width: 139px;
          height: 139px;
        }
        .heroes-list {
          display: flex;
          align-items: flex-start;
          align-content: flex-start;
          gap: 8px;
          flex-wrap: wrap;
          height: 580px;
          overflow-y: auto;
        }
        .hero,
        .gears,
        .heroes,
        .decks {
          display: flex;
          padding: 16px;
          flex-direction: column;
          align-items: flex-start;
          gap: 12px;
          flex: 1;
          align-self: stretch;
          border: 1px solid #55575c;
          background: rgba(60, 60, 60, 0.7);
        }
        .hero-gears,
        .heroes-decks {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 12px;
          align-self: stretch;
          flex: 1 0 0;
        }
        .gears__list-item img {
          align-self: stretch;
        }
        .gears__list-item {
          display: flex;
          width: 62px;
          height: 62px;
          padding: 8px;
          align-items: center;
          justify-content: center;
          border: 1px solid #55575c;
          background: #262424;
        }
        .gears__list {
          display: flex;
          align-items: flex-start;
          align-content: flex-start;
          align-self: stretch;
          flex-wrap: wrap;
          max-height: 546px;
          overflow-y: auto;
        }

        hr {
          display: flex;
          margin: 4px 0;
          align-items: flex-start;
          gap: 10px;
          align-self: stretch;
          border-color: #454649;
        }
        .hero-gears .gears {
          align-self: stretch;
        }
        .hero .divider {
          display: flex;
          border-top: 1px solid #55575c;
          margin: 8px 16px;
          align-self: stretch;
        }
        .hero__items {
          flex: 1;
          display: flex;
          align-items: center;
          align-self: stretch;
        }
        h3 {
          color: #fff;
          font-family: carta-marina;
          font-size: 32px;
          font-style: normal;
          font-weight: 400;
          line-height: normal;
        }
        .hero__info {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 12px;
          flex: 1;
        }

        main {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 12px;
          flex: 1;
        }
        h2 {
          color: #fff;
          font-family: carta-marina, sans-serif;
          font-size: 32px;
          font-weight: 400;
        }
        .page-container {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          max-width: 1366px;
          margin: 0 auto;
          padding: 0 16px 32px 16px;
          gap: 24px;
        }

        @media (min-width: 1024px) {
          main {
            padding: 22px 32px 32px 32px;
            border: 1px solid #55575c;
            background: rgba(60, 60, 60, 0.7);
          }
          .hero-gears .gears {
            max-width: 352px;
          }
          .hero .divider {
            border-left: 1px solid #55575c;
            margin: 16px 8px;
          }
          .hero-gears,
          .heroes-decks {
            flex-direction: row;
          }
          .hero {
            flex-direction: row;
          }
        }
      `}</style>
      <Modal isOpen={gearError} style={modalStyles}>
        <div className="flex flex-col items-center">
          <h2 className="text-2xl font-bold shadow-black m-3">
            Gear Equipping Failed
          </h2>
          <p>{gearError}</p>
          <button
            onMouseOver={() => {
              sounds.highlightButton()
            }}
            className="m-2 border border-gray-800 rounded-md p-1 bg-gray-500"
            onClick={() => {
              sounds.buttonClick()
              setGearError(null)
            }}
          >
            Close
          </button>
        </div>
      </Modal>
      <Modal isOpen={isGearEquippingSuccessful} style={modalStyles}>
        <div className="flex flex-col items-center">
          <h2 className="text-2xl font-bold shadow-black m-3">
            Gear Equipped!
          </h2>
          <button
            onMouseOver={() => {
              sounds.highlightButton()
            }}
            className="m-2 border border-gray-800 rounded-md p-1 bg-gray-500"
            onClick={() => {
              sounds.buttonClick()
              setIsGearEquippingSuccessful(false)
            }}
          >
            Close
          </button>
        </div>
      </Modal>
      <Modal isOpen={isEquipping} style={modalStyles}>
        <div className="flex flex-col items-center">
          <h2 className="shadow-black">Equipping Gear</h2>
          <p>{gearMessage}</p>
          <InfinitySpin color="white" />
        </div>
      </Modal>
      <Modal isOpen={isFilterGearModalOpen} style={modalStyles}>
        <div className="flex flex-col items-center">
          <h2 className="text-2xl font-bold m-3 shadow-black">Filter Gears</h2>
          <label className="m-2 text-lg font-bold">Trait Type</label>
          <select
            value={gearTraitType}
            onChange={(e) => {
              setGearTraitType(e.target.value)
              handleGearTraitTypeChange(e)
            }}
          >
            {gearTraitOptions.map((option) => (
              <option key={option.type} value={option.type}>
                {option.type}
              </option>
            ))}
          </select>

          <label className="m-2 text-lg font-bold">Trait Value</label>
          <select
            value={gearTraitValue}
            onChange={(e) => setGearTraitValue(e.target.value)}
          >
            {gearTraitOptions
              .find((option) => option.type === gearTraitType)
              .values.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
          </select>

          <div className="mt-6">
            <button
              onMouseOver={() => {
                sounds.highlightButton()
              }}
              className="m-2 border border-gray-800 rounded-md p-1 bg-gray-500"
              onClick={() => {
                sounds.buttonClick()
                console.log(
                  gearTraitType.toLowerCase(),
                  gearTraitValue.toLowerCase()
                )
                const filteredNfts = filterGearNftsByTrait(
                  gearTraitType.toLowerCase(),
                  gearTraitValue.toLowerCase()
                )
                setFilteredGearNfts(filteredNfts)
                setIsFilterGearModalOpen(false)
              }}
            >
              Filter
            </button>
            <button
              onMouseOver={() => {
                sounds.highlightButton()
              }}
              className="m-2 border border-gray-800 rounded-md p-1 bg-gray-500"
              onClick={() => {
                sounds.buttonClick()
                resetGearFilters()
                setIsFilterGearModalOpen(false)
              }}
            >
              Reset
            </button>
            <button
              onMouseOver={() => {
                sounds.highlightButton()
              }}
              className="m-2 border border-gray-800 rounded-md p-1 bg-gray-500"
              onClick={() => {
                backButton()
                setIsFilterGearModalOpen(false)
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
      <Modal isOpen={isFilterHeroModalOpen} style={modalStyles}>
        <div className="flex flex-col items-center">
          <h2 className="text-2xl font-bold m-3 shadow-black">Filter Heros</h2>
          <label className="m-2 text-lg font-bold">Trait Type</label>
          <select
            value={heroTraitType}
            onChange={(e) => {
              setHeroTraitType(e.target.value)
              handleHeroTraitTypeChange(e)
            }}
          >
            {heroTraitOptions.map((option) => (
              <option key={option.type} value={option.type}>
                {option.type}
              </option>
            ))}
          </select>

          <label className="m-2 text-lg font-bold">Trait Value</label>
          <select
            value={heroTraitValue}
            onChange={(e) => setHeroTraitValue(e.target.value)}
          >
            {heroTraitOptions
              .find((option) => option.type === heroTraitType)
              .values.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
          </select>

          <div className="mt-6">
            <button
              onMouseOver={() => {
                sounds.highlightButton()
              }}
              className="m-2 border border-gray-800 rounded-md p-1 bg-gray-500"
              onClick={() => {
                sounds.buttonClick()
                console.log(heroTraitType, heroTraitValue)
                const filteredNfts = filterHeroNftsByTrait(
                  heroTraitType,
                  heroTraitValue
                )
                setFilteredHeroNfts(filteredNfts)
                setIsFilterHeroModalOpen(false)
              }}
            >
              Filter
            </button>
            <button
              onMouseOver={() => {
                sounds.highlightButton()
              }}
              className="m-2 border border-gray-800 rounded-md p-1 bg-gray-500"
              onClick={() => {
                sounds.buttonClick()
                resetHeroFilters()
                setIsFilterHeroModalOpen(false)
              }}
            >
              Reset
            </button>
            <button
              onMouseOver={() => {
                sounds.highlightButton()
              }}
              className="m-2 border border-gray-800 rounded-md p-1 bg-gray-500"
              onClick={() => {
                backButton()
                setIsFilterHeroModalOpen(false)
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

/**
 * Parses the hero NFT attributes
 * @param heroNft The hero NFT to parse
 * @returns An object with the parsed attributes
 */
function getParsedHeroNftAttributes(heroNft: LootHeroesNft) {
  const classId = heroNft.json.internalAttributes?.find(
    (attr) => attr.trait_type === "classID"
  )?.value

  const className = heroNft.json.internalAttributes?.find(
    (attr) => attr.trait_type === "className"
  )?.value

  const heroRarity = heroNft.json.internalAttributes?.find(
    (attr) => attr.trait_type === "heroRarity"
  )?.value

  const lootScore = heroNft.json.attributes?.find(
    (attr) => attr.trait_type === "Loot Score"
  )?.value

  const starRating = heroNft.json.attributes?.find(
    (attr) => attr.trait_type === "Star Rating"
  )?.value

  const attackType = heroNft.json.attributes?.find(
    (attr) => attr.trait_type === "Attack Type"
  )?.value

  const nftId = heroNft.json.attributes?.find(
    (attr) => attr.trait_type === "NFT ID"
  )?.value

  return {
    classId,
    className,
    heroRarity,
    lootScore,
    starRating,
    attackType,
    nftId,
  }
}

/**
 * Gets the hero NFT gears from the hero NFT metadata
 * @param heroNft The hero NFT to parse
 * @returns A map with the gears
 */
function getHeroNftGears(heroNft: LootHeroesNft) {
  const slots = heroNft.json.internalAttributes.filter((a) =>
    a.trait_type.includes("slot_")
  )

  const gears = slots
    .map((metadataJsonAttribute) => {
      const item = getLegendaryLootItemFromGearId(metadataJsonAttribute.value)

      return item
    })
    .reduce<Map<LegendaryLootItemSlot, LegendaryLootItem>>((map, item) => {
      if (!item) {
        return map
      }

      map.set(item.getSlot(), item)
      return map
    }, new Map())

  return gears
}

function getLegendaryLootItemFromGearNft(gearNft: LootHeroesNft) {
  const itemId = gearNft.json.internalAttributes?.find(
    (attr) => attr.trait_type === "itemID"
  )?.value

  if (!itemId) return null

  const item = getLegendaryLootItemFromGearId(itemId, gearNft)
  return item
}

function getLegendaryLootItemFromGearId(
  itemId: string,
  gearNft?: LootHeroesNft
) {
  const dbItem = gear.find((i) => i.itemID === itemId)
  const set = gearSets.find((g) => g.setID === dbItem?.set)

  const item = new LegendaryLootItem({
    amount: 1,
    externalMetadata: {
      name: dbItem.name,
      image: dbItem.image,
      internalAttributes: [
        { trait_type: "itemID", value: dbItem.itemID },
        { trait_type: "rarity", value: dbItem.rarity },
        { trait_type: "slot", value: dbItem.slot },
        { trait_type: "set", value: dbItem.set },
        { trait_type: "element", value: dbItem.element },
        { trait_type: "lootScore", value: dbItem.lootScore.toString() },
      ],
    },
    mint: gearNft?.mint.address,
    address: gearNft?.address,
  } as ExternalMetaplexNft)

  item.set = set

  return item
}
