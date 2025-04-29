import React, { ReactElement, useCallback, useEffect, useState } from "react"
import {
  LegendaryLootHero,
  LegendaryLootHeroRarity,
  LegendaryLootHeroRarityName,
} from "../../../library/legendaryloot.interface"
import { Box, Slider } from "@mui/material"
import Link from "next/link"
import { faCircleNotch } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { PaginationWidget } from "./Pagination"
import Tippy from "@tippyjs/react"
import { followCursor } from "tippy.js"
import Image from "next/image"

interface HeroListProps {
  items: LegendaryLootHero[]
  showFilters: boolean
  children: {
    component: React.FC<HeroListGenericItemProps>
    extraArgs: any
  }
  noHeroes: ReactElement
  perPage: number
}

export interface HeroListGenericItemProps {
  item: LegendaryLootHero
  index: number
  extraArgs: any
}

export const HeroListGenericItem: React.FC<HeroListGenericItemProps> = (
  props: HeroListGenericItemProps
) => {
  return (
    <>
      <Link
        key={props.index}
        href={`/game/heroes/${props.item.getNftId()}/${props.item
          .getTokenMint()
          .toString()}`}
        className="bg-gray-700 p-4 rounded-sm text-center shadow-xl cursor-pointer hover:bg-gray-600"
      >
        <Image
          src={props.item.getImage()}
          alt={`Hero #${props.item.getNftId()}`}
          width={350}
          height={350}
          quality={90}
        />
        <p className="text-xl font-bold">Hero #{props.item.getNftId()}</p>
        <div className="flex flex-2 flex-row justify-between">
          <p>
            <strong>Hero</strong> #{props.item.getNftId()}
          </p>
          <p>
            <strong>Equipped</strong> {props.item.getEquippedCount()}/8
          </p>
        </div>
        <div className="flex flex-2 flex-row justify-between">
          <p>Loot Score {props.item.getLootScore()}</p>
          <p>{props.item.isStaked() ? "Staked!" : ""}</p>
        </div>
      </Link>
    </>
  )
}

export const HeroList: React.FC<HeroListProps> = (props: HeroListProps) => {
  const [totalLootScore, setTotalLootScore] = useState<number>(0)

  const [frameOption, setFrameOption] = useState("All")
  const [nameOption, setNameOption] = useState("All")
  const [lootScoreOption, setLootScoreOption] = useState([0, -1])
  const [orderOption, setOrderOption] = useState<string>("lootScore")
  const [stakeOption, setStakeOption] = useState<string>("All")

  const [rangeMarks, setRangeMarks] = useState<
    { value: number; label: string }[]
  >([])

  const [currentItems, setCurrentItems] = useState<LegendaryLootHero[]>([])
  const [pageCount, setPageCount] = useState(0)
  const [itemOffset, setItemOffset] = useState(0)

  const filterLoadouts = useCallback(
    (items: LegendaryLootHero[]): LegendaryLootHero[] => {
      return items.filter((item) => {
        return (
          (lootScoreOption[1] === -1 ||
            (item.getLootScore() >= lootScoreOption[0] &&
              item.getLootScore() <= lootScoreOption[1])) &&
          (nameOption === "All" || item.getNftId() === nameOption) &&
          (frameOption === "All" ||
            item.getRarity() === (frameOption as LegendaryLootHeroRarity)) &&
          (stakeOption === "All" ||
            (stakeOption === "Staked" ? item.isStaked() : !item.isStaked()))
        )
      })
    },
    [nameOption, frameOption, lootScoreOption, stakeOption]
  )

  const orderLoadouts = useCallback(
    (items: LegendaryLootHero[]): LegendaryLootHero[] => {
      if (orderOption === "lootScore") {
        return items.sort((a, b) =>
          a.getLootScore() > b.getLootScore() ? -1 : 1
        )
      } else if (orderOption === "name") {
        return items.sort((a, b) =>
          parseInt(a.getNftId()) < parseInt(b.getNftId()) ? -1 : 1
        )
      }

      return items
    },
    [orderOption]
  )

  useEffect(() => {
    if (props.items.length <= 0) return
    const endOffset = itemOffset + props.perPage

    let tls = Math.max(
      ...props.items
        .map((i) => (i.isRevealed() ? i.getLootScore() : 0))
        .concat(100)
    )
    let filteredItems = orderLoadouts(filterLoadouts(props.items))

    setTotalLootScore(tls)

    if (lootScoreOption[1] === -1) setLootScoreOption([0, tls])

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
    frameOption,
    orderOption,
    lootScoreOption,
    nameOption,
    filterLoadouts,
    orderLoadouts,
    stakeOption,
  ])

  const handlePageClick = (event: any) => {
    const newOffset = (event.selected * props.perPage) % props.items.length
    setItemOffset(newOffset)
  }

  return (
    <>
      {props.showFilters ? (
        <div className="flex flex-row space-x-4 justify-between hidden md:block">
          <div className="flex flex-row space-x-10">
            <div className="flex flex-col">
              <strong>Titles</strong>
              <div>
                <select
                  className="px-4 py-3 text-white bg-gray-700"
                  onChange={(event) => {
                    setFrameOption(event.target.value)
                    setItemOffset(0)
                  }}
                >
                  <option value="All">All</option>
                  {Object.entries(LegendaryLootHeroRarity).map(
                    (qualityElement) => {
                      return (
                        <option
                          key={qualityElement[0]}
                          value={qualityElement[0]}
                        >
                          {LegendaryLootHeroRarityName(
                            qualityElement[1] as LegendaryLootHeroRarity
                          )}
                        </option>
                      )
                    }
                  )}
                </select>
              </div>
            </div>
            <div className="flex flex-col">
              <strong>Hero name</strong>
              <div>
                <select
                  className="px-4 py-3 text-white bg-gray-700"
                  onChange={(event) => setNameOption(event.target.value)}
                >
                  <option value="All">All</option>
                  {props.items.map((loadout, index) => {
                    return (
                      <option key={index} value={loadout.getNftId()}>
                        Hero #{loadout.getNftId()}
                      </option>
                    )
                  })}
                </select>
              </div>
            </div>
            <div className="flex flex-col">
              <strong>Hero status</strong>
              <div>
                <select
                  className="px-4 py-3 text-white bg-gray-700"
                  onChange={(event) => setStakeOption(event.target.value)}
                >
                  <option value="All">All</option>
                  <option value={"Staked"}>On Expedition (staked)</option>
                  <option value={"Idle"}>Idle</option>
                </select>
              </div>
            </div>
            <div className="flex flex-col">
              <strong>Loot Score</strong>
              <Box sx={{ width: 100 }}>
                <div className="flex">
                  <Slider
                    max={totalLootScore}
                    value={lootScoreOption}
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
              >
                <option value="lootScore">Loot Score</option>
                <option value="name">Name</option>
              </select>
            </div>
          </div>
        </div>
      ) : (
        <></>
      )}
      {currentItems.length > 0 ? (
        <div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
      ) : (
        <div className="text-center mt-8">{props.noHeroes}</div>
      )}
    </>
  )
}
