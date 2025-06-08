import { useCallback, useEffect, useState } from "react"
import {
  WalletModalProvider,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui"
import {
  Connection,
  SystemProgram,
  Transaction,
  LAMPORTS_PER_SOL,
  clusterApiUrl,
  Keypair,
  sendAndConfirmTransaction,
  address,
} from "@solana/web3.js"
import {
  getOrCreateAssociatedTokenAccount,
  createTransferInstruction,
  TOKEN_PROGRAM_ID,
  AccountLayout,
} from "@solana/spl-token"
import * as bs58 from "bs58"
import axios from "axios"
import { WalletProvider, useWallet } from "@solana/wallet-adapter-react"
import Image from "next/image"
import Modal from "react-modal"
import { InfinitySpin } from "react-loader-spinner"
import { NextApiRequest, NextApiResponse } from "next"
import { popoverClasses } from "@mui/material"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { solAmount, address } = req.body
  try {
    // Create a new transaction

    const connection = new Connection(
      "https://lively-ultra-lambo.solana-mainnet.quiknode.pro/72c8ec506f45d1f495fcfe29fe00c039a322a863/"
    )
    const transaction = new Transaction()

    const owneraddress: address = new address(address)
    transaction.feePayer = owneraddress
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
      new address(gwenAddress),
      merchantKeypair.address
    )
    console.log("getting destination")
    const destinationTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      merchantKeypair,
      new address(gwenAddress),
      owneraddress
    )
    console.log("more instructions")
    transaction.add(
      createTransferInstruction(
        sourceTokenAccount.address,
        destinationTokenAccount.address,
        merchantKeypair.address,
        solAmount * 10000 * Math.pow(10, 2),
        [],
        TOKEN_PROGRAM_ID
      )
    )
    console.log("add instructions")
    // Add SOL transfer instruction
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: owneraddress,
        toPubkey: merchantKeypair.address,
        lamports: solAmount * LAMPORTS_PER_SOL,
      })
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
