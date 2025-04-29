import React from "react"
import {
  LegendaryLootItem,
  LegendaryLootItemSlotName,
} from "../../../library/legendaryloot.interface"

interface ItemTooltipProps {
  item: LegendaryLootItem
}

export const ItemTooltip: React.FC<ItemTooltipProps> = (
  props: ItemTooltipProps
) => {
  return (
    <>
      <div
        className="box bg-gray-800 p-2 border-2 border-sm border-gray-900 rounded-sm flex flex-col space-y-2"
        style={{ width: "450px" }}
      >
        <div className="flex space-x-2">
          <div className="w-1/5">
            <img src={props.item.getImage()} alt={""} />
          </div>
          <div>
            <p>
              <strong>{props.item.getName()}</strong>
            </p>
            {props.item.isRevealed() ? (
              <>
                <p>
                  <strong>Loot Score: </strong> {props.item.getLootScore()}
                </p>
                <p className="capitalize">
                  <strong>Rarity: </strong> {props.item.getRarity()}
                </p>
                <p>
                  <strong>Slot: </strong>{" "}
                  {LegendaryLootItemSlotName(props.item.getSlot())}
                </p>
                <p>
                  <strong>Gear set: </strong> {props.item.set?.setName}
                </p>
                <p className="capitalize">
                  <strong>Element: </strong> {props.item.getElement()}
                </p>
              </>
            ) : (
              <></>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
