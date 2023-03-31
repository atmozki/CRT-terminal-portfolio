import { getScreen, clear } from "../../util/screens.js";

const output = "There is no spoon.";
async function matrix() {
	clear();

	return new Promise(resolve => {
		// DOM stuff
		let container = getScreen();

		const remove = event => {
			event.preventDefault();
			container.remove();
			resolve();
		};

		container.setAttribute("contenteditable", true);
		container.focus();
		container.addEventListener("keypress", remove);
		container.addEventListener("click", remove);

		const canvas = document.createElement("canvas");
		container.appendChild(canvas);

		let body = getComputedStyle(document.body);
		let color = body.getPropertyValue("--color");
		let bg = body.getPropertyValue("--bg");

		const ctx = canvas.getContext("2d");
		const w = (canvas.width = container.offsetWidth);
		const h = (canvas.height = container.offsetHeight);
		const cols = Math.floor(w / 20) + 1;
		const ypos = Array(cols).fill(0);

		ctx.fillStyle = bg;
		ctx.fillRect(0, 0, w, h);

		function update() {
			ctx.fillStyle = "#0001";
			ctx.fillRect(0, 0, w, h);

			ctx.fillStyle = color;
			ctx.font = "16pt VT323";

			ypos.forEach((y, ind) => {
				const text = String.fromCharCode(Math.random() * 128);
				const x = ind * 20;
				ctx.fillText(text, x, y);
				if (y > 100 + Math.random() * 10000) ypos[ind] = 0;
				else ypos[ind] = y + 20;
			});
		}

		setInterval(update, 50);
	});
}

export { output };
export default matrix;
