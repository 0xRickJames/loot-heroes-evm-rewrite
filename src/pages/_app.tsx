import { initializeApp } from "firebase/app"
import environment from "src/environments/production"

import "reflect-metadata"
import "es6-shim"

import "../index.css"
import "../../public/fonts/font.css"

import { AppProps } from "next/app"
import { NextPage } from "next"
import { ReactElement, ReactNode } from "react"

import { EvmWalletProvider } from "src/contexts/EvmWalletContext"

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode
}

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout
}

const firebaseConfig = {
  apiKey: environment.firebase.apiKey,
  authDomain: environment.firebase.authDomain,
  projectId: environment.firebase.projectId,
  storageBucket: environment.firebase.storageBucket,
  messagingSenderId: environment.firebase.messagingSenderId,
  appId: environment.firebase.appId,
  measurementId: environment.firebase.measurementId,
}

initializeApp(firebaseConfig)

export default function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  const getLayout = Component.getLayout ?? ((page) => page)

  return (
    <EvmWalletProvider>
      {getLayout(<Component {...pageProps} />)}
    </EvmWalletProvider>
  )
}
