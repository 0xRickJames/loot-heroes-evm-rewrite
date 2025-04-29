import React from "react"

import Carousel, { slidesToShowPlugin } from "@brainhubeu/react-carousel"
import "@brainhubeu/react-carousel/lib/style.css"
import MinHeader from "../Widget/MinHeader"

const images = Array.from({ length: 10 }).map(
  (_, i) => "/img/carousel/" + (i + 1) + ".png"
)

let shuffle = function (images) {
  for (let i in this) {
    if (images.hasOwnProperty(i)) {
      let index = Math.floor(Math.random() * i)
      ;[images[i], images[index]] = [images[index], images[i]]
    }
  }

  return images
}

function CarouselLanding() {
  return (
    <>
      <div className="text-center w-full flex flex-col border-4 border-white mt-10 p-8">
        <div className="flex flex-col justify-center mt-10">
          <MinHeader className="text-4xl md:text-6xl mb-8">
            Minted Heroes into Looterra
          </MinHeader>
          <div className="md:hidden">
            <Carousel
              plugins={[
                "infinite",
                "arrows",
                "centered",
                "autoplay",
                "clickToChange",
                {
                  resolve: slidesToShowPlugin,
                  options: {
                    numberOfSlides: 1,
                  },
                },
              ]}
            >
              {images.map((image) => (
                <img key={image} src={image} className="px-2" alt={""} />
              ))}
            </Carousel>
          </div>
          <div className="hidden md:flex">
            <Carousel
              plugins={[
                "infinite",
                "arrows",
                "centered",
                "autoplay",
                "clickToChange",
                {
                  resolve: slidesToShowPlugin,
                  options: {
                    numberOfSlides: 3,
                  },
                },
              ]}
            >
              {shuffle(images).map((image) => (
                <img key={image} src={image} className="px-2" alt={""} />
              ))}
            </Carousel>
          </div>
          <div className="font-bold mt-8 bg-gradient-to-r from-yellow-800 via-gray-800 to-yellow-800 p-2 rounded-xl shadow-lg text-2xl">
            1150/1150 Genesis Minted
          </div>
        </div>
      </div>
    </>
  )
}

export default CarouselLanding
