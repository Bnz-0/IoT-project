'use strict'
require('dotenv').config();

module.exports = {
    logInScanner: logInScanner,
    logOutScanner: logOutScanner
}


async function logInScanner(auth){
	const cred = await auth.signInWithEmailAndPassword(process.env.SCANNER_EMAIL,process.env.SCANNER_PASSWORD);
	console.log("Scanner connected to backend.");
	try {
		return await auth.currentUser.getIdToken(/* forceRefresh */ true);
	} catch (e) {
		console.error("Cannot get the idToken", e);
		process.exit(42);
	}
}

async function logOutScanner(auth){
	await auth.signOut().then(function() {
		console.log("Log out success.");
	}).catch(function(error) {
		console.log(error);
	});
}
