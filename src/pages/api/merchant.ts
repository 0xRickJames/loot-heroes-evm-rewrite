import { NextApiRequest, NextApiResponse } from "next"
import {
  PublicKey,
  Transaction,
  Keypair,
  clusterApiUrl,
  Connection,
  SystemProgram,
} from "@solana/web3.js"
import {
  getAssociatedTokenAddress,
  getMint,
  getAccount,
  createTransferCheckedInstruction,
  createAssociatedTokenAccountInstruction,
} from "@solana/spl-token"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const SOLANA_DECIMALS = 9
  const walletSecretKey = new Uint8Array(req.body.walletSecretKey)
  const connection = new Connection(
    "https://lively-ultra-lambo.solana-mainnet.quiknode.pro/72c8ec506f45d1f495fcfe29fe00c039a322a863/"
  )
  const userWalletAddress = new PublicKey(req.body.userWalletAddress)
  const tsfWalletAddress = Keypair.fromSecretKey(walletSecretKey)

  const payingTokenAddressAsString = req.body.payingTokenAddressAsString
  const isSolanaTransaction = payingTokenAddressAsString === "solana"

  const receivingTokenAddress = new PublicKey(req.body.receivingTokenAddress)

  const payingAmount: number = req.body.payingAmount
  const receivingAmount: number = req.body.receivingAmount

  const userReceivingTokenAccount = await getAssociatedTokenAddress(
    receivingTokenAddress,
    userWalletAddress
  )
  const tsfReceivingTokenAccount = await getAssociatedTokenAddress(
    receivingTokenAddress,
    tsfWalletAddress.publicKey
  )

  // Get block hash
  const blockhashObj = await connection.getLatestBlockhash()
  const blockhash = blockhashObj.blockhash

  // Get mints
  const receivingTokenMint = await getMint(connection, receivingTokenAddress)

  // create transaction
  const transaction = new Transaction()
  transaction.feePayer = userWalletAddress
  transaction.recentBlockhash = blockhash

  try {
    await getAccount(connection, userReceivingTokenAccount)
  } catch (error) {
    // means the user doesn't have the account
    transaction.add(
      createAssociatedTokenAccountInstruction(
        userWalletAddress,
        userReceivingTokenAccount,
        userWalletAddress,
        receivingTokenAddress
      )
    )
  }

  if (isSolanaTransaction) {
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: userWalletAddress,
        toPubkey: tsfWalletAddress.publicKey,
        lamports: payingAmount * 10 ** SOLANA_DECIMALS,
      })
    )
  } else {
    const payingTokenAddress = new PublicKey(payingTokenAddressAsString)

    // Create associated token accounts for my token if they don't exist yet
    const userPayingTokenAccount = await getAssociatedTokenAddress(
      payingTokenAddress,
      userWalletAddress
    )
    const tsfPayingTokenAccount = await getAssociatedTokenAddress(
      payingTokenAddress,
      tsfWalletAddress.publicKey
    )

    // Get mint
    const payingTokenMint = await getMint(connection, payingTokenAddress)

    transaction.add(
      createTransferCheckedInstruction(
        userPayingTokenAccount, // source
        payingTokenAddress, // mint
        tsfPayingTokenAccount, // destination
        userWalletAddress, // owner of source account
        payingAmount * 10 ** payingTokenMint.decimals,
        payingTokenMint.decimals
      )
    )
  }

  transaction.add(
    createTransferCheckedInstruction(
      tsfReceivingTokenAccount, // source
      receivingTokenAddress, // mint
      userReceivingTokenAccount, // destination
      tsfWalletAddress.publicKey, // owner of source account
      receivingAmount * 10 ** receivingTokenMint.decimals,
      receivingTokenMint.decimals
    )
  )

  // sign transaction
  transaction.sign(tsfWalletAddress)

  // serialize and return
  const serializedTransaction = transaction.serialize({
    requireAllSignatures: false,
  })
  const transactionBase64 = serializedTransaction.toString("base64")

  res.status(200).json({ transaction: transactionBase64 })
}
