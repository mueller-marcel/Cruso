import React from 'react';
import { StyleSheet, View, TextInput } from 'react-native';

/**
 * Helper component for the text input
 */
export default function TextInputField(props) {
    return (
        <View style={styles.inputView} >
            <TextInput
                style={styles.inputText}
                placeholder={props.placeholder}
                placeholderTextColor='#003f5c'
                defaultValue={props.defaultValue}
                onChangeText={props.onChangeText} />
        </View>
    );
}

const styles = StyleSheet.create({
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
});