// /pages/api/leaderboard-tournament-zero.ts
import { NextApiRequest, NextApiResponse } from "next"
import { connectToMongodbTournamentPlayers } from "../../utils/connectToMongodb"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req
  const { db } = await connectToMongodbTournamentPlayers()

  switch (method) {
    case "GET":
      const topPlayers = await db
        .collection("tournamentZeroPlayers")
        .find()
        .sort({ elo: -1 })
        //.limit(9)
        .toArray()

      res.status(200).json(topPlayers)
      break

    default:
      res.setHeader("Allow", ["GET"])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
