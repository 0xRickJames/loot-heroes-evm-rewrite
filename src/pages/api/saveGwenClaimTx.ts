import { ObjectId } from "mongodb"
import { NextApiRequest, NextApiResponse } from "next"
import {
  connectToMongodbGwenRewards,
  connectToMongodbPlayers,
} from "src/utils/connectToMongodb"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { db } = await connectToMongodbGwenRewards()
    const { txId } = req.body
    const collection = await db.collection("gwenRewards")
    const defaultValues = {
      _id: new ObjectId(),
      txId: txId,
      confirmed: false,
    }

    await collection.insertOne(defaultValues)
    console.log("Saved GWEN Claim Database Entry")
    res.status(200).send("Saved GWEN Claim Database Entry")
  } catch (error) {
    console.error(error)
    res
      .status(500)
      .json({ error: "An error occurred while processing your request." })
  }
}
