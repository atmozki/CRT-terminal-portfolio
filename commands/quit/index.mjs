import { off } from "../../util/power.js";

const output = ["CLOSING SUBJECT FILE.", "UPLINK TERMINATED. GOODBYE."];

export default () => {
	return off();
};
export { output };
