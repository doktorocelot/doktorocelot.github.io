// Look, I just hacked this shit together, okay?
// Don't judge how awful it is!

const kanaDisplay = document.getElementById("kana-display");
const kanaInput = document.getElementById("kana-input");
const romajiCorrection = document.getElementById("romaji-correction");
kanaInput.oninput = submitAnswer;
kanaInput.value = "";

let current = null;
let correctionElement = null;

let standardColumns = new Set();
let dakutenColumns = new Set();
let comboColumns = new Set();

let hiraganaMap = new Map();

let standardHiragana = [];
let comboHiragana = [];

let currentPool = [];

let bag = [];

let kanaButtons = [];

let audioSprites = {};
let audioMap = new Map();
let audioBuffer = null;
let audioCtx = new AudioContext();
let soundIsReady = false;
let currentPlaying = null;

let disabledAnswer = null;

let wasWrong = false;
let totalAll = 0;
let totalCorrect = 0;

let settings = {
  ro: "hepburn",
  audio: true,
  advAnim: true,
};

function pick(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function pull(array) {
  const index = Math.floor(Math.random() * array.length);
  return array.splice(index, 1)[0];
}

function nextKana() {
  if (bag.length === 0) bag = [...currentPool];
  current = pull(bag) ?? standardHiragana[0];
  kanaDisplay.textContent = current.kana;
  kanaDisplay.classList.remove("correct");
  kanaDisplay.classList.add("fade");
}

function isCorrect(val) {
  return val === current.hepburn || val === current.nihon;
}

function isOnTrack(val) {
  const len = val.length;
  return (
    val === current.hepburn.substring(0, len) ||
    val === current.nihon.substring(0, len)
  );
}

function playCurrent() {
  if (!soundIsReady) return;
  if (!settings.audio) return;
  const kana = current.kana;
  const sprite = audioSprites.spritemap[`${kana}_v2`];
  if (!sprite) return;
  currentPlaying?.stop();
  currentPlaying = audioCtx.createBufferSource();
  currentPlaying.buffer = audioBuffer;
  currentPlaying.connect(audioCtx.destination);
  const len = sprite.end - sprite.start;
  currentPlaying.start(0, sprite.start, len);
}

function submitAnswer(e) {
  if (disabledAnswer) {
    kanaInput.value = disabledAnswer;
    return;
  }
  const val = kanaInput.value;

  if (isCorrect(val)) {
    if (!wasWrong) totalCorrect++;
    totalAll++;
    wasWrong = false;

    kanaDisplay.classList.remove("wrong");
    correctionElement?.remove();
    correctionElement = null;
    kanaDisplay.classList.remove("fade");
    kanaDisplay.classList.remove("wrong");
    if (settings.advAnim) {
      disabledAnswer = val;
      kanaDisplay.classList.add("correct");
      playCurrent();
      setTimeout(() => {
        nextKana();
        disabledAnswer = null;
        kanaInput.value = "";
        kanaInput.focus();
      }, 500);
    } else {
      nextKana();
      kanaInput.value = "";
      kanaInput.focus();
    }
  } else if (isOnTrack(val)) {
    // do nothing
  } else {
    kanaDisplay.classList.remove("wrong");
    void kanaDisplay.offsetWidth;
    kanaDisplay.classList.add("wrong");
    kanaInput.value = kanaInput.value.slice(0, -1);
    playCurrent();
    wasWrong = true;
    if (!correctionElement) {
      const e = document.createElement("span");
      e.classList.add("fade");
      e.textContent = current[settings.ro];
      romajiCorrection.appendChild(e);
      correctionElement = e;
    }
  }
}

const hiragana = [
  {
    kana: "あ",
    hasDakuten: false,
    isCombo: false,
    row: "a",
    column: ".",
    hepburn: "a",
    nihon: "a",
  },
  {
    kana: "い",
    hasDakuten: false,
    isCombo: false,
    row: "i",
    column: ".",
    hepburn: "i",
    nihon: "i",
  },
  {
    kana: "う",
    hasDakuten: false,
    isCombo: false,
    row: "u",
    column: ".",
    hepburn: "u",
    nihon: "u",
  },
  {
    kana: "え",
    hasDakuten: false,
    isCombo: false,
    row: "e",
    column: ".",
    hepburn: "e",
    nihon: "e",
  },
  {
    kana: "お",
    hasDakuten: false,
    isCombo: false,
    row: "o",
    column: ".",
    hepburn: "o",
    nihon: "o",
  },

  {
    kana: "か",
    hasDakuten: false,
    isCombo: false,
    row: "a",
    column: "k",
    hepburn: "ka",
    nihon: "ka",
  },
  {
    kana: "き",
    hasDakuten: false,
    isCombo: false,
    row: "i",
    column: "k",
    hepburn: "ki",
    nihon: "ki",
  },
  {
    kana: "く",
    hasDakuten: false,
    isCombo: false,
    row: "u",
    column: "k",
    hepburn: "ku",
    nihon: "ku",
  },
  {
    kana: "け",
    hasDakuten: false,
    isCombo: false,
    row: "e",
    column: "k",
    hepburn: "ke",
    nihon: "ke",
  },
  {
    kana: "こ",
    hasDakuten: false,
    isCombo: false,
    row: "o",
    column: "k",
    hepburn: "ko",
    nihon: "ko",
  },

  {
    kana: "さ",
    hasDakuten: false,
    isCombo: false,
    row: "a",
    column: "s",
    hepburn: "sa",
    nihon: "sa",
  },
  {
    kana: "し",
    hasDakuten: false,
    isCombo: false,
    row: "i",
    column: "s",
    hepburn: "shi",
    nihon: "si",
  },
  {
    kana: "す",
    hasDakuten: false,
    isCombo: false,
    row: "u",
    column: "s",
    hepburn: "su",
    nihon: "su",
  },
  {
    kana: "せ",
    hasDakuten: false,
    isCombo: false,
    row: "e",
    column: "s",
    hepburn: "se",
    nihon: "se",
  },
  {
    kana: "そ",
    hasDakuten: false,
    isCombo: false,
    row: "o",
    column: "s",
    hepburn: "so",
    nihon: "so",
  },

  {
    kana: "た",
    hasDakuten: false,
    isCombo: false,
    row: "a",
    column: "t",
    hepburn: "ta",
    nihon: "ta",
  },
  {
    kana: "ち",
    hasDakuten: false,
    isCombo: false,
    row: "i",
    column: "t",
    hepburn: "chi",
    nihon: "ti",
  },
  {
    kana: "つ",
    hasDakuten: false,
    isCombo: false,
    row: "u",
    column: "t",
    hepburn: "tsu",
    nihon: "tu",
  },
  {
    kana: "て",
    hasDakuten: false,
    isCombo: false,
    row: "e",
    column: "t",
    hepburn: "te",
    nihon: "te",
  },
  {
    kana: "と",
    hasDakuten: false,
    isCombo: false,
    row: "o",
    column: "t",
    hepburn: "to",
    nihon: "to",
  },

  {
    kana: "な",
    hasDakuten: false,
    isCombo: false,
    row: "a",
    column: "n",
    hepburn: "na",
    nihon: "na",
  },
  {
    kana: "に",
    hasDakuten: false,
    isCombo: false,
    row: "i",
    column: "n",
    hepburn: "ni",
    nihon: "ni",
  },
  {
    kana: "ぬ",
    hasDakuten: false,
    isCombo: false,
    row: "u",
    column: "n",
    hepburn: "nu",
    nihon: "nu",
  },
  {
    kana: "ね",
    hasDakuten: false,
    isCombo: false,
    row: "e",
    column: "n",
    hepburn: "ne",
    nihon: "ne",
  },
  {
    kana: "の",
    hasDakuten: false,
    isCombo: false,
    row: "o",
    column: "n",
    hepburn: "no",
    nihon: "no",
  },

  {
    kana: "は",
    hasDakuten: false,
    isCombo: false,
    row: "a",
    column: "h",
    hepburn: "ha",
    nihon: "ha",
  },
  {
    kana: "ひ",
    hasDakuten: false,
    isCombo: false,
    row: "i",
    column: "h",
    hepburn: "hi",
    nihon: "hi",
  },
  {
    kana: "ふ",
    hasDakuten: false,
    isCombo: false,
    row: "u",
    column: "h",
    hepburn: "fu",
    nihon: "hu",
  },
  {
    kana: "へ",
    hasDakuten: false,
    isCombo: false,
    row: "e",
    column: "h",
    hepburn: "he",
    nihon: "he",
  },
  {
    kana: "ほ",
    hasDakuten: false,
    isCombo: false,
    row: "o",
    column: "h",
    hepburn: "ho",
    nihon: "ho",
  },

  {
    kana: "ま",
    hasDakuten: false,
    isCombo: false,
    row: "a",
    column: "m",
    hepburn: "ma",
    nihon: "ma",
  },
  {
    kana: "み",
    hasDakuten: false,
    isCombo: false,
    row: "i",
    column: "m",
    hepburn: "mi",
    nihon: "mi",
  },
  {
    kana: "む",
    hasDakuten: false,
    isCombo: false,
    row: "u",
    column: "m",
    hepburn: "mu",
    nihon: "mu",
  },
  {
    kana: "め",
    hasDakuten: false,
    isCombo: false,
    row: "e",
    column: "m",
    hepburn: "me",
    nihon: "me",
  },
  {
    kana: "も",
    hasDakuten: false,
    isCombo: false,
    row: "o",
    column: "m",
    hepburn: "mo",
    nihon: "mo",
  },

  {
    kana: "や",
    hasDakuten: false,
    isCombo: false,
    row: "a",
    column: "y",
    hepburn: "ya",
    nihon: "ya",
  },
  {
    kana: "ゆ",
    hasDakuten: false,
    isCombo: false,
    row: "u",
    column: "y",
    hepburn: "yu",
    nihon: "yu",
  },
  {
    kana: "よ",
    hasDakuten: false,
    isCombo: false,
    row: "o",
    column: "y",
    hepburn: "yo",
    nihon: "yo",
  },

  {
    kana: "ら",
    hasDakuten: false,
    isCombo: false,
    row: "a",
    column: "r",
    hepburn: "ra",
    nihon: "ra",
  },
  {
    kana: "り",
    hasDakuten: false,
    isCombo: false,
    row: "i",
    column: "r",
    hepburn: "ri",
    nihon: "ri",
  },
  {
    kana: "る",
    hasDakuten: false,
    isCombo: false,
    row: "u",
    column: "r",
    hepburn: "ru",
    nihon: "ru",
  },
  {
    kana: "れ",
    hasDakuten: false,
    isCombo: false,
    row: "e",
    column: "r",
    hepburn: "re",
    nihon: "re",
  },
  {
    kana: "ろ",
    hasDakuten: false,
    isCombo: false,
    row: "o",
    column: "r",
    hepburn: "ro",
    nihon: "ro",
  },

  {
    kana: "わ",
    hasDakuten: false,
    isCombo: false,
    row: "a",
    column: "w",
    hepburn: "wa",
    nihon: "wa",
  },
  {
    kana: "を",
    hasDakuten: false,
    isCombo: false,
    row: "o",
    column: "w",
    hepburn: "o",
    nihon: "wo",
  },

  {
    kana: "ん",
    hasDakuten: false,
    isCombo: false,
    row: "o",
    column: "ɴ",
    hepburn: "n",
    nihon: "n",
  },

  {
    kana: "が",
    hasDakuten: true,
    isCombo: false,
    row: "a",
    column: "g",
    hepburn: "ga",
    nihon: "ga",
  },
  {
    kana: "ぎ",
    hasDakuten: true,
    isCombo: false,
    row: "i",
    column: "g",
    hepburn: "gi",
    nihon: "gi",
  },
  {
    kana: "ぐ",
    hasDakuten: true,
    isCombo: false,
    row: "u",
    column: "g",
    hepburn: "gu",
    nihon: "gu",
  },
  {
    kana: "げ",
    hasDakuten: true,
    isCombo: false,
    row: "e",
    column: "g",
    hepburn: "ge",
    nihon: "ge",
  },
  {
    kana: "ご",
    hasDakuten: true,
    isCombo: false,
    row: "o",
    column: "g",
    hepburn: "go",
    nihon: "go",
  },

  {
    kana: "ざ",
    hasDakuten: true,
    isCombo: false,
    row: "a",
    column: "z",
    hepburn: "za",
    nihon: "za",
  },
  {
    kana: "じ",
    hasDakuten: true,
    isCombo: false,
    row: "i",
    column: "z",
    hepburn: "ji",
    nihon: "zi",
  },
  {
    kana: "ず",
    hasDakuten: true,
    isCombo: false,
    row: "u",
    column: "z",
    hepburn: "zu",
    nihon: "zu",
  },
  {
    kana: "ぜ",
    hasDakuten: true,
    isCombo: false,
    row: "e",
    column: "z",
    hepburn: "ze",
    nihon: "ze",
  },
  {
    kana: "ぞ",
    hasDakuten: true,
    isCombo: false,
    row: "o",
    column: "z",
    hepburn: "zo",
    nihon: "zo",
  },

  {
    kana: "だ",
    hasDakuten: true,
    isCombo: false,
    row: "a",
    column: "d",
    hepburn: "da",
    nihon: "da",
  },
  {
    kana: "ぢ",
    hasDakuten: true,
    isCombo: false,
    row: "i",
    column: "d",
    hepburn: "ji",
    nihon: "di",
  },
  {
    kana: "づ",
    hasDakuten: true,
    isCombo: false,
    row: "u",
    column: "d",
    hepburn: "zu",
    nihon: "du",
  },
  {
    kana: "で",
    hasDakuten: true,
    isCombo: false,
    row: "e",
    column: "d",
    hepburn: "de",
    nihon: "de",
  },
  {
    kana: "ど",
    hasDakuten: true,
    isCombo: false,
    row: "o",
    column: "d",
    hepburn: "do",
    nihon: "do",
  },

  {
    kana: "ば",
    hasDakuten: true,
    isCombo: false,
    row: "a",
    column: "b",
    hepburn: "ba",
    nihon: "ba",
  },
  {
    kana: "び",
    hasDakuten: true,
    isCombo: false,
    row: "i",
    column: "b",
    hepburn: "bi",
    nihon: "bi",
  },
  {
    kana: "ぶ",
    hasDakuten: true,
    isCombo: false,
    row: "u",
    column: "b",
    hepburn: "bu",
    nihon: "bu",
  },
  {
    kana: "べ",
    hasDakuten: true,
    isCombo: false,
    row: "e",
    column: "b",
    hepburn: "be",
    nihon: "be",
  },
  {
    kana: "ぼ",
    hasDakuten: true,
    isCombo: false,
    row: "o",
    column: "b",
    hepburn: "bo",
    nihon: "bo",
  },

  {
    kana: "ぱ",
    hasDakuten: true,
    isCombo: false,
    row: "a",
    column: "p",
    hepburn: "pa",
    nihon: "pa",
  },
  {
    kana: "ぴ",
    hasDakuten: true,
    isCombo: false,
    row: "i",
    column: "p",
    hepburn: "pi",
    nihon: "pi",
  },
  {
    kana: "ぷ",
    hasDakuten: true,
    isCombo: false,
    row: "u",
    column: "p",
    hepburn: "pu",
    nihon: "pu",
  },
  {
    kana: "ぺ",
    hasDakuten: true,
    isCombo: false,
    row: "e",
    column: "p",
    hepburn: "pe",
    nihon: "pe",
  },
  {
    kana: "ぽ",
    hasDakuten: true,
    isCombo: false,
    row: "o",
    column: "p",
    hepburn: "po",
    nihon: "po",
  },

  {
    kana: "きゃ",
    hasDakuten: false,
    isCombo: true,
    row: "ya",
    column: "k",
    hepburn: "kya",
    nihon: "kya",
  },
  {
    kana: "きゅ",
    hasDakuten: false,
    isCombo: true,
    row: "yu",
    column: "k",
    hepburn: "kyu",
    nihon: "kyu",
  },
  {
    kana: "きょ",
    hasDakuten: false,
    isCombo: true,
    row: "yo",
    column: "k",
    hepburn: "kyo",
    nihon: "kyo",
  },

  {
    kana: "しゃ",
    hasDakuten: false,
    isCombo: true,
    row: "ya",
    column: "s",
    hepburn: "sha",
    nihon: "sya",
  },
  {
    kana: "しゅ",
    hasDakuten: false,
    isCombo: true,
    row: "yu",
    column: "s",
    hepburn: "shu",
    nihon: "syu",
  },
  {
    kana: "しょ",
    hasDakuten: false,
    isCombo: true,
    row: "yo",
    column: "s",
    hepburn: "sho",
    nihon: "syo",
  },

  {
    kana: "ちゃ",
    hasDakuten: false,
    isCombo: true,
    row: "ya",
    column: "t",
    hepburn: "cha",
    nihon: "tya",
  },
  {
    kana: "ちゅ",
    hasDakuten: false,
    isCombo: true,
    row: "yu",
    column: "t",
    hepburn: "chu",
    nihon: "tyu",
  },
  {
    kana: "ちょ",
    hasDakuten: false,
    isCombo: true,
    row: "yo",
    column: "t",
    hepburn: "cho",
    nihon: "tyo",
  },

  {
    kana: "にゃ",
    hasDakuten: false,
    isCombo: true,
    row: "ya",
    column: "n",
    hepburn: "nya",
    nihon: "nya",
  },
  {
    kana: "にゅ",
    hasDakuten: false,
    isCombo: true,
    row: "yu",
    column: "n",
    hepburn: "nyu",
    nihon: "nyu",
  },
  {
    kana: "にょ",
    hasDakuten: false,
    isCombo: true,
    row: "yo",
    column: "n",
    hepburn: "nyo",
    nihon: "nyo",
  },

  {
    kana: "ひゃ",
    hasDakuten: false,
    isCombo: true,
    row: "ya",
    column: "h",
    hepburn: "hya",
    nihon: "hya",
  },
  {
    kana: "ひゅ",
    hasDakuten: false,
    isCombo: true,
    row: "yu",
    column: "h",
    hepburn: "hyu",
    nihon: "hyu",
  },
  {
    kana: "ひょ",
    hasDakuten: false,
    isCombo: true,
    row: "yo",
    column: "h",
    hepburn: "hyo",
    nihon: "hyo",
  },

  {
    kana: "みゃ",
    hasDakuten: false,
    isCombo: true,
    row: "ya",
    column: "m",
    hepburn: "mya",
    nihon: "mya",
  },
  {
    kana: "みゅ",
    hasDakuten: false,
    isCombo: true,
    row: "yu",
    column: "m",
    hepburn: "myu",
    nihon: "myu",
  },
  {
    kana: "みょ",
    hasDakuten: false,
    isCombo: true,
    row: "yo",
    column: "m",
    hepburn: "myo",
    nihon: "myo",
  },

  {
    kana: "りゃ",
    hasDakuten: false,
    isCombo: true,
    row: "ya",
    column: "r",
    hepburn: "rya",
    nihon: "rya",
  },
  {
    kana: "りゅ",
    hasDakuten: false,
    isCombo: true,
    row: "yu",
    column: "r",
    hepburn: "ryu",
    nihon: "ryu",
  },
  {
    kana: "りょ",
    hasDakuten: false,
    isCombo: true,
    row: "yo",
    column: "r",
    hepburn: "ryo",
    nihon: "ryo",
  },

  {
    kana: "ぎゃ",
    hasDakuten: true,
    isCombo: true,
    row: "ya",
    column: "g",
    hepburn: "gya",
    nihon: "gya",
  },
  {
    kana: "ぎゅ",
    hasDakuten: true,
    isCombo: true,
    row: "yu",
    column: "g",
    hepburn: "gyu",
    nihon: "gyu",
  },
  {
    kana: "ぎょ",
    hasDakuten: true,
    isCombo: true,
    row: "yo",
    column: "g",
    hepburn: "gyo",
    nihon: "gyo",
  },

  {
    kana: "じゃ",
    hasDakuten: true,
    isCombo: true,
    row: "ya",
    column: "z",
    hepburn: "ja",
    nihon: "zya",
  },
  {
    kana: "じゅ",
    hasDakuten: true,
    isCombo: true,
    row: "yu",
    column: "z",
    hepburn: "ju",
    nihon: "zyu",
  },
  {
    kana: "じょ",
    hasDakuten: true,
    isCombo: true,
    row: "yo",
    column: "z",
    hepburn: "jo",
    nihon: "zyo",
  },

  {
    kana: "ぢゃ",
    hasDakuten: true,
    isCombo: true,
    row: "ya",
    column: "d",
    hepburn: "ja",
    nihon: "dya",
  },
  {
    kana: "ぢゅ",
    hasDakuten: true,
    isCombo: true,
    row: "yu",
    column: "d",
    hepburn: "ju",
    nihon: "dyu",
  },
  {
    kana: "ぢょ",
    hasDakuten: true,
    isCombo: true,
    row: "yo",
    column: "d",
    hepburn: "jo",
    nihon: "dyo",
  },

  {
    kana: "びゃ",
    hasDakuten: true,
    isCombo: true,
    row: "ya",
    column: "b",
    hepburn: "bya",
    nihon: "bya",
  },
  {
    kana: "びゅ",
    hasDakuten: true,
    isCombo: true,
    row: "yu",
    column: "b",
    hepburn: "byu",
    nihon: "byu",
  },
  {
    kana: "びょ",
    hasDakuten: true,
    isCombo: true,
    row: "yo",
    column: "b",
    hepburn: "byo",
    nihon: "byo",
  },

  {
    kana: "ぴゃ",
    hasDakuten: true,
    isCombo: true,
    row: "ya",
    column: "p",
    hepburn: "pya",
    nihon: "pya",
  },
  {
    kana: "ぴゅ",
    hasDakuten: true,
    isCombo: true,
    row: "yu",
    column: "p",
    hepburn: "pyu",
    nihon: "pyu",
  },
  {
    kana: "ぴょ",
    hasDakuten: true,
    isCombo: true,
    row: "yo",
    column: "p",
    hepburn: "pyo",
    nihon: "pyo",
  },
];

for (const kana of hiragana) {
  if (kana.isCombo) {
    comboColumns.add(kana.column);
    comboHiragana.push(kana);
  } else {
    standardColumns.add(kana.column);
    standardHiragana.push(kana);
  }
  hiraganaMap.set(kana.column + kana.row, kana);
  if (kana.column === "." && !kana.isCombo) {
    currentPool.push(kana);
  }
}

function saveSettings() {
  settings.kanaStringList = [];
  for (const kana of currentPool) {
    settings.kanaStringList.push(kana.column + kana.row);
  }
  localStorage.setItem("kanaPractice", JSON.stringify(settings));
}

function loadSettings() {
  const string = localStorage.getItem("kanaPractice");
  const loadedSettings = JSON.parse(string);
  settings = { ...settings, ...loadedSettings };
  if (settings.kanaStringList) {
    currentPool.length = 0;
    for (const kana of settings.kanaStringList) {
      currentPool.push(hiraganaMap.get(kana));
    }
    showTableSettings();
  }
}

function makeTable(table, cols, vowels) {
  table.innerHTML = "";
  const headRow = document.createElement("tr");
  const emptySpace = document.createElement("th");
  emptySpace.textContent = "×";
  emptySpace.classList.add("clickable");
  headRow.appendChild(emptySpace);
  const masterKanaList = [];
  for (const column of cols.values()) {
    const th = document.createElement("th");
    th.textContent = column;
    th.classList.add("clickable");
    const kanaList = [];
    for (const vowel of vowels) {
      const kana = hiraganaMap.get(column + vowel);
      if (!kana) continue;
      kanaList.push(kana);
      masterKanaList.push(kana);
    }
    th.onclick = () => {
      toggleActiveMultiple(kanaList);
      showTableSettings();
    };
    headRow.appendChild(th);
  }
  emptySpace.onclick = () => {
    toggleActiveMultiple(masterKanaList);
    showTableSettings();
  };
  table.appendChild(headRow);
  for (const vowel of vowels) {
    const tr = document.createElement("tr");
    const label = document.createElement("th");
    label.textContent = vowel;
    label.classList.add("clickable");
    const vowelKanas = [];
    for (const column of cols) {
      const kana = hiraganaMap.get(column + vowel);
      if (!kana) continue;
      vowelKanas.push(kana);
    }
    label.onclick = () => {
      toggleActiveMultiple(vowelKanas);
      showTableSettings();
    };
    tr.appendChild(label);
    for (const column of cols.values()) {
      const kana = hiraganaMap.get(column + vowel);
      const td = document.createElement("td");
      if (kana) {
        td.innerHTML = `<ruby>${kana.kana}<rt>${kana[settings.ro]}</rt></ruby>`;
        td.classList.add("clickable");
      }
      tr.appendChild(td);
      kanaButtons.push([kana, td]);
      td.onclick = () => {
        toggleActiveSingle(kana);
        showTableSettings();
      };
    }
    table.appendChild(tr);
  }
}

function toggleActiveSingle(kana) {
  const index = currentPool.indexOf(kana);
  if (index === -1) {
    currentPool.push(kana);
  } else {
    currentPool.splice(index, 1);
  }
  bag.length = 0;
  saveSettings();
}

function toggleActiveMultiple(kanas) {
  if (allKanasActive(kanas)) {
    removeKanas(kanas);
  } else {
    addKanas(kanas);
  }
  bag.length = 0;
  saveSettings();
}

function allKanasActive(kanas) {
  for (const kana of kanas) {
    if (currentPool.indexOf(kana) === -1) return false;
  }
  return true;
}

function addKanas(kanas) {
  for (const kana of kanas) {
    if (currentPool.indexOf(kana) === -1) currentPool.push(kana);
  }
}

function removeKanas(kanas) {
  currentPool = currentPool.filter((kana) => !kanas.includes(kana));
}

function genTables() {
  makeTable(document.getElementById("hiragana-standard"), standardColumns, [
    "a",
    "i",
    "u",
    "e",
    "o",
  ]);
  makeTable(document.getElementById("hiragana-combo"), comboColumns, [
    "ya",
    "yu",
    "yo",
  ]);
}


function showTableSettings() {
  for (const [kana, td] of kanaButtons) {
    if (currentPool.indexOf(kana) === -1) {
      td.classList.remove("on");
    } else {
      td.classList.add("on");
    }
  }
}


const roHep = document.getElementById("ro-hep");
const roNi = document.getElementById("ro-ni");
const audioOn = document.getElementById("audio-on");
const audioOff = document.getElementById("audio-off");
const advReg = document.getElementById("adv-reg");
const advInst = document.getElementById("adv-inst");
function showOtherSettings() {
  if (settings.ro === "hepburn") {
    roHep.classList.add("on");
    roNi.classList.remove("on");
  } else {
    roNi.classList.add("on");
    roHep.classList.remove("on");
  }

  if (settings.audio) {
    audioOn.classList.add("on");
    audioOff.classList.remove("on");
  } else {
    audioOff.classList.add("on");
    audioOn.classList.remove("on");
  }

  if (settings.advAnim) {
    advReg.classList.add("on");
    advInst.classList.remove("on");
  } else {
    advInst.classList.add("on");
    advReg.classList.remove("on");
  }
}

roHep.onclick = () => {
  settings.ro = "hepburn";
  saveSettings();
  showOtherSettings();
  genTables();
  showTableSettings();
};

roNi.onclick = () => {
  settings.ro = "nihon";
  saveSettings();
  showOtherSettings();
  genTables();
  showTableSettings();
};

audioOn.onclick = () => {
  settings.audio = true;
  saveSettings();
  showOtherSettings();
};

audioOff.onclick = () => {
  settings.audio = false;
  saveSettings();
  showOtherSettings();
};

advReg.onclick = () => {
  settings.advAnim = true;
  saveSettings();
  showOtherSettings();
};

advInst.onclick = () => {
  settings.advAnim = false;
  saveSettings();
  showOtherSettings();
};


async function loadSound() {
  const sprites = await fetch("kana.json");
  audioSprites = await sprites.json();
  const audio = await fetch("kana.m4a");
  const arrayBuffer = await audio.arrayBuffer();
  audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
  soundIsReady = true;
}

const settingsToggle = document.getElementById("settings-toggle");
const settingsDiv = document.getElementById("settings");
settingsToggle.onclick = () => {
  if (settingsDiv.classList.contains("hidden")) {
    settingsDiv.classList.remove("hidden");
    settingsToggle.textContent = "Hide Settings";
  } else {
    settingsDiv.classList.add("hidden");
    settingsToggle.textContent = "Show Settings";
  }
};

loadSound();
loadSettings();
showOtherSettings();
genTables();
showTableSettings();

nextKana();
