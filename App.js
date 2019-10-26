import React from 'react';

import { createStackNavigator } from 'react-navigation-stack';
import { createAppContainer} from 'react-navigation';
import KeyboardSpacer from 'react-native-keyboard-spacer';

import Start from './components/Start';
import Chat from './components/Chat';

//navigation on app. start.js has name and background pick then navigates to Chat.js
  const navigator = createStackNavigator({
    Start: {screen: Start},
    Chat: {screen: Chat}
  })

const navigatorContainer = createAppContainer(navigator);
//export as the root component
export default navigatorContainer;
