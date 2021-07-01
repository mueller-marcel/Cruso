import React, { Component } from 'react';
import { View, StyleSheet, Text, FlatList, Platform, ActionSheetIOS, TouchableOpacity, Alert } from 'react-native';
import { Modalize } from 'react-native-modalize';
import { Picker } from '@react-native-picker/picker';
import * as Icon from '@expo/vector-icons';

import RouteOrHighlightItem from '../../components/home/RouteOrHighlightItem';
import OverviewText from '../../components/home/OverviewText';
import { renderTags, renderDateSpan } from '../../RenderHelper';
import RoundButton from '../../components/Helpers/RoundButton';

import MapViewDirections from 'react-native-maps-directions';
import MapView, { Marker } from 'react-native-maps';

export default class RouteScreen extends Component {
    state = { journey: this.props.route.params.journey, journeyIndex: this.props.route.params.journeyIndex, showRoutes: true, selectedValue: 'route' }
    render() {
        let { journey, showRoutes, selectedValue } = this.state;
        return (
            <View style={styles.container}>
                <MapView
                    ref={map => { this.mapRef = map }}
                    style={styles.map}
                    initialRegion={{
                        latitude: journey.route.length === 0 ? 48 : journey.route[0].point.length === 0 ? 48 : journey.route[0].point[0].latitude,
                        longitude: journey.route.length === 0 ? 8 : journey.route[0].point.length === 0 ? 8 : journey.route[0].point[0].longitude,
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
                    panGestureEnabled={false}>
                    <View>
                        <OverviewText text={journey.headline} icon='globe' iconSize={25} type='headline' />
                        <OverviewText text={journey.description} icon='file-text' iconSize={20} type='description' />
                        <OverviewText text={renderTags(journey.tag)} icon='tags' iconSize={20} type='tags' />
                        <OverviewText text={renderDateSpan(journey.departure_timestamp, journey.arrival_timestamp)} icon='calendar' iconSize={20} type='date' />
                        <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', paddingRight: '10%', paddingLeft: '10%' }}>
                            {Platform.OS === 'ios' &&
                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                    <Text style={styles.routeHeadlineText}>{showRoutes ? 'Routen' : 'Highlights'}</Text>
                                    <TouchableOpacity style={{ paddingLeft: 5, paddingTop: 10 }} onPress={() => this.chooseHighlightOrRouteIOS()}>
                                        <Icon.AntDesign name="down" color={'#096d51'} size={25} />
                                    </TouchableOpacity>
                                </View>}
                            {Platform.OS === 'android' &&
                                <Picker
                                    selectedValue={selectedValue}
                                    style={[styles.routeHeadlineText, { height: 50, width: 140 }]}
                                    itemStyle={{ backgroundColor: 'green' }}
                                    onValueChange={(itemValue) => {
                                        if (itemValue === 'route') { this.setState({ showRoutes: true, selectedValue: itemValue }); }
                                        else if (itemValue === 'highlight') { this.setState({ showRoutes: false, selectedValue: itemValue }); }
                                    }}
                                >
                                    <Picker.Item label='Routen' value='route' />
                                    <Picker.Item label='Highlights' value='highlight' />
                                </Picker>
                            }
                            <RoundButton
                                onPress={() => {
                                    this.props.navigation.navigate('NewRouteOrHighlight', { action: 'add', onNewRoute: this.addRoute.bind(this), onNewHighlight: this.addHighlight.bind(this), type: showRoutes ? 'route' : 'highlight' })
                                }}
                                icon='plus'
                            />
                        </View>
                        <View style={{ padding: 10 }}>
                            <FlatList
                                ref={(ref) => { this.flatListRef = ref }}
                                showsHorizontalScrollIndicator={false}
                                horizontal={true}
                                data={showRoutes ? journey.route : journey.highlight}
                                keyExtractor={(item, index) => index.toString()}
                                renderItem={({ item, index }) =>
                                    <RouteOrHighlightItem
                                        item={item}
                                        onDelete={() => this.deleteRoute(index)}
                                        onEdit={() => this.props.navigation.navigate('NewRouteOrHighlight', { action: 'edit', item: item, index: index, type: showRoutes ? 'route' : 'highlight', onEditedRoute: this.editRoute.bind(this), onEditedHighlight: this.editHighlight.bind(this) })}
                                        onPressDetail={() => showRoutes ? this.props.navigation.navigate('RouteDetail', { route: item, updateFirebase: this.updateFirebase.bind(this) }) : this.props.navigation.navigate('HighlightDetail', { highlight: item })}
                                        type={showRoutes ? 'route' : 'highlight'} />}
                                ItemSeparatorComponent={() => <View style={{ paddingLeft: 20 }} />}
                                ListEmptyComponent={() => <Text style={{ padding: 65 }} >Hier wurde noch nichts angelegt.</Text>}
                            />
                        </View>
                    </View>
                </Modalize>
            </View >
        )
    }

    /**
     * Callback method to update the edited route in firebase
     */
    editRoute = (index, editedRoute) => {
        let { journey } = this.state;
        journey.route[index] = editedRoute;
        this.updateFirebase();
        this.setState(journey);
    }

    /**
     * Callback method to update the edited highlight in firebase
     */
    editHighlight = (index, editedHighlight) => {
        let { journey } = this.state;
        journey.highlight[index] = editedHighlight;
        this.updateFirebase();
        this.setState(journey);
    }

    /**
     * Callback method to delete routes
     */
    deleteRoute = async (index) => {
        const input = await this.AsyncAlert();
        if (input === 'cancel') { return }
        let { journey } = this.state;
        if (this.state.showRoutes) {
            journey.route.splice(index, 1);
        } else if (!this.state.showRoutes) {
            journey.highlight.splice(index, 1);
        }
        this.updateFirebase();
        this.setState(journey);
    }

    /**
     * Update in firebase
     */
    updateFirebase = () => {
        this.props.route.params.updateFirebase();
    }

    /**
     * Callback method to add new routes
     */
    addRoute = (newRoute) => {
        let { journey } = this.state;
        journey.route.push(newRoute);
        this.setState({ journey });
        this.updateFirebase();
    }

    /**
     * Callback method to add new routes
     */
    addHighlight = (newHighlight) => {
        let { journey } = this.state;
        journey.highlight.push(newHighlight);
        this.setState({ journey });
        this.updateFirebase();
    }

    /**
     * Lets the user confirm the deletion
     */
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

    /**
     * Choose between routes and highlights (iOS only)
     */
    chooseHighlightOrRouteIOS = () =>
        ActionSheetIOS.showActionSheetWithOptions(
            {
                options: ["Abbrechen", "Routen", "Highlights"],
                cancelButtonIndex: 0,
                userInterfaceStyle: 'dark'
            },
            buttonIndex => {
                if (buttonIndex === 0) {
                    // cancel action
                } else if (buttonIndex === 1) {
                    this.setState({ showRoutes: true });
                } else if (buttonIndex === 2) {
                    this.setState({ showRoutes: false });
                }
            }
        );

    renderMarker = () => {
        const journey = this.state.journey;
        let markers = [];
        let directions = [];
        let markerIndex = 0;
        let directionIndex = 1000;
        const highlights = journey.highlight;
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
                        if (Platform.OS === 'ios') {
                            this.markerRef.showCallout();
                        }
                        if (!this.state.showRoutes) {
                            this.flatListRef.scrollToIndex({ animated: true, index: highlightIndex })
                        }
                    }}
                />
            )
            markerIndex++;
        })
        const routes = journey.route;
        routes.forEach((route, routeIndex) => {
            const pointes = route.point;
            pointes.forEach((point, pointIndex) => {
                if (pointIndex === 0 || pointIndex === pointes.length - 1) {
                    markers.push(
                        <Marker
                            ref={(ref) => { this.markerRef = ref }}
                            key={markerIndex}
                            title={`Route ${routeIndex + 1}`}
                            description={routes[routeIndex].headline}
                            coordinate={{ latitude: point.latitude, longitude: point.longitude }}
                            pinColor={this.getPinColor(routeIndex)}
                            onPress={() => {
                                this.mapRef.animateToRegion({
                                    latitude: point.latitude,
                                    longitude: point.longitude,
                                    latitudeDelta: this.mapRef.latitudeDelta,
                                    longitudeDelta: this.mapRef.longitudeDelta
                                }, 400)
                                if (Platform.OS === 'ios') { this.markerRef.showCallout(); }
                                if (this.state.showRoutes) { this.flatListRef.scrollToIndex({ animated: true, index: routeIndex }); }
                            }}
                        />
                    )
                }
                if (pointIndex !== 0) {
                    directions.push(
                        <MapViewDirections
                            key={directionIndex}
                            origin={{ latitude: pointes[pointIndex - 1].latitude, longitude: pointes[pointIndex - 1].longitude }}
                            destination={{ latitude: point.latitude, longitude: point.longitude }}
                            apikey={'AIzaSyBhNB5WvtU-WA535GzAcFDn3ajWv_vQzPw'}
                            strokeWidth={3}
                            strokeColor={this.getPinColor(routeIndex)}
                        >
                        </MapViewDirections>
                    )
                }
                markerIndex++;
                directionIndex++;
            })
        })
        directions.forEach((direction) => {
            markers.push(direction);
        })
        return markers;
    }

    /**
     * Return a color for the pin
     */
    getPinColor = (routeIndex) => {
        colors = ['red', 'orange', 'green', 'blue', 'black', 'purple'];
        return colors[routeIndex % colors.length];
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
        fontSize: 32,
        fontWeight: 'bold',
        paddingTop: 15
    }
})