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

const app = express();
app.use(bodyParser.json());



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
	/* TODO
	Error sending message: FirebaseAppError: Credential implementation provided to initializeApp()
	via the "credential" property failed to fetch a valid Google OAuth2 access token with the following error:
	"Error fetching access token: invalid_grant (Invalid grant: account not found)". There are two likely causes:
	(1) your server time is not properly synced or (2) your certificate key file has been revoked.
	To solve (1), re-sync the time on your server. To solve (2), make sure the key ID for your key file is
	still present at https://console.firebase.google.com/iam-admin/serviceaccounts/project.
	If not, generate a new key file at https://console.firebase.google.com/project/_/settings/serviceaccounts/adminsdk.
	*/
}

/*EXPRESS ROUTES****************************** */

app.post('/api/un-subscribe-fcm-to-topic', async (req,res) => {
	console.log('SUB request', req.body);
	admin.auth().verifyIdToken(req.body.idToken).then(async (claims) => {
		console.log('claims:', claims);
		if (claims.scanner === true) {
			try {
				const fcm = req.body.fcm;
				const topic = req.body.topic;
				const sub = req.body.subscribe;
				await (sub? subscribeUserToRoomTopic(fcm,topic):unsubscribeUserToRoomTopic(fcm,topic));
				return res.status(200).send("fcm successfully updated.");
			} catch(error) {
				console.log(error);
				return res.status(500).send(error);
			}
		}
	});
});

app.post('/api/send-alert', async (req,res) => {
  	console.log('ALERT request', req.body);
	admin.auth().verifyIdToken(req.body.idToken).then(async (claims) => {
		console.log('claims:', claims);
		if (claims.scanner === true) {
			try {
				console.log('sending alert to topic', req.body.topic);
				await sendAlert(req.body.topic);
				return res.status(200).send("alert sent.");
			} catch(error) {
				console.log(error);
				return res.status(500).send(error);
			}
		}
	});
});

exports.app = functions.https.onRequest(app);
