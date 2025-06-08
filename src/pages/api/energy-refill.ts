import { NextApiRequest, NextApiResponse } from "next"
import { connectToMongodbPlayers } from "../../utils/connectToMongodb"
import { MongoClient, ObjectId, WithId } from "mongodb"
import { address } from "@project-serum/anchor/dist/cjs/utils"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req
  const { db } = await connectToMongodbPlayers()

  switch (method) {
    case "PUT":
      const { address: address, energyAmount: energyAmount } = req.query

      // Check if either playerName or playerPfp is provided
      if (energyAmount) {
        const updateFields: any = {}
        if (energyAmount && energyAmount !== "undefined") {
          // add energyAmount to player's energy
          // get player's current energy
          const player = await db
            .collection("players")
            .findOne({ player: address })
          const energyAmountInt = parseInt(energyAmount as string)
          const currentEnergy: number = player.energy as number
          const newEnergy: number = currentEnergy + energyAmountInt
          updateFields.energy = newEnergy
        }

        const updateResult = await db
          .collection("players")
          .updateOne({ player: address }, { $set: updateFields })
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
