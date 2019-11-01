import React, { Component } from 'react';
//import relevant components from react native
import { StyleSheet, Text, View } from 'react-native';

import { GiftedChat, Bubble } from 'react-native-gifted-chat';
import { Platform } from '@unimodules/core';
//only for android chat 
import KeyboardSpacer from 'react-native-keyboard-spacer';

const firebase = require('firebase');
require('firebase/firestore');


export default class Chat extends Component {
    //pulling in information from Start.js name/color
     static navigationOptions = ({ navigation }) => {
        return {
            name: navigation.state.params.name,
            color: navigation.state.params.color,
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
            loggedIntext: 'Please wait.. Logging in..'
        }
    }

    onCollectionUpdate = (querySnapshot) => {
        const messages =[];
        //go through each document
        querySnapshot.forEach((doc) => {
          var data = doc.data();
          messages.push({
            message: data.message,
          });
        });
    
        this.setState({
          messages,
        })
      }

    //adding messages to the database and setting the state of user id
    componentDidMount() {
        this.authUnsubscribe = firebase.auth().onAuthStateChanged((user) => {
            if (!user) {
                firebase.auth().signInAnonymously();
            }
            //update user state with currently active user data
            this.setState({
              uid: user.uid,
              loggedInText: 'Hello there',
            });
            // currently not needed,  selecting messages based off of the user id.
            // this.referenceChatUser = firebase.firestore().collection('messages').where('uid', '==', this.state.uid);
            // this.unsubscribeMessageUser = this.referenceChatUser.onSnapshot(this.onCollectionUpdate)
      
          });
    }

//unmounting
    componentWillUnmount(){
        this.unsubscribe();
        // this.unsubscribeMessageUser();
      }
      
// changing the color of the text bubble
    renderBubble(props) {
        return (
            <Bubble 
                {...props}
                wrapperStyle={{
                    right: {
                        backgroundColor: '#000'
                    }
                }}
                textStyle={{
                    style: {
                        color: 'black',
                    }
                }}
            />
        )
    }

    onSend(messages = []) {
        this.setState(previousState => ({
            messages: GiftedChat.append(previousState.messages, messages),
        }))

// sending messages to firebase database
        this.referenceChatMessages.add({
            messages,
            uid: this.state.uid,
        })
    }

    render(){
        return (
            <View style={{flex: 1, 
                justifyContent: 'center',
                backgroundColor: this.props.navigation.state.params.color}}
            >
                <Text> Hello {this.props.navigation.state.params.name}</Text>
                <GiftedChat
                    renderBubble={this.renderBubble.bind(this)}
                    messages={this.state.messages}
                    onSend={messages => this.onSend(messages)}
                    user={{
                        _id: 1,
                    }}
                />
                {/* Keyboard spacer for android only. */}
                {Platform.OS === 'android' ? <KeyboardSpacer /> : null}
            </View>
        )
    }
}

const styles = StyleSheet.create({
    backgroundStateColor: {
       flex: 1,
       //Erroring about navigation
    //    backgroundColor: this.props.navigation.state.params.color,
    }
})