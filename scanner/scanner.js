'use strict'
const scannerAuth = require('./scannerAuth.js');
const dbController = require('./databaseController.js');
//const scanner = require('./debug-scanner');
const scanner = require('./ble-scanner');
const firebase = require('firebase');
const room = process.argv[2];

process.on('unhandledRejection', (err, p) => {
  console.log('An unhandledRejection occurred');
  console.log(`Rejected Promise: ${p}`);
  console.log(`Rejection: ${err}`);
});

const firebaseConfig = {
	apiKey: "AIzaSyCKZvPiFvmjtpOaNf7VwzEmdx4JP-miYzQ",
	authDomain: "dibris-iot-project.firebaseapp.com",
	databaseURL: "https://dibris-iot-project.firebaseio.com",
	projectId: "dibris-iot-project",
	storageBucket: "dibris-iot-project.appspot.com",
	messagingSenderId: "1028133041384",
	appId: "1:1028133041384:web:c8b1954a4bebf325a7455d",
	measurementId: "G-6L1SS06PH5"
};

let ID_TOKEN;


function discover(device) {
	dbController.registerMovementDB(db,device,room,ID_TOKEN);
}


/***********************
*			INIT PROC				 *
***********************/
if(!room){
	console.error("You must provide a room");
	process.exit(1);
}
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();
scanner.on('discover', discover);
scannerAuth.logOutScanner(auth).then(()=>{
	scannerAuth.logInScanner(auth).then((idToken)=>{
		console.log("scanner for",room,"started! (idToken = " + idToken.substring(0,10) + "...)");
		ID_TOKEN = idToken;
		scanner.start();
	});
});
