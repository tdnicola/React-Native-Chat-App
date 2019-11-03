import React, { Component } from 'react';
//import relevant components from react native
import { StyleSheet, Text, View, FlatList } from 'react-native';

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
            this.referenceChatUser = firebase.firestore().collection('messages');

            this.unsubscribeChatUser = this.referenceChatUser.onSnapshot(this.onCollectionUpdate)
      
          });
    }

//unmounting
    componentWillUnmount(){
        this.unsubscribe();
        this.unsubscribeChatUser();
      }


//Adding messages to the database 
    addMessage() {
    const message = this.state.messages[0];

        // console.log('HELLO')
          this.referenceChatMessages.add({
            _id: message._id,
            text: message.text,
            createdAt: message.createdAt,
            user: message.user
        });
      }

    
//clicking that send button to send that message. addes to state and to database.
    onSend(messages = []) {
        this.setState(previousState => ({
            messages: GiftedChat.append(previousState.messages, messages),
        }),
            () => this.addMessage()
        )
    }

    render(){
        return (
            <View style={{flex: 1, 
                justifyContent: 'center',
                backgroundColor: this.props.navigation.state.params.color}}
            >
                <Text> Hello {this.props.navigation.state.params.name}</Text>
                <GiftedChat
                    messages={this.state.messages}
                    onSend={messages => this.onSend(messages)}
                    user={this.state.uid}
                />
                {/* <FlatList
                    data={this.state.messages}
                    renderItem={({item}) => 
                    <Text> {item}</Text>}
                /> */}
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