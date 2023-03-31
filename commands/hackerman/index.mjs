import { type, scroll } from "../../util/io.js";
import { div, clear } from "../../util/screens.js";
import alert from "../../util/alert.js";
import { typeSound } from "../../sound/index.js";

const output = "ALL YOUR BASE ARE BELONG TO US";

// The number of characters typed in 1 keystroke
const TYPED_CHARS = 10;

async function hackerman() {
	// Fetch the source code of this file as text :D
	let source = await fetch("commands/hackerman/index.mjs").then((res) =>
		res.text()
	);

	return new Promise((resolve) => {
		clear();

		let typer = div();

		let isTyping = false; // This boolean prevents sending double input events (starting the typer twice)

		// Handle input keys and let the typer print a part of the source code
		const onKeyDown = async (event) => {
			typeSound();
			event.preventDefault();
			if (event.key === "c" && event.ctrlKey) {
				// Ctrl+C => exit
				clear();
				resolve();
			} else if (event.key === "Enter") {
				// Enter
				await alert("ACCESS GRANTED");
			} else if (!isTyping) {
				isTyping = true;

				// Read part of the source and print that on screen
				let text = source.slice(0, TYPED_CHARS);
				// Discard the printed text from the source
				source = source.slice(TYPED_CHARS);
				await type(
					text,
					{
						wait: 15,
						initialWait: 0,
						finalWait: 0,
						useContainer: true
					},
					typer
				);

				// Remove double linebreaks
				let breaks = typer.querySelectorAll("br + br");

				[...breaks].forEach((br) => {
					if (
						br &&
						br.nextSibling &&
						br.nextSibling.nodeType ===
							Node.ELEMENT_NODE &&
						br.nextSibling.tagName === "BR"
					) {
						br.remove();
					}
				});

				isTyping = false;
				scroll();
			}
		};

		typer.classList.add("typer", "active");
		typer.setAttribute("contenteditable", true);
		typer.addEventListener("keydown", onKeyDown);
		typer.focus();
	});
}

export { output };

export default hackerman;
