import { defaultDeck } from "./defaultDeck"
import { Card } from "./interfaces"
import metadataJson from "../assets/metadatas.json"
import { Connection, clusterApiUrl } from "@solana/web3.js"
import base from "src/environments/base"

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

interface BaseHero {
  leftAttack: number
  topAttack: number
  rightAttack: number
  bottomAttack: number
  element: string
  type: string
}

const baseHeroes: Record<string, BaseHero> = {
  Archangel: {
    leftAttack: 4,
    topAttack: 2,
    rightAttack: 2,
    bottomAttack: 4,
    element: "light",
    type: "melee",
  },
  "Demon Hunter": {
    leftAttack: 2,
    topAttack: 4,
    rightAttack: 3,
    bottomAttack: 5,
    element: "lightning",
    type: "ranged",
  },
  Druid: {
    leftAttack: 4,
    topAttack: 3,
    rightAttack: 3,
    bottomAttack: 3,
    element: "earth",
    type: "magic",
  },
  Necromancer: {
    leftAttack: 3,
    topAttack: 2,
    rightAttack: 5,
    bottomAttack: 3,
    element: "dark",
    type: "magic",
  },
  Assassin: {
    leftAttack: 5,
    topAttack: 1,
    rightAttack: 1,
    bottomAttack: 3,
    element: "wind",
    type: "melee",
  },
  Barbarian: {
    leftAttack: 3,
    topAttack: 2,
    rightAttack: 3,
    bottomAttack: 3,
    element: "fire",
    type: "melee",
  },
  Bard: {
    leftAttack: 1,
    topAttack: 1,
    rightAttack: 4,
    bottomAttack: 3,
    element: "earth",
    type: "ranged",
  },
  Cleric: {
    leftAttack: 3,
    topAttack: 3,
    rightAttack: 1,
    bottomAttack: 2,
    element: "ice",
    type: "magic",
  },
  Justicar: {
    leftAttack: 3,
    topAttack: 3,
    rightAttack: 1,
    bottomAttack: 2,
    element: "fire",
    type: "melee",
  },
  Pirate: {
    leftAttack: 4,
    topAttack: 1,
    rightAttack: 2,
    bottomAttack: 2,
    element: "water",
    type: "ranged",
  },
  Shaman: {
    leftAttack: 1,
    topAttack: 4,
    rightAttack: 2,
    bottomAttack: 2,
    element: "lightning",
    type: "magic",
  },
  Amazon: {
    leftAttack: 1,
    topAttack: 3,
    rightAttack: 2,
    bottomAttack: 3,
    element: "earth",
    type: "melee",
  },
  Battlemage: {
    leftAttack: 2,
    topAttack: 3,
    rightAttack: 2,
    bottomAttack: 1,
    element: "ice",
    type: "melee",
  },
  Gladiator: {
    leftAttack: 2,
    topAttack: 2,
    rightAttack: 3,
    bottomAttack: 1,
    element: "wind",
    type: "melee",
  },
  Monk: {
    leftAttack: 3,
    topAttack: 1,
    rightAttack: 1,
    bottomAttack: 3,
    element: "water",
    type: "melee",
  },
  Ranger: {
    leftAttack: 1,
    topAttack: 1,
    rightAttack: 2,
    bottomAttack: 4,
    element: "fire",
    type: "ranged",
  },
  Samurai: {
    leftAttack: 2,
    topAttack: 1,
    rightAttack: 2,
    bottomAttack: 4,
    element: "lightning",
    type: "melee",
  },
  Sharpshooter: {
    leftAttack: 3,
    topAttack: 1,
    rightAttack: 3,
    bottomAttack: 1,
    element: "ice",
    type: "ranged",
  },
  Warrior: {
    leftAttack: 2,
    topAttack: 2,
    rightAttack: 2,
    bottomAttack: 2,
    element: "wind",
    type: "melee",
  },
  Wizard: {
    leftAttack: 2,
    topAttack: 3,
    rightAttack: 1,
    bottomAttack: 2,
    element: "water",
    type: "magic",
  },
}

type HeroMetadata = {
  creators: { address: string; share: number; verified: boolean }[]
  name: string
  seller_fee_basis_points: number
  symbol: string
  uri: string
  mint: string
}

function findMintByHeroNumber(
  heroes: HeroMetadata[],
  heroNumber: string
): string | undefined {
  const hero = heroes.find((h) => {
    const match = h.name.match(/Loot Hero #(\d+)/)
    return match ? match[1] === heroNumber : false
  })

  return hero ? hero.mint : undefined
}

export default async function createCardFromMetadata(id: any): Promise<any> {
  let nftId,
    title,
    starRating,
    lootScore,
    helm,
    shoulder,
    neck,
    hands,
    legs,
    ring,
    weapon,
    chest,
    className,
    classId,
    topAttack,
    rightAttack,
    bottomAttack,
    leftAttack,
    type,
    baseElement,
    hasEpicSet

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
        return "earth"
      } else if (gear.includes("Gale")) {
        return "wind"
      } else if (gear.includes("Molten")) {
        return "fire"
      } else if (gear.includes("Charged")) {
        return "lightning"
      } else if (gear.includes("Celestial")) {
        return "light"
      } else if (gear.includes("Chaotic")) {
        return "dark"
      } else if (gear.includes("Frigid")) {
        return "ice"
      } else if (gear.includes("Tidal")) {
        return "water"
      }
    }
    return "none"
  }

  function getAllGear() {
    return [helm, neck, shoulder, chest, hands, legs, weapon, ring]
  }
  if (id > 1150) {
    const card = defaultDeck.find((card) => card.id === id)
    if (card) return card
  } else {
    console.log("Old id", id)
  }
}
