// Hidden command, not listed in help.
// The old site made everyone log in as 'dennis' before seeing anything.
// Kept here as an easter egg for people who read the README.

import { prompt, type, currentSession } from "../../util/io.js";
import alert from "../../util/alert.js";

export default async () => {
	const mySession = currentSession();
	let user = await prompt("OPERATOR ID:");

	// Powered off while waiting or verifying
	if (mySession !== currentSession()) return;

	if (user === "dennis" || user === "atmozki") {
		// The system fills the admin token in by itself
		await type("AUTH TOKEN:  ****************", {
			wait: 35,
			initialWait: 300,
			sound: true
		});
		await type(["VALIDATING", ".", ".", "."], {
			initialWait: 200,
			lineWait: 200
		});
		if (mySession !== currentSession()) return;
		await alert("IDENTITY CONFIRMED");
		await type(
			[
				"WELCOME BACK, ADMINISTRATOR.",
				"CLEARANCE UPGRADED: LEVEL 5.",
				"(IT LOOKS THE SAME. IT FEELS BETTER.)"
			],
			{ initialWait: 300, lineWait: 300 }
		);
	} else {
		await type(
			[
				"VERIFICATION FAILED.",
				"INCIDENT LOGGED. NICE TRY, ANALYST."
			],
			{ initialWait: 300, lineWait: 300 }
		);
	}
};
