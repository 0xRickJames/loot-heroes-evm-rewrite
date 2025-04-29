import { defaultDeck } from "./defaultDeck"
import { Card } from "./interfaces"
import metadataJson from "../assets/metadatas.json"
import { Metaplex, PublicKey } from "@metaplex-foundation/js"
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
    const heroeMetadata: HeroMetadata[] = metadataJson
    await delay(100)
    const mint = new PublicKey(findMintByHeroNumber(heroeMetadata, id))

    const baseHero = baseHeroes[className]
    topAttack = baseHero.topAttack
    rightAttack = baseHero.rightAttack
    bottomAttack = baseHero.bottomAttack
    leftAttack = baseHero.leftAttack
    type = baseHero.type
    baseElement = baseHero.element

    let gearSets = [
      { gear1: weapon, gear2: ring, direction: "left" },
      { gear1: helm, gear2: neck, direction: "top" },
      { gear1: shoulder, gear2: hands, direction: "right" },
      { gear1: chest, gear2: legs, direction: "bottom" },
    ]

    let highestRanking = 0
    let highestElement = baseElement
    let attackValues = { left: 0, top: 0, right: 0, bottom: 0 }

    for (let set of gearSets) {
      if (getGearElement(set.gear1) === getGearElement(set.gear2)) {
        let ranking = Math.min(
          getGearRanking(set.gear1),
          getGearRanking(set.gear2)
        )
        attackValues[set.direction] += ranking
        if (ranking > highestRanking) {
          highestRanking = ranking
          highestElement = getGearElement(set.gear1)
        }
      }
    }

    let abilities = {
      earth: "earthquake",
      wind: "tornado",
      fire: "blaze",
      ice: "blizzard",
      lightning: "thunderstorm",
      water: "downpour",
      dark: "abyss",
      light: "aura",
    }

    let allGear = getAllGear()
    let allElements = allGear.map(getGearElement)
    let allSameElement = allElements.every(
      (element) => element === allElements[0]
    )

    const specialAbility2 = allSameElement ? abilities[allElements[0]] : "none"
    const hasEpicSet = getAllGear().every(isEpic)

    let firstChar = className.charAt(0).toLowerCase()
    let restOfString = className.slice(1)
    classId = firstChar + restOfString + title
    let classIdNoSpaces = classId.replace(/ /g, "")

    const card: Card = {
      mint: mint.toString(),
      id: nftId,
      starRating: starRating,
      lootScore: Number(lootScore),
      sprite: `https://metadata-lootheroes-rose.vercel.app/common/hero/${classIdNoSpaces}-square.png`,
      type: type,
      topAttack: Number(topAttack) + attackValues["top"],
      rightAttack: Number(rightAttack) + attackValues["right"],
      bottomAttack: Number(bottomAttack) + attackValues["bottom"],
      leftAttack: Number(leftAttack) + attackValues["left"],
      element: highestElement,
      specialAbility1:
        className === "Pirate" || className === "Archangel"
          ? "magic-resist"
          : className === "Gladiator" || className === "Justicar"
          ? "sturdy"
          : "none",
      specialAbility2: specialAbility2,
      hasEpicSet: hasEpicSet,
      helm: helm,
      shoulder: shoulder,
      neck: neck,
      hands: hands,
      legs: legs,
      ring: ring,
      weapon: weapon,
      chest: chest,
      topAttackBoost: attackValues["top"],
      rightAttackBoost: attackValues["right"],
      bottomAttackBoost: attackValues["bottom"],
      leftAttackBoost: attackValues["left"],
    }
    return card
  }
}
