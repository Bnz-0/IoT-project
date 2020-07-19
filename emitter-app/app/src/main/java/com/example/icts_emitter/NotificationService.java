package com.example.icts_emitter;

import android.util.Log;

import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;

public class NotificationService extends FirebaseMessagingService {
    public NotificationService() {}

    @Override
    public void onNewToken(String token) {
        Log.d("new token ", "Refreshed token: " + token);

        // If you want to send messages to this application instance or
        // manage this apps subscriptions on the server side, send the
        // Instance ID token to your app server.
        // TODO send new token to the server (?)
    }

    @Override
    public void onMessageReceived(RemoteMessage remoteMessage){
        Log.d("MessageReceived", "From: " + remoteMessage.getFrom());

        // Check if message contains a notification payload.
        if (remoteMessage.getNotification() != null) {
            Log.d("MessageReceived", "Message Notification Body: " + remoteMessage.getNotification().getBody());
        }
    }
}
