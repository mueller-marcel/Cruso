import React, { Component } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';

import firebase from 'firebase';
import Firebase from '../../Firebase';
import * as Google from 'expo-google-app-auth';

import SignUp from '../../components/login/SignUp';

export default class LoginScreen extends Component {
    state = { email: "", password: "", signUpScreenVisible: false };
    render() {
        return (
            <View style={styles.container}>
                <Text style={styles.logo}>Crusoe</Text>
                <View style={styles.inputView} >
                    <TextInput
                        email-adress
                        style={styles.inputText}
                        placeholder='E-Mail'
                        placeholderTextColor='#003f5c'
                        onChangeText={(email) => this.setState({ email: email })} />
                </View>
                <View style={styles.inputView} >
                    <TextInput
                        secureTextEntry
                        style={styles.inputText}
                        placeholder='Passwort'
                        placeholderTextColor='#003f5c'
                        onChangeText={(password) => this.setState({ password: password })} />
                </View>
                <TouchableOpacity style={[styles.btnGreen, { marginTop: 25 }]} onPress={() => this.loginWithEmailAndPassword(this.state.email, this.state.password)}>
                    <Text style={{ color: 'white' }}>Einloggen</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.btnGreen} onPress={() => this.asignInWithGoogleAsync()}>
                    <Text style={{ color: 'white' }}>Mit Google anmelden</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.btnGreen} onPress={() => { this.setState({ signUpScreenVisible: true }) }}>
                    <Text style={{ color: 'white' }}>Account erstellen</Text>
                </TouchableOpacity>
                <SignUp visible={this.state.signUpScreenVisible} onCancel={() => this.setState({ signUpScreenVisible: false })} />
            </View>
        )
    }

    /**
     * Executed when the user logs in with email and password
     */
    loginWithEmailAndPassword = (email, password) => {
        try {
            firebase.auth().signInWithEmailAndPassword(email, password)
                .catch((error) => {
                    switch (error.code) {
                        case 'auth/user-not-found':
                            Alert.alert('Benutzer nicht gefunden.', 'Bitte prüfen Sie Ihre Eingaben.');
                            break;
                        case 'auth/invalid-email':
                            Alert.alert('Ungügltige E-Mail Adresse.', 'Bitte prüfen Sie Ihre Eingaben.');
                            break;
                        case 'auth/wrong-password':
                            Alert.alert('Falsches Passwort.', 'Bitte prüfen Sie Ihre Eingaben.');
                            break;
                    }
                })
        } catch (error) {
            Alert.alert('Ein Fehler ist aufgetreten.', 'Bitte prüfen Sie ihre Einaben.');
        }
    }

    /**
     * Executed when the user logs in with google
     */
    asignInWithGoogleAsync = async () => {
        try {
            const result = await Google.logInAsync({
                androidClientId: '430195523-m2jq08mfl9nnirs193lj8d3ck0gr9ged.apps.googleusercontent.com',
                iosClientId: '430195523-4h7cfmb9m7d6q7e5el7vjtt1pt1cqu4j.apps.googleusercontent.com',
                scopes: ['profile', 'email'],
            });
            if (result.type === 'success') {
                this.onSignIn(result);
                return result.accessToken;
            } else {
                return { cancelled: true };
            }
        } catch (e) {
            console.log(e);
            alert(e);
            return { error: true };
        }
    }

    /**
     * Executed when user signs up for the app
     */
    onSignIn = (googleUser) => {
        var unsubscribe = firebase.auth().onAuthStateChanged((firebaseUser) => {
            unsubscribe();
            if (!this.isUserEqual(googleUser, firebaseUser)) {
                var credential = firebase.auth.GoogleAuthProvider.credential(
                    googleUser.idToken,
                    googleUser.accessToken
                );
                firebase
                    .auth()
                    .signInWithCredential(credential)
                    .then((result) => {
                        if (result.additionalUserInfo.isNewUser) {
                            Firebase
                                .db
                                .collection('users')
                                .doc(result.user.uid)
                                .set({
                                    userid: result.user.uid,
                                    mail: result.user.email,
                                    firstName: result.additionalUserInfo.profile.given_name,
                                    lastName: result.additionalUserInfo.profile.family_name,
                                    firstLogin: Date.now(),
                                    journeys: []
                                })
                        } else {
                            Firebase
                                .db
                                .collection('users')
                                .update({
                                    lastLogin: Date.now()
                                })
                        }
                    })
                    .catch((error) => {
                        var errorCode = error.code;
                        var errorMessage = error.message;
                        var email = error.email;
                        var credential = error.credential;
                    });
            } else {
                console.log('User already signed-in Firebase.');
            }
        });
    }

    /**
     * Helper method to check if a google and a firebase user are equal
     */
    isUserEqual = (googleUser, firebaseUser) => {
        if (firebaseUser) {
            var providerData = firebaseUser.providerData;
            for (var i = 0; i < providerData.length; i++) {
                if (providerData[i].providerId === firebase.auth.GoogleAuthProvider.PROVIDER_ID &&
                    providerData[i].uid === googleUser.getBasicProfile().getId()) {
                    return true;
                }
            }
        }
        return false;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    logo: {
        fontWeight: "bold",
        fontSize: 50,
        color: "#097770",
        marginBottom: 30
    },
    inputView: {
        width: "80%",
        backgroundColor: "#a9c0a6",
        borderRadius: 25,
        height: 50,
        marginBottom: 20,
        justifyContent: "center",
        padding: 20
    },
    inputText: {
        height: 50,
        color: "white"
    },
    btnGreen: {
        width: "80%",
        backgroundColor: "#097770",
        borderRadius: 25,
        height: 50,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 10
    }
})