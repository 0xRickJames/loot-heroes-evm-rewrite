import React from "react"

function Header(props) {
  return (
    <>
      <h1 className="ll-font-head text-4xl md:text-7xl text-white mb-4">
        <div>
          {props.text}
          <img
            src={"/img/title_sword.png"}
            className="w-2/3 md:w-1/2 lg:w-1/4 inset-x-0 bottom-0 mx-auto"
            alt={""}
          />
        </div>
      </h1>
    </>
  )
}

export default Header
