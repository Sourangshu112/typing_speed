const typingArea = document.getElementById("typing");
const allButtons = document.querySelectorAll("#control button");
let handleTyping;
let selectedOption = {
    type: "time",
    value: 30
}; 
const typingData = {};
let time = 0;
let countdown;

async function words() {
    const responce = await fetch("words.txt");
    const data = await responce.text();
    return data;
}

function start(){
    words().then(data => {
        const wordsArray = data.trim().split(/\s+/);
        typingArea.innerHTML = "";
        wordsArray.forEach(placeword);

        typingData.raw = 0;
        typingData.correctletter = 0;
        typingData.correctword = 0;
        typingData.wrong = 0;

        clearInterval(countdown);
        time = 0;

        const control = document.getElementById("control");
        control.style.display = "flex";
        const container = document.getElementById("container");
        container.style.display = "flex";
        const result = document.getElementById("typing");
        result.contentEditable = true;

        displayTimer(selectedOption.value);
        initializeTyping();
});
}

function placeword(word) {
    for (const l of word) {
        typingArea.innerHTML += `<span>${l}</span>`;
    }
    typingArea.innerHTML += `<span> </span>`; 
}

function initializeTyping() {
    const spans = document.getElementsByTagName("span");
    let i = 0;
    let started = false; 
    spans[i].classList.add("start");
    moveCaretTo(spans[0]);

    if (handleTyping){
        typingArea.removeEventListener("keydown" , handleTyping);
    }
    
    handleTyping = (e) => {
        if (e.key === "Delete") {
            e.preventDefault(); 
            return;             
        }
        if (e.key.length > 1 && e.key !== "Backspace") {
            return;
        }
        e.preventDefault(); 
        typingData.raw++;
        if (e.key === "Backspace") {
            if (i > 0) {
                i--; 
                const currentSpan = spans[i];
                if (currentSpan.classList.contains("incorrect")) {
                    if(currentSpan.classList.contains("user_add")){
                        currentSpan.remove();
                    }
                    else {
                        currentSpan.classList.remove("incorrect");
                        moveCaretTo(spans[i-1]);
                    }
                } else {
                    currentSpan.classList.remove("correct");
                    typingData.correctletter--;
                    if (currentSpan.innerText === " "){
                    typingData.correctword--;
                    }
                    moveCaretTo(spans[i-1]);
                }
            if (i === 0){
                currentSpan.classList.add("start");
                moveCaretTo(spans[i]);
            }
            }
        } else { // Any other character key
            const currentSpan = spans[i];
            if (e.key === currentSpan.innerText && !currentSpan.classList.contains("user_add")) {
                // Correct key
                currentSpan.classList.add("correct");
                if (currentSpan.classList.contains("start")){
                    currentSpan.classList.remove("start");
                }
                if (!started) {
                    startedTyping();
                    started = true;
                }
                if (currentSpan.innerText === " "){
                    typingData.correctword++;
                }
                typingData.correctletter++;
                moveCaretTo(spans[i]);
                i++;
            } else {
                typingData.wrong++;
                if (currentSpan.innerText === " "){
                    newwrong = `<span class="incorrect user_add">${e.key}</span>`;
                    currentSpan.insertAdjacentHTML("beforebegin",newwrong);
                    i++;
                    moveCaretTo(spans[i-1]);
                }
                else {
                    currentSpan.classList.add("incorrect");
                    moveCaretTo(spans[i]);
                    i++;
                }
            }
        }
    }
    typingArea.addEventListener("keydown", handleTyping );

}

function moveCaretTo(targetNode) {
    if (!targetNode) return;
    const range = document.createRange();
    const sel = window.getSelection();      
    const offset = targetNode.classList.contains("start")? 0 : 1;
    range.setStart(targetNode, offset);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
}

allButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
        allButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");        
        selectedOption.type = btn.dataset.type;
        selectedOption.value = btn.dataset.value;
        if (selectedOption.type === "words"){
            displayTimer(`0/${selectedOption.value}`);
        }
        else if (selectedOption.type === "time"){
            displayTimer(selectedOption.value);
        }
    });
});

function displayTimer(x) {
    const display = document.getElementById("display");
    display.style.display = "inline";
    display.innerText = x;
}

function startedTyping() {
    const control = document.getElementById("control");
    control.style.transition = 0.2;
    control.style.display = "None";
    
    if (selectedOption.type === "time"){
        timefunction(selectedOption.value);
    }
    else if (selectedOption.type === "words"){  
        wordfunction(selectedOption.value);
    }
}


function wordfunction(word){
    clearInterval(countdown)
    countdown = setInterval(() => {
        time++;
        let wordno = typingData.correctword;
        let t = `${wordno}/${word}`;
        displayTimer(t);
        if (wordno == word){
            clearInterval(countdown);
            time = time/2;
            displayResult(time);
        }
    },500)
}

function timefunction(time){
    let fulltime = time;
    clearInterval(countdown);
    countdown = setInterval(() => {
        time--;
        displayTimer(time);
        if (time === 0) {
            clearInterval(countdown);
            displayResult(fulltime);
      }
    },1000)
}

function displayResult(time){
    let wpm = Math.trunc(typingData.correctword/(time/60));
    let raw = Math.trunc((typingData.raw/5)/(time/60));
    let acc = Math.trunc((typingData.correctletter/typingData.raw)*100);

    const result = document.getElementById("typing");
    result.contentEditable = false;
    result.innerHTML = `<h1>WPM: ${wpm}</h1><br><h3>Raw: ${raw}</h3><br><h3>Accuracy: ${acc}%</h3><br><h3>Time: ${time}seconds</h3>`;
    const container = document.getElementById("container");
    container.style.display = "none";
}

start();
