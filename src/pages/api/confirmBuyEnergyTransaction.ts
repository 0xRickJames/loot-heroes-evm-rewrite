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
  PublicKey,
  Account,
  TransactionInstruction,
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
import {
  DatabaseConnection,
  connectToMongodbEnergyRefills,
  connectToMongodbPlayers,
} from "../../utils/connectToMongodb"

import { TransactionResponse } from "@solana/web3.js"
import { delay } from "src/components/Game/Pvp/HeroCard"
import { ObjectId } from "mongodb"

const refillEnergy = async (publicKey: string, energyAmount: number) => {
  try {
    const { db } = await connectToMongodbPlayers()
    const updateFields: any = {}
    const player = await db.collection("players").findOne({ player: publicKey })
    const currentEnergy: number = player.energy as number
    const newEnergy: number = currentEnergy + energyAmount
    updateFields.energy = newEnergy
    db.collection("players").updateOne(
      { player: publicKey },
      { $set: updateFields }
    )
  } catch (error) {
    console.error(error) // Handle any errors that occur during the API call
  }
}

const logTransactionData = async (transactionId: string): Promise<void> => {
  // Create a connection to the Solana network
  const connection = new Connection(
    "https://lively-ultra-lambo.solana-mainnet.quiknode.pro/72c8ec506f45d1f495fcfe29fe00c039a322a863/"
  )
  // Retrieve the transaction details
  const transactionResponse = await connection.getTransaction(transactionId)

  // Check if the transaction was found
  if (!transactionResponse) {
    console.error("Transaction not found")
    return
  }

  // Log the transaction details

  console.log(
    `Token Name = ${
      transactionResponse.meta.preTokenBalances[0].mint ===
      "AZhBUTBndtW21kM4gJochrXCA25nD258mjZCYJDQbiUg"
        ? "GWEN"
        : "Not GWEN"
    }`
  )
  console.log(
    `Token Owner = ${
      transactionResponse.meta.preTokenBalances[0].owner ===
      "AaMBmepCxwpGsfTJtiXi1wE9xj5pNMaDizXVsyG91mK9"
        ? "Merchant"
        : transactionResponse.meta.preTokenBalances[0].owner
    }`
  )
  console.log(
    "Pre balance",
    transactionResponse.meta.preTokenBalances[0].uiTokenAmount.uiAmountString
  )
  console.log(
    "Post balance",
    transactionResponse.meta.postTokenBalances[0].uiTokenAmount.uiAmountString
  )
  const preBalanceOne = transactionResponse.meta.preTokenBalances[0]
    .uiTokenAmount.uiAmountString as unknown as number
  const postBalanceOne = transactionResponse.meta.postTokenBalances[0]
    .uiTokenAmount.uiAmountString as unknown as number
  const tokenChangeOne = preBalanceOne - postBalanceOne
  console.log("Token Change", tokenChangeOne)
  console.log(
    `Token Name = ${
      transactionResponse.meta.preTokenBalances[1].mint ===
      "AZhBUTBndtW21kM4gJochrXCA25nD258mjZCYJDQbiUg"
        ? "GWEN"
        : "Not GWEN"
    }`
  )
  console.log(
    `Token Owner = ${
      transactionResponse.meta.preTokenBalances[1].owner ===
      "AaMBmepCxwpGsfTJtiXi1wE9xj5pNMaDizXVsyG91mK9"
        ? "Merchant"
        : transactionResponse.meta.preTokenBalances[1].owner
    }`
  )
  console.log(
    "Pre balance",
    transactionResponse.meta.preTokenBalances[1].uiTokenAmount.uiAmountString
  )
  console.log(
    "Post balance",
    transactionResponse.meta.postTokenBalances[1].uiTokenAmount.uiAmountString
  )
  const preBalanceTwo = transactionResponse.meta.preTokenBalances[1]
    .uiTokenAmount.uiAmountString as unknown as number
  const postBalanceTwo = transactionResponse.meta.postTokenBalances[1]
    .uiTokenAmount.uiAmountString as unknown as number
  const tokenChangeTwo = preBalanceTwo - postBalanceTwo
  console.log("Token Change", tokenChangeTwo)
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { db } = await connectToMongodbEnergyRefills()
  const collection = await db.collection("energyRefills")
  const { tx } = req.body
  const defaultValues = {
    _id: new ObjectId(),
    txId: tx,
    owner: undefined,
    gwenSpent: undefined,
    energyReceived: false,
  }

  await collection.insertOne(defaultValues)
  try {
    const gwenAddress = process.env.NEXT_PUBLIC_GWEN_ADDRESS
    console.log(tx)
    delay(30000).then(async () => {
      // Create a connection to the Solana network
      const connection = new Connection(
        "https://lively-ultra-lambo.solana-mainnet.quiknode.pro/72c8ec506f45d1f495fcfe29fe00c039a322a863/"
      )
      // Retrieve the transaction details
      const transactionResponse = await connection.getTransaction(tx)

      // Check if the transaction was found
      if (!transactionResponse) {
        console.error("Transaction not found")
        return
      }

      const ownerOne = transactionResponse.meta.preTokenBalances[0].owner
      const ownerTwo = transactionResponse.meta.preTokenBalances[1].owner
      const mint = transactionResponse.meta.preTokenBalances[0].mint
      const ownerOnePre = transactionResponse.meta.preTokenBalances[0]
        .uiTokenAmount.uiAmountString as unknown as number
      const ownerOnePost = transactionResponse.meta.postTokenBalances[0]
        .uiTokenAmount.uiAmountString as unknown as number
      const balanceChangeOne = ownerOnePre - ownerOnePost
      const ownerTwoPre = transactionResponse.meta.preTokenBalances[1]
        .uiTokenAmount.uiAmountString as unknown as number
      const ownerTwoPost = transactionResponse.meta.postTokenBalances[1]
        .uiTokenAmount.uiAmountString as unknown as number
      const balanceChangeTwo = ownerTwoPre - ownerTwoPost

      if (
        ownerOne !== "AaMBmepCxwpGsfTJtiXi1wE9xj5pNMaDizXVsyG91mK9" &&
        ownerTwo !== "AaMBmepCxwpGsfTJtiXi1wE9xj5pNMaDizXVsyG91mK9"
      ) {
        console.log("Merchant not found in transaction")
        return
      }
      if (mint !== "AZhBUTBndtW21kM4gJochrXCA25nD258mjZCYJDQbiUg") {
        console.log("GWEN not found in transaction")
        return
      }
      if (
        (ownerOne === "AaMBmepCxwpGsfTJtiXi1wE9xj5pNMaDizXVsyG91mK9" &&
          balanceChangeOne >= 0) ||
        (ownerTwo === "AaMBmepCxwpGsfTJtiXi1wE9xj5pNMaDizXVsyG91mK9" &&
          balanceChangeTwo >= 0)
      ) {
        console.log("Merchant didn't receive GWEN")
        return
      }
      if (ownerOne !== "AaMBmepCxwpGsfTJtiXi1wE9xj5pNMaDizXVsyG91mK9") {
        const currentTxEntry = await collection.findOne({ txId: tx })
        if (currentTxEntry.energyReceived) {
          console.log("Energy was already received")
          return
        }
        refillEnergy(ownerOne, balanceChangeOne)
          .then(() => console.log("Energy updated"))
          .catch((error) => console.error("Failed to update database", error))
        console.log("Updating TX DB")
        collection.updateOne(
          { txId: tx },
          {
            $set: {
              owner: ownerOne,
              gwenSpent: balanceChangeOne,
              energyReceived: true,
            },
          }
        )
      } else if (ownerTwo !== "AaMBmepCxwpGsfTJtiXi1wE9xj5pNMaDizXVsyG91mK9") {
        refillEnergy(ownerTwo, balanceChangeTwo)
          .then(() => {
            console.log("Energy updated")
            console.log("Updating TX DB")
            collection.updateOne(
              { txId: tx },
              {
                $set: {
                  owner: ownerTwo,
                  gwenSpent: balanceChangeTwo,
                  energyReceived: true,
                },
              }
            )
          })
          .catch((error) => console.error("Failed to update database", error))
      }

      //logTransactionData(tx) //(txId)"2DfAnGsd1LWFuZNee6b1y61txs4fCzwDSmFmE8LRKnvtR9WmdJgaesB36GcE61bxaDA615iedafwxeh9t8M6JyVY"

      // Send the transaction data back to the client
      res.status(200).json({ tx })
    })
  } catch (error) {
    console.error(error)
    res
      .status(500)
      .json({ error: "An error occurred while processing your request." })
  }
}
