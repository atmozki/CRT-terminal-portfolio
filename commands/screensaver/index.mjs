// CREDITS: https://codepen.io/jwanko/pen/MKjyoY
import { clear, el, getScreen } from "../../util/screens.js";
import { waitForKey } from "../../util/io.js";

const requestAnimFrame = window.requestAnimationFrame;

let baseImage =
	"data:image/png;base64,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";

const imgW = 298/3;
const imgH = 172/3;

class DVD {
	constructor(canvas) {
		this.canvas = canvas;
		this.w = this.canvas.width;
		this.h = this.canvas.height;
		this.xDir = "left";
		this.yDir = "down";
		this.moveX = 0;
		this.moveY = 1;
		this.hue = 20;

		this.imgX = Math.floor(Math.random() * (this.w - imgW));
		this.imgY = Math.floor(Math.random() * (this.h - imgH));
	}

	update (base_image, ctx) {
		ctx.globalCompositeOperation = "source-over";

		ctx.fillStyle = "#040404";
		ctx.fillRect(0, 0, this.w, this.h);

		ctx.globalCompositeOperation = "source-over";

		ctx.fillStyle = "hsla(" + this.hue + ", 50%, 45%, 1)";
		ctx.fillRect(0, 0, this.w, this.h);

		ctx.globalCompositeOperation = "destination-in";

		ctx.drawImage(base_image, this.imgX, this.imgY, imgW, imgH);

		if (this.xDir === "left") {
			if (this.imgX >= this.w - imgW) {
				this.xDir = "right";
				this.imgX = this.imgX - this.moveX;
			} else {
				this.imgX = this.imgX + this.moveX;
			}
		} else {
			if (this.imgX <= 0) {
				this.xDir = "left";
				this.imgX = this.imgX + this.moveX;
			} else {
				this.imgX = this.imgX - this.moveX;
			}
		}
		if (this.yDir === "down") {
			if (this.imgY >= this.h - imgH) {
				this.yDir = "up";
				this.imgY = this.imgY - this.moveY;
			} else {
				this.imgY = this.imgY + this.moveY;
			}
		} else {
			if (this.imgY <= 0) {
				this.yDir = "down";
				this.imgY = this.imgY + this.moveY;
			} else {
				this.imgY = this.imgY - this.moveY;
			}
		}

		this.hue = (this.hue + 0.5) % 360;
	}
}

class Screensaver {
	constructor(canvas) {
		this.canvas = canvas;
		let ctx = this.canvas.getContext("2d");

		this.dvds = [new DVD(canvas)];
		this.resize();

		let base_image = new Image();


		base_image.src = baseImage;
		base_image.onload = () => {
			window.addEventListener("resize", this.resize);
			this.update(base_image, ctx);
		};
	}

	add () {
		this.dvds.push(new DVD(this.canvas));
	}
	
	update (base_image, ctx) {
		this.dvds.forEach(dvd => dvd.update(base_image, ctx));
		requestAnimFrame(() => this.update(base_image, ctx));
	}

	resize () {
		let { width, height } = this.canvas.parentElement.getBoundingClientRect();
	
		this.dvds.forEach(dvd => {
			dvd.w = this.canvas.width = width;
			dvd.h = this.canvas.height = height;
		
			if (width - imgW === height - imgH) {
				dvd.moveX = 1.5;
			} else {
				dvd.moveX = 1;
			}
		});
	}
}

const stylesheets = ['screensaver'];

export { stylesheets };
export default async function () {
	clear();
	let screen = getScreen("screensaver");
	let canvas = el('canvas', screen);

	new Screensaver(canvas);
	
	await waitForKey();
	screen.remove();
}
