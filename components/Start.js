import React, { Component } from 'react';
//import relevant components from react native
import { StyleSheet, Text, View, TextInput, Button, ImageBackground} from 'react-native';

// create Screen1 (Start) class
export default class Start extends Component {
    constructor(props) {
        super(props);
        this.state = { name: '' }
    }
    
    render(){
        return (
            <ImageBackground source={require('../assets/chatBackground.png')} style={{width: '100%', height: '100%'}}>

                <View style={{flex:1, justifyContent: 'center', alignItems: 'center'}}>
                    <TextInput
                        style={{height: 40, borderColor: 'gray', borderWidth: .5}}
                        onChangeText={(name) => this.setState({name})}
                        value={this.state.name}
                        placeholder='Enter your name'
                    />
                    <Button 
                        title='Enter Chatroom'
                        onPress={() => this.props.navigation.navigate('Chat', {name: this.state.name})}
                    />
                </View>
            </ImageBackground>
        )
    }
}