import Header from "src/components/Game/Header"
import React, { Dispatch, SetStateAction, useEffect, useState } from "react"
import { Container } from "src/components/Container"
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react"
import { defaultDeck } from "src/utils/defaultDeck"
import { LegendaryLootService } from "src/library/legendaryloot.service"
import HeroCard from "src/components/Game/Pvp/HeroCard"
import InteractiveButton from "src/components/Widget/InteractiveButton"
import axios from "axios"
import { Card, Deck } from "src/utils/interfaces"
import { LegendaryLootItemSlot } from "src/library/legendaryloot.interface"
import BlankCard from "src/components/Game/Pvp/BlankCard"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import NavButton from "src/components/Widget/NavButton"
import { ArrowLeftIcon } from "@heroicons/react/solid"
import { useMediaQuery } from "@mui/material"
import createCardFromMetadata from "src/utils/createCardFromMetadata"
import { set } from "@project-serum/anchor/dist/cjs/utils/features"
import sounds from "../../utils/sounds"
import { button } from "@material-tailwind/react"
import Image from "next/image"

export default function DecksRoute(props: any) {
  // Sounds handler variables
  const [soundsEnabled, setSoundsEnabled] = useState(false)
  const handleToggleSounds = () => {
    sounds.toggleSounds()

    sounds.buttonClick()
    const storedValue = localStorage.getItem("soundsEnabled")
    setSoundsEnabled(storedValue === "true")
  }
  // Blockchain based variables

  const { connection } = useConnection()
  const wallet = useAnchorWallet()
  const owner: string = wallet?.publicKey?.toString()
  const legendaryLootService = new LegendaryLootService(connection)

  const isMobile = useMediaQuery("(max-width: 768px)")
  // Deck array variables

  const [remainingPlayerCards, setRemainingPlayerCards] = useState<Card[]>([])
  const [remainingDefaultCards, setRemainingDefaultCards] =
    useState<Card[]>(defaultDeck)
  const [newDeck, setNewDeck] = useState<Card[]>([])
  const [newDeckCardIds, setNewDeckCardIds] = useState<string[]>([])
  const [playerCards, setPlayerCards] = useState<Card[]>([])

  // Deck name variables

  const [inputDeckName, setInputDeckName] = useState("New Deck")
  const [deckNames, setDeckNames] = useState<string[]>(["Default Deck"])
  const [deckName, setDeckName] = useState("Default Deck")
  const [deleteDeckNames, setDeleteDeckNames] = useState<string[]>([
    "Default Deck",
  ])
  const [deleteDeckName, setDeleteDeckName] = useState("Default Deck")

  const [deckLootScore, setDeckLootScore] = useState<number>(0)

  // Sort by variables

  const sortByValues: string[] = [
    "Loot Score",
    "NFT ID",
    "Attack Type",
    "Element",
    "Star Rating",
  ]
  const [selectedSortBy, setSelectedSortBy] = useState(sortByValues[0])

  // Sort by functions

  const handleSortByChange = (event) => {
    sounds.highlightButton()
    setSelectedSortBy(event.target.value)
  }

  function handleOnClickSortBy() {
    const sortByValue = selectedSortBy.toLowerCase()

    const sortFunction = (a, b, property) => {
      if (a[property] < b[property]) return starsOrLootScore ? 1 : -1
      if (a[property] > b[property]) return starsOrLootScore ? -1 : 1
      return 0
    }

    let property = ""
    let starsOrLootScore = false
    if (sortByValue === "loot score") {
      property = "lootScore"
      starsOrLootScore = true
    } else if (sortByValue === "nft id") {
      property = "id"
    } else if (sortByValue === "attack type") {
      property = "type"
    } else if (sortByValue === "element") {
      property = "element"
    } else if (sortByValue === "star rating") {
      property = "starRating"
      starsOrLootScore = true
    }

    if (property) {
      const sortedDefaultCards = [...defaultDeck].sort((a, b) =>
        sortFunction(a, b, property)
      )
      const sortedPlayerCards = [...playerCards].sort((a, b) =>
        sortFunction(a, b, property)
      )
      const deck: Card[] = newDeck
      const fixedSortedDefaultCards = sortedDefaultCards.filter(
        (defaultCard) =>
          !deck.some((deckCard) => deckCard.id === defaultCard.id)
      )
      const fixedSortedPlayerCards = sortedPlayerCards.filter(
        (playerCard) => !deck.some((deckCard) => deckCard.id === playerCard.id)
      )

      // Update the state with the sorted arrays
      setRemainingDefaultCards(fixedSortedDefaultCards)
      setRemainingPlayerCards(fixedSortedPlayerCards)
    }
  }

  // Filter by variables

  const filterByValues: string[] = [
    "Melee",
    "Ranged",
    "Magic",
    "Fire",
    "Water",
    "Ice",
    "Wind",
    "Earth",
    "Lightning",
    "Light",
    "Dark",
    "1-Star",
    "2-Star",
    "3-Star",
  ]
  const [selectedFilterBy, setSelectedFilterBy] = useState(filterByValues[0])

  // Filter by functions

  const handleFilterByChange = (event) => {
    sounds.highlightButton()
    setSelectedFilterBy(event.target.value)
  }

  function handleOnClickFilterBy(): any {
    const filterByValue = selectedFilterBy.toLowerCase()

    const filteredDefaultCards = defaultDeck.filter((card) => {
      if (["melee", "ranged", "magic"].includes(filterByValue)) {
        return card.type.toLowerCase() === filterByValue
      } else if (
        [
          "fire",
          "water",
          "ice",
          "wind",
          "earth",
          "lightning",
          "light",
          "dark",
        ].includes(filterByValue)
      ) {
        return card.element.toLowerCase() === filterByValue
      } else if (["1-star"].includes(filterByValue)) {
        return card.starRating === "1"
      } else if (["2-star"].includes(filterByValue)) {
        return card.starRating === "2"
      } else if (["3-star"].includes(filterByValue)) {
        return card.starRating === "3"
      }
    })
    const filteredPlayerCards = playerCards.filter((card) => {
      if (["melee", "ranged", "magic"].includes(filterByValue)) {
        return card.type.toLowerCase() === filterByValue
      } else if (
        [
          "fire",
          "water",
          "ice",
          "wind",
          "earth",
          "lightning",
          "light",
          "dark",
        ].includes(filterByValue)
      ) {
        return card.element.toLowerCase() === filterByValue
      } else if (["2-star"].includes(filterByValue)) {
        return card.starRating === "2"
      } else if (["3-star"].includes(filterByValue)) {
        return card.starRating === "3"
      }
    })

    const deck: Card[] = newDeck
    const fixedFilteredDefaultCards = filteredDefaultCards.filter(
      (defaultCard) => !deck.some((deckCard) => deckCard.id === defaultCard.id)
    )
    const fixedFilteredPlayerCards = filteredPlayerCards.filter(
      (playerCard) => !deck.some((deckCard) => deckCard.id === playerCard.id)
    )

    // Update the state with the filtered arrays
    setRemainingDefaultCards(fixedFilteredDefaultCards)
    setRemainingPlayerCards(fixedFilteredPlayerCards)
  }

  // Deck name functions
  const handleInputDeckNameChange = (event: {
    target: { value: React.SetStateAction<string> }
  }) => {
    setInputDeckName(event.target.value)
  }
  const handleDeckNameChange = (event: {
    target: { value: React.SetStateAction<string> }
  }) => {
    sounds.highlightButton()
    setDeckName(event.target.value)
  }

  // Delete deck name functions
  const handleDeleteDeckNameChange = (event: {
    target: { value: React.SetStateAction<string> }
  }) => {
    sounds.highlightButton()
    setDeleteDeckName(event.target.value)
  }

  const fetchDeckNames = async () => {
    await axios.get(`/api/decks?owner=${owner}`).then((response) => {
      setDeckNames(response.data.map((deck: { name: any }) => deck.name))
      setDeckNames((prevNames) => [...prevNames, "Default Deck"])
      setDeleteDeckNames(response.data.map((deck: { name: any }) => deck.name))
      setDeleteDeckNames((prevNames) => [...prevNames, "Default Deck"])
    })
  }

  // Fetch deck names on component mount
  useEffect(() => {
    if (wallet?.publicKey) {
      fetchDeckNames()
    }
  }, [wallet])

  // Function to add a card to the deck

  const moveCardBack = (card: Card) => {
    // Check if the card is user owned or default
    if ((card.id as unknown as number) <= 1150) {
      const cardExists = remainingPlayerCards.some((crd) => crd.id === card.id)
      if (!cardExists) {
        // Send player owned card back to player cards array
        setRemainingPlayerCards((prevCards) => [...prevCards, card])
      }
    } else {
      const cardExists = remainingDefaultCards.some((crd) => crd.id === card.id)
      if (!cardExists) {
        // Send default card back to default cards array
        setRemainingDefaultCards((prevCards) => [...prevCards, card])
      }
    }
    // Remove the card from the newDeck
    setNewDeck((prevCards) => prevCards.filter((crd) => crd.id !== card.id))
    setDeckLootScore((prevScores) => prevScores - card.lootScore)
  }

  // Function to remove a card from the deck

  const moveCardToDeck = (
    card: Card,
    setCards: Dispatch<SetStateAction<Card[]>>
  ) => {
    if (newDeck.length >= 7) {
      tooManyCards()
      return
    } else if (!canAddHeroToDeck(playerCards, card, newDeck)) {
      alert(
        `You already have the maximum number of ${card.starRating}-star cards!`
      )
    } else {
      // Check if the card is NOT in the newDeck
      const cardExists = newDeck.some((crd) => crd.id === card.id)
      if (!cardExists) {
        // Add the card to newDeck
        setNewDeck((prevCards) => [...prevCards, card])
        setDeckLootScore((prevScores) => prevScores + card.lootScore)
      }

      // Remove the card from the appropriate array
      if ((card.id as unknown as number) < 1151) {
        setRemainingPlayerCards((prevCards) =>
          prevCards.filter((crd) => crd.id !== card.id)
        )
      } else {
        setRemainingDefaultCards((prevCards) =>
          prevCards.filter((crd) => crd.id !== card.id)
        )
      }
    }
  }

  // Fetch heroes when the component mounts & the wallet is connected
  useEffect(() => {
    // Function to pull NFT data from the blockchain
    // and add it to the Player Cards array
    const fetchHeroes = async () => {
      let heroes = await legendaryLootService.getAllLoadouts(
        wallet.publicKey,
        null
      )

      const playerCards = []
      for (let i = 0; i < heroes.length; i++) {
        let heroId = heroes[i].getNftId()
        const card = await createCardFromMetadata(heroId)
        playerCards.push(card)
      }

      setPlayerCards(playerCards)
      setRemainingPlayerCards(playerCards)
    }

    if (wallet?.publicKey) {
      fetchHeroes()
    }
  }, [wallet])

  // Function to check star rarity and limit cards based on owned NFTs

  function canAddHeroToDeck(
    heroes: Card[],
    newHero: Card,
    newDeck: Card[]
  ): boolean {
    const heroCount = heroes.length
    const newHeroRating = newHero.starRating

    // Count the number of heroes with 2-star and 3-star ratings in newDeck
    let twoStarHeroes = 0
    let threeStarHeroes = 0

    newDeck.forEach((hero) => {
      if (hero.starRating === "2") {
        twoStarHeroes++
      } else if (hero.starRating === "3") {
        threeStarHeroes++
      }
    })

    // Check the conditions based on the number of heroes owned
    if (heroCount < 5) {
      if (newHeroRating === "3" && threeStarHeroes >= 1) {
        return false
      } else if (newHeroRating === "2" && twoStarHeroes >= 2) {
        return false
      }
    } else if (heroCount >= 5 && heroCount <= 10) {
      if (newHeroRating === "3" && threeStarHeroes >= 2) {
        return false
      } else if (newHeroRating === "2" && twoStarHeroes >= 3) {
        return false
      }
    } else {
      if (newHeroRating === "3" && threeStarHeroes >= 3) {
        return false
      }
    }

    return true
  }

  // Function to save the deck to the database

  async function handleOnClickSaveDeck() {
    if (wallet?.publicKey === null || wallet?.publicKey === undefined) {
      alert("Please connect your wallet to save a deck!")
      return
    } else if (newDeck.length < 7) {
      notEnoughCards()
      return
    } else if (inputDeckName === "Default Deck") {
      alert("You cannot overwrite the default deck!")
      return
    } else if (deckNames.includes(inputDeckName)) {
      alert(
        "You already have a deck with that name! Please choose a different name or delete the existing deck."
      )
      return
    } else {
      // Take the id of each card in the deck and add it to the newDeckCardIds array
      const newDeckCardIds = []
      newDeck.forEach((card) => {
        newDeckCardIds.push(card.id)
      })
      setNewDeckCardIds(newDeckCardIds)

      await axios
        .post("/api/decks", {
          name: inputDeckName,
          cards: newDeckCardIds,
          owner: owner,
          lootScore: deckLootScore,
        })
        .then(fetchDeckNames)
      alert("Deck saved!")
    }
  }

  // Function to load a deck from the database

  async function handleOnClickLoadDeck() {
    if (deckName === "Default Deck") {
      setNewDeck(defaultDeck)
      setRemainingPlayerCards(playerCards)
      setRemainingDefaultCards([])
      setInputDeckName(deckName)
      setDeckLootScore(700)
    } else {
      try {
        const response = await axios.get(`/api/decks?owner=${owner}`)

        const deck: Deck = response.data.find(
          (deck: { name: string }) => deck.name === deckName
        )

        if (deck) {
          const builtDeck: Card[] = []
          for (let i = 0; i < deck.cards.length; i++) {
            let heroId = deck.cards[i]
            const card = await createCardFromMetadata(heroId)
            builtDeck.push(card)
          }

          // Check if the deck is still valid
          // Make sure all cards in the deck are also in the users wallet
          /*
          if (!validateLoadedDeck(deck.cards, playerCards, defaultDeck)) {
            alert(
              "This deck is no longer valid! It will be deleted. Please open a support ticket in Discord if you believe this is an error."
            )
            deleteDeck(deckName, owner)
            handleOnClickNewDeck()
          } else { */
          setInputDeckName(deckName)
          setNewDeck(builtDeck)
          setDeckLootScore(deck.lootScore)
          // Filter out the cards with same card.id from defaultDeck and playerCards
          const filteredDefaultDeck = defaultDeck.filter(
            (defaultCard) =>
              !builtDeck.some((deckCard) => deckCard.id === defaultCard.id)
          )
          const filteredPlayerCards = playerCards.filter(
            (playerCard) =>
              !builtDeck.some((deckCard) => deckCard.id === playerCard.id)
          )

          // Update the state with the filtered arrays
          setRemainingDefaultCards(filteredDefaultDeck)
          setRemainingPlayerCards(filteredPlayerCards)
          //setRemainingDefaultCards(defaultDeck)
          //setRemainingPlayerCards(playerCards)
          //}
        } else {
          alert("Deck not found")
        }
      } catch (error) {
        console.error(error)
      }
    }
  }

  // Function for creating a new deck

  function handleOnClickNewDeck() {
    setNewDeck([])
    setDeckLootScore(0)
    setInputDeckName("New Deck")
    setRemainingDefaultCards(defaultDeck)
    setRemainingPlayerCards(playerCards)
    fetchDeckNames()
  }

  // Function for deleting a deck
  async function deleteDeck(deckName: string, owner: string) {
    await axios
      .delete(`/api/decks?name=${deckName}&owner=${owner}`)
      .then((response) => {
        fetchDeckNames()
        setDeleteDeckName("Default Deck")
        setDeckName("Default Deck")
        alert(`Deck: ${deckName} deleted!`)
      })
      .catch((error) => {
        console.error(error)
        // Handle any errors that may occur during the DELETE request
      })
  }

  // Function for handling the delete deck button

  async function handleOnClickDeleteDeck() {
    if (deleteDeckName === "Default Deck") {
      alert("You cannot delete the default deck!")
      return
    } else {
      deleteDeck(deleteDeckName, owner)
      handleOnClickNewDeck()
    }
  }

  // Function for resetting filters and sorting

  function handleOnClickUnsortUnfilter() {
    const deck: Card[] = newDeck
    const filteredDefaultDeck = defaultDeck.filter(
      (defaultCard) => !deck.some((deckCard) => deckCard.id === defaultCard.id)
    )
    const filteredPlayerCards = playerCards.filter(
      (playerCard) => !deck.some((deckCard) => deckCard.id === playerCard.id)
    )

    // Update the state with the filtered arrays
    setRemainingDefaultCards(filteredDefaultDeck)
    setRemainingPlayerCards(filteredPlayerCards)
  }

  // Functions for too many or too few cards

  function tooManyCards() {
    alert("You already have 7 cards in your deck!")
  }
  function notEnoughCards() {
    alert("You need 7 cards in your deck!")
  }

  function isCardInArray(card: Card, array: Card[]): boolean {
    return array.some((c) => c.id === card.id)
  }
  function validateLoadedDeck(
    loadedDeck: Card[],
    playerCards: Card[],
    defaultDeck: Card[]
  ): boolean {
    for (const card of loadedDeck) {
      if (
        !isCardInArray(card, playerCards) &&
        !isCardInArray(card, defaultDeck)
      ) {
        return false
      }
    }
    return true
  }
  useEffect(() => {
    const storedValue = localStorage.getItem("soundsEnabled")
    setSoundsEnabled(storedValue === "true")
  }, [])

  return (
    /* Deck Builder Page */

    <Container header={null}>
      {/* New Deck button */}
      <DndProvider backend={HTML5Backend}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div className="gap-2 m-4 flex justify-start align-center text-white shadow-black font-carta">
            <NavButton
              onMouseOver={() => {
                sounds.highlightButton()
              }}
              onClick={() => {
                sounds.backButton()
              }}
              link="/game"
            >
              <ArrowLeftIcon className="text-black h-5 w-5" />
              Back
            </NavButton>
            <button
              onMouseOver={sounds.highlightButton}
              onClick={() => {
                handleToggleSounds()
              }}
            >
              <Image
                className={`h-14 w-14 mx-3`}
                src={`/img/Wooden_UI/${soundsEnabled ? "volume" : "mute"}.png`}
                width={225}
                height={225}
                alt="Sound"
              />
            </button>
          </div>

          <div className="decks text-white shadow-black">
            <img className="book-img" src="/img/book.png" />

            <div className="decks-container">
              <div className="buttons flex ">
                {/* Unsort/Unfilter button */}

                <div className="m-4 justify-center font-carta hidden md:block">
                  <InteractiveButton
                    onMouseOver={() => {
                      sounds.highlightButton()
                    }}
                    onClick={() => {
                      sounds.backButton()
                      handleOnClickUnsortUnfilter()
                    }}
                    className={"mx-auto "}
                  >
                    Unsort/Unfilter
                  </InteractiveButton>
                </div>

                {/* Filter button and dropdown */}

                <div className="m-4 justify-start font-carta hidden md:block">
                  <InteractiveButton
                    onMouseOver={() => {
                      sounds.highlightButton()
                    }}
                    onClick={() => {
                      sounds.buttonClick()
                      handleOnClickFilterBy()
                    }}
                    className={"mx-auto "}
                  >
                    Filter By
                  </InteractiveButton>
                  <div className="m-2 text-black font-bold">
                    <select
                      onMouseOver={sounds.highlightButton}
                      onChange={handleFilterByChange}
                    >
                      {filterByValues.map((value) => (
                        <option key={value} value={value}>
                          {value}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Sort button and dropdown */}

                <div className="m-4 justify-start font-carta hidden md:block">
                  <InteractiveButton
                    onMouseOver={sounds.highlightButton()}
                    onClick={() => {
                      sounds.buttonClick()
                      handleOnClickSortBy()
                    }}
                    className={"mx-auto "}
                  >
                    Sort By
                  </InteractiveButton>
                  <div className="m-2 text-black font-bold">
                    <select
                      onMouseOver={sounds.highlightButton}
                      onChange={handleSortByChange}
                    >
                      {sortByValues.map((value) => (
                        <option key={value} value={value}>
                          {value}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="m-4 items-center font-carta">
                  <InteractiveButton
                    onMouseOver={() => {
                      sounds.highlightButton()
                    }}
                    onClick={() => {
                      sounds.buttonClick()
                      handleOnClickLoadDeck()
                    }}
                    className={"mx-auto "}
                  >
                    Load
                  </InteractiveButton>
                  <div className="m-2 text-black font-bold">
                    <select
                      onMouseOver={sounds.highlightButton}
                      value={deckName}
                      onChange={handleDeckNameChange}
                    >
                      {deckNames.map((option, index) => (
                        <option key={index} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="m-4 justify-center items-center">
                  <InteractiveButton
                    onMouseOver={() => {
                      sounds.highlightButton()
                    }}
                    onClick={() => {
                      sounds.backButton()
                      handleOnClickDeleteDeck
                    }}
                    className={"mx-auto"}
                  >
                    Delete
                  </InteractiveButton>
                  <div className="m-2 text-black font-bold">
                    <select
                      onMouseOver={sounds.highlightButton}
                      value={deleteDeckName}
                      onChange={handleDeleteDeckNameChange}
                    >
                      {deleteDeckNames.map((option, index) => (
                        <option key={index} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <div className="flex items-start bg-black-500 decks-wrapper">
                <div>
                  <div className="deck">
                    {/* Player card array display */}

                    <div className="deck-title">
                      <h3 className="text-lg text-white text-center font-carta m-2">
                        Your Cards
                      </h3>
                    </div>

                    <div className="deck-cards overflow-y-auto max-h-52 sm:max-h-72">
                      {remainingPlayerCards.map((card) => (
                        <button
                          key={card.id}
                          onClick={() => {
                            sounds.buttonClick()
                            moveCardToDeck(card, setRemainingPlayerCards)
                          }}
                        >
                          {
                            <HeroCard
                              size={isMobile ? "xsmall" : "small"}
                              card={card}
                              attackAnimationData={null}
                            />
                          }
                        </button>
                      ))}
                      {remainingPlayerCards.length < 8
                        ? Array(8 - remainingPlayerCards.length)
                            .fill(null)
                            .map(() => (
                              <BlankCard size={isMobile ? "xsmall" : "small"} />
                            ))
                        : null}
                    </div>
                  </div>
                  <div className="deck mt-4">
                    {/* Default card array display */}

                    <div className="deck-title">
                      <h3 className="text-lg text-white text-center font-carta m-2">
                        Starting Cards
                      </h3>
                    </div>
                    {}
                    <div className="deck-cards max-h-52 sm:max-h-72">
                      {remainingDefaultCards.map((card) => (
                        <button
                          key={card?.id}
                          onClick={() => {
                            sounds.buttonClick()
                            moveCardToDeck(card, setRemainingDefaultCards)
                          }}
                        >
                          {card ? (
                            <HeroCard
                              size={isMobile ? "xsmall" : "small"}
                              card={card}
                              attackAnimationData={null}
                            />
                          ) : (
                            <BlankCard size={isMobile ? "xsmall" : "small"} />
                          )}
                        </button>
                      ))}
                      {Array(8 - remainingDefaultCards.length)
                        .fill(null)
                        .map(() => (
                          <BlankCard size={isMobile ? "xsmall" : "small"} />
                        ))}
                    </div>
                  </div>
                </div>

                <div className="deck">
                  {/* New deck display */}

                  <div className="deck-title">
                    <h3 className="text-lg text-white text-center font-carta m-2">
                      Your Deck - {`Loot Score: ${deckLootScore}`}
                    </h3>
                  </div>

                  <div className="deck-cards justify-self-center max-h-52 sm:max-h-72">
                    {newDeck.map((card) => (
                      <button
                        key={card.id}
                        onClick={() => {
                          sounds.backButton()
                          moveCardBack(card)
                        }}
                      >
                        {
                          <HeroCard
                            size={isMobile ? "xsmall" : "small"}
                            card={card}
                            attackAnimationData={null}
                          />
                        }
                      </button>
                    ))}
                    {Array(8 - newDeck.length)
                      .fill(null)
                      .map(() => (
                        <BlankCard size={isMobile ? "xsmall" : "small"} />
                      ))}
                  </div>
                  {/* Save/Load/New deck buttons */}

                  <div className="m-4 flex justify-center items-center">
                    <div className="m-2 text-black font-bold">
                      <input
                        className="text-center font-carta "
                        type="text"
                        name="deck_name"
                        id="deck_name"
                        value={inputDeckName}
                        onChange={handleInputDeckNameChange}
                      ></input>
                    </div>
                    <InteractiveButton
                      onMouseOver={() => {
                        sounds.highlightButton()
                      }}
                      onClick={() => {
                        sounds.buttonClick()
                        handleOnClickSaveDeck()
                      }}
                      className={"mx-auto "}
                    >
                      Save
                    </InteractiveButton>
                  </div>

                  <div className="m-4 flex justify-center font-carta">
                    <InteractiveButton
                      onMouseOver={() => {
                        sounds.highlightButton()
                      }}
                      onClick={() => {
                        sounds.buttonClick()
                        handleOnClickNewDeck()
                      }}
                      className={"mx-auto "}
                    >
                      New Deck
                    </InteractiveButton>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
          .book-img {
            display: none;
          }
          @media (min-width: 1024px) {
            .book-img {
              display: block;
            }
          }
          .deck-title h3 {
            display: inline-block;
          }

          .deck-title {
            position: absolute;
            left: 16px;
            top: 0;
            display: inline-block;
            padding: 0 16px;
            border-radius: 4px;
            background: url("/img/frame-bg.png") center;
            background-size: contain;
          }
          .buttons {
            overflow-x: scroll;
            max-width: 100vw;
          }

          @media (min-width: 1024px) {
            .buttons {
              overflow-x: unset;
              max-width: unset;
            }

            .decks-container {
              position: absolute;
              top: 5%;
              left: 0;
              right: 0;
              margin: 0 auto;
              display: flex;
              flex-direction: column;
              align-items: center;
            }
          }

          .deck {
            padding: 8px 0 0;
          }

          .deck,
          .decks {
            position: relative;
          }

          .decks img {
            opacity: 0.7;
          }

          .decks-container {
            max-width: 100%;
          }

          .deck-cards {
            background: url("/img/bg_01_02.png") center no-repeat;
            background-size: cover;
            border-radius: 4px;
            display: grid;
            align-items: start;
            grid-template-columns: repeat(4, 1fr);
            border-top: 4px solid #8f663e;
            border-bottom: 4px solid #8f663e;
            border-radius: 4px;
            margin-top: 32px;
            padding: 32px;
            gap: 12px;
          }

          .decks-wrapper {
            flex-direction: column;
            gap: 32px;
          }
          @media (min-width: 1024px) {
            .decks-wrapper {
              flex-direction: row;
              gap: 16px;
            }
          }
        `}</style>
      </DndProvider>
    </Container>
  )
}
