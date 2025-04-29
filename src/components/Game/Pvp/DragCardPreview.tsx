import React, { ReactNode } from "react"
import { usePreview } from "react-dnd-preview"
import HeroCard from "./HeroCard"

type DraggableItem = {
  id: string
  card: any
  bgColor: string
}

export const DragCardPreview = () => {
  const preview = usePreview()
  if (!preview.display || !preview.item) {
    return null
  }
  const { itemType, item, style } = preview
  const draggableItem = item as DraggableItem // Cast item to DraggableItem
  if (!draggableItem.card) {
    return null
  }

  return (
    <div
      className="item-list__item opacity-100 scale-150"
      style={{ ...style, backgroundColor: draggableItem.bgColor }} // Access bgColor from draggableItem
    >
      <HeroCard
        size="small"
        card={draggableItem.card}
        attackAnimationData={null}
      />
    </div>
  )
}
