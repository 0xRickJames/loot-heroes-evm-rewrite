import React from "react"

function InteractiveButton({ children, ...props }) {
  return (
    <>
      <button
        className={
          `px-4 py-2 font-medium group bg-button inline-block group-hover:bg-opacity-75` +
          props.wrapperClass
        }
        style={{ backgroundSize: "100% 100%" }}
        onMouseOver={props.onMouseOver}
        onClick={props.onClick}
        disabled={props.disabled}
      >
        <span
          className={
            `font-carta text-white shadow-black group-hover:text-gray-700 font-semibold inline-flex items-center p-1 px-2` +
            props.spanClass
          }
        >
          {children}
        </span>
      </button>
    </>
  )
}

export default InteractiveButton
