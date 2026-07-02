// Hidden command, pairs with login. Drops an administrator
// back to guest clearance.

import { type } from "../../util/io.js";
import { setAdmin, isAdmin } from "../../util/clearance.js";

export default async () => {
	if (isAdmin()) {
		setAdmin(false);
		await type(
			[
				"ADMIN TOKEN REVOKED.",
				"CLEARANCE DOWNGRADED: LEVEL 1 // GUEST ANALYST.",
				"THE SYSTEM WILL PRETEND THIS NEVER HAPPENED."
			],
			{ initialWait: 300, lineWait: 300 }
		);
	} else {
		await type(
			[
				"YOU ARE ALREADY A GUEST, ANALYST.",
				"THERE IS NOTHING LEFT TO LOG OUT OF."
			],
			{ initialWait: 300, lineWait: 300 }
		);
	}
};
