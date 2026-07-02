// Turns the dossier around on the visitor.
// Everything is read client-side, nothing is collected or sent anywhere.

import { type } from "../../util/io.js";

function detectBrowser() {
	const ua = navigator.userAgent;
	if (ua.includes("Edg/")) return "Edge";
	if (ua.includes("OPR/") || ua.includes("Opera")) return "Opera";
	if (ua.includes("Firefox/")) return "Firefox";
	if (ua.includes("Chrome/")) return "Chrome";
	if (ua.includes("Safari/")) return "Safari";
	return "unidentified agent";
}

function detectSystem() {
	const ua = navigator.userAgent;
	if (/Android/.test(ua)) return "Android";
	if (/iPhone|iPad|iPod/.test(ua)) return "iOS";
	if (/Windows/.test(ua)) return "Windows";
	if (/Macintosh/.test(ua)) return "macOS";
	if (/Linux/.test(ua)) return "Linux";
	return "unknown system";
}

export default async () => {
	await type(
		[
			"> TRACE ROUTE REQUESTED",
			"UNAUTHORIZED CURIOSITY DETECTED.",
			"REVERSING CONNECTION"
		],
		{ wait: 15, initialWait: 400, lineWait: 400 }
	);

	await type([".", ".", ".", "."], { lineWait: 300 });

	let timezone = "UNKNOWN";
	try {
		timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
	} catch (e) {}

	const now = new Date();
	const localTime =
		String(now.getHours()).padStart(2, "0") +
		":" +
		String(now.getMinutes()).padStart(2, "0");
	const pixelRatio = Math.round((window.devicePixelRatio || 1) * 100) / 100;
	const touch = navigator.maxTouchPoints > 0;

	await type(
		[
			" ",
			"OPERATOR PROFILE COMPILED:",
			"  SYSTEM ...... " + detectSystem() + " // " + detectBrowser(),
			"  DISPLAY ..... " +
				screen.width +
				"x" +
				screen.height +
				" @" +
				pixelRatio +
				"x",
			"  CORES ....... " +
				(navigator.hardwareConcurrency || "?") +
				" threads",
			"  LOCALE ...... " +
				(navigator.language || "?") +
				" // " +
				timezone,
			"  LOCAL TIME .. " + localTime,
			"  INPUT ....... " + (touch ? "touchscreen" : "keyboard"),
			" ",
			"RELAX, ANALYST. THIS READOUT NEVER LEAVES YOUR MACHINE.",
			"WE WERE NEVER HERE.",
			" "
		],
		{ wait: 8, lineWait: 90, initialWait: 500 }
	);
};
