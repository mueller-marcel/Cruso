import React, { Component } from 'react';
import { Text, View, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Modalize } from 'react-native-modalize';
import * as Icon from '@expo/vector-icons';

import RoundButton from '../../components/Helpers/RoundButton';
import OverviewText from '../../components/home/OverviewText';
import { renderTags, renderTimestamp } from '../../RenderHelper';

export default class RouteDetailScreen extends Component {
    state = { highlight: this.props.route.params.highlight }
    render() {
        let { highlight } = this.state;
        return (
            <View style={styles.container}>
                <View style={{ alignSelf: 'flex-end', width: '100%', height: '80%' }}>
                    <Image
                        style={styles.image}
                        source={{ uri: highlight.picture[0].path }}
                    />
                </View>
                <View style={{ position: 'absolute', paddingTop: '17%', paddingLeft: '5%', alignContent: 'center', justifyContent: 'center' }}>
                    <RoundButton onPress={() => this.props.navigation.goBack()} icon='arrow-left' />
                </View>
                <Modalize
                    handleStyle={{ width: 0 }}
                    modalStyle={{ borderTopLeftRadius: 60, borderTopRightRadius: 60, backgroundColor: '#f8f8f6' }}
                    alwaysOpen={250}
                    scrollViewProps={{ showsVerticalScrollIndicator: true }}
                    panGestureEnabled={false}>
                    <View>
                        <OverviewText text={highlight.headline} icon='globe' iconSize={25} type='headline' />
                        <OverviewText text={highlight.description} icon='file-text' iconSize={20} type='description' />
                        <OverviewText text={renderTags(highlight.tag)} icon='tags' iconSize={20} type='tags' />
                        <OverviewText text={renderTimestamp(highlight.timestamp)} icon='calendar' iconSize={20} type='date' />
                        <OverviewText text={highlight.latitude} icon='latitude' iconSize={20} type='latitude' />
                        <OverviewText text={highlight.longitude} icon='longitude' iconSize={20} type='longitude' />
                    </View>
                </Modalize>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    image: {
        height: '100%',
        width: '100%',
    },
    detailBtn: {
        width: '100%',
        backgroundColor: "#097770",
        borderRadius: 25,
        height: 40,
        alignItems: "center",
        justifyContent: "center",
        padding: 10
    }
})