import React from 'react'
import { StyleSheet, Text, TextInput, View, Image, Dimensions, Alert,TouchableOpacity} from 'react-native'
import firebase from 'react-native-firebase'
import ButtonWithBackground from "../../components/ButtonWithBackground/ButtonWithBackground";
import DefaultInput from "../../components/DefaultInput/DefaultInput";
import LogoUDEM from "../../assets/udemLogoGrande.jpg";
import Ionicons from 'react-native-vector-icons/Ionicons';
export default class RestorePass extends React.Component {
  state = { email: '', errorMessage: null}

  resetPasswordHandler(){
    const { email} = this.state
    if(email!=""){
    firebase.auth().sendPasswordResetEmail(this.state.email).then(function(user) {
      Alert.alert(
        '¡Éxito!',
        'Correo enviado',
      );
    })
    .then((user) => {
      this.props.navigation.navigate('Login')
    })
    //.catch(error => this.setState({ errorMessage: error.message },alert(error.message)))
    .catch(function(error) {
      errorCode = error.code;
      errorMessage = error.message;
      if (errorCode === 'auth/invalid-email') {
        Alert.alert(
          'Error',
          'Correo electrónico inválido',
        );
      }
      if (errorCode === 'auth/user-not-found') {
        Alert.alert(
          'Error',
          'No existe una cuenta con este correo electrónico',
        );
      }
    });
  }
  if (email==""){
    Alert.alert(
      'Error',
      'Porfavor llena el campo de correo electrónico.',
    );
  }
}

  render() {
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
      <View style={styles.titleContainer,{height: height/16}}>
        <Text style={{fontFamily: 'SourceSansPro-Regular', fontSize: 18, color: 'black'}}>Recuperar contraseña</Text>
      </View>

      <DefaultInput
        autoCapitalize="none"
        placeholder="Correo electrónico"
        onChangeText={email => this.setState({ email })}
        value={this.state.email}
      />

      <ButtonWithBackground
        color="#fff500"
        onPress={this.resetPasswordHandler.bind(this)}
      >
      <Text style={{fontFamily: 'SourceSansPro-SemiBold', fontSize: 14, color: 'black'}}>Restablecer contraseña</Text>
      </ButtonWithBackground>

      <View style={{ width: width/1.43, height: height/9}}>
        <Text style={styles.textBase}>Ingresa tu correo para mandarte un link con el cual podrás reestablecer tu contraseña.</Text>
      </View>

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
            onPress={() => this.props.navigation.navigate('Login')}
            >
            Inicio de sesión
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
  }
})
