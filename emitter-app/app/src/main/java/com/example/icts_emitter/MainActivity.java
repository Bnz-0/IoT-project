package com.example.icts_emitter;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.le.AdvertiseCallback;
import android.bluetooth.le.AdvertiseData;
import android.bluetooth.le.AdvertiseSettings;
import android.bluetooth.le.BluetoothLeAdvertiser;
import android.content.Intent;
import android.os.Bundle;
import android.os.ParcelUuid;
import android.util.Log;
import android.view.View;
import android.widget.TextView;
import com.google.android.gms.tasks.OnCompleteListener;
import com.google.android.gms.tasks.Task;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseUser;
import com.google.firebase.firestore.DocumentReference;
import com.google.firebase.firestore.DocumentSnapshot;
import com.google.firebase.firestore.FirebaseFirestore;
import java.util.Objects;
import java.util.UUID;
import static com.example.icts_emitter.SharedPreferencesStore.USERDI2;
import static com.example.icts_emitter.SharedPreferencesStore.USER_COLLECTION;

public class MainActivity extends AppCompatActivity {
    private static final String TAG = "MainActivity";
    private String id2;
    private String fcm;
    private BluetoothLeAdvertiser advertiser;
    private boolean advertiserIsRunning = false;


    private AdvertiseCallback BLECallback = new AdvertiseCallback() {
        @Override
        public void onStartFailure(int errCode){
            //Log.d("AdvertiseCallback", "Advertiser failed starting with code "+errCode);
            setUiMsg("Advertiser failed starting");
            super.onStartFailure(errCode);
        }

        @Override
        public void onStartSuccess(AdvertiseSettings settingsInEffect){
            //Log.d("AdvertiseCallback", "Advertiser started successfully");
            setUiMsg("ALL OK");
            super.onStartSuccess(settingsInEffect);
        }
    };

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
    }

    @Override
    protected void onStart(){
        super.onStart();
        id2 = SharedPreferencesStore.getUserId2(getApplicationContext());
        fcm = SharedPreferencesStore.getFcm(getApplicationContext());
        if(id2 == null){
            FirebaseUser user = FirebaseAuth.getInstance().getCurrentUser();
            if(user == null) return;
            retrieveId2(user.getUid());
            return;
        }
        startItcsEmitter();
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        stopBLE();
    }

    private void startItcsEmitter() {
        if(!advertiserIsRunning) { //start the advertiser
            if (BluetoothAdapter.getDefaultAdapter() == null)
                setUiMsg("Not supported");
            else {
                advertiser = BluetoothAdapter.getDefaultAdapter().getBluetoothLeAdvertiser();
                if(advertiser == null)
                    setUiMsg("Please turn on the Bluetooth");
                else {
                    startBLE();
                    setUiMsg("BLE advertising is running");
                }
            }
        }
    }

    private void setUiMsg(String msg) {
        ((TextView) findViewById(R.id.default_textview)).setText(msg);
    }

    private void startBLE() {
        if(advertiserIsRunning) return;

        AdvertiseSettings settings = new AdvertiseSettings.Builder()
                .setAdvertiseMode(AdvertiseSettings.ADVERTISE_MODE_LOW_POWER)
                .setConnectable(true)
                .setTxPowerLevel(AdvertiseSettings.ADVERTISE_TX_POWER_LOW)
                .setTimeout(0)
                .build();

        ParcelUuid pUUID = new ParcelUuid(UUID.fromString(getString(R.string.uuid)));
        AdvertiseData data = new AdvertiseData.Builder()
                .setIncludeDeviceName(false)
          //      .addServiceUuid(pUUID)
                .addServiceData(pUUID, id2.getBytes())
                .build();

        advertiser.startAdvertising(settings, data, BLECallback);
        advertiserIsRunning = true;
    }

    private void stopBLE() {
        if(advertiserIsRunning)
            advertiser.stopAdvertising(BLECallback);
        advertiserIsRunning = false;
    }

    public void startLogInActivity(View v){
        Intent i = new Intent(MainActivity.this, AuthActivity.class);
        MainActivity.this.startActivity(i);
    }



    private void retrieveId2(String longUid){
        DocumentReference docRef = FirebaseFirestore.getInstance().collection(USER_COLLECTION).document(longUid);
        docRef.get().addOnCompleteListener(new OnCompleteListener<DocumentSnapshot>() {
            @Override
            public void onComplete(@NonNull Task<DocumentSnapshot> task) {
                if (task.isSuccessful()) {
                    DocumentSnapshot document = task.getResult();
                    if (document.exists()) {
                        Log.d(TAG, "DocumentSnapshot data: " + document.getData());
                        id2 = document.getString(USERDI2);
                        SharedPreferencesStore.setUserId2(getApplicationContext(),id2);
                        startItcsEmitter();
                    } else {
                        Log.d(TAG, "No such document id2");
                    }
                } else {
                    Log.d(TAG, "get failed with ", task.getException());
                }
            }
        });
    }


}








/*comment

    private void getDeviceToken() {
        FirebaseInstanceId.getInstance().getInstanceId()
                .addOnCompleteListener(new OnCompleteListener<InstanceIdResult>() {
                    @Override
                    public void onComplete(@NonNull Task<InstanceIdResult> task) {
                        if (!task.isSuccessful()) {
                            Log.w("TOKEN", "getInstanceId failed", task.getException());
                            return;
                        }

                        // Get new Instance ID token (FCM) and UID
                        final HashMap<String, String> params = new HashMap<String, String>();
                        params.put("FCM", task.getResult().getToken());
                        //params.put("UID", FirebaseAuth.getInstance().getCurrentUser().getUid());
                        // TODO: getCurrentUser() returns null if the user isn't logged

                        Log.d("FCM", params.get("FCM"));
                        //Log.d("UID", params.get("UID"));
                        ID2 = "aaa";
                        startItcsEmitter();
                        /*
                        // Instantiate the RequestQueue.
                        RequestQueue volleyQueue = Volley.newRequestQueue(context);
                        JsonObjectRequest request = new JsonObjectRequest(Request.Method.POST, getString(R.string.API_url), new JSONObject(params),
                            new Response.Listener<JSONObject>() {
                                @Override
                                public void onResponse(JSONObject response) {
                                    Log.d("Volley", "Response is: "+response.toString());
                                    try {
                                        ID2 = response.getString("uid2");
                                    }
                                    catch (JSONException e) {
                                        Log.w("Volley", "Retrieving of uid2 fails: the response is "+response.toString());
                                        setUiMsg("Retrieving of uid2 fails");
                                    }
                                    startItcsEmitter();
                                }
                            },
                            new Response.ErrorListener() {
                                @Override
                                public void onErrorResponse(VolleyError error) {
                                    Log.w("Volley", "Retrieving of uid2 fails: "+error.toString());
                                    setUiMsg("Retrieving of uid2 fails, status code:"+error.networkResponse.statusCode);
                                }
                            });

                        volleyQueue.add(request);
                        */
                   /* comment


                   }
                            });
                            }

                      comment      */