import { NextApiRequest, NextApiResponse } from "next"
import { createNFT } from "@lootheroes/nft-composer"
import { Connection, PublicKey } from "@solana/web3.js"
import { JsonMetadata, Metaplex, Nft, Sft } from "@metaplex-foundation/js"
import production from "src/environments/production"
import { LootHeroesNft } from "./gears"

// API to call the NFT composer and generate an NFT image from the mint address
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const {
      mint,
      items,
    }: {
      mint: string
      items: {
        [key: string]: string
      }
    } = req.body

    const connection = new Connection(production.solana.rpcHost)
    const metaplex = new Metaplex(connection)

    const nft: LootHeroesNft = await metaplex.nfts().findByMint({
      mintAddress: new PublicKey(mint),
    })

    const classID = nft.json.internalAttributes?.find(
      (attr) => attr.trait_type === "classID"
    )?.value

    if (!classID)
      throw new Error(
        "Couldn't find NFT classID from internalAttributes for " + mint
      )

    const rarity = nft.json.internalAttributes?.find(
      (attr) => attr.trait_type === "heroRarity"
    )?.value

    if (!rarity)
      throw new Error(
        "Couldn't find NFT heroRarity from internalAttributes for " + mint
      )

    const heroID = nft.json.internalAttributes?.find(
      (attr) => attr.trait_type === "nftId"
    )?.value

    if (!heroID)
      throw new Error(
        "Couldn't find NFT heroID from internalAttributes for " + mint
      )

    // Generate an NFT image and save it into the public/heroes folder
    const imagePath = await createNFT(classID, rarity, items, heroID)

    res.status(200).json({ imagePath })
  } catch (e) {
    console.log(e)

    res.status(500).send(JSON.stringify({ error: e + "" }))
  }
}
