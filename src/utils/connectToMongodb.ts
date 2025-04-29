import { MongoClient, Db } from "mongodb"

const uri =
  "mongodb+srv://eduardorichardlootheroes:8qRqciAsDZUgZLxr@cluster0.8zqx2ia.mongodb.net/"
const client = new MongoClient(uri)

export interface DatabaseConnection {
  db: Db
  client: MongoClient
}

export async function connectToMongodbDecks(): Promise<DatabaseConnection> {
  try {
    // Attempt to connect to the database
    await client.connect()
  } catch (error) {
    // If there's an error, log it and throw it to be handled by the caller
    console.error("Error connecting to MongoDB:", error)
    throw error
  }

  const db = client.db("decks")
  return { db, client }
}
export async function connectToMongodbEnergyRefills(): Promise<DatabaseConnection> {
  try {
    // Attempt to connect to the database
    await client.connect()
  } catch (error) {
    // If there's an error, log it and throw it to be handled by the caller
    console.error("Error connecting to MongoDB:", error)
    throw error
  }

  const db = client.db("energyRefills")
  return { db, client }
}
export async function connectToMongodbGwenRewards(): Promise<DatabaseConnection> {
  try {
    // Attempt to connect to the database
    await client.connect()
  } catch (error) {
    // If there's an error, log it and throw it to be handled by the caller
    console.error("Error connecting to MongoDB:", error)
    throw error
  }

  const db = client.db("gwenRewards")
  return { db, client }
}
export async function connectToMongodbPlayers(): Promise<DatabaseConnection> {
  try {
    // Attempt to connect to the database
    await client.connect()
  } catch (error) {
    // If there's an error, log it and throw it to be handled by the caller
    console.error("Error connecting to MongoDB:", error)
    throw error
  }

  const db = client.db("players")
  return { db, client }
}
export async function connectToMongodbTournamentPlayers(): Promise<DatabaseConnection> {
  try {
    // Attempt to connect to the database
    await client.connect()
  } catch (error) {
    // If there's an error, log it and throw it to be handled by the caller
    console.error("Error connecting to MongoDB:", error)
    throw error
  }

  const db = client.db("tournamentPlayers")
  return { db, client }
}
export async function connectToMongodbDungeonTournaments(): Promise<DatabaseConnection> {
  try {
    // Attempt to connect to the database
    await client.connect()
  } catch (error) {
    // If there's an error, log it and throw it to be handled by the caller
    console.error("Error connecting to MongoDB:", error)
    throw error
  }

  const db = client.db("dungeonTournaments")
  return { db, client }
}
