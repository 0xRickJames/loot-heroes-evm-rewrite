import { address } from "@solana/web3.js"

export interface SolanaToken {
  address: address
  mint: address
  amount: number
}

export interface TokenQueryOptions {
  symbol?: string
  mints?: string[]
  limit?: number
  offset?: number
  tokensAmount: number
  decimalsAmount: number
  owner: address
}
