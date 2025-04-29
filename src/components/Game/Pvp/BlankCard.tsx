const blankCardImage = ""

function BlankCard({
  size = "medium",
}: {
  size?: "xsmall" | "small" | "medium"
}) {
  const isSmall = size === "small"
  const isXSmall = size === "xsmall"
  return (
    <div
      className={`blank-card w-${isSmall ? "24" : isXSmall ? "16" : "32"} h-${
        isSmall ? "24" : isXSmall ? "16" : "32"
      } relative`}
    >
      <div
        className="blank-image absolute top-0 left-0 w-full h-full bg-cover"
        style={{ backgroundImage: blankCardImage }}
      ></div>
    </div>
  )
}

export default BlankCard
