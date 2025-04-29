import { NextApiRequest, NextApiResponse } from "next"
import { connectToMongodbPlayers } from "../../utils/connectToMongodb"
import { MongoClient, ObjectId, WithId } from "mongodb"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req
  const { db } = await connectToMongodbPlayers()

  switch (method) {
    case "GET":
      const { publicKey } = req.query // Assuming the publicKey is passed as a query parameter
      const collection = await db.collection("players")
      const player = await db
        .collection("players")
        .findOne({ player: publicKey })

      if (player) {
        const {
          playerName,
          eloNormal,
          winsNormal,
          lossesNormal,
          tiesNormal,
          eloTournament,
          winsTournament,
          lossesTournament,
          tiesTournament,
          playerPfp,
          highestDungeonLevel,
          energy,
          lastUsedDeck,
          highestDarkDungeonLevel,
          unclaimedGwen,
          lastClaimTimestamp,
        } = player
        res.status(200).json({
          playerName,
          eloNormal,
          winsNormal,
          lossesNormal,
          tiesNormal,
          eloTournament,
          winsTournament,
          lossesTournament,
          tiesTournament,
          playerPfp,
          highestDungeonLevel,
          energy,
          lastUsedDeck,
          highestDarkDungeonLevel,
          unclaimedGwen,
          lastClaimTimestamp,
        })
      } else if (!player) {
        const defaultValues = {
          _id: new ObjectId(),
          player: publicKey,
          playerName: publicKey,
          eloNormal: 1000,
          averageTurnTime: 0,
          winsNormal: 0,
          lossesNormal: 0,
          tiesNormal: 0,
          eloTournament: 1000,
          winsTournament: 0,
          lossesTournament: 0,
          tiesTournament: 0,
          highestDungeonLevel: 0,
          energy: 10,
          lastUsedDeck: "Default Deck",
          playerPfp: "/img/game/pfp.png",
          highestDarkDungeonLevel: 0,
          unclaimedGwen: 0,
          lastClaimTimestamp: 0,
        }

        await collection.insertOne(defaultValues)
        res.status(200).json(defaultValues)
      } else {
        res.status(404).json({ message: "Player not found" })
      }
      break

    case "PUT":
      const {
        publicKey: updatePublicKey,
        playerName: updatePlayerName,
        playerPfp: updatePlayerPfp,
      } = req.query

      // Check if either playerName or playerPfp is provided
      if (updatePlayerName || updatePlayerPfp) {
        const updateFields: any = {}
        if (updatePlayerName && updatePlayerName !== "undefined") {
          updateFields.playerName = updatePlayerName
        }
        if (updatePlayerPfp && updatePlayerPfp !== "[object Object]") {
          updateFields.playerPfp = updatePlayerPfp
        }

        const updateResult = await db
          .collection("players")
          .updateOne({ player: updatePublicKey }, { $set: updateFields })

        if (updateResult.modifiedCount > 0) {
          res
            .status(200)
            .json({ message: "Player profile updated successfully" })
        } else {
          res.status(404).json({ message: "Player not found" })
        }
      } else {
        res.status(400).json({
          message: "Invalid request. playerName or playerPfp is required",
        })
      }
      break

    default:
      res.setHeader("Allow", ["GET", "PUT"])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
