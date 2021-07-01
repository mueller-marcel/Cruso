import React, { Component } from 'react';
import { View, StyleSheet, Text, FlatList, TouchableOpacity, ActionSheetIOS, Alert } from 'react-native';
import * as Icon from '@expo/vector-icons';
import { Modalize } from 'react-native-modalize';
import { Picker } from '@react-native-picker/picker';
import * as Location from 'expo-location';
import MapViewDirections from 'react-native-maps-directions';
import MapView, { Marker } from 'react-native-maps';

import RoundButton from '../../components/Helpers/RoundButton';
import RouteOrHighlightItem from '../../components/home/RouteOrHighlightItem';
import PointItem from '../../components/home/PointItem';
import OverviewText from '../../components/home/OverviewText';
import { renderTags, renderDateSpan } from '../../RenderHelper';

export default class RouteDetailScreen extends Component {
    state = { route: this.props.route.params.route, showPoints: true, selectedValue: 'point', recordRoute: false, timer: {} }
    render() {
        let { route, showPoints, selectedValue } = this.state;
        return (
            <View style={styles.container}>
                <MapView
                    ref={map => { this.mapRef = map }}
                    style={styles.map}
                    initialRegion={{
                        latitude: route.point.length === 0 ? 48 : route.point[0].latitude,
                        longitude: route.point.length === 0 ? 8 : route.point[0].longitude,
                        latitudeDelta: 0.0922,
                        longitudeDelta: 0.0421
                    }}
                >
                    {this.renderMarker()}
                </MapView>
                <View style={{ position: 'absolute', paddingTop: '10%', paddingRight: '85%', alignContent: 'center', justifyContent: 'center' }}>
                    <RoundButton onPress={() => this.props.navigation.goBack()} icon='arrow-left' />
                </View>
                <Modalize
                    handleStyle={{ width: 0 }}
                    modalStyle={{ borderTopLeftRadius: 60, borderTopRightRadius: 60, backgroundColor: '#f8f8f6' }}
                    alwaysOpen={400}
                    scrollViewProps={{ showsVerticalScrollIndicator: true }}
                    panGestureEnabled={false}
                >
                    <View>
                        <OverviewText text={route.headline} icon='globe' iconSize={25} type='headline' />
                        <OverviewText text={route.description} icon='file-text' iconSize={20} type='description' />
                        <OverviewText text={renderTags(route.tag)} icon='tags' iconSize={20} type='tags' />
                        <OverviewText text={renderDateSpan(route.departure_timestamp, route.arrival_timestamp)} icon='calendar' iconSize={20} type='date' />
                    </View>
                    <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', paddingRight: '10%' }}>
                        {Platform.OS === 'ios' &&
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                <Text style={styles.routeHeadlineText}>{showPoints ? 'Punkte' : 'Highlights'}</Text>
                                <TouchableOpacity style={{ paddingLeft: 5, paddingTop: 10 }} onPress={() => this.choosePointOrHighlightIOS()}>
                                    <Icon.AntDesign name="down" color={'#096d51'} size={25} />
                                </TouchableOpacity>
                            </View>}
                        {Platform.OS === 'android' &&
                            <View style={{ paddingLeft: '10%' }}>
                                <Picker
                                    selectedValue={selectedValue}
                                    style={[styles.routeHeadlineText, { height: 50, width: 140 }]}
                                    itemStyle={{ backgroundColor: 'green' }}
                                    onValueChange={(itemValue) => {
                                        if (itemValue === 'point') { this.setState({ showPoints: true, selectedValue: itemValue }); }
                                        else if (itemValue === 'highlight') { this.setState({ showPoints: false, selectedValue: itemValue }); }
                                    }}
                                >
                                    <Picker.Item label='Punkte' value='point' />
                                    <Picker.Item label='Highlights' value='highlight' />
                                </Picker>
                            </View>
                        }
                        {this.state.showPoints &&
                            <View style={{ paddingLeft: '20%' }}>
                                <TouchableOpacity style={styles.button} onPress={() => this.recordRoute()}>
                                    <Icon.FontAwesome name={this.state.recordRoute ? 'stop' : 'play'} color={'white'} size={15} />
                                </TouchableOpacity>

                            </View>}
                        <RoundButton
                            onPress={() => {
                                showPoints ?
                                    this.props.navigation.navigate('NewPoint', { action: 'add', onNewPoint: this.addPoint.bind(this) })
                                    :
                                    this.props.navigation.navigate('NewRouteOrHighlight', { action: 'add', onNewHighlight: this.addHighlight.bind(this), type: 'highlight' })
                            }}
                            icon='plus'
                        />
                    </View>
                    <View style={{ padding: 10 }}>
                        <FlatList
                            ref={(ref) => { this.flatListRef = ref }}
                            showsHorizontalScrollIndicator={false}
                            horizontal={true}
                            data={showPoints ? route.point : route.highlight}
                            keyExtractor={(item, index) => index.toString()}
                            renderItem={({ item, index }) =>
                                showPoints ?
                                    <PointItem
                                        item={item}
                                        index={index}
                                        onDelete={() => this.deletePointOrHighlight(index)}
                                        onEdit={() => this.props.navigation.navigate('NewPoint', { action: 'edit', index: index, point: item, onEditPoint: this.editPoint.bind(this) })}
                                    />
                                    :
                                    <RouteOrHighlightItem
                                        item={item}
                                        onEdit={() => this.props.navigation.navigate('NewRouteOrHighlight', { action: 'edit', item: item, index: index, type: 'highlight', onEditedHighlight: this.editHighlight.bind(this) })}
                                        onDelete={() => this.deletePointOrHighlight(index)}
                                        type='routehighlight'
                                        onPressDetail={() => this.props.navigation.navigate('HighlightDetail', { highlight: item })}
                                        type='highlight' />
                            }
                            ItemSeparatorComponent={() => <View style={{ paddingLeft: 20 }} />}
                            ListEmptyComponent={() => <Text style={{ padding: 65 }}>Hier wurde noch nichts angelegt.</Text>}
                        />
                    </View>
                </Modalize>
            </View>
        )
    }

    recordRoute = async () => {
        if (this.state.recordRoute) {
            this.setState({ recordRoute: false });
            this.abortTimer();
            this.props.route.params.updateFirebase();
        }
        else {
            const { status } = await Location.requestPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Aufzeichnung nicht möglich.', 'Um diese Funktion zu nutzen musst du in den Einstellungen der App die Erlaubnis erteilen auf den Standort zuzugreifen.');
                return;
            }
            this.setState({ recordRoute: true });
            //Interval is 5 sec
            let timer = setInterval(this.getNewPoint, 5000);
            this.setState({ timer });
        }
    }

    getNewPoint = async () => {
        console.log('New Point set');
        let currentLocation = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        let newPoint = {
            latitude: currentLocation.coords.latitude,
            longitude: currentLocation.coords.longitude,
            timestamp: Date.now()
        }
        let { route } = this.state;
        route.point.push(newPoint);
        this.setState({ route });
    }

    abortTimer = async () => {
        clearInterval(this.state.timer);
    }

    editPoint(index, editedPoint) {
        let { route } = this.state;
        route.point[index] = editedPoint;
        this.setState({ route });
        this.props.route.params.updateFirebase();
    }

    addPoint = (newPoint) => {
        let { route } = this.state;
        route.point.push(newPoint);
        this.setState({ route });
        this.props.route.params.updateFirebase();
    }

    editHighlight = (index, editedHighlight) => {
        let { route } = this.state;
        route.highlight[index] = editedHighlight;
        this.setState({ route });
        this.props.route.params.updateFirebase();
    }

    addHighlight = (newHighlight) => {
        let { route } = this.state;
        route.highlight.push(newHighlight);
        this.setState({ route });
        this.props.route.params.updateFirebase();
    }

    deletePointOrHighlight = async (index) => {
        const input = await this.AsyncAlert();
        if (input === 'cancel') { return }
        let { route } = this.state;
        if (this.state.showPoints) {
            route.point.splice(index, 1);
        } else if (!this.state.showPoints) {
            route.highlight.splice(index, 1);
        }
        this.props.route.params.updateFirebase();
        this.setState(route);
    }

    AsyncAlert = () => {
        return new Promise((resolve) => {
            Alert.alert(
                'Löschen',
                this.state.showRoutes ? 'Willst du die Route wirklich löschen?' : 'Willst du das Highlight wirklich löschen?',
                [
                    { text: 'Abbrechen', style: 'cancel', onPress: () => resolve('cancel') },
                    { text: 'Löschen', style: 'destructive', onPress: () => resolve('delete') }
                ],
                { cancelable: false }
            )
        })
    }

    choosePointOrHighlightIOS = () =>
        ActionSheetIOS.showActionSheetWithOptions(
            {
                options: ["Abbrechen", "Punkte", "Highlights"],
                cancelButtonIndex: 0,
                userInterfaceStyle: 'dark'
            },
            buttonIndex => {
                if (buttonIndex === 0) {
                    // cancel action
                } else if (buttonIndex === 1) {
                    this.setState({ showPoints: true });

                } else if (buttonIndex === 2) {
                    this.setState({ showPoints: false });
                }
            }
        );

    renderMarker = () => {
        const route = this.state.route;
        let markers = [];
        let directions = [];
        let markerIndex = 0;
        let directionIndex = 1000;
        const highlights = route.highlight;
        highlights.forEach((highlight, highlightIndex) => {
            markers.push(
                <Marker
                    ref={(ref) => { this.markerRef = ref }}
                    key={markerIndex}
                    title={highlight.headline}
                    description={highlight.description}
                    coordinate={{ latitude: highlight.latitude, longitude: highlight.longitude }}
                    pinColor={'green'}
                    onPress={() => {
                        this.mapRef.animateToRegion({
                            latitude: highlight.latitude,
                            longitude: highlight.longitude,
                            latitudeDelta: this.mapRef.latitudeDelta,
                            longitudeDelta: this.mapRef.longitudeDelta
                        }, 400)
                        if (Platform.OS === 'ios') { this.markerRef.showCallout(); }
                        if (!this.state.showPoints) { this.flatListRef.scrollToIndex({ animated: true, index: highlightIndex }); }
                    }}
                />
            )
            markerIndex++;
        })
        const pointes = route.point;
        pointes.forEach((point, pointIndex) => {
            markers.push(
                <Marker
                    ref={(ref) => { this.markerRef = ref }}
                    key={markerIndex}
                    title={`Punkt ${pointIndex + 1}`}
                    // description={routes[routeIndex].headline}
                    coordinate={{ latitude: point.latitude, longitude: point.longitude }}
                    // pinColor={this.getPinColor(routeIndex)}
                    onPress={() => {
                        this.mapRef.animateToRegion({
                            latitude: point.latitude,
                            longitude: point.longitude,
                            latitudeDelta: this.mapRef.latitudeDelta,
                            longitudeDelta: this.mapRef.longitudeDelta
                        }, 400)
                        if (Platform.OS === 'ios') { this.markerRef.showCallout(); }
                        if (this.state.showPoints) { this.flatListRef.scrollToIndex({ animated: true, index: pointIndex }); }
                    }}
                />
            )
            if (pointIndex !== 0) {
                directions.push(
                    <MapViewDirections
                        key={directionIndex}
                        origin={{ latitude: pointes[pointIndex - 1].latitude, longitude: pointes[pointIndex - 1].longitude }}
                        destination={{ latitude: point.latitude, longitude: point.longitude }}
                        apikey={'AIzaSyBhNB5WvtU-WA535GzAcFDn3ajWv_vQzPw'}
                        strokeWidth={3}
                    />
                )
            }
            markerIndex++;
            directionIndex++;
        })
        directions.forEach((direction) => {
            markers.push(direction);
        })
        return markers;
    }
}

const styles = StyleSheet.create({
    container: {
        color: '#fff',
        flex: 1,
        alignItems: 'center'
    },
    map: {
        height: '60%',
        width: '100%',
    },
    routeHeadlineText: {
        paddingLeft: '10%',
        fontSize: 32,
        fontWeight: 'bold',
        paddingTop: 15
    },
    button: {
        width: 50,
        backgroundColor: "#b23b3b",
        borderRadius: 25,
        height: 50,
        alignItems: "center",
        justifyContent: "center",
    }
})