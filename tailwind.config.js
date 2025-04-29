const { MaterialTailwindTheme } = require("@material-tailwind/react")
const colors = require("tailwindcss/colors")
const defaultTheme = require("tailwindcss/defaultTheme")

module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: false, // or 'media' or 'class'
  theme: {
    fontFamily: {
      carta: ["CartaMarinaRegular", ...defaultTheme.fontFamily.sans],
      bold: ["CartaMarinaBold", ...defaultTheme.fontFamily.sans],
      custom: ["Encode Sans Expanded", "sans-serif"],
    },
    extend: {
      colors: {
        "custom-gray": "#807a82",
        "custom-purple": "#261727",
      },
      height: {
        "95vh": "95vh",
        "85vh": "85vh",
        "75vh": "75vh",
        "65vh": "65vh",
        "55vh": "55vh",
        "45vh": "45vh",
        "35vh": "35vh",
        "30vh": "30vh",
        "10vh": "10vh",
      },
      width: {
        "95vw": "95vw",
        "85vw": "85vw",
        "75vw": "75vw",
        "65vw": "65vw",
        "45vw": "45vw",
        "30vw": "30vw",
        "35vw": "35vw",
      },
      backgroundImage: (theme) => ({
        hero: "url('/img/loot_map_big_bg.jpg')",
        button: "url('/img/buttonb.png')",
        frame: "url('/img/loadout_frame.png')",
        swords: "url('/img/hl-bg-repeat.jpg')",
        "map-loadout": "url('/img/loot_map_icons_small.jpg')",
        gameboard: "url('/img/gameboard.png')",
        "title-sword": "url('/img/title_sword.png')",
        loot: "url('/img/lootcoin.png')",
        "small-screen":
          "url('https://cdn.discordapp.com/attachments/1152274140141735936/1164619571869794422/Mobile_Gameplay_Border_over.png')",
        "large-screen": "url('/img/pvp/hero_card/Gameplay_Border_over.png')",
        "deck-paper": "url('/img/pvp/paper_left.png')",
        "mobile-deck-paper": "url('/img/pvp/mobile_paper_left.png')",
        "match-wrapper": "url('/img/pvp/wood_background.png')",
        "mobile-wrapper": "url('/img/pvp/mobile_wood_background.png')",
        "match-bg": "url('/img/pvp/bg-desktop.png')",
        "match-bg-mobile": "url('/img/pvp/bg.png')",
        "merchant-bg": "url('/img/merchant_bg.png')",
        // Wooden UI elements
        book: "url('/img/Wooden_UI/book.png')",
        bg1: "url('/img/Wooden_UI/bg_01_02.png')",
        "bg1-side": "url('/img/Wooden_UI/bg_01_02_side.png')",
        title: "url('/img/Wooden_UI/title.png')",
        close: "url('/img/Wooden_UI/close.png')",
        "board-frame": "url('/img/Wooden_UI/board_frame.png')",
        "circle-bg": "url('/img/Wooden_UI/circle_bg.png')",
        "frame-wood": "url('/img/Wooden_UI/frame.png')",
        "plank-04": "url('/img/Wooden_UI/Plank_04.png')",
        "plank-07": "url('/img/Wooden_UI/Plank_07.png')",
        "plank-16": "url('/img/Wooden_UI/plank_16.png')",
        "plank-17": "url('/img/Wooden_UI/plank_17.png')",
        "plank-18": "url('/img/Wooden_UI/plank_18.png')",
        "plank-12-bg": "url('/img/Wooden_UI/Plank_12_bg.png')",
        "mobile-bg": "url('/img/Wooden_UI/mobile_bg.png')",
        "frame-c3-01": "url('/img/Wooden_UI/frame_c3_01.png')",
        "frame-s-06": "url('/img/Wooden_UI/frame_s_06.png')",
        "frame-c2-01": "url('/img/Wooden_UI/frame_c2_01.png')",
      }),
      gridTemplateColumns: {
        loadout: "30% 5% 30% 5% 30%",
        stats: "60% 40%",
        fourfr: "repeat(4, minmax(0, 1fr))",
      },
      gridTemplateRows: {
        loadout: "repeat(6, minmax(0, auto))",
        loadoutmd: "repeat(2, minmax(0, auto))",
      },
      animation: {
        "ltr-linear-infinite": "ltr-linear-infinite 100s linear infinite",
      },
      keyframes: {
        "ltr-linear-infinite": {
          from: { "background-position": "0 0" },
          to: { "background-position": "100% 0%" },
        },
      },
      padding: {
        "p-101": "10%",
      },
    },
  },
  variants: {
    extend: {
      translate: ["hover"],
      backgroundColor: ["active"],
      brightness: ["hover"],
    },
  },
  plugins: [
    require("tailwindcss"),
    require("postcss-preset-env"),
    require("tailwindcss-debug-screens"),
  ],
}
