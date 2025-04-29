import { useWallet } from "@solana/wallet-adapter-react"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import Link from "next/link"
import React from "react"
import sounds from "../../utils/sounds"
import Image from "next/image"

function truncateString(input: string): string {
  if (input.length <= 8) {
    return input
  }

  const firstPart = input.substring(0, 4)
  const lastPart = input.substring(input.length - 4)

  return `${firstPart}...${lastPart}`
}

type Props = {}

export default function GameHeader(props: Props) {
  const { publicKey } = useWallet()

  const [soundsEnabled, setSoundsEnabled] = React.useState(false)
  const handleToggleSounds = () => {
    sounds.toggleSounds()

    sounds.buttonClick()
    const storedValue = localStorage.getItem("soundsEnabled")
    setSoundsEnabled(storedValue === "true")
  }

  React.useEffect(() => {
    const storedValue = localStorage.getItem("soundsEnabled")
    setSoundsEnabled(storedValue === "true")
  }, [])

  return (
    <div className="header  ">
      <h1>Loot Heroes</h1>

      <Link className="left-0" href="/">
        <img
          className="shadow-sm max-w-max h-16"
          src="/img/logosmall.png"
          alt="logo"
        ></img>
      </Link>
      <WalletMultiButton
        style={{
          marginLeft: "auto",
        }}
      >
        {!publicKey ? "Connect" : truncateString(publicKey.toString())}
      </WalletMultiButton>
      <style jsx>{`
        .header {
          display: flex;
          align-items: center;
          padding: 16px 48px;
        }

        .header h1 {
          font-size: 0px;
        }
      `}</style>
    </div>
  )
}
