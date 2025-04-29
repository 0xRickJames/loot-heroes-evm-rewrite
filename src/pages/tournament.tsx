import { ArrowRightIcon } from "@heroicons/react/solid"
import { Button } from "@material-tailwind/react"
import Link from "next/link"
import React from "react"

const TournamentPage: React.FC = () => {
  return (
    <main>
      <div className="floating-content">
        <div className="text-content">
          <img
            className="logo-image"
            src="/img/logosmall.png"
            alt="Logo"
            title="Logo"
          />
          <h1>Ace Arena</h1>
          <p>
            Join the tournament, show your skills,
            <br /> and fight for a chance of glory!
          </p>
          <div className="flex align-center gap-2">
            <Link
              href="/game/tournament"
              className="mt-5 text-black font-bold inline-flex items-center py-5 px-5 bg-button md:text-2xl text-lg"
              style={{ backgroundSize: "100% 100%" }}
            >
              Join Now
              <ArrowRightIcon className="h-5 w-5 ml-2" />
            </Link>
            {/* <Link
              href="/game"
              className="mt-5 text-white font-bold inline-flex items-center py-5 px-5 text-md md:text-lg"
              style={{ backgroundSize: "100% 100%" }}
            >
              See Leaderboard
            </Link> */}
          </div>

          <br />

          <div className="infos-wrapper">
            <div className="info-wrapper">
              <h3>Prizes</h3>
              <p>1st - $300</p>
              <p>2nd - $200</p>
              <p>3rd - $100</p>
            </div>
            <div className="info-wrapper">
              <h3>Starts in</h3>
              <p>07d 12h 5m</p>
            </div>
            <div className="info-wrapper">
              <h3>Entry fee</h3>
              <p>FREE</p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .info-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .infos-wrapper {
          display: grid;
          grid-template-columns: 1fr 1fr;
          align-self: stretch;
          gap: 1.6em;
        }

        main {
          position: relative;
          background: url("/lh_tournament.jpg") top no-repeat;
          min-height: 100vh;
        }
        .floating-content {
          position: absolute;
          left: 0;
          right: 0;
          margin: 0 auto;

          background: rgba(0, 0, 0, 0.6);
        }

        .text-content {
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 48px 24px;
          color: #000;
          max-width: 1280px;
        }

        .text-content h1,
        .text-content p,
        .text-content h2,
        .text-content h3 {
          font-family: carta-marina, sans-serif;
          font-style: normal;
          font-weight: bold;

          color: #fff;
        }

        .text-content h1 {
          font-size: 6em;
        }

        .text-content h2 {
          font-size: 4.5em;
          align-self: flex-start;
        }

        .text-content h3 {
          font-size: 3.2em;
          font-weight: normal;
        }

        .text-content p {
          font-size: 2em;
          font-weight: normal;
        }

        .infos-wrapper p {
          font-size: 1.6em;
        }

        .logo-image {
          max-width: 96px;
          margin-right: 300px;
          margin-bottom: -30px;
        }

        @media (max-width: 768px) {
          .floating-content {
            top: 0;
          }
          .text-content h1 {
            font-size: 3em;
          }

          .text-content p {
            font-size: 1.5em;
          }

          .logo-image {
            margin-right: 0;
            margin-bottom: -15px;
          }

          .text-content h3 {
            font-size: 2em;
            font-weight: normal;
          }
        }

        main {
          // background: url(/4cZUJFauJWGKgIAoKewQy88.jpg);
          display: flex;
          flex-direction: column;
          align-items: center;
        }
      `}</style>
    </main>
  )
}

export default TournamentPage
