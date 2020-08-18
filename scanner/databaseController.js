'use strict'
require('dotenv').config();
const firebase = require('firebase');
const request = require('request');
const MovementType = Object.freeze({"ENTRY": true, "EXIT":false});

module.exports = {
	registerMovementDB: registerMovementDB
}



async function calculateMovementType(db,room,userId2){
  const currentPeopleSet = await db.collection('rooms').doc(room).collection('currentPeople');
  const snapshot = await currentPeopleSet.where('userId2', '==', userId2).limit(1).get();
  if (snapshot.empty) {
    console.log(userId2+" entered in "+ room);
    await currentPeopleSet.add({
      userId2: userId2
    });
    return MovementType.ENTRY;
  }else{
		console.log(userId2+" exited from "+ room);
    await snapshot.docs[0].ref.delete();
    return MovementType.EXIT;
  }
}


async function retrieveFcm(userId2,db){
  const usersCollection = await db.collection('users');
  const snapshot = await usersCollection.where('userId2', '==', userId2).limit(1).get();
  if (snapshot.empty) {
    // TODO throw Error
    return "";
  }else{
		console.log();
    return snapshot.docs[0].get("fcm");
  }
}


async function callApiFunctionUnSubscribeFcmToTopic(fcm,entrata,topic){
	let options = {
		'method': 'POST',
		'url': process.env.CLOUD_FUNCTION_BASE_URL+'api/un-subscribe-fcm-to-topic',
		'headers': {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			fcm:fcm,
			subscribe:entrata,
			topic:topic
		})
	};
	let result = await request(options); // TODO PARSE AND CONSOLE LOG BODY message
	//if (error) throw new Error(error);
	//console.log(result);
}

async function callApiFunctionSendAlert(db,roomTopic){
	let options = {
	  'method': 'POST',
	  'url': process.env.CLOUD_FUNCTION_BASE_URL+'api/send-alert',
	  'headers': {
	    'Content-Type': 'application/json'
	  },
	  body: JSON.stringify({topic:roomTopic})
	};
	const roomDoc = await db.collection('rooms').doc(roomTopic).get();
	const numOfPeople = await roomDoc.data().currentNumberOfPeople;
	const limit = roomDoc.data().peopleLimitNumber;
	if(numOfPeople > limit){
		let result = await request(options);
		//if (error) throw new Error(error);
		//console.log(result);  // TODO PARSE AND CONSOLE LOG BODY message
	}
}

async function registerMovementDB(db,userId2,room){
	try{
		const timestamp = new Date();
		const fcmToken = await retrieveFcm(userId2,db);
		const entrata = await calculateMovementType(db,room,userId2);
		const roomRef = await db.collection('rooms').doc(room);

		//send request to cloud function to subscribe to  roomTopic
		await callApiFunctionUnSubscribeFcmToTopic(fcmToken,entrata,room);

		/*LOG the movement*/
		//async op.
		roomRef.collection('movimenti').add({
			entrata: entrata,
			timestamp: timestamp,
			userId2: userId2,
		});

		/**Update Room status*/
		const roomDoc = await roomRef.get();
		roomRef.update({
			currentNumberOfPeople:firebase.firestore.FieldValue.increment(entrata?1:-1)
		}).then(()=>{
			// check if we need to send alert message
			callApiFunctionSendAlert(db,room);
		});
	}catch(error){
		console.log(error);
	}
	console.log(`movement registered for ${db} ${room} ${userId2}`);
	return;
}
