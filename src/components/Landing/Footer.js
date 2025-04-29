import React from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

import {
  faDiscord,
  faInstagram,
  faTwitter,
} from "@fortawesome/free-brands-svg-icons"

const Footer = () => {
  return (
    <>
      <footer className="bg-blueGray-200 pt-8 pb-6 px-4 md:px-0">
        <div className="container mx-auto">
          <div className="flex flex-wrap text-left">
            <div className="w-full md:w-5/6">
              <h4 className="text-3xl fonat-semibold text-blueGray-700">
                Follow us on social media
              </h4>
              <h5 className="text-lg mt-0 mb-2 text-blueGray-600">
                Be there first for news and announcements!
              </h5>
              <div className="mt-6 lg:mb-0 mb-6">
                <button
                  className="shadow-lg font-normal h-10 w-10 items-center justify-center align-center rounded-full outline-none focus:outline-none mr-2 bg-blue-500"
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
                  className="shadow-lg font-normal h-10 w-10 items-center justify-center align-center rounded-full outline-none focus:outline-none mr-2 bg-blue-800"
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
                  className="shadow-lg font-normal h-10 w-10 items-center justify-center align-center rounded-full outline-none focus:outline-none mr-2 bg-pink-700"
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
            <div className="w-full md:w-1/6 md:text-right">
              <ul className="list-unstyled">
                <li>
                  <a
                    href="#top"
                    className="text-blueGray-600 hover:text-blueGray-800 font-semibold block pb-2 text-sm"
                  >
                    <u>Go to top</u>
                  </a>
                </li>
                <li>
                  <a
                    className="text-blueGray-600 hover:text-blueGray-800 font-semibold block pb-2 text-sm"
                    href="#team"
                  >
                    Team
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}

export default Footer
