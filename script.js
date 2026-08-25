let runScroll;

function autoScroll(){
  window.scrollBy(0,1);
}

runScroll = setInterval(autoScroll, 20);


function stopScroll(){
    clearInterval(runScroll);
}

function scrollAgain(){
    autoScroll();
    setInterval(autoScroll, 20);
}


function randomEvent(){
    let saveEvents = document.querySelectorAll(".eventTemplate");
    let whichEvent = Math.floor(Math.random()*saveEvents.length);
    let actEvent = saveEvents[whichEvent]
    let newEvent = actEvent.cloneNode(true);
    /* appendchild 다음부터 */
}



window.addEventListener('scroll',() => {
    if(window.scrollY + window.innerHeight >= document.documentElement.scrollHeight){
        // 랜덤으로 호출하기 
    }
} )

// debris 호출
const $debris = document.querySelector(".debris");
const maxSize = Math.max(window.innerWidth, window.innerHeight);


function showPaper() {
  document.getElementByClassname("clipGlow").style.display = "none";
  document.getElementByClassname("clipImage").style.display = "none";
  document.getElementByClassname("lettersImage").style.display = "none";
  document.querySelector(".letterPaper").style.display = "flex";
}

