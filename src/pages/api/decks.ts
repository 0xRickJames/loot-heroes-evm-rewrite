import { NextApiRequest, NextApiResponse } from "next"
import { connectToMongodbDecks } from "../../utils/connectToMongodb"
import { ObjectId } from "mongodb"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req
  const { db } = await connectToMongodbDecks()

  switch (method) {
    case "GET":
      const owner = req.query.owner as string
      const decks = await db.collection("decks").find({ owner }).toArray()
      res.status(200).json(decks)
      break
    case "POST":
      const { name, cards, owner: postOwner, lootScore } = req.body
      const newDeck = { name, cards, owner: postOwner, lootScore }
      await db.collection("decks").insertOne(newDeck)
      res.status(201).json(newDeck)
      break
    case "DELETE":
      const { name: deckName, owner: deleteOwner } = req.query
      const result = await db
        .collection("decks")
        .deleteOne({ name: deckName, owner: deleteOwner })
      if (result.deletedCount === 0) {
        res
          .status(404)
          .json({ message: "Deck not found or not owned by the user" })
      } else {
        res.status(200).json({ message: "Deck deleted" })
      }
      break
    default:
      res.setHeader("Allow", ["GET", "POST", "DELETE"])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
