package com.example.icts_emitter;

import androidx.appcompat.app.AppCompatActivity;

import android.bluetooth.le.AdvertiseCallback;
import android.bluetooth.le.AdvertiseData;
import android.bluetooth.le.AdvertiseSettings;
import android.bluetooth.le.AdvertisingSetCallback;
import android.bluetooth.le.BluetoothLeAdvertiser;
import android.os.Bundle;
import android.os.ParcelUuid;
import android.util.Log;

import java.util.UUID;

public class MainActivity extends AppCompatActivity {
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
    }

    private void startBLE(){
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
                .addServiceData(pUUID, "TODO".getBytes())
                .build();

        BLE.startAdvertising(settings, data, BLECallback);
    }

    private void stopBLE(){
        BLE.stopAdvertising(BLECallback);
    }
}