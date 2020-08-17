package com.example.icts_emitter;

import android.content.Context;
import android.util.Log;
import androidx.annotation.NonNull;
import com.google.android.gms.tasks.OnFailureListener;
import com.google.android.gms.tasks.OnSuccessListener;
import com.google.firebase.firestore.FirebaseFirestore;
import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;

public class NotificationService extends FirebaseMessagingService {
    private static final String USER_COLLECTION="users";
    private static final String FCM_FIELD="fcm";
    private static final String TAG = "NotificationService";
    private final FirebaseFirestore db;
    private final String userId2;

    public NotificationService(FirebaseFirestore db,String userId2) {
        this.db = db;
        this.userId2 = userId2;
    }



    @Override
    public void onNewToken(String token) {
        Log.d("new token ", "Refreshed token: " + token);
        getSharedPreferences("_", MODE_PRIVATE).edit().putString(FCM_FIELD, token).apply();
        sendRegistrationTokenToServer(token);
    }

    @Override
    public void onMessageReceived(RemoteMessage remoteMessage){
        Log.d("MessageReceived", "From: " + remoteMessage.getFrom());
        // Check if message contains a notification payload.
        if (remoteMessage.getNotification() != null) {
            Log.d("MessageReceived", "Message Notification Body: " + remoteMessage.getNotification().getBody());
        }
    }

    public static String getToken(Context context) {
        return context.getSharedPreferences("_", MODE_PRIVATE).getString("fb", "empty");
    }

    private void sendRegistrationTokenToServer(String token){
        db.collection(USER_COLLECTION).document(userId2)
                .update(FCM_FIELD,token)
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


    /*
    public void createUserDocument(){
        Map<String, Object> userDoc = new HashMap<>();
        userDoc.put("fcm",getToken(Context));
        db.collection("users").document(userId2)
                .set(userDoc)
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

    }*/

}
