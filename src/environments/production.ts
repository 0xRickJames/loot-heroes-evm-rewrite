import environment from "./base"

const env = environment()

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  ...env,
  firebase: {
    apiKey: "AIzaSyBnafxIKWJDDrQoliijIkuTvlBsAmWKzh0",
    authDomain: "loot-heroes-815ae.firebaseapp.com",
    projectId: "loot-heroes-815ae",
    storageBucket: "loot-heroes-815ae.appspot.com",
    messagingSenderId: "1022864367094",
    appId: "1:1022864367094:web:d888cc5fd6a6bde4b47bd7",
    measurementId: "G-N0QH9YM05D",
  },
  isProduction: true,
  isDevelopment: false,
  solana: {
    rpcHost: "https://api.devnet.solana.com",
  },
  mints: {
    publicmint: {
      candyMachine: {
        programId: "3KBk3mnTZckkf8fBoqcJ4Nt3Pw5W1Ysu1SqCRk2N4oLe",
        startAt: 1020,
      },
      revealType: "hero",
      hasReveal: false,
    },
    "chest-bronze": {
      candyMachine: {
        programId: "6HgyyB6a84FnXVbwQg3EPbciNgmAm6eSSgdW9R9pSVTZ",
        startAt: 1020,
      },
      revealType: "gear",
      hasReveal: false,
      mintToken: "CFowe8TTZgwawPdRggJtAb2GjfCaPDg5qnUY5HP3UJWZ",
      mintTokenName: "LHBRONZECHEST",
    },
  },
  candyMachines: [
    "5WrPwvdUGhiHAeFiqLWgiq2e35LciEZXB99im4wkgUx6",
    "EMYBHGCAeBPRHxfFEuhRjszKsP5YLaFXubjeWJuVdieZ",
  ],
  heroReveal: false,
  enableBeta: false,
  nftTestMode: false,
  mainMintId: null,
  assetBaseUrl: "https://metadata-lootheroes-rose.vercel.app",
  serverUrl: "http://localhost:3000/api",
  chestCoins: {
    bronze: {
      token: "CFowe8TTZgwawPdRggJtAb2GjfCaPDg5qnUY5HP3UJWZ",
      mint: "chest-bronze",
    },
    silver: {
      token: "6AierQY71omEf7gbUiwvQJC2Q3vYBgQ3UZojwGtjqb9S",
      mint: "chest-silver",
    },
    gold: {
      token: "A4W75bfTm8YLfR2BwtunZKWxeSzxbKuiMCZgTdGYLvVG",
      mint: "chest-gold",
    },
  },
  gemFarm: {
    tokenMint: "DMkAp8aGEny6oEdWJNzwZPTL57biX6BwwGrzEF9bNRcS",
    tokenDecimals: 4,
    farm: {
      publicKey: "FQrhCtxkHY511NJfT2WfYToMJM4SjB5TM7ZbCR2aKpkR",
    },
    bank: {
      publicKey: "CJZ6Po6KZJkQMLfEnwDn8GAGJ7rvqw1Ezcr33qD59fXS",
    },
  },
}
