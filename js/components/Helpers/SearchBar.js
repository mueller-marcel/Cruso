import React from 'react';
import { StyleSheet, View, TextInput } from 'react-native';

/**
 * Helper component for the text input
 */
export default function Searchbar(props) {
    return (
        <View style={styles.inputView} >
            <TextInput
                style={styles.inputText}
                placeholder={props.placeholder}
                placeholderTextColor='#003f5c'
                onChangeText={props.onChangeText} />
        </View>
    );
}

const styles = StyleSheet.create({
    inputView: {
        width: "90%",
        backgroundColor: "#a9c0a6",
        borderRadius: 25,
        height: 25,
        marginBottom: "1%",
        // marginTop: "0.5%",
        justifyContent: "center",
        padding: 20
    },
    inputText: {
        height: 50,
        color: "white",
    },
});