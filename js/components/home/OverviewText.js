import React, { Component } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import * as Icon from '@expo/vector-icons';

export default class OverviewText extends Component {
    render() {
        return (
            <View style={this.props.type === 'headline' ? [styles.headlineContainer, { paddingTop: 20 }] : [styles.headlineContainer, { paddingTop: 5 }]}>
                { (this.props.type === 'latitude' || this.props.type === 'longitude') &&
                    <Icon.MaterialCommunityIcons name={this.props.icon} color={'#096d51'} size={this.props.iconSize} />}
                { (this.props.type !== 'latitude' && this.props.type !== 'longitude') &&
                    <Icon.FontAwesome name={this.props.icon} color='#096d51' size={this.props.iconSize} />}
                <Text style={this.props.type === 'headline' ? styles.headlineText : styles.underHeadlineText}>{this.props.text}</Text>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    headlineContainer: {
        paddingLeft: '10%',
        flexDirection: 'row',
        alignItems: 'center'
    },
    headlineText: {
        fontSize: 32,
        fontWeight: 'bold',
        paddingLeft: 12
    },
    underHeadlineText: {
        fontSize: 20,
        paddingLeft: 12,
        color: 'gray'
    }
})