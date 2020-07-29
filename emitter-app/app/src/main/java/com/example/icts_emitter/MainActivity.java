package com.example.icts_emitter;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;

import android.bluetooth.BluetoothAdapter;
import android.bluetooth.le.AdvertiseCallback;
import android.bluetooth.le.AdvertiseData;
import android.bluetooth.le.AdvertiseSettings;
import android.bluetooth.le.BluetoothLeAdvertiser;
import android.os.Bundle;
import android.os.ParcelUuid;
import android.util.Log;
import android.widget.TextView;

import com.google.android.gms.tasks.OnCompleteListener;
import com.google.android.gms.tasks.Task;
import com.google.firebase.iid.FirebaseInstanceId;
import com.google.firebase.iid.InstanceIdResult;

import java.util.UUID;

public class MainActivity extends AppCompatActivity {
    private String BLE_ID = "TODO"; //TODO get the id from firebase
    private BluetoothLeAdvertiser advertiser;
    private boolean advertiserIsRunning = false;
    private AdvertiseCallback BLECallback = new AdvertiseCallback() {
        @Override
        public void onStartFailure(int errCode){
            Log.d("AdvertiseCallback", "Advertiser failed starting with code "+errCode);
            ((TextView) findViewById(R.id.default_textview)).setText("Advertiser failed starting");
            super.onStartFailure(errCode);
        }

        @Override
        public void onStartSuccess(AdvertiseSettings settingsInEffect){
            Log.d("AdvertiseCallback", "Advertiser started successfully");
            ((TextView) findViewById(R.id.default_textview)).setText("ALL OK");
            super.onStartSuccess(settingsInEffect);
        }
    };

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        getDeviceToken();
    }


    @Override
    protected void onStart(){
        super.onStart();
        if(advertiserIsRunning) return;

        if (BluetoothAdapter.getDefaultAdapter() == null)
            ((TextView) findViewById(R.id.default_textview)).setText("Not supported");
        else {
            advertiser = BluetoothAdapter.getDefaultAdapter().getBluetoothLeAdvertiser();
            if(advertiser == null)
                ((TextView) findViewById(R.id.default_textview)).setText("Please turn on the Bluetooth");
            else {
                startBLE();
                ((TextView) findViewById(R.id.default_textview)).setText("BLE advertising is running");
            }
        }
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        stopBLE();
    }

    private void getDeviceToken() {
        FirebaseInstanceId.getInstance().getInstanceId()
                .addOnCompleteListener(new OnCompleteListener<InstanceIdResult>() {
                    @Override
                    public void onComplete(@NonNull Task<InstanceIdResult> task) {
                        if (!task.isSuccessful()) {
                            Log.w("TOKEN", "getInstanceId failed", task.getException());
                            return;
                        }

                        // Get new Instance ID token
                        String deviceToken = task.getResult().getToken();
                        Log.d("TOKEN", deviceToken);
                        //TODO: send it to firebase
                    }
                });
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
                .addServiceData(pUUID, BLE_ID.getBytes())
                .build();

        advertiser.startAdvertising(settings, data, BLECallback);
        advertiserIsRunning = true;
    }

    private void stopBLE() {
        if(advertiserIsRunning)
            advertiser.stopAdvertising(BLECallback);
        advertiserIsRunning = false;
    }
}