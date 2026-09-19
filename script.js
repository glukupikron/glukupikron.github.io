let runScroll;
let restoreEventOpen = false;
let autoScrollStep = 1;
let scrollBoostTimer;

const takeawayConfig = {
    apiBase: (window.TAKEAWAY_CONFIG?.apiBase || "").replace(/\/$/, ""),
    retentionHours: window.TAKEAWAY_CONFIG?.retentionHours || 24,
    desktopChunkHeight: window.TAKEAWAY_CONFIG?.desktopChunkHeight || 4000,
    mobileChunkHeight: window.TAKEAWAY_CONFIG?.mobileChunkHeight || 2000,
    webpQuality: window.TAKEAWAY_CONFIG?.webpQuality || 0.9
};

const takeawayState = {
    status: "playing",
    seenBottom: Math.max(window.innerHeight, window.scrollY + window.innerHeight),
    shareUrl: ""
};

const takeawayClientId = getTakeawayClientId();

function getTakeawayClientId() {
    const storageKey = "waiting-takeaway-client";

    try {
        const storedId = localStorage.getItem(storageKey);
        if (storedId) return storedId;

        const newId = crypto.randomUUID();
        localStorage.setItem(storageKey, newId);
        return newId;
    } catch (error) {
        return crypto.randomUUID();
    }
}

function trackSeenBottom() {
    if (takeawayState.status !== "playing") return;

    takeawayState.seenBottom = Math.max(
        takeawayState.seenBottom,
        window.scrollY + window.innerHeight
    );
}

function checkBottom () {
    trackSeenBottom();
    if (takeawayState.status !== "playing") return;

    const reachedBottom = window.scrollY + window.innerHeight >=
    document.documentElement.scrollHeight - 1;

    if (reachedBottom) { randomEvent(); }
}
function autoScroll(){
  window.scrollBy(0, autoScrollStep);
  checkBottom();
}


function stopScroll(){
    clearInterval(runScroll);
}

function scrollAgain(){
   clearInterval(runScroll);
    runScroll = setInterval(autoScroll, 20);
}

function boostScroll() {
    clearTimeout(scrollBoostTimer);
    autoScrollStep = 5;
    scrollBoostTimer = setTimeout(function () {
        autoScrollStep = 1;
    }, 8000);
}

window.addEventListener("scroll", checkBottom);
window.addEventListener("resize", trackSeenBottom);

// 팝업

const maskScenes = [
    {
        text: `“Last night, a man in a mask appeared.”

Continue eavesdropping?`
    },
    {
        text: `“I decided to follow him. It was like something out of a dream, you know?”

“Yeah. Life is long and boring. Things like that don’t happen very often.”`
    },
    {
        text: `“So I followed him, like I was the protagonist of ‘Dream Story’ or something…. Anyway, I kept walking and walking after him, and eventually we ended up at this park.”

“Did he take off his mask?”`
    },
    {
        text: `“No. He never took off his mask. When he stepped into the middle of the lawn, a swarm of rats came rushing toward him. Then, with a single gesture of his hand, they vanished without a trace.”

“Did he take off his cloak?”`
    },
    {
        text: `“No. How did you know he was wearing a cloak?”

“Well, that much is obvious.”`
    },
    {
        text: `“I hid behind one of the nearby trees and watched. Then these ghost-like figures started emerging from wherever they’d been hiding and approached him.”

“Ghosts?”`
    },
    {
        text: `“I said ghost-‘like.’ They weren’t actual ghosts. They were people. They lined up one by one and waited for their turn.”

“Was he some kind of dealer?”`
    },
    {
        text: `“Hmm… maybe? But he spent quite a long time with each person. Some of them laughed. Some of them cried.”

“What did you do?”`
    },
    {
        text: `“I waited until every last one of them had left. I tried to get a good look at them, to figure out what they actually looked like, but no matter how much I rubbed my eyes, I couldn’t make them out. They were blurry, like smoke. Those figures…”

        “But you could hear them laughing and crying.”`,
        emphasis: "waited"
    },
    {
        text: `“Yeah. They weren’t pleasant sounds. Anyway, I waited. And then I walked up to him. And then he…”

For a moment, silence settles over the air around them.`
    },
    {
        text: `“I stared at him for a long time. I didn’t feel like laughing, and I didn’t feel like crying either. I remember thinking his mask was so smooth and beautiful. No, actually, maybe it was the opposite. Maybe it was terribly rough, like the surface of the moon seen up close.”

“Did he take off his mask?”`
    },
    {
        text: `“No. Instead, he took my hand.”

“Your hand?”`
    },
    {
        text: `“Then he put his other hand into his pocket.”

“His pocket?”`
    },
    {
        text: `“And then he placed this in my palm.”

“This?”`
    },
    {
        italicIntro: `You crane your neck forward to steal a look at the scene, just as the woman had hidden behind a tree the night before.
A weird-looking mask rests in the woman’s palm.`,
        text: `“What do you think I should do with it?”`
    }
];

const maskPopups = maskScenes.map(function (scene, index) {
    return {
        ...scene,
        id: `mask${index + 1}`,
        conversationId: "mask",
        randomStart: index === 0,
        yesLabel: "Continue",
        noLabel: "Leave",
        hideContinue: index === maskScenes.length - 1,
        completesConversation: index === maskScenes.length - 1,
        yesNext: index < maskScenes.length - 1 ? `mask${index + 2}` : null,
        noNext: null
    };
});

const loversScenes = [
    {
        text: `One lover is asleep, resting against the other’s shoulder.

“I’m sorry. What I told you yesterday was a lie.”

Their lover is fast asleep. Continue eavesdropping?`
    },
    {
        text: `“When I said I fell asleep before you last night. That was a lie.”

“……”

“I was awake for a very long time.”`
    },
    {
        text: `“You think I was off doing something stupid while I was away? I wasn’t. That I met someone else and exchanged words of love with them? Of course not. I love you more than anyone.”`
    },
    {
        text: `“I was just thinking for a long time. I waited for your messages urging me to reply to stop. And then…”

“……”

“I thought about my past.”`,
        emphasis: "waited"
    },
    {
        text: `“You know, our relationship is so unstable.”

“……”

“It depends on too many coincidences. What if you hadn’t left the house that day to go see a movie no one else wanted to watch, all by yourself? What if I hadn’t happened to sit in the same row as you? What if you hadn’t happened to snore so incredibly loudly that I noticed you were there?”`
    },
    {
        text: `“We’re doing fine now, but… what if another coincidence comes along? What if one day, a movie you’ve watched over and over suddenly feels boring to you? What if you no longer find any meaning in sending me messages?”`
    },
    {
        text: `Suddenly, their lover wakes up.

“Could you keep it down a little? I was just about to shake hands with my favorite actor in my dream.”

“…Okay.”

The aside is hastily brought to an end.`
    }
];

const loversPopups = loversScenes.map(function (scene, index) {
    return {
        ...scene,
        id: `lovers${index + 1}`,
        conversationId: "lovers",
        randomStart: index === 0,
        yesLabel: "Continue",
        noLabel: "Leave",
        hideContinue: index === loversScenes.length - 1,
        yesNext: index < loversScenes.length - 1 ? `lovers${index + 2}` : null,
        noNext: null
    };
});

const onigokgoPopups = [
    {
        id: "onigokgo1",
        conversationId: "onigokgo",
        randomStart: true,
        text: `The children are playing hide-and-seek.

“5… 4… 3… 2… 1… Ready or not, here I come!”`,
        choices: [
            { label: "Continue", next: "onigokgo2" },
            { label: "Leave", next: null }
        ]
    },
    {
        id: "onigokgo2",
        conversationId: "onigokgo",
        text: `The seeker runs between the buildings.

“I know where all of you are! You’d better hide well!”`,
        choices: [
            { label: "Make a bird sound", next: "onigokgo2-1" },
            { label: "Stay still", next: "onigokgo2-2" },
        ]
    },
    {
        id: "onigokgo2-1",
        conversationId: "onigokgo",
        text: `The seeker comes running toward where you are.

They stare at you for a moment, then begin searching every corner nearby.

One of the hiding children can’t take it anymore and bursts out.

“How did you know?”`,
        choices: [
            { label: "Stay", next: "onigokgo2-1-1" },
            { label: "Leave", next: null }
        ]
    },
    {
        id: "onigokgo2-1-1",
        conversationId: "onigokgo",
        text: `“The nightingale told me. Now you’re it!”

The child who was caught flashes a bright smile and runs off toward the enormous tree in the distance.

The child who had been the seeker follows after them.`,
        choices: [
            { label: "Leave", next: null }
        ]
    },
    {
        id: "onigokgo2-2",
        conversationId: "onigokgo",
        text: `The seeker searches here and there, but everywhere is dead silent.

Before long, they grow tired and sink down onto the ground.

“I give up! Come out, everyone! I’m tired.”

But no one comes out.

“Did you all go home? Where are you guys?”

The surroundings remain silent.`,
        choices: [
            { label: "Leave", next: null }
        ]
    }
];

const theaterScenes = [
    {
        text: `“Don’t cry, my darling. You’ve had your cry; that’s enough… Let us talk now, let us think of some plan.”

“…Say it again.”`
    },
    {
        text: `“Don’t cry, my darling. You’ve had your cry; that’s enough…”

“No. A little gentler. That line is very important.”`
    },
    {
        text: `“Don’t cry, my darling…”

“No, Jack. Just a little more… like you care for them very deeply…”`
    },
    {
        text: `They look into each other’s eyes.

For a very long time.

No tears fall from either of their eyes.`
    },
    {
        text: `“Do you think we can keep doing the play?”

“Still… at least until the end of this year…”`
    },
    {
        text: `“Then, one more time…”

“All right.”

(A pause.)

“Don’t cry, my darling. You’ve had your cry; that’s enough… Let us talk now, let us think of some plan.”`
    }
];

const theaterPopups = theaterScenes.map(function (scene, index) {
    return {
        ...scene,
        id: `theater${index + 1}`,
        conversationId: "theater",
        randomStart: index === 0,
        yesLabel: "Continue",
        noLabel: "Leave",
        hideContinue: index === theaterScenes.length - 1,
        completesConversation: index === theaterScenes.length - 1,
        yesNext: index < theaterScenes.length - 1 ? `theater${index + 2}` : null,
        noNext: null
    };
});

const dogCrowPopups = [
    {
        id: "dogCrow1",
        conversationId: "dogCrow",
        randomStart: true,
        text: `“Woof woof.”
“Caw caw.”`,
        choices: [
            { label: "Woof", next: "dogCrow2" },
            { label: "Caw", next: "dogCrow2" },
            { label: "Leave", next: null }
        ]
    },
    {
        id: "dogCrow2",
        conversationId: "dogCrow",
        text: `“Caw caw caw caw!”
“Woof… woof…”`,
        choices: [
            { label: "Woof!", next: "dogCrow3" },
            { label: "Caaaw…", next: "dogCrow3" },
            { label: "Leave", next: null }
        ]
    },
    {
        id: "dogCrow3",
        conversationId: "dogCrow",
        text: `“Woof woof woof woof!!”
“Caaaw! Caw!”`,
        choices: [
            { label: "Intervene", next: "dogCrow4-1" },
            { label: "Stay still", next: "dogCrow4-2" }
        ]
    },
    {
        id: "dogCrow4-1",
        conversationId: "dogCrow",
        text: `“Whine… Hmph!”
“Caaaw! Flap flap!”

The fight seems to be over, but the crow begins staring at you with curious eyes.`,
        choices: [
            { label: "Leave", next: null }
        ]
    },
    {
        id: "dogCrow4-2",
        conversationId: "dogCrow",
        text: `The dog tears at the crow’s feathers with its teeth, while the crow scratches at the dog’s face.
They continue their seemingly endless fight.`,
        choices: [
            { label: "Leave", next: null }
        ]
    }
];

const popupData = [

    {
        id: "free1",
        conversationId: "free1",
        randomStart: true,
        text: `A middle-aged man is singing. Somehow, you can hear what he’s thinking.

“I’ve always wanted to be a musical actor!”

He’s not quite good enough to be a singer, but he’s pleasant enough to listen to.
`,

    },

    {
        id: "free2",
        conversationId: "free2",
        randomStart: true,
        text: `A group of people runs past…
Once you start running, you don’t want to stop.
`,

    },
    {
        id: "free3",
        conversationId: "free3",
        randomStart: true,
        text: `There’s someone just like you.
Standing frozen in an awkward pose, staring into empty space forever.`,

    },
    {
        id: "free4",
        conversationId: "free4",
        randomStart: true,
        text: `When I get older losing my hair
Many years from now
Will you still be sending me a Valentine?
`,

    },

    {
        id: "free5",
        conversationId: "free5",
        randomStart: true,
        text: `When you’re happy, it’s okay to forget about me.
There’s no need for me to get in the way when you’re having fun.`,

    },

    {
        id: "free6",
        conversationId: "free6",
        randomStart: true,
        text: `When you’re with your friends,
I’ll whistle from the sidelines like a spectator.
`,

    },

    {
        id: "free7",
        conversationId: "free7",
        randomStart: true,
        text: `The city keeps being redeveloped, while the avenue next door fades beneath the dust,
and a lukewarm whirlwind, smoldering gray, blows through.

`,

    },

    ...maskPopups,
    ...loversPopups,
    ...onigokgoPopups,
    ...theaterPopups,
    ...dogCrowPopups
]

const closedConversations = new Set();
const completedConversations = new Set();
const completedDrawings = [];

function rememberConversationCompletion(popupData) {
    if (popupData?.completesConversation) {
        completedConversations.add(popupData.conversationId);
    }
}

function getActiveConversationIds() {
    const activePopups = popupArea.querySelectorAll( ".randomPopup");

    return new Set(
        [...activePopups].map(function (popup) {
            return popup.dataset.conversationId;
        })
    );
}

function getPopupCandidates() {
    const activeConversationIds = getActiveConversationIds();

    return popupData.filter(function (popup) {
        return (
            popup.randomStart === true && !closedConversations.has(popup.conversationId)
            &&
            !activeConversationIds.has(popup.conversationId)
        );
    });
}

const popupTemplate = document.querySelector("#popupTemplate");

const popupArea = document.querySelector(".popupArea");
const introPopupSequence = document.querySelector(".introPopupSequence");
const introPopupMessages = [
    "Are you waiting for someone?",
    `Your gaze drifts back and forth between inside and outside, wavering with unease.
This is a game about that kind of waiting.`,
    `Various events will surface, but you do not have to respond to all of them.
Follow wherever your heart drifts.`
];
let introPopupsStarted = false;

function startIntroPopups() {
    if (introPopupsStarted) return;
    introPopupsStarted = true;

    const staircase = document.createElement("div");
    staircase.className = "introPopupStaircase";
    introPopupSequence.appendChild(staircase);

    introPopupMessages.forEach(function (message, index) {
        const popup = popupTemplate.content.firstElementChild.cloneNode(true);
        popup.classList.add("introSequencePopup", `introSequencePopup${index + 1}`);
        popup.style.visibility = "hidden";
        popup.querySelector(".popupContent").textContent = message;
        popup.querySelector(".popupChoices").remove();

        const closeButton = popup.querySelector(".popupClose");
        closeButton.removeAttribute("onclick");
        closeButton.addEventListener("click", function () {
            popup.remove();
        });

        staircase.appendChild(popup);

        setTimeout(function () {
            popup.style.removeProperty("visibility");
        }, index * 1000);
    });
}

if ("IntersectionObserver" in window) {
    const introPopupObserver = new IntersectionObserver(function (entries, observer) {
        if (!entries.some(function (entry) { return entry.isIntersecting; })) return;

        observer.disconnect();
        startIntroPopups();
    });

    introPopupObserver.observe(introPopupSequence);
} else {
    startIntroPopups();
}

function findPopupData(popupId) {
    return popupData.find(function (popup){
        return popup.id === popupId;
    })
}

function fillPopup(popup, selectedPopup) {
    popup.dataset.popupId = selectedPopup.id;
    popup.dataset.conversationId = selectedPopup.conversationId;

    const popupContent = popup.querySelector(".popupContent");

    popupContent.textContent = selectedPopup.text;

    if (selectedPopup.italicIntro) {
        const italic = document.createElement("em");
        italic.textContent = selectedPopup.italicIntro;
        popupContent.prepend(italic, "\n\n");
    }

    if (selectedPopup.emphasis) {
        const word = selectedPopup.emphasis;
        const wordIndex = selectedPopup.text.indexOf(word);

        if (wordIndex !== -1) {
            const strong = document.createElement("strong");
            strong.textContent = word;

            popupContent.replaceChildren(
                document.createTextNode(selectedPopup.text.slice(0, wordIndex)),
                strong,
                document.createTextNode(selectedPopup.text.slice(wordIndex + word.length))
            );
        }
    }

    const popupChoices = popup.querySelector(".popupChoices");

    if (selectedPopup.choices) {
        popupChoices.replaceChildren();

        selectedPopup.choices.forEach(function (choice) {
            const choiceButton = document.createElement("button");
            choiceButton.type = "button";
            choiceButton.textContent = choice.label;
            choiceButton.dataset.next = choice.next || "";
            choiceButton.addEventListener("click", function () {
                choosePopup(choiceButton);
            });
            popupChoices.appendChild(choiceButton);
        });

        popupChoices.hidden = false;
        return;
    }

    const hasChoices =
        selectedPopup.yesLabel !== undefined && 
        selectedPopup.noLabel !== undefined;

    popupChoices.hidden = !hasChoices;

    if (hasChoices) {
        const yesButton = popup.querySelector(
            '[data-choice = "yes"]'
        );

        const noButton = popup.querySelector(
            '[data-choice = "no"]'
        );

        yesButton.textContent = selectedPopup.yesLabel;
        yesButton.hidden = selectedPopup.hideContinue === true;
        noButton.textContent = selectedPopup.noLabel;

    }
}

function showPopup(popupId) {
    const selectedPopup = findPopupData(popupId);

    if (!selectedPopup) {
        return;
    }

    const newPopup = popupTemplate.content.firstElementChild.cloneNode(true);

    fillPopup(newPopup, selectedPopup);

    popupArea.appendChild(newPopup);

    newPopup.style.left = `${randomNumber(20, window.innerWidth - newPopup.offsetWidth - 10)}px`
    
    newPopup.style.top = `${randomNumber(20, window.innerHeight - newPopup.offsetHeight - 10)}px`
}

function showRandomPopup(){
    if (takeawayState.status !== "playing") return;

    const activePopups = popupArea.querySelectorAll(".randomPopup");

    if (activePopups.length >= 2) {
        return;
    }

    const candidates = getPopupCandidates();

    if (candidates.length === 0) {
        return;
    }

    const randomIndex = 
        Math.floor(
            Math.random() * candidates.length
        );
    
    const selectedPopup = 
        candidates[randomIndex];

    showPopup(selectedPopup.id);
}

function choosePopup(button) {
    const popup = button.closest(".randomPopup");

    const selectedChoice = button.dataset.choice;

    const currentPopupId = popup.dataset.popupId;

    const currentPopup = findPopupData(currentPopupId);

    let nextPopupId;

    if (button.hasAttribute("data-next")) {
        nextPopupId = button.dataset.next;
    } else if (selectedChoice === "yes") {
        nextPopupId = currentPopup.yesNext;
    } else {
        nextPopupId = currentPopup.noNext;
    }

    rememberConversationCompletion(currentPopup);
    popup.remove();

    if (nextPopupId) {
        showPopup(nextPopupId);
    } else {
        closedConversations.add(
            currentPopup.conversationId
        )
    }
}

function closePopup(button) {
    const popup = button.closest(".randomPopup");

    const conversationId = popup.dataset.conversationId;
    const currentPopup = findPopupData(popup.dataset.popupId);

    rememberConversationCompletion(currentPopup);
    closedConversations.add(
        conversationId
    );

    popup.remove();
}

let popupTimer;

function startPopupTimer(){
    clearTimeout(popupTimer);

    function showNextPopup() {
        showRandomPopup();
        popupTimer =
            setTimeout(showNextPopup, randomNumber(40000, 70000));
    }
    popupTimer =
            setTimeout(showNextPopup, randomNumber(40000, 70000));

}
// 이벤트

const eventSources = document.querySelectorAll(
    "#eventSources .eventTemplate"
)

const birdCloudSource = document.querySelector("#eventSources .birdCloudTemplate");
const theaterPaperSource = document.querySelector("#eventSources .theaterPaperEvent");

let regularEventCount = 0;
let previousEventSource = null;
let previousPuzzleImage = null;

function pickRandom(items) {
    const randomIndex = Math.floor(
        Math.random()* items.length
    );
    
    return items[randomIndex];
}

const animatedEventNames = [
    "hanabi",
    "crow",
    "moon",
    "carStreet",
    "shrimp",
    "bus"
];
let animatedEventBag = [];
let previousAnimatedEventName = null;

function getAnimatedEventName(source) {
    return animatedEventNames.find(function (name) {
        return source.classList.contains(name);
    }) || null;
}

function refillAnimatedEventBag() {
    animatedEventBag = [...animatedEventNames];

    for (let index = animatedEventBag.length - 1; index > 0; index--) {
        const randomIndex = Math.floor(Math.random() * (index + 1));
        [animatedEventBag[index], animatedEventBag[randomIndex]] =
            [animatedEventBag[randomIndex], animatedEventBag[index]];
    }

    if (animatedEventBag[0] === previousAnimatedEventName) {
        const differentIndex = animatedEventBag.findIndex(function (name) {
            return name !== previousAnimatedEventName;
        });

        [animatedEventBag[0], animatedEventBag[differentIndex]] =
            [animatedEventBag[differentIndex], animatedEventBag[0]];
    }
}

function pickNextAnimatedEvent(candidates) {
    if (animatedEventBag.length === 0) {
        refillAnimatedEventBag();
    }

    const nextIndex = animatedEventBag.findIndex(function (name) {
        return candidates.some(function (source) {
            return source.classList.contains(name);
        });
    });

    if (nextIndex === -1) return null;

    const nextName = animatedEventBag.splice(nextIndex, 1)[0];
    previousAnimatedEventName = nextName;

    return candidates.find(function (source) {
        return source.classList.contains(nextName);
    });
}

//캔버스 row sources 

const canvasRowSources = [
    {
        id: "canvasText1",
        type: "text",
        text: "Imagine your loving one’s eyes"
    },

    {
        id: "canvasText2",
        type: "text",
        text: "Remember the best moment you shared with them"
    },
    {
        id: "canvasText3",
        type: "text",
        text: "You can draw how they yawn."
    },

    {
        id: "canvasText4",
        type: "text",
        text: "You can draw how they blink"
    },
    {
        id: "canvasText5",
        type: "text",
        text: "Well, imagine what they would look like if they arrive here."
    }
]
let previousCanvasRowId = null;
const completedCanvasIds = new Set();

// 공통 single 이벤트: 파일 이름, 마지막 단계, 문장과 버튼 문구만 다름
const singleEventScenes = {
    doll: { imagePrefix: "doll_b", lastStep: 3, wholeSentence: "You feel anxious. A stuffed doll catches your eye.", brokenSentence: "Stuffing is spilling out everywhere.", nextLabel: "Tug" },
    figure: { imagePrefix: "figure_b_", lastStep: 3, wholeSentence: "Maybe breaking it will make you feel better.", brokenSentence: "She is completely broken.", nextLabel: "Break" },
    leaf: { imagePrefix: "leaf_b_", lastStep: 4, wholeSentence: "The wait feels endless.", brokenSentence: "Only bare branches remain.", nextLabel: "Pluck" },
    envelope: { imagePrefix: "envelope_b_", lastStep: 3, wholeSentence: "You used to enjoy waiting for a letter. But now?", brokenSentence: "You don’t need it anymore.", nextLabel: "Tear" },
    plate: { imagePrefix: "plate_b", lastStep: 4, wholeSentence: "You feel anxious. What if you dropped it?", brokenSentence: "It was such a beautiful plate...", nextLabel: "Drop" }
};
const singleEventProgress = new Map();
let preloadedSingleImage = null;
let maskEventWasLeft = false;
let maskEventResolved = false;
let maskEventOpen = false;
const theaterBookPagesRead = new Set();
let theaterBookOpen = false;
let theaterBookPendingPage = null;
let theaterPaperEventsUntilReveal = 0;
let theaterPaperOpen = false;
const scratchState = {
    marks: [],
    open: false
};
const scratchLimit = 5;
let handHitMap = null;

const maskEventText = {
    first: "You’ve picked up a strange mask.",
    returning: "For some reason, the strange mask seems to keep following you.",
    darkening: "Your vision is slowly growing dark.",
    refreshed: "You feel a little more refreshed."
};

const theaterBookPageText = {
    top: `From the age of six or seven until she was fourteen or fifteen, she did nothing but weep on the stage. And in those days the audience, too, would readily weep along with her.

The belief that whenever she cried the audience was bound to cry as well was the first lens through which she saw life. Every human face looked to her like a face certain to weep at the sight of her performance. There was not a single face she found difficult to understand. And so, to her, the world wore a face exceedingly easy to read.`,
    middle: `ROXANE (To Cyrano, holding back Christian, whom Cyrano is drawing away):
Oh!—I trust him to you! Promise me that no risks shall put his life in danger!

CYRANO:
I will try my best, but promise…
That I cannot!

ROXANE:
But swear he shall be prudent?

CYRANO:
Again, I’ll do my best, but…

ROXANE:
In the siege
Let him not suffer!

CYRANO:
All that man can do,
I…

ROXANE:
That he shall be faithful!

CYRANO:
Doubtless, but…

ROXANE:
That he will write oft?

CYRANO (pausing):
That, I promise you!

Curtain.`,
    bottom: `As a writer he knows their story must end and wants it to end. So, too, as readers we know the novel must end and want it to end.

“But not yet!” say the readers to the writer.

“But not yet!” says the writer to his hero and heroine.

“But not yet!” says the beloved to the lover.

And so the reach of desire continues. What is a paradox?`
};

// Each offset is the part's original top-left corner inside its _whole image.
const restoreScenes = {
    figure: {
        parts: [[0, 127], [598, 227], [517, 115], [371, 306]]
    },
    envelope: {
        parts: [[112, 139], [220, 151], [100, 913], [611, 902]]
    },
    plate: {
        parts: [[156, 262], [553, 158], [890, 437], [887, 843], [757, 851], [178, 844]]
    }
};
const restoredSingles = new Set();
const restorePuzzleProgress = new Map();
const restoreCompleteText = "You feel much better.";
let dollRestoreStep = 3;

function resumeAfterRestore() {
    if (!restoreEventOpen) return;
    restoreEventOpen = false;
    scrollAgain();
}

//랜덤 이벤트

function randomEvent() {
    if (takeawayState.status !== "playing") return;

    let availableEventSources = [...eventSources].filter(
        function (source) { 
            if (source === birdCloudSource) {
                return false;
            }
            if (source === theaterPaperSource) {
                return false;
            }
            if (source.classList.contains("maskEvent")) {
                return completedConversations.has("mask")
                    && !maskEventResolved
                    && !maskEventOpen;
            }
            if (source.classList.contains("theaterBookEvent")) {
                return completedConversations.has("theater")
                    && theaterBookPagesRead.size < 3
                    && !theaterBookOpen
                    && !theaterBookPendingPage
                    && !theaterPaperOpen;
            }
            if (source.classList.contains("scratchEvent")) {
                return scratchState.marks.length < scratchLimit
                    && !scratchState.open;
            }
            if (source.classList.contains("restoreEvent")) {
                const type = source.dataset.restore;
                return (singleEventProgress.get(type) ?? 0) >= singleEventScenes[type].lastStep
                    && !restoredSingles.has(type);
            }
            if (source.classList.contains("dogEvent")) {
                return true;
            }
            if (source.classList.contains("singleEvent")) {
                const type = source.dataset.single;
                return (singleEventProgress.get(type) ?? 0) < singleEventScenes[type].lastStep;
            }
            const isCanvas = source.classList.contains("canvasGrid");
            const everyCanvasIsCompleted = completedCanvasIds.size === canvasRowSources.length;

            if (isCanvas && everyCanvasIsCompleted) { return false; }

            return true;


        }
    );

    let eventCandidates = availableEventSources.filter(
        function(source) { const isPuzzle = source.classList.contains("puzzleTemplate");

            return isPuzzle || source !== previousEventSource;
        }
    );

    if (eventCandidates.length === 0) { 
        eventCandidates = availableEventSources;
    }
    
    let selectedSource;

    if (theaterBookPendingPage && theaterPaperEventsUntilReveal === 0) {
        selectedSource = theaterPaperSource;
    } else if (regularEventCount === 2) {
        selectedSource = birdCloudSource;
        regularEventCount = 0;
    } else {
        const randomSource = pickRandom(eventCandidates);
        selectedSource = getAnimatedEventName(randomSource)
            ? pickNextAnimatedEvent(eventCandidates) || randomSource
            : randomSource;
        regularEventCount++;
        previousEventSource = selectedSource;
    }

    if (theaterBookPendingPage && selectedSource !== theaterPaperSource) {
        theaterPaperEventsUntilReveal--;
    }



    const newEvent = selectedSource.cloneNode(true);
    const eventArea = document.querySelector(".eventArea");
    eventArea.appendChild(newEvent);

    if (newEvent.classList.contains("maskEvent")) {
        setupMaskEvent(newEvent);
    } else if (newEvent.classList.contains("theaterBookEvent")) {
        setupTheaterBookEvent(newEvent);
    } else if (newEvent.classList.contains("theaterPaperEvent")) {
        setupTheaterPaperEvent(newEvent);
    } else if (newEvent.classList.contains("scratchEvent")) {
        setupScratchEvent(newEvent);
    } else if (newEvent.classList.contains("restoreEvent")) {
        setupRestoreEvent(newEvent);
    } else if (newEvent.classList.contains("dogEvent")) {
        setupDogEvent(newEvent);
    } else if (newEvent.classList.contains("singleEvent")) {
        setupSingleEvent(newEvent);
    }

    if (newEvent.classList.contains("brokenWindow")) {
        newEvent.querySelectorAll(".brokenWindowPane").forEach(function (pane) {
            if (revealedWindowPanes.has(pane.dataset.pane)) revealBrokenWindowPane(pane);
        });
    }

    if (newEvent.classList.contains("birdCloudTemplate")) {
        startBirdCloud(newEvent);
    }

    function startBirdCloud(eventElement) {
        const image = eventElement.querySelector(".birdCloudImage");
        const isBird = Math.random() < 0.5;

        if (!isBird) {
            image.remove();
            eventElement.classList.add("cloud");

            eventElement.animate(
                [
                    {backgroundPosition: "0px center"},
                    {backgroundPosition: "-600px center"}
                ],
                {
                    duration: 55000,
                    iterations: Infinity,
                    easing: "linear"

                }
            );

            return;
        }

        image.classList.add(isBird ? "bird" : "cloud");

        image.onload = function () {
            const maxX = Math.max(
                0,
                eventElement.clientWidth - image.offsetWidth
            );

            const maxY = Math.max(
                0,
                eventElement.clientHeight - image.offsetHeight
            );

            const cloudY = randomNumber(0, maxY);
            const keyframes = [];

            for (let i = 0; i<=8; i++) {
                const progress = i/8;
                const isEndpoint = i === 0 || i ===8;

                const x = maxX * progress;
                const baseY = maxY * progress;
                const jitter = isEndpoint
                    ?0
                    : randomNumber(-40, 40);
                
                const y = isBird
                    ? Math.max(0, Math.min(maxY, baseY + jitter))
                    : cloudY;
                
                const angle = isBird && !isEndpoint
                    ? randomNumber(-25,25)
                    : 0;
                
                keyframes.push({
                    transform:
                        `translate(${x}px, ${y}px) rotate(${angle}deg)`
                });
            }

            image.animate(keyframes, {
                duration: 9000,
                iterations: Infinity,
                easing: "steps(8,end)"
            });
        };

        image.src = isBird
            ? "use_image/bird.png"
            : "use_image/sky2.png";
    }




        const drawingCanvas =
            newEvent.querySelector(".drawingCanvas");



        if (drawingCanvas) {
            setupCanvasEvent(newEvent);
        }

        const puzzleBoard = newEvent.querySelector(".puzzleBoard");

        if (puzzleBoard) {
        
            let puzzleCandidates = puzzleSources.filter(
                function (puzzle) {
                    return puzzle.image !== previousPuzzleImage;
                }
            );

            if (puzzleCandidates.length === 0) {
                puzzleCandidates = puzzleSources;
            }

            const selectedPuzzle = pickRandom(puzzleCandidates);
            previousPuzzleImage = selectedPuzzle.image;

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

function setupSingleEvent(eventElement) {
    const type = eventElement.dataset.single;
    const scene = singleEventScenes[type];
    const step = singleEventProgress.get(type) ?? 0;

    eventElement.appendChild(
        document.querySelector("#singleEventLayout").content.cloneNode(true)
    );
    eventElement.querySelector(".singleEventNext").textContent = scene.nextLabel;
    showSingleEventStep(eventElement, step);

    placeEvent(eventElement);
}

function placeEvent(eventElement, sideMargin = 0, property = "--single-x") {
    const maxX = Math.max(
        sideMargin,
        eventElement.parentElement.clientWidth - eventElement.offsetWidth - sideMargin
    );
    const x = sideMargin + Math.random() * (maxX - sideMargin);
    eventElement.style.setProperty(property, `${x}px`);
}

function showSingleEventStep(eventElement, step) {
    const type = eventElement.dataset.single;
    const scene = singleEventScenes[type];
    const imageName = step === 0 ? `${type}_whole` : `${scene.imagePrefix}${step}`;

    eventElement.dataset.step = step;
    eventElement.querySelector(".singleEventImage").src = `use_image/single/${imageName}.png`;
    eventElement.querySelector(".singleEventText").textContent = step >= scene.lastStep
        ? scene.brokenSentence : scene.wholeSentence;
    eventElement.querySelector(".singleEventNext").hidden = step >= scene.lastStep;

    preloadedSingleImage = null;
    if (step < scene.lastStep) {
        preloadedSingleImage = new Image();
        preloadedSingleImage.src = `use_image/single/${scene.imagePrefix}${step + 1}.png`;
        preloadedSingleImage.decode().catch(() => {});
    }
}

document.querySelector(".eventArea").addEventListener("click", function (event) {
    const singleEvent = event.target.closest(".singleEvent");
    if (!singleEvent
        || singleEvent.classList.contains("restoreEvent")
        || singleEvent.classList.contains("dogEvent")
        || singleEvent.classList.contains("scratchEvent")) return;

    if (event.target.closest(".singleEventLeave")) {
        preloadedSingleImage = null;
        scrollAgain();
        return;
    }

    stopScroll();

    const nextButton = event.target.closest(".singleEventNext");
    if (!nextButton) return;

    const type = singleEvent.dataset.single;
    const currentStep = singleEventProgress.get(type) ?? 0;
    if (Number(singleEvent.dataset.step) < currentStep) {
        showSingleEventStep(singleEvent, currentStep);
        return;
    }

    const step = currentStep + 1;
    singleEventProgress.set(type, step);
    showSingleEventStep(singleEvent, step);
});

function setupDogEvent(eventElement) {
    eventElement.appendChild(
        document.querySelector("#singleEventLayout").content.cloneNode(true)
    );

    eventElement.querySelector(".singleEventImage").src = "use_image/single/dog_whole_1.png";
    eventElement.querySelector(".singleEventText").textContent = "A sacred dog is staring at you.";
    eventElement.querySelector(".singleEventNext").textContent = "Approach";

    if (window.matchMedia("(max-width: 600px)").matches) {
        eventElement.style.removeProperty("--single-x");
    } else {
        placeEvent(eventElement, 50);
    }
}

document.querySelector(".eventArea").addEventListener("click", function (event) {
    const dogEvent = event.target.closest(".dogEvent");
    if (!dogEvent) return;

    if (event.target.closest(".singleEventLeave")) {
        scrollAgain();
        return;
    }

    const approachButton = event.target.closest(".singleEventNext");
    if (!approachButton || dogEvent.classList.contains("loading")) return;

    stopScroll();
    dogEvent.classList.add("loading");

    const image = dogEvent.querySelector(".singleEventImage");
    const text = dogEvent.querySelector(".singleEventText");
    const leaveButton = dogEvent.querySelector(".singleEventLeave");
    const outcome = Math.random() < 0.5 ? 2 : 3;
    const outcomeImage = new Image();

    outcomeImage.src = `use_image/single/dog_whole_${outcome}.png`;
    text.textContent = "Loading...";
    text.classList.add("loading");
    approachButton.hidden = true;
    leaveButton.hidden = true;

    setTimeout(function () {
        image.src = outcomeImage.src;
        text.textContent = outcome === 2
            ? "She is calmer than you expected. You may leave."
            : "She looks upset. You’d better leave.";
        text.classList.remove("loading");
        leaveButton.hidden = false;
        dogEvent.classList.remove("loading");
    }, 3000);
});

function prepareHandHitMap(image) {
    if (handHitMap || !image.naturalWidth) return;

    const canvas = document.createElement("canvas");
    canvas.width = 625;
    canvas.height = Math.round(canvas.width * image.naturalHeight / image.naturalWidth);

    const context = canvas.getContext("2d", { willReadFrequently: true });
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    handHitMap = { context, width: canvas.width, height: canvas.height };
}

function addScratchMark(eventElement, mark) {
    const scratch = document.createElement("img");
    scratch.className = "scratchMark";
    scratch.src = "use_image/single/hand_kizu_whole.png";
    scratch.alt = "";
    scratch.style.left = `${mark.x * 100}%`;
    scratch.style.top = `${mark.y * 100}%`;
    eventElement.querySelector(".singleEventImageRow").appendChild(scratch);
}

function setupScratchEvent(eventElement) {
    scratchState.open = true;

    eventElement.appendChild(
        document.querySelector("#singleEventLayout").content.cloneNode(true)
    );

    const image = eventElement.querySelector(".singleEventImage");
    const text = eventElement.querySelector(".singleEventText");

    eventElement.querySelector(".singleEventImageRow").classList.add("scratchSurface");
    eventElement.querySelector(".singleEventNext").hidden = true;
    image.src = "use_image/single/hand_whole.png";
    image.alt = "A hand that feels itchy";
    text.textContent = scratchState.marks.length >= scratchLimit
        ? "That’s enough."
        : "You feel anxious. You feel an itch.";

    scratchState.marks.forEach(function (mark) {
        addScratchMark(eventElement, mark);
    });

    if (image.complete) prepareHandHitMap(image);
    image.addEventListener("load", function () {
        prepareHandHitMap(image);
    }, { once: true });

    placeEvent(eventElement);
}

document.querySelector(".eventArea").addEventListener("click", function (event) {
    const scratchEvent = event.target.closest(".scratchEvent");
    if (!scratchEvent) return;

    if (event.target.closest(".singleEventLeave")) {
        scratchState.open = false;
        scrollAgain();
        return;
    }

    const surface = event.target.closest(".scratchSurface");
    if (!surface || scratchState.marks.length >= scratchLimit || !handHitMap) return;

    const image = scratchEvent.querySelector(".singleEventImage");
    const rect = image.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;

    if (x < 0 || x > 1 || y < 0 || y > 1) return;

    const pixelX = Math.min(handHitMap.width - 1, Math.floor(x * handHitMap.width));
    const pixelY = Math.min(handHitMap.height - 1, Math.floor(y * handHitMap.height));
    const alpha = handHitMap.context.getImageData(pixelX, pixelY, 1, 1).data[3];

    if (alpha < 20) return;

    stopScroll();

    const mark = { x, y };
    scratchState.marks.push(mark);
    addScratchMark(scratchEvent, mark);

    if (scratchState.marks.length === scratchLimit) {
        scratchEvent.querySelector(".singleEventText").textContent = "That’s enough.";
        scratchEvent.classList.add("completed");
    }
});

function setupMaskEvent(eventElement) {
    maskEventOpen = true;
    eventElement.querySelector(".maskEventText").textContent = maskEventWasLeft
        ? maskEventText.returning
        : maskEventText.first;

    if (window.matchMedia("(max-width: 600px)").matches) {
        eventElement.style.removeProperty("--event-x");
    } else {
        placeEvent(eventElement, 150, "--event-x");
    }
}

function setupTheaterBookEvent(eventElement) {
    theaterBookOpen = true;

    eventElement.querySelectorAll("[data-theater-book-page]").forEach(function (button) {
        button.hidden = theaterBookPagesRead.has(button.dataset.theaterBookPage);
    });

    if (window.matchMedia("(max-width: 600px)").matches) {
        eventElement.style.removeProperty("--event-x");
    } else {
        placeEvent(eventElement, 150, "--event-x");
    }
}

function setupTheaterPaperEvent(eventElement) {
    const page = theaterBookPendingPage;
    if (!page) {
        eventElement.remove();
        return;
    }

    theaterPaperOpen = true;
    theaterBookPendingPage = null;
    eventElement.dataset.theaterBookPage = page;
    eventElement.querySelector(".theaterBookPaperText").textContent = theaterBookPageText[page];

    if (window.matchMedia("(max-width: 600px)").matches) {
        eventElement.style.removeProperty("--event-x");
    } else {
        placeEvent(eventElement, 150, "--event-x");
    }
}

function playMaskDarkness(eventElement) {
    const darkness = document.querySelector(".maskDarkness");
    const text = eventElement.querySelector(".maskEventText");

    darkness.classList.remove("playing");
    void darkness.offsetWidth;
    darkness.addEventListener("animationend", function () {
        darkness.classList.remove("playing");
        text.textContent = maskEventText.refreshed;
    }, { once: true });
    darkness.classList.add("playing");
}

document.querySelector(".eventArea").addEventListener("click", function (event) {
    const maskEvent = event.target.closest(".maskEvent");
    const actionButton = event.target.closest("[data-mask-action]");
    if (!maskEvent || !actionButton) return;

    const action = actionButton.dataset.maskAction;

    if (action === "leave") {
        if (!maskEvent.dataset.choice) {
            maskEventWasLeft = true;
        } else if (maskEvent.dataset.choice === "wear") {
            boostScroll();
        }
        maskEventOpen = false;
        scrollAgain();
        return;
    }

    stopScroll();
    maskEventResolved = true;
    maskEvent.dataset.choice = action;
    maskEvent.querySelector('[data-mask-action="talk"]').hidden = true;
    maskEvent.querySelector('[data-mask-action="wear"]').hidden = true;

    const text = maskEvent.querySelector(".maskEventText");

    if (action === "talk") {
        text.textContent = maskEventText.darkening;
        playMaskDarkness(maskEvent);
        return;
    }

    const strong = document.createElement("strong");
    strong.textContent = "Strength surges through your body!";
    text.replaceChildren(
        strong,
        document.createElement("br"),
        document.createTextNode("Want to see what it can do?")
    );
});

document.querySelector(".eventArea").addEventListener("click", function (event) {
    const bookEvent = event.target.closest(".theaterBookEvent");
    const pageButton = event.target.closest("[data-theater-book-page]");
    const leaveButton = event.target.closest("[data-theater-book-action='leave']");
    if (!bookEvent || (!pageButton && !leaveButton)) return;

    if (leaveButton) {
        theaterBookOpen = false;
        scrollAgain();
        return;
    }

    stopScroll();

    const page = pageButton.dataset.theaterBookPage;
    theaterBookPendingPage = page;
    theaterPaperEventsUntilReveal = 1;
    bookEvent.querySelector(".theaterBookIntro").textContent =
        "The page was swept away by the wind and fell to the ground. You decide to wait for it to tumble toward you.";
    bookEvent.querySelectorAll("[data-theater-book-page]").forEach(function (button) {
        button.hidden = true;
    });
});

document.querySelector(".eventArea").addEventListener("click", function (event) {
    const paperEvent = event.target.closest(".theaterPaperEvent");
    const leaveButton = event.target.closest("[data-theater-paper-action='leave']");
    if (!paperEvent || !leaveButton) return;

    theaterBookPagesRead.add(paperEvent.dataset.theaterBookPage);
    theaterPaperOpen = false;
    scrollAgain();
});

function setupRestoreEvent(eventElement) {
    const type = eventElement.dataset.restore;
    restoreEventOpen = true;

    if (type === "doll") {
        eventElement.appendChild(
            document.querySelector("#singleEventLayout").content.cloneNode(true)
        );
        eventElement.querySelector(".singleEventText").replaceWith(
            eventElement.querySelector(".restoreText")
        );
        eventElement.querySelector(".singleEventNext").textContent = "Restore";
        eventElement.querySelector(".singleEventNext").classList.add("restoreDollButton");
        eventElement.querySelector(".singleEventLeave").classList.add("restoreLeave");
        showDollRestoreStep(eventElement);
        placeEvent(eventElement);
        return;
    }

    eventElement.appendChild(
        document.querySelector("#restorePuzzleLayout").content.cloneNode(true)
    );
    const board = eventElement.querySelector(".restoreBoard");
    const scene = restoreScenes[type];
    const reference = new Image();
    reference.src = `use_image/single/${type}_whole.png`;

    const pieces = scene.parts.map(function (target, index) {
        const image = document.createElement("img");
        image.className = "restorePart";
        image.src = `use_image/single/${type}_parts_${index + 1}.png`;
        image.alt = `${type} piece ${index + 1}`;
        image.draggable = false;
        board.appendChild(image);
        const piece = { image, target };
        piece.group = new Set([piece]);
        return piece;
    });
    const savedProgress = restorePuzzleProgress.get(type);
    const hasSavedProgress = savedProgress?.length === pieces.length;
    if (hasSavedProgress) {
        const groups = new Map();
        pieces.forEach(function (piece, index) {
            const groupId = savedProgress[index].group;
            if (!groups.has(groupId)) groups.set(groupId, new Set());
            piece.group = groups.get(groupId);
            piece.group.add(piece);
        });
    }
    const mobilePieces = [...pieces].sort(() => Math.random() - 0.5);
    let topLayer = pieces.length;
    let scale = 0;
    let completedHere = false;

    function position(piece) {
        return [parseFloat(piece.image.style.left), parseFloat(piece.image.style.top)];
    }

    function saveProgress() {
        if (!scale || restoredSingles.has(type)) return;
        const groupIds = new Map();
        restorePuzzleProgress.set(type, pieces.map(function (piece) {
            if (!groupIds.has(piece.group)) groupIds.set(piece.group, groupIds.size);
            const [x, y] = position(piece);
            return { x: x / scale, y: y / scale, group: groupIds.get(piece.group) };
        }));
    }

    function moveGroup(group, dx, dy) {
        for (const piece of group) {
            const [x, y] = position(piece);
            piece.image.style.left = `${x + dx}px`;
            piece.image.style.top = `${y + dy}px`;
        }
    }

    function groupBounds(group) {
        const members = [...group];
        return {
            left: Math.min(...members.map(piece => position(piece)[0])),
            top: Math.min(...members.map(piece => position(piece)[1])),
            right: Math.max(...members.map(piece => position(piece)[0] + piece.image.offsetWidth)),
            bottom: Math.max(...members.map(piece => position(piece)[1] + piece.image.offsetHeight))
        };
    }

    function keepGroupInside(group) {
        const bounds = groupBounds(group);
        const dx = bounds.left < 0 ? -bounds.left
            : Math.min(0, board.clientWidth - bounds.right);
        const dy = bounds.top < 0 ? -bounds.top
            : Math.min(0, board.clientHeight - bounds.bottom);
        moveGroup(group, dx, dy);
    }

    function fitCompletedBoard(group) {
        const bounds = groupBounds(group);
        board.style.height = `${bounds.bottom + 24}px`;
    }

    function layout() {
        if (!reference.naturalWidth || pieces.some(piece => !piece.image.naturalWidth)) return;

        const mobile = window.matchMedia("(max-width: 600px)").matches;
        const boardWidth = board.clientWidth;
        const previousScale = scale;
        scale = Math.min(
            (boardWidth - 32) / reference.naturalWidth,
            (mobile ? 480 : 500) / reference.naturalHeight
        );
        pieces.forEach(function (piece) {
            piece.image.style.width = `${piece.image.naturalWidth * scale}px`;
            piece.image.style.height = `${piece.image.naturalHeight * scale}px`;
        });

        let rowX = 12;
        let rowY = 16;
        let rowHeight = 0;
        const mobileStarts = new Map();
        if (mobile) {
            mobilePieces.forEach(function (piece) {
                const width = piece.image.naturalWidth * scale;
                const height = piece.image.naturalHeight * scale;
                if (rowX + width > boardWidth - 12 && rowX > 12) {
                    rowX = 12;
                    rowY += rowHeight + 12;
                    rowHeight = 0;
                }
                mobileStarts.set(piece, [rowX, rowY]);
                rowX += width + 12;
                rowHeight = Math.max(rowHeight, height);
            });
        }

        // 리스토어 여백
        const mobileExtraSpace = 200;
        board.style.height = mobile
            ? `${Math.max(rowY + rowHeight, reference.naturalHeight * scale) + mobileExtraSpace}px`
            : "600px";

        pieces.forEach(function (piece, index) {
            let start;
            if (previousScale) {
                start = position(piece).map(value => value * scale / previousScale);
            } else if (hasSavedProgress) {
                start = [savedProgress[index].x * scale, savedProgress[index].y * scale];
            } else if (mobile) {
                start = mobileStarts.get(piece);
            } else {
                start = [
                    Math.random() * (boardWidth - piece.image.offsetWidth),
                    Math.random() * (600 - piece.image.offsetHeight)
                ];
            }
            const [x, y] = start;
            piece.image.style.left = `${x}px`;
            piece.image.style.top = `${y}px`;
        });

        new Set(pieces.map(piece => piece.group)).forEach(keepGroupInside);
        if (completedHere) fitCompletedBoard(pieces[0].group);
        board.classList.add("ready");
    }

    function joinNearby(group) {
        const tolerance = Math.max(24, Math.min(40, reference.naturalWidth * scale * 0.08));

        while (group.size < pieces.length) {
            let best = null;
            for (const member of group) {
                const [memberX, memberY] = position(member);
                for (const other of pieces) {
                    if (group.has(other)) continue;
                    const [otherX, otherY] = position(other);
                    const dx = otherX + (member.target[0] - other.target[0]) * scale - memberX;
                    const dy = otherY + (member.target[1] - other.target[1]) * scale - memberY;
                    const distance = Math.hypot(dx, dy);
                    if (distance <= tolerance && (!best || distance < best.distance)) {
                        best = { other, dx, dy, distance };
                    }
                }
            }
            if (!best) break;

            moveGroup(group, best.dx, best.dy);
            const joinedGroup = best.other.group;
            for (const member of group) {
                member.group = joinedGroup;
                joinedGroup.add(member);
            }
            group = joinedGroup;
            keepGroupInside(group);
        }

        if (group.size === pieces.length && !restoredSingles.has(type)) {
            completedHere = true;
            restoredSingles.add(type);
            restorePuzzleProgress.delete(type);
            const caption = eventElement.querySelector(".restoreText");
            caption.textContent = restoreCompleteText;
            board.after(caption);
            eventElement.classList.add("completed");
            setTimeout(() => fitCompletedBoard(group), 260);
        }
    }

    pieces.forEach(function (piece) {
        const image = piece.image;
        let dragOffsetX = 0;
        let dragOffsetY = 0;
        let pointerX = 0;
        let pointerY = 0;

        function moveDraggedGroup() {
            const boardRect = board.getBoundingClientRect();
            const [pieceX, pieceY] = position(piece);
            const bounds = groupBounds(piece.group);
            const dx = Math.max(-bounds.left, Math.min(
                board.clientWidth - bounds.right,
                pointerX - boardRect.left - dragOffsetX - pieceX
            ));
            const dy = Math.max(-bounds.top, Math.min(
                board.clientHeight - bounds.bottom,
                pointerY - boardRect.top - dragOffsetY - pieceY
            ));
            moveGroup(piece.group, dx, dy);
        }

        image.addEventListener("pointerdown", function (event) {
            if (restoredSingles.has(type)) return;
            restoreEventOpen = true;
            stopScroll();
            event.preventDefault();
            const boardRect = board.getBoundingClientRect();
            dragOffsetX = event.clientX - boardRect.left - parseFloat(image.style.left);
            dragOffsetY = event.clientY - boardRect.top - parseFloat(image.style.top);
            pointerX = event.clientX;
            pointerY = event.clientY;
            for (const member of piece.group) {
                member.image.style.zIndex = ++topLayer;
                member.image.classList.add("dragging");
            }
            image.style.zIndex = ++topLayer;
            image.setPointerCapture(event.pointerId);
        });

        image.addEventListener("pointermove", function (event) {
            if (!image.hasPointerCapture(event.pointerId)) return;
            pointerX = event.clientX;
            pointerY = event.clientY;
            moveDraggedGroup();
        });

        image.addEventListener("pointerup", function (event) {
            if (!image.hasPointerCapture(event.pointerId)) return;
            pointerX = event.clientX;
            pointerY = event.clientY;
            moveDraggedGroup();
            image.releasePointerCapture(event.pointerId);
            for (const member of piece.group) {
                member.image.classList.remove("dragging");
            }
            joinNearby(piece.group);
            saveProgress();
        });

        image.addEventListener("pointercancel", function () {
            for (const member of piece.group) member.image.classList.remove("dragging");
            saveProgress();
        });

        image.addEventListener("lostpointercapture", function () {
            for (const member of piece.group) member.image.classList.remove("dragging");
        });
    });

    eventElement.querySelector(".restoreLeave").addEventListener("click", saveProgress);

    Promise.all([reference, ...pieces.map(piece => piece.image)].map(image => image.decode()))
        .then(function () {
            layout();
            window.addEventListener("resize", layout);
        });
}

function showDollRestoreStep(eventElement) {
    const step = dollRestoreStep;
    const imageName = step === 0 ? "doll_whole" : `doll_b${step}`;
    eventElement.dataset.step = step;
    eventElement.querySelector(".singleEventImage").src = `use_image/single/${imageName}.png`;
    eventElement.querySelector(".restoreDollButton").hidden = step === 0;
}

document.querySelector(".eventArea").addEventListener("click", function (event) {
    const restoreEvent = event.target.closest(".restoreEvent");
    if (!restoreEvent) return;

    if (event.target.closest(".restoreLeave")) {
        resumeAfterRestore();
        return;
    }

    if (event.target.closest(".restoreDollButton")) {
        stopScroll();
        if (Number(restoreEvent.dataset.step) !== dollRestoreStep) {
            showDollRestoreStep(restoreEvent);
            return;
        }
        dollRestoreStep--;
        showDollRestoreStep(restoreEvent);
        if (dollRestoreStep === 0) {
            restoredSingles.add("doll");
            const caption = restoreEvent.querySelector(".restoreText");
            caption.textContent = restoreCompleteText;
            restoreEvent.classList.add("completed");
        }
    }
});

// brokenWindow 표시
const revealedWindowPanes = new Set();

function revealBrokenWindowPane(pane) {
    const piece = document.createElement("img");
    piece.src = `use_image/break/${pane.dataset.pane}.png`;
    piece.alt = `Broken window pane ${pane.dataset.pane.replace("_", "-")}`;

    pane.replaceChildren(piece);
    pane.classList.add("revealed");
}

document.querySelector(".eventArea").addEventListener("click", function (event) {
    const pane = event.target.closest(".brokenWindowPane");

    if (!pane || pane.classList.contains("revealed")) {
        return;
    }

    revealedWindowPanes.add(pane.dataset.pane);
    revealBrokenWindowPane(pane);
});

//캔버스 그리기

function setupCanvasEvent(canvasEvent) {
    const canvasCandidates = canvasRowSources.filter(
        function (row) {
            return !completedCanvasIds.has(row.id);
        }
    );

    if (canvasCandidates.length === 0) {
        return;
    }

    const selectedRow = pickRandom(canvasCandidates);

    canvasEvent.dataset.canvasRowId = selectedRow.id;

    const canvasRow1 =
        canvasEvent.querySelector(".canvasRow1");

    canvasRow1.replaceChildren();

    if (selectedRow.type === "image") {
        const image = document.createElement("img");

        image.className = "canvasPromptImage";
        image.src = selectedRow.src;
        image.alt = selectedRow.alt;

        canvasRow1.appendChild(image);
    } else {
        const text = document.createElement("p");

        text.className = "canvasPromptText";
        text.textContent = selectedRow.text;

        canvasRow1.appendChild(text);
    }

    const canvas =
        canvasEvent.querySelector(".drawingCanvas");

    setupDrawingCanvas(canvas);
}

function setupDrawingCanvas(canvas) {
    const context = canvas.getContext("2d");

    let isDrawing = false;
    let previousPoint = null;

    context.strokeStyle = "#776444";
    context.fillStyle = "#776444";
    context.lineWidth = 4;
    context.lineCap = "square";
    context.lineJoin = "miter";

    function getCanvasPoint(event) {
        const canvasPosition =
            canvas.getBoundingClientRect();

        const scaleX =
            canvas.width / canvasPosition.width;

        const scaleY =
            canvas.height / canvasPosition.height;

        return {
            x: (
                event.clientX - canvasPosition.left
            ) * scaleX,

            y: (
                event.clientY - canvasPosition.top
            ) * scaleY
        };
    }

    canvas.addEventListener(
        "pointerdown",
        function (event) {
            stopScroll();

            isDrawing = true;

            canvas.setPointerCapture(event.pointerId);

            previousPoint = getCanvasPoint(event);

            context.beginPath();
            context.arc(
                previousPoint.x,
                previousPoint.y,
                context.lineWidth / 2,
                0,
                Math.PI * 2
            );
            context.fill();

            context.beginPath();
            context.moveTo(
                previousPoint.x,
                previousPoint.y
            );
        }
    );

    canvas.addEventListener(
        "pointermove",
        function (event) {
            if (!isDrawing) {
                return;
            }

            const currentPoint =
                getCanvasPoint(event);

            const middlePoint = {
                x: (
                    previousPoint.x + currentPoint.x
                ) / 2,

                y: (
                    previousPoint.y + currentPoint.y
                ) / 2
            };

            context.quadraticCurveTo(
                previousPoint.x,
                previousPoint.y,
                middlePoint.x,
                middlePoint.y
            );

            context.stroke();

            previousPoint = currentPoint;
        }
    );

    canvas.addEventListener(
        "pointerup",
        function (event) {
            if (!isDrawing) {
                return;
            }

            const finalPoint =
                getCanvasPoint(event);

            context.lineTo(
                finalPoint.x,
                finalPoint.y
            );

            context.stroke();
            context.closePath();

            isDrawing = false;
            previousPoint = null;
        }
    );

    canvas.addEventListener(
        "pointercancel",
        function () {
            context.closePath();

            isDrawing = false;
            previousPoint = null;
        }
    );
}
function clearDrawing(button) {
    const canvasGrid = button.closest(".canvasGrid");

    const canvas = canvasGrid.querySelector(".drawingCanvas");

    const context = canvas.getContext("2d");

    context.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );
}

function saveDrawing(canvas) {
    const savedDrawing = document.createElement("canvas");

    savedDrawing.width = canvas.width;
    savedDrawing.height = canvas.height;

    const savedContext = savedDrawing.getContext("2d");

    savedContext.drawImage(
        canvas,
        0,
        0
    );

    completedDrawings.push(savedDrawing);
    
}

function finishDrawing(button) {
    const canvasGrid = button.closest(".canvasGrid");

    if (canvasGrid.dataset.finished === "true") {
        return;
    }

    canvasGrid.dataset.finished = "true";

    const completedId = canvasGrid.dataset.canvasRowId;
    completedCanvasIds.add(completedId);

    const originalCanvas =
    canvasGrid.querySelector(".drawingCanvas");

    saveDrawing(originalCanvas);


    originalCanvas.style.pointerEvents = "none";

    const canvasButtons = canvasGrid.querySelectorAll(".canvasButton");

    canvasButtons.forEach(
        function(canvasButton) {
            canvasButton.disabled = true;
        }
    );

    scrollAgain();
    
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
    if (takeawayState.status !== "playing") return;

    for (let i = 0; i <count; i++) {
        const particle = document.createElement("img");
        const randomIndex = Math.floor(randomNumber(0, debrisImages.length));

        particle.src = debrisImages[randomIndex];
        // 클래스 네임 붙이기
        particle.className = "debrisParticle";

        particle.style.left = `${randomNumber(0, 90)}vw`;
        particle.style.width = `${randomNumber(15, 50)}px`;
        particle.style.animationDuration = `${randomNumber(13, 30)}s`;
        particle.style.animationDelay =  `${randomNumber(0, 3)}s`;

        particle.onclick = function () {
            stopPuzzleDebris();
            clearDebris();
            scrollAgain();
        }
        $debris.appendChild(particle);


    }
}

function clearDebris() { 
    $debris.replaceChildren(); }

let puzzleDebrisTimer;

function startPuzzleDebris() {
    stopPuzzleDebris ();

    function showPuzzleDebris() {
        createDebris(10);

        puzzleDebrisTimer = setTimeout (showPuzzleDebris, 45000);
    }

    puzzleDebrisTimer = setTimeout(showPuzzleDebris, 30000);
}

function stopPuzzleDebris() {
    clearTimeout(puzzleDebrisTimer);
    puzzleDebrisTimer = undefined;
}


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

        setTimeout(function () 
        { scrollAgain();}, 10000);

    }
});

// 편지 출처 글자 랜덤 , 그림 랜덤

const field = document.querySelector('.wordsField');

function placeInBackground(element) {
    field.appendChild(element);

    const xMax = Math.max (
        0,
        window.innerWidth - element.offsetWidth
    );

    const yMax = Math.max(
        0,
        window.innerHeight - element.offsetHeight
    );

    const x =
        window.scrollX + randomNumber(0, xMax);

    const y =
        window.scrollY + randomNumber(0, yMax);

    element.style.position = "absolute";
    element.style.left = `${x}px`;
    element.style.top = `${y}px`;

}

function createScatteredDrawing() {
    if (completedDrawings.length === 0){
        return;
    }

    const savedDrawing = pickRandom(completedDrawings);

    const drawingCopy = document.createElement("canvas");

    drawingCopy.className = "scatteredDrawing";
    drawingCopy.width = savedDrawing.width;
    drawingCopy.height = savedDrawing.height;

    const copyContext = drawingCopy.getContext("2d");

    copyContext.drawImage(
        savedDrawing,
        0,
        0
    );

    placeInBackground(drawingCopy)
}

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
	
    placeInBackground(newDiv);
    
   
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
        if (takeawayState.status === "playing") {
            action();
        }
        scheduleRandom(action, minDelay, maxDelay);
        }, randomDelay );
}

//편지 저장 단어 나타나는 간격
scheduleRandom(createDiv, 1*30*1000, 1*60*1000);
scheduleRandom(createScatteredDrawing, 1*45*1000, 1*70*1000);



// collect coins
let coins = 0;
let coinHideTimer;

const coinImage = document.querySelector(".coinImage");

function showCoin() {
    if (takeawayState.status !== "playing") return;

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
let iceCreamTimer;
let iceCreamSequence = 0;

const iceCreamDisplay = document.querySelector(".iceCreamDisplay");
const iceCreamImage = iceCreamDisplay.querySelector("img");
const iceCreamFlavorCodes = {
    matcha: "m",
    strawberry: "s",
    rice: "r"
};

/* 사료 선택 시 */
function nekoButton1(button){
    whichFlavor = flavors[Math.floor(Math.random() * flavors.length)];
    startIceCream(whichFlavor);

    const nekoRow = button.closest(".nekoRow2");
    nekoRow.textContent = `The Sacred Cat gave you a sacred ice cream. which is a ${whichFlavor} flavor`;
    setTimeout(scrollAgain, 0);
}

function startIceCream(flavor) {
    const flavorCode = iceCreamFlavorCodes[flavor];
    if (!flavorCode) return;

    clearInterval(iceCreamTimer);
    const sequenceId = ++iceCreamSequence;
    const images = [
        `use_image/ice/ice_${flavorCode}_whole.png`,
        ...Array.from({ length: 4 }, function (_, index) {
            return `use_image/ice/ice_${flavorCode}_m_${index + 1}.png`;
        })
    ];
    let currentImage = 0;

    iceCreamImage.src = images[currentImage];
    iceCreamDisplay.classList.add("isVisible");

    iceCreamTimer = setInterval(function () {
        if (takeawayState.status !== "playing") {
            clearInterval(iceCreamTimer);
            iceCreamTimer = undefined;
            return;
        }

        currentImage++;
        iceCreamImage.src = images[currentImage];

        if (currentImage !== images.length - 1) return;

        clearInterval(iceCreamTimer);
        iceCreamTimer = undefined;

        const leaveFinalImage = function () {
            if (sequenceId !== iceCreamSequence) return;

            const position = iceCreamImage.getBoundingClientRect();
            const trace = document.createElement("img");

            trace.src = images[currentImage];
            trace.className = "iceCreamTrace";
            trace.alt = "";
            trace.style.left = `${position.left + window.scrollX}px`;
            trace.style.top = `${position.top + window.scrollY}px`;

            document.body.appendChild(trace);
            iceCreamDisplay.classList.remove("isVisible");
        };

        if (iceCreamImage.complete) {
            leaveFinalImage();
        } else {
            iceCreamImage.addEventListener("load", leaveFinalImage, { once: true });
        }
    }, 2000);
}



/* 이슬 선택 시 */ 
function nekoButton2(button){
    const nekoRow = button.closest(".nekoRow2");
    nekoRow.innerHTML = "The Sacred Cat is mad at you. <br>It doesn't give a shit about the 'dew.' <br>You decided to leave.";
    setTimeout(scrollAgain, 0);
}

/* 마법의 캣닢 선택 시 */
function nekoButton3(button){
    tabakoNum ++;

    tabakoDisplay.classList.add("isVisible");

    const nekoRow = button.closest(".nekoRow2");
    nekoRow.innerHTML = "The Sacred Cat hands over a <b>delicious cigarette</b>. <br> It seems glad with the <span style='color:green;'><b>magical catnip</b></span> it got from you.";
    setTimeout(scrollAgain, 0);

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
        if (takeawayState.status !== "playing") {
            clearInterval(smokingTimer);
            puff.disabled = false;
            return;
        }

        currentSmokingImage++;

        taImage.src = smokingImages[currentSmokingImage];

        if ( currentSmokingImage === smokingImages.length -1 )
        {   clearInterval(smokingTimer);

            const ashPosition = taImage.getBoundingClientRect();
            const ash = document.createElement("img");

            ash.src = "use_image/ash.png";
            ash.className = "ashTrace";

            const ashOffset = window.innerWidth <= 600? 100: 30;
            ash.style.left = `${ashPosition.left + window.scrollX - ashOffset}px`;
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

function selectAnimatedBackground(select, selector, gifSource) {
    const eventElement = select.closest(selector);

    if (select.value === "yes") {
        setTimeout(function() {
            eventElement.style.backgroundImage = `url("${gifSource}")`;
        },3000);

        setTimeout(function () { createDebris(15);}, 10000);
    }

    if (select.value === "no") {
        scrollAgain();
    }
}

// hanabi

function selectHanabi(select) {
    selectAnimatedBackground(select, ".hanabi", "use_image/firework_umzzal.gif");
}

// crow

function selectCrow(select) {
    selectAnimatedBackground(select, ".crow", "use_image/crow_umzzal.gif");
}

// moon

function selectMoon(select) {
    selectAnimatedBackground(select, ".moon", "use_image/moon_umzzal.gif");
}

//carStreet

function selectCar(select) {
    const carStreet = select.closest(".carStreet");
    if (select.value === "yes") {
        setTimeout(function() {
            carStreet.style.backgroundImage = 'url("use_image/car_umzzal.gif")';
        },3000);

        setTimeout(function () { createDebris(15);}, 10000);
        
    }

    if (select.value === "no") {
        scrollAgain();
    }
}

// shrimp

function selectShrimp(select) {
    const shrimp = select.closest(".shrimp");
    if (select.value === "yes") {
        setTimeout(function() {
            shrimp.style.backgroundImage = 'url("use_image/shrimp_umzzal.gif")';
        },3000);

        setTimeout(function () { createDebris(15);}, 10000);
        
    }

    if (select.value === "no") {
        scrollAgain();
    }
}


// bus

function selectBus(select) {
    const bus = select.closest(".bus");
    if (select.value === "yes") {
        setTimeout(function() {
            bus.style.backgroundImage = 'url("use_image/bus_umzzal.gif")';
        },3000);

        setTimeout(function () { createDebris(15);}, 10000);
        
    }

    if (select.value === "no") {
        scrollAgain();
    }
}

// jukebox

function chooseTrackButton(button){
    const jukeRow = button.closest(".jukeRow2");

    if (coins >= 1) {
    jukeRow.innerHTML = `
    <input type="button" value = "You are staring at a copy machine." class="track1" onclick="playTrack1(this)">
    <input type="button" value = "You are walking down the street." class="track2" onclick="playTrack2(this)">
    <input type="button" value = "You are near the hospital." class="track3" onclick="playTrack3(this)">`;
    
    coins --;

    }

    else {
    jukeRow.innerHTML = `<span>You should earn a <b>precious coin</b> to play.<br> That’s so obvious!</span>`
    setTimeout(scrollAgain, 0);     
}
}

function playTrack1(button){
    const jukeRow = button.closest(".jukeRow2");
    jukeRow.innerHTML = `
    <audio src="audio/waiting_copy2.mp3" controls autoplay></audio>`
    
    const audio = jukeRow.querySelector("audio");
    audio.volume = 0.6;

    setTimeout(scrollAgain, 0);
}

function playTrack2(button){
    const jukeRow = button.closest(".jukeRow2");
    jukeRow.innerHTML = `
    <audio src="audio/waiting_dingdong.mp3" controls autoplay></audio>`
    
    const audio = jukeRow.querySelector("audio");
    audio.volume = 0.6;
    setTimeout(scrollAgain, 0);
}

function playTrack3(button){
    const jukeRow = button.closest(".jukeRow2");
    jukeRow.innerHTML = `
    <audio src="audio/waiting_haisha.mp3" controls autoplay></audio>`
    
    const audio = jukeRow.querySelector("audio");
    audio.volume = 0.6;
    setTimeout(scrollAgain, 0);
}

// 캔버스



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
             if (puzzleBoard.dataset.debrisStarted !== "true") {
                 puzzleBoard.dataset.debrisStarted = "true";
                 startPuzzleDebris();}
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
                
                stopPuzzleDebris();
                clearDebris();
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

const owariModal = document.querySelector(".owariModal");
const owariPrompt = owariModal.querySelector(".owariPrompt");
const takeawayResult = owariModal.querySelector(".takeawayResult");
const takeawayStatus = owariModal.querySelector(".takeawayStatus");
const takeawayPercent = owariModal.querySelector(".takeawayPercent");
const takeawayQr = owariModal.querySelector(".takeawayQr");
const takeawayExpiry = owariModal.querySelector(".takeawayExpiry");
const takeawayOpen = owariModal.querySelector(".takeawayOpen");
const takeawayCopy = owariModal.querySelector(".takeawayCopy");
const takeawayRetry = owariModal.querySelector(".takeawayRetry");
const takeawayClose = owariModal.querySelector(".takeawayClose");

function owari() {
    stopScroll();
    owariPrompt.hidden = false;
    takeawayResult.hidden = true;
    owariModal.hidden = false;
}

function closeOwari() {
    owariModal.hidden = true;

    if (takeawayState.status === "ready") return;

    takeawayState.status = "playing";
    scrollAgain();

    if (!popupTimer) {
        startPopupTimer();
    }
}

function showTakeawayResult() {
    owariPrompt.hidden = true;
    takeawayResult.hidden = false;
}

function resetTakeawayResult() {
    takeawayStatus.textContent = "Preparing your takeaway…";
    takeawayPercent.hidden = false;
    takeawayPercent.textContent = "0%";
    takeawayQr.hidden = true;
    takeawayExpiry.hidden = true;
    takeawayOpen.hidden = true;
    takeawayCopy.hidden = true;
    takeawayRetry.hidden = true;
    takeawayClose.hidden = true;
    takeawayCopy.textContent = "Copy link";
}

async function waitForCaptureAssets(captureBottom) {
    if (document.fonts?.ready) {
        await document.fonts.ready;
    }

    const pendingImages = [...document.images].filter(function (image) {
        if (image.closest("[data-capture-ignore]")) return false;

        const imageTop = image.getBoundingClientRect().top + window.scrollY;
        return imageTop < captureBottom && !image.complete;
    });

    if (pendingImages.length === 0) return;

    const imagePromises = pendingImages.map(function (image) {
        return new Promise(function (resolve) {
            image.addEventListener("load", resolve, { once: true });
            image.addEventListener("error", resolve, { once: true });
        });
    });

    await Promise.race([
        Promise.all(imagePromises),
        new Promise(function (resolve) {
            setTimeout(resolve, 8000);
        })
    ]);
}

async function captureJourneyChunk(y, height, width) {
    return await html2canvas(document.body, {
        useCORS: true,
        backgroundColor: "#f5e4c5",
        scale: 1,
        x: 0,
        y,
        width,
        height,
        windowWidth: width,
        windowHeight: window.innerHeight,
        scrollX: 0,
        scrollY: 0,
        logging: false,
        ignoreElements: function (element) {
            return element.hasAttribute("data-capture-ignore");
        },
        onclone: function (clonedDocument) {
            clonedDocument.documentElement.classList.add("takeawayCapture");
        }
    });
}

function canvasToWebp(canvas) {
    return new Promise(function (resolve, reject) {
        canvas.toBlob(function (blob) {
            if (blob) {
                resolve(blob);
            } else {
                reject(new Error("The captured image could not be encoded."));
            }
        }, "image/webp", takeawayConfig.webpQuality);
    });
}

async function requestTakeaway(path, options = {}) {
    const headers = new Headers(options.headers || {});
    headers.set("X-Takeaway-Client", takeawayClientId);

    const response = await fetch(`${takeawayConfig.apiBase}${path}`, {
        ...options,
        headers
    });

    if (!response.ok) {
        let message = `The takeaway server returned ${response.status}.`;

        try {
            const body = await response.json();
            if (body.error) message = body.error;
        } catch (error) {
            // The status code is enough when the response is not JSON.
        }

        throw new Error(message);
    }

    if (response.status === 204) return null;
    return await response.json();
}

async function uploadJourneyChunk(journeyId, index, blob) {
    let lastError;

    for (let attempt = 1; attempt <= 3; attempt++) {
        try {
            await requestTakeaway(`/api/journeys/${journeyId}/chunks/${index}`, {
                method: "PUT",
                headers: { "Content-Type": "image/webp" },
                body: blob
            });
            return;
        } catch (error) {
            lastError = error;
        }
    }

    throw lastError;
}

async function renderTakeawayQr(shareUrl) {
    if (!window.qrcode) {
        throw new Error("The QR code library did not load.");
    }

    const qr = qrcode(0, "M");
    qr.addData(shareUrl);
    qr.make();

    const margin = 2;
    const moduleCount = qr.getModuleCount();
    const moduleSize = Math.floor(210 / (moduleCount + margin * 2));
    const canvasSize = (moduleCount + margin * 2) * moduleSize;
    const context = takeawayQr.getContext("2d");

    takeawayQr.width = canvasSize;
    takeawayQr.height = canvasSize;
    context.fillStyle = "#f8f0e2";
    context.fillRect(0, 0, canvasSize, canvasSize);
    context.fillStyle = "#776444";

    for (let row = 0; row < moduleCount; row++) {
        for (let column = 0; column < moduleCount; column++) {
            if (!qr.isDark(row, column)) continue;

            context.fillRect(
                (column + margin) * moduleSize,
                (row + margin) * moduleSize,
                moduleSize,
                moduleSize
            );
        }
    }

    takeawayQr.hidden = false;
    takeawayOpen.href = shareUrl;
}

async function copyTakeawayLink() {
    if (!takeawayState.shareUrl) return;

    try {
        await navigator.clipboard.writeText(takeawayState.shareUrl);
        takeawayCopy.textContent = "Copied";
    } catch (error) {
        window.prompt("Copy this link:", takeawayState.shareUrl);
    }
}

function stopJourneyChanges() {
    stopScroll();
    clearTimeout(popupTimer);
    popupTimer = undefined;
    clearTimeout(coinHideTimer);
    stopPuzzleDebris();
}

async function finishJourney() {
    if (takeawayState.status === "preparing") return;

    takeawayState.status = "preparing";
    takeawayState.shareUrl = "";
    stopJourneyChanges();
    resetTakeawayResult();
    showTakeawayResult();

    try {
        if (!takeawayConfig.apiBase) {
            throw new Error("The takeaway server has not been connected yet.");
        }

        const captureBottom = Math.ceil(Math.min(
            takeawayState.seenBottom,
            document.documentElement.scrollHeight
        ));
        const captureWidth = document.documentElement.clientWidth;
        const chunkHeight = window.matchMedia("(max-width: 600px)").matches
            ? takeawayConfig.mobileChunkHeight
            : takeawayConfig.desktopChunkHeight;
        const chunkCount = Math.ceil(captureBottom / chunkHeight);

        const journey = await requestTakeaway("/api/journeys", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                chunkCount,
                width: captureWidth,
                height: captureBottom
            })
        });

        takeawayState.shareUrl = journey.shareUrl;
        await renderTakeawayQr(journey.shareUrl);
        takeawayStatus.textContent = "Your takeaway is being prepared. Please keep this page open.";

        await waitForCaptureAssets(captureBottom);

        for (let index = 0; index < chunkCount; index++) {
            const y = index * chunkHeight;
            const height = Math.min(chunkHeight, captureBottom - y);
            const canvas = await captureJourneyChunk(y, height, captureWidth);
            let blob;

            try {
                blob = await canvasToWebp(canvas);
            } finally {
                canvas.width = 0;
                canvas.height = 0;
            }

            await uploadJourneyChunk(journey.id, index, blob);

            takeawayPercent.textContent =
                `${Math.round(((index + 1) / chunkCount) * 100)}%`;
            takeawayStatus.textContent = `Saving fragment ${index + 1} of ${chunkCount}…`;
        }

        await requestTakeaway(`/api/journeys/${journey.id}/complete`, {
            method: "POST"
        });

        takeawayState.status = "ready";
        takeawayStatus.textContent = "Your record of waiting is ready.";
        takeawayPercent.hidden = true;
        takeawayExpiry.hidden = false;
        takeawayOpen.hidden = false;
        takeawayCopy.hidden = false;
        takeawayClose.hidden = false;
    } catch (error) {
        console.error(error);
        takeawayState.status = "failed";
        takeawayStatus.textContent = "Something interrupted the process. Your journey is still here.";
        takeawayPercent.hidden = true;
        takeawayRetry.hidden = false;
        takeawayClose.hidden = false;
    }
}







// if 하고 몇번 반복될지 
// 편지 쓰고 시간이 좀 지나면? 랜덤 시작하기로 하자. 랜덤 주기로 소환 / 언제까지?
// const start = performance.now();  https://programming-bellybutton.tistory.com/87
// debris는 css trick에서 찾아보자. 뭔가 css sprite로 하면 될 거 같음.  
