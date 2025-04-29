// /pages/api/leaderboard.ts
import { NextApiRequest, NextApiResponse } from "next"
import {
  connectToMongodbDungeonTournaments,
  connectToMongodbPlayers,
} from "../../utils/connectToMongodb"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req
  const { db } = await connectToMongodbDungeonTournaments()

  switch (method) {
    case "GET":
      const topPlayers = await db
        .collection("tournamentThree")
        .find()
        .sort({ renown: -1, losses: 1, ties: 1 })
        //.limit(9)
        .toArray()

      res.status(200).json(topPlayers)
      break

    default:
      res.setHeader("Allow", ["GET"])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
