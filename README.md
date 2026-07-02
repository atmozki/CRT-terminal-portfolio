<h1 align='center'>CRT Terminal Portfolio</h1>

![Banner](https://svg-banners.vercel.app/api?type=typeWriter&text1=CRT%20Terminal%20Portfolio%F0%9F%A7%91%E2%80%8D%F0%9F%92%BB&width=1000&height=150)

A retro CRT terminal that treats my portfolio like a classified personnel file. The terminal boots, grants you guest analyst clearance, pulls up subject file #DJK-2001, and lets you interrogate the record.

Built with vanilla HTML, CSS and JavaScript. No frameworks, no build step.

## Table of Contents

- [How to use](#how-to-use)
- [Commands](#commands)
- [Running locally](#running-locally)
- [Screenshots](#screenshots)
- [Credits](#credits)

## How to use

- Visit the [live site](https://atmozki.github.io/CRT-terminal-portfolio/)
- Flip the power switch and let it boot (any key skips the intro)
- Type `help` to see what you can query

## Commands

### Record queries

- `profile` - subject summary
- `skills` - capability readout
- `projects` - field operations log
- `contacts` - open comm channels
- `dossier` - the full subject file in one go
- `scan` - run a live subject scan, progress bars included
- `about` - about this terminal

### System

- `trace` - the terminal traces you back (client-side only, nothing is collected or sent anywhere)
- `clear` - wipe the screen
- `reboot` - restart the terminal
- `quit` - terminate the uplink

### Recreation

- `dino` - play the dino game
- `hackerman` - mash Enter for ACCESS GRANTED, Ctrl+C to exit
- `matrix` - the matrix rain effect
- `screensaver` - the bouncing DVD logo
- `cowsay` - a cow says things
- `joke` - one joke, no refunds
- `fire` - set the terminal on fire

There are also a few commands that are not listed anywhere. Operators who used to run this terminal might guess one.

## Running locally

Any static file server works. From the project root:

```
npx serve
```

or

```
python -m http.server
```

Then open the printed localhost URL. A server is required because the terminal loads its commands as ES modules.

## Screenshots

<p align='center' height='230px'>
<a><img height='230px' src='https://i.imgur.com/YNqDKrV.jpg'></a>
<a><img height='230px' src='https://i.imgur.com/JtOQ9Hi.jpg'></a>
<a><img height='230px' src='https://i.imgur.com/01AlTs8.jpg'></a>
</p>

## Credits

- Edwin Keijl's retro CRT terminal [screen](https://dev.to/ekeijl/retro-crt-terminal-screen-in-css-js-4afh), which this project is built on
