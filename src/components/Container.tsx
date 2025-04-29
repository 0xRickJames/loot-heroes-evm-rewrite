import React, { FC } from "react"

// @ts-ignore
import environment from "src/environments/production"

export interface ContainerProps {
  header: React.ReactNode
  children: React.ReactNode
}

export const Container: FC<ContainerProps> = ({ children, ...props }) => {
  return (
    <div
      className={`box-border ${
        environment.isDevelopment ? "debug-screens" : ""
      }`}
      id="top"
    >
      <div className="flex flex-col justify-center">
        {props.header}
        <div className="flex justify-center">{children}</div>
      </div>
    </div>
  )
}
