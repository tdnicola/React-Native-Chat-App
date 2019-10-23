import React, { Component } from 'react';
//import relevant components from react native
import { StyleSheet, Text, View, TextInput, Button,} from 'react-native';

// create Screen1 (Start) class
export default class Chat extends Component {
    constructor(props) {
        super(props);
    }

    static navigationOptions = ({ navigation }) => {
        return {
            title: navigation.state.params.name
        };
    };

    render(){
        return (
                <Text> Hello {this.props.navigation.state.params.name}</Text>
        )
    }
}