import { PublicKey } from "@solana/web3.js"

export interface SolanaToken {
  publicKey: PublicKey
  mint: PublicKey
  amount: number
}

export interface TokenQueryOptions {
  symbol?: string
  mints?: string[]
  limit?: number
  offset?: number
  tokensAmount: number
  decimalsAmount: number
  owner: PublicKey
}
