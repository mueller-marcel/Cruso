import React from 'react';
import { Component } from 'react';
import { Text, StyleSheet, Image, View, Modal, Button, TextInput, SafeAreaView, TouchableOpacity, Touchable, Alert } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import TagInput from 'react-native-tags-input';

import Firebase from '../../Firebase';
import firebase from 'firebase';

import * as ImagePicker from 'expo-image-picker';

import DateTimePickerModal from 'react-native-modal-datetime-picker'
import RoundButton from '../Helpers/RoundButton';
import DateInputField from '../Helpers/DateInputField';
import TextInputField from '../Helpers/TextInputField';

/**
 * Definition of a modal to add new journeys
 */
export default class EditJourney extends Component {

    // Declare state 
    state = {
        cameraIsAllowed: null,
        libraryIsAllowed: null,
        isImageChanged: false,
        imageUri: this.props.route.params.journey.preview_picture,
        headline: this.props.route.params.journey.headline,
        description: this.props.route.params.journey.description,
        IsArrivalTimeClicked: false,
        IsDepartureTimeClicked: false,
        arrivalTime: this.props.route.params.journey.arrival_timestamp,
        departureTime: this.props.route.params.journey.departure_timestamp,
        displayArrivalTime: null,
        displayDepartureTime: null,
        userData: this.props.route.params.userData,
        tags: { tag: "", tagsArray: this.props.route.params.journey.tag }
    }

    render() {

        // Destructuring props and state
        const {
            headline,
            description,
            imageUri,
            IsArrivalTimeClicked,
            IsDepartureTimeClicked,
            arrivalTime,
            departureTime,
            displayArrivalTime,
            displayDepartureTime,
            downloadUrl,
            tags } = this.state;

        // If visible is true return the modal as its designed
        return (
            <SafeAreaView>
                <KeyboardAwareScrollView innerRef={ref => { this.scroll = ref }}>

                    {/* Header are including the welcome message and the button */}
                    <View style={styles.header}>
                        <RoundButton
                            icon="arrow-left"
                            onPress={() => {
                                this.props.navigation.goBack("Reisen");
                            }} />

                        <Text style={styles.headerFont}>Reise bearbeiten</Text>

                        <RoundButton
                            icon="save"
                            onPress={() => this.navigateBack()} />
                    </View>

                    {/* ImageView to display the thumbnail of the journey */}
                    <Image
                        source={imageUri === "" ? require('../../../assets/icon.png') : { uri: imageUri }}
                        style={styles.image} />

                    <View style={styles.buttonArea}>
                        <RoundButton icon="camera" onPress={() => this.takePhoto()} />
                        <RoundButton icon="trash" onPress={() => this.deleteImagePreview()} />
                        <RoundButton icon="image" onPress={() => this.pickPhoto()} />
                    </View>
                    <View style={styles.inputArea}>
                        <Text style={styles.font}>Reisename</Text>
                        <TextInputField
                            defaultValue={headline}
                            onChangeText={text => this.setState({ headline: text })} />

                        <Text style={styles.font}>Beschreibung</Text>
                        <TextInputField
                            defaultValue={description}
                            onChangeText={text => this.setState({ description: text })} />

                        <Text style={styles.font}>Abfahrtzeit</Text>
                        <DateInputField
                            onPress={() => this.setState({ IsDepartureTimeClicked: true })}
                            editable={false}
                            placeholder="Abfahrtzeit"
                            date={displayDepartureTime} />

                        <Text style={styles.font}>Ankunftszeit</Text>
                        <DateInputField
                            onPress={() => this.setState({ IsArrivalTimeClicked: true })}
                            editable={false}
                            placeholder="Ankunftszeit"
                            date={displayArrivalTime} />
                    </View>

                    {/* Tags input */}
                    <TagInput
                        tags={tags}
                        updateState={this.updateTagState}
                        placeholder="Tags..."
                        label="Leerzeichen drücken, um Tag hinzuzufügen"
                        keysForTag={" "}
                        tagStyle={styles.tag}
                        tagTextStyle={styles.tagText}
                        inputContainerStyle={styles.inputContainerStyle} />


                    {/* Date picker modals */}
                    <DateTimePickerModal
                        isVisible={IsDepartureTimeClicked}
                        onConfirm={this.confirmDateModal}
                        onCancel={() => this.setState({ IsDepartureTimeClicked: false })}
                        headerTextIOS={"Abfahrtszeit"}
                        cancelTextIOS={"Abbrechen"}
                        confirmTextIOS={"Datum einstellen"}
                        mode={"datetime"} />

                    <DateTimePickerModal
                        isVisible={IsArrivalTimeClicked}
                        onConfirm={this.confirmDateModal}
                        onCancel={() => this.setState({ IsArrivalTimeClicked: false })}
                        headerTextIOS={"Ankunftszeit"}
                        cancelTextIOS={"Abbrechen"}
                        confirmTextIOS={"Datum einstellen"}
                        mode={"datetime"} />
                </KeyboardAwareScrollView>
            </SafeAreaView>
        );
    }

    /**
     * Request permissions on component mount. 
     * Not executed if the permissions are already requested.
     */
    componentDidMount() {
        const { departureTime, arrivalTime } = this.state;
        this.requestPermissions();

        // Parse departure timestamp
        let departure = new Date(departureTime);
        departure = this.buildTimeString(departure);
        this.setState({ displayDepartureTime: departure });

        let arrival = new Date(arrivalTime);
        arrival = this.buildTimeString(arrival);
        this.setState({ displayArrivalTime: arrival })
    }

    /**
     * Deletes the image loaded in the preview
     */
    deleteImagePreview = () => {
        this.setState({ imageUri: "", isImageChanged: true });
    }

    /**
     * Pick photo from the gallery
     */
    pickPhoto = async () => {
        // Pick the photo and await the response
        let pickResult = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true
        })

        // Check if the user cancelled the gallery, otherwise update state
        if (!pickResult.cancelled) {
            this.setState({ imageUri: pickResult.uri, isImageChanged: true });
        }
    }

    /**
     * Takes the photo
     */
    takePhoto = async () => {
        // Take the photo and await the response
        let photoResult = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 1
        });

        // Check if the user cancelled the camera, otherwise update the state
        if (!photoResult.cancelled) {
            this.setState({ imageUri: photoResult.uri, isImageChanged: true });
        }
    }

    /**
     * Request the necessary permissions for camera and galery access
     */
    requestPermissions = async () => {
        // Request permission for camera and gallery access
        const { mediaLibraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        const { cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();

        // Set the permissions as state to be access globally
        this.setState({ cameraIsAllowed: cameraStatus, libraryIsAllowed: mediaLibraryStatus });
    }

    /**
     * Validates the journey to be filled out completely
     */
    validateJourneyInput = (headline, description, arrivalTime, departureTime) => {

        // False if not filled out correctly
        if (!(headline && description && arrivalTime && departureTime)) {
            return false;
        }

        // Validate that arrivaldate is after departure date
        var departureDate = new Date(departureTime);
        var arrivalDate = new Date(arrivalTime)
        if (arrivalDate < departureDate) {
            return true;
        }
        else {
            return false;
        }
    }

    /**
     * Performs the validations and navigates back if the validation suceeds
     */
    navigateBack = async () => {
        const { headline, description, departureTime, arrivalTime, tags, imageUri, userData, isImageChanged } = this.state;
        const index = this.props.route.params.journeyIndex;

        const isValid = this.validateJourneyInput(headline, description, departureTime, arrivalTime, tags);
        if (isValid) {
            if (isImageChanged) {

                // Delete old image
                const downloadUrl = userData.journeys[index].preview_picture;
                try {
                    const imageRef = firebase.storage().refFromURL(downloadUrl);
                    await imageRef.delete();
                } catch (error) {
                    console.log(error);
                }

                // Upload new image
                if (imageUri) {
                    let fileName = imageUri.split("/");
                    fileName = fileName[fileName.length - 1];
                    const response = await fetch(imageUri);
                    const blob = await response.blob();
                    let imageRef = firebase.storage().ref().child(`${userData.userid}/${headline}/${fileName}`);
                    await imageRef.put(blob)
                        .then(async (snapshot) => {
                            return snapshot.ref.getDownloadURL();
                        })
                        .then(url => {
                            userData.journeys[index].preview_picture = url;
                        })
                        .catch(() => {
                            Alert.alert("Fehler", "Bild konnte nicht hochgeladen werden");
                        })
                }
            }

            // Reset image changed flag
            this.setState({ isImageChanged: false });

            // Change values in the journey
            userData.journeys[index].headline = headline;
            userData.journeys[index].description = description;
            userData.journeys[index].arrival_timestamp = arrivalTime;
            userData.journeys[index].departure_timestamp = departureTime;
            userData.journeys[index].tag = tags.tagsArray;

            // Upload to firebase
            this.props.route.params.onEdit(this.props.route.params.journeyIndex, userData.journeys[index]);
        }
        else {
            Alert.alert("Fehler", "Angegebene Reisedaten nicht valide");
        }

        this.props.navigation.goBack();
    }

    /**
     * Updates the state when a tag is added or deleted
     */
    updateTagState = (state) => {
        this.setState({ tags: state });
    }

    /**
     * Takes the time from the date time picker saves it to the state
     */
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

    /**
     * Builds a string from the timestamp to be displayed
     * @param {Date} parsedDate A Date object
     * @returns A string in format DD.MM.YYYY HH:MM
     */
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
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginLeft: "5%",
        marginRight: "5%"
    },
    headerFont: {
        fontSize: 20,
        fontWeight: 'bold',
        padding: 20
    },
    font: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: "5%"
    },
    image: {
        height: 200,
        width: 200,
        alignSelf: 'center',
        marginTop: 10,
        borderRadius: 100
    },
    buttonArea: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        marginTop: 10
    },
    inputView: {
        width: "80%",
        backgroundColor: "#a9c0a6",
        borderRadius: 25,
        height: 50,
        marginBottom: "5%",
        marginTop: "5%",
        justifyContent: "center",
        padding: 20
    },
    inputText: {
        height: 50,
        color: "white"
    },
    inputArea: {
        alignItems: 'center'
    },
    tag: {
        backgroundColor: '#097770',
    },
    tagText: {
        color: '#fff'
    },
    tagInputContainer: {
        height: 1000,
        borderColor: '#000'
    }
});