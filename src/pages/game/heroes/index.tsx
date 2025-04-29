import React, { ReactElement } from "react"
import { GameLayout } from "src/components/Game/GameLayout"
import Heroes from "src/components/Game/Heroes"

type Props = {}

// Use the `getLayout` function to reuse the same layout component for different pages
// Preventing it from re-rendering between page changes
HeroesPage.getLayout = function getLayout(page: ReactElement) {
  return <GameLayout>{page}</GameLayout>
}

export default function HeroesPage(props: Props) {
  return <Heroes />
}
