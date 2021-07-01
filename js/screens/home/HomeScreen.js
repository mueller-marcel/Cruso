import React, { Component } from 'react';
import { Text, SafeAreaView, StyleSheet, Alert, FlatList, View, ActivityIndicator } from 'react-native';

import Firebase from '../../Firebase';
import firebase from 'firebase';

import JourneyItem from '../../components/home/JourneyItem';
import RoundButton from '../../components/Helpers/RoundButton';
import SearchBar from '../../components/Helpers/SearchBar'
import { filter } from 'lodash';
import { ThemeProvider } from '@react-navigation/native';

/**
 * Definition for the homescreen to display the journeys
 */
export default class HomeScreen extends Component {
    state = {
        userData: {},
        IsLoading: true,
        IsNewJourneyVisible: false,
        query: "",
        fullData: [],
    };

    render() {

        // Destructuring state object
        const { userData, IsLoading } = this.state;

        // Return an ActivityIndicator, if the data is not yet loaded from firebase
        if (IsLoading === true) {
            return (
                <ActivityIndicator
                    size="large"
                    color="#097770"
                    style={styles.activityIndicator} />
            );
        }

        // Load the flatlist if all the data is loaded from firebase
        return (
            <SafeAreaView style={styles.container}>

                {/* Header are including the welcome message and the button */}
                <View style={styles.header}>
                    <Text style={styles.headerFont}>Hallo {userData.firstName}</Text>
                    <RoundButton
                        onPress={() => this.props.navigation.navigate("NewJourneyModal", {
                            onAdd: this.addJourney.bind(this),
                            userid: userData.userid
                        })}
                        icon="plus" />
                </View>

                {/* The flatlist to show all the journeys */}
                <View>
                    <View style={{ justifyContent: 'center', flexDirection: "row", alignItems: 'center' }}>
                        <SearchBar placeholder={"Suche"} onChangeText={this.handleSearch} />
                    </View>
                    <FlatList
                        data={this.state.fullData}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({ item, index }) => (
                            <JourneyItem
                                item={item}
                                onPress={() => {
                                    this.props.navigation.navigate('Routen', {
                                        journey: item,
                                        journeyIndex: index,
                                        updateFirebase: this.updateFirebase.bind(this),
                                    })
                                }}
                                onDelete={() => this.handleDelete(index)}
                                onEdit={() => this.props.navigation.navigate("EditJourney", {
                                    journey: item,
                                    journeyIndex: index,
                                    userData: userData,
                                    onEdit: this.editJourney.bind(this)
                                })}
                            />)}
                        ItemSeparatorComponent={() => <View style={styles.listSeparator} />}
                        onRefresh={this.refresh}
                        refreshing={IsLoading}
                        ListEmptyComponent={() => <Text style={styles.emptyList}>Keine Reisen</Text>} />
                </View>
            </SafeAreaView >
        );
    }

    // Callback method to edit journeys
    editJourney = (index, editedJourney) => {
        const { userData } = this.state;
        userData.journeys[index] = editedJourney;
        this.setState({ userData: userData });
        this.updateFirebase();
    }

    /**
     * Callback method to add journeys
     */
    addJourney = (addedJourney) => {
        const { userData } = this.state;
        userData.journeys.push(addedJourney);
        this.setState({ userData: userData });
        this.updateFirebase();
    }

    /**
     * Update the journeys in firebase
     */
    updateFirebase = () => {
        let { userData } = this.state;
        Firebase.db.collection("users").doc(userData.userid).update({
            journeys: userData.journeys
        });
        this.setState({ userData })
    }

    /**
     * Handles the search of the journeys
     */
    handleSearch = (text) => {
        const { userData, fullData } = this.state;
        const formattedQuery = text.toLowerCase();
        const data = filter(this.state.userData.journeys, journey => {
            return this.contains(journey, formattedQuery)
        });
        this.setState({ fullData: data });

        if (text === "") {
            this.setState({ fullData: userData.journeys });
        }
    }

    /**
     * Helper method to compare the journeys with the query entered in the searchbar
     */
    contains = (journey, query) => {
        query = query.trim();
        const searchedTags = this.searchTags(journey, query);
        if (journey.headline.toLowerCase().includes(query)) {
            return true;
        }
        else if (journey.description.toLowerCase().includes(query)) {
            return true;
        }
        else if (searchedTags) {
            return true;
        }
        return false;
    }

    /**
     * Helper method to search the query within the tags
     */
    searchTags(journey, query) {
        for (tag of journey.tag) {
            tag = tag.toLowerCase();
            if (tag.includes(query)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Executed when the component is rendered. Retrieves data from firebase
     */
    componentDidMount = async () => {
        this.setState({ IsLoading: true });
        const userData = await this.retrieveData();
        this.setState({ IsLoading: false, fullData: userData.journeys, userData: userData });
    }

    /**
     * Called when the flatlist is refreshed by pull up
     */
    refresh = async () => {
        this.setState({ IsLoading: true });
        var user = await this.retrieveData();
        this.setState({ IsLoading: false, userData: user });
    }

    /**
     * Implementation of the firebase data retrieval
     * @returns userdata from the firebase authentication server
     */
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
                alert("Reisen konnten nicht geladen werden")
            });
        return userData;
    }

    /**
     * Deletes the journey by its index
     */
    handleDelete = async (index) => {
        const { fullData, userData } = this.state;
        const confirmation = await this.AsyncAlert();
        if (confirmation === 'cancel') {
            return;
        }

        // Delete image from the firebase storage
        const downloadUrl = fullData[index].preview_picture;
        try {
            const imageRef = firebase.storage().refFromURL(downloadUrl);
            await imageRef.delete();
        } catch (error) {
            console.log(error);
        }

        // Delete locally from array and update firebase
        fullData.splice(index, 1);
        // Update firebase
        Firebase.db.collection("users").doc(userData.userid).update({
            journeys: fullData
        });

        // Set state to refresh the journey overview
        this.setState({ userData: userData });
    }

    /**
     * Lets the user confirm the deletion
     */
    AsyncAlert = () => {
        return new Promise((resolve) => {
            Alert.alert(
                'Löschen',
                "Willst du die Reise wirklich löschen?",
                [
                    { text: 'Abbrechen', style: 'cancel', onPress: () => resolve('cancel') },
                    { text: 'Löschen', style: 'destructive', onPress: () => resolve('delete') }
                ],
                { cancelable: false }
            )
        })
    }
}

const styles = StyleSheet.create({
    container: {
        color: '#fff',
        flex: 1
    },
    listSeparator: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: '#097770',
    },
    emptyList: {
        alignSelf: 'center',
        fontSize: 30,
        fontWeight: 'bold',
        padding: 50
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginRight: "5%"
    },
    headerFont: {
        fontSize: 35,
        fontWeight: 'bold',
        padding: 20
    },
    activityIndicator: {
        flex: 1,
    }
});