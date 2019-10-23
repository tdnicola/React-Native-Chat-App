import React, { Component } from 'react';
//import relevant components from react native
import { StyleSheet, Text, View } from 'react-native';

export default class Chat extends Component {
    constructor(props) {
        super(props);
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
                alignItems: 'center', 
                backgroundColor: this.props.navigation.state.params.color}}
            >
                <Text> Hello {this.props.navigation.state.params.name}</Text>
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