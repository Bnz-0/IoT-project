'use strict'
const firebase = require('firebase');

const MovementType = Object.freeze({"ENTRY": true, "EXIT":false});

module.exports = {
	registerMovementDB: registerMovementDB
}



async function sendAlert(db, roomTopic){
	const roomDoc = await db.collection('rooms').doc(room).get();
	const numOfPeople = await roomDoc.data().currentNumberOfPeople;
	const limit = roomDoc.data().peopleLimitNumber;
	if(numOfPeople <= limit){
		return;
	}
  let message = {
    data: {
      message: "Troppa gente scappa!"
    },
    topic: roomTopic
  };
  admin.messaging().send(message)
    .then((response) => {
      // Response is a message ID string.
      console.log('Successfully sent message:', response);
    })
    .catch((error) => {
      console.log('Error sending message:', error);
    });
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


async function retrieveFcm(userId2){
  const usersCollection = await db.collection('users');
  const snapshot = await usersCollection.where('uid2', '==', userId2).limit(1).get();
  if (snapshot.empty) {
    // TODO throw Error
    return "";
  }else{
    return snapshot.docs[0].get("fcm");
  }
}



async function registerMovementDB(db,userId2,room){
	try{
		const timestamp = new Date();
			//fcmToken = await retrieveFcm(userId2),
		const entrata = await calculateMovementType(db,room,userId2)
		const roomRef = await db.collection('rooms').doc(room);
		//entrata?subscribeUserToRoomTopic(fcmToken,room):unsubscribeUserToRoomTopic(fcmToken,room);

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
			//sendAlert(room);
		});
	}catch(error){
		console.log(error);
	}
	return;
}
