import React, { Component } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Modal, Alert, SafeAreaView } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import firebase from 'firebase';
import Firebase from '../../Firebase';

/**
 * Definition of a component to display the modal for the sign up process
 */
export default class SignUp extends Component {
    state = { signUpFirstName: "", signUpLastName: "", signUpEmail: "", signUpPassword: "", signUpPasswordRepeat: "" };
    render() {
        let { visible, onCancel } = this.props;
        if (!visible) { return null; }
        return (
            <Modal
                animationType={'slide'}
                transparent={false}
                visible={visible}
                onRequestClose={() => onCancel()}
            >
                <SafeAreaView>
                    <KeyboardAwareScrollView
                        innerRef={ref => { this.scroll = ref }}
                    >
                        <View style={styles.container}>
                            <Text style={styles.logo}>Account erstellen</Text>
                            <View style={styles.inputView} >
                                <TextInput
                                    style={styles.inputText}
                                    placeholder='Vorname'
                                    placeholderTextColor='#003f5c'
                                    onChangeText={(signUpFirstName) => this.setState({ signUpFirstName: signUpFirstName })} />
                            </View>
                            <View style={styles.inputView} >
                                <TextInput
                                    style={styles.inputText}
                                    placeholder='Nachname'
                                    placeholderTextColor='#003f5c'
                                    onChangeText={(signUpLastName) => this.setState({ signUpLastName: signUpLastName })} />
                            </View>
                            <View style={styles.inputView} >
                                <TextInput
                                    style={styles.inputText}
                                    placeholder='E-Mail'
                                    placeholderTextColor='#003f5c'
                                    onChangeText={(signUpEmail) => this.setState({ signUpEmail: signUpEmail })} />
                            </View>
                            <View style={styles.inputView} >
                                <TextInput
                                    secureTextEntry
                                    style={styles.inputText}
                                    placeholder='Passwort'
                                    placeholderTextColor='#003f5c'
                                    onChangeText={(signUpPassword) => this.setState({ signUpPassword: signUpPassword })} />
                            </View>
                            <View style={styles.inputView} >
                                <TextInput
                                    secureTextEntry
                                    style={styles.inputText}
                                    placeholder='Passwort wiederholen'
                                    placeholderTextColor='#003f5c'
                                    onChangeText={(signUpPasswordRepeat) => this.setState({ signUpPasswordRepeat: signUpPasswordRepeat })} />
                            </View>
                            <TouchableOpacity style={styles.btnWithoutDistance} onPress={() => {
                                this.signUpWithEmailAndPassword(this.state.signUpEmail, this.state.signUpPassword, this.state.signUpPasswordRepeat, this.state.signUpFirstName, this.state.signUpLastName)
                            }}>
                                <Text style={{ color: 'white' }}>Account erstellen</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.btnWithoutDistance} onPress={() => onCancel()}>
                                <Text style={{ color: 'white' }}>Abbrechen</Text>
                            </TouchableOpacity>
                        </View>
                    </KeyboardAwareScrollView>
                </SafeAreaView>
            </Modal >
        )
    }

    /**
     * Performs the sign up using email and password
     * @param {string} email email of the new user
     * @param {string} password password of the new user
     * @param {string} passwordRepeat repeated password of the new user
     * @param {string} firstName firstname of the new user
     * @param {string} lastName lastname of the new user
     * @returns void
     */
    signUpWithEmailAndPassword = async (email, password, passwordRepeat, firstName, lastName) => {
        try {
            if (password.length < 6) {
                Alert.alert('Passwort zu kurz.', 'Das Passwort muss mindestens sechs Zeichen lang sein.');
                return;
            }
            if (password !== passwordRepeat) {
                Alert.alert('Passwörter stimmen nicht überein.', 'Bitte prüfen Sie ihre Eingaben.');
                return;
            }
            let saveToFirestore = true;
            const response = await firebase.auth().createUserWithEmailAndPassword(email, password)
                .catch((error) => {
                    switch (error.code) {
                        case 'auth/invalid-email':
                            Alert.alert('Ungügltige E-Mail Adresse.', 'Bitte prüfen Sie Ihre Eingaben.');
                            saveToFirestore = false;
                            break;
                        case 'auth/email-already-in-use':
                            Alert.alert('Diese E-Mail wird bereits verwendet.', 'Bitte benutzen Sie eine andere E-Mail Adresse.');
                            saveToFirestore = false;
                            break;
                    }
                });
            if (saveToFirestore) {
                Firebase.db.collection('users').doc(response.user.uid).set({ mail: email, firstName: firstName, lastName: lastName, firstLogin: Date.now(), userid: response.user.uid, journeys: [] })
            }
        }
        catch (err) {
            Alert.alert('Ein Fehler ist aufgetreten.', 'Bitte prüfen Sie ihre Eingaben.');
        }
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
        fontSize: 35,
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
    btnWithoutDistance: {
        width: "80%",
        backgroundColor: "#097770",
        borderRadius: 25,
        height: 50,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 10
    }
})