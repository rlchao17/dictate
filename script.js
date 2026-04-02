// tools

function getEl(id) {
  return document.getElementById(id);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function showID(id) {
  getEl(id).style.display = "block";
}

function hideID(id) {
  getEl(id).style.display = "none";
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
  return getEl("selectLang").value;
}

function showAfterInit() {
  hideID("init");
  showID("afterInit");
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
  var dictated = getEl("dictateInput").value;
  return formatWord(dictated);
}

function clearDictated() {
  getEl("dictateInput").value = "";
}

function showCorrect() {
  hideID("incorrect");
  showID("correct");
}

function showIncorrect(original, dictated) {
  hideID("correct");
  showID("incorrect");
  getEl("showCorrect").textContent = original;
  getEl("showWrong").textContent = dictated;
}

// main

function playTTS(text, lang) {
  // Get the audio element
  var audioEl = getEl("tts-audio");

  var url = `https://tts-api.netlify.app/?text=${text}&lang=${lang}`;
  // Backup API
  // var url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${lang}&client=tw-ob&q=${text}`;

  // add the sound to the audio element
  audioEl.src = url;

  // For auto playing the sound
  audioEl.play();
}

function readWordList() {
  var input = getEl("wordListInput").value;
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

function reallyCheck(original, dictated) {
  o = formatToCompare(original);
  d = formatToCompare(dictated);
  
  if (o === d) {
    return true;
  } else {
    return false;
  }
}

async function startDictating() {
  showAfterInit();
  
  var wordList = readWordList();
  var dictatedList = [];
  var isCorrectList = [];
  
  for (var word of wordList) {
    playTTS(word, getLang());
    
    // wait for check button
    await waitForCheck();
    
    // get results
    var dictated = getDictated();
    var isCorrect = reallyCheck(word, dictated);
        
    // save results
    dictatedList.push(dictated);
    isCorrectList.push(isCorrect);
    
    // clear so they see it's being checked
    clearDictated();
    
    if (isCorrect === true) {
      showCorrect();
      
      await sleep(1000);
    } else {
      showIncorrect(word, dictated);
      
      // wait longer
      await sleep(3000);
    }
  }
  
  showFinalResult(wordList, dictatedList, isCorrectList);
}

function showFinalResult(wordList, dictatedList, isCorrectList) {
  hideID("afterInit");
  showID("finalResult");
  
  var table = getEl("finalResultTable");
  
  for (i = 0; i < wordList.length; i++) {
    
    // new row
    var newRow = table.insertRow();
    var original = newRow.insertCell(0);
    var dictated = newRow.insertCell(1);
    
    // colors
    original.classList.add("correctColor");
    
    if (isCorrectList[i] === true) {
      dictated.classList.add("correctColor");
    } else {
      dictated.classList.add("incorrectColor");
    }
    
    // show results
    original.innerText = wordList[i];
    dictated.innerText = dictatedList[i];
  }
}