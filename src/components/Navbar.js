import React, { useEffect, useMemo, useRef, useState } from "react"
import { WalletProvider } from "@solana/wallet-adapter-react"

import { MenuIcon } from "@heroicons/react/solid"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import { useAnchorWallet } from "@solana/wallet-adapter-react"
import Link from "next/link"

function useOutsideAlerter(ref, setOpenNav) {
  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpenNav(false)
      }
    }

    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [ref, setOpenNav])
}

const Navbar = ({ logo, className, children }) => {
  const [openNav, setOpenNav] = useState(false)

  const wrapperRef = useRef(null)
  useOutsideAlerter(wrapperRef, setOpenNav)

  const wallet = useAnchorWallet()
  const base58 = useMemo(() => wallet?.publicKey?.toBase58(), [wallet])

  let renderButtons = function () {
    return (
      <>
        <div
          className={`flex flex-col lg:flex-row space-y-4 md:space-y-0 md:space-x-4 items-center justify-center`}
        >
          <div className="flex flex-col space-y-4 md:space-x-4 md:space-y-0 md:flex-row text-center">
            {children}
          </div>
          <div className="flex flex-row gap-2">
            <WalletMultiButton>
              {!wallet
                ? "Connect"
                : base58.slice(0, 4) + ".." + base58.slice(-4)}
            </WalletMultiButton>
          </div>
        </div>
      </>
    )
  }

  return (
    <div className={className}>
      <div className={`flex flex-row items-center justify-between h-20`}>
        <Link href="/" className="pl-7 logo md:pl-0 md:ml-0">
          <img className="shadow-sm max-w-max h-16" src={logo} alt="logo" />
        </Link>

        {/* Mobile Nav */}

        <button
          onClick={() => setOpenNav(true)}
          className="sm:absolute sm:right-14 hamburger lg:invisible mr-4 text-xl"
        >
          <MenuIcon className="h-10 w-45 text-white" />
        </button>

        {openNav && (
          <div
            ref={wrapperRef}
            className="absolute top-0 left-0 w-full bg-yellow-800 bg-opacity-80 pb-8 z-10"
          >
            <div
              onClick={() => setOpenNav(false)}
              className="absolute top-4 right-4"
            >
              <img src={"/img/close_icon.svg"} alt="" className="h-8 w-8" />
            </div>
            <div className="flex flex-col items-center justify-around h-full pt-5 gap-4">
              {renderButtons()}
            </div>
          </div>
        )}

        {/* Desktop Nav */}

        <div className="hidden flex justify-end space-x-4 lg:visible lg:block">
          {renderButtons()}
        </div>
      </div>
    </div>
  )
}

export default Navbar
