import { address } from "@solana/web3.js"

// @ts-ignore
import environment from "src/environments/production"

export class BetaWhitelist {
  private admin: string[] = []

  private whiteList: string[] = environment.isProduction ? this.admin : []

  isInBeta(address: address) {
    return this.whiteList.includes(address.toBase58())
  }
}
