import { AnchorWallet } from "@solana/wallet-adapter-react"
import { Connection } from "@metaplex/js"

export interface WalletAware {
  wallet: AnchorWallet
  connection: Connection
}
