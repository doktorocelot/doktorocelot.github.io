// Look, I just hacked this shit together, okay?
// Don't judge how awful it is!

const kanaDisplay = document.getElementById("kana-display");
const kanaInput = document.getElementById("kana-input");
const romajiCorrection = document.getElementById("romaji-correction");
const resultsRemain = document.getElementById("re-remain");
const resultsCorrect = document.getElementById("re-correct");
const resultsWrong = document.getElementById("re-wrong");
const resultsStars = document.getElementById("re-stars");
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
let totalWrong = 0;
let totalCorrect = 0;
let perfectGames = -1;

let settings = {
  ro: "hepburn",
  audio: true,
  advAnim: true,
  returnsToBag: false,
  font: "goth",
  displayed: "hiragana",
};

function pick(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function pull(array) {
  const index = Math.floor(Math.random() * array.length);
  return array.splice(index, 1)[0];
}

function nextKana() {
  if (bag.length === 0) {
    if (totalWrong === 0) {
      perfectGames++;
    } else {
      perfectGames = 0;
    }
    resetCurrentResults();
    bag = [...currentPool];
  }
  drawResults();
  current = pull(bag) ?? standardHiragana[0];
  kanaDisplay.textContent = current[settings.displayed];
  kanaDisplay.classList.remove("correct", "wrong", "fade");
  void kanaDisplay.offsetWidth;
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
  const sprite = audioSprites.spritemap[`${current.hiragana}_v2`];
  if (!sprite) return;
  currentPlaying?.stop();
  currentPlaying = audioCtx.createBufferSource();
  currentPlaying.buffer = audioBuffer;
  currentPlaying.connect(audioCtx.destination);
  const len = sprite.end - sprite.start;
  currentPlaying.start(0, sprite.start, len);
}

let lastPerfectGames = -1;
let lastBagCount = 0;

function drawResults() {
  perfectGames = Math.max(0, perfectGames);
  resultsRemain.textContent = bag.length;
  resultsCorrect.textContent = totalCorrect;
  resultsWrong.textContent = totalWrong;
  resultsStars.textContent =
    perfectGames <= 5 ? "★".repeat(perfectGames) : `★×${perfectGames}`;
  if (perfectGames > lastPerfectGames) {
    resultsStars.classList.remove("gold");
    void resultsStars.offsetWidth;
    resultsStars.classList.add("gold");
  }
  lastPerfectGames = perfectGames;
}

function submitAnswer(e) {
  kanaInput.value = kanaInput.value.toLowerCase();
  if (disabledAnswer) {
    kanaInput.value = disabledAnswer;
    return;
  }
  const val = kanaInput.value;

  if (isCorrect(val)) {
    if (wasWrong) {
      totalWrong++;
      if (settings.returnsToBag) bag.push(current);
    } else {
      totalCorrect++;
    }
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
    hiragana: "あ",
    katakana: "ア",
    hasDakuten: false,
    isCombo: false,
    row: "a",
    column: ".",
    hepburn: "a",
    nihon: "a",
  },
  {
    hiragana: "い",
    katakana: "イ",
    hasDakuten: false,
    isCombo: false,
    row: "i",
    column: ".",
    hepburn: "i",
    nihon: "i",
  },
  {
    hiragana: "う",
    katakana: "ウ",
    hasDakuten: false,
    isCombo: false,
    row: "u",
    column: ".",
    hepburn: "u",
    nihon: "u",
  },
  {
    hiragana: "え",
    katakana: "エ",
    hasDakuten: false,
    isCombo: false,
    row: "e",
    column: ".",
    hepburn: "e",
    nihon: "e",
  },
  {
    hiragana: "お",
    katakana: "オ",
    hasDakuten: false,
    isCombo: false,
    row: "o",
    column: ".",
    hepburn: "o",
    nihon: "o",
  },

  {
    hiragana: "か",
    katakana: "カ",
    hasDakuten: false,
    isCombo: false,
    row: "a",
    column: "k",
    hepburn: "ka",
    nihon: "ka",
  },
  {
    hiragana: "き",
    katakana: "キ",
    hasDakuten: false,
    isCombo: false,
    row: "i",
    column: "k",
    hepburn: "ki",
    nihon: "ki",
  },
  {
    hiragana: "く",
    katakana: "ク",
    hasDakuten: false,
    isCombo: false,
    row: "u",
    column: "k",
    hepburn: "ku",
    nihon: "ku",
  },
  {
    hiragana: "け",
    katakana: "ケ",
    hasDakuten: false,
    isCombo: false,
    row: "e",
    column: "k",
    hepburn: "ke",
    nihon: "ke",
  },
  {
    hiragana: "こ",
    katakana: "コ",
    hasDakuten: false,
    isCombo: false,
    row: "o",
    column: "k",
    hepburn: "ko",
    nihon: "ko",
  },

  {
    hiragana: "さ",
    katakana: "サ",
    hasDakuten: false,
    isCombo: false,
    row: "a",
    column: "s",
    hepburn: "sa",
    nihon: "sa",
  },
  {
    hiragana: "し",
    katakana: "シ",
    hasDakuten: false,
    isCombo: false,
    row: "i",
    column: "s",
    hepburn: "shi",
    nihon: "si",
  },
  {
    hiragana: "す",
    katakana: "ス",
    hasDakuten: false,
    isCombo: false,
    row: "u",
    column: "s",
    hepburn: "su",
    nihon: "su",
  },
  {
    hiragana: "せ",
    katakana: "セ",
    hasDakuten: false,
    isCombo: false,
    row: "e",
    column: "s",
    hepburn: "se",
    nihon: "se",
  },
  {
    hiragana: "そ",
    katakana: "ソ",
    hasDakuten: false,
    isCombo: false,
    row: "o",
    column: "s",
    hepburn: "so",
    nihon: "so",
  },

  {
    hiragana: "た",
    katakana: "タ",
    hasDakuten: false,
    isCombo: false,
    row: "a",
    column: "t",
    hepburn: "ta",
    nihon: "ta",
  },
  {
    hiragana: "ち",
    katakana: "チ",
    hasDakuten: false,
    isCombo: false,
    row: "i",
    column: "t",
    hepburn: "chi",
    nihon: "ti",
  },
  {
    hiragana: "つ",
    katakana: "ツ",
    hasDakuten: false,
    isCombo: false,
    row: "u",
    column: "t",
    hepburn: "tsu",
    nihon: "tu",
  },
  {
    hiragana: "て",
    katakana: "テ",
    hasDakuten: false,
    isCombo: false,
    row: "e",
    column: "t",
    hepburn: "te",
    nihon: "te",
  },
  {
    hiragana: "と",
    katakana: "ト",
    hasDakuten: false,
    isCombo: false,
    row: "o",
    column: "t",
    hepburn: "to",
    nihon: "to",
  },

  {
    hiragana: "な",
    katakana: "ナ",
    hasDakuten: false,
    isCombo: false,
    row: "a",
    column: "n",
    hepburn: "na",
    nihon: "na",
  },
  {
    hiragana: "に",
    katakana: "ニ",
    hasDakuten: false,
    isCombo: false,
    row: "i",
    column: "n",
    hepburn: "ni",
    nihon: "ni",
  },
  {
    hiragana: "ぬ",
    katakana: "ヌ",
    hasDakuten: false,
    isCombo: false,
    row: "u",
    column: "n",
    hepburn: "nu",
    nihon: "nu",
  },
  {
    hiragana: "ね",
    katakana: "ネ",
    hasDakuten: false,
    isCombo: false,
    row: "e",
    column: "n",
    hepburn: "ne",
    nihon: "ne",
  },
  {
    hiragana: "の",
    katakana: "ノ",
    hasDakuten: false,
    isCombo: false,
    row: "o",
    column: "n",
    hepburn: "no",
    nihon: "no",
  },

  {
    hiragana: "は",
    katakana: "ハ",
    hasDakuten: false,
    isCombo: false,
    row: "a",
    column: "h",
    hepburn: "ha",
    nihon: "ha",
  },
  {
    hiragana: "ひ",
    katakana: "ヒ",
    hasDakuten: false,
    isCombo: false,
    row: "i",
    column: "h",
    hepburn: "hi",
    nihon: "hi",
  },
  {
    hiragana: "ふ",
    katakana: "フ",
    hasDakuten: false,
    isCombo: false,
    row: "u",
    column: "h",
    hepburn: "fu",
    nihon: "hu",
  },
  {
    hiragana: "へ",
    katakana: "ヘ",
    hasDakuten: false,
    isCombo: false,
    row: "e",
    column: "h",
    hepburn: "he",
    nihon: "he",
  },
  {
    hiragana: "ほ",
    katakana: "ホ",
    hasDakuten: false,
    isCombo: false,
    row: "o",
    column: "h",
    hepburn: "ho",
    nihon: "ho",
  },

  {
    hiragana: "ま",
    katakana: "マ",
    hasDakuten: false,
    isCombo: false,
    row: "a",
    column: "m",
    hepburn: "ma",
    nihon: "ma",
  },
  {
    hiragana: "み",
    katakana: "ミ",
    hasDakuten: false,
    isCombo: false,
    row: "i",
    column: "m",
    hepburn: "mi",
    nihon: "mi",
  },
  {
    hiragana: "む",
    katakana: "ム",
    hasDakuten: false,
    isCombo: false,
    row: "u",
    column: "m",
    hepburn: "mu",
    nihon: "mu",
  },
  {
    hiragana: "め",
    katakana: "メ",
    hasDakuten: false,
    isCombo: false,
    row: "e",
    column: "m",
    hepburn: "me",
    nihon: "me",
  },
  {
    hiragana: "も",
    katakana: "モ",
    hasDakuten: false,
    isCombo: false,
    row: "o",
    column: "m",
    hepburn: "mo",
    nihon: "mo",
  },

  {
    hiragana: "や",
    katakana: "ヤ",
    hasDakuten: false,
    isCombo: false,
    row: "a",
    column: "y",
    hepburn: "ya",
    nihon: "ya",
  },
  {
    hiragana: "ゆ",
    katakana: "ユ",
    hasDakuten: false,
    isCombo: false,
    row: "u",
    column: "y",
    hepburn: "yu",
    nihon: "yu",
  },
  {
    hiragana: "よ",
    katakana: "ヨ",
    hasDakuten: false,
    isCombo: false,
    row: "o",
    column: "y",
    hepburn: "yo",
    nihon: "yo",
  },

  {
    hiragana: "ら",
    katakana: "ラ",
    hasDakuten: false,
    isCombo: false,
    row: "a",
    column: "r",
    hepburn: "ra",
    nihon: "ra",
  },
  {
    hiragana: "り",
    katakana: "リ",
    hasDakuten: false,
    isCombo: false,
    row: "i",
    column: "r",
    hepburn: "ri",
    nihon: "ri",
  },
  {
    hiragana: "る",
    katakana: "ル",
    hasDakuten: false,
    isCombo: false,
    row: "u",
    column: "r",
    hepburn: "ru",
    nihon: "ru",
  },
  {
    hiragana: "れ",
    katakana: "レ",
    hasDakuten: false,
    isCombo: false,
    row: "e",
    column: "r",
    hepburn: "re",
    nihon: "re",
  },
  {
    hiragana: "ろ",
    katakana: "ロ",
    hasDakuten: false,
    isCombo: false,
    row: "o",
    column: "r",
    hepburn: "ro",
    nihon: "ro",
  },

  {
    hiragana: "わ",
    katakana: "ワ",
    hasDakuten: false,
    isCombo: false,
    row: "a",
    column: "w",
    hepburn: "wa",
    nihon: "wa",
  },
  {
    hiragana: "を",
    katakana: "ヲ",
    hasDakuten: false,
    isCombo: false,
    row: "o",
    column: "w",
    hepburn: "o",
    nihon: "wo",
  },

  {
    hiragana: "ん",
    katakana: "ン",
    hasDakuten: false,
    isCombo: false,
    row: "o",
    column: "ɴ",
    hepburn: "n",
    nihon: "n",
  },

  {
    hiragana: "が",
    katakana: "ガ",
    hasDakuten: true,
    isCombo: false,
    row: "a",
    column: "g",
    hepburn: "ga",
    nihon: "ga",
  },
  {
    hiragana: "ぎ",
    katakana: "ギ",
    hasDakuten: true,
    isCombo: false,
    row: "i",
    column: "g",
    hepburn: "gi",
    nihon: "gi",
  },
  {
    hiragana: "ぐ",
    katakana: "グ",
    hasDakuten: true,
    isCombo: false,
    row: "u",
    column: "g",
    hepburn: "gu",
    nihon: "gu",
  },
  {
    hiragana: "げ",
    katakana: "ゲ",
    hasDakuten: true,
    isCombo: false,
    row: "e",
    column: "g",
    hepburn: "ge",
    nihon: "ge",
  },
  {
    hiragana: "ご",
    katakana: "ゴ",
    hasDakuten: true,
    isCombo: false,
    row: "o",
    column: "g",
    hepburn: "go",
    nihon: "go",
  },

  {
    hiragana: "ざ",
    katakana: "ザ",
    hasDakuten: true,
    isCombo: false,
    row: "a",
    column: "z",
    hepburn: "za",
    nihon: "za",
  },
  {
    hiragana: "じ",
    katakana: "ジ",
    hasDakuten: true,
    isCombo: false,
    row: "i",
    column: "z",
    hepburn: "ji",
    nihon: "zi",
  },
  {
    hiragana: "ず",
    katakana: "ズ",
    hasDakuten: true,
    isCombo: false,
    row: "u",
    column: "z",
    hepburn: "zu",
    nihon: "zu",
  },
  {
    hiragana: "ぜ",
    katakana: "ゼ",
    hasDakuten: true,
    isCombo: false,
    row: "e",
    column: "z",
    hepburn: "ze",
    nihon: "ze",
  },
  {
    hiragana: "ぞ",
    katakana: "ゾ",
    hasDakuten: true,
    isCombo: false,
    row: "o",
    column: "z",
    hepburn: "zo",
    nihon: "zo",
  },

  {
    hiragana: "だ",
    katakana: "ダ",
    hasDakuten: true,
    isCombo: false,
    row: "a",
    column: "d",
    hepburn: "da",
    nihon: "da",
  },
  {
    hiragana: "ぢ",
    katakana: "ヂ",
    hasDakuten: true,
    isCombo: false,
    row: "i",
    column: "d",
    hepburn: "ji",
    nihon: "di",
  },
  {
    hiragana: "づ",
    katakana: "ヅ",
    hasDakuten: true,
    isCombo: false,
    row: "u",
    column: "d",
    hepburn: "zu",
    nihon: "du",
  },
  {
    hiragana: "で",
    katakana: "デ",
    hasDakuten: true,
    isCombo: false,
    row: "e",
    column: "d",
    hepburn: "de",
    nihon: "de",
  },
  {
    hiragana: "ど",
    katakana: "ド",
    hasDakuten: true,
    isCombo: false,
    row: "o",
    column: "d",
    hepburn: "do",
    nihon: "do",
  },

  {
    hiragana: "ば",
    katakana: "バ",
    hasDakuten: true,
    isCombo: false,
    row: "a",
    column: "b",
    hepburn: "ba",
    nihon: "ba",
  },
  {
    hiragana: "び",
    katakana: "ビ",
    hasDakuten: true,
    isCombo: false,
    row: "i",
    column: "b",
    hepburn: "bi",
    nihon: "bi",
  },
  {
    hiragana: "ぶ",
    katakana: "ブ",
    hasDakuten: true,
    isCombo: false,
    row: "u",
    column: "b",
    hepburn: "bu",
    nihon: "bu",
  },
  {
    hiragana: "べ",
    katakana: "ベ",
    hasDakuten: true,
    isCombo: false,
    row: "e",
    column: "b",
    hepburn: "be",
    nihon: "be",
  },
  {
    hiragana: "ぼ",
    katakana: "ボ",
    hasDakuten: true,
    isCombo: false,
    row: "o",
    column: "b",
    hepburn: "bo",
    nihon: "bo",
  },

  {
    hiragana: "ぱ",
    katakana: "パ",
    hasDakuten: true,
    isCombo: false,
    row: "a",
    column: "p",
    hepburn: "pa",
    nihon: "pa",
  },
  {
    hiragana: "ぴ",
    katakana: "ピ",
    hasDakuten: true,
    isCombo: false,
    row: "i",
    column: "p",
    hepburn: "pi",
    nihon: "pi",
  },
  {
    hiragana: "ぷ",
    katakana: "プ",
    hasDakuten: true,
    isCombo: false,
    row: "u",
    column: "p",
    hepburn: "pu",
    nihon: "pu",
  },
  {
    hiragana: "ぺ",
    katakana: "ペ",
    hasDakuten: true,
    isCombo: false,
    row: "e",
    column: "p",
    hepburn: "pe",
    nihon: "pe",
  },
  {
    hiragana: "ぽ",
    katakana: "ポ",
    hasDakuten: true,
    isCombo: false,
    row: "o",
    column: "p",
    hepburn: "po",
    nihon: "po",
  },

  {
    hiragana: "きゃ",
    katakana: "キャ",
    hasDakuten: false,
    isCombo: true,
    row: "ya",
    column: "k",
    hepburn: "kya",
    nihon: "kya",
  },
  {
    hiragana: "きゅ",
    katakana: "キュ",
    hasDakuten: false,
    isCombo: true,
    row: "yu",
    column: "k",
    hepburn: "kyu",
    nihon: "kyu",
  },
  {
    hiragana: "きょ",
    katakana: "キョ",
    hasDakuten: false,
    isCombo: true,
    row: "yo",
    column: "k",
    hepburn: "kyo",
    nihon: "kyo",
  },

  {
    hiragana: "しゃ",
    katakana: "シャ",
    hasDakuten: false,
    isCombo: true,
    row: "ya",
    column: "s",
    hepburn: "sha",
    nihon: "sya",
  },
  {
    hiragana: "しゅ",
    katakana: "シュ",
    hasDakuten: false,
    isCombo: true,
    row: "yu",
    column: "s",
    hepburn: "shu",
    nihon: "syu",
  },
  {
    hiragana: "しょ",
    katakana: "ショ",
    hasDakuten: false,
    isCombo: true,
    row: "yo",
    column: "s",
    hepburn: "sho",
    nihon: "syo",
  },

  {
    hiragana: "ちゃ",
    katakana: "チャ",
    hasDakuten: false,
    isCombo: true,
    row: "ya",
    column: "t",
    hepburn: "cha",
    nihon: "tya",
  },
  {
    hiragana: "ちゅ",
    katakana: "チュ",
    hasDakuten: false,
    isCombo: true,
    row: "yu",
    column: "t",
    hepburn: "chu",
    nihon: "tyu",
  },
  {
    hiragana: "ちょ",
    katakana: "チョ",
    hasDakuten: false,
    isCombo: true,
    row: "yo",
    column: "t",
    hepburn: "cho",
    nihon: "tyo",
  },

  {
    hiragana: "にゃ",
    katakana: "ニャ",
    hasDakuten: false,
    isCombo: true,
    row: "ya",
    column: "n",
    hepburn: "nya",
    nihon: "nya",
  },
  {
    hiragana: "にゅ",
    katakana: "ニュ",
    hasDakuten: false,
    isCombo: true,
    row: "yu",
    column: "n",
    hepburn: "nyu",
    nihon: "nyu",
  },
  {
    hiragana: "にょ",
    katakana: "ニョ",
    hasDakuten: false,
    isCombo: true,
    row: "yo",
    column: "n",
    hepburn: "nyo",
    nihon: "nyo",
  },

  {
    hiragana: "ひゃ",
    katakana: "ヒャ",
    hasDakuten: false,
    isCombo: true,
    row: "ya",
    column: "h",
    hepburn: "hya",
    nihon: "hya",
  },
  {
    hiragana: "ひゅ",
    katakana: "ヒュ",
    hasDakuten: false,
    isCombo: true,
    row: "yu",
    column: "h",
    hepburn: "hyu",
    nihon: "hyu",
  },
  {
    hiragana: "ひょ",
    katakana: "ヒョ",
    hasDakuten: false,
    isCombo: true,
    row: "yo",
    column: "h",
    hepburn: "hyo",
    nihon: "hyo",
  },

  {
    hiragana: "みゃ",
    katakana: "ミャ",
    hasDakuten: false,
    isCombo: true,
    row: "ya",
    column: "m",
    hepburn: "mya",
    nihon: "mya",
  },
  {
    hiragana: "みゅ",
    katakana: "ミュ",
    hasDakuten: false,
    isCombo: true,
    row: "yu",
    column: "m",
    hepburn: "myu",
    nihon: "myu",
  },
  {
    hiragana: "みょ",
    katakana: "ミョ",
    hasDakuten: false,
    isCombo: true,
    row: "yo",
    column: "m",
    hepburn: "myo",
    nihon: "myo",
  },

  {
    hiragana: "りゃ",
    katakana: "リャ",
    hasDakuten: false,
    isCombo: true,
    row: "ya",
    column: "r",
    hepburn: "rya",
    nihon: "rya",
  },
  {
    hiragana: "りゅ",
    katakana: "リュ",
    hasDakuten: false,
    isCombo: true,
    row: "yu",
    column: "r",
    hepburn: "ryu",
    nihon: "ryu",
  },
  {
    hiragana: "りょ",
    katakana: "リョ",
    hasDakuten: false,
    isCombo: true,
    row: "yo",
    column: "r",
    hepburn: "ryo",
    nihon: "ryo",
  },

  {
    hiragana: "ぎゃ",
    katakana: "ギャ",
    hasDakuten: true,
    isCombo: true,
    row: "ya",
    column: "g",
    hepburn: "gya",
    nihon: "gya",
  },
  {
    hiragana: "ぎゅ",
    katakana: "ギュ",
    hasDakuten: true,
    isCombo: true,
    row: "yu",
    column: "g",
    hepburn: "gyu",
    nihon: "gyu",
  },
  {
    hiragana: "ぎょ",
    katakana: "ギョ",
    hasDakuten: true,
    isCombo: true,
    row: "yo",
    column: "g",
    hepburn: "gyo",
    nihon: "gyo",
  },

  {
    hiragana: "じゃ",
    katakana: "ジャ",
    hasDakuten: true,
    isCombo: true,
    row: "ya",
    column: "z",
    hepburn: "ja",
    nihon: "zya",
  },
  {
    hiragana: "じゅ",
    katakana: "ジュ",
    hasDakuten: true,
    isCombo: true,
    row: "yu",
    column: "z",
    hepburn: "ju",
    nihon: "zyu",
  },
  {
    hiragana: "じょ",
    katakana: "ジョ",
    hasDakuten: true,
    isCombo: true,
    row: "yo",
    column: "z",
    hepburn: "jo",
    nihon: "zyo",
  },

  {
    hiragana: "ぢゃ",
    katakana: "ヂャ",
    hasDakuten: true,
    isCombo: true,
    row: "ya",
    column: "d",
    hepburn: "ja",
    nihon: "dya",
  },
  {
    hiragana: "ぢゅ",
    katakana: "ヂュ",
    hasDakuten: true,
    isCombo: true,
    row: "yu",
    column: "d",
    hepburn: "ju",
    nihon: "dyu",
  },
  {
    hiragana: "ぢょ",
    katakana: "ヂョ",
    hasDakuten: true,
    isCombo: true,
    row: "yo",
    column: "d",
    hepburn: "jo",
    nihon: "dyo",
  },

  {
    hiragana: "びゃ",
    katakana: "ビャ",
    hasDakuten: true,
    isCombo: true,
    row: "ya",
    column: "b",
    hepburn: "bya",
    nihon: "bya",
  },
  {
    hiragana: "びゅ",
    katakana: "ビュ",
    hasDakuten: true,
    isCombo: true,
    row: "yu",
    column: "b",
    hepburn: "byu",
    nihon: "byu",
  },
  {
    hiragana: "びょ",
    katakana: "ビョ",
    hasDakuten: true,
    isCombo: true,
    row: "yo",
    column: "b",
    hepburn: "byo",
    nihon: "byo",
  },

  {
    hiragana: "ぴゃ",
    katakana: "ピャ",
    hasDakuten: true,
    isCombo: true,
    row: "ya",
    column: "p",
    hepburn: "pya",
    nihon: "pya",
  },
  {
    hiragana: "ぴゅ",
    katakana: "ピュ",
    hasDakuten: true,
    isCombo: true,
    row: "yu",
    column: "p",
    hepburn: "pyu",
    nihon: "pyu",
  },
  {
    hiragana: "ぴょ",
    katakana: "ピョ",
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
        td.innerHTML = `<ruby>${kana[settings.displayed]}<rt>${kana[settings.ro]}</rt></ruby>`;
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

function resetBag() {
  bag.length = 0;
  perfectGames = -1;
  lastPerfectGames = -1;
  resetCurrentResults();
  nextKana();
}

function resetCurrentResults() {
  totalCorrect = 0;
  totalWrong = 0;
}

function toggleActiveSingle(kana) {
  const index = currentPool.indexOf(kana);
  if (index === -1) {
    currentPool.push(kana);
  } else {
    currentPool.splice(index, 1);
  }
  resetBag();
  saveSettings();
}

function toggleActiveMultiple(kanas) {
  if (allKanasActive(kanas)) {
    removeKanas(kanas);
  } else {
    addKanas(kanas);
  }
  resetBag();
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
const scrHiragana = document.getElementById("scr-hiragana");
const scrKatakana = document.getElementById("scr-katakana");
const audioOn = document.getElementById("audio-on");
const audioOff = document.getElementById("audio-off");
const advReg = document.getElementById("adv-reg");
const advInst = document.getElementById("adv-inst");
const wrongAway = document.getElementById("wrong-away");
const wrongIn = document.getElementById("wrong-in");

const fonts = [
  ["goth", document.getElementById("font-goth"), "font-gothic", 1],
  ["min", document.getElementById("font-min"), "font-mincho", 1],
  ["wra", document.getElementById("font-wra"), "font-written-calligraphic", 1],
  ["wrb", document.getElementById("font-wrb"), "font-written-playful", 1],
  ["dotm", document.getElementById("font-dotm"), "font-dot-matrix", 1],
  ["nes", document.getElementById("font-nes"), "font-nes", 0.5],
  ["brush", document.getElementById("font-brush"), "font-brush", 1],
];

function showOtherSettings() {
  if (settings.ro === "hepburn") {
    roHep.classList.add("on");
    roNi.classList.remove("on");
  } else {
    roNi.classList.add("on");
    roHep.classList.remove("on");
  }

  if (settings.displayed === "hiragana") {
    scrHiragana.classList.add("on");
    scrKatakana.classList.remove("on");
  } else {
    scrKatakana.classList.add("on");
    scrHiragana.classList.remove("on");
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

  if (settings.returnsToBag) {
    wrongIn.classList.add("on");
    wrongAway.classList.remove("on");
  } else {
    wrongAway.classList.add("on");
    wrongIn.classList.remove("on");
  }

  for (const [name, e, prop, size] of fonts) {
    if (settings.font === name) {
      e.classList.add("on");
      document.documentElement.style.setProperty(
        "--font-kana",
        `var(--${prop})`,
      );
      document.documentElement.style.setProperty(
        "--kana-size",
        `${size.toString()}rem`,
      );
    } else {
      e.classList.remove("on");
    }
  }
}

for (const [name, e] of fonts) {
  e.onclick = () => {
    settings.font = name;
    saveSettings();
    showOtherSettings();
  };
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

scrHiragana.onclick = () => {
  settings.displayed = "hiragana";
  saveSettings();
  showOtherSettings();
  genTables();
  showTableSettings();
  resetBag();
};

scrKatakana.onclick = () => {
  settings.displayed = "katakana";
  saveSettings();
  showOtherSettings();
  genTables();
  showTableSettings();
  resetBag();
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

wrongAway.onclick = () => {
  settings.returnsToBag = false;
  saveSettings();
  showOtherSettings();
};

wrongIn.onclick = () => {
  settings.returnsToBag = true;
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
