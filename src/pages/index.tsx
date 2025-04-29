import React from "react"
import Hero from "../components/Landing/Hero"
import Team from "../components/Landing/Team"
import { Container } from "../components/Container"
import CarouselLanding from "../components/Landing/Carousel"
import Recruiting from "../components/Landing/Recruiting"
import Expeditions from "../components/Landing/Expeditions"
import Airdrops from "../components/Landing/Airdrops"
import GearV2 from "../components/Landing/Gear"
import Gameplay from "../components/Landing/Gameplay"
import Footer from "../components/Landing/Footer"
import Link from "next/link"
import { ArrowRightIcon } from "@heroicons/react/solid"

export default function Landing() {
  return (
    <div className="index-wrapper text-center font-carta">
      {/* 
      <div className="announcement">
        We&apos;re officially hosting our first tournament!{" "}
        <Link href="/tournament" className="text-blue-500">
          Learn more <ArrowRightIcon className="inline-block h-4 w-4" />
        </Link>
      </div>
  */}
      <Hero />
      <Container header={null}>
        <div className="container mb-8 xl:px-0 px-4">
          {/* <MintHero /> */}
          {/* <MintHero2 /> */}

          <CarouselLanding />
          {/*<Recruiting />
          <Expeditions />
          <Airdrops />*/}
          <GearV2 />
          <Gameplay />
          <Team />
          <Footer />
        </div>
      </Container>

      <style jsx>{`
        .announcement {
          background-color: rgb(217, 119, 6);
          color: #1f2937;
          font-family: carta-marina, sans-serif;
          padding: 0.5rem 0;
          text-align: center;
          font-size: 1.2em;
          font-weight: 500;
        }
        .div {
          font-family: carta-marina, sans-serif;
        }
      `}</style>
    </div>
  )
}
