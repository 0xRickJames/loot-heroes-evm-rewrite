import { PublicKey } from "@solana/web3.js"

// @ts-ignore
import environment from "src/environments/production"

interface QueuedResponse {
  id: string
}

interface RevealData {
  mint: string
}

export interface RevealNft {
  image: string
  metadataUri: string
  name: string
  lootScore: number
}

interface RevealError {
  message: string
  code: number
}

export interface JobStatusResponse {
  id: string
  completed: boolean
  state: string
  data: RevealData
  retries: number
  failed: boolean
  error: string
  result: RevealNft | RevealError
}

export class RevealService {
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

  async launchReveal(mint: PublicKey, type: string): Promise<string> {
    let revealRoute = this.getRoute(`v1/${type}/reveal`)

    let revealParameters = {
      mint: mint.toString(),
    }

    let result = (await fetch(revealRoute, {
      method: "POST",
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(revealParameters),
    }).then((r) => r.json())) as QueuedResponse

    return result.id
  }

  async checkJobStatus(jobId: string, type: string) {
    let revealCheckRoute = this.getRoute(`v1/${type}/reveal/status/${jobId}`)

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
    type: string,
    retries: number
  ): Promise<{ success: boolean; jobResult: JobStatusResponse }> {
    let currentTry = 0

    let jobResult
    jobResult = await this.checkJobStatus(jobId, type)

    while (currentTry < retries) {
      if (jobResult.failed) {
        return { success: false, jobResult }
      }

      if (jobResult.completed) {
        return { success: true, jobResult }
      }

      await this.sleep(500)

      jobResult = await this.checkJobStatus(jobId, type)
      currentTry++
    }

    return { success: false, jobResult }
  }
}
