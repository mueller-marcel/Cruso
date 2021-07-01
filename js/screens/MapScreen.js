import React, { Component } from 'react';
import { StyleSheet, ActivityIndicator, View, TouchableOpacity, Text, Linking } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import * as Location from 'expo-location';

import RoundButton from '../components/Helpers/RoundButton';
import Firebase from '../Firebase';
import firebase from 'firebase';

export default class MapScreen extends Component {
    state = { isLoaded: false, showAskForPermissionButton: false, initialRegion: {}, userData: {} };
    render() {
        if (!this.state.isLoaded) {
            return (
                < View style={styles.container} >
                    <ActivityIndicator size='large' />
                </View >
            );
        }
        else if (this.state.showAskForPermissionButton) {
            return (
                <View style={styles.container}>
                    <Text
                        style={{ textAlign: 'center' }}>Um die Karte nutzen zu können, muss der Standortzugriff in den Einstellungen erlaubt werden. Im Anschluss muss die App neu gestartet werden.</Text>
                    <TouchableOpacity style={[styles.btnGreen]} onPress={() => Linking.openSettings()}>
                        <Text style={{ color: 'white' }}>Zu den Einstellungen</Text>
                    </TouchableOpacity>
                </View>
            );
        }
        return (
            <View style={styles.container}>
                <MapView
                    style={{ width: '100%', height: '100%' }}
                    initialRegion={this.state.initialRegion}
                    showsUserLocation={true}
                >
                    {this.renderMarker()}
                </MapView>
                <View style={{ position: 'absolute', paddingTop: '10%', paddingRight: '85%' }}>
                    <RoundButton onPress={() => this.updateData()} icon='refresh-cw' />
                </View>
            </View>

        );
    }

    updateData = async () => {
        this.setState({
            userData: await this.retrieveData()
        })
    }

    renderMarker = () => {
        const journeys = this.state.userData.journeys;
        let markers = [];
        let directions = [];
        let markerIndex = 0;
        let directionIndex = 1000;
        journeys.forEach((journey) => {
            const highlights = journey.highlight;
            highlights.forEach((highlight) => {
                markers.push(
                    <Marker
                        key={markerIndex}
                        title={highlight.headline}
                        description={highlight.description}
                        coordinate={{ latitude: highlight.latitude, longitude: highlight.longitude }}
                        pinColor={'green'}
                    />
                )
                markerIndex++;
            })
            const routes = journey.route;
            routes.forEach((route, routeIndex) => {
                const pointes = route.point;
                pointes.forEach((point, pointIndex) => {
                    if (pointIndex === 0 || pointIndex === pointes.length - 1) {
                        markers.push(
                            <Marker
                                key={markerIndex}
                                coordinate={{ latitude: point.latitude, longitude: point.longitude }}
                                pinColor={this.getPinColor(routeIndex)}

                            />
                        )
                    }
                    if (pointIndex !== 0) {
                        directions.push(
                            <MapViewDirections
                                key={directionIndex}
                                origin={{ latitude: pointes[pointIndex - 1].latitude, longitude: pointes[pointIndex - 1].longitude }}
                                destination={{ latitude: point.latitude, longitude: point.longitude }}
                                apikey={'AIzaSyBhNB5WvtU-WA535GzAcFDn3ajWv_vQzPw'}
                                strokeWidth={3}
                                strokeColor={this.getPinColor(routeIndex)}
                            />
                        )
                    }
                    markerIndex++;
                    directionIndex++;
                })
            })
        })
        directions.forEach((direction) => {
            markers.push(direction);
        })
        return markers;
    }

    getPinColor = (routeIndex) => {
        colors = ['red', 'orange', 'green', 'blue', 'black', 'purple'];
        return colors[routeIndex % colors.length];
    }

    componentDidMount = async () => {
        try {
            const userData = await this.retrieveData();
            this.setState({ userData });
            await this.askForLocationPermission();
            this.renderMarker();
        } catch (err) {
            console.log("Error1:" + err);
        }
    }

    askForLocationPermission = async () => {
        const { status } = await Location.requestPermissionsAsync();
        if (status !== 'granted') {
            this.setState({ isLoaded: true, showAskForPermissionButton: true });
        } else {
            let currentLocation = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
            initialRegion = {
                latitude: currentLocation.coords.latitude,
                longitude: currentLocation.coords.longitude,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421
            }
            this.setState({ initialRegion, isLoaded: true });
        }
    }

    retrieveData = async () => {
        let userData;
        let currentUser = firebase.auth().currentUser;
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
        backgroundColor: '#fff',
        alignItems: 'center',
    },
    btnGreen: {
        width: "80%",
        backgroundColor: "#097770",
        borderRadius: 25,
        height: 50,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 10,
        marginTop: 30
    }
})