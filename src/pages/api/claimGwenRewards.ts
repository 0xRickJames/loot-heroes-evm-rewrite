import {
  Connection,
  SystemProgram,
  Transaction,
  LAMPORTS_PER_SOL,
  clusterApiUrl,
  Keypair,
  sendAndConfirmTransaction,
  PublicKey,
} from "@solana/web3.js"
import {
  getOrCreateAssociatedTokenAccount,
  createTransferInstruction,
  TOKEN_PROGRAM_ID,
  AccountLayout,
} from "@solana/spl-token"
import * as bs58 from "bs58"
import { NextApiRequest, NextApiResponse } from "next"
import { connectToMongodbPlayers } from "src/utils/connectToMongodb"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { db } = await connectToMongodbPlayers()
  const { timestamp, publicKey } = req.body
  const player = await db.collection("players").findOne({ player: publicKey })
  let unclaimedGwen = 0
  if (player) {
    unclaimedGwen = player.unclaimedGwen
    const currentTime = Date.now() // Current time in seconds
    if (currentTime - player.lastClaimTimestamp < 300000) {
      console.log("too soon!")
      return
    }
  }
  db.collection("players").updateOne(
    { player: publicKey },
    { $set: { lastClaimTimestamp: timestamp } }
  )

  try {
    // Create a new transaction

    const connection = new Connection(
      "https://lively-ultra-lambo.solana-mainnet.quiknode.pro/72c8ec506f45d1f495fcfe29fe00c039a322a863/"
    )
    const transaction = new Transaction()

    const ownerPublicKey: PublicKey = new PublicKey(publicKey)
    transaction.feePayer = ownerPublicKey
    const merchantPrivateKey = process.env.MERCHANT_PRIVATE_KEY
    const gwenAddress = process.env.NEXT_PUBLIC_GWEN_ADDRESS
    console.log("make merchant keypair")

    const merchantKeypair = Keypair.fromSecretKey(
      bs58.decode(merchantPrivateKey)
    )

    console.log("Getting source")
    // Add SPL token transfer instruction
    const sourceTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      merchantKeypair,
      new PublicKey(gwenAddress),
      merchantKeypair.publicKey
    )
    console.log("getting destination")
    const destinationTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      merchantKeypair,
      new PublicKey(gwenAddress),
      ownerPublicKey
    )
    console.log("more instructions")
    transaction.add(
      createTransferInstruction(
        sourceTokenAccount.address,
        destinationTokenAccount.address,
        merchantKeypair.publicKey,
        unclaimedGwen * Math.pow(10, 2),
        [],
        TOKEN_PROGRAM_ID
      )
    )

    transaction.recentBlockhash = (
      await connection.getLatestBlockhash()
    ).blockhash

    console.log("signing with merchant keypair")

    transaction.sign(merchantKeypair)

    console.log("sending json to frontend")

    res.status(200).send(
      JSON.stringify(
        transaction.serialize({
          requireAllSignatures: false,
          verifySignatures: false,
        })
      )
    )
  } catch (error) {
    console.error(error)
    res
      .status(500)
      .json({ error: "An error occurred while processing your request." })
  }
}
