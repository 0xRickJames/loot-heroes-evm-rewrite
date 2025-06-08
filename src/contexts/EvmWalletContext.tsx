// src/contexts/EvmWalletContext.tsx

import React, { createContext, useEffect, useState, ReactNode } from "react"
import { ethers } from "ethers"

// Fix for TypeScript not recognizing window.ethereum
declare global {
  interface Window {
    ethereum?: any
  }
}

type EvmWalletContextType = {
  address: string | null
  connect: () => Promise<void>
  disconnect: () => void
  signer: ethers.Signer | null
  provider: ethers.providers.Web3Provider | null
}

export const EvmWalletContext = createContext<EvmWalletContextType>({
  address: null,
  connect: async () => {},
  disconnect: () => {},
  signer: null,
  provider: null,
})

export const EvmWalletProvider = ({ children }: { children: ReactNode }) => {
  const [address, setAddress] = useState<string | null>(null)
  const [signer, setSigner] = useState<ethers.Signer | null>(null)
  const [provider, setProvider] =
    useState<ethers.providers.Web3Provider | null>(null)

  const connect = async () => {
    if (!window.ethereum) {
      alert("MetaMask is not installed.")
      return
    }

    const _provider = new ethers.providers.Web3Provider(window.ethereum)
    await _provider.send("eth_requestAccounts", [])
    const _signer = _provider.getSigner()
    const _address = await _signer.getAddress()

    setProvider(_provider)
    setSigner(_signer)
    setAddress(_address)
  }

  const disconnect = () => {
    setAddress(null)
    setSigner(null)
    setProvider(null)
  }

  useEffect(() => {
    // Auto-connect if already connected
    if (window.ethereum?.selectedAddress) {
      connect()
    }
  }, [])

  return (
    <EvmWalletContext.Provider
      value={{ address, connect, disconnect, signer, provider }}
    >
      {children}
    </EvmWalletContext.Provider>
  )
}
