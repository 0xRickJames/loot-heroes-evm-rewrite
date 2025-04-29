import React, { CSSProperties, useRef } from "react"
import { BoardCard } from "src/hooks/usePvpGame"
import { Card } from "src/utils/interfaces"
import { useDrag } from "react-dnd"
import { AnimatePresence, motion } from "framer-motion"
import Modal from "react-modal"
import { capitalize } from "@mui/material"
import InteractiveButton from "src/components/Widget/InteractiveButton"
import { useRouter } from "next/router"
import createCardFromMetadata from "src/utils/createCardFromMetadata"
import { getEmptyImage } from "react-dnd-html5-backend"
import { AttackAnimationData } from "./Match"
import { set } from "@project-serum/anchor/dist/cjs/utils/features"
import card from "@material-tailwind/react/theme/components/card"
import sounds from "../../../utils/sounds"

export async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// Blank image
const noThing = "/img/pvp/hero_card/noThing.png"
// Info icon
const infoIcon = "/img/pvp/hero_card/info.png"
// Star icon
const starIcon = "/img/pvp/hero_card/star_icon.png"
// Attack type icons
export const meleeAttack = "/img/pvp/hero_card/sword.png"
export const rangedAttack = "/img/pvp/hero_card/Ranged.png"
const magicAttack = "/img/pvp/hero_card/Magic.png"
// Special ability icons
const sturdyAbility = "/img/pvp/hero_card/Sturdy_1.png"
const magicResistAbility = "/img/pvp/hero_card/MagicResist.png"
// Element icons
const lightElement = "/img/pvp/hero_card/light.png"
const darkElement = "/img/pvp/hero_card/Dark.png"
const lightningElement = "/img/pvp/hero_card/Lightning.png"
const fireElement = "/img/pvp/hero_card/Fire.png"
const waterElement = "/img/pvp/hero_card/Water.png"
const iceElement = "/img/pvp/hero_card/Ice.png"
const windElement = "/img/pvp/hero_card/Gale.png"
const earthElement = "/img/pvp/hero_card/Earth.png"
// Area of Effect ability icons
const aoeEarthquke = "/img/pvp/hero_card/Earthquake.png"
const aoeTornado = "/img/pvp/hero_card/Tornado.png"
const aoeBlaze = "/img/pvp/hero_card/Blaze.png"
const aoeBlizzard = "/img/pvp/hero_card/Blizzard.png"
const aoeThunderstorm = "/img/pvp/hero_card/Thunderstorm.png"
const aoeDownpour = "/img/pvp/hero_card/Downpour.png"
const aoeAura = "/img/pvp/hero_card/Aura.png"
const aoeAbyss = "/img/pvp/hero_card/Abyss.png"
// Animation variables
// Define the magic orb animation variants
const magicOrbVariants = {
  hidden: {
    scale: 0,
    opacity: 0,
    x: 0,
    y: 0,
  },
  attack: (
    direction: string,
    attackType: string,
    isMagicAttackRanged: boolean
  ) => {
    const distance = getDistance(attackType, isMagicAttackRanged)
    const motionProps = {
      x:
        direction === "right"
          ? distance
          : direction === "left"
          ? `-${distance}`
          : 0,
      y:
        direction === "bottom"
          ? distance
          : direction === "top"
          ? `-${distance}`
          : 0,
      scale: [0.4, 0.9, 0.4],
      opacity: [1, 1, 0],
      transition: { duration: 1, times: [0, 0.8, 1] }, // Adjust timing as needed
    }
    return motionProps
  },
}
const attackImages = {
  melee: "/img/game/sword.png",
  ranged: "/img/game/bow.png",
  magic: {
    fire: "/img/game/fire-orb.png",
    water: "/img/game/water-orb.png",
    wind: "/img/game/wind-orb.png",
    earth: "/img/game/earth-orb.png",
    lightning: "/img/game/lightning-orb.png",
    ice: "/img/game/ice-orb.png",
    dark: "/img/game/dark-orb.png",
    light: "/img/game/light-orb.png",
  },
}

function getDistance(attackType: string, isMagicAttackRanged: boolean) {
  if (attackType === "melee") {
    return "100%"
  } else if (
    attackType === "ranged" ||
    (attackType === "magic" && isMagicAttackRanged)
  ) {
    return "200%"
  } else {
    return "100%"
  }
}

// Component to render the magic orb
const MagicOrbAnimation = ({
  direction,
  attackType,
  attackElement,
  isMagicAttackRanged,
}: {
  direction: string
  attackType: string
  attackElement: string
  isMagicAttackRanged: boolean
}) => {
  // Determine the correct image path
  let imagePath = attackImages[attackType]
  if (attackType === "magic") {
    imagePath = attackImages.magic[attackElement]
  }

  return (
    <motion.img
      className="absolute z-50"
      src={imagePath}
      custom={direction}
      variants={{
        ...magicOrbVariants,
        attack: (direction: string) =>
          magicOrbVariants.attack(direction, attackType, isMagicAttackRanged),
      }}
      initial="hidden"
      animate="attack"
      exit="hidden"
    />
  )
}

interface HeroCardProps {
  card: Card
  boardCard?: BoardCard
  previousTurnBoardCard?: BoardCard
  // additional styles
  style?: CSSProperties
  size?: "xsmall" | "small" | "medium"
  attackAnimationData: AttackAnimationData | null
}

function HeroCard(props: HeroCardProps) {
  const [data, setData] = React.useState(null)

  const [attackDirection, setAttackDirection] = React.useState<string[] | null>(
    null
  )

  // Build card data from metadata

  React.useEffect(() => {
    if ((props.card.id as unknown as number) > 1150) {
      return
    } else if ((props.card.id as unknown as number) < 1150) {
      createCardFromMetadata(props.card.id).then((card) => {
        setData(card)
      })
    } else {
      setData(props.card)
    }
  }, [])

  // State variables for hero card

  const [starRating, setStarRating] = React.useState("1")
  const [lootScore, setLootScore] = React.useState("200")
  const [helm, setHelm] = React.useState("None")
  const [shoulder, setShoulder] = React.useState("None")
  const [neck, setNeck] = React.useState("None")
  const [hands, setHands] = React.useState("None")
  const [legs, setLegs] = React.useState("None")
  const [ring, setRing] = React.useState("None")
  const [weapon, setWeapon] = React.useState("None")
  const [chest, setChest] = React.useState("None")
  const [topAttackBoost, setTopAttackBoost] = React.useState(0)
  const [rightAttackBoost, setRightAttackBoost] = React.useState(0)
  const [bottomAttackBoost, setBottomAttackBoost] = React.useState(0)
  const [leftAttackBoost, setLeftAttackBoost] = React.useState(0)

  // Set state variables for hero card

  React.useEffect(() => {
    if (data) {
      setStarRating(data.starRating)
      setLootScore(data.lootScore)
      setHelm(data.helm)
      setShoulder(data.shoulder)
      setNeck(data.neck)
      setHands(data.hands)
      setLegs(data.legs)
      setRing(data.ring)
      setWeapon(data.weapon)
      setChest(data.chest)
      setTopAttackBoost(data.topAttackBoost)
      setRightAttackBoost(data.rightAttackBoost)
      setBottomAttackBoost(data.bottomAttackBoost)
      setLeftAttackBoost(data.leftAttackBoost)
    }
  }, [data])

  // Set and log attack data whenever it updates
  React.useEffect(() => {
    if (props.attackAnimationData && typeof window !== "undefined") {
      if (
        props.attackAnimationData.attacker === props.card.id &&
        props.boardCard
      ) {
        // Log the attackAnimationData
        console.log(`Attacker: ${props.attackAnimationData.attacker}`)
        console.log(`Attack Type: ${props.attackAnimationData.attackType}`)
        props.attackAnimationData.attackedSides.forEach((side) => {
          console.log(`Attacked Side: ${side}`)
        })
        console.log(`Element: ${props.attackAnimationData.attackElement}`)
        console.log(
          `isMagicAttackRanged: ${props.attackAnimationData.isMagicAttackRanged}`
        )

        setAttackDirection(props.attackAnimationData.attackedSides)

        // Reset the animation after it completes
        const timeoutId = setTimeout(() => {
          setAttackDirection(null)
        }, 1000 * props.attackAnimationData.attackedSides.length) // Duration should match the animation duration
        return () => clearTimeout(timeoutId)
      }
    }
  }, [props.attackAnimationData])

  // Check for boosted stats

  const showBoostedStats =
    topAttackBoost > 0 ||
    rightAttackBoost > 0 ||
    bottomAttackBoost > 0 ||
    leftAttackBoost > 0

  // Check for special abilities

  const showResist =
    props.card.specialAbility1 === "sturdy" ||
    props.card.specialAbility1 === "magic-resist"

  // Check for area of effect abilities

  const showAoe =
    props.card.specialAbility2 === "earthquake" ||
    props.card.specialAbility2 === "tornado" ||
    props.card.specialAbility2 === "blaze" ||
    props.card.specialAbility2 === "blizzard" ||
    props.card.specialAbility2 === "thunderstorm" ||
    props.card.specialAbility2 === "downpour" ||
    props.card.specialAbility2 === "aura" ||
    props.card.specialAbility2 === "abyss"

  // Get hero class and rank based on sprite url
  const splitSpriteUrl = props.card.sprite.split("/")
  const spriteUrlEnd = splitSpriteUrl[splitSpriteUrl.length - 1]
  const splitUrlEnd = spriteUrlEnd.split("-")
  const classAndRank =
    splitUrlEnd[0] === "demonHunterLord"
      ? ["demonHunter", "Lord"]
      : splitUrlEnd[0] === "demonHunterKnight"
      ? ["demonHunter", "Knight"]
      : splitUrlEnd[0] === "demonHunterSoldier"
      ? ["demonHunter", "Soldier"]
      : splitUrlEnd[0].split(/(?=[A-Z])/)
  const heroClass = classAndRank[0]
  const heroRank = classAndRank[1]

  // Modal state variables and styles

  const [isOpen, setIsOpen] = React.useState(false)
  const openModal = () => {
    setIsOpen(true)
  }
  const closeModal = () => {
    setIsOpen(false)
  }

  // Set card data from props
  const {
    card: {
      sprite,
      element,
      type,
      topAttack,
      rightAttack,
      bottomAttack,
      leftAttack,
      specialAbility1,
      specialAbility2,
    },
    boardCard,
    previousTurnBoardCard,
    style,
    size = "medium",
  } = props
  const isSmall = props.size === "small"
  const isXSmall = props.size === "xsmall"

  // Drag functionality

  const [{ isDragging, item }, drag, preview] = useDrag(
    () => ({
      type: "card",
      item: () => {
        return {
          id: props.card.id,
          card: props.card,
          bgColor: style.backgroundColor,
        }
      },
      collect: (monitor) => ({
        isDragging: !!monitor.isDragging(),
        item: monitor.getItem(),
      }),
    }),
    [props.card.id, style?.backgroundColor]
  )

  React.useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true })
  }, [preview])

  // Card flipping animation

  const [bgColor, setBgColor] = React.useState(style?.backgroundColor ?? "#000")
  const [isShowing, setIsShowing] = React.useState(true)
  const [isOnBoard, setIsOnBoard] = React.useState(false)

  React.useEffect(() => {
    if (!isOnBoard) {
      return
    }
    if (style?.backgroundColor !== bgColor && bgColor !== "#000") {
      if (typeof window !== "undefined") {
        setBgColor(style?.backgroundColor)
        setIsShowing(false)
      }
    }
  }, [props.boardCard?.color, isOnBoard])

  React.useEffect(() => {
    if (!isOnBoard) {
      return
    }
    if (!isShowing && bgColor !== "#000") {
      if (typeof window !== "undefined") {
        sounds.playCardFlip()

        const timer = setTimeout(() => {
          setIsShowing(true)
          setBgColor(style?.backgroundColor)
        }, flipTransition.duration * 1000)
        return () => clearTimeout(timer)
      }
    }
  }, [isShowing, isOnBoard])

  React.useEffect(() => {
    if (boardCard && boardCard.turnsOnBoard > 0) {
      setIsOnBoard(true)
    }
  }, [boardCard])

  const flipTransition = {
    duration: 0.15,
    ease: [0.43, 0.13, 0.23, 0.96],
  }
  const flipVariants = {
    exit: { rotateY: 180 },
    enter: { rotateY: 0 },
  }

  // Glowing buff effect animation

  const [isGlowing, setIsGlowing] = React.useState(false)

  React.useEffect(() => {
    if (props.boardCard) {
      if (
        !isGlowing &&
        props.boardCard.turnsBuffed.length > 0 &&
        typeof window !== "undefined"
      ) {
        sounds.playBuffSound()
      }
      setIsGlowing(props.boardCard.turnsBuffed.length > 0)
    }
  }, [props.boardCard?.turnsBuffed.length])

  const glowTransition = {
    duration: 0.75,
    ease: [0.43, 0.13, 0.23, 0.96],
  }

  const glowVariants = {
    exit: {
      boxShadow: `0px 0px 0px 0px ${
        element === "dark"
          ? "black"
          : element === "light"
          ? "white"
          : element === "earth"
          ? "green"
          : element === "fire"
          ? "red"
          : element === "ice"
          ? "blue"
          : element === "lightning"
          ? "yellow"
          : element === "water"
          ? "cyan"
          : element === "wind"
          ? "purple"
          : "gold"
      }`,
    },
    enter: {
      boxShadow: `1px 1px 10px 10px ${
        element === "dark"
          ? "black"
          : element === "light"
          ? "white"
          : element === "earth"
          ? "green"
          : element === "fire"
          ? "red"
          : element === "ice"
          ? "blue"
          : element === "lightning"
          ? "yellow"
          : element === "water"
          ? "cyan"
          : element === "wind"
          ? "purple"
          : "gold"
      }`,
    },
  }
  const glowColor =
    element === "dark"
      ? "black"
      : element === "light"
      ? "white"
      : element === "earth"
      ? "green"
      : element === "fire"
      ? "red"
      : element === "ice"
      ? "blue"
      : element === "lightning"
      ? "yellow"
      : element === "water"
      ? "cyan"
      : element === "wind"
      ? "purple"
      : "black"

  const combinedStyles = {
    ...style,

    ...(isGlowing
      ? {
          boxShadow: `0 0 3px ${glowColor}, inset 0 0 35px ${glowColor}`,
        }
      : {}),

    ...(isDragging ? { opacity: 0 } : {}),
  }
  /*

  ******** WIP - Special Ability Text ********

  const textVariants = {
    hidden: { opacity: 0, scale: 0 },
    visible: {
      opacity: 1,
      scale: 2,
      transition: {
        delay: 1,
        duration: 4,
      },
    },
  }
*/
  const router = useRouter()

  const modalStyles = {
    content: {
      //overflow: isXSmall ? "auto" : "hidden",
      maxWidth: isXSmall ? "80%" : "50%",
      maxHeight: "90%",
      top: "0",
      left: "0",
      right: "0",
      bottom: "0",
      margin: "auto",
      marginTop: "5%",
      //backgroundImage: isSmall ? `url('/img/Wooden_UI/bg_01_02')` : `url('/im/Wooden_UI/book.ong')` ,//`url('/img/Wooden_UI/bg_01_02.png')`,
      backgroundSize: "100% 100%",
      backgroundRepeat: "no-repeat",
      backgroundColor: "transparent",
      border: "none",
      color: "black",
    },
    overlay: {
      backgroundColor: "rgba(0, 0, 0, 0.75)",
    },
  }

  return (
    // Main draggable hero card
    <motion.div
      ref={drag}
      className={`game-character font-carta w-${
        isSmall ? "24" : isXSmall ? "16" : "32"
      } h-${isSmall ? "24" : isXSmall ? "16" : "32"} relative`}
      style={combinedStyles}
      key={bgColor}
      initial="enter"
      animate={isShowing ? "enter" : "exit"}
      exit="enter"
      variants={flipVariants}
      transition={flipTransition}
      /*
      animate={isGlowing ? "emphasisedEnter" : isShowing ? "enter" : "exit"}
      exit="enter"
      variants={isGlowing ? glowVariants : flipVariants}
      transition={isGlowing ? glowTransition : flipTransition}
      */
    >
      {/* Hero card sprite */}

      <div
        className="sprite absolute top-0 left-0 w-full h-full bg-cover"
        style={{
          backgroundImage: isXSmall
            ? `url(${sprite})` //.replace("square", "face")})`
            : `url(${sprite})`,
        }}
      ></div>

      {/* Hero card overlay */}
      <div className="overlay absolute top-0 left-0 w-full h-full bg-cover bg-large-screen lg:bg-large-screen"></div>

      {/* Top Attack */}
      <div
        className={`attack attack-top absolute -top-1 left-0 right-0 mx-auto text-center text-sm md:text-lg md:-mt-px  text-white flex items-center justify-center`}
      >
        {topAttack && props.boardCard?.turnsBuffed.length > 0
          ? topAttack + props.boardCard?.turnsBuffed.length
          : topAttack
          ? topAttack
          : ""}
      </div>
      {/* Right Attack */}
      <div
        className={`attack attack-right absolute top-0 right-px md:mr-px bottom-px mx-auto text-sm md:text-lg text-center text-white flex items-center justify-center`}
      >
        {rightAttack && props.boardCard?.turnsBuffed.length > 0
          ? rightAttack + props.boardCard?.turnsBuffed.length
          : rightAttack
          ? rightAttack
          : ""}
      </div>
      {/* Bottom Attack */}
      <div
        className={`attack attack-bottom absolute -bottom-1 mb-px left-0 right-0 mx-auto text-sm md:text-lg text-center md:mb-0  text-white  flex items-center justify-center`}
      >
        {bottomAttack && props.boardCard?.turnsBuffed.length > 0
          ? bottomAttack + props.boardCard?.turnsBuffed.length
          : bottomAttack
          ? bottomAttack
          : ""}
      </div>
      {/* Left Attack */}
      <div
        className={`attack attack-left absolute top-0 left-px bottom-px  mx-auto md:ml-0.5 md:text-lg text-sm text-center text-white  flex items-center justify-center`}
      >
        {leftAttack && props.boardCard?.turnsBuffed.length > 0
          ? leftAttack + props.boardCard?.turnsBuffed.length
          : leftAttack
          ? leftAttack
          : ""}
      </div>
      {/* Attack Type */}
      <div className={`type absolute top-0.5 lg:mt-px right-0.5 lg:mr-px`}>
        <img
          src={
            type === "melee"
              ? meleeAttack
              : type === "ranged"
              ? rangedAttack
              : type === "magic"
              ? magicAttack
              : noThing
          }
          alt=""
          className={`w-3.5 lg:w-5 lg:pt-px h-3.5 lg:h-5 lg:pr-px`}
        />
      </div>
      {/* Info button */}
      <div className={`info absolute top-0.5 lg:top-1.5 left-0.5 lg:left-1.5 `}>
        {router.pathname !== "/decks" ? (
          <button onClick={openModal}>
            <img src={infoIcon} alt="" className={`w-4 h-4`} />
          </button>
        ) : (
          <div></div>
        )}
        {/* Hero Info Modal */}
        <Modal
          className="m-auto bg-bg1 lg:bg-book overflow-auto lg:overflow-auto  text-white shadow-black font-carta"
          isOpen={isOpen}
          onRequestClose={closeModal}
          style={modalStyles}
        >
          <div className="flex flex-col lg:flex-row lg:justify-evenly justify-center">
            <div className="flex flex-col font-carta-marina mb-24">
              <div className="flex flex-col mt-4">
                {/* Modal Close Button */}
                <div className="flex justify-end mt-2 mr-4 lg:hidden">
                  <img
                    src="/img/Wooden_UI/close.png"
                    alt=""
                    className="w-10 h-10"
                    onClick={closeModal}
                  />
                </div>
                {/* Modal Hero Image */}
                <div className="hero-modal-image bg-circle-bg bg-center bg-no-repeat bg-cover w-32 h-32 lg:w-32 lg:h-32 m-auto lg:mt-12">
                  <img
                    className="rounded-full w-28 h-28 lg:w-28  lg:h-28 m-auto mt-2 p-1.5"
                    src={
                      (props.card.id as unknown as number) < 1150
                        ? `https://metadata-lootheroes-rose.vercel.app/common/hero/${heroClass}${capitalize(
                            heroRank
                          )}-square.png`
                        : sprite
                    }
                  />
                </div>
                {/* Modal Hero Class and Rank */}
                <div className="hero-modal-class-rank bg-title bg-center bg-contain bg-no-repeat w-64 h-14 self-center text-center my-2">
                  <p className="lg:text-xl text-lg  mt-1 text-white shadow-black">
                    {heroClass === "demonHunter"
                      ? "Demon Hunter"
                      : capitalize(heroClass)}{" "}
                    {capitalize(heroRank)}
                  </p>
                </div>
              </div>
              <div className="hero-modal-att-box align-middle bg-board-frame bg-center bg-no-repeat bg-contain flex flex-col w-72 h-72 self-center text-white ">
                {/* Modal Hero Stats */}
                {/* Modal Hero Loot Score */}
                <div className="hero-modal-loot-score bg-plank-07 bg-contain bg-no-repeat bg-center w-36 h-8 self-center text-center mt-7">
                  <p className="text-sm lg:text-md mt-1.5 lg:mt-1">
                    Loot Score: {lootScore}
                  </p>
                </div>

                {/* Modal Hero Star Rating */}
                <div className="hero-modal-star-rating bg-plank-07 bg-contain bg-no-repeat bg-center w-36 h-8 self-center text-center mt-2">
                  <div className="flex  text-sm lg:text-md text-center  justify-center mt-1.5 lg:mt-1">
                    {`Stars:`}
                    {Array.from({
                      length: starRating as unknown as number,
                    }).map((_, index) => (
                      <div key={index} className="mt-px ml-1 lg:mt-   ">
                        <img src={starIcon} alt="" className={`w-4 lg:w-5`} />
                      </div>
                    ))}
                  </div>
                </div>
                {/* Modal Hero Card Color */}
                {/*

                   Do something with the color of the card

                {boardCard && boardCard.color ? (
                  <p
                    className="text-black text-xs lg:text-sm font-bold self-center"
                    style={{ color: `dark${boardCard.color}` }}
                  >
                    {capitalize(boardCard.color)}
                  </p>
                ) : null}
                */}
                <div className="hero-modal-attack-and-type-box flex justify-evenly mt-2">
                  <div className="hero-modal-types">
                    {/* Modal Hero Element */}
                    <div className="element-type-box flex lg:m-2 text-sm lg:text-xl justify-between bg-plank-04 bg-contain bg-no-repeat bg-center w-28 h-7 lg:h-6">
                      <div className="element-name ml-2 my-auto lg:text-sm">
                        {capitalize(element)}
                      </div>
                      {
                        <div className="element-image-frame mr-1 my-auto self-end flex bg-frame bg-no-repeat bg-contain bg-center h-5 w-5">
                          <div className="m-px p-px">
                            <img
                              src={
                                element === "light"
                                  ? lightElement
                                  : element === "dark"
                                  ? darkElement
                                  : element === "lightning"
                                  ? lightningElement
                                  : element === "fire"
                                  ? fireElement
                                  : element === "wind"
                                  ? windElement
                                  : element === "ice"
                                  ? iceElement
                                  : element === "earth"
                                  ? earthElement
                                  : element === "water"
                                  ? waterElement
                                  : noThing
                              }
                              alt=""
                              className={`w-4 lg:w-7`}
                            />
                          </div>
                        </div>
                      }
                    </div>
                    {/* Modal Hero Attack Type */}
                    <div className="flex lg:m-2 text-sm lg:text-xl justify-between font-extrabold  bg-plank-04 bg-contain bg-no-repeat bg-center mt-2   w-28 h-7 lg:h-6">
                      <div className="ml-2 my-auto lg:text-sm">
                        {capitalize(type)}
                      </div>
                      {
                        <div className="attack-image-frame self-center mr-1 my-auto bg-frame bg-no-repeat bg-contain bg-center h-5 w-5">
                          <div className="m-px p-px">
                            <img
                              src={
                                type === "melee"
                                  ? meleeAttack
                                  : type === "ranged"
                                  ? rangedAttack
                                  : type === "magic"
                                  ? magicAttack
                                  : noThing
                              }
                              alt=""
                              className={`w-4 lg:w-7`}
                            />
                          </div>
                        </div>
                      }
                    </div>
                    {/* Modal Hero Resistance */}
                    {showResist ? (
                      <>
                        <div className="flex lg:m-2 text-sm lg:text-xl justify-between font-extrabold  bg-plank-04 bg-contain bg-no-repeat bg-center mt-2  w-28 h-7 lg:h-6">
                          <div className="ml-2 my-auto lg:text-sm">
                            {capitalize(props.card.specialAbility1)}
                          </div>
                          {
                            <div className="resist-image-frame self-center mr-1 my-auto bg-frame bg-no-repeat bg-contain bg-center h-5 w-5">
                              <div className="m-px p-px">
                                <img
                                  src={
                                    specialAbility1 === "sturdy"
                                      ? sturdyAbility
                                      : specialAbility1 === "magic-resist"
                                      ? magicResistAbility
                                      : noThing
                                  }
                                  alt=""
                                  className={`w-4 lg:w-7 border-2 border-black`}
                                />
                              </div>
                            </div>
                          }
                        </div>
                      </>
                    ) : null}
                    {/* Modal Hero Area of Effect Ability */}
                    {showAoe ? (
                      <div className="flex  lg:m-2 text-sm lg:text-xl justify-between font-extrabold  bg-plank-04 bg-contain bg-no-repeat bg-center mt-2  w-28 h-7 lg:h-6">
                        <div className="ml-2 my-auto lg:text-sm">
                          {capitalize(props.card.specialAbility2)}
                        </div>
                        {
                          <div className="aoe-image-frame self-center mr-1 my-auto bg-frame bg-no-repeat bg-contain bg-center h-5 w-5">
                            <div className="m-px p-px">
                              <img
                                src={
                                  specialAbility2 === "earthquake"
                                    ? aoeEarthquke
                                    : props.card.specialAbility2 === "tornado"
                                    ? aoeTornado
                                    : props.card.specialAbility2 === "blaze"
                                    ? aoeBlaze
                                    : props.card.specialAbility2 === "blizzard"
                                    ? aoeBlizzard
                                    : props.card.specialAbility2 ===
                                      "thunderstorm"
                                    ? aoeThunderstorm
                                    : props.card.specialAbility2 === "downpour"
                                    ? aoeDownpour
                                    : props.card.specialAbility2 === "aura"
                                    ? aoeAura
                                    : props.card.specialAbility2 === "abyss"
                                    ? aoeAbyss
                                    : noThing
                                }
                                alt=""
                                className={`w-4 lg:w-7 border-2 border-black`}
                              />
                            </div>
                          </div>
                        }
                      </div>
                    ) : (
                      " "
                    )}
                  </div>
                  <div className="hero-modal-attacks">
                    {/* Modal Hero Top Attack */}
                    <div className="top-attack-box flex  lg:m-2 text-sm justify-between  bg-plank-04 bg-contain bg-no-repeat bg-center w-28 h-7 lg:h-6">
                      {
                        <div className="top-attack-frame ml-1 my-auto self-end flex bg-frame-c3-01 bg-no-repeat bg-contain bg-center h-5 w-5">
                          <div className="top-attack-value ml-1.5">
                            {topAttack}
                          </div>
                        </div>
                      }
                      <div className="top-attack-arrow my-auto">⬆</div>

                      <div className="attack-label mr-2 my-auto">Top</div>
                    </div>
                    {/* Modal Hero Right Attack */}
                    <div className="right-attack-box flex  lg:m-2 text-sm justify-between  bg-plank-04 bg-contain bg-no-repeat bg-center w-28 h-7 lg:h-6 mt-2">
                      {
                        <div className="right-attack-frame ml-1 my-auto self-end flex bg-frame-c3-01 bg-no-repeat bg-contain bg-center h-5 w-5">
                          <div className="right-attack-value ml-1.5">
                            {rightAttack}
                          </div>
                        </div>
                      }
                      <div className="right-attack-arrow my-auto">➡</div>

                      <div className="attack-label mr-2 my-auto">Right</div>
                    </div>
                    {/* Modal Hero Bottom Attack */}
                    <div className="bottom-attack-box flex lg:m-2 text-sm justify-between  bg-plank-04 bg-contain bg-no-repeat bg-center w-28 h-7 lg:h-6 mt-2">
                      {
                        <div className="bottom-attack-frame ml-1 my-auto self-end flex bg-frame-c3-01 bg-no-repeat bg-contain bg-center h-5 w-5">
                          <div className="bottom-attack-value ml-1.5">
                            {bottomAttack}
                          </div>
                        </div>
                      }
                      <div className="bottom-attack-arrow my-auto">⬇</div>

                      <div className="attack-label mr-2 my-auto">Bottom</div>
                    </div>
                    {/* Modal Hero Left Attack */}
                    <div className="left-attack-box flex lg:m-2 text-sm justify-between  bg-plank-04 bg-contain bg-no-repeat bg-center w-28 h-7 lg:h-6 mt-2">
                      {
                        <div className="left-attack-frame ml-1 my-auto self-end flex bg-frame-c3-01 bg-no-repeat bg-contain bg-center h-5 w-5">
                          <div className="left-attack-value ml-1.5">
                            {leftAttack}
                          </div>
                        </div>
                      }
                      <div className="left-attack-arrow my-auto">⬅</div>

                      <div className="attack-label mr-2 my-auto">Left</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Modal Hero Boosted Stats */}
            {showBoostedStats && (
              <div className="lg:mt-8 bg-board-frame bg-no-repeat bg-contain bg-center h-48 w-48 lg:h-72 lg:w-72 flex flex-col font-carta-marina self-center -mt-20 mb-20 ">
                <div className="hero-modal-boosted-att-title bg-plank-12-bg bg-no-repeat bg-contain bg-center mt-2 lg:mt-4 self-center w-40 h-10 lg:w-48 lg:h-12">
                  <p className="text-white text-md lg:text-lg text-center font-carta mt-3 lg:mt-4">
                    Boosted Attacks
                  </p>
                </div>
                <div className="hero-modal-boosted-attacks text-white"></div>
                {/* Modal Hero Boosted Top Attack based on Helm/Neck */}
                {topAttackBoost > 0 && (
                  <>
                    {/* Modal Hero Top Boosted Attack */}
                    <div className="boosted-top-attack-box flex lg:m-2 text-sm lg:text-md justify-between  bg-plank-04 bg-contain bg-no-repeat bg-center w-28 h-7 lg:w-40 lg:h-9 self-center mt-1 text-white">
                      {
                        <div className="boosted-top-attack-frame ml-1 lg:ml-2 my-auto self-end flex bg-frame-c3-01 bg-no-repeat bg-contain bg-center h-5 w-5">
                          <div className="boosted-top-attack-value ml-px">
                            +{topAttackBoost}
                          </div>
                        </div>
                      }
                      <div className="boosted-top-attack-arrow my-auto">⬆</div>

                      <div className="attack-label mr-2 my-auto">Top</div>
                    </div>
                  </>
                )}
                {/* Modal Hero Boosted Right Attack based on Shoulder/Hands */}
                {rightAttackBoost > 0 && (
                  <>
                    {/* Modal Hero Right Attack */}
                    <div className="boosted-right-attack-box flex lg:m-2 text-sm justify-between  bg-plank-04 bg-contain bg-no-repeat bg-center w-28 h-7 lg:w-40 lg:h-9 self-center mt-1 text-white">
                      {
                        <div className="boosted-right-attack-frame ml-1 lg:ml-2  my-auto self-end flex bg-frame-c3-01 bg-no-repeat bg-contain bg-center h-5 w-5">
                          <div className="boosted-right-attack-value ml-px">
                            +{rightAttackBoost}
                          </div>
                        </div>
                      }
                      <div className="boosted-right-attack-arrow my-auto">
                        ➡
                      </div>

                      <div className="attack-label mr-2 my-auto">Right</div>
                    </div>
                  </>
                )}
                {/* Modal Hero Boosted Bottom Attack based on Chest/Legs */}
                {bottomAttackBoost > 0 && (
                  <>
                    {/* Modal Hero Bottom Attack */}
                    <div className="boosted-bottom-attack-box flex lg:m-2 text-sm justify-between  bg-plank-04 bg-contain bg-no-repeat bg-center w-28 h-7 lg:w-40 lg:h-9 self-center mt-1 text-white">
                      {
                        <div className="boosted-bottom-attack-frame ml-1 lg:ml-2  my-auto self-end flex bg-frame-c3-01 bg-no-repeat bg-contain bg-center h-5 w-5">
                          <div className="boosted-bottom-attack-value ml-px">
                            +{bottomAttackBoost}
                          </div>
                        </div>
                      }
                      <div className="boosted-bottom-attack-arrow my-auto">
                        ⬇
                      </div>

                      <div className="attack-label mr-2 my-auto">Bottom</div>
                    </div>
                  </>
                )}
                {/* Modal Hero Boosted Left Attack based on Weapon/Ring */}
                {leftAttackBoost > 0 && (
                  <>
                    {/* Modal Hero Top Attack */}
                    <div className="boosted-left-attack-box flex  lg:m-2 text-sm justify-between  bg-plank-04 bg-contain bg-no-repeat bg-center w-28 h-7 lg:w-40 lg:h-9 self-center mt-1 text-white">
                      {
                        <div className="boosted-left-attack-frame ml-1 lg:ml-2  my-auto self-end flex bg-frame-c3-01 bg-no-repeat bg-contain bg-center h-5 w-5">
                          <div className="boosted-left-attack-value ml-px">
                            +{leftAttackBoost}
                          </div>
                        </div>
                      }
                      <div className="boosted-left-attack-arrow my-auto">⬅</div>

                      <div className="attack-label mr-2 my-auto">Left</div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </Modal>
      </div>
      {/* Element Icon */}
      <div className="element absolute bottom-0.5 lg:bottom-1 left-0.5 lg:left-1">
        <img
          src={
            element === "light"
              ? lightElement
              : element === "dark"
              ? darkElement
              : element === "lightning"
              ? lightningElement
              : element === "fire"
              ? fireElement
              : element === "wind"
              ? windElement
              : element === "ice"
              ? iceElement
              : element === "earth"
              ? earthElement
              : element === "water"
              ? waterElement
              : noThing
          }
          alt=""
          className={`w-3.5 lg:w-5 h-3.5 lg:h-5 lg:pr-px `}
        />
      </div>
      {/* Special Ability Icons */}
      <div
        className={`special-ability-container absolute bottom-0 right-0 flex flex-col justify-end gap-y-0.5`}
      >
        <div className="special-ability flex flex-row items-center">
          {/* Sturdy or Magic Resist Icon */}
          <img
            src={
              specialAbility1 === "sturdy"
                ? sturdyAbility
                : specialAbility1 === "magic-resist"
                ? magicResistAbility
                : noThing
            }
            alt=""
            className={`w-2.5 lg:w-4 h-2.5 lg:h-4 mr-0.5 lg:pb-px mb-px lg:pr-px`}
          />
        </div>
        {/* Area of Effect Icon */}
        <div className="special-ability flex flex-row items-center">
          <img
            src={
              specialAbility2 === "earthquake"
                ? aoeEarthquke
                : props.card.specialAbility2 === "tornado"
                ? aoeTornado
                : props.card.specialAbility2 === "blaze"
                ? aoeBlaze
                : props.card.specialAbility2 === "blizzard"
                ? aoeBlizzard
                : props.card.specialAbility2 === "thunderstorm"
                ? aoeThunderstorm
                : props.card.specialAbility2 === "downpour"
                ? aoeDownpour
                : props.card.specialAbility2 === "aura"
                ? aoeAura
                : props.card.specialAbility2 === "abyss"
                ? aoeAbyss
                : noThing
            }
            alt=""
            className={`w-2.5 lg:w-4 h-2.5 lg:h-4 mb-0.5 lg:pb-px mr-0.5 lg:pr-px`}
          />
        </div>
      </div>
      {/* 

      ******** WIP - Special Ability Text ********

      {specialAbility2 !== "none" && (
        <motion.div
          className="absolute w-full h-full items-center justify-center text-white text-sm lg:text-xl"
          variants={textVariants}
          initial="visible"
          animate="hidden"
        >
          {specialAbility2}
        </motion.div>
      )}
      */}
      <AnimatePresence>
        {attackDirection &&
          attackDirection.length > 0 &&
          attackDirection.map((direction, index) => (
            <MagicOrbAnimation
              key={index}
              direction={direction}
              attackType={props.attackAnimationData.attackType}
              isMagicAttackRanged={
                props.attackAnimationData.isMagicAttackRanged
              }
              attackElement={props.attackAnimationData.attackElement}
            />
          ))}
      </AnimatePresence>
    </motion.div>
  )
}

export default HeroCard
