import React from 'react';
import { TouchableOpacity, StyleSheet, View, TextInput } from 'react-native';

/**
 * Helper component for the green input field
 */
export default function DateInputField(props) {
    return (
        <View style={styles.inputView} >
            <TouchableOpacity onPress={props.onPress} >
                <TextInput
                    style={styles.inputText}
                    editable={props.editable}
                    placeholder={props.placeholder}
                    placeholderTextColor='#003f5c'
                    pointerEvents="none"
                    defaultValue={props.date} />
            </TouchableOpacity>
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