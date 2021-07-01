import React, { Component } from 'react';
import { createAppContainer, createSwitchNavigator } from 'react-navigation';
import { LogBox } from 'react-native';

import LoadingScreen from './js/screens/login/LoadingScreen';
import LoginScreen from './js/screens/login/LoginScreen';
import DashboardScreen from './js/screens/DashboardScreen';

import Firebase from './js/Firebase';

Firebase.init();
LogBox.ignoreAllLogs();

/**
 *  Main component
 */
export default class App extends Component {
  render() {
    return <LoginNavigator />;
  }
}

/**
 *  Definition of the login component, dashboard component and the loading component.
 *  Creates switch which screen is shown in the corresponding situation. 
 */
const AppSwitchNavigator = createSwitchNavigator({
  LoadingScreen: { screen: LoadingScreen },
  LoginScreen: { screen: LoginScreen },
  DashboardScreen: { screen: DashboardScreen }
})

/**
 * Creates a visible component based on the AppSwitchNavigator
 */
const LoginNavigator = createAppContainer(AppSwitchNavigator);