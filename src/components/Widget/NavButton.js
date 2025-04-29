import Link from "next/link"
import React from "react"

function NavButton({ children, ...props }) {
  return (
    <>
      <Link
        href={props.link}
        className={
          `px-2 py-1 group bg-button items-center inline-block group-hover:bg-opacity-75 ` +
          props.wrapperClass
        }
        style={{ backgroundSize: "100% 100%" }}
        onMouseOver={props.onMouseOver}
        onClick={props.onClick}
      >
        <span
          className={
            `text-white shadow-black group-hover:text-gray-700 font-semibold inline-flex items-center p-1 px-2` +
            props.spanClass
          }
        >
          {children}
        </span>
      </Link>
      <style global jsx>
        {`
          .bg-button {
            font-size: 16px;
          }
        `}
      </style>
    </>
  )
}

export default NavButton
