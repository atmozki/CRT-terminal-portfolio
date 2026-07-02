let buttonSound = new Audio("./sound/button.mp3");
let clickSound = new Audio("./sound/click.mp3");

let keys = [
	new Audio("./sound/key1.mp3"),
	new Audio("./sound/key2.mp3"),
	new Audio("./sound/key3.mp3"),
	new Audio("./sound/key4.mp3")
];

// play() rejects when the browser blocks audio before the first
// user gesture, swallow it instead of spamming the console
function play(audio) {
	let result = audio.play();
	if (result) {
		result.catch(() => {});
	}
}

function button() {
	play(buttonSound);
}
function click() {
	play(clickSound);
}

function typeSound() {
	let i = Math.floor(Math.random() * keys.length);
	keys[i].currentTime = 0;
	play(keys[i]);
}

export { button, click, typeSound };
