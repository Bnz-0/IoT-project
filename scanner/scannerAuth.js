'use strict'
require('dotenv').config();

module.exports = {
    logInScanner: logInScanner,
    logOutScanner: logOutScanner
}


async function logInScanner(auth){
	const cred = await auth.signInWithEmailAndPassword(process.env.SCANNER_EMAIL,process.env.SCANNER_PASSWORD);
	console.log("Scanner connected to backend.");

}

async function logOutScanner(auth){
	await auth.signOut().then(function() {
		console.log("Log out success.");
	}).catch(function(error) {
		console.log(error);
	});
}
