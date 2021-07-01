import React, { Component } from 'react';
import { View, Text, SafeAreaView, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Linking, Alert } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

import { renderTimestamp } from '../../RenderHelper';

import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';

export default class NewPoint extends Component {
    state = {
        latitude: null,
        longitude: null,
        initialRegion: {},
        isLoaded: false,
        showAskForPermissionButton: false,
        IsArrivalTimeClicked: false,
        displayArrivalTime: this.props.route.params.action === 'add' ? null : renderTimestamp(this.props.route.params.point.timestamp),
        arrivalTime: this.props.route.params.action === 'add' ? null : this.props.route.params.point.timestamp
    }
    render() {
        if (!this.state.isLoaded) {
            return (
                < View style={[styles.container, { justifyContent: 'center' }]} >
                    <ActivityIndicator size='large' />
                </View >
            );
        }
        else if (this.state.showAskForPermissionButton) {
            return (
                <View style={[styles.container, { justifyContent: 'center' }]}>
                    <View style={{ width: '80%' }}>

                        <Text
                            style={{ textAlign: 'center' }}>Um Punkte setzen zu können, muss der Standortzugriff in den Einstellungen erlaubt werden. Im Anschluss muss die App neu gestartet werden.
                    </Text>
                    </View>
                    <View style={{ paddingTop: '5%', width: '100%', alignItems: 'center' }}>
                        <TouchableOpacity style={styles.btnGreen} onPress={() => Linking.openSettings()}>
                            <Text style={{ color: 'white' }}>Zu den Einstellungen</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            );
        }
        return (
            <SafeAreaView style={styles.container}>
                <View style={{ paddingTop: '3%', paddingRight: '20%' }}>
                    <Text style={{ fontSize: 32, fontWeight: 'bold' }}>{this.props.route.params.action === 'add' ? 'Punkt hinzufügen' : 'Punkt bearbeiten'}</Text>
                </View>
                {/* <View style={[styles.inputView, { marginTop: '5%' }]} >
                    <TextInput
                        editable={false}
                        style={styles.inputText}
                        placeholder={'Breitengrad'}
                        placeholderTextColor='#003f5c'
                        onChangeText={text => this.setState({ latitude: text })}
                    >
                        {this.state.latitude}
                    </TextInput>
                </View>
                <View style={[styles.inputView, { marginTop: '2%' }]} >
                    <TextInput
                        editable={false}
                        style={styles.inputText}
                        placeholder={'Längengrad'}
                        placeholderTextColor='#003f5c'
                        onChangeText={text => this.setState({ longitude: text })}
                    >
                        {this.state.longitude}
                    </TextInput>
                </View> */}

                <View style={{ width: '80%', height: '50%', paddingTop: '5%' }}>
                    <MapView
                        ref={map => { this.mapRef = map }}
                        style={styles.map}
                        initialRegion={this.state.initialRegion}
                        showsUserLocation={true}
                        onPress={(e) => {
                            this.setState({ latitude: e.nativeEvent.coordinate.latitude, longitude: e.nativeEvent.coordinate.longitude });
                            this.mapRef.animateToRegion({
                                latitude: e.nativeEvent.coordinate.latitude,
                                longitude: e.nativeEvent.coordinate.longitude,
                                latitudeDelta: this.mapRef.latitudeDelta,
                                longitudeDelta: this.mapRef.longitudeDelta
                            }, 400)
                        }}
                    >
                        {this.renderMarker()}
                    </MapView>
                </View>
                <View style={[styles.inputView, { marginTop: '3%' }]}>
                    <TouchableOpacity onPress={() => this.setState({ IsArrivalTimeClicked: true })} >
                        <TextInput
                            style={styles.inputText}
                            editable={false}
                            placeholder='Datum'
                            placeholderTextColor='#003f5c'
                            pointerEvents="none">{this.state.displayArrivalTime}
                        </TextInput>
                    </TouchableOpacity>
                </View>
                <View style={{ width: '100%', alignItems: 'center', paddingTop: '4%' }}>
                    <TouchableOpacity style={styles.btnGreen} onPress={() => {
                        this.setState({ latitude: this.state.initialRegion.latitude, longitude: this.state.initialRegion.longitude });
                        this.mapRef.animateToRegion({
                            latitude: this.state.initialRegion.latitude,
                            longitude: this.state.initialRegion.longitude,
                            latitudeDelta: this.mapRef.latitudeDelta,
                            longitudeDelta: this.mapRef.longitudeDelta
                        }, 400)
                    }}
                    >
                        <Text style={{ color: 'white' }}>{this.props.route.params.action === 'add' ? 'Aktueller Standort' : 'Ursprünglicher Standort'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.btnGreen} onPress={() => this.saveNewPoint()}>
                        <Text style={{ color: 'white' }}>Speichern</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.btnGreen} onPress={() => { this.props.navigation.goBack(); }}>
                        <Text style={{ color: 'white' }}>Abbrechen</Text>
                    </TouchableOpacity>
                </View>
                <DateTimePickerModal
                    isVisible={this.state.IsArrivalTimeClicked}
                    onConfirm={this.confirmDateModal}
                    onCancel={() => this.setState({ IsArrivalTimeClicked: false })}
                    headerTextIOS={"Ankunftszeit"}
                    cancelTextIOS={"Abbrechen"}
                    confirmTextIOS={"Datum einstellen"}
                    mode={"datetime"} />
            </SafeAreaView>
        )
    }

    saveNewPoint = () => {
        if (this.state.arrivalTime === null) {
            Alert.alert('Das Datum muss eingetragen werden.', 'Bitte prüfe deine Eingaben.');
            return;
        }
        if (this.props.route.params.action === 'add') {
            let newPoint = {
                latitude: this.state.latitude,
                longitude: this.state.longitude,
                timestamp: this.state.arrivalTime
            }
            this.props.route.params.onNewPoint(newPoint);
        }
        else if (this.props.route.params.action === 'edit') {
            let editedPoint = {
                latitude: this.state.latitude,
                longitude: this.state.longitude,
                timestamp: this.state.arrivalTime
            }
            this.props.route.params.onEditPoint(this.props.route.params.index, editedPoint);
        }
        this.props.navigation.goBack();
    }

    renderMarker = () => {
        return (
            <Marker
                coordinate={{ latitude: this.state.latitude, longitude: this.state.longitude }}
            />
        )
    }

    componentDidMount = async () => {
        try {
            await this.askForLocationPermission();
        } catch (err) {
            console.log('Error: ' + err);
        }
    }

    askForLocationPermission = async () => {
        const { status } = await Location.requestPermissionsAsync();
        if (status !== 'granted') {
            this.setState({ isLoaded: true, showAskForPermissionButton: true });
        } else {
            if (this.props.route.params.action === 'add') {
                let currentLocation = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
                initialRegion = {
                    latitude: currentLocation.coords.latitude,
                    longitude: currentLocation.coords.longitude,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421
                }
            }
            else if (this.props.route.params.action === 'edit') {
                initialRegion = {
                    latitude: this.props.route.params.point.latitude,
                    longitude: this.props.route.params.point.longitude,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421
                }
            }
            this.setState({ initialRegion, isLoaded: true, latitude: initialRegion.latitude, longitude: initialRegion.longitude });

        }
    }

    confirmDateModal = (date) => {

        // Destructure state, parse date & build time string to display
        const { IsArrivalTimeClicked } = this.state;
        var parsedDate = new Date(date);

        // Update state and deactivate date time modal
        if (IsArrivalTimeClicked) {
            this.setState({ arrivalTime: parsedDate.getTime(), IsArrivalTimeClicked: false, displayArrivalTime: this.buildTimeString(parsedDate) });
        }
    }

    buildTimeString = (parsedDate) => {
        let minutes;

        // Fill minutes up minutes with a capital 0 if its only one digit
        if (parsedDate.getMinutes().toString().length === 1) {
            minutes = `0${parsedDate.getMinutes()}`;
        }
        else {
            minutes = parsedDate.getMinutes();
        }

        // Build string in format DD.MM.YYYY HH:MM
        let timeString = `${parsedDate.getDate()}.${parsedDate.getMonth()}.${parsedDate.getFullYear()} ${parsedDate.getHours()}:${minutes}`;
        return timeString;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
    },
    inputView: {
        width: "80%",
        backgroundColor: "#a9c0a6",
        borderRadius: 25,
        height: 50,
        justifyContent: "center",
        padding: 20
    },
    inputText: {
        height: 50,
        color: "white"
    },
    map: {
        height: '100%',
        width: '100%',
        borderRadius: 25
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