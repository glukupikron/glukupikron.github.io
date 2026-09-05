let runScroll;

function checkBottom () { 
    const reachedBottom = window.scrollY + window.innerHeight >=
    document.documentElement.scrollHeight - 1;

    if (reachedBottom) { randomEvent(); }
}
function autoScroll(){
  window.scrollBy(0,1);
  checkBottom();
}


function stopScroll(){
    clearInterval(runScroll);
}

function scrollAgain(){
   clearInterval(runScroll);
    runScroll = setInterval(autoScroll, 20);
}

window.addEventListener("scroll", checkBottom);



const eventSources = document.querySelectorAll(
    "#eventSources .eventTemplate"
)



function randomEvent() {
    const randomIndex = Math.floor(
        Math.random() * eventSources.length);
    
        const selectedSource = eventSources[randomIndex];

        const newEvent = selectedSource.cloneNode(true);

        const eventArea = document.querySelector(".eventArea");

        eventArea.appendChild(newEvent);

        const puzzleBoard = newEvent.querySelector(".puzzleBoard");

        if (puzzleBoard) {
            const randomPuzzleIndex = Math.floor(Math.random() * puzzleSources.length);

            const selectedPuzzle = puzzleSources[randomPuzzleIndex];

            const puzzleGuide = newEvent.querySelector(".puzzleGuide");
            puzzleGuide.textContent = selectedPuzzle.guide;

            randomAlign(newEvent);
            makePuzzle(
                puzzleBoard,
                selectedPuzzle.image,
                selectedPuzzle.columns,
                selectedPuzzle.rows
            );
        }
    
}


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


// 원경 게임 1
// 고양이 선택지 게임 (선택지1: 사료, 선택지2: 이슬, 선택지3: 마법의 캣닢)

let tabakoNum = 0;
let flavors = ["matcha", "strawberry", "rice"];
let whichFlavor = null;

/* 사료 선택 시 */
function nekoButton1(button){
    whichFlavor = flavors[Math.floor(Math.random() * flavors.length)];
    const nekoRow = button.closest(".nekoRow2");
    nekoRow.textContent = `The Sacred Cat gave you a sacred ice cream. which is a ${whichFlavor} flavor`;
    }



/* 이슬 선택 시 */ 
function nekoButton2(button){
    const nekoRow = button.closest(".nekoRow2");
    nekoRow.innerHTML = "The Sacred Cat is mad at you. <br>It doesn't give a shit about the 'dew.' <br>You decided to leave.";
}

/* 마법의 캣닢 선택 시 */
function nekoButton3(button){
    tabakoNum ++;

    tabakoDisplay.classList.add("isVisible");

    const nekoRow = button.closest(".nekoRow2");
    nekoRow.innerHTML = "The Sacred Cat hands over a <b>delicious cigarette</b>. <br> It seems glad with the <span style='color:green;'><b>magical catnip</b></span> it got from you.";

}

/* 담배는 여러 대 필 수 있고, 아이스크림은 row로 쌓이게?*/

const tabakoDisplay = document.querySelector(".tabakoImage");

function smoking (puff) {
    
    if (tabakoNum <= 0) { return; }

    tabakoNum--;
    puff.disabled = true;

    let currentSmokingImage = 0;

    const tabakoBox = puff.closest(".tabakoImage");
    const taImage = tabakoBox.querySelector("img");
    
    const smokingTimer = setInterval(function() { 
        currentSmokingImage++;

        taImage.src = smokingImages[currentSmokingImage];

        if ( currentSmokingImage === smokingImages.length -1 )
        {   clearInterval(smokingTimer);

            const ashPosition = taImage.getBoundingClientRect();
            const ash = document.createElement("img");

            ash.src = "use_image/ash.png";
            ash.className = "ashTrace";

            ash.style.left = `${ashPosition.left + window.scrollX - 30}px`;
            ash.style.top = `${ashPosition.top + window.scrollY}px`;

            document.body.appendChild(ash);
            
            taImage.src = smokingImages[0];
            puff.disabled = false;

            if (tabakoNum === 0) {
            tabakoDisplay.classList.remove("isVisible");
        }
    
        }
        }, 2000);

        
}




const smokingImages = [
    "use_image/ta_1.png",
    "use_image/ta_2.png",
    "use_image/ta_3.png",
    "use_image/ta_4.png",
    "use_image/ta_5.png",
    "use_image/ta_6.png",
    "use_image/ta_7.png",
    "use_image/ta_8.png",
    "use_image/ta_9.png",
    "use_image/ash.png"
    
];

// hanabi

function selectHanabi(select) {
    const hanabi = select.closest(".hanabi");
    if (select.value === "yes") {
        setTimeout(function() {
            hanabi.style.backgroundImage = 'url("use_image/firework_umzzal.gif")';
        },5000)
        
    }

    if (select.value === "no") {
        scrollAgain();
    }
}

// 랜덤 align

function randomAlign(element) {
    element.style.alignItems = 
    [ "flex-start", "center", "flex-end"]
    [Math.floor(Math.random()* 3)];
}

// 퍼즐들
// 후아힌은 600 900 아파트 1000 500 reflect 는 300 400
const puzzleSources = [
    {
        image: "use_image/treepuzzle.gif",
        guide: "Is that you? Over there?",
        columns: 2,
        rows: 2,
    },
     {
        image : "use_image/tunnelpuzzle.gif",
        guide : "Is that you? Over there?",
        columns: 2,
        rows: 3
    },
    {
        image : "use_image/huahinpuzzle.gif",
        guide : "I can almost hear you!",
        columns: 2,
        rows: 3
    },
    {
        image : "use_image/apartpuzzle.gif",
        guide : "The lights are moving...",
        columns: 4,
        rows: 2
    },
    {
        image : "use_image/reflectpuzzle.gif",
        guide : "Seemingly no one's there.",
        columns: 3,
        rows: 4
    }
];

function makePuzzle(
    puzzleBoard,
    selectedImage,
    puzzleColumns,
    puzzleRows
) {
    const boardColumns = 4;
    
   
    const pieceCount = puzzleColumns * puzzleRows;

    const availablePositions = [];

    for (let y = 0; y < boardColumns; y++) {
        for (let x = 0; x < boardColumns; x++) {
            availablePositions.push({
                x: x,
                y: y
            });
        }
    }

    for (let i=0; i < pieceCount; i++) {
        const item = document.createElement("div");
        const tile = document.createElement("div");

        const randomPositionIndex = Math.floor(
            Math.random() * availablePositions.length
        );

        const startPosition =
        availablePositions.splice(randomPositionIndex,1)[0];

        item.className = "grid-stack-item";

        tile.className = "grid-stack-item-content puzzleTile";

        item.setAttribute(
            "gs-x", startPosition.x
        );

        item.setAttribute(
            "gs-y", startPosition.y
        );

        item.setAttribute("gs-w", 1);
        item.setAttribute("gs-h", 1);

        const row =  Math.floor(i / puzzleColumns);
        const column =  i % puzzleColumns;
        
        item.dataset.pieceRow = row;
        item.dataset.pieceColumn = column;

        const backgroundX =  column * (100 / (puzzleColumns - 1));

        const backgroundY =  row * (100 / (puzzleRows - 1));

        tile.style.backgroundImage =  `url("${selectedImage}")`;
        tile.style.backgroundSize = `${puzzleColumns * 100}% ${puzzleRows * 100}%`;
        tile.style.backgroundPosition = `${backgroundX}% ${backgroundY}%`;

        item.appendChild(tile);
        puzzleBoard.appendChild(item);   

    }
    const grid = GridStack.init({
            column: boardColumns,
            minRow: boardColumns,
            maxRow: boardColumns,
            cellHeight: "auto",
            margin: 0,
            float: true,
            disableResize: true,
            animate: true
        }, puzzleBoard);

        grid.on("dragstart", function () {
            stopScroll();
        });
        grid.on("dragstop", function () {

             if (
            puzzleBoard.dataset.completed === "true"
        ) {
            return;
         }
            const completed = checkPuzzle(puzzleBoard);
            console.log(completed);

            if (completed) {
                puzzleBoard.dataset.completed = "true";
                grid.setStatic(true);
                createDebris(10);
            }
});

}



function checkPuzzle(puzzleBoard) {
    const pieces = puzzleBoard.querySelectorAll(
        ".grid-stack-item"
    );

    const firstPiece = 
        puzzleBoard.querySelector(
            '[data-piece-row = "0"][data-piece-column="0"]'
        );
    
    const startX = firstPiece.gridstackNode.x;
    const startY = firstPiece.gridstackNode.y;

    for (const piece of pieces) {
        const correctRow = Number(piece.dataset.pieceRow);
        const correctColumn = Number(piece.dataset.pieceColumn);
        const currentX = piece.gridstackNode.x;
        const currentY = piece.gridstackNode.y;

        if (
            currentX !==  startX + correctColumn ||
            currentY !== startY + correctRow
        ) {
            return false;
        }
    }

    return true;
}

randomEvent();









// if 하고 몇번 반복될지 
// 편지 쓰고 시간이 좀 지나면? 랜덤 시작하기로 하자. 랜덤 주기로 소환 / 언제까지?
// const start = performance.now();  https://programming-bellybutton.tistory.com/87
// debris는 css trick에서 찾아보자. 뭔가 css sprite로 하면 될 거 같음.  
