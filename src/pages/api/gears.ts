import { NextApiRequest, NextApiResponse } from "next"
import {
  JsonMetadata,
  Metaplex,
  Nft,
  Sft,
  bundlrStorage,
  keypairIdentity,
  removeUndefinedAttributes,
} from "@metaplex-foundation/js"
import {
  Connection,
  Keypair,
  Transaction,
  TransactionInstruction,
  ComputeBudgetProgram,
} from "@solana/web3.js"
import production from "src/environments/production"
import { web3 } from "@project-serum/anchor"
import gear from "src/assets/gear.json"

import { MetadataJsonAttribute } from "@metaplex/js"
import {
  burn,
  createAssociatedTokenAccountInstruction,
  createCloseAccountInstruction,
  createTransferCheckedInstruction,
  getAssociatedTokenAddress,
} from "@solana/spl-token"
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token"
import {
  address,
  SystemProgram,
  SYSVAR_INSTRUCTIONS_PUBKEY,
} from "@solana/web3.js"
import {
  PROGRAM_ID,
  createBurnInstruction,
  createTransferInstruction,
} from "@metaplex-foundation/mpl-token-metadata"

import { toBigNumber } from "@metaplex-foundation/js"
import { address } from "@project-serum/anchor/dist/cjs/utils"
import { TokenStandard } from "@metaplex-foundation/mpl-token-metadata"
import { createBurnInstruction as oldCreateBurnInstruction } from "@solana/spl-token"

import * as bs58 from "bs58"
function isSft(obj: any): obj is Sft {
  return "propertyOrMethod" in obj // Replace 'propertyOrMethod' with a property or method that exists on Sft
}
function isNft(obj: any): obj is Nft {
  return "propertyOrMethod" in obj // Replace 'propertyOrMethod' with a property or method that exists on Sft
}

const hostUrl =
  process && process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : "https://www.lootheroes.io"

/**
 * API route that mounts a transaction to:
 * 1. Burn the user's gear NFTs, and
 * 2. Equip the new gear NFTs using the Loot Heroes program.
 * 3. Generate a new NFT image using the composer.
 * 4. Upload a new NFT json metadata,
 * 5. Update the NFT on Metaplex,
 * 6. After adding all the instructions, sign the transaction with the NFT authority,
 * and send the transaction as a JSON response.
 *
 * Sends everything as a serialized transaction, to be signed by the user's wallet, and broadcasted to Solana.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { mint, owner, selected } = req.body

    const merchantPrivateKey = process.env.MERCHANT_PRIVATE_KEY
    const merchantKeypair = Keypair.fromSecretKey(
      bs58.decode(merchantPrivateKey)
    )
    const merchantaddress = new address(
      "AaMBmepCxwpGsfTJtiXi1wE9xj5pNMaDizXVsyG91mK9"
    )
    const kp = web3.Keypair.fromSecretKey(
      Uint8Array.from(JSON.parse(`[${process.env.LOOT_HEROES_PRIVATE_KEY}]`))
    )

    const connection = new Connection(production.solana.rpcHost)
    const metaplex = new Metaplex(
      new Connection(
        "https://lively-ultra-lambo.solana-mainnet.quiknode.pro/72c8ec506f45d1f495fcfe29fe00c039a322a863/"
      )
    ) // always use mainnet for Metaplex, because uploadMetadata doesn't work on localnet
      .use(keypairIdentity(kp))
      .use(bundlrStorage())

    const nft: LootHeroesNft = await metaplex.nfts().findByMint({
      mintAddress: new web3.address(mint),
    })
    const computePriceIx = ComputeBudgetProgram.setComputeUnitPrice({
      microLamports: 1,
    })

    const computeLimitIx = ComputeBudgetProgram.setComputeUnitLimit({
      units: 1_000_000,
    })
    const tx = new Transaction()

    const owneraddress = new web3.address(owner)
    tx.feePayer = owneraddress
    tx.add(computePriceIx, computeLimitIx)

    // --- 1. Start the instructions to burn the Gear NFTs ---

    // Add the instructions to burn the items, and save the items as a variable to be equipped in the next step
    const itemsToAdd: {
      [key: string]: string
    } = {}

    for (const item of selected) {
      // burn gear
      const gearMint = new web3.address(item.externalMetaplexNft.mint)
      const senderATA = await getAssociatedTokenAddress(gearMint, owneraddress)

      const token = await metaplex.nfts().findByMint({ mintAddress: gearMint })
      const oldGearCreator = "79XjRxfmHsugKCNJRFXtQoZ8JEnLywstSadezho77QaE"
      const newGearCreator = "AaMBmepCxwpGsfTJtiXi1wE9xj5pNMaDizXVsyG91mK9"
      if (
        token.creators?.find(
          (value) => value.address.toBase58() === oldGearCreator
        )
      ) {
        console.log("old")

        const burnIx = oldCreateBurnInstruction(
          senderATA,
          new web3.address(item.externalMetaplexNft.mint),
          owneraddress,
          1
        )

        const closeIx = createCloseAccountInstruction(
          senderATA,
          owneraddress,
          owneraddress
        )

        tx.add(burnIx, closeIx)
      }
      if (
        token.creators?.find(
          (value) => value.address.toBase58() === newGearCreator
        )
      ) {
        console.log("new")
        const collectionAddress = token.collection?.address
        let collectionMetadata: string | undefined = undefined
        const [collectionMetadataPDA, _bump3] = address.findProgramAddressSync(
          [
            Buffer.from("metadata"),
            PROGRAM_ID.toBuffer(),
            Buffer.from(collectionAddress.toBytes()),
          ],
          PROGRAM_ID
        )
        collectionMetadata = collectionMetadataPDA.toBase58()

        const [metadata] = address.findProgramAddressSync(
          [Buffer.from("metadata"), PROGRAM_ID.toBuffer(), gearMint.toBuffer()],
          PROGRAM_ID
        )
        const [masterEdition] = address.findProgramAddressSync(
          [
            Buffer.from("metadata"),
            PROGRAM_ID.toBuffer(),
            gearMint.toBuffer(),
            Buffer.from("edition"),
          ],
          PROGRAM_ID
        )
        const [tokenRecord] = address.findProgramAddressSync(
          [
            Buffer.from("metadata"),
            PROGRAM_ID.toBuffer(),
            gearMint.toBuffer(),
            Buffer.from("token_record"),
            senderATA.toBuffer(),
          ],
          PROGRAM_ID
        )

        const burn = createBurnInstruction(
          {
            authority: owneraddress,
            metadata: metadata,
            collectionMetadata: new address(collectionMetadata),
            edition: masterEdition,
            mint: gearMint,
            token: senderATA,
            tokenRecord: tokenRecord,
            systemProgram: SystemProgram.programId,
            sysvarInstructions: SYSVAR_INSTRUCTIONS_PUBKEY,
            splTokenProgram: TOKEN_PROGRAM_ID,
          },
          {
            burnArgs: {
              __kind: "V1",
              amount: toBigNumber(1),
            },
          }
        )
        tx.add(burn)
      }

      //tx.add(
      //createCloseAccountInstruction(senderATA, owneraddress, owneraddress)
      //)

      // save array of items to add
      const id = item.id
      itemsToAdd[item.slotName] = id
    }

    // --- 2. Start the instructions to equip the Gear ---

    const currentGears = nft.json.internalAttributes
      .filter((a) => a.trait_type.includes("slot_"))
      .reduce((acc, curr) => {
        const slotName = curr.trait_type.replace("slot_", "")
        acc[slotName] = curr.value
        return acc
      }, {})

    // Add the items burned as arguments to the instruction
    const heroNewGears = {
      helm: null,
      neck: null,
      shoulders: null,
      ring: null,
      chest: null,
      hands: null,
      weapon: null,
      legs: null,
      // Use all current gears from the on-chain Gears account
      ...(currentGears ? currentGears : {}),
      ...itemsToAdd,
    }

    // --- 3. Generate a new NFT image using the composer ---
    const apiRes = await (
      await fetch(`${hostUrl}/api/nft-composer`, {
        method: "POST",
        body: JSON.stringify({
          mint,
          items: heroNewGears,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      })
    ).json()

    const { imagePath, error } = apiRes

    if (error) throw new Error(error)
    if (!imagePath) throw new Error("Couldn't generate image path for the NFT.")

    // --- 4. Upload a new NFT metadata ---
    const { attributes, internalAttributes } = getNewMetadataAttributes(
      nft,
      heroNewGears
    )

    // Upload new metadata to bundlr
    console.time("uploadMetadata")
    const { uri: newUri } = await metaplex.nfts().uploadMetadata({
      ...nft.json,
      image: imagePath,
      attributes,
      internalAttributes,
      properties: {
        ...nft.json.properties,
        files: [
          {
            uri: imagePath,
            type: "image/png",
          },
        ],
      },
    })
    console.timeEnd("uploadMetadata")

    // --- 5. Update the NFT on Metaplex ---
    // Build update NFT instructions
    const updateIxs = metaplex
      .nfts()
      .builders()
      .update({
        nftOrSft: nft,
        uri: newUri,

        // name: "Loot Hero Test",
      })
      .getInstructions()

    tx.add(...updateIxs)
    // --- 6. Sign with the NFT authority, and send the transaction as a JSON response ---

    tx.recentBlockhash = tx.recentBlockhash = (
      await connection.getLatestBlockhash("confirmed")
    ).blockhash
    tx.sign(kp)

    res.status(200).send(
      JSON.stringify(
        tx.serialize({
          requireAllSignatures: false,
          verifySignatures: false,
        })
      )
    )
  } catch (e) {
    console.log(e)

    res.status(500).send(JSON.stringify({ error: e + "" }))
  }
}

export type LootHeroesNft = (Sft | Nft) & {
  json: JsonMetadata & {
    internalAttributes?: MetadataJsonAttribute[]
  }
}

const getInternalAttributeValue = (
  attributeName: string,
  nft: LootHeroesNft
) => {
  let attribute = nft.json.internalAttributes.find(
    (a) => a.trait_type === attributeName
  )

  if (!attribute) {
    throw new Error(`Attribute ${attributeName} not found`)
  }

  if (!isNaN(parseInt(attribute.value))) {
    return parseInt(attribute.value)
  }
}

// Accepts the current attributes and returns the updated NFT attributes based on equipped gears
const getNewMetadataAttributes = (
  nft: LootHeroesNft,
  heroNewGears: {
    helm: string
    neck: string
    shoulders: string
    ring: string
    chest: string
    hands: string
    weapon: string
    legs: string
  }
) => {
  const {
    json: { attributes, internalAttributes },
  } = nft
  const updatedAttributes = [...attributes]
  const updatedInternalAttributes = [...internalAttributes]

  // Update the attributes with the new gears
  for (const [key, value] of Object.entries(heroNewGears)) {
    if (value) {
      // Update the external attribute (human readable equipment attributes)
      const attributeIndex = updatedAttributes.findIndex(
        (a) => a.trait_type === getLegendaryLootItemSlotName(key)
      )

      const gearName = gear.find((item) => item.itemID === value)?.name

      if (!gearName) throw new Error(`Gear ${value} not found`)

      if (attributeIndex && attributeIndex >= 0) {
        updatedAttributes[attributeIndex].value = gearName
      } else {
        updatedAttributes.push({
          trait_type: getLegendaryLootItemSlotName(key),
          value: gearName,
        })
      }

      // Update the internal attribute (slot_* attributes)
      const internalAttributeIndex = updatedInternalAttributes.findIndex(
        (a) => a.trait_type === "slot_" + key
      )

      if (internalAttributeIndex && internalAttributeIndex >= 0) {
        updatedInternalAttributes[internalAttributeIndex].value = value
      } else {
        updatedInternalAttributes.push({
          trait_type: "slot_" + key,
          value,
        })
      }
    } else {
      // Delete the attribute that shouldn't be there (can happen in test mode)
      const attributeIndex = updatedAttributes.findIndex(
        (a) => a.trait_type === getLegendaryLootItemSlotName(key)
      )
      if (attributeIndex && attributeIndex >= 0) {
        updatedAttributes.splice(attributeIndex, 1)
      }

      const internalAttributeIndex = updatedInternalAttributes.findIndex(
        (a) => a.trait_type === "slot_" + key
      )
      if (internalAttributeIndex && internalAttributeIndex >= 0) {
        updatedInternalAttributes.splice(internalAttributeIndex, 1)
      }
    }
  }

  // Calculate the total loot score
  const heroLootScore = getInternalAttributeValue("heroLootScore", nft)
  const gearsLootScore = Object.values(heroNewGears).reduce((acc, curr) => {
    if (curr) {
      const gearLootScore = gear.find((item) => item.itemID === curr)
      if (gearLootScore) {
        return acc + gearLootScore.lootScore
      }
    }
    return acc
  }, 0)
  const totalLootScore = heroLootScore + gearsLootScore

  // Update the loot score attribute
  const lootScoreAttributeIndex = updatedAttributes.findIndex(
    (a) => a.trait_type === "Loot Score"
  )
  if (lootScoreAttributeIndex && lootScoreAttributeIndex >= 0) {
    updatedAttributes[lootScoreAttributeIndex].value = totalLootScore.toString()
  } else {
    updatedAttributes.push({
      trait_type: "Loot Score",
      value: totalLootScore.toString(),
    })
  }

  return {
    attributes: updatedAttributes,
    internalAttributes: updatedInternalAttributes,
  }
}

const getLegendaryLootItemSlotName = (entry: string) => {
  switch (entry) {
    case "helm":
      return "Helm"
    case "shoulders":
      return "Shoulder"
    case "chest":
      return "Chest"
    case "hands":
      return "Hands"
    case "legs":
      return "Legs"
    case "weapon":
      return "Weapon"
    case "ring":
      return "Ring"
    case "neck":
      return "Neck"
  }
}
