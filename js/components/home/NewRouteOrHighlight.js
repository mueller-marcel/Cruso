import React, { Component } from 'react';
import { Text, View, StyleSheet, SafeAreaView, TextInput, TouchableOpacity, Alert, Linking, ActivityIndicator, Image } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import TagInput from 'react-native-tags-input';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import * as ImagePicker from 'expo-image-picker';
import firebase from 'firebase';

import { renderTimestamp } from '../../RenderHelper';
import RoundButton from '../Helpers/RoundButton';

export default class NewRouteOrHighlight extends Component {
    state = {
        headline: this.props.route.params.action === 'add' ? null : this.props.route.params.item.headline,
        description: this.props.route.params.action === 'add' ? null : this.props.route.params.item.description,
        IsArrivalTimeClicked: false,
        IsDepartureTimeClicked: false,
        arrivalTime: this.props.route.params.type === 'route' ? this.props.route.params.action === 'add' ? null : this.props.route.params.item.arrival_timestamp : null,
        departureTime: this.props.route.params.type === 'route' ?
            this.props.route.params.action === 'add' ? null : this.props.route.params.item.departure_timestamp
            :
            this.props.route.params.action === 'add' ? null : this.props.route.params.item.timestamp,
        displayArrivalTime: this.props.route.params.type === 'route' ?
            this.props.route.params.action === 'add' ? '' : renderTimestamp(this.props.route.params.item.arrival_timestamp)
            :
            null,
        displayDepartureTime: this.props.route.params.type === 'route' ?
            this.props.route.params.action === 'add' ? '' : renderTimestamp(this.props.route.params.item.departure_timestamp)
            :
            this.props.route.params.action === 'add' ? '' : renderTimestamp(this.props.route.params.item.timestamp),
        tags: { tag: "", tagsArray: this.props.route.params.action === 'add' ? [] : this.props.route.params.item.tag },
        initialRegion: {},
        isLoaded: false,
        showAskForPermissionButton: false,
        latitude: null,
        longitude: null,
        imageUri: this.props.route.params.type === 'route' ?
            this.props.route.params.action === 'add' ? '' : this.props.route.params.item.preview_picture
            :
            this.props.route.params.action === 'add' ? '' : this.props.route.params.item.picture[0].path,
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
                        <Text style={{ textAlign: 'center' }}>
                            Um Highlights setzen oder bearbeiten zu können, muss der Standortzugriff in den Einstellungen erlaubt werden. Im Anschluss muss die App neu gestartet werden.
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
                <View style={{ paddingRight: '30%', paddingTop: '3%' }}>
                    <Text style={{ fontSize: 32, fontWeight: 'bold' }}>
                        {this.props.route.params.type === 'route' ?
                            this.props.route.params.action === 'add' ? 'Neue Route' : 'Route bearbeiten'
                            :
                            this.props.route.params.action === 'add' ? 'Neues Highlight' : 'Highlight bearbeiten'
                        }
                    </Text>
                </View>
                <KeyboardAwareScrollView innerRef={ref => { this.scroll = ref }} style={styles.scrollView}  >
                    <Image
                        source={this.state.imageUri === '' ? require('../../../assets/placeholder.png') : { uri: this.state.imageUri }}
                        style={styles.image} />
                    <View style={{ flexDirection: 'row', paddingTop: '3%', justifyContent: 'space-evenly' }}>
                        <RoundButton icon="camera" onPress={() => this.takePhoto()} />
                        <RoundButton icon="trash" onPress={() => this.setState({ imageUri: '' })} />
                        <RoundButton icon="image" onPress={() => this.pickPhoto()} />
                    </View>
                    <View style={[styles.inputView, { marginTop: '3%' }]} >
                        <TextInput
                            style={styles.inputText}
                            placeholder={this.props.route.params.type === 'route' ? 'Routenname' : 'Highlightüberschrift'}
                            placeholderTextColor='#003f5c'
                            onChangeText={text => this.setState({ headline: text })}
                        >
                            {this.state.headline}
                        </TextInput>
                    </View>
                    <View style={[styles.inputView, { marginTop: '3%' }]} >
                        <TextInput
                            style={styles.inputText}
                            placeholder='Beschreibung'
                            placeholderTextColor='#003f5c'
                            onChangeText={text => this.setState({ description: text })}
                        >
                            {this.state.description}
                        </TextInput>
                    </View>
                    <View style={[styles.inputView, { marginTop: '3%' }]} >
                        <TouchableOpacity onPress={() => this.setState({ IsDepartureTimeClicked: true })}>
                            <TextInput
                                style={styles.inputText}
                                editable={false}
                                placeholder={this.props.route.params.type === 'route' ? 'Abfahrtzeit' : 'Datum'}
                                placeholderTextColor='#003f5c'
                                pointerEvents="none"
                            >
                                {this.state.displayDepartureTime}
                            </TextInput>
                        </TouchableOpacity>
                    </View>
                    {this.props.route.params.type === 'route' &&
                        <View style={[styles.inputView, { marginTop: '3%' }]} >
                            <TouchableOpacity onPress={() => this.setState({ IsArrivalTimeClicked: true })} >
                                <TextInput
                                    style={styles.inputText}
                                    editable={false}
                                    placeholder='Ankunftszeit'
                                    placeholderTextColor='#003f5c'
                                    pointerEvents="none"
                                >
                                    {this.state.displayArrivalTime}
                                </TextInput>
                            </TouchableOpacity>

                        </View>
                    }
                    {this.props.route.params.type === 'highlight' &&
                        <View style={{ width: '80%', height: 300, paddingTop: '5%', alignSelf: 'center' }}>
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
                    }
                    <DateTimePickerModal
                        isVisible={this.state.IsDepartureTimeClicked}
                        onConfirm={this.confirmDateModal}
                        onCancel={() => this.setState({ IsDepartureTimeClicked: false })}
                        headerTextIOS={this.props.route.params.type === 'route' ? 'Abfahrtzeit' : 'Datum'}
                        cancelTextIOS={"Abbrechen"}
                        confirmTextIOS={"Datum einstellen"}
                        mode={"datetime"}
                    />
                    <DateTimePickerModal
                        isVisible={this.state.IsArrivalTimeClicked}
                        onConfirm={this.confirmDateModal}
                        onCancel={() => this.setState({ IsArrivalTimeClicked: false })}
                        headerTextIOS={"Ankunftszeit"}
                        cancelTextIOS={"Abbrechen"}
                        confirmTextIOS={"Datum einstellen"}
                        mode={"datetime"}
                    />
                    <View style={{ width: '80%', paddingTop: '3%', alignSelf: 'center' }}>
                        <TagInput
                            tags={this.state.tags}
                            updateState={this.updateTagState}
                            placeholder="Tags..."
                            label="Leerzeichen drücken, um Tag hinzuzufügen"
                            keysForTag={" "}
                            tagStyle={styles.tag}
                            tagTextStyle={styles.tagText}
                            inputContainerStyle={styles.inputContainerStyle}
                            ContainerStyle={{ backgroundColor: 'green' }}
                        />
                    </View>
                    <View style={{ width: '100%', alignItems: 'center', paddingTop: '4%' }}>
                        <TouchableOpacity style={styles.btnGreen} onPress={() => { this.save(); }}>
                            <Text style={{ color: 'white' }}>Speichern</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.btnGreen} onPress={() => { this.props.navigation.goBack(); }}>
                            <Text style={{ color: 'white' }}>Abbrechen</Text>
                        </TouchableOpacity>
                    </View>
                </KeyboardAwareScrollView>
            </SafeAreaView >
        )
    }

    componentDidMount = async () => {
        try {
            if (this.props.route.params.type === 'highlight') {
                await this.askForLocationPermission();
            }
            else {
                this.setState({ isLoaded: true })
            }
        } catch (err) {
            console.log('Error: ' + err);
        }
    }

    renderMarker = () => {
        return (
            <Marker
                coordinate={{ latitude: this.state.latitude, longitude: this.state.longitude }}
            />
        )
    }

    takePhoto = async () => {
        // Take the photo and await the response
        let photoResult = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 1
        });

        // Check if the user cancelled the camera, otherwise update the state
        if (!photoResult.cancelled) {
            this.setState({ imageUri: photoResult.uri });
        }
    }

    pickPhoto = async () => {
        // Pick the photo and await the response
        let pickResult = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true
        })

        // Check if the user cancelled the gallery, otherwise update state
        if (!pickResult.cancelled) {
            this.setState({ imageUri: pickResult.uri });
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
                    latitude: this.props.route.params.item.latitude,
                    longitude: this.props.route.params.item.longitude,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421
                }
            }
            this.setState({ initialRegion, isLoaded: true, latitude: initialRegion.latitude, longitude: initialRegion.longitude });

        }
    }

    save = async () => {
        const { imageUri } = this.state;
        let downloadUrl = "No image";

        if (this.state.headline === null || this.state.headline === '') {
            Alert.alert(this.props.route.params.type === 'route' ? 'Name der Route leer.' : 'Überschrift des Highlights leer.', 'Bitte prüfe deine Eingaben.');
            return;
        }
        if (this.state.description === null || this.state.description === '') {
            Alert.alert(this.props.route.params.type === 'route' ? 'Beschreibung der Route leer.' : 'Beschreibung des Highlights leer.', 'Bitte prüfe deine Eingaben.');
            return;
        }
        if (this.state.departureTime === null || this.state.departureTime === '') {
            Alert.alert(this.props.route.params.type === 'route' ? 'Abfahrtzeit nicht angegeben.' : 'Datum nicht angegeben.', 'Bitte prüfe deine Eingaben.');
            return;
        }
        if (this.props.route.params.type === 'route' && this.state.departureTime > this.state.arrivalTime && this.state.arrivalTime !== null) {
            Alert.alert('Ankunftszeit liegt vor der Abfahrtszeit.', 'Bitte prüfe deine Eingaben.');
            return;
        }

        if (imageUri) {

            // Upload image to firebase
            let fileName = imageUri.split("/");
            fileName = fileName[fileName.length - 1];
            const response = await fetch(imageUri);
            const blob = await response.blob();
            let imageRef = firebase.storage().ref().child(`${fileName}`);
            await imageRef.put(blob)
                .then(async (snapshot) => {
                    return snapshot.ref.getDownloadURL();
                })
                .then(url => {
                    downloadUrl = url;
                })
                .catch(() => {
                    Alert.alert("Fehler", "Bild konnte nicht hochgeladen werden");
                });
        }

        if (this.props.route.params.type === 'route') {
            let route = {
                headline: this.state.headline,
                description: this.state.description,
                highlight: [],
                point: [],
                tag: this.state.tags.tagsArray,
                preview_picture: downloadUrl,
                arrival_timestamp: this.state.arrivalTime,
                departure_timestamp: this.state.departureTime
            }
            if (this.props.route.params.action === 'add') {
                this.props.route.params.onNewRoute(route);
            }
            else {
                this.props.route.params.onEditedRoute(this.props.route.params.index, route);
            }
        }
        else if (this.props.route.params.type === 'highlight') {
            let highlight = {
                headline: this.state.headline,
                description: this.state.description,
                latitude: this.state.latitude,
                longitude: this.state.longitude,
                tag: this.state.tags.tagsArray,
                picture: [{ path: downloadUrl }],
                timestamp: this.state.departureTime,
            }
            if (this.props.route.params.action === 'add') {
                this.props.route.params.onNewHighlight(highlight);
            }
            else {
                this.props.route.params.onEditedHighlight(this.props.route.params.index, highlight);
            }
        }
        this.props.navigation.goBack();
    }

    confirmDateModal = (date) => {

        // Destructure state, parse date & build time string to display
        const { IsArrivalTimeClicked, IsDepartureTimeClicked, arrivalTime, departureTime, displayDepartureTime, displayArrivalTime } = this.state;
        var parsedDate = new Date(date);

        // Update state and deactivate date time modal
        if (IsArrivalTimeClicked) {
            this.setState({ arrivalTime: parsedDate.getTime(), IsArrivalTimeClicked: false, displayArrivalTime: this.buildTimeString(parsedDate) });
        }
        else if (IsDepartureTimeClicked) {
            this.setState({ departureTime: parsedDate.getTime(), IsDepartureTimeClicked: false, displayDepartureTime: this.buildTimeString(parsedDate) });
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
        let timeString = `${parsedDate.getDate()}.${parsedDate.getMonth() + 1}.${parsedDate.getFullYear()} ${parsedDate.getHours()}:${minutes}`;
        return timeString;
    }

    updateTagState = (state) => {
        this.setState({ tags: state });
    }

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
    },
    scrollView: {
        width: '100%',
        height: '100%',
    },
    inputView: {
        width: "80%",
        backgroundColor: "#a9c0a6",
        borderRadius: 25,
        height: 50,
        justifyContent: "center",
        padding: 20,
        alignSelf: 'center'
    },
    inputText: {
        height: 50,
        color: "white"
    },
    tag: {
        backgroundColor: '#a9c0a6',
    },
    tagText: {
        color: '#fff'
    },
    tagInputContainer: {
        height: 1000,
        borderColor: 'green',
        borderWidth: 2,
    },
    btnGreen: {
        width: "80%",
        backgroundColor: "#097770",
        borderRadius: 25,
        height: 50,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 10
    },
    map: {
        height: '100%',
        width: '100%',
        borderRadius: 25
    },
    image: {
        height: 200,
        width: 200,
        alignSelf: 'center',
        marginTop: 10,
        borderRadius: 40
    },
})