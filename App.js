//Navegacion
//Editado por última vez por Jorge García el 10/07/2018
import React from 'react'
import { StyleSheet, Platform, Image, Text, View } from 'react-native'
import { SwitchNavigator } from 'react-navigation'

// Importar las pantallas
import Home from './src/screens/home/home'
import Loading from './src/screens/loading/loading'
import Login from './src/screens/login/login'
import Map from './src/screens/map/map'
import MapMenu from './src/screens/mapMenu/mapMenu'
import RestorePass from './src/screens/restorePass/restorePass'
import SignUp from './src/screens/signUp/signUp'
import Steps from './src/screens/steps/steps'

//Ignorar warning de Firebase
console.ignoredYellowBox = ['Deprecated firebase.'];
console.disableYellowBox = true;
// stack de navegacion
const App = SwitchNavigator(
  {
    Home,
    Loading,
    Login,
    Map,
    MapMenu,
    RestorePass,
    SignUp,
    Steps
  },
  {
    initialRouteName: 'Loading'
  }
)

export default App
