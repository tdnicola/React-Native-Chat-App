import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Button,  } from 'react-native';

import * as Permissions from 'expo-permissions';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import MapView from "react-native-maps"

const firebase = require('firebase');

export default class CustomActions extends React.Component {
    constructor() {
        super()

        this.state = {
            image: null,
            location: null
        }
    }

        //picking a photo from the photo library
    pickImage = async () => {
        const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);

        if (status === 'granted') {
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: 'Images',
            }).catch(err => console.log(err));

            if (!result.cancelled) {
                this.setState({
                    image: result
                });

                //testing naming convention
                const getImageName = result.uri.split('/')
                console.log(getImageName)
                this.props.onSend({image: result.uri})
            }
        }
    }

    //taking a photo and setting it to the state
    takePhoto = async () => {
        const { status } = await Permissions.askAsync(Permissions.CAMERA, Permissions.CAMERA_ROLL)

        if (status === 'granted') {
            let result = await ImagePicker.launchCameraAsync({
                mediaTypes: 'Images',
            }).catch (err => console.log(err));

            if (!result.cancelled) {
                this.setState({
                    image: result
                });
                this.props.onSend({image: result.uri})
                this.uploadImage(result.uri)
            }
        }
    }

    //uploading image to the cloud
    uploadImage = async (uri) => {
        const blob = await new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.onload = (() => {
                resolve(xhr.response);
            });
            xhr.onerror = ((e) => {
                console.log(e);
                reject(new TypeError('NETWORK REQUEST FAILED'));
            });
            xhr.responseType = 'blob';
            xhr.open('GET', uri, true);
            xhr.send(null);
        });

        const getImageName = uri.split('/')
        //needs new child name each upload
        const ref = firebase.storage().ref().child(uri);
        const snapshot = await ref.put(blob);

        blob.close();

        return await snapshot.ref.getDownloadURL()
    }

    getLocationtoSendtoWeirdos = async () => {
        const { status } = await Permissions.askAsync(Permissions.LOCATION);

        if (status === 'granted') {
            let result = await Location.getCurrentPositionAsync({});

            if (result) {
                this.setState({
                    location: result
                });
                console.log(result)
                this.props.onSend({location: {
                    longitude: result.coords.longitude,
                    latitude: result.coords.latitude
                }});
            }
        }
    } 

    onActionPress = () => {
        const options = ['Choose From Library', 'Take picture', 'Send your location to a weirdo', 'Cancel']
        const cancelButtonIndex = options.length - 1;

        this.context.actionSheet().showActionSheetWithOptions(
            {
                options,
                cancelButtonIndex,
            },
            async(buttonIndex) => {
                switch(buttonIndex) {
                    case 0:
                        this.pickImage()
                        return;
                    case 1: 
                        this.takePhoto()
                        return;
                    case 2: 
                        this.getLocationtoSendtoWeirdos()
                        return;
                }
            },
        ) ;
    }; 

    render() {
        return(
            <TouchableOpacity 
                style={[styles.container]}
                onPress={this.onActionPress}
            >
                <View style={[styles.wrapper, this.props.wrapperStyle]}>
                    <Text style={[styles.iconText, this.props.iconTextStyle]}>+</Text>
                </View>
            </TouchableOpacity>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        width: 26,
        height: 26,
        marginLeft: 10,
        marginBottom: 10,
    },
    wrapper: {
        borderRadius: 13,
        borderColor: '#b2b2b2',
        borderWidth: 2,
        flex: 1,
    },
    iconText: {
        color: '#b2b2b2',
        fontWeight: 'bold',
        fontSize: 16,
        backgroundColor: 'transparent',
        textAlign: 'center',
    },
})

CustomActions.contextTypes = {
    actionSheet: PropTypes.func,
};