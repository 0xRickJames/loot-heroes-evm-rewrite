import { initializeApp } from "firebase/app"

import environment from "src/environments/production"

import "reflect-metadata"
import "es6-shim"

import dynamic from "next/dynamic"
import "../index.css"
import { NextPage } from "next"
import { ReactElement, ReactNode } from "react"
import { AppProps } from "next/app"

import { WalletNFTsProvider } from "src/contexts/WalletNFTs"
import "../../public/fonts/font.css"

const firebaseConfig = {
  apiKey: environment.firebase.apiKey,
  authDomain: environment.firebase.authDomain,
  projectId: environment.firebase.projectId,
  storageBucket: environment.firebase.storageBucket,
  messagingSenderId: environment.firebase.messagingSenderId,
  appId: environment.firebase.appId,
  measurementId: environment.firebase.measurementId,
}

const WalletNoSSR = dynamic(() => import("src/components/WalletProvider"), {
  ssr: false,
})

initializeApp(firebaseConfig)

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode
}

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout
}

export default function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  const WalletProvider = WalletNoSSR as any

  // Use the layout defined at the page level, if available
  const getLayout = Component.getLayout ?? ((page) => page)

  return (
    // @ts-ignore
    <WalletProvider>
      <WalletNFTsProvider>
        {getLayout(<Component {...pageProps} />)}
      </WalletNFTsProvider>
    </WalletProvider>
  )
}
