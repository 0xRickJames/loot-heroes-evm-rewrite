import { motion, useAnimation } from "framer-motion"
import { useEffect } from "react"

const redCoin = "/img/Wooden_UI/red_coin.png.png"
const blueCoin = "/img/Wooden_UI/blue_coin.png"

const CoinFlip = ({ isRedFirst }) => {
  const controls = useAnimation()

  useEffect(() => {
    const sequence = async () => {
      await controls.start({ rotateY: 0 })
      await controls.start({ rotateY: 180 })
      await controls.start({ rotateY: isRedFirst ? 180 : 0 })
    }
    sequence()
    console.log("isRedFirst", isRedFirst)
  }, [controls, isRedFirst])

  return (
    <motion.div className="coin" animate={controls} style={{ rotateY: 0 }}>
      <img src={isRedFirst ? redCoin : blueCoin} alt="Coin" />
    </motion.div>
  )
}

export default CoinFlip
