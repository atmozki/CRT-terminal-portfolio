// Tracks who is on the terminal. The login command upgrades the
// operator to administrator, logout and every fresh boot revoke it.

let admin = false;

function setAdmin(value) {
	admin = value;
}

function isAdmin() {
	return admin;
}

export { setAdmin, isAdmin };
