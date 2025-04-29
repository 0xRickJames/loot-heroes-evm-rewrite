// Sounds

let soundsEnabled =
  typeof window !== "undefined"
    ? JSON.parse(localStorage.getItem("soundsEnabled")) || true
    : true

let buttonSound: HTMLAudioElement
let cancelSound: HTMLAudioElement
let highlightSound: HTMLAudioElement
let closedDungeonHoverSound: HTMLAudioElement
let closedDungeonClickSound: HTMLAudioElement
let beginsSound: HTMLAudioElement
let archangelAttackSound: HTMLAudioElement
let assassinAttackSound: HTMLAudioElement
let bardAttackSound: HTMLAudioElement
let bowAttackSound: HTMLAudioElement
let demonHunterAttackSound: HTMLAudioElement
let justicarAttackSound: HTMLAudioElement
let magicAttackSound: HTMLAudioElement
let necromancerAttackSound: HTMLAudioElement
let pirateAttackSound: HTMLAudioElement
let swordAttackSound: HTMLAudioElement
let coinFlipSound: HTMLAudioElement
let buffSound: HTMLAudioElement
let flipSound: HTMLAudioElement
let cardDrop: HTMLAudioElement
let victorySong: HTMLAudioElement
let drawSong: HTMLAudioElement
let defeatSong: HTMLAudioElement
let cardPickupSound: HTMLAudioElement

if (soundsEnabled && soundsEnabled && typeof window !== "undefined") {
  cardPickupSound = new Audio("../../../sounds/card_pickup.wav")
  defeatSong = new Audio("../../../sounds/defeat.wav")
  drawSong = new Audio("../../../sounds/draw.wav")
  victorySong = new Audio("../../../sounds/victory.wav")
  cardDrop = new Audio("../../../sounds/cardDrop.wav")
  buffSound = new Audio("../../../sounds/buff.wav")
  flipSound = new Audio("../../../sounds/flip.wav")
  buttonSound = new Audio("../../sounds/button.wav")
  highlightSound = new Audio("../../sounds/higlight_card.wav")
  cancelSound = new Audio("../../sounds/cancel.wav")
  closedDungeonClickSound = new Audio("../../sounds/deck_selector.wav")
  closedDungeonHoverSound = new Audio("../../sounds/cardDrop.wav")
  beginsSound = new Audio("../../sounds/begins.wav")
  archangelAttackSound = new Audio("../../sounds/attack/Angel.wav")
  assassinAttackSound = new Audio("../../sounds/attack/Assassin.wav")
  bardAttackSound = new Audio("../../sounds/attack/Bard.wav")
  bowAttackSound = new Audio("../../sounds/attack/bow.wav")
  demonHunterAttackSound = new Audio("../../sounds/attack/DemonHunter.wav")
  justicarAttackSound = new Audio("../../sounds/attack/Justicar.wav")
  magicAttackSound = new Audio("../../sounds/attack/magic.wav")
  necromancerAttackSound = new Audio("../../sounds/attack/Necromancer.wav")
  pirateAttackSound = new Audio("../../sounds/attack/Pirate.wav")
  swordAttackSound = new Audio("../../sounds/attack/sword.wav")
  coinFlipSound = new Audio("../../sounds/flip_coin.wav")
  let storedValue = localStorage.getItem("soundsEnabled")
  soundsEnabled = storedValue === "true"
}
export function playCardPickupSound() {
  if (soundsEnabled && typeof window !== "undefined") {
    cardPickupSound.play()
  }
}
export function playVictorySong() {
  if (soundsEnabled && typeof window !== "undefined") {
    victorySong.play()
  }
}
export function playDrawSong() {
  if (soundsEnabled && typeof window !== "undefined") {
    drawSong.play()
  }
}
export function playDefeatSong() {
  if (soundsEnabled && typeof window !== "undefined") {
    defeatSong.play()
  }
}
export function buttonClick() {
  if (soundsEnabled && typeof window !== "undefined") {
    buttonSound.play()
  }
}
export function highlightButton() {
  if (soundsEnabled && typeof window !== "undefined") {
    highlightSound.play()
  }
}
export function backButton() {
  if (soundsEnabled && typeof window !== "undefined") {
    cancelSound.play()
  }
}
export function closedDungeonClick() {
  if (soundsEnabled && typeof window !== "undefined") {
    closedDungeonClickSound.play()
  }
}
export function playCardDrop() {
  if (soundsEnabled && typeof window !== "undefined") {
    cardDrop.play()
  }
}
export function playCoinFlip() {
  if (soundsEnabled && typeof window !== "undefined") {
    coinFlipSound.play()
  }
}
export function playBegins() {
  if (soundsEnabled && typeof window !== "undefined") {
    beginsSound.play()
  }
}
export function playArchangel() {
  if (soundsEnabled && typeof window !== "undefined") {
    archangelAttackSound.play()
  }
}
export function playAssassin() {
  if (soundsEnabled && typeof window !== "undefined") {
    assassinAttackSound.play()
  }
}
export function playBard() {
  if (soundsEnabled && typeof window !== "undefined") {
    bardAttackSound.play()
  }
}
export function playRanged() {
  if (soundsEnabled && typeof window !== "undefined") {
    bowAttackSound.play()
  }
}
export function playDemonHunter() {
  if (soundsEnabled && typeof window !== "undefined") {
    demonHunterAttackSound.play()
  }
}
export function playJusticar() {
  if (soundsEnabled && typeof window !== "undefined") {
    justicarAttackSound.play()
  }
}
export function playMagic() {
  if (soundsEnabled && typeof window !== "undefined") {
    magicAttackSound.play()
  }
}
export function playNecromancer() {
  if (soundsEnabled && typeof window !== "undefined") {
    necromancerAttackSound.play()
  }
}
export function playPirate() {
  if (soundsEnabled && typeof window !== "undefined") {
    pirateAttackSound.play()
  }
}
export function playMelee() {
  if (soundsEnabled && typeof window !== "undefined") {
    swordAttackSound.play()
  }
}
export function playCardFlip() {
  if (soundsEnabled && typeof window !== "undefined") {
    flipSound.play()
  }
}
export function playBuffSound() {
  if (soundsEnabled && typeof window !== "undefined") {
    buffSound.play()
  }
}
export function toggleSounds() {
  soundsEnabled = !soundsEnabled
  if (typeof window !== "undefined") {
    localStorage.setItem("soundsEnabled", JSON.stringify(soundsEnabled))
  }
}

const sounds = {
  playCardPickupSound,
  playVictorySong,
  playDrawSong,
  playDefeatSong,
  playCardDrop,
  buttonClick,
  highlightButton,
  backButton,
  closedDungeonClick,
  playArchangel,
  playAssassin,
  playBard,
  playBegins,
  playDemonHunter,
  playJusticar,
  playMagic,
  playMelee,
  playNecromancer,
  playPirate,
  playRanged,
  playCoinFlip,
  playBuffSound,
  playCardFlip,
  toggleSounds,
  soundsEnabled,
}

export default sounds
