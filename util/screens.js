import {
	parse,
	type,
	input,
	setFastForward,
	newSession,
	currentSession
} from "./io.js";
import pause from "./pause.js";
import alert from "./alert.js";
import { setAdmin } from "./clearance.js";

/** Boot screen */
async function boot() {
	// Leftovers of the previous session (interrupted typing, an
	// abandoned input loop) stop as soon as this bumps
	const mySession = newSession();
	// A fresh boot always starts as a guest
	setAdmin(false);
	clear();

	// Any key or click fast-forwards the boot sequence. Clicks on
	// the power switch and theme buttons don't count, turning the
	// terminal off is not a request to speed it up.
	const skip = (event) => {
		if (
			event.type === "click" &&
			event.target.closest("#controls, #slider")
		) {
			return;
		}
		setFastForward(true);
	};
	document.addEventListener("keydown", skip);
	document.addEventListener("click", skip);

	// The finally puts the speed back to normal and drops the skip
	// listeners on every exit, including the early returns after a
	// mid-boot power off. Otherwise fast mode leaks into every
	// following boot until the page is reloaded.
	try {
		await type(
			[
				"ATMOZKI DATANET(TM) UNIFIED PERSONNEL RECORDS",
				"NODE 07 // MELBOURNE RELAY",
				"[ ANY KEY FAST-FORWARDS THE BOOT ]",
				" "
			],
			{ wait: 20, initialWait: 1500, lineWait: 500 }
		);

		await type(
			[
				"> SET TERMINAL/BOOT",
				"ESTABLISHING UPLINK........... OK",
				"CALIBRATING CRT PHOSPHOR...... OK",
				"MOUNTING RECORD ARCHIVE....... OK",
				" "
			],
			{ wait: 20, lineWait: 450 }
		);

		// Each boot phase gets its own clean screen, so the text
		// never piles up into a wall
		await pause(0.7);
		if (mySession !== currentSession()) return;
		clear();

		await type(
			[
				"> SET TERMINAL/LOGON",
				"OPERATOR AUTHENTICATION REQUIRED",
				" "
			],
			{ wait: 20, initialWait: 300, lineWait: 400 }
		);

		// The system types the guest credentials in by itself
		await type("OPERATOR ID: guest.analyst.7734", {
			wait: 45,
			initialWait: 400,
			sound: true
		});
		await type("AUTH TOKEN:  ************", {
			wait: 35,
			initialWait: 250,
			sound: true
		});

		await type(
			[
				" ",
				"VALIDATING..........",
				"CLEARANCE: LEVEL 1 // GUEST ANALYST",
				"ACCESS GRANTED."
			],
			{ wait: 20, initialWait: 300, lineWait: 400 }
		);

		await pause(0.7);
		if (mySession !== currentSession()) return;
		clear();

		await type(
			[
				"> QUERY PERSONNEL 'KURIAKOSE, DENNIS JOJO'",
				"SEARCHING RECORD ARCHIVE...",
				"1 MATCH FOUND: SUBJECT FILE #DJK-2001",
				"DECRYPTING"
			],
			{ wait: 20, initialWait: 300, lineWait: 450 }
		);

		await type([".", ".", "."], { lineWait: 200 });
	} finally {
		document.removeEventListener("keydown", skip);
		document.removeEventListener("click", skip);
		setFastForward(false);
	}

	// Powered off during the boot sequence
	if (mySession !== currentSession()) return;

	await alert("SUBJECT FILE OPEN");
	clear();
	return intro();
}

/** Subject file header, shown after boot */
async function intro() {
	const mySession = currentSession();

	await type(
		[
			"=============================================",
			" SUBJECT FILE #DJK-2001 // KURIAKOSE, D.J.",
			" 'ATMOZKI' // DATA SCIENTIST // GUEST ACCESS",
			"=============================================",
			"TYPE help TO LIST AVAILABLE QUERIES.",
			" "
		],
		{ wait: 10, initialWait: 400, lineWait: 120 }
	);

	if (mySession !== currentSession()) return;

	return main();
}

/** Main input terminal, recursively calls itself */
async function main() {
	const mySession = currentSession();

	let command = await input();
	try {
		await parse(command);
	} catch (e) {
		if (e.message && mySession === currentSession()) {
			await type(e.message);
		}
	}

	// This loop belongs to a session that was powered off,
	// the new session runs its own loop
	if (mySession !== currentSession()) return;

	main();
}

function addClasses(el, ...cls) {
	let list = [...cls].filter(Boolean);
	el.classList.add(...list);
}

function getScreen(...cls) {
	let div = document.createElement("div");
	addClasses(div, "fullscreen", ...cls);
	document.querySelector("#crt").appendChild(div);
	return div;
}

function toggleFullscreen(isFullscreen) {
	document.body.classList.toggle("fullscreen", isFullscreen);
}

/** Attempts to load template HTML from the given path and includes them in the <head>. */
async function loadTemplates(path) {
	let txt = await fetch(path).then((res) => res.text());
	let html = new DOMParser().parseFromString(txt, "text/html");
	let templates = html.querySelectorAll("template");

	templates.forEach((template) => {
		document.head.appendChild(template);
	});
}

/** Clones the template and adds it to the container. */
async function addTemplate(id, container, options = {}) {
	let template = document.querySelector(`template#${id}`);
	if (!template) {
		throw Error("Template not found");
	}
	// Clone is the document fragment of the template
	let clone = document.importNode(template.content, true);

	if (template.dataset.type) {
		await type(clone.textContent, options, container);
	} else {
		container.appendChild(clone);
	}

	// We cannot return clone here
	// https://stackoverflow.com/questions/27945721/how-to-clone-and-modify-from-html5-template-tag
	return container.childNodes;
}

/** Creates a new screen and loads the given template into it. */
async function showTemplateScreen(id) {
	let screen = getScreen(id);
	await addTemplate(id, screen);
	return screen;
}

/**
 * Creates an element and adds it to the given container (or terminal screen if undefined).
 * @param {String} type The type of element to create.
 * @param {Element} container The container to add the created element to.
 * @param {String} cls The class to apply to the created element.
 * @param {Object} attrs Extra attributes to set on the element.
 */
function el(
	type,
	container = document.querySelector(".terminal"),
	cls = "",
	attrs
) {
	let el = document.createElement(type);
	addClasses(el, cls);

	container.appendChild(el);

	if (attrs) {
		Object.entries(attrs).forEach(([key, value]) => {
			el.setAttribute(key, value);
		});
	}
	return el;
}

/**
 * Creates a <div> and adds it to the screen.
 * @param {Element} container The container to add the created element to.
 * @param {String} cls The class to apply to the created element.
 */
function div(...args) {
	return el("div", ...args);
}

function clear(screen = document.querySelector(".terminal")) {
	screen.innerHTML = "";
}

export {
	boot,
	intro,
	main,
	clear,
	getScreen,
	toggleFullscreen,
	div,
	el,
	loadTemplates,
	addTemplate,
	showTemplateScreen
};
