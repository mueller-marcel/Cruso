import React, { Component } from 'react';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import * as Icon from '@expo/vector-icons';

import HomeScreen from './screens/home/HomeScreen';
import RouteScreen from './screens/home/RouteScreen';
import RouteDetailScreen from './screens/home/RouteDetailScreen';
import HighlightDetailScreen from './screens/home/HighlightDetailScreen';
import MapScreen from './screens/MapScreen';
import SettingsScreen from './screens/SettingsScreen';
import NewRouteOrHighlight from './components/home/NewRouteOrHighlight';
import NewJourneyModal from './components/home/NewJourneyModal';
import NewPoint from './components/home/NewPoint';
import EditJourney from './components/home/EditJourney';

/**
 * Create a bottom tab navigation
 */
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function HomeStack() {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name='Reisen'
                component={HomeScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="NewJourneyModal"
                component={NewJourneyModal}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="EditJourney"
                component={EditJourney}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name='Routen'
                component={RouteScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name='RouteDetail'
                component={RouteDetailScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name='HighlightDetail'
                component={HighlightDetailScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name='NewRouteOrHighlight'
                component={NewRouteOrHighlight}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name='NewPoint'
                component={NewPoint}
                options={{ headerShown: false }}
            />
        </Stack.Navigator>
    )
}


/**
 * Define a component for the bottomTabNavigation
 */
export default class AppNavigator extends Component {
    render() {
        return (
            <NavigationContainer>
                <Tab.Navigator>
                    <Tab.Screen
                        name="Home"
                        component={HomeStack}
                        options={{
                            title: 'Home',
                            tabBarIcon: ({ focused, size }) => {
                                const icon = focused ? "home" : "home-outline";
                                return <Icon.Ionicons name={icon} color={'#097770'} size={size} />
                            },
                            tabBarLabel: ({ focused }) => (<Text style={{ color: focused ? '#097770' : "gray", fontSize: 12 }}>Home</Text>)
                        }}
                    />
                    <Tab.Screen
                        name="Map"
                        component={MapScreen}
                        options={{
                            title: 'Karte',
                            tabBarIcon: ({ focused, size }) => {
                                const icon = focused ? "map" : "map-outline";
                                return <Icon.Ionicons name={icon} color={'#097770'} size={size} />
                            },
                            tabBarLabel: ({ focused }) => (<Text style={{ color: focused ? '#097770' : "gray", fontSize: 12 }}>Karte</Text>)
                        }}
                    />
                    <Tab.Screen
                        name="Settings"
                        component={SettingsScreen}
                        options={{
                            title: 'Einstellungen',
                            tabBarIcon: ({ focused, size }) => {
                                const icon = focused ? "settings" : "settings-outline";
                                return <Icon.Ionicons name={icon} color={'#097770'} size={size} />
                            },
                            tabBarLabel: ({ focused }) => (<Text style={{ color: focused ? '#097770' : "gray", fontSize: 12 }}>Einstellungen</Text>)
                        }}
                    />
                </Tab.Navigator>
            </NavigationContainer>
        );
    }
}