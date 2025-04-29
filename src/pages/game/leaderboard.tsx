import React from "react"
import { Container } from "src/components/Container"
import NavButton from "src/components/Widget/NavButton"
import { ArrowLeftIcon } from "@heroicons/react/solid"
import axios from "axios"
import { useTable, useSortBy } from "react-table"
import sounds from "../../utils/sounds"
import Image from "next/image"

export default function Leaderboard() {
  const [leaderboardNormal, setLeaderboardNormal] = React.useState([])
  const [leaderboardTournament, setLeaderboardTournament] = React.useState([])
  const [
    leaderboardDungeonTournamentZero,
    setLeaderboardDungeonTournamentZero,
  ] = React.useState([])
  const [leaderboardDungeonTournamentOne, setLeaderboardDungeonTournamentOne] =
    React.useState([])
  const [leaderboardDungeonTournamentTwo, setLeaderboardDungeonTournamentTwo] =
    React.useState([])
  const [
    leaderboardDungeonTournamentThree,
    setLeaderboardDungeonTournamentThree,
  ] = React.useState([])
  const [
    leaderboardDungeonTournamentFour,
    setLeaderboardDungeonTournamentFour,
  ] = React.useState([])
  const [leaderboardDungeon, setLeaderboardDungeon] = React.useState([])

  const [soundsEnabled, setSoundsEnabled] = React.useState(false)
  const handleToggleSounds = () => {
    sounds.toggleSounds()

    sounds.buttonClick()
    const storedValue = localStorage.getItem("soundsEnabled")
    setSoundsEnabled(storedValue === "true")
  }

  React.useEffect(() => {
    const storedValue = localStorage.getItem("soundsEnabled")
    setSoundsEnabled(storedValue === "true")
  }, [])

  React.useEffect(() => {
    const fetchLeaderboardNormal = async () => {
      const response = await axios.get("/api/leaderboard-normal")
      setLeaderboardNormal(response.data)
      console.log(response.data)
    }

    fetchLeaderboardNormal()
  }, [])
  React.useEffect(() => {
    const fetchLeaderboardTournament = async () => {
      const response = await axios.get("/api/leaderboard-tournament")
      setLeaderboardTournament(response.data)
      console.log(response.data)
    }

    fetchLeaderboardTournament()
  }, [])
  React.useEffect(() => {
    const fetchLeaderboardDungeonTournamentZero = async () => {
      const response = await axios.get(
        "/api/leaderboard-dungeon-tournament-zero"
      )
      setLeaderboardDungeonTournamentZero(response.data)
      console.log(response.data)
    }

    fetchLeaderboardDungeonTournamentZero()
  }, [])
  React.useEffect(() => {
    const fetchLeaderboardDungeonTournamentOne = async () => {
      const response = await axios.get(
        "/api/leaderboard-dungeon-tournament-one"
      )
      setLeaderboardDungeonTournamentOne(response.data)
      console.log(response.data)
    }

    fetchLeaderboardDungeonTournamentOne()
  }, [])

  React.useEffect(() => {
    const fetchLeaderboardDungeonTournamentTwo = async () => {
      const response = await axios.get(
        "/api/leaderboard-dungeon-tournament-two"
      )
      setLeaderboardDungeonTournamentTwo(response.data)
      console.log(response.data)
    }

    fetchLeaderboardDungeonTournamentTwo()
  }, [])
  React.useEffect(() => {
    const fetchLeaderboardDungeonTournamentThree = async () => {
      const response = await axios.get(
        "/api/leaderboard-dungeon-tournament-three"
      )
      setLeaderboardDungeonTournamentThree(response.data)
      console.log(response.data)
    }

    fetchLeaderboardDungeonTournamentThree()
  }, [])
  React.useEffect(() => {
    const fetchLeaderboardDungeonTournamentFour = async () => {
      const response = await axios.get(
        "/api/leaderboard-dungeon-tournament-four"
      )
      setLeaderboardDungeonTournamentFour(response.data)
      console.log(response.data)
    }

    fetchLeaderboardDungeonTournamentFour()
  }, [])
  React.useEffect(() => {
    const fetchLeaderboardDungeon = async () => {
      const response = await axios.get("/api/leaderboard-dungeon")
      setLeaderboardDungeon(response.data)
      console.log(response.data)
    }

    fetchLeaderboardDungeon()
  }, [])

  const dataNormal = React.useMemo(() => leaderboardNormal, [leaderboardNormal])
  const dataTournament = React.useMemo(
    () => leaderboardTournament,
    [leaderboardTournament]
  )
  const dataDungeonTournamentZero = React.useMemo(
    () => leaderboardDungeonTournamentZero,
    [leaderboardDungeonTournamentZero]
  )
  const dataDungeonTournamentOne = React.useMemo(
    () => leaderboardDungeonTournamentOne,
    [leaderboardDungeonTournamentOne]
  )
  const dataDungeonTournamentTwo = React.useMemo(
    () => leaderboardDungeonTournamentTwo,
    [leaderboardDungeonTournamentTwo]
  )
  const dataDungeonTournamentThree = React.useMemo(
    () => leaderboardDungeonTournamentThree,
    [leaderboardDungeonTournamentThree]
  )
  const dataDungeonTournamentFour = React.useMemo(
    () => leaderboardDungeonTournamentFour,
    [leaderboardDungeonTournamentFour]
  )
  const dataDungeon = React.useMemo(
    () => leaderboardDungeon,
    [leaderboardDungeon]
  )

  const columnsNormal = React.useMemo(
    () => [
      { Header: "Rank", accessor: (row, i) => i + 1 },
      { Header: "Name", accessor: "playerName" },
      {
        Header: "Valor",
        accessor: "eloNormal",
        defaultSortDesc: false,
        isSorted: true,
      },
      {
        Header: "Avg. Turn (s)",
        accessor: "averageTurnTime",
      },
      { Header: "Wins", accessor: "winsNormal" },
      { Header: "Losses", accessor: "lossesNormal" },
      { Header: "Ties", accessor: "tiesNormal" },
    ],
    []
  )
  const columnsTournament = React.useMemo(
    () => [
      { Header: "Rank", accessor: (row, i) => i + 1 },
      { Header: "Name", accessor: "playerName" },
      {
        Header: "Valor",
        accessor: "eloTournament",
        defaultSortDesc: false,
        isSorted: true,
      },
      {
        Header: "Avg. Turn (s)",
        accessor: "averageTurnTime",
      },
      { Header: "Wins", accessor: "winsTournament" },
      { Header: "Losses", accessor: "lossesTournament" },
      { Header: "Ties", accessor: "tiesTournament" },
    ],
    []
  )
  const columnsDungeonTournamentZero = React.useMemo(
    () => [
      { Header: "Rank", accessor: (row, i) => i + 1 },
      { Header: "Name", accessor: "playerName" },
      {
        Header: "Renown",
        accessor: "renown",
        defaultSortDesc: false,
        isSorted: true,
      },
      { Header: "Wins", accessor: "winsDungeon" },
      { Header: "Losses", accessor: "lossesDungeon" },
      { Header: "Ties", accessor: "tiesDungeon" },
    ],
    []
  )
  const columnsDungeonTournamentOne = React.useMemo(
    () => [
      { Header: "Rank", accessor: (row, i) => i + 1 },
      { Header: "Name", accessor: "playerName" },
      {
        Header: "Renown",
        accessor: "renown",
        defaultSortDesc: false,
        isSorted: true,
      },
      { Header: "Wins", accessor: "winsDungeon" },
      { Header: "Losses", accessor: "lossesDungeon" },
      { Header: "Ties", accessor: "tiesDungeon" },
    ],
    []
  )
  const columnsDungeonTournamentTwo = React.useMemo(
    () => [
      { Header: "Rank", accessor: (row, i) => i + 1 },
      { Header: "Name", accessor: "playerName" },
      {
        Header: "Renown",
        accessor: "renown",
        defaultSortDesc: false,
        isSorted: true,
      },
      { Header: "Wins", accessor: "winsDungeon" },
      { Header: "Losses", accessor: "lossesDungeon" },
      { Header: "Ties", accessor: "tiesDungeon" },
    ],
    []
  )
  const columnsDungeonTournamentThree = React.useMemo(
    () => [
      { Header: "Rank", accessor: (row, i) => i + 1 },
      { Header: "Name", accessor: "playerName" },
      {
        Header: "Renown",
        accessor: "renown",
        defaultSortDesc: false,
        isSorted: true,
      },
      { Header: "Wins", accessor: "winsDungeon" },
      { Header: "Losses", accessor: "lossesDungeon" },
      { Header: "Ties", accessor: "tiesDungeon" },
    ],
    []
  )
  const columnsDungeonTournamentFour = React.useMemo(
    () => [
      { Header: "Rank", accessor: (row, i) => i + 1 },
      { Header: "Name", accessor: "playerName" },
      {
        Header: "Renown",
        accessor: "renown",
        defaultSortDesc: false,
        isSorted: true,
      },
      { Header: "Wins", accessor: "winsDungeon" },
      { Header: "Losses", accessor: "lossesDungeon" },
      { Header: "Ties", accessor: "tiesDungeon" },
    ],
    []
  )
  const columnsDungeon = React.useMemo(
    () => [
      { Header: "Rank", accessor: (row, i) => i + 1 },
      { Header: "Name", accessor: "playerName" },
      {
        Header: "Renown",
        accessor: "renown",
        defaultSortDesc: false,
        isSorted: true,
      },
      { Header: "Wins", accessor: "winsDungeon" },
      { Header: "Losses", accessor: "lossesDungeon" },
      { Header: "Ties", accessor: "tiesDungeon" },
      { Header: "Lost Renown", accessor: "lostRenown" },
    ],
    []
  )

  // PVP Table
  const {
    getTableProps: getTablePropsNormal,
    getTableBodyProps: getTableBodyPropsNormal,
    headerGroups: headerGroupsNormal,
    rows: rowsNormal,
    prepareRow: prepareRowNormal,
  } = useTable({ columns: columnsNormal, data: dataNormal }, useSortBy)

  // Tournament Table
  const {
    getTableProps: getTablePropsTournament,
    getTableBodyProps: getTableBodyPropsTournament,
    headerGroups: headerGroupsTournament,
    rows: rowsTournament,
    prepareRow: prepareRowTournament,
  } = useTable({ columns: columnsTournament, data: dataTournament }, useSortBy)

  // Dungeon Tournament 0 Table
  const {
    getTableProps: getTablePropsDungeonTournamentZero,
    getTableBodyProps: getTableBodyPropsDungeonTournamentZero,
    headerGroups: headerGroupsDungeonTournamentZero,
    rows: rowsDungeonTournamentZero,
    prepareRow: prepareRowDungeonTournamentZero,
  } = useTable(
    { columns: columnsDungeonTournamentZero, data: dataDungeonTournamentZero },
    useSortBy
  )
  // Dungeon Tournament 1 Table
  const {
    getTableProps: getTablePropsDungeonTournamentOne,
    getTableBodyProps: getTableBodyPropsDungeonTournamentOne,
    headerGroups: headerGroupsDungeonTournamentOne,
    rows: rowsDungeonTournamentOne,
    prepareRow: prepareRowDungeonTournamentOne,
  } = useTable(
    { columns: columnsDungeonTournamentOne, data: dataDungeonTournamentOne },
    useSortBy
  )
  // Dungeon Tournament 2 Table
  const {
    getTableProps: getTablePropsDungeonTournamentTwo,
    getTableBodyProps: getTableBodyPropsDungeonTournamentTwo,
    headerGroups: headerGroupsDungeonTournamentTwo,
    rows: rowsDungeonTournamentTwo,
    prepareRow: prepareRowDungeonTournamentTwo,
  } = useTable(
    { columns: columnsDungeonTournamentTwo, data: dataDungeonTournamentTwo },
    useSortBy
  )
  // Dungeon Tournament 3 Table
  const {
    getTableProps: getTablePropsDungeonTournamentThree,
    getTableBodyProps: getTableBodyPropsDungeonTournamentThree,
    headerGroups: headerGroupsDungeonTournamentThree,
    rows: rowsDungeonTournamentThree,
    prepareRow: prepareRowDungeonTournamentThree,
  } = useTable(
    {
      columns: columnsDungeonTournamentThree,
      data: dataDungeonTournamentThree,
    },
    useSortBy
  )
  // Dungeon Tournament 4 Table
  const {
    getTableProps: getTablePropsDungeonTournamentFour,
    getTableBodyProps: getTableBodyPropsDungeonTournamentFour,
    headerGroups: headerGroupsDungeonTournamentFour,
    rows: rowsDungeonTournamentFour,
    prepareRow: prepareRowDungeonTournamentFour,
  } = useTable(
    {
      columns: columnsDungeonTournamentFour,
      data: dataDungeonTournamentFour,
    },
    useSortBy
  )
  // Dungeon Table

  const {
    getTableProps: getTablePropsDungeon,
    getTableBodyProps: getTableBodyPropsDungeon,
    headerGroups: headerGroupsDungeon,
    rows: rowsDungeon,
    prepareRow: prepareRowDungeon,
  } = useTable({ columns: columnsDungeon, data: dataDungeon }, useSortBy)

  return (
    <Container header={null}>
      <div className="container mb-8 mt-10  font-carta">
        <div className="gap-2 mt-4 flex justify-start align-center">
          <NavButton
            onClick={() => {
              sounds.backButton()
            }}
            onMouseOver={() => {
              sounds.highlightButton()
            }}
            link="/game"
          >
            <ArrowLeftIcon className="h-5 w-5 text-black" />
            Back
          </NavButton>
          <button
            onMouseOver={sounds.highlightButton}
            onClick={() => {
              handleToggleSounds()
            }}
          >
            <Image
              className={`h-12 w-12 mx-3`}
              src={`/img/Wooden_UI/${soundsEnabled ? "volume" : "mute"}.png`}
              width={225}
              height={225}
              alt="Sound"
            />
          </button>
        </div>

        <div className="flex flex-col">
          <div
            style={{
              display: "flex",
              margin: "0 auto",
              flexDirection: "column",
              textAlign: "center",
              backgroundColor: "#303030",
              padding: "15px",
              borderRadius: "15px",
              marginBlock: "15px",
            }}
          >
            <h2
              className="font-carta shadow-black"
              style={{
                color: "white",
                fontSize: "64px",
                fontWeight: "bolder",
                textAlign: "center",
              }}
            >
              Dungeon Tournament Four
            </h2>
            <table
              {...getTablePropsDungeonTournamentFour()}
              style={{ margin: "auto" }}
            >
              <thead>
                {headerGroupsDungeonTournamentFour.map((headerGroup) => (
                  <tr {...headerGroup.getHeaderGroupProps()}>
                    {headerGroup.headers.map((column) => (
                      <th
                        {...column.getHeaderProps({
                          onClick: () => {
                            const isDesc = column.isSorted
                              ? !column.isSortedDesc
                              : true
                            column.toggleSortBy(isDesc)
                          },
                        })}
                        className="font-carta shadow-black"
                        style={{
                          border: "solid 1px gray",
                          fontWeight: "bold",
                          fontSize: "27px",
                          padding: "15px",
                        }}
                      >
                        {column.render("Header")}
                        <span>
                          {column.isSorted
                            ? column.isSortedDesc
                              ? " 🔽"
                              : " 🔼"
                            : ""}
                        </span>
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody {...getTableBodyPropsDungeonTournamentFour()}>
                {rowsDungeonTournamentFour.map((row) => {
                  prepareRowDungeonTournamentFour(row)
                  return (
                    <tr {...row.getRowProps()}>
                      {row.cells.map((cell) => (
                        <td
                          {...cell.getCellProps()}
                          style={{
                            border: "solid 1px gray",
                            fontSize: "18px",
                            padding: "15px",
                          }}
                        >
                          {cell.value && cell.value.toString().length > 20
                            ? `${cell.value.toString().substring(0, 17)}...`
                            : cell.render("Cell")}
                        </td>
                      ))}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div
            style={{
              display: "flex",
              margin: "0 auto",
              flexDirection: "column",
              textAlign: "center",
              backgroundColor: "#303030",
              padding: "15px",
              borderRadius: "15px",
              marginBlock: "15px",
            }}
          >
            <h2
              className="font-carta shadow-black"
              style={{
                color: "white",
                fontSize: "64px",
                fontWeight: "bolder",
                textAlign: "center",
              }}
            >
              Dungeon Tournament Three
            </h2>
            <table
              {...getTablePropsDungeonTournamentThree()}
              style={{ margin: "auto" }}
            >
              <thead>
                {headerGroupsDungeonTournamentThree.map((headerGroup) => (
                  <tr {...headerGroup.getHeaderGroupProps()}>
                    {headerGroup.headers.map((column) => (
                      <th
                        {...column.getHeaderProps({
                          onClick: () => {
                            const isDesc = column.isSorted
                              ? !column.isSortedDesc
                              : true
                            column.toggleSortBy(isDesc)
                          },
                        })}
                        className="font-carta shadow-black"
                        style={{
                          border: "solid 1px gray",
                          fontWeight: "bold",
                          fontSize: "27px",
                          padding: "15px",
                        }}
                      >
                        {column.render("Header")}
                        <span>
                          {column.isSorted
                            ? column.isSortedDesc
                              ? " 🔽"
                              : " 🔼"
                            : ""}
                        </span>
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody {...getTableBodyPropsDungeonTournamentThree()}>
                {rowsDungeonTournamentThree.map((row) => {
                  prepareRowDungeonTournamentThree(row)
                  return (
                    <tr {...row.getRowProps()}>
                      {row.cells.map((cell) => (
                        <td
                          {...cell.getCellProps()}
                          style={{
                            border: "solid 1px gray",
                            fontSize: "18px",
                            padding: "15px",
                          }}
                        >
                          {cell.value && cell.value.toString().length > 20
                            ? `${cell.value.toString().substring(0, 17)}...`
                            : cell.render("Cell")}
                        </td>
                      ))}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div
            style={{
              display: "flex",
              margin: "0 auto",
              flexDirection: "column",
              textAlign: "center",
              backgroundColor: "#303030",
              padding: "15px",
              borderRadius: "15px",
              marginBlock: "15px",
            }}
          >
            <h2
              className="font-carta shadow-black"
              style={{
                color: "white",
                fontSize: "64px",
                fontWeight: "bolder",
                textAlign: "center",
              }}
            >
              Dungeon Tournament Two
            </h2>
            <table
              {...getTablePropsDungeonTournamentTwo()}
              style={{ margin: "auto" }}
            >
              <thead>
                {headerGroupsDungeonTournamentTwo.map((headerGroup) => (
                  <tr {...headerGroup.getHeaderGroupProps()}>
                    {headerGroup.headers.map((column) => (
                      <th
                        {...column.getHeaderProps({
                          onClick: () => {
                            const isDesc = column.isSorted
                              ? !column.isSortedDesc
                              : true
                            column.toggleSortBy(isDesc)
                          },
                        })}
                        className="font-carta shadow-black"
                        style={{
                          border: "solid 1px gray",
                          fontWeight: "bold",
                          fontSize: "27px",
                          padding: "15px",
                        }}
                      >
                        {column.render("Header")}
                        <span>
                          {column.isSorted
                            ? column.isSortedDesc
                              ? " 🔽"
                              : " 🔼"
                            : ""}
                        </span>
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody {...getTableBodyPropsDungeonTournamentTwo()}>
                {rowsDungeonTournamentTwo.map((row) => {
                  prepareRowDungeonTournamentTwo(row)
                  return (
                    <tr {...row.getRowProps()}>
                      {row.cells.map((cell) => (
                        <td
                          {...cell.getCellProps()}
                          style={{
                            border: "solid 1px gray",
                            fontSize: "18px",
                            padding: "15px",
                          }}
                        >
                          {cell.value && cell.value.toString().length > 20
                            ? `${cell.value.toString().substring(0, 17)}...`
                            : cell.render("Cell")}
                        </td>
                      ))}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div
            style={{
              display: "flex",
              margin: "0 auto",
              flexDirection: "column",
              textAlign: "center",
              backgroundColor: "#303030",
              padding: "15px",
              borderRadius: "15px",
              marginBlock: "15px",
            }}
          >
            <h2
              className="font-carta shadow-black"
              style={{
                color: "white",
                fontSize: "64px",
                fontWeight: "bolder",
                textAlign: "center",
              }}
            >
              Dungeon Tournament One
            </h2>
            <table
              {...getTablePropsDungeonTournamentOne()}
              style={{ margin: "auto" }}
            >
              <thead>
                {headerGroupsDungeonTournamentOne.map((headerGroup) => (
                  <tr {...headerGroup.getHeaderGroupProps()}>
                    {headerGroup.headers.map((column) => (
                      <th
                        {...column.getHeaderProps({
                          onClick: () => {
                            const isDesc = column.isSorted
                              ? !column.isSortedDesc
                              : true
                            column.toggleSortBy(isDesc)
                          },
                        })}
                        className="font-carta shadow-black"
                        style={{
                          border: "solid 1px gray",
                          fontWeight: "bold",
                          fontSize: "27px",
                          padding: "15px",
                        }}
                      >
                        {column.render("Header")}
                        <span>
                          {column.isSorted
                            ? column.isSortedDesc
                              ? " 🔽"
                              : " 🔼"
                            : ""}
                        </span>
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody {...getTableBodyPropsDungeonTournamentOne()}>
                {rowsDungeonTournamentOne.map((row) => {
                  prepareRowDungeonTournamentOne(row)
                  return (
                    <tr {...row.getRowProps()}>
                      {row.cells.map((cell) => (
                        <td
                          {...cell.getCellProps()}
                          style={{
                            border: "solid 1px gray",
                            fontSize: "18px",
                            padding: "15px",
                          }}
                        >
                          {cell.value && cell.value.toString().length > 20
                            ? `${cell.value.toString().substring(0, 17)}...`
                            : cell.render("Cell")}
                        </td>
                      ))}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {/** Dungeon Zero  */}
          <div
            style={{
              display: "flex",
              margin: "0 auto",
              flexDirection: "column",
              textAlign: "center",
              backgroundColor: "#303030",
              padding: "15px",
              borderRadius: "15px",
              marginBlock: "15px",
            }}
          >
            <h2
              className="font-carta shadow-black"
              style={{
                color: "white",
                fontSize: "64px",
                fontWeight: "bolder",
                textAlign: "center",
              }}
            >
              Dungeon Tournament Zero
            </h2>
            <table
              {...getTablePropsDungeonTournamentZero()}
              style={{ margin: "auto" }}
            >
              <thead>
                {headerGroupsDungeonTournamentZero.map((headerGroup) => (
                  <tr {...headerGroup.getHeaderGroupProps()}>
                    {headerGroup.headers.map((column) => (
                      <th
                        {...column.getHeaderProps({
                          onClick: () => {
                            const isDesc = column.isSorted
                              ? !column.isSortedDesc
                              : true
                            column.toggleSortBy(isDesc)
                          },
                        })}
                        className="font-carta shadow-black"
                        style={{
                          border: "solid 1px gray",
                          fontWeight: "bold",
                          fontSize: "27px",
                          padding: "15px",
                        }}
                      >
                        {column.render("Header")}
                        <span>
                          {column.isSorted
                            ? column.isSortedDesc
                              ? " 🔽"
                              : " 🔼"
                            : ""}
                        </span>
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody {...getTableBodyPropsDungeonTournamentZero()}>
                {rowsDungeonTournamentZero.map((row) => {
                  prepareRowDungeonTournamentZero(row)
                  return (
                    <tr {...row.getRowProps()}>
                      {row.cells.map((cell) => (
                        <td
                          {...cell.getCellProps()}
                          style={{
                            border: "solid 1px gray",
                            fontSize: "18px",
                            padding: "15px",
                          }}
                        >
                          {cell.value && cell.value.toString().length > 20
                            ? `${cell.value.toString().substring(0, 17)}...`
                            : cell.render("Cell")}
                        </td>
                      ))}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div
            style={{
              display: "flex",
              margin: "0 auto",
              flexDirection: "column",
              textAlign: "center",
              backgroundColor: "#303030",
              padding: "15px",
              borderRadius: "15px",
              marginBlock: "15px",
            }}
          >
            <h2
              className="font-carta shadow-black"
              style={{
                color: "white",
                fontSize: "64px",
                fontWeight: "bolder",
                textAlign: "center",
              }}
            >
              Dungeons
            </h2>
            <table {...getTablePropsDungeon()} style={{ margin: "auto" }}>
              <thead>
                {headerGroupsDungeon.map((headerGroup) => (
                  <tr {...headerGroup.getHeaderGroupProps()}>
                    {headerGroup.headers.map((column) => (
                      <th
                        {...column.getHeaderProps({
                          onClick: () => {
                            const isDesc = column.isSorted
                              ? !column.isSortedDesc
                              : true
                            column.toggleSortBy(isDesc)
                          },
                        })}
                        className="font-carta shadow-black"
                        style={{
                          border: "solid 1px gray",
                          fontWeight: "bold",
                          fontSize: "27px",
                          padding: "15px",
                        }}
                      >
                        {column.render("Header")}
                        <span>
                          {column.isSorted
                            ? column.isSortedDesc
                              ? " 🔽"
                              : " 🔼"
                            : ""}
                        </span>
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody {...getTableBodyPropsDungeon()}>
                {rowsDungeon.map((row) => {
                  prepareRowDungeon(row)
                  return (
                    <tr {...row.getRowProps()}>
                      {row.cells.map((cell) => (
                        <td
                          {...cell.getCellProps()}
                          style={{
                            border: "solid 1px gray",
                            fontSize: "18px",
                            padding: "15px",
                          }}
                        >
                          {cell.value && cell.value.toString().length > 20
                            ? `${cell.value.toString().substring(0, 17)}...`
                            : cell.render("Cell")}
                        </td>
                      ))}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row">
          <div
            style={{
              display: "flex",
              margin: "0 auto",
              flexDirection: "column",
              textAlign: "center",
              backgroundColor: "#303030",
              padding: "15px",
              borderRadius: "15px",
              marginBlock: "15px",
            }}
          >
            <h2
              className="font-carta shadow-black"
              style={{
                color: "white",
                fontSize: "64px",
                fontWeight: "bolder",
                textAlign: "center",
              }}
            >
              PVP
            </h2>
            <table {...getTablePropsNormal()} style={{ margin: "auto" }}>
              <thead>
                {headerGroupsNormal.map((headerGroup) => (
                  <tr {...headerGroup.getHeaderGroupProps()}>
                    {headerGroup.headers.map((column) => (
                      <th
                        {...column.getHeaderProps({
                          onClick: () => {
                            const isDesc = column.isSorted
                              ? !column.isSortedDesc
                              : true
                            column.toggleSortBy(isDesc)
                          },
                        })}
                        className="font-carta shadow-black"
                        style={{
                          border: "solid 1px gray",
                          fontWeight: "bold",
                          fontSize: "27px",
                          padding: "15px",
                        }}
                      >
                        {column.render("Header")}
                        <span>
                          {column.isSorted
                            ? column.isSortedDesc
                              ? " 🔽"
                              : " 🔼"
                            : ""}
                        </span>
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody {...getTableBodyPropsNormal()}>
                {rowsNormal.map((row) => {
                  prepareRowNormal(row)
                  return (
                    <tr {...row.getRowProps()}>
                      {row.cells.map((cell) => (
                        <td
                          {...cell.getCellProps()}
                          style={{
                            border: "solid 1px gray",
                            fontSize: "18px",
                            padding: "15px",
                          }}
                        >
                          {cell.value && cell.value.toString().length > 20
                            ? `${cell.value.toString().substring(0, 17)}...`
                            : cell.render("Cell")}
                        </td>
                      ))}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
        {/*
        <div className="flex flex-col lg:flex-row">
          <div
            style={{
              display: "flex",
              margin: "0 auto",
              flexDirection: "column",
              textAlign: "center",
              backgroundColor: "#303030",
              padding: "15px",
              borderRadius: "15px",
              marginBlock: "15px",
            }}
          >
            <h2
              style={{
                color: "white",
                fontSize: "64px",
                fontWeight: "bolder",
                textAlign: "center",
              }}
            >
              Tournament Overall
            </h2>
            <table {...getTablePropsTournament()} style={{ margin: "auto" }}>
              <thead>
                {headerGroupsTournament.map((headerGroup) => (
                  <tr {...headerGroup.getHeaderGroupProps()}>
                    {headerGroup.headers.map((column) => (
                      <th
                        {...column.getHeaderProps({
                          onClick: () => {
                            const isDesc = column.isSorted
                              ? !column.isSortedDesc
                              : true
                            column.toggleSortBy(isDesc)
                          },
                        })}
                        style={{
                          border: "solid 1px gray",
                          fontWeight: "bold",
                          fontSize: "27px",
                          padding: "15px",
                        }}
                      >
                        {column.render("Header")}
                        <span>
                          {column.isSorted
                            ? column.isSortedDesc
                              ? " 🔽"
                              : " 🔼"
                            : ""}
                        </span>
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody {...getTableBodyPropsTournament()}>
                {rowsTournament.map((row) => {
                  prepareRowTournament(row)
                  return (
                    <tr {...row.getRowProps()}>
                      {row.cells.map((cell) => (
                        <td
                          {...cell.getCellProps()}
                          style={{
                            border: "solid 1px gray",
                            fontSize: "18px",
                            padding: "15px",
                          }}
                        >
                          {cell.value && cell.value.toString().length > 20
                            ? `${cell.value.toString().substring(0, 17)}...`
                            : cell.render("Cell")}
                        </td>
                      ))}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
        <div className="flex flex-col lg:flex-row">
          <div
            style={{
              display: "flex",
              margin: "0 auto",
              flexDirection: "column",
              textAlign: "center",
              backgroundColor: "#303030",
              padding: "15px",
              borderRadius: "15px",
              marginBlock: "15px",
            }}
          >
            <h2
              style={{
                color: "white",
                fontSize: "64px",
                fontWeight: "bolder",
                textAlign: "center",
              }}
            >
              Tournament 0
            </h2>
            <table
              {...getTablePropsTournamentZero()}
              style={{ margin: "auto" }}
            >
              <thead>
                {headerGroupsTournamentZero.map((headerGroup) => (
                  <tr {...headerGroup.getHeaderGroupProps()}>
                    {headerGroup.headers.map((column) => (
                      <th
                        {...column.getHeaderProps({
                          onClick: () => {
                            const isDesc = column.isSorted
                              ? !column.isSortedDesc
                              : true
                            column.toggleSortBy(isDesc)
                          },
                        })}
                        style={{
                          border: "solid 1px gray",
                          fontWeight: "bold",
                          fontSize: "27px",
                          padding: "15px",
                        }}
                      >
                        {column.render("Header")}
                        <span>
                          {column.isSorted
                            ? column.isSortedDesc
                              ? " 🔽"
                              : " 🔼"
                            : ""}
                        </span>
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody {...getTableBodyPropsTournamentZero()}>
                {rowsTournamentZero.map((row) => {
                  prepareRowTournamentZero(row)
                  return (
                    <tr {...row.getRowProps()}>
                      {row.cells.map((cell) => (
                        <td
                          {...cell.getCellProps()}
                          style={{
                            border: "solid 1px gray",
                            fontSize: "18px",
                            padding: "15px",
                          }}
                        >
                          {cell.value && cell.value.toString().length > 20
                            ? `${cell.value.toString().substring(0, 17)}...`
                            : cell.render("Cell")}
                        </td>
                      ))}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      */}
      </div>
    </Container>
  )
}
