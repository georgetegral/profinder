import React, { Component } from 'react';
import {StyleSheet, Platform, Image, Text, Button, View, ListView, FlatList, TextInput, TouchableHighlight, Alert, Dimensions, Animated, ActivityIndicator, BackHandler} from 'react-native';
import { NavigationActions } from 'react-navigation';
import { Marker } from 'react-native-maps';
import MapView from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import ConditionalView from '../../components/ConditionalView/ConditionalView';
import firebase from 'react-native-firebase'
import Navbar from '../../components/NavBar/Navbar';
import Icon from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';

const {width, height} = Dimensions.get('window')

export default class MapMenu extends Component {
  state = { currentUser: null} //Para cerrar sesion
  constructor(props){
    super(props);
    this._didFocusSubscription = props.navigation.addListener('didFocus', payload =>
      BackHandler.addEventListener('hardwareBackPress', this.onBackButtonPressAndroid)
    );
    const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2})
    this.edifRef = firebase.database().ref().child("edificios");
    this.state = {
      edif: [],
      long: "",
      lat: "",
      dataSource: ds.cloneWithRows([]),
      rotateY: new Animated.Value(0),
      translateX: new Animated.Value(width),
      menuAnimation: new Animated.Value(0)
    }
  }
  componentDidMount() {
    const { currentUser } = firebase.auth()
    this.setState({
      currentUser
    });
    this.listenEdif(this.edifRef);
    this._willBlurSubscription = this.props.navigation.addListener('willBlur', payload =>
      BackHandler.removeEventListener('hardwareBackPress', this.onBackButtonPressAndroid)
    );
  }

  onBackButtonPressAndroid = () => {
    this.props.navigation.navigate('Home')
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

  listenEdif(edifRef){
    edifRef.orderByChild("alias").on('value', (dataSnapshot) => {
      var edif = [];
      dataSnapshot.forEach((child) => {
        edif.push({
          alias: child.val().alias,
          latitud: child.val().latitud,
          longitud: child.val().longitud,
          image: child.val().image
        });
      });
      edif.sort(function(a, b) {
        var textA = a.alias[0];
        var textB = b.alias[0];
        return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
      });
      this.state.edif=edif;
      this.setState({
        dataSource: this.state.dataSource.cloneWithRows(edif),
      })
    });
  }

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

  renderRow(rowData){
    var alias = rowData.alias;
    var longitud = rowData.longitud;
    var latitud = rowData.latitud;
    var img = rowData.image;
    if(img){
      return (
        <TouchableHighlight
          style={styles.containerCell}
          onPress={() => {
            this.props.navigation.navigate('Map', {
              lat: latitud,
              long: longitud
            });
          }}
          >
          <View>
            <View style={styles.footerContainer}>
              <View style={{flex: 8, flexDirection: 'row', justifyContent: 'flex-start'}}>
                <Text style={styles.textCard} >{alias[0]}</Text>
              </View>
              <View style={{flex: 3, flexDirection: 'row'}}>
                <Image source={{uri: img}}
                  style={{
                    flex: 1,
                    alignSelf: 'stretch',
                    resizeMode: "contain",
                    width: width/15,
                    height: height/10
                  }}
                />
              </View>
            </View>
          </View>
        </TouchableHighlight>
      )
    } else {
      return (
        <TouchableHighlight
          style={styles.containerCell}
          onPress={() => {
            this.props.navigation.navigate('Map', {
              lat: latitud,
              long: longitud
            });
          }}
          >
          <View>
            <View style={styles.footerContainer}>
              <Text style={styles.textCard} >{alias[0]}</Text>
            </View>
          </View>
        </TouchableHighlight>
      )
    }
  }

  render () {
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
        <View>

        <ConditionalView style={{flex: 0, alignItems:'center'}} hide={!this.state.edif.length<1}>
          <ActivityIndicator size="large" color="#fff500" />
          <Text style={{fontFamily: 'SourceSansPro-SemiBold', fontSize: 16, color: '#535050'}}>Cargando lugares</Text>
        </ConditionalView>

          <Text> </Text>
        </View>
        <ListView
          enableEmptySections={true}
          style={styles.listContainer}
          renderRow={this.renderRow.bind(this)}
          dataSource={this.state.dataSource}
        />

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

      </Animated.View>
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
          <Ionicons name='md-log-out' size={25} style={{ paddingLeft: 5, paddingRight: 5, color: "black" }}/>
          <Text style={{fontFamily: 'SourceSansPro-Regular', fontSize: 18, color: '#535050'}} onPress={() => this.signOutUser()} >Cerrar sesión</Text>
        </View>

      </Animated.View>
    </View>
    );
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
       borderRadius: 10,
       backgroundColor: '#F5F5F5'
    },
    drawerContainer: {
       flexDirection: 'row',
       alignItems:'center'
    },
    listContainer: {
        marginHorizontal: 10
    },
    containerCell: {
        marginBottom: 10
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
    textCard: {
      color: '#535050',
      fontSize: 18,
      fontFamily: 'SourceSansPro-Regular'
    },
})
