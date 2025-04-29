import { useState } from "react"
import Navbar from "../Navbar"

import { useAnchorWallet } from "@solana/wallet-adapter-react"
import { ArrowRightIcon } from "@heroicons/react/solid"
import Link from "next/link"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faDiscord,
  faInstagram,
  faTwitter,
} from "@fortawesome/free-brands-svg-icons"
import NavButton from "../Widget/NavButton"
import ModalGeneric from "../Widget/Modal"

const Hero = () => {
  const wallet = useAnchorWallet()
  const [showModal, setShowModal] = useState(false)
  return (
    <>
      <div className="bg-hero bg-cover bg-center 2xl:bg-top md:min-h-96 flex justify-center bg-repeat animate-ltr-linear-infinite">
        <div className="container z-0">
          <Navbar logo={"/img/logosmall.png"}>
            <Link
              href="/game"
              className={`px-4 py-2 font-medium group bg-button inline-block group-hover:bg-opacity-75`}
              style={{ backgroundSize: "100% 100%" }}
            >
              <span
                className={`text-black group-hover:text-gray-700 font-semibold inline-flex items-center p-1 px-2`}
              >
                Play
              </span>
            </Link>
            <a
              href="https://loot-heroes.gitbook.io/loot-heroes/"
              className={`px-4 py-2 font-medium group bg-button inline-block group-hover:bg-opacity-75`}
              style={{ backgroundSize: "100% 100%" }}
            >
              <span
                className={`text-black group-hover:text-gray-700 font-semibold inline-flex items-center p-1 px-2`}
              >
                About
              </span>
            </a>
            <Link
              href="/#team"
              className={`px-4 py-2 font-medium group bg-button inline-block group-hover:bg-opacity-75`}
              style={{ backgroundSize: "100% 100%" }}
            >
              <span
                className={`text-black group-hover:text-gray-700 font-semibold inline-flex items-center p-1 px-2`}
              >
                Team
              </span>
            </Link>
          </Navbar>
          <div className="relative pt-5 md:pt-20 flex flex-col justify-center">
            <div className="hidden absolute md:inline-block inset-x-0 bottom-0 w-full text-center pb-10">
              {wallet ? (
                <>
                  <Link
                    href="/game"
                    className="text-black font-bold inline-flex items-center py-5 px-5 bg-button text-2xl"
                    style={{ backgroundSize: "100% 100%" }}
                  >
                    Play The Game <ArrowRightIcon className="h-5 w-5 ml-2" />
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/game"
                    className="text-black font-bold inline-flex items-center py-5 px-5 bg-button text-2xl"
                    style={{ backgroundSize: "100% 100%" }}
                  >
                    Play The Game <ArrowRightIcon className="h-5 w-5 ml-2" />
                  </Link>
                </>
              )}
              <div className="flex flex-row space-x-2 justify-center mt-5">
                <button
                  className="shadow-lg font-normal h-10 w-10 items-center justify-center align-center rounded-full outline-none focus:outline-none bg-blue-500"
                  type="button"
                >
                  <a
                    href="https://twitter.com/LootHeroesGame"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <FontAwesomeIcon icon={faTwitter} />
                  </a>
                </button>
                <button
                  className="shadow-lg font-normal h-10 w-10 items-center justify-center align-center rounded-full outline-none focus:outline-none bg-blue-800"
                  type="button"
                >
                  <a
                    href="https://discord.gg/J4mwvFDBYK"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <FontAwesomeIcon icon={faDiscord} />
                  </a>
                </button>
                <button
                  className="shadow-lg font-normal h-10 w-10 items-center justify-center align-center rounded-full outline-none focus:outline-none bg-pink-700"
                  type="button"
                >
                  <a
                    href="https://www.instagram.com/lootheroesnft/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <FontAwesomeIcon icon={faInstagram} />
                  </a>
                </button>
              </div>
            </div>
            <img
              src={"/img/topbanner.png"}
              className="mx-auto w-auto"
              alt="Banner"
            />
          </div>
        </div>
      </div>
      <ModalGeneric showModal={showModal} setShowModal={setShowModal} />
    </>
  )
}

export default Hero
