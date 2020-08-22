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
	return snapshot.empty ? undefined : snapshot.docs[0].get("fcm");
}


async function callApiFunctionUnSubscribeFcmToTopic(fcm,entrata,topic,idToken){
	const apiUrlReq = "api/un-subscribe-fcm-to-topic";
	console.log(`callApiFunctionUnSubscribeFcmToTopic(${fcm},${entrata},${topic},${idToken.substring(0,10)})`)
	request({
		'method': 'POST',
		'url': process.env.CLOUD_FUNCTION_BASE_URL+apiUrlReq,
		'headers': {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			fcm:fcm,
			subscribe:entrata,
			topic:topic,
			idToken:idToken,
		})
	},
	(error, response, body) => {
		if(error)
			console.error(`An error occurred while contact '${apiUrlReq}':`, error);
		else
			console.log(`'${apiUrlReq}' response:`, body);
	});
}

async function callApiFunctionSendAlert(db,roomTopic,idToken){
	console.log(`callApiFunctionSendAlert(db,${roomTopic},${idToken.substring(0,10)})`)
	const roomDoc = await db.collection('rooms').doc(roomTopic).get();
	const numOfPeople = roomDoc.data().currentNumberOfPeople;
	const limit = roomDoc.data().peopleLimitNumber;
	if(numOfPeople > limit){
		const apiUrlReq = "api/send-alert";
		request({
			'method': 'POST',
			'url': process.env.CLOUD_FUNCTION_BASE_URL+apiUrlReq,
			'headers': {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				topic:roomTopic,
				idToken:idToken,
			})
		},
		(error, response, body) => {
			if(error)
				console.error(`An error occurred while contact '${apiUrlReq}':`, error);
			else
				console.log(`'${apiUrlReq}' response:`, body);
		});
	}
}

async function registerMovementDB(db,userId2,room,idToken){
	try{
		const fcmToken = await retrieveFcm(userId2,db);
		if(!fcmToken) {
			console.error(`The userId2 "${userId2}" does not exists, this movement will be ignored`);
			return;
		}
		const entrata = await calculateMovementType(db,room,userId2);
		const roomRef = await db.collection('rooms').doc(room);

		//send request to cloud function to subscribe to  roomTopic
		await callApiFunctionUnSubscribeFcmToTopic(fcmToken,entrata,room,idToken);

		/*LOG the movement*/
		//async op.
		roomRef.collection('movimenti').add({
			entrata: entrata,
			timestamp: new Date(),
			userId2: userId2,
		});

		/**Update Room status*/
		roomRef.update({
			currentNumberOfPeople:firebase.firestore.FieldValue.increment(entrata?1:-1)
		}).then(()=>{
			// check if we need to send alert message
			callApiFunctionSendAlert(db,room,idToken);
		});
	}catch(error){
		console.log(error);
	}
	console.log(`movement registered for ${db} ${room} ${userId2}`);
	return;
}
