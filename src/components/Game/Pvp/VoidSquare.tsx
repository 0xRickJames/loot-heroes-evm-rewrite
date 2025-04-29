const voidSquare = "/img/pvp/hero_card/voidSquare.png"

function VoidSquare({
  size = "medium",
}: {
  size?: "xsmall" | "small" | "medium"
}) {
  const isSmall = size === "small"
  const isXSmall = size === "xsmall"
  return (
    <div
      className={`void-square w-${isSmall ? "24" : isXSmall ? "16" : "32"} h-${
        isSmall ? "24" : isXSmall ? "16" : "32"
      } relative`}
    >
      <div
        className="void-square absolute top-0 left-0 w-full h-full bg-cover"
        //style={{ backgroundColor: "black" }}
      >
        <img src={voidSquare} alt="" />
      </div>
    </div>
  )
}

export default VoidSquare
