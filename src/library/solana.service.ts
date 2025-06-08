import { Connection } from "@metaplex/js"
import { address } from "@solana/web3.js"
import { TOKEN_PROGRAM_ID } from "@solana/spl-token"
import { SolanaToken, TokenQueryOptions } from "./solana.interface"

export class SolanaService {
  constructor(private readonly connection: Connection) {}

  async getTokensByOwner(
    queryOptions: TokenQueryOptions
  ): Promise<SolanaToken[]> {
    const tokens = await this.connection.getParsedTokenAccountsByOwner(
      queryOptions.owner,
      {
        programId: TOKEN_PROGRAM_ID,
      }
    )

    return tokens.value
      .filter((t) => {
        const amount = t.account.data.parsed.info.tokenAmount

        let mint = t.account.data.parsed.info.mint.toString()

        if (queryOptions.mints && !queryOptions.mints.includes(mint)) {
          return false
        }

        if (queryOptions.tokensAmount >= 0) {
          return (
            amount.decimals === queryOptions.decimalsAmount &&
            amount.uiAmount === queryOptions.tokensAmount
          )
        }

        return amount.decimals === queryOptions.decimalsAmount
      })
      .map((t) => ({
        address: new address(t.pubkey),
        mint: new address(t.account.data.parsed.info.mint),
        amount: t.account.data.parsed.info.tokenAmount.uiAmount,
      }))
  }

  async getTokenBalance(owner: address, mint: address): Promise<number> {
    const tokens = await this.connection.getParsedTokenAccountsByOwner(owner, {
      programId: TOKEN_PROGRAM_ID,
    })

    let token = tokens.value.find(
      (t) => t.account.data.parsed.info.mint === mint.toString()
    )

    return token ? token.account.data.parsed.info.tokenAmount.uiAmount : 0
  }
}
