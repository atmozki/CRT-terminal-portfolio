// The terminal speaks up when the operator goes quiet.

import { type } from "./io.js";

const MESSAGES = [
	"ANALYST? STILL THERE?",
	"SESSION IDLE. THE RECORD REMAINS OPEN.",
	"TAKE YOUR TIME. THE SUBJECT ISN'T GOING ANYWHERE."
];

const FIRST_AFTER = 90 * 1000;
const NEXT_AFTER = 120 * 1000;
const CHECK_EVERY = 5 * 1000;

let lastActivity = Date.now();
let messageIndex = 0;
let typing = false;

function reset() {
	lastActivity = Date.now();
	messageIndex = 0;
}

async function check() {
	if (typing || messageIndex >= MESSAGES.length) return;

	const waitTime = messageIndex === 0 ? FIRST_AFTER : NEXT_AFTER;
	if (Date.now() - lastActivity < waitTime) return;

	// Only speak up at an idle prompt on a powered monitor,
	// never over a running game or effect
	const monitorOff = document
		.getElementById("monitor")
		.classList.contains("off");
	const activeInput = document.querySelector(
		'#input[contenteditable="true"]'
	);
	const fullscreenApp = document.querySelector("#crt .fullscreen");
	if (monitorOff || !activeInput || fullscreenApp) return;

	typing = true;
	const message = MESSAGES[messageIndex];
	messageIndex += 1;
	lastActivity = Date.now();
	await type(message, { initialWait: 0, finalWait: 0 });
	typing = false;
}

function startIdleWatch() {
	document.addEventListener("keydown", reset);
	document.addEventListener("pointerdown", reset);
	setInterval(check, CHECK_EVERY);
}

export { startIdleWatch };
