import React, { Component } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';

import firebase from 'firebase';

export default class LoadingScreen extends Component {
    render() {
        return (
            <View style={styles.container}>
                <ActivityIndicator size='large' />
            </View>
        )
    }

    componentDidMount() {
        this.checkIfLoggedIn();
    }

    checkIfLoggedIn = () => {
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                this.props.navigation.navigate('DashboardScreen');
            } else {
                this.props.navigation.navigate('LoginScreen');
            }
        });
    };
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    }
})