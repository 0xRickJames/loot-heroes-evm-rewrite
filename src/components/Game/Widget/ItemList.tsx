import {
  LegendaryLootItem,
  LegendaryLootItemRarity,
  LegendaryLootItemRarityName,
  LegendaryLootItemSlot,
  LegendaryLootItemSlotName,
} from "../../../library/legendaryloot.interface"
import React, {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from "react"
import Tippy from "@tippyjs/react"
import { followCursor } from "tippy.js"
import { ItemTooltip } from "./Tooltip"
import { Box, Slider } from "@mui/material"
import { PaginationWidget } from "./Pagination"
import { lowerCase } from "lodash"
import Link from "next/link"
import { useRouter } from "next/router"
import Image from "next/image"

interface ItemListProps<T = any> {
  items: LegendaryLootItem[]
  children: {
    component: React.FC<ItemListGenericItemProps>
    extraArgs: T
  }
  perPage: number
}

export interface ItemListGenericItemProps<T = any> {
  item: LegendaryLootItem
  index: number
  extraArgs: T
}

export interface ItemListGenericSelectionItemProps
  extends ItemListGenericItemProps {
  extraArgs: [
    LegendaryLootItem[],
    Dispatch<SetStateAction<LegendaryLootItem[]>>
  ]
}

export const ItemListGeneric: React.FC<ItemListGenericItemProps> = (
  props: ItemListGenericItemProps
) => {
  let item = props.item

  return (
    <Tippy
      key={props.item.getTokenMint().toString()}
      content={<ItemTooltip item={item} />}
      followCursor={true}
      plugins={[followCursor]}
      arrow={false}
      duration={[500, 0]}
      animation={"shift-away"}
    >
      <div
        className={`p-2 border-4 bg-gray-800 bg-opacity-75 border-gray-900 rounded-xl`}
      >
        <Link href={`/game/item/${item.getNftId()}`}>
          <Image
            src={props.item.getImage()}
            className={"w-auto mx-auto my-auto"}
            style={{ minHeight: "120px", maxHeight: "120px" }}
            alt={`${props.item.getName()}`}
            width={100}
            height={100}
            quality={95}
          />
        </Link>
        <h3 className={"text-center"}>{item.getName()}</h3>
        <p className="text-center">
          LS: <strong>{item.getLootScore()}</strong>
        </p>
      </div>
    </Tippy>
  )
}

export const ItemListGenericSelection: React.FC<
  ItemListGenericSelectionItemProps
> = (props: ItemListGenericSelectionItemProps) => {
  const [selection, setSelection] = props.extraArgs

  const { push } = useRouter()

  let item = props.item

  let isSelected = selection.find((i) => i.getNftId() === item.getNftId())
  let isSlotSelected = selection.find((i) => i.getSlot() === item.getSlot())

  let tooltipContent = item.isRevealed() ? (
    isSelected ? (
      <div className="box bg-gray-800 p-2 border-2 border-sm border-gray-900 rounded-sm flex flex-col space-y-2">
        Click to remove
      </div>
    ) : isSlotSelected ? (
      <div className="box bg-gray-800 p-2 border-2 border-sm border-gray-900 rounded-sm flex flex-col space-y-2">
        You have another item in this slot already selected
      </div>
    ) : (
      <div className="box bg-gray-800 p-2 border-2 border-sm border-gray-900 rounded-sm flex flex-col space-y-2">
        Click to preview this item in your hero!
      </div>
    )
  ) : (
    <div className="box bg-gray-800 p-2 border-2 border-sm border-gray-900 rounded-sm flex flex-col space-y-2">
      This piece of gear is not revealed. Click here to reveal it!
    </div>
  )

  const onClick = () => {
    if (!item.isRevealed()) {
      push(`/game/item/${item.getNftId()}`)
      return
    }

    if (isSelected) {
      setSelection(selection.filter((i) => i.getNftId() !== item.getNftId()))
    } else {
      setSelection([...selection, item])
    }
  }

  return (
    <Tippy
      content={tooltipContent}
      followCursor={true}
      plugins={[followCursor]}
      arrow={false}
      duration={[500, 0]}
      animation={"shift-away"}
    >
      <div
        key={props.index}
        className={`p-2 border-4 bg-gray-800 bg-opacity-75 border-gray-900 rounded-xl flex flex-col
                         ${
                           isSelected
                             ? "border-yellow-300"
                             : isSlotSelected
                             ? "opacity-50"
                             : ""
                         }
                     `}
      >
        <span
          className={`w-full h-full flex cursor-${
            isSlotSelected && !isSelected ? "not-allowed" : "pointer"
          }`}
          style={{ padding: "10%" }}
          onClick={!isSlotSelected || isSelected ? onClick : () => {}}
        >
          <Image
            src={props.item.getImage()}
            className={"w-auto mx-auto my-auto h-auto max-h-36"}
            style={{ minHeight: "80px" }}
            alt={`${props.item.getName()}`}
            width={300}
            height={300}
            quality={95}
          />
        </span>
        <h3 className={"text-center"}>{item.getName()}</h3>
        <p className={"text-center"}>
          LS: <strong>{item.getLootScore()}</strong>
        </p>
      </div>
    </Tippy>
  )
}

export const ItemList: React.FC<ItemListProps> = (props: ItemListProps) => {
  const [totalLootScore, setTotalLootScore] = useState<number>(0)
  const [lootScoreOption, setLootScoreOption] = useState([0, 1000])
  const [lootScoreValue, setLootScoreValue] = useState([0, 1000])
  const [rangeMarks, setRangeMarks] = useState<
    { value: number; label: string }[]
  >([])
  const [nameOption, setNameOption] = useState("")
  const [orderOption, setOrderOption] = useState<string>("lootScore")
  const [rarityOption, setRarityOption] = useState("All")
  const [slotOption, setSlotOption] = useState("All")
  const [setOption, setSetOption] = useState("All")

  const [currentItems, setCurrentItems] = useState<LegendaryLootItem[]>([])
  const [pageCount, setPageCount] = useState(0)
  const [itemOffset, setItemOffset] = useState(0)

  const getAllSets = (items: LegendaryLootItem[]) => {
    return items
      .filter((i) => i.isRevealed())
      .map((i) => i.set)
      .filter(function (value, index, array) {
        return array.indexOf(value) === index
      })
  }

  const getAllRarities = (items: LegendaryLootItem[]) => {
    return items
      .filter((i) => i.isRevealed())
      .map((i) => i.getRarity())
      .filter(function (value, index, array) {
        return array.indexOf(value) === index
      })
  }

  const filterItems = useCallback(
    (items: LegendaryLootItem[]): LegendaryLootItem[] => {
      return items.filter((item) => {
        return (
          item.getLootScore() >= lootScoreOption[0] &&
          item.getLootScore() <= lootScoreOption[1] &&
          (setOption === "All" ||
            (item.set && item.set.setName === setOption)) &&
          (slotOption === "All" || item.getSlot() === slotOption) &&
          (nameOption === "" ||
            lowerCase(item.getName()).includes(lowerCase(nameOption))) &&
          (rarityOption === "All" ||
            item.getRarity() === (rarityOption as LegendaryLootItemRarity))
        )
      })
    },
    [lootScoreOption, setOption, slotOption, nameOption, rarityOption]
  )

  const orderItems = useCallback(
    (items: LegendaryLootItem[]): LegendaryLootItem[] => {
      if (orderOption === "lootScore") {
        return items.sort((a, b) =>
          a.getLootScore() > b.getLootScore() ? -1 : 1
        )
      } else if (orderOption === "name") {
        return items.sort((a, b) =>
          parseInt(a.getName()) < parseInt(b.getName()) ? -1 : 1
        )
      } else if (orderOption === "rarity") {
        return items.sort((a, b) =>
          parseInt(a.getRarity()) < parseInt(b.getRarity()) ? -1 : 1
        )
      }

      return items
    },
    [orderOption]
  )

  useEffect(() => {
    const endOffset = itemOffset + props.perPage
    let filteredItems = orderItems(filterItems(props.items))

    let tls = Math.max(
      ...filteredItems.map((i) => (i.isRevealed() ? i.getLootScore() : 0)),
      100
    )

    setTotalLootScore(tls)
    setLootScoreValue(lootScoreOption)

    setRangeMarks([
      { value: 0, label: "0" },
      { value: tls, label: tls.toString() },
    ])

    setCurrentItems(filteredItems.slice(itemOffset, endOffset))
    setPageCount(Math.ceil(filteredItems.length / props.perPage))
  }, [
    itemOffset,
    props.items,
    props.perPage,
    orderOption,
    lootScoreOption,
    setOption,
    slotOption,
    nameOption,
    rarityOption,
    filterItems,
    orderItems,
  ])

  const handlePageClick = (event: any) => {
    const newOffset = (event.selected * props.perPage) % props.items.length
    setItemOffset(newOffset)
  }

  return (
    <>
      <div className="flex flex-row space-x-4 justify-between hidden md:block">
        <div className="flex flex-row space-x-10">
          <div className="flex flex-col">
            <strong>Slot</strong>
            <div>
              <select
                className="px-4 py-3 text-white bg-gray-700"
                onChange={(event) => setSlotOption(event.target.value)}
              >
                <option value="All">All</option>
                {Object.entries(LegendaryLootItemSlot).map((itemSlot) => {
                  return (
                    <option key={itemSlot[0]} value={itemSlot[1]}>
                      {LegendaryLootItemSlotName(itemSlot[1])}
                    </option>
                  )
                })}
              </select>
            </div>
          </div>
          <div className="flex flex-col">
            <strong>Item name</strong>
            <div>
              <input
                className="px-4 py-2 text-white bg-gray-700"
                placeholder={"Search by name"}
                onChange={(event) => setNameOption(event.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-col">
            <strong>Item set</strong>
            <div>
              <select
                className="px-4 py-3 text-white bg-gray-700"
                onChange={(event) => setSetOption(event.target.value)}
                value={setOption}
              >
                <option value="All">All</option>
                {getAllSets(props.items).map((set, index) => {
                  return (
                    <option key={index} value={set.setName}>
                      {set.setName}
                    </option>
                  )
                })}
              </select>
            </div>
          </div>
          <div className="flex flex-col">
            <strong>Item rarity</strong>
            <div>
              <select
                className="px-4 py-3 text-white bg-gray-700"
                onChange={(event) => setRarityOption(event.target.value)}
                value={rarityOption}
              >
                <option value="All">All</option>
                {getAllRarities(props.items).map((rarity, index) => {
                  return (
                    <option key={index} value={rarity}>
                      {LegendaryLootItemRarityName(rarity)}
                    </option>
                  )
                })}
              </select>
            </div>
          </div>
          <div className="flex flex-col">
            <strong>Loot Score</strong>
            <Box sx={{ width: 100 }}>
              <div className="flex">
                <Slider
                  max={Math.max(totalLootScore, 100)}
                  value={lootScoreValue}
                  onChange={(v, newValue) =>
                    setLootScoreOption(newValue as number[])
                  }
                  marks={rangeMarks}
                  sx={{
                    color: "white",
                    "& .MuiSlider-markLabel": {
                      color: "white",
                    },
                  }}
                />
              </div>
            </Box>
          </div>
        </div>
        <div className="flex flex-col text-right">
          <strong>Order by</strong>
          <div>
            <select
              className="px-4 py-3 text-white bg-gray-700"
              onChange={(event) => setOrderOption(event.target.value)}
              value={orderOption}
            >
              <option value="lootScore">Loot Score</option>
              <option value="name">Name</option>
              <option value="rarity">Rarity</option>
            </select>
          </div>
        </div>
      </div>
      {props.items.length === 0 ? (
        <>
          <div className="mt-4">
            You have no items in your inventory. You can buy new items in the
            secondary market or receive them from airdrops!
          </div>
        </>
      ) : (
        <div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {currentItems.map((item, index) => {
              return React.createElement(props.children.component, {
                key: index,
                item: item,
                index: index,
                extraArgs: props.children.extraArgs,
              })
            })}
          </div>
          <PaginationWidget
            breakLabel="..."
            nextLabel=""
            onPageChange={handlePageClick}
            pageRangeDisplayed={10}
            pageCount={pageCount}
            previousLabel=""
            renderOnZeroPageCount={undefined}
          />
        </div>
      )}
    </>
  )
}
