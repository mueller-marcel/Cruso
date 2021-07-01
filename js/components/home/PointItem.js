import React, { Component } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import * as Icon from '@expo/vector-icons';

import { renderTimestamp } from '../../RenderHelper';

export default class PointItem extends Component {
    state = { item: this.props.item, index: this.props.index }
    render() {
        let { item, index } = this.state;
        return (
            <View style={styles.container}>
                <Text style={styles.headlineText}>Punkt {index + 1}</Text>
                <Text style={{ paddingTop: 5 }}>{renderTimestamp(item.timestamp)}</Text>
                <Text style={{ paddingTop: 2 }}>Breitengrad: {item.latitude}</Text>
                <Text style={{ paddingTop: 2 }}>Längengrad: {item.longitude}</Text>
                <View style={{ paddingTop: 10 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                        <TouchableOpacity style={styles.detailBtn} onPress={() => { this.props.onEdit() }}>
                            <Text style={{ color: 'white' }}>Bearbeiten</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.deleteBtn} onPress={() => { this.props.onDelete() }}>
                            <Icon.FontAwesome name='trash-o' color='white' size={15} />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        color: '#fff',
        justifyContent: 'center',
        width: 320,
        height: 180,
        borderColor: 'lightgray',
        backgroundColor: 'white',
        borderWidth: 1,
        borderRadius: 20,
        paddingLeft: 70,
    },
    detailBtn: {
        width: '70%',
        backgroundColor: "#097770",
        borderRadius: 25,
        height: 40,
        alignItems: "center",
        justifyContent: "center",
        padding: 10
    },
    deleteBtn: {
        width: '22%',
        backgroundColor: "#b23b3b",
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
    },
    headlineText: {
        fontWeight: 'bold',
        paddingBottom: 3,
        fontSize: 17
    }
})