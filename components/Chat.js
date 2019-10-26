import React, { Component } from 'react';
//import relevant components from react native
import { StyleSheet, Text, View } from 'react-native';

import { GiftChat, GiftedChat, Bubble } from 'react-native-gifted-chat';
import { Platform } from '@unimodules/core';
//only for android chat 
import KeyboardSpacer from 'react-native-keyboard-spacer';


export default class Chat extends Component {
    constructor(props) {
        super(props);
    }

    state = {
        messages: [],
    }

    //Example messages for testing
    componentDidMount() {
        this.setState({
            messages: [
                {
                    _id: 1,
                    text: 'Hello Developer',
                    createdAt: new Date(),
                    user: {
                        _id: 2,
                        name: 'React Native',
                        avatar: 'https://placeimg.com/140/140/any',
                    },
                },
                {
                    _id: 2,
                    text: `Chatting with ${this.props.navigation.state.params.name}`,
                    createdAt: new Date(),
                    system: true,
                }
            ],
        }) 
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
            />
        )
    }


    onSend(messages = []) {
        this.setState(previousState => ({
            messages: GiftedChat.append(previousState.messages, messages),
        }))
    }

    //pulling in information from Start.js name/color
    static navigationOptions = ({ navigation }) => {
        return {
            name: navigation.state.params.name,
            color: navigation.state.params.color,
        };
    };

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