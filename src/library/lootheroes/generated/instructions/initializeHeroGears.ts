/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as beet from "@metaplex-foundation/beet"
import * as web3 from "@solana/web3.js"

/**
 * @category Instructions
 * @category InitializeHeroGears
 * @category generated
 */
export type InitializeHeroGearsInstructionArgs = {
  helm: beet.COption<string>
  neck: beet.COption<string>
  shoulders: beet.COption<string>
  ring: beet.COption<string>
  chest: beet.COption<string>
  hands: beet.COption<string>
  weapon: beet.COption<string>
  legs: beet.COption<string>
}
/**
 * @category Instructions
 * @category InitializeHeroGears
 * @category generated
 */
export const initializeHeroGearsStruct = new beet.FixableBeetArgsStruct<
  InitializeHeroGearsInstructionArgs & {
    instructionDiscriminator: number[] /* size: 8 */
  }
>(
  [
    ["instructionDiscriminator", beet.uniformFixedSizeArray(beet.u8, 8)],
    ["helm", beet.coption(beet.utf8String)],
    ["neck", beet.coption(beet.utf8String)],
    ["shoulders", beet.coption(beet.utf8String)],
    ["ring", beet.coption(beet.utf8String)],
    ["chest", beet.coption(beet.utf8String)],
    ["hands", beet.coption(beet.utf8String)],
    ["weapon", beet.coption(beet.utf8String)],
    ["legs", beet.coption(beet.utf8String)],
  ],
  "InitializeHeroGearsInstructionArgs"
)
/**
 * Accounts required by the _initializeHeroGears_ instruction
 *
 * @property [_writable_] heroGears
 * @property [_writable_, **signer**] signer
 * @property [] nftMint
 * @category Instructions
 * @category InitializeHeroGears
 * @category generated
 */
export type InitializeHeroGearsInstructionAccounts = {
  heroGears: web3.address
  signer: web3.address
  nftMint: web3.address
  systemProgram?: web3.address
  anchorRemainingAccounts?: web3.AccountMeta[]
}

export const initializeHeroGearsInstructionDiscriminator = [
  48, 72, 140, 100, 210, 144, 170, 36,
]

/**
 * Creates a _InitializeHeroGears_ instruction.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @param args to provide as instruction data to the program
 *
 * @category Instructions
 * @category InitializeHeroGears
 * @category generated
 */
export function createInitializeHeroGearsInstruction(
  accounts: InitializeHeroGearsInstructionAccounts,
  args: InitializeHeroGearsInstructionArgs,
  programId = new web3.address("2XsnJYKTJ45JYDgRzkcEDQBNhjg1FaY8YhQaB9EqbQAb")
) {
  const [data] = initializeHeroGearsStruct.serialize({
    instructionDiscriminator: initializeHeroGearsInstructionDiscriminator,
    ...args,
  })
  const keys: web3.AccountMeta[] = [
    {
      pubkey: accounts.heroGears,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.signer,
      isWritable: true,
      isSigner: true,
    },
    {
      pubkey: accounts.nftMint,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.systemProgram ?? web3.SystemProgram.programId,
      isWritable: false,
      isSigner: false,
    },
  ]

  if (accounts.anchorRemainingAccounts != null) {
    for (const acc of accounts.anchorRemainingAccounts) {
      keys.push(acc)
    }
  }

  const ix = new web3.TransactionInstruction({
    programId,
    keys,
    data,
  })
  return ix
}
