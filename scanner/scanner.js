const MovementType = Object.freeze({"ENTRY": true, "EXIT":false});
//const scanner = import './ble-scanner';
const scanner = require('./debug-scanner');
const admin = require('firebase-admin');
const serviceAccount = require('./permission.json');
const room = process.argv[2];

/**init**/
if(!room){
	console.error("You must provide a room");
	process.exit(1);
}
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();


async function sendAlert(roomTopic){
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

async function calculateMovementType(room,userId2){
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



async function registerMovementDB(userId2,room){
	try{
		const timestamp = new Date();
			//fcmToken = await retrieveFcm(userId2),
		const entrata = await calculateMovementType(room,userId2)
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
			currentNumberOfPeople:admin.firestore.FieldValue.increment(entrata?1:-1)
		}).then(()=>{
			sendAlert(room);
		});
	}catch(error){
		console.log(error);
	}
	return;
}



function discover(devices) {
	for(let device of devices){
		registerMovementDB(device,room);
	}
}

scanner.start();
scanner.on('discover', discover);
console.log("scanner for",room,"started!");







/*
    match /users/{userId} {
    	allow create: if request.auth.uid != null;
    	allow read,update : if request.auth.uid == userId;
    }

    match /rooms/{room} {
    	allow update : if request.auth.token.scanner == true;
    }

    match /rooms/{room}/currentPeople {
    	allow read,write : if request.auth.token.scanner == true;
    }
  */
    /*todo append al posto di update*/
  /*  match /rooms/{room}/movimenti{
    	allow update : if request.auth.token.scanner == true;
    }
*/
