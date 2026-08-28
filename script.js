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

// debris 애니메이션
const debrisImages = [
    "use_image/debrispsd_22.png",
    "use_image/debrispsd_34.png",
    "use_image/debrispsd_37.png",
    "use_image/debrispsd_45.png",
    "use_image/debrispsd_53.png",
    "use_image/debrispsd_57.png",
    "use_image/debrispsd_63.png",
    "use_image/debrispsd_65.png"
];

const randomImageIndex = Math.floor(Math.random() * debrisImages.length);

const selectedImage = debrisImages[randomImageIndex];

//debris 생성 등

function createDebris(count) {
    for (let i = 0; i <count; i++) {
        const particle = document.createElement("img");
        const randomIndex = Math.floor(randomNumber(0, debrisImages.length));

        particle.src = debrisImages[randomIndex];
        // 클래스 네임 붙이기
        particle.className = "debrisParticle";

        particle.style.left = `${randomNumber(0, 90)}vw`;
        particle.style.width = `${randomNumber(15, 30)}px`;
        particle.style.animationDuration = `${randomNumber(8, 20)}s`;
        particle.style.animationDelay =  `${randomNumber(0, 3)}s`;

        particle.onclick = scrollAgain;
        $debris.appendChild(particle);


    }
}

function clearDebris() { $debris.replaceChildren(); }



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
    const clickedTemplate = event.target.closest(".eventTemplate");

    const clipImage = event.target.closest(".clipImage");

    if ( 
    clickedTemplate && !clickedTemplate.classList.contains("interacted")
){
    clearDebris();
    clickedTemplate.classList.add("interacted");
}

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

// 편지 출처 글자 랜덤 

const field = document.querySelector('.wordsField');

function createDiv() {
  
  const writtenLetters = document.querySelectorAll(".eventArea .writtenLetter");

  const sentence = [...writtenLetters]
    .map(function (writtenLetter) {
        return writtenLetter.textContent;
    })
    .join(" ")
    .trim();




  if (sentence === "") { return; }

    const words = sentence.split(/\s+/);

  const appearDelay = 800; 

  const wordCount =  Math.floor(Math.random() * 30) + 1;
  
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

// 랜덤 시간에 나타나는 함수 원본 - ScheduleRandom

function randomNumber(min, max) {
  return Math.random() * (max - min) + min;
}

function scheduleRandom(action, minDelay, maxDelay) {
    const randomDelay = Math.floor( Math.random() * (maxDelay - minDelay) + minDelay);

    setTimeout (function () {
        action();
        scheduleRandom(action, minDelay, maxDelay);
        }, randomDelay );
}

//편지 저장 단어 나타나는 간격
scheduleRandom(createDiv, 1*60*1000, 3*60*1000);



// collect coins
let coins = 0;
let coinHideTimer;

const coinImage = document.querySelector(".coinImage");

function showCoin() {
    coinImage.classList.add("isVisible");

    clearTimeout(coinHideTimer);

    coinHideTimer = setTimeout(function() {
        coinImage.classList.remove("isVisible");}, 7*1000);
}

function collectCoins(){

    if(!coinImage.classList.contains("isVisible")) {return;}

    coins++;
    coinImage.classList.remove("isVisible");

    console.log(coins);

    alert("You've got a coin!")
}

coinImage.addEventListener( "click", collectCoins)

setTimeout(function() {
    showCoin();
    scheduleRandom(showCoin, 1*60*1000, 1.2*60*1000 );
}, 1*60*1000);



// if 하고 몇번 반복될지 
// 편지 쓰고 시간이 좀 지나면? 랜덤 시작하기로 하자. 랜덤 주기로 소환 / 언제까지?
// const start = performance.now();  https://programming-bellybutton.tistory.com/87
// debris는 css trick에서 찾아보자. 뭔가 css sprite로 하면 될 거 같음.  