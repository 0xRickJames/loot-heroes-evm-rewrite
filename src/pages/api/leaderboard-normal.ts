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
        .sort({ eloNormal: -1 })
        //.limit(9)
        .toArray()

      res.status(200).json(topPlayers)
      break

    default:
      res.setHeader("Allow", ["GET"])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
