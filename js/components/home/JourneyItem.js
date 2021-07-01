import React from 'react';
import { Component } from 'react';
import { Animated, Text, StyleSheet, Image, TouchableOpacity, View } from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable'

/**
 * Definition of a component to show a journey item in the homescreen
 * @param {object} props props of the component 
 * @returns An item that displays a route
 */
export default class JourneyItem extends Component {

    /**
     * Called when the component is rendered
     */
    render() {
        /**
         * Contains JSX for the delete swipeable button
         * @returns JSX for the delete swipe button
         */
        const rightSwipe = (progress, dragX) => {
            const scale = dragX.interpolate({
                inputRange: [0, 100],
                outputRange: [0, 1],
                extrapolate: 'clamp'
            });

            return (
                <TouchableOpacity onPress={() => this.props.onDelete()}>
                    <View style={styles.deleteButton}>
                        <Animated.Text style={styles.font}>Löschen</Animated.Text>
                    </View>
                </TouchableOpacity >
            );
        }

        const leftSwipe = (progress, dragX) => {
            const scale = dragX.interpolate({
                inputRange: [0, 100],
                outputRange: [0, 1],
                extrapolate: 'clamp'
            });

            return (
                <TouchableOpacity onPress={() => this.props.onEdit()}>
                    <View style={styles.editButton}>
                        <Animated.Text style={styles.font}>Bearbeiten</Animated.Text>
                    </View>
                </TouchableOpacity >
            );
        }

        // Return the JSX of the component
        return (
            <Swipeable renderRightActions={rightSwipe} renderLeftActions={leftSwipe}>
                <TouchableOpacity onPress={() => this.props.onPress()}>

                    <View style={styles.container}>
                        <Image
                            style={styles.image}
                            source={{ uri: this.props.item.preview_picture }} />
                        <View style={styles.textBox}>
                            <Text style={styles.journeyName}>{this.props.item.headline}</Text>
                            <Text style={styles.journeyDescription}>{this.props.item.description}</Text>
                        </View>
                    </View>
                </TouchableOpacity>
            </Swipeable>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        padding: 10,
        flexDirection: 'row'
    },
    image: {
        height: 80,
        width: 80,
        marginRight: 10,
        borderRadius: 40,
    },
    journeyName: {
        fontSize: 20,
        fontWeight: 'bold'
    },
    journeyDescription: {
        fontSize: 15
    },
    textBox: {
        justifyContent: 'space-evenly'
    },
    deleteButton: {
        backgroundColor: 'red',
        flex: 1,
        justifyContent: 'center'
    },
    editButton: {
        backgroundColor: 'blue',
        flex: 1,
        justifyContent: 'center'
    },
    font: {
        color: 'white',
        fontSize: 15,
        margin: 10,
    }
});