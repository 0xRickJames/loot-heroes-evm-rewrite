import { NextApiRequest, NextApiResponse } from "next"
import { connectToMongodbPlayers } from "../../utils/connectToMongodb"
import { MongoClient, ObjectId, WithId } from "mongodb"
import { publicKey } from "@project-serum/anchor/dist/cjs/utils"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req
  const { db } = await connectToMongodbPlayers()

  switch (method) {
    case "PUT":
      const { publicKey: publicKey, lastUsedDeck: lastUsedDeck } = req.query

      // Check if either playerName or playerPfp is provided
      if (lastUsedDeck) {
        const updateFields: any = {}
        if (lastUsedDeck && lastUsedDeck !== "undefined") {
          updateFields.lastUsedDeck = lastUsedDeck
        }

        const updateResult = await db
          .collection("players")
          .updateOne({ player: publicKey }, { $set: updateFields })
        if (updateResult.modifiedCount > 0) {
          res
            .status(200)
            .json({ message: "Last used deck updated successfully" })
        } else {
          res.status(404).json({ message: "Player not found" })
        }
      } else {
        res.status(400).json({
          message: "Invalid request. Something went wrong.",
        })
      }

      break

    default:
      res.setHeader("Allow", ["GET", "PUT"])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
