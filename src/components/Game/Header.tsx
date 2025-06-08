import Link from "next/link"
import React, { useContext } from "react"
import sounds from "../../utils/sounds"
import Image from "next/image"
import { EvmWalletContext } from "src/contexts/EvmWalletContext"

function truncateString(input: string): string {
  if (input.length <= 8) return input
  return `${input.substring(0, 4)}..${input.substring(input.length - 4)}`
}

type Props = {}

export default function GameHeader(props: Props) {
  const { address, connect, disconnect } = useContext(EvmWalletContext)

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
    <div className="header">
      <Link href="/" className="logo-link">
        <img src="/img/logosmall.png" alt="logo" className="logo" />
      </Link>

      <div className="spacer" />

      <div className="wallet-controls">
        {!address ? (
          <button
            className="wallet-button"
            onMouseOver={sounds.highlightButton}
            onClick={() => {
              sounds.buttonClick()
              connect()
            }}
          >
            Connect Wallet
          </button>
        ) : (
          <>
            <button
              className="wallet-button"
              onMouseOver={sounds.highlightButton}
              onClick={() => {
                sounds.buttonClick()
                disconnect()
              }}
            >
              <span className="wallet-address">{truncateString(address)}</span>
              <br />
              Disconnect
            </button>
          </>
        )}
      </div>

      <style jsx>{`
        .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 32px;
          background-color: rgba(0, 0, 0, 0);
        }

        .logo-link {
          display: flex;
          align-items: center;
        }

        .logo {
          height: 64px;
          width: auto;
        }

        .spacer {
          flex: 1;
        }

        .wallet-controls {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .wallet-address {
          color: white;
          font-family: monospace;
          font-size: 1rem;
        }

        .wallet-button {
          background-color: #4caf50;
          color: white;
          padding: 8px 16px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .wallet-button:hover {
          background-color: #45a049;
        }
      `}</style>
    </div>
  )
}
