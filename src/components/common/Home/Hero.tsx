
import React from 'react'

function Hero() {
  return (
    <div className="h-[20rem] w-full rounded-md flex md:items-center md:justify-center  antialiased bg-grid-white/[0.02] relative overflow-hidden">
   
    <div className=" p-4 max-w-7xl  mx-auto relative z-10  w-full pt-20 md:pt-0">
      <h1 className="text-4xl md:text-7xl font-bold text-center bg-clip-text bg-opacity-50">
        Ignify.
      </h1>
      <p className="mt-4 font-normal text-base max-w-lg text-center mx-auto">
      All the skills you need in one place.
      </p>
    </div>
  </div>
  )
}

export default Hero
