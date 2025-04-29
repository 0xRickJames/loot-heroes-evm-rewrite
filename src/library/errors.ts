import { PublicKey } from "@solana/web3.js"

export function asError(err: unknown): Error {
  return err as Error
}

export enum Errors {
  MetaplexErrorFetchingMetadata = "Unable to fetch metadata from Metaplex",
  UnableToDetermineNftId = "Unable to determine the NFT id",
  UnableToFindItem = "Unable to find item in gear database",
  NullArgumentError = "One of the arguments was null",
  InvalidAttributeError = "The specified attribute does not exists in the NFT",
  InvalidAttributeType = "The specified attribute is not a valid type",
  NftIsNotRevealedError = "The specified NFT is not properly revealed",
  FailedToMintNoTransactionFound = "Unable to find a valid transaction after mint",
  FailedToMintTransactionError = "Failed to mint due to a transaction error",
  WalletOperationGenericError = "An error ocurred during a wallet operation",
  FailedToMintCandyMachineNotReady = "Candy machine was not ready",
  IncompatibleWalletError = "This wallet is incompatible with this function",
  FailedToRevealError = "NFT failed to reveal, this is probably due to Solana being at capacity!",
  FailedToBurnItems = "Failed to burn items in transactions",
}

export class GenericError extends Error {
  protected error: Errors
  protected parameters: Map<string, any> = new Map<string, any>()
  protected originalException: unknown

  constructor(error: Errors) {
    super()
    this.error = error
    this.message = error as string
    Object.setPrototypeOf(this, GenericError.prototype)
  }

  static new(error: Errors) {
    return new GenericError(error)
  }

  withOriginalException(e: unknown) {
    this.originalException = e
    this.message = asError(e).message
    return this
  }

  withMessage(message: string) {
    this.message = message
    return this
  }

  withParameter(key: string, value: any) {
    this.parameters.set(key, value)
    return this
  }

  withOwnerWallet(wallet: PublicKey) {
    this.parameters.set("ownerWallet", wallet.toString())
    return this
  }

  withOtherWallets(wallets: Record<string, PublicKey>) {
    Object.keys(wallets).forEach((key) => {
      this.parameters.set(key, wallets[key].toString())
    })
    return this
  }

  build() {
    // TODO: add proper logger
    console.log({
      exception: this,
      parameters: this.parameters,
      error: this.error,
    })

    return this
  }
}

export class NullArgumentError extends GenericError {
  static new(argumentName: string) {
    return GenericError.new(Errors.NullArgumentError).withParameter(
      "argument_name",
      argumentName
    )
  }
}
