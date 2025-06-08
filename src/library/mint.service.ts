import { address } from "@solana/web3.js"

// @ts-ignore
import environment from "src/environments/production"
import { MetaplexMetadataCacheEntry } from "./metaplex.interface"

interface ProgressQueuedResponse {
  id: string
  progress: number
}

export interface MintFetchStatus {
  id: string
  completed: boolean
  failed: boolean
  progress: number
}

export class MintService {
  private readonly endpoint: string

  constructor() {
    this.endpoint = environment.serverUrl
  }

  async sleep(ms: number) {
    return new Promise((r) => setTimeout(r, ms))
  }

  getRoute(path: string) {
    return `${this.endpoint}/${path}`
  }

  async fetchMints(owner: address): Promise<ProgressQueuedResponse> {
    let revealRoute = this.getRoute(`v1/mint/fetch`)

    let revealParameters = {
      owner: owner.toString(),
    }

    return (await fetch(revealRoute, {
      method: "POST",
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(revealParameters),
    }).then((r) => r.json())) as ProgressQueuedResponse
  }

  async findAllMints(owner: address): Promise<MetaplexMetadataCacheEntry[]> {
    let revealRoute = this.getRoute(`v1/mint/all?owner=${owner}`)

    return (await fetch(revealRoute, {
      method: "GET",
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json",
      },
    }).then((r) => r.json())) as MetaplexMetadataCacheEntry[]
  }

  async findAllMintsCount(owner: address, symbol: string): Promise<number> {
    let revealRoute = this.getRoute(
      `v1/mint/all/count?owner=${owner}&symbol=${symbol}`
    )

    return (await fetch(revealRoute, {
      method: "GET",
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json",
      },
    }).then((r) => r.json())) as number
  }

  async checkJobStatus(jobId: string) {
    let revealCheckRoute = this.getRoute(`v1/mint/fetch/status/${jobId}`)

    return (await fetch(revealCheckRoute, {
      method: "GET",
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json",
      },
    }).then((r) => r.json())) as MintFetchStatus
  }

  async waitForJobCompletion(
    jobId: string,
    retries: number,
    progressCallback: (progress: number) => void
  ): Promise<{ success: boolean; jobResult: MintFetchStatus }> {
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

      progressCallback(jobResult.progress)

      await this.sleep(1500)

      jobResult = await this.checkJobStatus(jobId)
      currentTry++
    }

    return { success: false, jobResult }
  }
}
