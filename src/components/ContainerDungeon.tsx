import React, { FC } from "react"

// @ts-ignore
import environment from "src/environments/production"
import { ShieldExclamationIcon } from "@heroicons/react/solid"
import Loot from "./Widget/Loot"

export interface ContainerProps {
  header: React.ReactNode
  middle: React.ReactNode
  children: React.ReactNode
}

export const ContainerDungeon: FC<ContainerProps> = ({
  children,
  ...props
}) => {
  return (
    <div
      className={`box-border min-h-screen flex flex-col ${
        environment.isDevelopment ? "debug-screens" : ""
      }`}
      id="top"
    >
      <div className="flex flex-col justify-center flex">{props.header}</div>
      <div className="container mx-auto mt-8">
        <div className={`p-4 border-2 w-full inline-flex mx-auto`}>
          <ShieldExclamationIcon className="w5 h-5 mr-2" />
          <span>
            Welcome to our beta! Remember this beta has a{" "}
            <strong>default deck</strong> and no real <Loot>?</Loot> is given as
            rewards! Please provide any feedback on our Discord as we prepare
            for our final release!
          </span>
        </div>
        {props.middle}
      </div>
      <div className="flex relative flex-grow justify-center">{children}</div>
    </div>
  )
}
