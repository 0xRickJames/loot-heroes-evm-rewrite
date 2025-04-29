import React, { ReactElement } from "react"

import { GameLayout } from "src/components/Game/GameLayout"
import { ItemsList } from "src/components/Game/ItemsList"

const ItemsPage = () => {
  return <ItemsList />
}

// Use the `getLayout` function to reuse the same layout component for different pages
// Preventing it from re-rendering between page changes
ItemsPage.getLayout = function getLayout(page: ReactElement) {
  return <GameLayout>{page}</GameLayout>
}

export default ItemsPage
