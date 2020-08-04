const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const bodyParser = require('body-parser');
const serviceAccount = require("./permission.json");
const app = express();
app.use(bodyParser.json());
admin.initializeApp({
 credential: admin.credential.cert(serviceAccount),
 databaseURL: "https://dibris-iot-project.firebaseio.com"
});
const db = admin.firestore();
const MovementType = Object.freeze({"ENTRY": true, "EXIT":false});




function subscribeUserToRoomTopic(fcmToken,roomTopic){
  admin.messaging().subscribeToTopic(fcmToken, roomTopic)
    .then(function(response) {
      console.log('Successfully subscribed to topic:', response);
    })
    .catch(function(error) {
      console.log('Error subscribing to topic:', error);
    });
}

function unsubscribeUserToRoomTopic(fcmToken,roomTopic){
  admin.messaging().unsubscribeFromTopic(fcmToken, roomTopic)
    .then(function(response) {
      console.log('Successfully unsubscribed from topic:', response);
    })
    .catch(function(error) {
      console.log('Error unsubscribing from topic:', error);
    });
}

function sendAlert(roomTopic){
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

async function calculateMovementType(room,userId){
  const currentPeopleSet = await db.collection('rooms').doc(room).collection('currentPeople');
  const snapshot = await currentPeopleSet.where('userId', '==', userId).limit(1).get();
  if (snapshot.empty) {
    console.log(userId+" entered in "+ room);
    await currentPeopleSet.add({
      userId: userId
    });
    return MovementType.ENTRY;
  }else{
    await snapshot.docs[0].ref.delete();
    return MovementType.EXIT;
  }
}

app.post('/api/register-movement-room', async (req,res) => { //todo controllare bene gli await ecc
  try{
    let room = req.body.room;
    let userId = req.body.userId;
    let fcmToken = req.body.fcmToken;
    console.log(room,userId);
    // calculated fields
    let timestamp = new Date();
    let entrata = await calculateMovementType(room,userId);
    const roomRef = await db.collection('rooms').doc(room);
    const roomDoc = await roomRef.get();
    if ( entrata ){
      subscribeUserToRoomTopic(fcmToken,room);
    }else {
      unsubscribeUserToRoomTopic(fcmToken,room);
    }
    await roomRef.collection('movimenti').add(
      {
        entrata: entrata,
        timestamp: timestamp,
        userId: userId
      }
    );
    if (!roomDoc.exists) {
      console.log('No such document!');
      //todo throw
    }
    let newNumOfPeople = roomDoc.data().currentNumberOfPeople+(entrata?1:-1);
    roomRef.update({currentNumberOfPeople:newNumOfPeople});
    console.log('Document data:', roomDoc.data());
    if(newNumOfPeople > roomDoc.data().peopleLimitNumber){   // todo solo per entrata
      sendAlert(room);
    }
    return res.status(200).send("movement registered");
  }catch(error){
    console.log(error);
    return res.status(500).send(error);
  }
});

exports.app = functions.https.onRequest(app);


/* to retrieve subcollection
const messageRef = db.collection('rooms').doc('roomA')
  .collection('messages').doc('message1');
*/

//https://medium.com/better-programming/building-an-api-with-firebase-109041721f77
