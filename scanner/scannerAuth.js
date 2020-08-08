'use strict'
const fs = require('fs');


module.exports = {
    logInScanner: logInScanner,
    logOutScanner: logOutScanner
}


async function logInScanner(auth){
	let scannerCredentials = JSON.parse(fs.readFileSync('./scannerPermission.json'));
	console.log(scannerCredentials);
	const cred = await auth.signInWithEmailAndPassword(scannerCredentials.email,scannerCredentials.password);
	console.log("Scanner connected to backend.");

}

async function logOutScanner(auth){
	await auth.signOut().then(function() {
		console.log("Log out success.");
	}).catch(function(error) {
		console.log(error);
	});
}
