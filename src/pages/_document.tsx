import { Html, Head, Main, NextScript } from "next/document"

const scriptTxt = `
  WebFont.load({
    google: {
      families: ['Carta Marina']
    }
  });
`

export default function Document() {
  return (
    <Html>
      <Head>
        <script
          async
          src="https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js"
        ></script>
        <script async>
          {`
           WebFont.load({
             google: {
               families: ['Carta Marina']
             }
           });
         `}
        </script>
        <meta name="apple-mobile-web-app-title" content="LootHeroes.io" />
        <meta name="application-name" content="LootHeroes.io" />
        <meta name="msapplication-TileColor" content="#da532c" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="image" content="https://lootheroes.io/cardbanner.png" />
        <meta itemProp="name" content="Loot Heroes NFT" />
        <meta
          itemProp="description"
          content="Enter Looterra! Meet the team, begin your adventure and earn loot 🔱 👑"
        />
        <meta itemProp="image" content="https://lootheroes.io/cardbanner.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="Loot Heroes NFT - Official Website"
        />
        <meta
          name="twitter:description"
          content="Enter Looterra! Meet the team, begin your adventure and earn loot 🔱 👑"
        />
        <meta name="twitter:site" content="@LootHeroesGame" />
        <meta name="twitter:creator" content="@LootHeroesGame" />
        <meta
          name="twitter:image"
          content="https://lootheroes.io/cardbanner.png"
        />
        <meta property="og:title" content="Loot Heroes️- Official Website" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://lootheroes.io" />
        <meta
          property="og:image"
          content="https://lootheroes.io/cardbanner.png"
        />
        <meta
          property="og:description"
          content="Enter Looterra! Meet the team, begin your adventure and earn loot 🔱 👑"
        />
      </Head>
      <body className="bg-swords">
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
