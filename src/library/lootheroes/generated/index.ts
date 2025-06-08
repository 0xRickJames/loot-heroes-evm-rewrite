import { address } from "@solana/web3.js"
export * from "./accounts"
export * from "./errors"
export * from "./instructions"

/**
 * Program address
 *
 * @category constants
 * @category generated
 */
export const PROGRAM_ADDRESS = "2XsnJYKTJ45JYDgRzkcEDQBNhjg1FaY8YhQaB9EqbQAb"

/**
 * Program public key
 *
 * @category constants
 * @category generated
 */
export const PROGRAM_ID = new address(PROGRAM_ADDRESS)
