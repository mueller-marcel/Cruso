import React, { Component } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Image } from 'react-native';
import * as Icon from '@expo/vector-icons';

import { renderTags, renderDateSpan, renderTimestamp } from '../../RenderHelper';

export default class RouteOrHighlightItem extends Component {
    state = { item: this.props.item }
    render() {
        return (
            <View style={styles.container}>
                <View style={styles.imageContainer}>
                    <Image
                        style={styles.image}
                        source={{ uri: this.props.type === 'route' ? this.props.item.preview_picture : this.props.item.picture[0].path }}
                    />
                </View>
                <View style={styles.infoContainer}>
                    <Text style={styles.headlineText}>{this.props.item.headline}</Text>
                    <Text style={{ paddingTop: 5 }}>{this.props.item.description}</Text>
                    <Text style={{ paddingTop: 2 }}>
                        {this.props.type === 'route' ? renderDateSpan(this.props.item.departure_timestamp, this.props.item.arrival_timestamp) : renderTimestamp(this.props.item.timestamp)}
                    </Text>
                    <Text style={{ paddingTop: 2, paddingBottom: 15 }}>{renderTags(this.props.item.tag)}</Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <TouchableOpacity style={styles.detailBtn} onPress={() => { this.props.onPressDetail() }}>
                            <Text style={{ color: 'white' }}>Details</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.deleteBtn, { backgroundColor: "#097770" }]} onPress={() => { this.props.onEdit() }}>
                            <Icon.FontAwesome name='pencil' color='white' size={15} />
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
        flexDirection: 'row',
        alignItems: 'center',
        width: 320,
        height: 180,
        borderColor: 'lightgray',
        backgroundColor: 'white',
        borderWidth: 1,
        borderRadius: 20,
    },
    imageContainer: {
        paddingLeft: 15
    },
    image: {
        height: 80,
        width: 80,
        borderRadius: 40,
    },
    infoContainer: {
        paddingLeft: 15,
        width: '60%'
    },
    detailBtn: {
        width: '50%',
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