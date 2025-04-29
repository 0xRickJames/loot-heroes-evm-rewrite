// /pages/api/leaderboard.ts
import { NextApiRequest, NextApiResponse } from "next"
import { connectToMongodbPlayers } from "../../utils/connectToMongodb"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req
  const { db } = await connectToMongodbPlayers()

  switch (method) {
    case "GET":
      const topPlayers = await db
        .collection("players")
        .find()
        .sort({ eloTournament: -1 })
        //.limit(9)
        .toArray()

      const topPlayersInSeconds = topPlayers.map((player) => ({
        ...player,
        averageTurnTime: (player.averageTurnTime / 1000).toFixed(1),
      }))

      res.status(200).json(topPlayersInSeconds)
      break

    default:
      res.setHeader("Allow", ["GET"])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
