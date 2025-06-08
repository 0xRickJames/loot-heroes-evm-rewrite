// @ts-ignore
import environment from "src/environments/production"
import { address } from "@solana/web3.js"
import { RevealNft } from "./reveal.service"

interface BurnGearDto {
  signedMessage: string
  address: string
  payload: string
}

interface RevealError {
  message: string
  code: number
}

interface JobStatusResponse {
  id: string
  completed: boolean
  state: string
  data: boolean
  retries: number
  failed: boolean
  error: string
  result: RevealNft | RevealError
}

interface QueuedResponse {
  id: string
}

export class BurnGearTransaction {
  intentId: string
  txId: string
  heroMint: string
  owner: string
  status: boolean
  items: [string, string][]
}

export class BurnService {
  private endpoint: string

  constructor() {
    this.endpoint = environment.serverUrl
  }

  getRoute(path: string) {
    return `${this.endpoint}/${path}`
  }

  async registerBurn(
    intentId: string,
    txid: string,
    heroMint: address,
    wallet: address,
    status: boolean,
    items: [string, string][]
  ) {
    return (await fetch(this.getRoute(`v1/gear/burn/register`), {
      method: "POST",
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        intentId: intentId,
        mint: heroMint.toString(),
        owner: wallet.toString(),
        confirmed: status,
        txId: txid,
        items: items,
      }),
    }).then((r) => r.json())) as QueuedResponse
  }

  async pendingBurns(wallet: address, heroMint: address) {
    return (await fetch(
      this.getRoute(
        `v1/gear/burn/pending/${wallet.toString()}/${heroMint.toString()}`
      ),
      {
        method: "GET",
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      }
    ).then((r) => r.json())) as BurnGearTransaction[]
  }

  async burnGear(
    txids: string[],
    heroMint: address,
    signMessageFunction: (payload: Uint8Array) => Promise<Uint8Array>,
    wallet: address
  ): Promise<QueuedResponse> {
    let message = {
      txids: txids,
      hero: heroMint.toString(),
    }

    let jsonPayload = JSON.stringify(message)

    let messageUint = new TextEncoder().encode(jsonPayload)

    let signedGearBurn = await signMessageFunction(messageUint)

    let encodedMessage = Buffer.from(signedGearBurn).toString("base64")
    let encodedaddress = Buffer.from(wallet.toBytes()).toString("base64")

    let burnRoute = this.getRoute(`v1/gear/burn`)

    let burnParameters = {
      signedMessage: encodedMessage,
      address: encodedaddress,
      payload: jsonPayload,
    } as BurnGearDto

    return (await fetch(burnRoute, {
      method: "POST",
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(burnParameters),
    }).then((r) => r.json())) as QueuedResponse
  }

  async checkJobStatus(jobId: string) {
    let revealCheckRoute = this.getRoute(`v1/gear/burn/status/${jobId}`)

    return (await fetch(revealCheckRoute, {
      method: "GET",
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json",
      },
    }).then((r) => r.json())) as JobStatusResponse
  }

  async waitForJobCompletion(
    jobId: string,
    retries: number
  ): Promise<{ success: boolean; jobResult: JobStatusResponse }> {
    let currentTry = 0

    let jobResult
    jobResult = await this.checkJobStatus(jobId)

    while (currentTry < retries) {
      if (jobResult.failed) {
        return { success: false, jobResult }
      }

      if (jobResult.completed) {
        return { success: true, jobResult }
      }

      await this.sleep(800)

      jobResult = await this.checkJobStatus(jobId)
      currentTry++
    }

    return { success: false, jobResult }
  }

  async sleep(ms: number) {
    return new Promise((r) => setTimeout(r, ms))
  }
}
