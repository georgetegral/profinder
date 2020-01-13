import React, {Component} from 'react'
import {Text, StyleSheet, View, TouchableWithoutFeedback} from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome'
import Ionicons from 'react-native-vector-icons/Ionicons';
import firebase from 'react-native-firebase';

export default class Navbar extends Component {

  signOutUser = async () => {
    try {
        await firebase.auth().signOut();
    } catch (e) {
        console.log(e);
    }
  }

    render(){
        return (
            <View style={styles.containerNavbar}>

                <Icon name={this.props.icon} size={25} color="#fff500" />

                <View style={styles.titleContainer}>
                  <Ionicons name='md-school' size={25} style={{ paddingRight: 5, color: "#535050" }}/>
                  <Text style={{fontFamily: 'SourceSansPro-Bold', fontSize: 22, color: '#535050'}}>ProFinder</Text>
                </View>
                <TouchableWithoutFeedback onPress={() => this.signOutUser()} hitSlop={{top: 50, bottom: 50, left: 50, right: 50}}>
                  <Ionicons name='md-log-out' size={25} color="#535050" />
                </TouchableWithoutFeedback>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    containerNavbar: {
        backgroundColor: '#fff500',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems:'center',
        paddingHorizontal: 10,
        paddingVertical: 10,
        paddingTop: 10
    },
    titleContainer: {
       flexDirection: 'row',
       justifyContent:'center',
       alignItems:'center'
    }
})
