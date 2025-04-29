import React from "react"
import MinHeader from "../Widget/MinHeader"
import Header from "../Widget/Header"

function Team() {
  let HeroFrame = function (hero, img, job, twitterURL) {
    return (
      <>
        <div className="h-full">
          <a href={twitterURL} target="_blank" rel="noopener noreferrer">
            <h1 className="text-3xl text-center invisible md:visible">
              {hero}
            </h1>
            <div
              className="max-w-sm rounded overflow-hidden shadow-xl cursor-pointer card bg-frame justify-items-center text-center p-10 pb-0 h-full m-auto"
              style={{ backgroundSize: "100% 100%" }}
            >
              <p>
                <img className="w-full" src={img} alt={""} />
              </p>

              <h1 className="text-3xl text-center md:hidden mt-3">{hero}</h1>
              <p className="">
                <u>
                  <strong>{job}</strong>
                </u>
              </p>
            </div>
          </a>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="flex flex-col mt-10">
        <div id="team" className="text-center w-full flex flex-col p-4 mt-10">
          <MinHeader className="text-6xl">The Team</MinHeader>
          <Header className="text-6xl"></Header>
          <div className="text-2xl">
            Loot Heroes was taken over, by force, after 4 pro wrestlers came in
            and scoop slammed everyone else off the blockchain.
          </div>
        </div>
        <div className="grid grid-flow-row md:grid-flow-col md:space-x-4p-4 my-10">
          {HeroFrame(
            "Full Meta Alchemist",
            "/img/fma.png",
            "Loot Magnet",
            "https://twitter.com/tmifma"
          )}
          {HeroFrame(
            "House Laristar",
            "/img/house.png",
            "Pleb Legend",
            "https://twitter.com/EdouardMATHIEU"
          )}
          {HeroFrame(
            "Rick James McFarley",
            "/img/rjm.png",
            "Code Monkey",
            "https://twitter.com/0xrickjames"
          )}
          {HeroFrame(
            "Eduardo",
            "/img/eduardo.png",
            "Solana Chad",
            "https://twitter.com/eliagoris"
          )}
        </div>
      </div>
    </>
  )
}

export default Team
