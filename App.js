import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { createStackNavigator } from 'react-navigation-stack';
import { createAppContainer} from 'react-navigation';

import Start from './components/Start';
import Chat from './components/Chat';

  const navigator = createStackNavigator({
    Start: {screen: Start},
    Chat: {screen: Chat}

  })

const navigatorContainer = createAppContainer(navigator);
//export as the root component
export default navigatorContainer;
