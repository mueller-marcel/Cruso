import React, { Component } from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import * as Icon from '@expo/vector-icons';

export default class RoundButton extends Component {
    render() {
        return (
            <TouchableOpacity style={styles.button} onPress={() => this.props.onPress()}>
                <Icon.Feather name={this.props.icon} color={'white'} size={20} />
            </TouchableOpacity>
        )
    }
}

const styles = StyleSheet.create({
    button: {
        width: 50,
        backgroundColor: "#097770",
        borderRadius: 25,
        height: 50,
        alignItems: "center",
        justifyContent: "center",
    }
})