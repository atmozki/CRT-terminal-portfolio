import { on, off } from "./power.js";
import { click } from "../sound/index.js";
import { toggleFullscreen } from "./screens.js";

// Ignore repeat toggles while the monitor is still powering on/off,
// otherwise a double click starts two boot sequences at once
let powering = false;

function togglePower() {
	if (powering) return;
	powering = true;
	setTimeout(() => {
		powering = false;
	}, 500);

	let isOff = document
		.getElementById("monitor")
		.classList.contains("off");
	if (isOff) {
		on();
	} else {
		off();
	}
}

function handleClick(event) {
	if (event) {
		event.preventDefault();
	}
	let input = document.querySelector("[contenteditable='true']");
	if (input) {
		input.focus();
	}
}

function theme(event, name) {
	click();
	[...document.getElementsByClassName("theme")].forEach((b) =>
		b.classList.toggle("active", false)
	);
	event.target.classList.add("active");
	document.body.classList = "theme-" + name;
	handleClick();
}

function fullscreen(event) {
	toggleFullscreen();
	event.target.blur();
}

function globalListener({ keyCode }) {
	if (keyCode === 122) {
		// F11
		toggleFullscreen();
	} else if (keyCode === 27) {
		// ESC
		toggleFullscreen(false);
	}
}

function registerHandlers() {
	document.addEventListener("keydown", globalListener);

	// Theme
	document.getElementById("theme-red").addEventListener("click", (e) =>
		theme(e, "red")
	);
	document.getElementById("theme-green").addEventListener("click", (e) =>
		theme(e, "green")
	);
	document.getElementById("theme-blue").addEventListener("click", (e) =>
		theme(e, "blue")
	);

	// Power
	document.getElementById("switch").addEventListener(
		"click",
		togglePower
	);
	document.getElementById("slider").addEventListener(
		"click",
		togglePower
	);

	// Other UI
	// The fullscreen button is not present in every layout, F11 still works
	let fullscreenButton = document.getElementById("fullscreen");
	if (fullscreenButton) {
		fullscreenButton.addEventListener("click", fullscreen);
	}
	document.getElementById("crt").addEventListener("click", handleClick);
}

export { registerHandlers };
