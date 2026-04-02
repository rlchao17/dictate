// no more getElementById after this

const ESelectLang = document.getElementById("selectLang");
const EInit = document.getElementById("init");
const EWordListInput = document.getElementById("wordListInput");
const EAfterInit = document.getElementById("afterInit");
const EDictateInput = document.getElementById("dictateInput");
const EIncorrect = document.getElementById("incorrect");
const ECorrect = document.getElementById("correct");
const EShowCorrect = document.getElementById("showCorrect");
const EShowWrong = document.getElementById("showWrong");

// tools

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function formatWord(word) {
  return word.trim()
             .replace(/\s+/g, ' ');
}

function formatToCompare(word) {
  return formatWord(word).toLowerCase()
                         .replace(/[^\w\s]/g, ".");
}

function getLang() {
  return ESelectLang.value;
}

function hideAndShow() {
  EInit.style.display = "none";
  EAfterInit.style.display = "block";
}

function waitForCheck() {
  // This thing is so annoying!
  return new Promise(resolve => {
    window.checkWord = () => {
      resolve();
    };
  });
}

function getDictated() {
  var dictated = EDictateInput.value;
  return formatWord(dictated);
}

function clearDictated() {
  EDictateInput.value = "";
}

function showCorrect() {
  EIncorrect.style.display = "none";
  ECorrect.style.display = "block";
}

function showIncorrect(original, dictated) {
  ECorrect.style.display = "none";
  EIncorrect.style.display = "block";
  EShowCorrect.textContent = original;
  EShowWrong.textContent = dictated;
}


// main

function playTTS(text, lang) {
  // Get the audio element
  var audioEl = document.getElementById("tts-audio");

  var url = `https://tts-api.netlify.app/?text=${text}&lang=${lang}`;
  // Backup API
  // var url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${lang}&client=tw-ob&q=${text}`;

  // add the sound to the audio element
  audioEl.src = url;

  // For auto playing the sound
  audioEl.play();
}

function readWordList() {
  var input = EWordListInput.value;
  var wordList = input.split("\n")
                      .map(formatWord)
                      .filter(line => line !== "");
  var emptyErrorMsg = "Input cannot be empty";

  if (wordList.length === 0) {
    alert(emptyErrorMsg);
    throw new Error(emptyErrorMsg);
  } else {
    return wordList;
  }
}

async function startDictating() {
  hideAndShow();
  
  var wordList = readWordList();
  
  for (var word of wordList) {
    playTTS(word, getLang());
    
    // wait for check button
    await waitForCheck();
    
    var dictated = getDictated();
    
    // clear so that they see it's being checked
    clearDictated();
    
    if (reallyCheck(word, dictated) === true) {
      showCorrect();
    } else {
      showIncorrect(word, dictated);
      
      // wait so they see why
      await sleep(3000);
    }
  }
}

function reallyCheck(original, dictated) {
  o = formatToCompare(original);
  d = formatToCompare(dictated);
  
  if (o === d) {
    return true;
  } else {
    return false;
  }
}