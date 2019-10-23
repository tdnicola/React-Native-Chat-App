import React, { Component } from 'react';
//import relevant components from react native
import { StyleSheet, Text, View, TextInput, Button, ImageBackground} from 'react-native';

// create Screen1 (Start) class
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
            <View style={{flex: 1, backgroundColor: this.props.navigation.state.params.color}}>
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