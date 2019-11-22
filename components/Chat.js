/* eslint-disable indent */
import React, { Component } from 'react';
// import relevant components from react native
import {
    StyleSheet,
    Text,
    View,
    AsyncStorage,
    NetInfo,
    Image,
} from 'react-native';

import { GiftedChat, InputToolbar } from 'react-native-gifted-chat';
import CustomActions from './CustomActions.js'

// MapView for geo coordinates
import MapView from "react-native-maps"

// only for android chat
import { Platform } from '@unimodules/core';
import KeyboardSpacer from 'react-native-keyboard-spacer';
import { ToolbarAndroid } from 'react-native-gesture-handler';

const firebase = require('firebase');
require('firebase/firestore');


export default class Chat extends Component {
    // pulling in information from Start.js name/color
     static navigationOptions = ({ navigation }) => {
        return {
            name: navigation.state.params.name,
        };
    };

    constructor(props) {
        super(props);
        if (!firebase.apps.length) {
            firebase.initializeApp({
                apiKey: 'AIzaSyDzslq3cM6HAkpNOaPwHJqfHSRon1nShJE',
                authDomain: 'chatapp-38cba.firebaseapp.com',
                databaseURL: 'https://chatapp-38cba.firebaseio.com',
                projectId: 'chatapp-38cba',
                storageBucket: 'chatapp-38cba.appspot.com',
                messagingSenderId: '851566681900',
                appId: '1:851566681900:web:c46c1951ed73232c6f1689',
                measurementId: 'G-NCRH2G1HTD',
            });
        }
        this.referenceChatUser = null;
        this.referenceChatMessages = firebase.firestore().collection('messages');

        this.state = {
            messages: [],
            uid: '',
            loggedIntext: 'Please wait.. Logging in..',
            isConnected: '',
            image: null,
            location: null,
            user: {
                _id: '',
                name: '',
            }
        }
    }

 // checking to see if offline/online
    componentDidMount() {
    // user is online
        NetInfo.isConnected.fetch().then(isConnected => {
               if (isConnected) {
                   this.authUnsubscribe = firebase.auth().onAuthStateChanged(async user => {
                       if (!user) {
                           try { 
                               await firebase.auth().signInAnonymously();
                           } catch (err) {
                               console.log(err)
                           }
                       }
                       //update user state with currently active user data
                       this.setState({
                         uid: user.uid,
                         loggedInText: 'Hello there',
                         isConnected: true,
                         user: {
                             _id: user.uid,
                             name: this.props.navigation.state.params.name,
                         },
                       });
                       this.referenceChatUser = firebase.firestore()
                           .collection('messages')
                           .orderBy('createdAt', 'desc')
                       this.unsubscribeChatUser = this.referenceChatUser.onSnapshot(this.onCollectionUpdate);
                     });
   // user is offline
               } else {
                   this.getMessages();
                   this.setState({
                       isConnected: false,
                   });
               }
        });
    }

     // unmounting
    componentWillUnmount() {
        this.unsubscribe();
        this.unsubscribeChatUser();
    }

    /**
     * Updates the state of the message with the input of the text.
     * @function onCollectionUpdate
     * @param {string} _id
     * @param {string} text - text message
     * @param {string} image - uri
     * @param {number} location - geo coordinates
     * @param {string} user
     * @param {date} createdAt - date/time of message creation
     */

    onCollectionUpdate = (querySnapshot) => {
        const messages = [];
        //go through each document
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          messages.push({
            _id: data._id,
            text: data.text || '',
            image: data.image || '',
            location: data.location || '',
            user: data.user,
            createdAt: data.createdAt.toDate(),
            // messages: data.message,
          });
        });
        this.setState({
          messages,
        });
      }

    /**
    * If user goes offline messages are stored in async storage
    * @function getMessages
    * @return messages
    */

    // retreiving messages from asyncStorage
    async getMessages() {
        let messages = '';
        try {
            messages = await AsyncStorage.getItem('messages') || [];
            this.setState({
                messages: JSON.parse(messages),
            });
        } catch (err) {
            console.log(err.message);
        }
    }

    /**
     * Adds the message the firebase database
     * @function addMessage
     * @param {number} _id
     * @param {string} text
     * @param {date} createdAt
     * @param {string} user
     * @param {image} image
     * @param {number} geo - coordinates
     */

    // Adding messages to the firebase database
    addMessage() {
        const message = this.state.messages[0];
        this.referenceChatMessages.add({
            _id: message._id,
            text: message.text || '',
            createdAt: message.createdAt,
            user: message.user,
            image: message.image || '',
            location: message.location || '',
        });
      }

    /**
    * saves messages to asyncStorage
    * @async
    * @function saveMessagetoStorage
    * @return {Promise<AsyncStorage>} message in asyncStorage
    */

    // setting messages in the async storage
    async saveMessagetoStorage() {
        try {
            await AsyncStorage.setItem('messages', JSON.stringify(this.state.messages));
        } catch (err) {
            console.log(err.message);
        }
    }

    /**
     * deletes messages from asyncStorage. Currently not used but written incase it is needed
     * @async
     * @function deleteMessages
     * @param {none}
     */

    // Deleting stored messages. Not currently called. But can be if needed
    async deleteMessages() {
        try {
            await AsyncStorage.removeItem('messages');
        } catch (err) {
            console.log(err.message);
        }
    }

    /**
     * @function onSend
     * @param {*} messages - message can be: {message/image/location}
     * @returns {state} updates state with message
     */

    // clicking that send button to send that message. adds to state and to database.
    onSend(messages = []) {
        this.setState(previousState => ({
            messages: GiftedChat.append(previousState.messages, messages),
        }), () => {
            //adds to asyncstorage
            this.saveMessagetoStorage();
            // adds to database
            this.addMessage();
        });
    }

    /**
     * removes toolbar if internet is not detected
     * @function renderInputToolbar
     * @param {*} props
     * @returns {InputToolbar}
     */

    // Removes toolbar if internet is not detected.
    renderInputToolbar(props) {
        if (this.state.isConnected == false) {
        }  else {
            return (
                <InputToolbar
                    {...props}
                />
            );
        }
    }

    // custom small + to take picture/upload picture/locaiton
    renderCustomActions = (props) => {
        return <CustomActions {...props} />;
    };

    /**
     * if currentMessage has location coords then mapview is returned
     * @function renderCustomView
     * @param {*} props
     * @returns {MapView}
     */

    // show map location
    renderCustomView(props) {
        const { currentMessage } = props;

        if (currentMessage.location) {
            // console.log(currentMessage, currentMessage[0], currentMessage.location.longitude)
            return (
                <MapView
                    style={{width: 150,
                        height: 100,
                        borderRadius: 13,
                        margin: 3}}
                    region={{
                        latitude: currentMessage.location.latitude,
                        longitude: currentMessage.location.longitude,
                        latitudeDelta: 0.0922,
                        longitudeDelta: 0.0421,
                    }}
                />
            )
        }
    }

    render(){
        return (
            <View style={{flex: 1, 
                justifyContent: 'center',
                backgroundColor: this.props.navigation.state.params.color}}
            >
                <Text> Hello {this.props.navigation.state.params.name}</Text>
                {this.state.image && 
                    <Image source={{uri: this.state.image.uri}} style={{width: 200, height: 200}} />
                }

                <GiftedChat
                    renderCustomView={this.renderCustomView}
                    renderInputToolbar={this.renderInputToolbar.bind(this)}
                    renderActions={this.renderCustomActions}
                    messages={this.state.messages}
                    onSend={messages => this.onSend(messages)}
                    user={this.state.user}
                />
                {/* Keyboard spacer for android only. */}
                {Platform.OS === 'android' ? <KeyboardSpacer /> : null}
            </View>
        )
    }
}

const styles = StyleSheet.create({
    // backgroundStateColor: {
    //    flex: 1,
    //    //Erroring about navigation
    // //    backgroundColor: this.props.navigation.state.params.color,
    // },
    // messages: {
    //     margin: '5px',
    // }

});
