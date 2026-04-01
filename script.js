// tools

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function hideAndShow() {
  document.getElementById("input").style.display = "none";
  document.getElementById("dictating").style.display = "block";
}


function getLang() {
  var select = document.getElementById("selectLang");
  return select.value;
}

function getDictated() {
  return document.getElementById("dictateWord").value.trim();
}

function clearDictated() {
  document.getElementById("dictateWord").value = "";
}

function waitForCheck() {
  // This thing is so annoying!
  return new Promise(resolve => {
    window.checkWord = () => {
      resolve();
    };
  });
}

// main

function readWordList() {
  var input = document.getElementById("inputWordList").value;
  var wordList = input.split("\n")
                      .map(line => line.trim())
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
  var showResult = document.getElementById('result');
  
  for (var word of wordList) {
    clearDictated();
    playTTS(word, getLang())
    
    // wait for check button
    await waitForCheck();
    
    result = reallyCheck(word, getDictated());
    
    // show result text
    showResult.innerHTML = result[1];
    
    // wait longer if wrong
    if (result[0] === false) {
      await sleep(3000);
    }
  }
}

function reallyCheck(original, dictated) {
  o = original.toLowerCase().replace(/[^\w\s]|_/g, ".");
  d = dictated.toLowerCase().replace(/[^\w\s]|_/g, ".");
  
  if (o === d) {
    return [true, "<p style='color: green;'>Correct</p>"]
  } else {
    return [false, `<p>
<span style='color: red;'>Incorrect</span>
, it is 
<span style='color: green;'>${original}</span>
, not 
<span style='color: red;'>${dictated}</span>
</p>`]
  }
}

function playTTS(text, lang) {
  // Get the audio element
  var audioEl = document.getElementById('tts-audio');

  var url = `https://tts-api.netlify.app/?text=${text}&lang=${lang}`;
  // Backup API
  // var url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${lang}&client=tw-ob&q=${text}`;

  // add the sound to the audio element
  audioEl.src = url;

  // For auto playing the sound
  audioEl.play();
};