let runScroll;

function autoScroll(){
  window.scrollBy(0,1);
}

runScroll = setInterval(autoScroll, 25);


function stopScroll(){
    clearInterval(runScroll);
}

function scrollAgain(){
   clearInterval(runScroll);
    runScroll = setInterval(autoScroll, 20);
}


const eventSources = document.querySelectorAll(
    "#eventSources .eventTemplate"
)

randomEvent();

function randomEvent() {
    const randomIndex = Math.floor(
        Math.random() * eventSources.length);
    
        const selectedSource = eventSources[randomIndex];

        const newEvent = selectedSource.cloneNode(true);

        const eventArea = document.querySelector(".eventArea");

        eventArea.appendChild(newEvent);
    
}



window.addEventListener('scroll',() => {
    if(window.scrollY + window.innerHeight >= document.documentElement.scrollHeight){
        // 랜덤으로 호출하기 
    }
} )

// debris 호출gg
const $debris = document.querySelector(".debris");
const maxSize = Math.max(window.innerWidth, window.innerHeight);


document.addEventListener("click", function (event) {
    const clipImage = event.target.closest(".clipImage");

    if (clipImage) {
        const specificLetter = clipImage.closest(".letterTemplate");

        specificLetter.querySelector(".clipGlow").style.display = "none";

        specificLetter.querySelector(".lettersImage").style.display = "none";

        specificLetter.querySelector(".letterPaper").style.display = "flex";

        return;
    }

    const writeButton = event.target.closest(".letterButton");

    if (writeButton) { 
        const specificLetter = writeButton.closest(".letterTemplate");

        const input = specificLetter.querySelector(".custom-input");

        const writtenLetter = specificLetter.querySelector(".writtenLetter");

        writtenLetter.textContent = input.value;

    }
});


