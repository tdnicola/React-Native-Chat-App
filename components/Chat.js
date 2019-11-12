import React, { Component } from 'react';
//import relevant components from react native
import { StyleSheet, Text, View, AsyncStorage, NetInfo, Button, Image } from 'react-native';

import { GiftedChat, Bubble, InputToolbar } from 'react-native-gifted-chat';
import { Platform } from '@unimodules/core';
import CustomActions from './CustomActions.js'
//only for android chat 
import KeyboardSpacer from 'react-native-keyboard-spacer';
import * as Permissions from 'expo-permissions';
import * as ImagePicker from 'expo-image-picker';

const firebase = require('firebase');
require('firebase/firestore');


export default class Chat extends Component {
    //pulling in information from Start.js name/color
     static navigationOptions = ({ navigation }) => {
        return {
            name: navigation.state.params.name,
        };
    };

    constructor(props) {
        super(props);

        firebase.initializeApp({
            apiKey: "AIzaSyDzslq3cM6HAkpNOaPwHJqfHSRon1nShJE",
            authDomain: "chatapp-38cba.firebaseapp.com",
            databaseURL: "https://chatapp-38cba.firebaseio.com",
            projectId: "chatapp-38cba",
            storageBucket: "chatapp-38cba.appspot.com",
            messagingSenderId: "851566681900",
            appId: "1:851566681900:web:c46c1951ed73232c6f1689",
            measurementId: "G-NCRH2G1HTD"
        })
        this.referenceChatUser = null;
        this.referenceChatMessages = firebase.firestore().collection('messages');
        this.state = {
            messages: [],
            uid: 0,
            loggedIntext: 'Please wait.. Logging in..',
            isConnected: '',
            image: null,
        }
    }

    onCollectionUpdate = (querySnapshot) => {
        const messages =[];
        //go through each document
        querySnapshot.forEach((doc) => {
          var data = doc.data();
          messages.push({
            _id: data._id,
            text: data.text,
            image: data.image,
            location: data.location,
            user: this.state.uid,
            // messages: data.message,
          });
        });
        this.setState({
          messages,
        });
      }

//retreiving messages from asyncStorage
      async getMessages() {
        let messages = '';
        try {
            messages = await AsyncStorage.getItem('messages') || [];
            this.setState({
                messages: JSON.parse(messages)
            });
        } catch (err) {
            console.log(err.message);
        }
      }

    //adding messages to the database and setting the state of user id
    componentDidMount() {
        this.getMessages();

        NetInfo.isConnected.fetch().then(isConnected => {
            if(isConnected) {
                this.authUnsubscribe = firebase.auth().onAuthStateChanged((user) => {
                    if (!user) {
                        firebase.auth().signInAnonymously();
                    }
                    //update user state with currently active user data
                    this.setState({
                      uid: user.uid,
                      loggedInText: 'Hello there',
                      isConnected: true
                    });
                    this.referenceChatUser = firebase.firestore().collection('messages');
        
                    this.unsubscribeChatUser = this.referenceChatUser.onSnapshot(this.onCollectionUpdate)
              
                  });
            } else {
                this.getMessages();
                this.setState({
                    isConnected: false
                })
            }
        })
    }

//unmounting
    // componentWillUnmount(){
    //     // this.unsubscribe();
    //     this.unsubscribeChatUser();
    //   }


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

//Adding messages to the firebase database 
    addMessage() {
    const message = this.state.messages[0];
          this.referenceChatMessages.add({
            _id: message._id,
            text: message.text,
            createdAt: message.createdAt,
            user: message.user
        });
      }

//setting messages in the async storage
    async saveMessage() {
        try {
            await AsyncStorage.setItem('messages', JSON.stringify(this.state.messages));
        } catch (err) {
            console.log(err.message);
        }

    }

//Deleting stored messages 
    async deleteMessages() {
        try {
            await AsyncStorage.removeItem('messages');
        } catch (err) {
            console.log(err.message);
        }
    }

//clicking that send button to send that message. addes to state and to database.
    onSend(messages = []) {
        this.setState(previousState => ({
            messages: GiftedChat.append(previousState.messages, messages),
        }), () => {
            this.saveMessage()
        })
    }

//custom small + to take picture/upload picture/locaiton
    renderCustomActions = (props) => {
        return <CustomActions {...props} />;
    };

//show map location
    renderCustomView(props) {
        const { currentMessage } = props;

        if (currentMessage.location) {
            return (
                <MapView
                    style={{width: 150,
                        height: 100,
                        borderRadius: 13,
                        margin: 3}}
                    render={{
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
                    <Image source={{uri: this.state.image.uri}} style={{width: 200, height: 200}} />}
                <GiftedChat
                    renderCustomView={this.renderCustomView}
                    renderInputToolbar={this.renderInputToolbar.bind(this)}
                    renderActions={this.renderCustomActions}
                    messages={this.state.messages}
                    onSend={messages => this.onSend(messages)}
                    // key={this.createdAt}
                    user={this.state.uid}
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

})