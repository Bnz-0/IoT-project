package com.example.icts_emitter;

import android.content.Context;
import android.util.Log;

import com.google.firebase.iid.FirebaseInstanceId;

import static android.content.Context.MODE_PRIVATE;

public class SharedPreferencesStore {
    public static final String USER_COLLECTION="users";
    public static final String FCM="fcm";
    public static final String USERDI2="userId2";
    private static final String TAG = "SharedPref";


    public static String getFcm(Context context) {
         String fcm = context.getSharedPreferences("_", MODE_PRIVATE).getString(FCM, null);
         if(fcm == null){
             fcm = FirebaseInstanceId.getInstance().getToken();
             setFcm(context,fcm);
         }
        Log.d(TAG, fcm);
        return fcm;
    }

    public static String getUserId2(Context context) {
        return context.getSharedPreferences("_", MODE_PRIVATE).getString(USERDI2, null);
    }

    public static void setUserId2(Context context,String userId2){
        context.getSharedPreferences("_", MODE_PRIVATE).edit().putString(USERDI2, userId2).apply();
    }


    public static void setFcm(Context context,String token) {
        context.getSharedPreferences("_", MODE_PRIVATE).edit().putString(FCM, token).apply();
    }

}
