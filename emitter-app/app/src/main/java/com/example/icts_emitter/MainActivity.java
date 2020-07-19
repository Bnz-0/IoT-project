package com.example.icts_emitter;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;

import android.bluetooth.le.AdvertiseCallback;
import android.bluetooth.le.AdvertiseData;
import android.bluetooth.le.AdvertiseSettings;
import android.bluetooth.le.AdvertisingSetCallback;
import android.bluetooth.le.BluetoothLeAdvertiser;
import android.os.Bundle;
import android.os.ParcelUuid;
import android.util.Log;

import com.google.android.gms.tasks.OnCompleteListener;
import com.google.android.gms.tasks.Task;
import com.google.firebase.iid.FirebaseInstanceId;
import com.google.firebase.iid.InstanceIdResult;

import java.util.UUID;

public class MainActivity extends AppCompatActivity {
    private String BLE_ID = "TODO"; //TODO get the id from firebase
    private BluetoothLeAdvertiser BLE;
    private AdvertiseCallback BLECallback = new AdvertiseCallback() {
        @Override
        public void onStartFailure(int errCode){
            Log.d("AdvertiseCallback", "Advertiser failed starting with code "+errCode);
            super.onStartFailure(errCode);
        }

        @Override
        public void onStartSuccess(AdvertiseSettings settingsInEffect){
            Log.d("AdvertiseCallback", "Advertiser started successfully");
            super.onStartSuccess(settingsInEffect);
        }
    };

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        getDeviceToken();
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
        AdvertiseSettings settings = new AdvertiseSettings.Builder()
                .setAdvertiseMode(AdvertiseSettings.ADVERTISE_MODE_LOW_POWER)
                .setConnectable(false)
                .setTxPowerLevel(AdvertiseSettings.ADVERTISE_TX_POWER_LOW)
                //.setTimeout(0)
                .build();

        ParcelUuid pUUID = new ParcelUuid( UUID.fromString(getString(R.string.uuid)));
        AdvertiseData data = new AdvertiseData.Builder()
                .setIncludeDeviceName(false)
                .addServiceUuid(pUUID)
                .addServiceData(pUUID, BLE_ID.getBytes())
                .build();

        BLE.startAdvertising(settings, data, BLECallback);
    }

    private void stopBLE() {
        BLE.stopAdvertising(BLECallback);
    }
}