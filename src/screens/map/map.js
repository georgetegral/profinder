import React, { Component } from 'react';
import {Platform, Text, StyleSheet, View, ListView, TouchableHighlight, Dimensions, Image, Animated, TextInput, Button, FlatList, Alert, BackHandler} from 'react-native';
import { NavigationActions } from 'react-navigation';
import { Marker } from 'react-native-maps';
import MapView from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import firebase from 'react-native-firebase'
import Navbar from '../../components/NavBar/Navbar';
import Icon from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';

const {width, height} = Dimensions.get('window')

export default class Maps extends React.Component {
  state = {currentUser: null}

  //Para cerrar sesion
  componentDidMount() {
    const { currentUser } = firebase.auth()
    this.setState({ currentUser })
    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.setState({
          region: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          latitudeDelta: 0.00499,
          longitudeDelta: 0.00499,

        },

        });
      },
      (error) => alert(JSON.stringify(error)),
    );
    this._willBlurSubscription = this.props.navigation.addListener('willBlur', payload =>
      BackHandler.removeEventListener('hardwareBackPress', this.onBackButtonPressAndroid)
    );
  }

  onBackButtonPressAndroid = () => {
    this.props.navigation.navigate('MapMenu')
    return true;
  };

  componentWillUnmount() {
    this._didFocusSubscription && this._didFocusSubscription.remove();
    this._willBlurSubscription && this._willBlurSubscription.remove();
  }

  signOutUser = async () => {
    try {
        await firebase.auth().signOut();
    } catch (e) {
        console.log(e);
    }
  }

  constructor(props){
    super(props)
    const { navigation } = this.props;
    const lat = navigation.getParam('lat', '0');
    const long = navigation.getParam('long', '0');
    this._didFocusSubscription = props.navigation.addListener('didFocus', payload =>
      BackHandler.addEventListener('hardwareBackPress', this.onBackButtonPressAndroid)
    );
    this.state = {
      latitude: null,
      longitude: null,
      lati: lat,
      longi: long,
      error: null,
      rotateY: new Animated.Value(0),
      translateX: new Animated.Value(width),
      menuAnimation: new Animated.Value(0)
    };
  }

  //Mostrar el menú
  showMenu(){
    if(this.state.isOpenMenu){
      this.setState({isOpenMenu: false})
      Animated.parallel([
      Animated.timing(
        this.state.translateX, {
          toValue: width
        }
      ),
      Animated.timing(
        this.state.rotateY, {
          toValue: 0
        }
      )
      ]).start()
    } else {
      this.setState({isOpenMenu: true})
      Animated.parallel([
        Animated.timing(
          this.state.translateX, {
            toValue: width * 0.55
          }
        ),
      Animated.timing(
        this.state.rotateY, {
          toValue: 0
        }
      ),
      Animated.timing(
        this.state.menuAnimation, {
          toValue: 1,
          duration: 800
        }
      )
      ]).start()
    }
  }
  closeMenu(){
        this.setState({isOpenMenu: false})
        Animated.parallel([
            Animated.timing(
                this.state.translateX, {
                    toValue: width
                }
            ),
            Animated.timing(
                this.state.rotateY, {
                    toValue: 0
                }
            ),
            Animated.timing(
                this.state.menuAnimation, {
                    toValue: 0,
                    duration: 300
                }
            )
        ]).start()
    }

  render() {
    const { currentUser } = this.state
    const corde = [{latitude: this.state.lati, longitude: this.state.longi},];
    return (
      <View style={styles.container}>
        <Animated.View
              style={[styles.content, {
                  width: width,
                  backgroundColor: 'white',
                  flex: 1,
                  transform: [
                      {
                          perspective: 450
                      },
                      {
                          translateX: this.state.translateX.interpolate({
                              inputRange: [0, width],
                              outputRange: [width, 0]
                          })
                      },
                      {
                          rotateY: this.state.rotateY.interpolate({
                              inputRange: [0, 1],
                              outputRange: ['0deg', '-10deg']
                          })
                      }
                  ]
              }]}
        >

        {this.state.isOpenMenu ? <Navbar icon="times" showMenu={this.closeMenu.bind(this)}/> : <Navbar icon="bars" showMenu={this.showMenu.bind(this)}/>}

          <MapView
            region={this.state.region}
            style={{ flex: 1 }}
              showsUserLocation={true}
              followUserLocation = {true}
              zoomEnabled = {true}
          >

          <MapViewDirections
            origin={this.state.region}
            destination={corde[0]}
            strokeWidth={4}
            strokeColor='red'
            apikey={'AIzaSyCavokDUEI9gItPP0WjIXYSpCexZGgU-cc'}
            mode="walking"
          />

          <Marker
            coordinate={corde[0]}
          />

          </MapView>

        </Animated.View>

        <View style={{flex: 0, flexDirection: 'row'}}>
          <View style={{flex: 1, alignItems: 'center'}}>
            <Ionicons name='md-school' size={25} style={{color: "gray" }} onPress={() => this.props.navigation.navigate('Home')}/>
            <Text style={{fontFamily: 'SourceSansPro-Regular', fontSize: 18, color: "gray"}} onPress={() => this.props.navigation.navigate('Home')}>Búsqueda</Text>
          </View>
          <View style={{flex: 1, alignItems: 'center'}}>
            <Ionicons name='md-map' size={25} style={{color: "black" }} onPress={() => this.props.navigation.navigate('MapMenu')}/>
            <Text style={{fontFamily: 'SourceSansPro-Regular', fontSize: 18, color: 'black'}} onPress={() => this.props.navigation.navigate('MapMenu')}>Mapas</Text>
          </View>
        </View>

        <Animated.View
          style={[styles.menu, {
            opacity: this.state.menuAnimation,
            position: 'absolute',
            width: 140,
            left: 0,
            top: 15,
            backgroundColor: 'transparent'
          }]}
          >
          <View style={styles.drawerContainer}>
            <Ionicons name='md-school' size={25} style={{ paddingLeft: 5, paddingRight: 5, color: "black" }}/>
            <Text style={{fontFamily: 'SourceSansPro-Regular', fontSize: 18, color: '#535050'}} onPress={() => this.props.navigation.navigate('Home')} >Búsqueda de profesor</Text>
          </View>
          <View style={styles.drawerContainer}>
            <Text></Text>
          </View>

          <View style={styles.drawerContainer}>
            <Ionicons name='md-map' size={25} style={{ paddingLeft: 5, paddingRight: 5, color: "black" }}/>
            <Text style={{fontFamily: 'SourceSansPro-Regular', fontSize: 18, color: '#535050'}} onPress={() => this.props.navigation.navigate('MapMenu')} >Mapas</Text>
          </View>
          <View style={styles.drawerContainer}>
            <Text></Text>
          </View>

          <View style={styles.drawerContainer}>
            <Ionicons name='md-log-out' size={25} style={{ paddingLeft: 5, paddingRight: 5, color: "black" }}/>
            <Text style={{fontFamily: 'SourceSansPro-Regular', fontSize: 18, color: '#535050'}} onPress={() => this.signOutUser()} >Cerrar sesión</Text>
          </View>
        </Animated.View>
      </View>
    )
  }
}
const styles = StyleSheet.create({
  container: {
      flex: 1,
      backgroundColor: '#ffffff'
  },
  content: {
      zIndex: 1
  },
  footerContainer: {
     flexDirection: 'row',
     paddingHorizontal: 10,
     paddingVertical: 10,
     backgroundColor: '#555566'
  },
  listContainer: {
      marginHorizontal: 10
  },
  text: {
      color: '#fff'
  },
  containerCell: {
      marginBottom: 10
  },
  textTitle: {
      fontSize: 13
  },
  textBy: {
      fontSize: 12
  },
  textMenu: {
      fontSize: 20,
      color: '#535050'
  },
  CerrarMenu: {
      fontSize: 20,
      color: '#fff',
      backgroundColor: 'red'
  },
  placeInput: {
    height: 30,
    borderColor: "black",
    borderWidth: 1,
    backgroundColor: '#ffffff'
  },
  inputContainer: {
    width: "100%",
    backgroundColor: '#ffffff'
  },
  filters: {
    marginLeft: 40,
    flexDirection: "row",
    height: 60,
    backgroundColor: '#ffffff'
  },
  drawerContainer: {
     flexDirection: 'row',
     alignItems:'center'
  }
})
