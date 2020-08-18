package com.example.icts_emitter;
import android.content.Context;
import android.util.Log;
import androidx.annotation.NonNull;
import com.google.android.gms.tasks.OnFailureListener;
import com.google.android.gms.tasks.OnSuccessListener;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.firestore.FirebaseFirestore;
import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;

import java.util.Objects;

import static com.example.icts_emitter.SharedPreferencesStore.FCM;
import static com.example.icts_emitter.SharedPreferencesStore.USER_COLLECTION;

public class NotificationService extends FirebaseMessagingService {
    private static final String TAG = "NotificationService";


    @Override
    public void onNewToken(String token) {
        Log.d("new token ", "Refreshed token: " + token);
        SharedPreferencesStore.setFcm(getApplicationContext(),token);
        sendRegistrationTokenToServer(getApplicationContext(),token);
    }

    @Override
    public void onMessageReceived(RemoteMessage remoteMessage){
        Log.d("MessageReceived", "From: " + remoteMessage.getFrom());
        // Check if message contains a notification payload.
        if (remoteMessage.getNotification() != null) {
            Log.d("MessageReceived", "Message Notification Body: " + remoteMessage.getNotification().getBody());
        }
    }


    public static void sendRegistrationTokenToServer(Context context,String token){
        String longUid = Objects.requireNonNull(FirebaseAuth.getInstance().getCurrentUser()).getUid();
        FirebaseFirestore.getInstance().collection(USER_COLLECTION)
                .document(longUid)
                .update(FCM,token)
                .addOnSuccessListener(new OnSuccessListener<Void>() {
                    @Override
                    public void onSuccess(Void aVoid) {
                        Log.d(TAG, "DocumentSnapshot successfully written!");
                    }
                })
                .addOnFailureListener(new OnFailureListener() {
                    @Override
                    public void onFailure(@NonNull Exception e) {
                        Log.w(TAG, "Error writing document", e);
                    }
                });
    }

}
