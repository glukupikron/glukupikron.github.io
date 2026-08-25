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


window.addEventListener('scroll',() => {
    if(window.scrollY + window.innerHeight >= document.documentElement.scrollHeight){
        // 랜덤으로 호출하기 
    }
} )

// debris 호출
const $debris = document.querySelector(".debris");
const maxSize = Math.max(window.innerWidth, window.innerHeight);


function showPaper() {
  document.getElementById("clipGlow").style.display = "none";
  document.getElementById("clipImage").style.display = "none";
  document.getElementById("lettersImage").style.display = "none";
  document.querySelector(".letterPaper").style.display = "flex";
}