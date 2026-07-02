import { typeSound } from "../sound/index.js";
import pause from "./pause.js";
import { loadTemplates } from "./screens.js";

// Command history
let prev = getHistory();
let historyIndex = -1;
let tmp = "";

// When enabled, type() runs near-instantly. Used to fast-forward the boot sequence.
let fastForward = false;

function setFastForward(enabled) {
	fastForward = enabled;
}

// Session generation. Bumped when the monitor powers off or (re)boots,
// so typing and input loops from the previous session notice they are
// stale and stop, instead of running on top of the new session.
let session = 0;

function newSession() {
	session += 1;
	return session;
}

function currentSession() {
	return session;
}

function getHistory() {
	let storage = localStorage.getItem("commandHistory");
	let prev;
	if (storage) {
		try {
			let json = JSON.parse(storage);
			prev = Array.isArray(json) ? json : [];
		} catch (e) {
			prev = [];
		}
	} else {
		prev = [];
	}
	return prev;
}

function addToHistory(cmd) {
	prev = [cmd, ...prev];
	historyIndex = -1;
	tmp = "";

	try {
		localStorage.setItem("commandHistory", JSON.stringify(prev));
	} catch (e) {}
}

/**
 * Convert a character that needs to be typed into something that can be shown on the screen.
 * Newlines becomes <br>
 * Tabs become three spaces.
 * Spaces become &nbsp;
 * */
function getChar(char) {
	let result;
	if (typeof char === "string") {
		if (char === "\n") {
			result = document.createElement("br");
		} else if (char === "\t") {
			let tab = document.createElement("span");
			tab.innerHTML = "&nbsp;&nbsp;&nbsp;";
			result = tab;
		} else if (char === " ") {
			let space = document.createElement("span");
			space.innerHTML = "&nbsp;";
			space.classList.add("char");
			result = space;
		} else {
			let span = document.createElement("span");
			span.classList.add("char");
			span.textContent = char;
			result = span;
		}
	}
	return result;
}

/**
 * Types the given text on the screen
 * @param {String|Array<String>} text Text to type
 * @param {Object} options Typer config
 * @param {Number} options.wait Time (ms) to wait between characters.
 * @param {Number} options.lineWait If text is an array of strings, it will wait this amount (ms) between lines
 * @param {Number} options.finalWait Time (ms) to wait when finished.
 * @param {String} options.typerClass Class to add to the typing container, in order to style is with CSS
 * @param {Boolean} options.useContainer If true, types text into the container element (3rd parameter). If false, creates a new div
 * @param {Boolean} options.stopBlinking Stop blinking when typing is done
 * @param {Boolean} options.processChars Whether to preprocess spaces, tabs and newlines to &nbsp; (3x&nbsp;) and <br>
 * @param {Boolean} options.clearContainer Clear container before typing
 * @param {Element} container DOM element where text will be typed
 */
async function type(
	text,
	options = {},
	container = document.querySelector(".terminal")
) {
	if (!text) return Promise.resolve();

	let {
		wait = 30,
		initialWait = 1000,
		finalWait = 500,
		lineWait = 100,
		typerClass = "",
		useContainer = false,
		stopBlinking = true,
		processChars = true,
		clearContainer = false,
		sound = false
	} = options;

	if (fastForward) {
		wait = 4;
		initialWait = 0;
		finalWait = 0;
		lineWait = 0;
	}

	// If text is an array, e.g. type(['foo', 'bar'])
	if (processChars && Array.isArray(text)) {
		const mySession = session;
		for (const t of text) {
			// Stop typing lines that belong to a dead session
			if (mySession !== session) return;
			await type(
				t,
				{
					...options,
					initialWait: lineWait,
					finalWait: lineWait
				},
				container
			);
		}
		return;
	}

	const mySession = session;
	let interval;
	return new Promise(async (resolve) => {
		if (interval) {
			clearInterval(interval);
			interval = null;
		}
		// Create a div where all the characters can be appended to (or use the given container)
		let typer = useContainer
			? container
			: document.createElement("div");
		typer.classList.add("typer", "active");

		if (typerClass) {
			typer.classList.add(typerClass);
		}
		// Handy if reusing the same container
		if (clearContainer) {
			container.innerHTML = "&nbsp;";
		}

		if (!useContainer) {
			container.appendChild(typer);
		}

		if (initialWait) {
			await pause(initialWait / 1000);
		}

		// The session may have ended while we were waiting
		if (mySession !== session) {
			typer.classList.remove("active");
			resolve();
			return;
		}

		let queue = text;
		if (processChars) {
			queue = text.split("");
		}

		let prev;
		let soundTick = 0;

		// Use an interval to repeatedly pop a character from the queue and type it on screen
		interval = setInterval(async () => {
			// Stop mid-word when the monitor powers off or reboots
			if (mySession !== session) {
				clearInterval(interval);
				typer.classList.remove("active");
				resolve();
				return;
			}
			if (queue.length) {
				let char = queue.shift();

				// This is an optimisation for typing a large number of characters on the screen.
				// It seems the performance degrades when trying to add 500+ DOM elements rapidly on the screen.
				// So the content of the previous element is moved to the typer container and removed, which
				// reduces the amount of DOM elements.
				// This may cause issues when the element is removed while the character is still animating (red screen)
				if (processChars && prev) {
					prev.remove();
					if (
						prev.firstChild &&
						prev.firstChild.nodeType ===
							Node.TEXT_NODE
					) {
						typer.innerText +=
							prev.innerText;
					} else {
						typer.appendChild(prev);
					}
				}
				let element = processChars
					? getChar(char)
					: char;
				if (element) {
					typer.appendChild(element);
					scroll(container);
					// Keystroke sound, as if invisible hands
					// were typing. Every other character keeps
					// it from machine-gunning, and it mutes
					// while fast-forwarding.
					if (
						sound &&
						!fastForward &&
						soundTick++ % 2 === 0
					) {
						typeSound();
					}
				}
				prev = element;
			} else {
				// When the queue is empty, clean up the interval
				clearInterval(interval);
				await pause(finalWait / 1000);
				if (stopBlinking) {
					typer.classList.remove("active");
				}
				resolve();
			}
		}, wait);
	});
}

function moveCaretToEnd(el) {
	var range, selection;
	if (document.createRange) {
		range = document.createRange(); //Create a range (a range is a like the selection but invisible)
		range.selectNodeContents(el); //Select the entire contents of the element with the range
		range.collapse(false); //collapse the range to the end point. false means collapse to end rather than the start
		selection = window.getSelection(); //get the selection object (allows you to change selection)
		selection.removeAllRanges(); //remove any selections already made
		selection.addRange(range); //make the range you have just created the visible selection
	}
}

/** Shows an input field, returns a resolved promise with the typed text on <enter> */
async function input(pw) {
	return new Promise((resolve) => {
		let terminal = document.querySelector(".terminal");
		let input = document.createElement("span");
		input.setAttribute("id", "input");
		if (pw) {
			input.classList.add("password");
		}
		input.setAttribute("contenteditable", true);
		input.setAttribute("autocapitalize", "off");
		input.setAttribute("autocorrect", "off");
		input.setAttribute("spellcheck", "false");
		input.setAttribute("enterkeyhint", "go");

		let submitted = false;

		const submit = () => {
			if (submitted) return;
			submitted = true;
			input.setAttribute("contenteditable", false);
			let result = cleanInput(input.textContent);
			addToHistory(result);
			resolve(result);
		};

		const appendChar = (chr) => {
			// Wrap the character in a span
			let span = document.createElement("span");
			span.classList.add("char");
			span.textContent = chr;
			input.appendChild(span);

			// For password field, fill the data-pw attr with asterisks
			// which will be shown using CSS
			if (pw) {
				let length = input.textContent.length;
				input.setAttribute(
					"data-pw",
					Array(length).fill("*").join("")
				);
			}
			moveCaretToEnd(input);
			scroll(terminal, true);
		};

		// Physical keyboards: keys are handled here and the
		// default editing action is prevented
		const onKeyDown = (event) => {
			typeSound();
			// ENTER
			if (event.keyCode === 13) {
				event.preventDefault();
				submit();
			}
			// UP
			else if (event.keyCode === 38) {
				if (historyIndex === -1)
					tmp = event.target.textContent;
				historyIndex = Math.min(
					prev.length - 1,
					historyIndex + 1
				);
				let text = prev[historyIndex];
				event.target.textContent = text;
			}
			// DOWN
			else if (event.keyCode === 40) {
				historyIndex = Math.max(-1, historyIndex - 1);
				let text = prev[historyIndex] || tmp;
				event.target.textContent = text;
			}
			// BACKSPACE
			else if (event.keyCode === 8) {
				// Prevent inserting a <br> when removing the last character
				if (event.target.textContent.length === 1) {
					event.preventDefault();
					event.target.innerHTML = "";
				}
			}
			// Printable character (skip when a modifier is held)
			else if (
				event.key &&
				event.key.length === 1 &&
				!event.ctrlKey &&
				!event.metaKey
			) {
				event.preventDefault();
				appendChar(event.key);
			}
		};

		// Virtual keyboards (mobile) often send unidentified keydown
		// events, the actual text only arrives through beforeinput
		const onBeforeInput = (event) => {
			if (
				event.inputType === "insertParagraph" ||
				event.inputType === "insertLineBreak"
			) {
				event.preventDefault();
				submit();
			} else if (
				event.inputType === "insertText" &&
				event.data
			) {
				event.preventDefault();
				typeSound();
				[...event.data].forEach(appendChar);
			} else if (
				event.inputType === "deleteContentBackward" &&
				input.textContent.length === 1
			) {
				// Prevent a stray <br> when removing the last character
				event.preventDefault();
				input.innerHTML = "";
			}
		};

		input.addEventListener("keydown", onKeyDown);
		input.addEventListener("beforeinput", onBeforeInput);
		terminal.appendChild(input);
		input.focus();
		scroll(terminal, true);
	});
}

// Processes the user input and executes a command
async function parse(input) {
	const mySession = session;
	input = cleanInput(input);

	if (!input) {
		return;
	}
	// Only allow words, separated by space
	let matches = String(input).match(/^(\w+)(?:\s((?:\w+(?:\s\w+)*)))?$/);

	if (!matches) {
		throw new Error("MALFORMED QUERY. TYPE help FOR A LIST.");
	}
	let command = matches[1];
	let args = matches[2];

	let naughty = ["fuck", "shit", "die", "ass", "cunt"];
	if (naughty.some((word) => command.includes(word))) {
		throw new Error(
			"LANGUAGE FILTER ENGAGED. THIS INCIDENT WILL BE REPORTED."
		);
	}

	let module;

	// Try to import the command function
	try {
		module = await import(`../commands/${command}/index.mjs`);
	} catch (e) {
		console.error(e);
		// Kinda abusing TypeError to check if the import failed
		if (e instanceof TypeError) {
			e.message = `QUERY NOT RECOGNIZED: ${command}. TYPE help FOR A LIST.`;
		}
		// E.g. syntax error
		else {
			e.message = "QUERY FAULT. THE RECORD MAY BE CORRUPTED.";
		}
		throw e;
	}

	module.stylesheets?.forEach((name) => {
		addStylesheet(`commands/${command}/${name}.css`);
	});

	// Try to import and parse any HTML templates that the command module exports
	module.templates?.forEach(async (name) => {
		await loadTemplates(`commands/${command}/${name}.html`);
	});

	// The session may have ended while the module was loading
	if (mySession !== session) {
		return;
	}

	// Show any output if the command exports any
	// Commands can export typeOptions to control typing speed
	await type(module.output, module.typeOptions ?? {});
	await pause();

	// Don't run the command when its session died while the
	// output was still being typed
	if (mySession !== session) {
		return;
	}

	// Execute the command (default export)
	await module.default?.(args);

	return;
}

function cleanInput(input) {
	return input.toLowerCase().trim();
}

function scroll(el = document.querySelector(".terminal"), force = false) {
	// Stick to the bottom while typing, but leave the view alone
	// when the user has scrolled up to read something
	let nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 60;
	if (force || nearBottom) {
		el.scrollTop = el.scrollHeight;
	}
}

/** Types the given text and asks input */
async function prompt(text, pw = false) {
	await type(text);
	return input(pw);
}

/** Sets a global event listeners and returns when a key is hit */
async function waitForKey() {
	return new Promise((resolve) => {
		const handle = () => {
			document.removeEventListener("keyup", handle);
			document.removeEventListener("click", handle);
			resolve();
		};
		document.addEventListener("keyup", handle);
		document.addEventListener("click", handle);
	});
}

function addStylesheet(href) {
	let head = document.getElementsByTagName("HEAD")[0];

	// Create new link Element
	let link = document.createElement("link");

	// set the attributes for link element
	link.rel = "stylesheet";
	link.type = "text/css";
	link.href = href;

	// Append link element to HTML head
	head.appendChild(link);
}

export {
	prompt,
	input,
	cleanInput,
	type,
	parse,
	scroll,
	waitForKey,
	setFastForward,
	newSession,
	currentSession
};
