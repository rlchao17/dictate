// tool functions

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

function splitWordList(str) {
  return str.split("\n")
            .map(formatWord)
            .filter(line => line !== "");
}

function formatWord(word) {
  return word.replace(/\s+/g, ' ')
             .trim();
}

function formatToCompare(word) {
  return word.replace(/[^\w\s]/g, "")
             .trim()
             .replace(/\s+/g, ' ')
             .toLowerCase();
}

function compareWord(original, dictated) {
  o = formatToCompare(original);
  d = formatToCompare(dictated);
  
  if (o === d) {
    return true;
  } else {
    return false;
  }
}

// short functions

function getLang() {
  return getEl("select-lang").value;
}

function hideAndShow() {
  hideID("div-init");
  showID("div-dictate");
}

function hideAndShow2() {
  hideID("div-dictate");
  showID("div-final-result");
}

function waitForCheck() {
  // This thing is so annoying!
  return new Promise(resolve => {
    window.checkDictated = () => {
      resolve();
    };
  });
}

function getDictated() {
  var dictated = getEl("input-dictate").value;
  return formatWord(dictated);
}

function clearDictated() {
  getEl("input-dictate").value = "";
}

function showCorrect() {
  hideID("div-incorrect");
  showID("div-correct");
}

function showIncorrect(original, dictated) {
  hideID("div-correct");
  showID("div-incorrect");
  getEl("td-correct").textContent = original;
  getEl("td-incorrect").textContent = dictated;
}

// main

function playTTS(text, lang) {
  var audioEl = getEl("tts-audio");

  var url = `https://tts-api.netlify.app/?text=${text}&lang=${lang}`;
  // Backup API
  // var url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${lang}&client=tw-ob&q=${text}`;

  audioEl.src = url;
  audioEl.play();
}

function readWordList() {
  var input = getEl("input-word-list").value;
  var wordList = splitWordList(input);
  var emptyErrorMsg = "Input cannot be empty";

  if (wordList.length === 0) {
    alert(emptyErrorMsg);
    throw new Error(emptyErrorMsg);
  } else {
    return wordList;
  }
}

async function startDictate() {
  
  var wordList = readWordList();
  
  hideAndShow();
  
  var dictatedList = [];
  var isCorrectList = [];
  
  for (var word of wordList) {
    playTTS(word, getLang());
    
    // wait for check button
    await waitForCheck();
    
    // get results
    var dictated = getDictated();
    var isCorrect = compareWord(word, dictated);
        
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
  
  finalResult(wordList, dictatedList, isCorrectList);
}

function finalResult(wordList, dictatedList, isCorrectList) {
  
  var table = getEl("table-final-result");
  
  for (i = 0; i < wordList.length; i++) {
    
    // new row
    var newRow = table.insertRow();
    var original = newRow.insertCell(0);
    var dictated = newRow.insertCell(1);
    
    // colors
    original.classList.add("correct-color");
    
    if (isCorrectList[i] === true) {
      dictated.classList.add("correct-color");
    } else {
      dictated.classList.add("incorrect-color");
    }
    
    // show results
    original.innerText = wordList[i];
    dictated.innerText = dictatedList[i];
  }
  
  hideAndShow2();
}