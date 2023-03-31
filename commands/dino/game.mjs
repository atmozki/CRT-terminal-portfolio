/**
 * Chrome dinosaur game
 * Credit to: https://github.com/abhijeetps/Chrome-Dino-Game
 */
function topWall(obj) {
	return obj.y;
}
function bottomWall(obj) {
	return obj.y + obj.height;
}
function leftWall(obj) {
	return obj.x;
}
function rightWall(obj) {
	return obj.x + obj.width;
}

// Gameplay parameters
const GRAVITY = 0.15;
const V_JUMP = 7;

const RUN_SPEED = 2;
const SPEED_INCREASE = 0.5; // every 1000 frames

const CACTUS_BASE = 30; // height
const CACTUS_MAX = 150; // max random extra height
const CACTUS_CHANCE = 0.2; // spawn chance
const EXTRA_CACTUS_CHANCE = 0.05;

// This is the number of pixels of where the player 
// is still allowed to gain vertical velocity while already jumping.
// Allows for low/high jumps by keeping space pressed.
const JUMP_THRESHOLD = 200;

// DINOSAUR
function Dinosaur(x, dividerY) {
	this.width = 55;
	this.height = 50;
	this.x = x;
	this.y = dividerY - this.height;
	this.vy = 0;
	this.jumpVelocity = -1 * V_JUMP;
}
Dinosaur.prototype.draw = function (context) {
	let oldFill = context.fillStyle;
	context.fillStyle = "yellow";
	context.fillRect(this.x, this.y, this.width, this.height);
	context.fillStyle = oldFill;
};
Dinosaur.prototype.jump = function () {
	this.vy = this.jumpVelocity;
};
Dinosaur.prototype.update = function (divider, gravity) {
	this.y += this.vy;
	this.vy += gravity;
};
Dinosaur.prototype.land = function(y) {
	this.y = y;
	this.vy = 0;
}

function Divider(gameWidth, gameHeight) {
	this.width = gameWidth;
	this.height = 50;
	this.x = 0;
	this.y = gameHeight - this.height;
}
Divider.prototype.draw = function (context) {
	context.fillRect(this.x, this.y, this.width, this.height);
};

// CACTUS
function Cactus(gameWidth, groundY) {
	this.width = 16;
	this.height = Math.floor(CACTUS_BASE + (Math.random() * CACTUS_MAX))
	this.x = gameWidth;
	this.y = groundY - this.height;
}

Cactus.prototype.draw = function (context) {
	let oldFill = context.fillStyle;
	context.fillStyle = "green";
	context.fillRect(this.x, this.y, this.width, this.height);
	context.fillStyle = oldFill;
};

// GAME
function Game({ container, onGameOver }) {
	this.container = container;
	this.canvas = document.createElement('canvas');
	container.appendChild(this.canvas);

	this.resize();
	window.addEventListener('resize', (e) => this.resize(e), false);

	this.context = this.canvas.getContext("2d");
	this.context.fillStyle = "brown";
	
	this.gravity = GRAVITY;
	this.divider = new Divider(this.width, this.height);
	this.dino = new Dinosaur(Math.floor(0.1 * this.width), this.divider.y);
	this.cacti = [];

	this.runSpeed = -1 * RUN_SPEED;
	this.paused = false;
	this.noOfFrames = 0;
	this.onGameOver = onGameOver;

	this.firstJump = true;
	this.spacePressed = false;

	document.addEventListener("keydown", (e) => {
		if (e.key === " " && this.firstJump) {
			this.spacePressed = true;
		}
	});
	document.addEventListener("keyup", (e) => {
		if (e.key === " ") {
			this.firstJump = false;
			this.spacePressed = false;
		}
	});
}

Game.prototype.resize = function () {
	let { width, height } = this.container.getBoundingClientRect();
	this.canvas.setAttribute('width', width);
	this.canvas.setAttribute('height', height);

	this.width = width;
	this.height = height;
}

Game.prototype.spawnCactus = function (probability) {
	//Spawns a new cactus depending upon the probability
	if (Math.random() <= probability) {
		this.cacti.push(new Cactus(this.width, this.divider.y));
	}
}

Game.prototype.update = function () {
	// Dinosaur jump start
	if (this.paused) {
		return;
	}

	let isInTheAir = bottomWall(this.dino) < topWall(this.divider);

	if (this.firstJump && isInTheAir && this.dino.vy > 0) {
		this.firstJump = false;
	} 

	if (this.spacePressed && this.firstJump && bottomWall(this.dino) >= topWall(this.divider) - JUMP_THRESHOLD) {
		this.dino.jump();
	} else if (!isInTheAir && this.dino.vy > 0) {
		this.firstJump = true;
		this.dino.land(topWall(this.divider) - this.dino.height);
	}

	this.dino.update(this.divider, this.gravity);

	// Removing old cacti that cross the eft border of the screen
	if (this.cacti.length > 0 && rightWall(this.cacti[0]) < 0) {
		this.cacti.shift();
	}

	// Spawning new cacti
	//Case 1: There are no cacti on the screen
	if (this.cacti.length === 0) {
		this.spawnCactus(CACTUS_CHANCE);
	}
	//Case 2: There is atleast one cactus
	else if (this.cacti.length > 0 && this.width - leftWall(this.cacti[this.cacti.length - 1]) > this.jumpDistance + 150) {
		this.spawnCactus(EXTRA_CACTUS_CHANCE);
	}

	// Moving the cacti
	for (let i = 0; i < this.cacti.length; i++) {
		this.cacti[i].x = this.cacti[i].x + this.runSpeed;
	}

	//Collision Detection
	for (let i = 0; i < this.cacti.length; i++) {
		// COLLISION OCCURED
		if (rightWall(this.dino) >= leftWall(this.cacti[i])
			&& leftWall(this.dino) <= rightWall(this.cacti[i])
			&& bottomWall(this.dino) >= topWall(this.cacti[i])) {
				this.gameOver();
		}
		this.noOfFrames++;
		this.score = Math.floor(this.noOfFrames / 10);
	}

	//Jump Distance of the Dinosaur
	// This is a CONSTANT in this gamebecause run speed is constant
	//Equations: time = t * 2 * v / g where v is the jump velocity
	// Horizontal distance s = vx * t where vx is the run speed
	// Math.floor() because we only use integer value.
	this.jumpDistance = Math.floor(this.runSpeed * (2 * this.dino.jumpVelocity) / this.gravity);

	// Gradually increase difficulty
	if (this.noOfFrames > 0 && this.noOfFrames % 1000 === 0) {
		this.runSpeed -= SPEED_INCREASE;
	}
};

Game.prototype.draw = function () {
	// clear rectangle of game
	this.context.clearRect(0, 0, this.width, this.height);
	// draw divider line
	this.divider.draw(this.context);
	// draw the dinosaur
	this.dino.draw(this.context);
	//drawing the cactii
	for (let i = 0; i < this.cacti.length; i++) {
		this.cacti[i].draw(this.context);
	}

	let oldFill = this.context.fillStyle;
	this.context.font = "20px monospace";
	this.context.textAlign = "end";
	this.context.fillStyle = "white";
	this.context.fillText(this.score, this.width - 30, 30);
	this.context.fillStyle = oldFill;
};

Game.prototype.gameOver = async function() {
	this.paused = true;
	await this.onGameOver(this.score);
	this.canvas.remove();
}

Game.prototype.main = function () {
	this.update();
	this.draw();
	window.requestAnimationFrame(() => this.main());
}

Game.prototype.start = function () {
	window.requestAnimationFrame(() => this.main());
}

export default Game;