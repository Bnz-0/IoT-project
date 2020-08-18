package com.example.icts_emitter;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;

import android.content.Context;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.EditText;
import android.widget.Toast;
import com.google.android.gms.tasks.OnCompleteListener;
import com.google.android.gms.tasks.OnFailureListener;
import com.google.android.gms.tasks.OnSuccessListener;
import com.google.android.gms.tasks.Task;
import com.google.firebase.auth.AuthResult;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.firestore.FirebaseFirestore;
import java.util.HashMap;
import java.util.Map;
import static com.example.icts_emitter.SharedPreferencesStore.FCM;
import static com.example.icts_emitter.SharedPreferencesStore.USERDI2;
import static com.example.icts_emitter.SharedPreferencesStore.USER_COLLECTION;

public class AuthActivity extends AppCompatActivity {
    private static final String TAG = "LogInActivity";
    private FirebaseAuth mAuth;
    private EditText emailEditText;
    private EditText passwordEditText;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_log_in2);
        emailEditText = (EditText)findViewById(R.id.editTextTextEmailAddress);
        passwordEditText = (EditText)findViewById(R.id.editTextTextPassword);
        mAuth = FirebaseAuth.getInstance();
    }


    public void register(View v){
        mAuth.createUserWithEmailAndPassword(emailEditText.getText().toString(),passwordEditText.getText().toString())
                .addOnCompleteListener(this, new OnCompleteListener<AuthResult>() {
                    @Override
                    public void onComplete(@NonNull Task<AuthResult> task) {
                        if (task.isSuccessful()) {
                            Log.d(TAG, "createUserWithEmail:success");
                            Toast.makeText(AuthActivity.this, "Registration success.",
                                    Toast.LENGTH_SHORT).show();
                            //mAuth.getCurrentUser();
                            //create document for user
                            createUserDocument(mAuth.getUid());
                            finish();
                        } else {
                            // If sign in fails, display a message to the user.
                            Log.w(TAG, "createUserWithEmail:failure", task.getException());
                            Toast.makeText(AuthActivity.this, "Authentication failed.",
                                    Toast.LENGTH_SHORT).show();
                        }
                    }
                });
    }


    public void logIn(View v){
        mAuth.signInWithEmailAndPassword(emailEditText.getText().toString(),passwordEditText.getText().toString())
                .addOnCompleteListener(this, new OnCompleteListener<AuthResult>() {
                    @Override
                    public void onComplete(@NonNull Task<AuthResult> task) {
                        if (task.isSuccessful()) {
                            Log.d(TAG, "signInWithEmail:success");
                            Toast.makeText(AuthActivity.this, "Log in  success.",
                                    Toast.LENGTH_SHORT).show();
                           // FirebaseUser user = mAuth.getCurrentUser();
                            Context c = getApplicationContext();
                            NotificationService.sendRegistrationTokenToServer(c,SharedPreferencesStore.getFcm(c));
                            finish();
                        } else {
                            // If sign in fails, display a message to the user.
                            Log.w(TAG, "signInWithEmail:failure", task.getException());
                            Toast.makeText(AuthActivity.this, "Authentication failed.",
                                    Toast.LENGTH_SHORT).show();
                        }
                    }
                });
    }

    /* for future development*/
    public void logOut() {
        mAuth.signOut();
        //updateUI(null);
    }


    // temporaneo. Sarebbe figo usare una function per generare lo userId2
    static int i=1;
    public String retrieveNewUserId2(){
        return String.valueOf(i);
    }

    public void createUserDocument(String longUid){
        String userId2 = retrieveNewUserId2();
        SharedPreferencesStore.setUserId2(getApplicationContext(),userId2);
        Map<String, Object> userDoc = new HashMap<>();
        userDoc.put(FCM,SharedPreferencesStore.getFcm(getApplicationContext()));
        userDoc.put(USERDI2,userId2);
        FirebaseFirestore.getInstance().collection(USER_COLLECTION).document(longUid)
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
    }
}