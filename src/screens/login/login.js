import React from 'react'
import { StyleSheet, Text, TextInput, View, Image, Dimensions, Alert, TouchableOpacity, NetInfo, PermissionsAndroid} from 'react-native'
import firebase from 'react-native-firebase'
import { AccessToken, LoginManager } from 'react-native-fbsdk';
import ButtonWithBackground from "../../components/ButtonWithBackground/ButtonWithBackground";
import DefaultInput from "../../components/DefaultInput/DefaultInput";
import LogoUDEM from "../../assets/udemLogoGrande.jpg";
import LogoPro from "../../assets/profinderLogo.png";
import Ionicons from 'react-native-vector-icons/Ionicons';

export default class Login extends React.Component {
  state = { email: '', password: '', errorMessage: null}

  componentDidMount() {
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
  }


  //Login Firebase
  handleLogin = () => {
    console.log("handleLogin pressed")
    const { email, password } = this.state;
      if(email!=""&&password!=""){
        firebase
        .auth()
        .signInWithEmailAndPassword(email, password)
        .then((user) => {
          console.log(password);
          if (user.emailVerified){
            this.props.navigation.navigate('Home')
          } else {
            Alert.alert(
              'Error',
              'No has verificado tu cuenta, porfavor verifícala.',
            );
            this.props.navigation.navigate('Login')
          }
        })
        //.catch(error => this.setState({ errorMessage: error.message },alert(error.message)))
        .catch(function(error) {
          errorCode = error.code;
          errorMessage = error.message;
          if (errorCode === 'auth/wrong-password') {
            Alert.alert(
              'Error',
              'Contraseña incorrecta',
            );
          }
          if (errorMessage === 'The given password is invalid. [ Password should be at least 6 characters ]') {
            Alert.alert(
              'Error',
              'La contraseña debe de tener por lo menos 6 caracteres.',
            );
          }
          if (errorCode === 'auth/invalid-email') {
            Alert.alert(
              'Error',
              'Correo electrónico inválido.',
            );
          }
          if (errorCode === 'auth/user-not-found') {
            Alert.alert(
              'Error',
              'No existe una cuenta con este correo electrónico.',
            );
          }
          if (errorMessage === 'The email address is already in use by another account.') {
            Alert.alert(
              'Error',
              'Ya existe una cuenta con este correo electrónico.',
            );
          }
        });
      }
      if(email==""||password==""){
        Alert.alert(
          'Error',
          'Porfavor llena los campos de correo y contraseña.',
        );
      }
  }
  //Login Facebook
  loginFacebook = () => {
        LoginManager.logInWithReadPermissions(['public_profile', 'email'])
        .then((result) => {
          if (result.isCancelled) {
            return Promise.reject(new Error('The user cancelled the request'));
          }
          return AccessToken.getCurrentAccessToken();
        })
        .then((data) => {
          const credential = firebase.auth.FacebookAuthProvider.credential(data.accessToken);
          return firebase.auth().signInWithCredential(credential);
        })
        .then((user) => {
          this.props.navigation.navigate('Home');
        })
        .catch((error) => {
          const { code, message } = error;
        });
  }

  checkLocation(lat, long){
    if(lat>=25.655605&&lat<=25.665282&&long>=-100.423226&&long<=-100.416242){
      return true;
    } else {
      Alert.alert('Atención', 'No estás dentro de la UDEM, para usar la aplicación debes de estar dentro del campus.');
      return false;
    }
  }

  render() {
    const passMessage = <Text style={styles.textPassMessage}>La contraseña debe de tener por lo menos 6 caracteres.</Text>
    return (
      <View style={styles.container}>

      <Image
        source={LogoUDEM}
        style={styles.Logo}
        resizeMode="contain"
      />

      <View style={styles.titleContainer}>
      <Ionicons name='md-school' size={25} style={{ paddingRight: 5, color: "#FBD407" }}/>
        <Text style={{fontFamily: 'SourceSansPro-Bold', fontSize: 18, color: 'gray'}}>ProFinder</Text>
      </View>
      <View style={styles.titleContainer,{height: height/9}}>
        <Text style={{fontFamily: 'SourceSansPro-Regular', fontSize: 18, color: 'black'}}>Inicio de sesión</Text>
      </View>

        <DefaultInput
          autoCapitalize="none"
          placeholder="Correo electrónico"
          onChangeText={email => this.setState({ email })}
          value={this.state.email}
        />

        <DefaultInput
          secureTextEntry
          autoCapitalize="none"
          placeholder="Contraseña"
          onChangeText={password => this.setState({ password })}
          value={this.state.password}
          maxLength= {30} //La contraseña no puede ser mayor a 30 caracteres
        />

        <View style={{ width: width/1.43, justifyContent:'center', alignItems:'center'}}>
          {this.state.password.length>0&&this.state.password.length<6 ? passMessage : undefined}
        </View>

        <ButtonWithBackground
          color="#fff500"
          onPress={this.handleLogin}
        >
        <Text style={{fontFamily: 'SourceSansPro-SemiBold', fontSize: 14, color: 'black'}}>Iniciar sesión</Text>
        </ButtonWithBackground>

        <ButtonWithBackground
          color="#3B5998"
          onPress={this.loginFacebook}
        >
        <Text style={{fontFamily: 'SourceSansPro-SemiBold', fontSize: 14, color: 'white'}}>Iniciar sesión con Facebook</Text>
        </ButtonWithBackground>

        <View style={{ flex: 0, width: '70%' }}>
          <View style={{ flex: 1 }}>
            <Text
              style={styles.textRegister}
              onPress={() => this.props.navigation.navigate('SignUp')}
              >
              Registro
            </Text>
          </View>
          <View style={{ flex: 1, alignItems:'flex-end' }}>
            <Text
              style={styles.textRegister}
              onPress={() => this.props.navigation.navigate('RestorePass')}
              >
              Recuperar{"\n"}contraseña
            </Text>
          </View>
        </View>
      </View>
    )
  }
}

var {width, height} = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FCFCFC'
  },
  titleContainer: {
     width: width,
     flexDirection: 'row',
     justifyContent:'center',
     alignItems:'center'
  },
  textBase: {
    color: 'black',
    fontFamily: 'SourceSansPro-Regular'
  },
  textRegister: {
    color: 'black',
    fontSize: 15,
    fontFamily: 'SourceSansPro-Regular',
    textDecorationLine: 'underline'
  },
  Logo: {
    width: width/1.5,
    height:  height/4.5
  },
  textPassMessage: {
    color: 'red',
    fontSize: 12,
    fontFamily: 'SourceSansPro-Regular'
  }
})
