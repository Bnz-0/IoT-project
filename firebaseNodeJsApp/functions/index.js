/*
* 1) *si apre l'app: app -> UID,FCM,ID2 -> firebase
* 2) app -> advertising(ID2) -> scanner
* 3) scanner -> ID2 -> firebase
* */
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const bodyParser = require('body-parser');
const serviceAccount = require("./permission.json");

/**INIT**/
admin.initializeApp({
 credential: admin.credential.cert(serviceAccount),
 databaseURL: "https://dibris-iot-project.firebaseio.com"
});
const db = admin.firestore();
const app = express();
app.use(bodyParser.json());



//TODO l api è aperat chiunque può eseguire le funzioni:
//impostare che solo scanner può chimarle

/* ******************************************* */
async function subscribeUserToRoomTopic(fcmToken,roomTopic){
  await admin.messaging().subscribeToTopic(fcmToken, roomTopic)
    .then(function(response) {
      console.log('Successfully subscribed to topic:', response);
    })
    .catch(function(error) {
      console.log('Error subscribing to topic:', error);
      throw error;
    });
}

async function unsubscribeUserToRoomTopic(fcmToken,roomTopic){
  await admin.messaging().unsubscribeFromTopic(fcmToken, roomTopic)
    .then(function(response) {
      console.log('Successfully unsubscribed from topic:', response);
    })
    .catch(function(error) {
      console.log('Error unsubscribing from topic:', error);
      throw error;
    });
}

async function sendAlert(roomTopic){
  let message = {
    data: {
      message: "Troppa gente scappa!"
    },
    topic: roomTopic
  };
  await admin.messaging().send(message)
    .then((response) => {
      // Response is a message ID string.
      console.log('Successfully sent message:', response);
    })
    .catch((error) => {
      console.log('Error sending message:', error);
      throw error;
    });
}

/*EXPRESS ROUTES****************************** */

app.post('/api/un-subscribe-fcm-to-topic', async (req,res) => {
  try{
    let fcm = req.body.fcm;
    let topic = req.body.topic;
    let sub = req.body.subscribe;
    await (sub? subscribeUserToRoomTopic(fcm,topic):unsubscribeUserToRoomTopic(fcm,topic));
    return res.status(200).send("fcm successfully updated.");
  }catch(error){
    console.log(error);
    return res.status(500).send(error);
  }
});

app.post('/api/send-alert', async (req,res) => {
  try{
    let topic = req.body.topic;
    await sendAlert(topic);
    return res.status(200).send("alert sent.");
  }catch(error){
    console.log(error);
    return res.status(500).send(error);
  }
});

exports.app = functions.https.onRequest(app);








/*

exports.processSignUp = functions.auth.user().onCreate((user) => {
  const customClaims = {
    userId2:  1,
    scanner: false
  };
  // Set custom user claims on this newly created user.
  return admin.auth().setCustomUserClaims(user.uid, customClaims)
    .then(() => {
      // Update real-time database to notify client to force refresh.
      const metadataRef = admin.database().ref("metadata/" + user.uid);
      // Set the refresh time to the current UTC timestamp.
      // This will be captured on the client to force a token refresh.
      return metadataRef.set({refreshTime: new Date().getTime()});
    })
    .catch(error => {
      console.log(error);
    });
});
app.get('/api/scanner',async(req,res)=>{
  admin.auth().setCustomUserClaims("Ou5RmTxMcJgVUeYhPOKQmu9XLyJ2", {scanner: true}).then(() => {
    return res.status(200).send("ok");
});
});
app.post('/api/register-movement-room', async (req,res) => { //todo controllare bene gli await ecc
  try{
    if(req.context.auth.token.scanner != true){
      return res.status(200).send("Unsufficient permission.");// todo change
    }
    let room = req.body.room,
      userId2 = req.body.userId2,
      timestamp = new Date(),
      fcmToken = await retrieveFcm(userId2),
      entrata = await calculateMovementType(room,userId2);
    const roomRef = await db.collection('rooms').doc(room);
    const roomDoc = await roomRef.get();
    entrata?subscribeUserToRoomTopic(fcmToken,room):unsubscribeUserToRoomTopic(fcmToken,room);
    await roomRef.collection('movimenti').add({
      entrata: entrata,
      timestamp: timestamp,
      userId2: userId2,
    });
    if (!roomDoc.exists) {
      console.log('No such document!');
      //todo throw
    }
    let newNumOfPeople = roomDoc.data().currentNumberOfPeople+(entrata?1:-1);
    roomRef.update({currentNumberOfPeople:newNumOfPeople});
    if(newNumOfPeople > roomDoc.data().peopleLimitNumber){   // todo solo per entrata
      sendAlert(room);
    }
    return res.status(200).send("movement registered");
  }catch(error){
    console.log(error);
    return res.status(500).send(error);
  }
});

app.post('/api/register-fcm-token', async (req,res) => {
  try{
    let fcmToken = req.body.fcmToken;
    let uid = req.body.userId;
    await db.collection('users').doc(uid).set({
      fcm: fcmToken
    });
    return res.status(200).send("fcm successfully updated.");
  }catch(error){
    console.log(error);
    return res.status(500).send(error);
  }
});

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
*/
