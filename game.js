// ======================================================
// THE FORGOTTEN ARCADE
// Complete game.js
// ======================================================

"use strict";

// ======================================================
// CONFIGURATION
// ======================================================

// Leave empty until you have a separate destination URL.
// The arcade itself will work without this URL.
const FORGOTTEN_ARCADE_URL = "";

// ======================================================
// ARCADE MACHINE DATA
// ======================================================

const arcadeMachines = {
    pixel: {
        number: "MACHINE 001",
        title: "PIXEL RUNNER",
        description:
            "The screen flickers to life. A tiny pixel character stands in an empty field. There is no start menu.",
        extra:
            "STATUS: ONLINE\n" +
            "LAST PLAYER: UNKNOWN\n" +
            "HIGH SCORE: 000000\n" +
            "PLAYER NAME: YOU",
        status: "ONLINE"
    },

    moon: {
        number: "MACHINE 002",
        title: "MOON JUMP",
        description:
            "The machine refuses to start. For a moment, the glass reflects a room that doesn't look like this one.",
        extra:
            "STATUS: OFFLINE\n" +
            "POWER: UNAVAILABLE\n" +
            "LAST SHUTDOWN: UNKNOWN\n" +
            "PLEASE TRY AGAIN LATER",
        status: "OFFLINE"
    },

    frog: {
        number: "MACHINE 003",
        title: "FROG QUEST",
        description:
            "A green title screen appears, then disappears. The machine's history file contains an entry from tomorrow.",
        extra:
            "STATUS: UNKNOWN\n" +
            "QUESTS COMPLETED: 0\n" +
            "QUESTS REMAINING: UNKNOWN\n" +
            "SAVE FILE: NOT FOUND",
        status: "UNKNOWN"
    },

    mystery: {
        number: "MACHINE 004",
        title: "MYSTERY GAME",
        description:
            "The display shows a small room. There is a desk, a computer, and a familiar-looking website. The picture changes when you look away.",
        extra:
            "STATUS: INSERT COIN\n" +
            "COINS REQUIRED: 1\n" +
            "COINS AVAILABLE: 0\n" +
            "CAMERA STATUS: UNKNOWN",
        status: "UNKNOWN"
    }
};

// ======================================================
// GET HTML ELEMENTS
// ======================================================

const machineWindow = document.getElementById("machineWindow");
const windowNumber = document.getElementById("windowNumber");
const windowTitle = document.getElementById("windowTitle");
const windowDescription = document.getElementById("windowDescription");
const windowExtra = document.getElementById("windowExtra");

const closeBtn = document.getElementById("closeBtn");
const playBtn = document.getElementById("playBtn");
const arcadeBtn = document.getElementById("arcadeBtn");

const systemLog = document.getElementById("systemLog");

const windOverlay = document.getElementById("windOverlay");
const watching = document.getElementById("watching");

const canvas = document.getElementById("dustCanvas");

// Stop safely if the HTML elements haven't been added yet.
if (
    !machineWindow ||
    !windowNumber ||
    !windowTitle ||
    !windowDescription ||
    !windowExtra ||
    !closeBtn ||
    !playBtn ||
    !arcadeBtn ||
    !systemLog ||
    !windOverlay ||
    !watching ||
    !canvas
) {
    console.error(
        "The Forgotten Arcade: One or more HTML elements are missing. Check index.html."
    );
}

// ======================================================
// STATE
// ======================================================

let selectedMachine = null;
let windHasHappened = false;
let dustParticles = [];
let dustWidth = window.innerWidth;
let dustHeight = window.innerHeight;

const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
).matches;

// ======================================================
// SYSTEM LOG
// ======================================================

function addLog(message) {
    if (!systemLog) return;

    const line = document.createElement("div");

    line.className = "log-line";

    const time = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
    });

    line.textContent = "[" + time + "] " + message;

    systemLog.appendChild(line);

    // Keep the log from growing forever.
    while (systemLog.children.length > 9) {
        systemLog.removeChild(systemLog.firstChild);
    }
}

// ======================================================
// OPEN ARCADE MACHINES
// ======================================================

document.querySelectorAll("[data-machine]").forEach(button => {
    button.addEventListener("click", () => {
        const machine = arcadeMachines[button.dataset.machine];

        if (!machine) {
            addLog("[ERROR] Machine data not found.");
            return;
        }

        selectedMachine = machine;

        windowNumber.textContent = machine.number;
        windowTitle.textContent = machine.title;
        windowDescription.textContent = machine.description;
        windowExtra.textContent = machine.extra;

        machineWindow.style.display = "flex";

        // Restore the original button label.
        playBtn.textContent = "ATTEMPT START";

        // Only show the external redirect button when a URL exists.
        arcadeBtn.style.display = FORGOTTEN_ARCADE_URL
            ? "inline-block"
            : "none";

        addLog("[PLAYER] Opened " + machine.title + ".");

        // Occasionally, the machine displays something unusual.
        if (Math.random() < 0.15) {
            setTimeout(() => {
                if (machineWindow.style.display === "flex") {
                    windowDescription.textContent =
                        machine.description +
                        "\n\n...Did you hear something behind you?";
                }
            }, 2500);
        }
    });
});

// ======================================================
// CLOSE MACHINE WINDOW
// ======================================================

closeBtn.addEventListener("click", () => {
    machineWindow.style.display = "none";
});

machineWindow.addEventListener("click", event => {
    if (event.target === machineWindow) {
        machineWindow.style.display = "none";
    }
});

document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
        machineWindow.style.display = "none";
    }
});

// ======================================================
// ATTEMPT TO START A MACHINE
// ======================================================

playBtn.addEventListener("click", () => {
    if (!selectedMachine) return;

    if (selectedMachine.status === "ONLINE") {
        windowTitle.textContent = "CONNECTION LOST";

        windowDescription.textContent =
            "The game begins to load. A few pixels appear, then the screen goes blank.";

        windowExtra.textContent =
            "ERROR 0x00004\n" +
            "CONNECTION: LOST\n" +
            "REASON: UNKNOWN\n" +
            "PLEASE WAIT...";

        playBtn.textContent = "RETRY";

        addLog("[ERROR] Machine connection interrupted.");

        return;
    }

    windowDescription.textContent =
        "Nothing happens.\n\n" +
        "You hear the quiet hum of electricity, but the machine doesn't respond.";

    addLog(
        "[SYSTEM] No response from " + selectedMachine.title + "."
    );
});

// ======================================================
// REDIRECT BUTTON
// ======================================================

arcadeBtn.addEventListener("click", () => {
    if (!FORGOTTEN_ARCADE_URL) {
        addLog("[SYSTEM] No destination URL has been configured.");
        return;
    }

    // Only permit ordinary web URLs.
    try {
        const destination = new URL(FORGOTTEN_ARCADE_URL);

        if (
            destination.protocol !== "https:" &&
            destination.protocol !== "http:"
        ) {
            addLog("[ERROR] Invalid destination URL.");
            return;
        }

        window.location.href = destination.href;
    } catch (error) {
        addLog("[ERROR] The destination URL is invalid.");
    }
});

// ======================================================
// DUST PARTICLES
// ======================================================

const ctx = canvas ? canvas.getContext("2d") : null;

function resizeCanvas() {
    if (!canvas || !ctx) return;

    const ratio = Math.min(window.devicePixelRatio || 1, 2);

    dustWidth = window.innerWidth;
    dustHeight = window.innerHeight;

    canvas.width = Math.round(dustWidth * ratio);
    canvas.height = Math.round(dustHeight * ratio);

    canvas.style.width = dustWidth + "px";
    canvas.style.height = dustHeight + "px";

    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

    createDust();
}

function createDust() {
    dustParticles = [];

    const amount = Math.min(
        90,
        Math.floor((dustWidth * dustHeight) / 14000)
    );

    for (let i = 0; i < amount; i++) {
        dustParticles.push({
            x: Math.random() * dustWidth,
            y: Math.random() * dustHeight,
            size: Math.random() * 2 + 0.4,
            speed: Math.random() * 0.25 + 0.05,
            opacity: Math.random() * 0.25 + 0.04,
            drift: Math.random() * 0.4 - 0.2
        });
    }
}

function animateDust() {
    if (!ctx) return;

    ctx.clearRect(0, 0, dustWidth, dustHeight);

    for (const particle of dustParticles) {
        ctx.beginPath();

        ctx.fillStyle =
            "rgba(190,184,150," + particle.opacity + ")";

        ctx.arc(
            particle.x,
            particle.y,
            particle.size,
            0,
            Math.PI * 2
        );

        ctx.fill();

        particle.x += particle.drift;
        particle.y -= particle.speed;

        if (particle.y < -5) {
            particle.y = dustHeight + 5;
            particle.x = Math.random() * dustWidth;
        }

        if (particle.x < -5) {
            particle.x = dustWidth + 5;
        }

        if (particle.x > dustWidth + 5) {
            particle.x = -5;
        }
    }

    requestAnimationFrame(animateDust);
}

window.addEventListener("resize", resizeCanvas);

resizeCanvas();
animateDust();

// ======================================================
// WIND / DUST WIND EVENT
// ======================================================

function attemptWindEvent() {
    // One 50/50 roll per page load.
    // If it succeeds, the event occurs after a random delay.
    if (Math.random() < 0.5) {
        scheduleWindEvent();
    } else {
        addLog("[SYSTEM] Air pressure stable.");

        scheduleWatchingMessage();
    }
}

function scheduleWindEvent() {
    const delay = 8000 + Math.random() * 12000;

    setTimeout(() => {
        triggerWindEvent();
    }, delay);
}

function triggerWindEvent() {
    if (windHasHappened) return;

    windHasHappened = true;

    if (!reducedMotion) {
        windOverlay.classList.add("active");
        document.body.classList.add("wind");
    } else {
        // Reduced-motion users still receive the event message.
        windOverlay.querySelector(".wind-message").style.opacity = "1";
        windOverlay.style.opacity = "1";

        setTimeout(() => {
            windOverlay.style.opacity = "0";
            windOverlay.querySelector(".wind-message").style.opacity = "0";
        }, 2500);
    }

    addLog("[WARNING] WIND / DUST WIND detected.");
    addLog("[SYSTEM] Air movement detected inside the building.");

    // Dust briefly blows sideways.
    dustParticles.forEach(particle => {
        particle.drift = 2 + Math.random() * 5;
        particle.speed = Math.random() * 1.5 + 0.5;
        particle.opacity = Math.random() * 0.5 + 0.15;
    });

    setTimeout(() => {
        windOverlay.classList.remove("active");
        document.body.classList.remove("wind");

        // Restore the original dust movement.
        dustParticles.forEach(particle => {
            particle.drift = Math.random() * 0.4 - 0.2;
            particle.speed = Math.random() * 0.25 + 0.05;
            particle.opacity = Math.random() * 0.25 + 0.04;
        });
    }, 5000);

    scheduleWatchingMessage();
}

// ======================================================
// THE WATCHING MESSAGE
// ======================================================

function scheduleWatchingMessage() {
    const delay = 12000 + Math.random() * 18000;

    setTimeout(() => {
        if (!watching) return;

        watching.classList.add("visible");

        addLog("[SYSTEM] Background process detected.");

        setTimeout(() => {
            watching.classList.remove("visible");
        }, 4500);
    }, delay);
}

// ======================================================
// BOOT SEQUENCE
// ======================================================

addLog("[SYSTEM] Archive directory mounted.");
addLog("[SYSTEM] Four arcade machines detected.");

setTimeout(() => {
    addLog("[SYSTEM] Visitor count: 1.");
}, 4000);

setTimeout(() => {
    addLog("[SYSTEM] Visitor count: 1.");
}, 11000);

setTimeout(() => {
    addLog("[SYSTEM] ...still 1.");
}, 16000);

// Wait three seconds before rolling the 50/50 chance.
setTimeout(attemptWindEvent, 3000);

// ======================================================
// END OF GAME.JS
// ======================================================
