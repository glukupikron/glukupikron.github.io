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


// 글자 애니메이션

function animateWrittenLetter (
    writtenLetter,
    text
) {
    anime.remove(writtenLetter.querySelectorAll(".moji"));
    anime.remove(writtenLetter);
    writtenLetter.style.opacity = "1";
    writtenLetter.textContent = "";

    for (const character of text) {
        if (/\S/.test(character)) {
            const span = document.createElement("span");

            span.className = "moji";
            span.textContent = character;
            span.style.opacity = "0";


            writtenLetter.appendChild(span);
        } else {
            const space = document.createTextNode(character);

            writtenLetter.appendChild(space);
        }
    }
anime.timeline({loop: false})
    .add ({
        targets: writtenLetter.querySelectorAll(".moji"),

        opacity: [0,1],
        easing: "easeInOutQuad",
        duration: 2250,
        delay: function(element, index){
            return 150 * (index + 1);
        }
    });

   
}

// 편지찾기 click
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

        animateWrittenLetter(
            writtenLetter, input.value
        );

    }
});

// 글자 랜덤 

const field = document.querySelector('.wordsField');

function createDiv(count) {
  
  const writtenLetters = document.querySelectorAll(".eventArea .writtenLetter");

  const sentence = [...writtenLetters]
    .map(function (writtenLetter) {
        return writtenLetter.textContent;
    })
    .join(" ")
    .trim();




  if (sentence === "") { return; }

    const words = sentence.split(/\s+/);

  const appearDelay = 700; 

  const wordCount = Math.min(count, 30);
  
  for (let i = 0; i < wordCount; i++) {
    setTimeout(function () {
    const newDiv = document.createElement('div');

    newDiv.className = "scatteredWord";
    const randomIndex = Math.floor(Math.random() * words.length);
    const randomWord =  words[randomIndex];

    newDiv.textContent = randomWord;

     field.appendChild(newDiv);

    // 화면 좌표에 박는 법
	
    const xMax = Math.max(0, window.innerWidth - newDiv.offsetWidth);
    const yMax = Math.max(0, window.innerHeight - newDiv.offsetHeight);
    
    const x = window.scrollX + randomNumber(0, xMax);
    const y = window.scrollY + randomNumber(0, yMax);
    

    newDiv.style.position = 'absolute';
    newDiv.style.left = `${x}px`;
    newDiv.style.top = `${y}px`;
    
   
  }, i* appearDelay);
 }
}

function randomNumber(min, max) {
  return Math.random() * (max - min) + min;
}

// if 하고 몇번 반복될지 
// 편지 쓰고 시간이 좀 지나면? 랜덤 시작하기로 하자. 랜덤 주기로 소환 
// const start = performance.now();  https://programming-bellybutton.tistory.com/87 