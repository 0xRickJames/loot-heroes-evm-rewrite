import React from "react"
import BlankCard from "./BlankCard"
import { useDrop } from "react-dnd"
import { Card } from "src/utils/interfaces"

function BoardTile({
  size = "medium",
  onDrop,
  x,
  y,
}: {
  size?: "small" | "medium" | "xsmall"
  onDrop
  x: number
  y: number
}) {
  const [{ canDrop: canDrop, isOver: isOver }, drop] = useDrop({
    accept: "card",
    drop: (item: Card) => {
      onDrop(item.id, x, y)
    },
    hover: (item, monitor) => {},
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  })

  const tileStyle = {
    backgroundColor: canDrop && isOver ? "rgba(0, 255, 0, 0.5)" : "transparent",
  }

  return (
    <div ref={drop} style={tileStyle}>
      <BlankCard size={size} />
    </div>
  )
}

export default BoardTile
