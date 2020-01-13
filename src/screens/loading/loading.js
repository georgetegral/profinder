import React from 'react'
import { View, Text, ActivityIndicator, StyleSheet, Alert, NetInfo, PermissionsAndroid } from 'react-native'
import firebase from 'react-native-firebase'
import AccessToken from 'react-native-fbsdk';
export default class Loading extends React.Component {
  //Facebook: facebook.com
  //Normal: password
  componentDidMount() {
    firebase.auth().onAuthStateChanged(user => {
      if(user===null){
        this.props.navigation.navigate('Login')
      } else {
        //Checar si el usuario ha iniciado sesion con Facebook
        var uId
        for (var providerInfo of user.providerData) {
          if (providerInfo.providerId == 'facebook.com') {
            uId = providerInfo.providerId;
          }
        }
        if(uId != 'facebook.com'){
          if(user.emailVerified){
            this.props.navigation.navigate('Home')
          } else {
            this.props.navigation.navigate('Login')
          }
        } else {
          this.props.navigation.navigate('Home')
        }

      }
    })
    this.requestFineLocation()
    NetInfo.isConnected.addEventListener('connectionChange', this.handleConnectionChange);
    NetInfo.isConnected.fetch().done(
      (isConnected) => { this.setState({ status: isConnected }); }
    );
  }

  componentWillUnmount() {
    NetInfo.isConnected.removeEventListener('connectionChange', this.handleConnectionChange);
  }
  handleConnectionChange = (isConnected) => {
        this.setState({ status: isConnected });
        console.log(`is connected: ${this.state.status}`);
        if(isConnected==false)
        Alert.alert('Atención', 'No tienes conexión a Internet. Asegúrate de conectarte a una red');
  }
  async requestFineLocation() {
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        'title': 'Permiso para usar servicios de localización',
        'message': 'ProFinder necesita acceder a servicios de localización ' +
                   'de tu celular para poder guíarte en la universidad.'
      }
    )
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      console.log("Exito Permisos")
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
          this.checkLocation(position.coords.latitude, position.coords.longitude)
        },
        (error) => alert(JSON.stringify(error)),
      );
    } else {
      console.log("Fallo permisos")
      //this.props.navigation.navigate('Login');
    }
  } catch (err) {
    console.warn(err)
  }
}

checkLocation(lat, long){
  if(lat>=25.655605&&lat<=25.665282&&long>=-100.423226&&long<=-100.416242){

  } else {
    Alert.alert('Atención', 'No estás dentro de la UDEM, para usar la aplicación debes de estar dentro del campus.');

  }
}

  render() {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#fff500" />
        <Text style={{fontFamily: 'SourceSansPro-SemiBold', fontSize: 16, color: '#535050'}}>Cargando</Text>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
})
