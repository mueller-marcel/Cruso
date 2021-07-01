import React, { Component } from 'react';
import { StyleSheet, Text, View, SafeAreaView, Image, TouchableOpacity } from "react-native";

import Firebase from '../Firebase';
import firebase from 'firebase';
import RoundButton from '../components/Helpers/RoundButton';

/**
 * Definition of a component for the settings
 */
export default class SettingsScreen extends Component {
    state = { userData: {}, profilePhoto: "", isLoaded: false };
    render() {
        if (!this.state.isLoaded) {
            return null;
        }
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.profileContainer}>
                    <View style={styles.profileImage}>
                        <Image
                            source={this.state.profilePhoto === '' ? require('../../assets/profilePhoto.png') : { uri: this.state.profilePhoto }}
                            style={styles.image}
                            resizeMode="stretch"
                        />
                    </View>
                    {/* <View style={styles.edit}>
                        <Icon.Ionicons name="ios-pencil" size={26} color="white" style={{ marginTop: 6, marginLeft: 2 }}></Icon.Ionicons>
                    </View> */}
                    <View style={styles.infoContainer}>
                        <Text style={{ fontWeight: "200", fontSize: 34 }}>{this.state.userData.firstName} {this.state.userData.lastName}</Text>
                        <Text style={{ paddingTop: '2%', paddingBottom: '4%' }} >{this.state.userData.mail}</Text>
                    </View>
                </View>


                <View style={styles.statsContainer}>
                    <View style={{ flexDirection: 'row', alignSelf: 'center' }}>
                        <Text style={{ fontSize: 28, alignSelf: 'center', paddingTop: '5%' }}>Deine Statistik</Text>
                        <View style={{ paddingLeft: '5%' }}>
                            <RoundButton onPress={() => this.updateData()} icon='refresh-cw' />
                        </View>
                    </View>
                    <View style={{ width: '100%', height: '45%', flexDirection: 'row', justifyContent: 'space-around', paddingTop: '5%' }}>
                        <View style={{ width: '40%', height: '75%', backgroundColor: '#097770', borderRadius: 25, justifyContent: 'center' }}>
                            <Text style={{ color: 'white', alignSelf: 'center', fontSize: 40 }} >{this.getJourneysCount()}</Text>
                            <Text style={{ color: 'white', alignSelf: 'center' }} >Reisen</Text>
                        </View>
                        <View style={{ width: '40%', height: '75%', backgroundColor: '#097770', borderRadius: 25, justifyContent: 'center' }}>
                            <Text style={{ color: 'white', alignSelf: 'center', fontSize: 40 }} >{this.getRoutesCount()}</Text>
                            <Text style={{ color: 'white', alignSelf: 'center' }} >Routen</Text>
                        </View>
                    </View>
                    <View style={{ width: '100%', height: '45%', flexDirection: 'row', justifyContent: 'space-around' }}>
                        <View style={{ width: '40%', height: '75%', backgroundColor: '#097770', borderRadius: 25, justifyContent: 'center' }}>
                            <Text style={{ color: 'white', alignSelf: 'center', fontSize: 40 }} >{this.getHighlightsCount()}</Text>
                            <Text style={{ color: 'white', alignSelf: 'center' }} >Highlights</Text>
                        </View>
                        <View style={{ width: '40%', height: '75%', backgroundColor: '#097770', borderRadius: 25, justifyContent: 'center' }}>
                            <Text style={{ color: 'white', alignSelf: 'center', fontSize: 40 }} >0</Text>
                            <Text style={{ color: 'white', alignSelf: 'center' }} >Dauer der Reisen</Text>
                        </View>
                    </View>
                </View>
                <TouchableOpacity style={styles.btnLogout} onPress={() => { firebase.auth().signOut() }}>
                    <Text style={{ color: 'white' }}>Abmelden</Text>
                </TouchableOpacity>
            </SafeAreaView >
        );
    }

    updateData = async () => {
        this.setState({
            userData: await this.retrieveData()
        })
    }

    getJourneysCount = () => {
        if (!this.state.userData.journeys) {
            return 0;
        } else {
            return this.state.userData.journeys.length;
        }
    }

    getRoutesCount = () => {
        if (!this.state.userData.journeys) {
            return 0;
        } else {
            const journeys = this.state.userData.journeys;
            let routesCount = 0;
            journeys.forEach((journey) => {
                routesCount += journey.route.length;
            });
            return routesCount;
        }
    }

    getHighlightsCount = () => {
        if (!this.state.userData.journeys) {
            return 0;
        } else {
            const journeys = this.state.userData.journeys;
            let highlightsCount = 0;
            journeys.forEach((journey) => {
                highlightsCount += journey.highlight.length;
                const routes = journey.route;
                routes.forEach((route) => {
                    highlightsCount += route.highlight.length;
                })
            });
            return highlightsCount;
        }
    }

    componentDidMount = async () => {
        const userData = await this.retrieveData();
        this.setState({ userData, isLoaded: true });
    }

    retrieveData = async () => {
        let userData;
        let currentUser = firebase.auth().currentUser;
        if (currentUser.photoURL) { this.setState({ profilePhoto: currentUser.photoURL.toString() }); }
        await Firebase.db.collection('users').where('userid', '==', currentUser.uid)
            .get().then((querySnapshot) => {
                if (querySnapshot.size > 0) {
                    userData = querySnapshot.docs[0].data();
                }
            })
            .catch((error) => {
                console.log("Error2: ", error);
            });
        return userData;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff"
    },
    image: {
        flex: 1,
        height: undefined,
        width: undefined,
    },
    profileImage: {
        width: '32%',
        height: '47%',
        borderRadius: 30,
        overflow: "hidden"
    },
    edit: {
        backgroundColor: "#097770",
        position: "absolute",
        bottom: 85,
        right: 100,
        width: 30,
        height: 30,
        borderRadius: 30,
        alignItems: "center",
        justifyContent: "center"
    },
    infoContainer: {
        alignSelf: "center",
        alignItems: "center",
        paddingTop: '6%'
    },
    statsContainer: {
        alignSelf: 'center',
        borderRadius: 30,
        marginTop: '7%',
        paddingHorizontal: '5%',
        backgroundColor: '#f1f1f1',
        width: '90%',
        height: '47%',
        shadowOffset: { width: 5, height: 5, },
        shadowColor: 'lightgray',
        shadowOpacity: 0.5,
        borderWidth: 1,
        borderColor: '#e9e9e9'
    },
    profileContainer: {
        alignSelf: "center",
        alignItems: 'center',
        paddingTop: '5%',
        width: '90%',
        height: '36%',
        backgroundColor: '#f1f1f1',
        borderRadius: 30,
        shadowOffset: { width: 5, height: 5, },
        shadowColor: 'lightgray',
        shadowOpacity: 0.5,
        borderWidth: 1,
        borderColor: '#e9e9e9'
    },
    btnLogout: {
        alignSelf: 'center',
        width: "90%",
        backgroundColor: "#b23b3b",
        borderRadius: 25,
        height: 50,
        alignItems: "center",
        justifyContent: "center",
        marginTop: '4%'
    }
});