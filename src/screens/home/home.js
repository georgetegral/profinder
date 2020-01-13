import React, {Component} from 'react';
import {Platform, Text, StyleSheet, View, ListView, TouchableHighlight, Dimensions, Image, Animated, Button, Alert, Picker, Keyboard, ActivityIndicator, BackHandler} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import TimerMixin from 'react-timer-mixin';
import firebase from 'react-native-firebase';
import SearchBar from '../../components/SearchBar/Searchbar';
import ConditionalView from '../../components/ConditionalView/ConditionalView';
import SearchButton from "../../components/SearchButton/SearchButton";
import Navbar from '../../components/NavBar/Navbar';
import Accents from '../../components/Accents/Accents';
import Divisions from '../../components/Divisions/Divisions';

const {width, height} = Dimensions.get('window')

export default class App extends React.Component {
  state = { currentUser: null, input: '', inputCopy: '' } //Para cerrar sesion

  constructor(props){
    super(props)
    const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2})
    this.profRef = firebase.database().ref().child("Profesores");
    this.photoRef= firebase.database().ref().child("Fotos");
    this._didFocusSubscription = props.navigation.addListener('didFocus', payload =>
      BackHandler.addEventListener('hardwareBackPress', this.onBackButtonPressAndroid)
    );
    this.state = {
      prof: [],
      profCopy: [],
      cubId: "",
      searchVal: "def",
      searchValCopy: "",
      executedSearch: false,
      isSearching: false,
      searchedS1: false,
      searchedS2: false,
      searchedS3: false,
      searchedS4: false,
      blockInput: false,
      isOpenMenu: false,
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
    this._willBlurSubscription = this.props.navigation.addListener('willBlur', payload =>
      BackHandler.removeEventListener('hardwareBackPress', this.onBackButtonPressAndroid)
    );
  }

  onBackButtonPressAndroid = () => {
    BackHandler.exitApp();
    return true;
  };

  componentWillUnmount() {
    this._didFocusSubscription && this._didFocusSubscription.remove();
    this._willBlurSubscription && this._willBlurSubscription.remove();
  }



  //Estas dos funciones sirven solo para cuando se sube un nuevo json para cambiar los nombres de string
  //a arreglos, para asi poder hacer la busqueda de manera correcta.
  changeStringtoArray = () => {
      this.listenChange(this.profRef)
  }
  listenChange(profRef){
    profRef.on('value', (dataSnapshot) => {
      var name = '';
      var nameArr = [];
      var cont = 0;
      dataSnapshot.forEach((child) => {
        name = child.val().NombreEmpleado,
        nameArr = name.split(' ');
        firebase.database().ref('Profesores/' + cont).update({NombreEmpleado: nameArr});
        cont++;
      });
    });
  }

  searchFirebase = () => {
    this.state.searchedS1=false;
    this.state.searchedS2=false;
    this.state.searchedS3=false;
    this.state.searchedS4=false;
    this.state.executedSearch=false;
    var input1=this.state.input;
    var input2=this.state.inputCopy;
    var searchCopy=this.state.searchValCopy;

    Keyboard.dismiss();
    const { input } = this.state
    this.state.prof = [];
    this.state.profCopy =[];
    if(input==" "||input==undefined||input==""){
      Alert.alert(
        'Atención',
        'Ingresa un valor.',
      );
      this.state.blockInput=false;
      this.state.isSearching=false;
    } else {
      if (!/\s/.test(input)){
        var search = this.state.searchVal;
        if(search=="def"){
          Alert.alert(
            'Atención',
            'Porfavor selecciona un parámetro de búsqueda.',
          );
          this.state.blockInput=false;
          this.state.isSearching=false;
        } else if (search=="per" && (input1!=input2 || search!=searchCopy) ){
          this.searchName(input);
          this.state.inputCopy=input1;
          this.state.searchValCopy=search;
        } else if (search=="cub" && (input1!=input2 || search!=searchCopy) ){
          var isNum = /^\d+$/.test(input);
          if (isNum){
            this.searchCub(input);
            this.state.inputCopy=input1;
            this.state.searchValCopy=search;
          } else {
            Alert.alert(
              'Atención',
              'Para buscar un cubículo porfavor sólo ingresa números.',
            );
            this.state.blockInput=false;
            this.state.isSearching=false;
          }
        } else if (search=="div" && (input1!=input2 || search!=searchCopy) ){
          this.searchDiv(input);
          this.state.inputCopy=input1;
          this.state.searchValCopy=search;
        } else if(input1==input2 || search==searchCopy){
          this.state.blockInput=false;
          this.state.isSearching=false;
        }
      } else{
        Alert.alert(
          'Atención.',
          'Porfavor ingresa sólo una palabra.',
        );
        this.state.blockInput=false;
        this.state.isSearching=false;
      }
    }
  }
  Capitalize(str){
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
  changeCub(str){
    var arrCub = str.split(".");
    return arrCub[0];
  }

  searchButtonPressed = () => {
    this.state.blockInput=true;
    this.state.isSearching=true;
    this.searchFirebase();
  }

  searchName(input){
    var inputLower = input.toLowerCase();
    var inputCap = this.Capitalize(inputLower);
    var inputNew = Accents.changeInput(inputCap);
    this.state.profCopy= [];
    this.listenNameFirst( this.profRef,'NombreEmpleado', 0, inputNew)
  }

  searchNameNext(inputNew){
    this.listenNameNext(this.profRef,'NombreEmpleado', 1, inputNew)
    this.listenNameNext(this.profRef,'NombreEmpleado', 2, inputNew)
    this.listenNameNext(this.profRef,'NombreEmpleado', 3, inputNew)
    this.listenNameNext(this.profRef,'NombreEmpleado', 4, inputNew)
  }

  finishNameSearch(){
    this.intervalSearch= setTimeout(() => {
    if(this.state.profCopy.length==0){
        Alert.alert(
          'Atención',
          'Asegúrate haber escrito correctamente el nombre e intenta de nuevo.\n\nSi no encuentras al profesor, consulta a algún miembro de la comunidad UDEM.',
        );
      }
    }, 100)
    this.state.executedSearch=false;
    this.state.blockInput=false;
    this.state.isSearching=false;
  }

  searchCub(input){
    this.state.profCopy= [];
    this.listenOneParam(this.profRef, 'Ubicacion', input);
  }

  searchDiv(input){
    var inputLower = input.toLowerCase();
    var inputCap = this.Capitalize(inputLower);
    var inputNew = Accents.changeInput(inputCap);
    var iD = Divisions.changeInput(inputNew);
    this.state.profCopy= [];
    if(iD=="DAAD"||iD=="VICSA"||iD=="DECS"||iD=="DIEHU"||iD=="DIT"||iD=="DINE"){
      this.listenOneParam(this.profRef,'Direccion', iD)
    } else {
      var inputCap = iD.toUpperCase();
      this.listenOneParam(this.profRef,'Direccion', inputCap)
    }

  }

  finishParamSearch(){
    if(this.state.profCopy.length==0){
      Alert.alert(
        'Atención.',
        'Asegúrate haber escrito correctamente e intenta de nuevo.\n\nSi escribiste bien entonces no hay registro en la base de datos de tu búsqueda, consulta a algún miembro de la comunidad UDEM.',
      );
    }
    this.state.executedSearch=false;
    this.state.blockInput=false;
    this.state.isSearching=false;
  }

  //Busqueda nombre profesor
  listenNameFirst(profRef,root,childArr,input){
    profRef.orderByChild(root+'/'+childArr).startAt(input).endAt(input+"\uf8ff").on('value', (dataSnapshot) => {
      var prof = [];
      profCopy = [];
      this.state.executedSearch=true;
      dataSnapshot.forEach((child) => {
        prof.push({
          NombreEmpleado: child.val().NombreEmpleado,
          DescripcionPosicion: child.val().DescripcionPosicion,
          DescripcionDepartamento: child.val().DescripcionDepartamento,
          Direccion: child.val().Direccion,
          Ubicacion: child.val().Ubicacion,
          Extension: child.val().Extension,
          IdAlternativoBanner: child.val().IdAlternativoBanner
        });
      });
      if(typeof profCopy != "undefined"){
        profCopy=prof.concat(profCopy);
        profCopy.sort(function(a, b) {
          var textA = a.NombreEmpleado;
          var textB = b.NombreEmpleado;
          return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
        });
        this.setState({
          dataSource: this.state.dataSource.cloneWithRows(profCopy),
        })
        this.state.profCopy=profCopy
      } else {
        console.log("undefined");
      }
      this.searchNameNext(input);
    });
  }
  listenNameNext(profRef,root,childArr,input){
    profRef.orderByChild(root+'/'+childArr).startAt(input).endAt(input+"\uf8ff").on('value', (dataSnapshot) => {
      var prof= [];
      this.state.executedSearch=true;
      dataSnapshot.forEach((child) => {
        prof.push({
          NombreEmpleado: child.val().NombreEmpleado,
          DescripcionPosicion: child.val().DescripcionPosicion,
          DescripcionDepartamento: child.val().DescripcionDepartamento,
          Direccion: child.val().Direccion,
          Ubicacion: child.val().Ubicacion,
          Extension: child.val().Extension,
          IdAlternativoBanner: child.val().IdAlternativoBanner
        });
      });
      if(typeof profCopy != "undefined"){
        profCopy=prof.concat(profCopy);
        profCopy.sort(function(a, b) {
          var textA = a.NombreEmpleado;
          var textB = b.NombreEmpleado;
          return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
        });
        switch (childArr) {
          case 1:
            this.state.searchedS1=true;
            break;
          case 2:
            this.state.searchedS2=true;
            break;
          case 3:
            this.state.searchedS3=true;
            break;
          case 4:
            this.state.searchedS4=true;
            break;
        }
        if(this.state.searchedS1&&this.state.searchedS2&&this.state.searchedS3&&this.state.searchedS4){
          this.finishNameSearch();
        }
        var result = profCopy.reduce((unique, o) => {
          if(!unique.some(obj => obj.NombreEmpleado[0] === o.NombreEmpleado[0] && obj.NombreEmpleado[1] === o.NombreEmpleado[1] && obj.NombreEmpleado[2] === o.NombreEmpleado[2])) {
            unique.push(o);
          }
          return unique;
        },[]);
        profCopy=result;
        this.setState({
          dataSource: this.state.dataSource.cloneWithRows(profCopy),
        })
        this.state.profCopy=profCopy
      } else {
        console.log("undefined");
      }
    });
  }
  //Busqueda cubiculo y Direccion
  listenOneParam(profRef,root,input){
    profRef.orderByChild(root).startAt(input).endAt(input+"\uf8ff").on('value', (dataSnapshot) => {
      var prof= [];
      profCopy= [];
      this.state.executedSearch=true;
      dataSnapshot.forEach((child) => {
        prof.push({
          NombreEmpleado: child.val().NombreEmpleado,
          DescripcionPosicion: child.val().DescripcionPosicion,
          DescripcionDepartamento: child.val().DescripcionDepartamento,
          Direccion: child.val().Direccion,
          Ubicacion: child.val().Ubicacion,
          Extension: child.val().Extension,
          IdAlternativoBanner: child.val().IdAlternativoBanner
        });
      });
      if(typeof profCopy != "undefined"){
        profCopy=prof.concat(profCopy);
        profCopy.sort(function(a, b) {
          var textA = a.NombreEmpleado;
          var textB = b.NombreEmpleado;
          return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
        });
        var result = profCopy.reduce((unique, o) => {
          if(!unique.some(obj => obj.NombreEmpleado[0] === o.NombreEmpleado[0] && obj.NombreEmpleado[1] === o.NombreEmpleado[1] && obj.NombreEmpleado[2] === o.NombreEmpleado[2])) {
            unique.push(o);
          }
          return unique;
        },[]);
        profCopy=result;
        this.state.profCopy=profCopy;
        this.setState({
          dataSource: this.state.dataSource.cloneWithRows(profCopy),
        })
      } else {
        console.log("undefined");
      }
      this.listenDummyParam(this.profRef, 'Ubicacion', "xyz123");
    });
  }
  listenDummyParam(profRef,root,input){
    profRef.orderByChild(root).startAt(input).endAt(input+"\uf8ff").on('value', (dataSnapshot) => {
      var prof= [];
      this.state.executedSearch=true;
      dataSnapshot.forEach((child) => {
        prof.push({
        });
      });
      if(typeof profCopy != "undefined"){
        this.state.profCopy=profCopy;
        this.finishParamSearch();
        this.setState({
          dataSource: this.state.dataSource.cloneWithRows(profCopy),
        })
      } else {
        console.log("undefined");
      }
    });
  }

  signOutUser = async () => {
    try {
        await firebase.auth().signOut();
    } catch (e) {
        console.log(e);
    }
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

  //Render condicional
  conditionalDisplay(str) {
    if (str!= "not found") {return <Text style={styles.textCard} >{str}</Text>;}
  }
  conditionalCub(str) {
    if (str!= "not found") {return <Text style={styles.textCard} >Cubículo: {str}</Text>;}
  }
  conditionalExt(str) {
    if (str!= "not found") {return <Text style={styles.textCard} >Extensión: {str}</Text>;}
  }
  renderRow(rowData){
    var cub = this.changeCub(rowData.Ubicacion + '')
    var pos = rowData.DescripcionPosicion;
    var dep = rowData.DescripcionDepartamento;
    var dir = rowData.Direccion;
    var ext = rowData.Extension;
    var id = rowData.IdAlternativoBanner;
    return (
      <TouchableHighlight
        style={styles.containerCell}
        onPress={() => {
          this.props.navigation.navigate('Steps', {
            cubiculo: cub,
            idBanner: id,
            nombre: rowData.NombreEmpleado
          });
        }}
        >
        <View>
          <View style={styles.footerContainer}>
            <View style={{flex:11}}>
              <View style={{flexDirection: 'row', justifyContent: 'flex-start'}}>
                {rowData.NombreEmpleado.map((item, key)=>(
                  <Text key={key} style={styles.textCardName}>{item} </Text>)
                )}
              </View>
              <View>
                {this.conditionalDisplay(pos)}
                {this.conditionalDisplay(dep)}
                {this.conditionalDisplay(dir)}
                {this.conditionalCub(cub)}
                {this.conditionalExt(ext)}
              </View>
            </View>
            <View style={{flex: 1, justifyContent:'flex-start', alignItems: 'flex-end'}}>
              <Ionicons name='ios-arrow-forward' size={25} color="#535050" />
            </View>
          </View>
        </View>
      </TouchableHighlight>
    )
  }

  render(){
    const searchMessage = <Text style={styles.textErrorMessage}> Por favor sólo ingresa una palabra.</Text>
    const cubMessage = <Text style={styles.textErrorMessage}> Por favor sólo ingresa números.</Text>
    const perMessage = <Text style={styles.textErrorMessage}> Por favor sólo ingresa letras.</Text>
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

        <View style={styles.pickerStyle}>
          <Picker
            selectedValue={this.state.searchVal}
            style={styles.pickerItemStyle}
            onValueChange={(itemValue, itemIndex) => {this.setState({searchVal: itemValue}); }}>
            <Picker.Item label="Elige un parámetro de búsqueda" value="def" />
            <Picker.Item label="Profesor" value="per" />
            <Picker.Item label="Cubículo" value="cub" />
            <Picker.Item label="División" value="div" />
          </Picker>
        </View>

        <SearchBar
          onChangeText={input => this.setState({ input })}
          value={this.state.input}
          placeholder= "Búsqueda"
        />
        <View style={{ width: width,paddingLeft:13}}>
          {/^\d+$/.test(this.state.input)&&(this.state.searchVal=='per'||this.state.searchVal=='div')&&this.state.input.length>0? perMessage : undefined}
        </View>
        <View style={{ width: width,paddingLeft:13}}>
          {/\s/.test(this.state.input)? searchMessage : undefined}
        </View>

        <View pointerEvents={this.state.blockInput ? 'none' : 'auto'}>
          <SearchButton
            color="#fff500"
            onPress={this.searchButtonPressed}
            >
            <Text style={{fontFamily: 'SourceSansPro-Regular', fontSize: 16, color: '#535050'}}>Buscar</Text>
          </SearchButton>
        </View>

        <View style={styles.drawerContainer}>
          <Text></Text>
        </View>

        <ConditionalView style={{flex: 0, alignItems:'center'}} hide={!this.state.isSearching}>
          <ActivityIndicator size="large" color="#fff500" />
          <Text style={{fontFamily: 'SourceSansPro-SemiBold', fontSize: 16, color: '#535050'}}>Buscando</Text>
        </ConditionalView>

        <ListView
          enableEmptySections={true}
          style={styles.listContainer}
          renderRow={this.renderRow.bind(this)}
          dataSource={this.state.dataSource}
        />

        <View style={{flex: 0, flexDirection: 'row', justifyContent: 'flex-end'}}>
          <View style={{flex: 1, alignItems: 'center'}}>
            <Ionicons name='md-school' size={25} style={{color: "black" }} onPress={() => this.props.navigation.navigate('Home')}/>
            <Text style={{fontFamily: 'SourceSansPro-Regular', fontSize: 18, color: "black"}} onPress={() => this.props.navigation.navigate('Home')}>Búsqueda</Text>
          </View>
          <View style={{flex: 1, alignItems: 'center'}}>
            <Ionicons name='md-map' size={25} style={{color: "gray" }} onPress={() => this.props.navigation.navigate('MapMenu')}/>
            <Text style={{fontFamily: 'SourceSansPro-Regular', fontSize: 18, color: 'gray'}} onPress={() => this.props.navigation.navigate('MapMenu')}>Mapas</Text>
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

            <Ionicons name='md-map' size={25} style={{paddingLeft: 5, paddingRight: 5, color: "black" }}/>
            <Text style={{fontFamily: 'SourceSansPro-Regular', fontSize: 18, color: '#535050'}} onPress={() => this.props.navigation.navigate('MapMenu')} >Mapas</Text>
          </View>
          <View style={styles.drawerContainer}>
            <Text></Text>
          </View>
          <View style={styles.drawerContainer}>
            <Ionicons name='md-log-out' size={25} style={{paddingLeft: 5, paddingRight: 5, color: "black" }}/>
            <Text style={{fontFamily: 'SourceSansPro-Regular', fontSize: 18, color: '#535050'}} onPress={() => this.signOutUser()} >Cerrar sesión</Text>
          </View>
          <View style={styles.drawerContainer}>
            <Text></Text>
          </View>
        </Animated.View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    content: {
        zIndex: 1
    },
    textCard: {
        color: '#535050',
        fontSize: 14,
        fontFamily: 'SourceSansPro-Regular'
    },
    textCardName: {
        color: '#535050',
        fontSize: 14,
        fontFamily: 'SourceSansPro-SemiBold'
    },
    footerContainer: {
      flexDirection: 'row',
      paddingHorizontal: 10,
      paddingVertical: 10,
      borderRadius: 10,
      backgroundColor: '#F5F5F5'
    },
    listContainer: {
        marginHorizontal: 10
    },
    containerCell: {
        marginBottom: 10
    },
    inputContainer: {
      width: "100%",
      backgroundColor: '#ffffff'
    },
    drawerContainer: {
       flexDirection: 'row',
       alignItems:'center'
    },
    pickerStyle:{
      width: "100%",
      height: 40,
      borderWidth: 2,
      borderColor: "#eee",
      padding: 5,
      marginTop: 5,
      marginBottom: 5,
      borderRadius: 10,
      backgroundColor: 'white'
    },
    pickerItemStyle: {
      width: "100%",
      height: 25,
      color: '#535050',
    },
    textErrorMessage: {
      color: 'red',
      fontSize: 12,
      fontFamily: 'SourceSansPro-Regular'
    }
})
