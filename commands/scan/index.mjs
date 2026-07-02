// Dramatized subject scan with live progress bars

import { type, scroll, currentSession } from "../../util/io.js";
import { div } from "../../util/screens.js";
import pause from "../../util/pause.js";

const BAR_WIDTH = 12;
const LABEL_WIDTH = 12;

/**
 * Animates a progress bar in place. Overshoot > 100 ends with a sensor
 * warning. Stops dead when isStale() reports the session ended.
 */
async function bar(label, overshoot, isStale) {
	if (isStale()) return;

	const el = div();
	el.style.whiteSpace = "pre";

	for (let i = 0; i <= BAR_WIDTH; i++) {
		if (isStale()) return;
		const filled = "#".repeat(i);
		const empty = "-".repeat(BAR_WIDTH - i);
		const pct = Math.round((i / BAR_WIDTH) * 100);
		el.textContent =
			label.padEnd(LABEL_WIDTH, " ") +
			"[" +
			filled +
			empty +
			"] " +
			pct +
			"%";
		scroll();
		await pause(0.05 + Math.random() * 0.1);
	}

	if (overshoot && !isStale()) {
		await pause(0.4);
		el.textContent =
			label.padEnd(LABEL_WIDTH, " ") +
			"[" +
			"#".repeat(BAR_WIDTH) +
			"] " +
			overshoot +
			"% [!]";
		scroll();
	}
}

export default async () => {
	const mySession = currentSession();
	const isStale = () => mySession !== currentSession();

	await type(
		[
			"> INITIATE SUBJECT SCAN",
			"TARGET: #DJK-2001",
			"CALIBRATING SENSORS...",
			" "
		],
		{ wait: 15, initialWait: 400, lineWait: 350 }
	);

	await bar("BIOMETRICS", 0, isStale);
	await bar("COGNITION", 0, isStale);
	await bar("TECH STACK", 0, isStale);
	await bar("CAFFEINE", 347, isStale);

	if (isStale()) return;

	await type(
		[
			" ",
			"SCAN COMPLETE.",
			"ANOMALY: CAFFEINE READING EXCEEDS SENSOR RANGE.",
			"ASSESSMENT: HIRE BEFORE SOMEONE ELSE DOES.",
			"SEE contacts TO PROCEED.",
			" "
		],
		{ wait: 8, lineWait: 150, initialWait: 500 }
	);
};
