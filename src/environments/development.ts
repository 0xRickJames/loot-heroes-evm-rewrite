import environment from "./base"

const env = environment()

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  ...env,
  solana: {
    rpcHost: "https://api.devnet.solana.com",
  },
  mints: {
    mint: {
      solana: "dev",
      candyMachine: {
        programId: "CONFIGME",
        startAt: 1020,
      },
      mintToken: "CONFIGME",
      metaplex: {
        connection: "dev",
      },
    },
  },
  candyMachines: {
    hero: ["CONFIGME"],
    gear: [],
  },
  heroReveal: true,
  enableBeta: true,
  nftTestMode: false,
  mainMintId: "mint",
  assetBaseUrl: "CONFIGME",
  serverUrl: "",
  chestCoins: {
    bronze: {
      token: "CONFIGME",
      mint: "chest-bronze",
    },
  },
  gemFarm: {
    tokenMint: "CONFIGME",
    tokenDecimals: 9,
    farm: {
      address: "CONFIGME",
    },
    bank: {
      address: "CONFIGME",
    },
  },
}
