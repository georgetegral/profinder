import React from 'react'
import {Platform, Text, StyleSheet, View, ListView, TouchableHighlight, Dimensions, Image, Animated, TextInput, Button, Alert, ActivityIndicator, Linking, BackHandler} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import firebase from 'react-native-firebase'
import SearchButton from "../../components/SearchButton/SearchButton";
import ButtonWithBackground from "../../components/ButtonWithBackground/ButtonWithBackground";
import ConditionalView from '../../components/ConditionalView/ConditionalView';
import SearchBar from '../../components/SearchBar/Searchbar';
import Navbar from '../../components/NavBar/Navbar';

import 'moment-timezone';
import moment from 'moment';
import 'moment/min/moment-with-locales'
import 'moment/locale/es';

import TimerMixin from 'react-timer-mixin';

const {width, height} = Dimensions.get('window')

export default class Steps extends React.Component {
  state = { currentUser: null } //Para cerrar sesion

  signOutUser = async () => {
    try {
        await firebase.auth().signOut();
    } catch (e) {
        console.log(e);
    }
  }

  constructor(props){
    super(props)
    const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2})
    this.rutaRef = firebase.database().ref().child("rutas");
    this.rutaPics = firebase.database().ref().child("Fotos");
    const { navigation } = this.props;
    const cubId = navigation.getParam('cubiculo', '0');
    const idBanner = navigation.getParam('idBanner', '0');
    const nom = navigation.getParam('nombre', ' ');
    this._didFocusSubscription = props.navigation.addListener('didFocus', payload =>
      BackHandler.addEventListener('hardwareBackPress', this.onBackButtonPressAndroid)
    );
    this.state = {
      cubiculo: cubId,
      idProf: parseInt(idBanner,10),
      nombre: nom,
      isLoaded: false,
      isOpenMenu: false,
      dataSource: ds.cloneWithRows([]),
      rawData: '',
      rotateY: new Animated.Value(0),
      translateX: new Animated.Value(width),
      menuAnimation: new Animated.Value(0),
      text: '',
      fotoUrl: '',
      email: '',
      cubi: [],
      cubiCopy: [],
      users: [],
      fotos: [],
      loaded: false,
      estado: "",
      l: "",
      m: "",
      x: "",
      j: "",
      v: "",
      s: "",
    }
  }

  componentDidMount() {
    const { currentUser } = firebase.auth()
    this.setState({ currentUser })
    this.showSteps(this.rutaRef,this.state.cubiculo);
    this.cargarHorario();
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

  showSteps(ref,space){
    if(space!=0){
      var bui=space.toString().substr(0,1);
      var flo=space.toString().substr(1,1);
      var cub=space.toString().substr(2,3);
      if(cub>0){
        this.listenStepsFirst(ref,1); //Entrar al edificio
        if(bui==5){
          if(flo==1){
            this.listenStepsNext(ref,parseInt(space,10)); //Mostrar croquis
            this.listenStepsNext(ref,parseInt(space+"1",10)); //mostrar instrucciones
            if(!((cub>=1&&cub<=6)||(cub>=15&&cub<=22))){
              this.listenStepsNext(ref,51001); //Instrucción extra para cubiculos lejos
            }
          } else {
            this.listenStepsNext(ref,2); //Subir las escaleras
            this.listenStepsNext(ref,parseInt(flo*2,10)); //Subir x niveles
            this.listenStepsNext(ref,parseInt(52+cub,10)); //Mostrar croquis
            this.listenStepsNext(ref,parseInt(space+"1",10)); //mostrar instrucciones
            if(!((cub>=1&&cub<=6)||(cub>=15&&cub<=22))){
              this.listenStepsNext(ref,52001); //Instrucción extra para cubiculos lejos
            }
          }
        }
        if(bui==6){
          this.listenStepsNext(ref,2); //Subir las escaleras
          this.listenStepsNext(ref,parseInt(flo*2+1,10)); //Subir x niveles
          this.listenStepsNext(ref,parseInt(space+"1",10)); //mostrar instrucciones
          if(flo==1){
            this.listenStepsNext(ref,parseInt(space,10)); //Mostrar croquis
            if(!((cub>=1&&cub<=14)||(cub>=23&&cub<=31))){
              this.listenStepsNext(ref,61001); //Instrucción extra para cubiculos lejos
            }
          }
          if(flo==2){
            this.listenStepsNext(ref,parseInt(space,10)); //Mostrar croquis
            if(!((cub>=1&&cub<=17)||(cub>=26&&cub<=35))){
              this.listenStepsNext(ref,62001); //Instrucción extra para cubiculos lejos
            }
          }
          if(flo==3){
            this.listenStepsNext(ref,parseInt(62+cub,10)); //Mostrar croquis
            if(!((cub>=1&&cub<=17)||(cub>=26&&cub<=35))){
              this.listenStepsNext(ref,63001); //Instrucción extra para cubiculos lejos
            }
          }
          if(flo==4){
            this.listenStepsNext(ref,parseInt(space,10)); //Mostrar croquis
            if(!((cub>=1&&cub<=17)||(cub>=26&&cub<=35))){
              this.listenStepsNext(ref,64001); //Instrucción extra para cubiculos lejos
            }
          }
        }
      } else {
        Alert.alert(
          'Atención.',
          'Has buscado a una secretaria, para encontrarla porfavor dirígete al edificio y piso que ingresaste y búscala ahí.',
        );
        this.props.navigation.navigate('Home');
      }
    } else {
      Alert.alert(
        'Atención.',
        'Ruta no disponible para esta persona, favor de acercarse con algún miembro de la comunidad UDEM.',
      );
      this.props.navigation.navigate('Home');
    }
  }
  //Mostrar Ruta
  listenStepsFirst(rutaRef,input){
    rutaRef.orderByChild("id").equalTo(input).on('value', (dataSnapshot) => {
      var cubi = [];
      cubiCopy = [];
      dataSnapshot.forEach((child) => {
        cubi.push({
          id: child.val().id,
          image: child.val().image,
          instruction: child.val().instruction
        });
      });
      if(typeof profCopy != "undefined"){
        cubiCopy=cubi.concat(cubiCopy);
        cubiCopy.sort(function(a, b) {
          var A = a.id;
          var B = b.id;
          return (A < B) ? -1 : (A > B) ? 1 : 0;
        });
        this.setState({
          dataSource: this.state.dataSource.cloneWithRows(cubiCopy),
        })
        this.state.cubiCopy=cubiCopy;
      } else {
        console.log("First undefined");
      }
    });
  }
  listenStepsNext(rutaRef,input){
    rutaRef.orderByChild("id").equalTo(input).on('value', (dataSnapshot) => {
      var cubi= [];
      var firstWord = "";
      dataSnapshot.forEach((child) => {
        firstWord = child.val().instruction.split(" ");
        if(firstWord[0]=="Croquis"){
          cubi.push({
            id: child.val().id,
            image: child.val().image,
            instruction: child.val().instruction+" "+this.state.cubiculo+"."
          });
        } else {
          cubi.push({
            id: child.val().id,
            image: child.val().image,
            instruction: child.val().instruction
          });
        }

      });
      if(typeof cubiCopy != "undefined"){
        cubiCopy=cubi.concat(cubiCopy);
        cubiCopy.sort(function(a, b) {
          var A = a.id;
          var B = b.id;
          return (A < B) ? -1 : (A > B) ? 1 : 0;
        });
        this.setState({
          dataSource: this.state.dataSource.cloneWithRows(cubiCopy),
        })
        this.state.cubiCopy=cubiCopy;
      } else {
        console.log("Next undefined for "+input);
        this.listenStepsNext(rutaRef,input);
      }
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
    return (
      <View>
        <View style={styles.footerContainer}>
          <Image
            source={{uri: rowData.image}}
            style={{
              flex: 1,
              alignSelf: 'stretch',
              resizeMode: "contain",
              width: width/1.15,
              height: height/2.5
            }}

          />
          <View style={{flex:1, justifyContent: 'flex-start'}}>
            <Text style={styles.textCard}>{rowData.instruction}</Text>
          </View>
        </View>
      </View>
    )
  }

  searchPicture(rutaPic){
     rutaPic.orderByChild("ID_BANNER").equalTo(this.state.idProf).on('value', snapshot =>{
      var fotos=[];
      snapshot.forEach((row) => {
        fotos.push ({
          foto: row.val().FOTO,
          em: row.val().EMAIL
        });
        this.state.fotos=fotos;
      });
      if(this.state.fotos.length>0){
        if(this.state.fotos[0].foto){
          this.state.fotoUrl= this.state.fotos[0].foto
        } else {
          console.log("photo undefined");
        }

        if(this.state.fotos[0].em){
          this.state.email= this.state.fotos[0].em
        } else {
          console.log("email undefined");
        }
      }
    })
    if(this.state.fotoUrl){
      return this.state.fotoUrl;
    } else {
      console.log("photo return undefined");
      return "https://firebasestorage.googleapis.com/v0/b/profinder-99346.appspot.com/o/nopic.png?alt=media&token=25e66c59-7c9a-4cfb-9a55-6f0a4ce8791b";
    }

  }

  cargarHorario(){
     firebase.database().ref().child("Horario").orderByChild("ID").equalTo(this.state.idProf).on('value', snapshot =>{
      var users=[];
      snapshot.forEach((row) => {
        users.push ({
          ki: row.key,
          ID: row.val().ID,
          INICIO: row.val().INICIO,
          FIN: row.val().FIN,
          D: row.val().D,
          L: row.val().L,
          M: row.val().M,
          X: row.val().X,
          J: row.val().J,
          V: row.val().V,
          S: row.val().S,
        });
      });
      this.setState({
        users,
        loaded: true
      });
    })
  }

  convertNA(s){
    if(s=='N/A')
      s='Sin clases.'
    return s;
  }

  horarioBoton(l,m,x,j,v,s){
    if(this.state.fotos.length>0){
      if(l=="N/A"&&m=="N/A"&&x=="N/A"&&j=="N/A"&&v=="N/A"&&s=="N/A"){
        console.log("No mostrar horarios");
      } else {
        l=this.convertNA(l);
        m=this.convertNA(m);
        x=this.convertNA(x);
        j=this.convertNA(j);
        v=this.convertNA(v);
        s=this.convertNA(s);
        Alert.alert('Horario posiblemente* disponible del profesor', '\nLunes: '+l+'\n\nMartes: '+m+'\n\nMiércoles: '+x+'\n\nJueves: '+j+'\n\nViernes: '+v+'\n\nSábado: '+s+'\n\n*Información basada en el horario oficial del maestro, es posible que en ocasiones el maestro no se encuentre disponible debido a juntas, asesorías, hora de comida entre otras cosas.');
      }
    } else {
      Alert.alert('Alerta', 'Horario del profesor no disponible.\n\nLamentamos los inconvenientes.');
    }
  }

  sendEmail(){
    if(this.state.fotos.length>0){
      Linking.openURL('mailto:'+this.state.email)
    } else {
      Alert.alert('Alerta', 'Correo del profesor no disponible.\n\nLamentamos los inconvenientes.');
    }
  }

  render() {
    const { users,loaded,nombre } = this.state;

    var date = moment.locale('es')
    var now = moment().tz('America/Mexico_City').format('dddd, MMMM Do YYYY, H:mm');
    var dia = moment().tz('America/Mexico_City').format('dddd');
    var hora = moment().tz('America/Mexico_City').format('kkmm');
    var horaT = moment().tz('America/Mexico_City').format('h:mm');

    var estado;
    const disp = <Text></Text>;
    const nodisp = <Text style={{color: '#FF0000'}}>No disponible, en clase.</Text>;
    const fuerarango = <Text style={{color: '#FF0000'}}>No disponible, descansando.</Text>;


    estado=disp;

      var domingo=[];
      var lunes=[];
      var martes=[];
      var miercoles=[];
      var jueves=[];
      var viernes=[];
      var sabado=[];
      var horarioD=[];
      var horarioL=[];
      var horarioM=[];
      var horarioX=[];
      var horarioJ=[];
      var horarioV=[];
      var horarioS=[];
      lunes.push('700');
      lunes.push('1730');
      martes.push('700');
      martes.push('1730');
      miercoles.push('700');
      miercoles.push('1730');
      jueves.push('700');
      jueves.push("1730");
      viernes.push('700');
      viernes.push('1730');
      sabado.push('700');
      sabado.push('1730');

     users.forEach(function (users, index) {
      if(users.D=="S"){
        domingo.push(users.INICIO);
        domingo.push(users.FIN);
      }
      if(users.L=="M"){
        lunes.push(users.INICIO);
        lunes.push(users.FIN);
      }
      if(users.M=="T"){
        martes.push(users.INICIO);
        martes.push(users.FIN);
      }
      if(users.X=="W"){
        miercoles.push(users.INICIO);
        miercoles.push(users.FIN);
      }
      if(users.J=="R"){
        jueves.push(users.INICIO);
        jueves.push(users.FIN);
      }
      if(users.V=="F"){
        viernes.push(users.INICIO);
        viernes.push(users.FIN);
      }
      if(users.S=="S"){
        sabado.push(users.INICIO);
        sabado.push(users.FIN);
      }

    });
     domingo.sort((a, b) => a - b);
     lunes.sort((a, b) => a - b);
     martes.sort((a, b) => a - b);
     miercoles.sort((a, b) => a - b);
     jueves.sort((a, b) => a - b);
     viernes.sort((a, b) => a - b);
     sabado.sort((a, b) => a - b);
     for (var i=0; i < lunes.length; i++){
       lunes[i]=lunes[i].toString();
       if(lunes[i].length==4)
        var numcamb = lunes[i].substring(2);
       else
        var numcamb = lunes[i].substring(1);
      if(numcamb=="59"){
     var strnum = lunes[i];
     var numero=Number(strnum);
     var numero =  numero+41;
     lunes[i]=numero.toString();
     }
     if(numcamb=="29")
     {
     var strnum = lunes[i];
     var numero=Number(strnum);
     var numero =  numero+1;
     lunes[i]=numero.toString();
     }
     else
     {
      lunes[i]=lunes[i].toString();
     }
    }

    var temp=[];
    var j=0;
    if(lunes.length>2)
    {
    for (var i=0; i < lunes.length; i+=2)
    {
    if(lunes[i]==lunes[i+1] || (lunes[i-1]==lunes[i] && lunes[i+1]==lunes[i+2]))
    {
    }
    else
    {
    temp[j]=lunes[i];
    j++;
    temp[j]=lunes[i+1];
    j++;
    }
    }
    }

    lunes=temp;
    horarioL=temp;
    var strL=[];
    for (var i=0; i < lunes.length; i++)
    {
      lunes[i]=lunes[i].toString();
      if(lunes[i].length==4)
      var substr1 = lunes[i].substring(0,2);
      else
      var substr1 = lunes[i].substring(0,1);

      substr1+=":";

      if(lunes[i].length==4)
      substr2 = lunes[i].substring(2);
      else
      substr2 = lunes[i].substring(1);

      substr1+=substr2;
      strL[i]=substr1;
    }

    var temp=[];
    var j=0;
    for (var i=0; i < strL.length; i+=2)
    {
     var str1 = strL[i].toString();
     var str2 = strL[i+1].toString();
     var str3 = str1+" - "+str2;
     temp[j]=str3;
     j++;
    }
    strL=temp;

    for (var i=0; i < martes.length; i++)
    {
      martes[i]=martes[i].toString();
      if(martes[i].length==4)
      var numcamb = martes[i].substring(2);
      else
      var numcamb = martes[i].substring(1);


     if(numcamb=="59")
     {
     var strnum = martes[i];
     var numero=Number(strnum);
     var numero =  numero+41;
     martes[i]=numero.toString();
     }
     if(numcamb=="29")
     {
     var strnum = martes[i];
     var numero=Number(strnum);
     var numero =  numero+1;
     martes[i]=numero.toString();
     }
     else
     {
      martes[i]=martes[i].toString();
     }
    }
    var temp=[];
    var j=0;
    if(martes.length>2)
    {
    for (var i=0; i < martes.length; i+=2)
    {
    if(martes[i]==martes[i+1] || (martes[i-1]==martes[i] && martes[i+1]==martes[i+2]))
    {
    }
    else
    {
    temp[j]=martes[i];
    j++;
    temp[j]=martes[i+1];
    j++;
    }
    }
    }


    martes=temp;
    horarioM=temp;
    var strM=[];
    for (var i=0; i < martes.length; i++)
    {
      martes[i]=martes[i].toString();
      if(martes[i].length==4)
      var substr1 = martes[i].substring(0,2);
      else
      var substr1 = martes[i].substring(0,1);

      substr1+=":";

      if(martes[i].length==4)
      substr2 = martes[i].substring(2);
      else
      substr2 = martes[i].substring(1);

      substr1+=substr2;
      strM[i]=substr1;
    }

    var temp=[];
    var j=0;
    for (var i=0; i < strM.length; i+=2)
    {
     var str1 = strM[i].toString();
     var str2 = strM[i+1].toString();
     var str3 = str1+" - "+str2;
     temp[j]=str3;
     j++;
    }
    strM=temp;



    for (var i=0; i < miercoles.length; i++)
    {
      miercoles[i]=miercoles[i].toString();
      if(miercoles[i].length==4)
      var numcamb = miercoles[i].substring(2);
      else
      var numcamb = miercoles[i].substring(1);


     if(numcamb=="59")
     {
     var strnum = miercoles[i];
     var numero=Number(strnum);
     var numero =  numero+41;
     miercoles[i]=numero.toString();
     }
     if(numcamb=="29")
     {
     var strnum = miercoles[i];
     var numero=Number(strnum);
     var numero =  numero+1;
     miercoles[i]=numero.toString();
     }
     else
     {
      miercoles[i]=miercoles[i].toString();
     }
    }

    var temp=[];
    var j=0;
    if(miercoles.length>2)
    {
    for (var i=0; i < miercoles.length; i+=2)
    {
    if(miercoles[i]==miercoles[i+1] || (miercoles[i-1]==miercoles[i] && miercoles[i+1]==miercoles[i+2]))
    {
    }
    else
    {
    temp[j]=miercoles[i];
    j++;
    temp[j]=miercoles[i+1];
    j++;
    }
    }
    }

    miercoles=temp;
    horarioX=temp;
    var strX=[];
    for (var i=0; i < miercoles.length; i++)
    {
      miercoles[i]=miercoles[i].toString();
      if(miercoles[i].length==4)
      var substr1 = miercoles[i].substring(0,2);
      else
      var substr1 = miercoles[i].substring(0,1);

      substr1+=":";

      if(miercoles[i].length==4)
      substr2 = miercoles[i].substring(2);
      else
      substr2 = miercoles[i].substring(1);

      substr1+=substr2;
      strX[i]=substr1;
    }

    var temp=[];
    var j=0;
    for (var i=0; i < strX.length; i+=2)
    {
     var str1 = strX[i].toString();
     var str2 = strX[i+1].toString();
     var str3 = str1+" - "+str2;
     temp[j]=str3;
     j++;
    }
    strX=temp;




    for (var i=0; i < jueves.length; i++)
    {
      jueves[i]=jueves[i].toString();
      if(jueves[i].length==4)
      var numcamb = jueves[i].substring(2);
      else
      var numcamb = jueves[i].substring(1);

     if(numcamb=="59")
     {
     var strnum = jueves[i];
     var numero=Number(strnum);
     var numero =  numero+41;
     jueves[i]=numero.toString();
     }
     if(numcamb=="29")
     {
     var strnum = jueves[i];
     var numero=Number(strnum);
     var numero =  numero+1;
     jueves[i]=numero.toString();
     }
     else
     {
      jueves[i]=jueves[i].toString();
     }
    }

    var temp=[];
    var j=0;
    if(jueves.length>2)
    {
    for (var i=0; i < jueves.length; i+=2)
    {
    if(jueves[i]==jueves[i+1] || (jueves[i-1]==jueves[i] && jueves[i+1]==jueves[i+2]))
    {
    }
    else
    {
    temp[j]=jueves[i];
    j++;
    temp[j]=jueves[i+1];
    j++;
    }
    }
    }

    jueves=temp;
    horarioJ=temp;
    var strJ=[];
    for (var i=0; i < jueves.length; i++)
    {
      jueves[i]=jueves[i].toString();
      if(jueves[i].length==4)
      var substr1 = jueves[i].substring(0,2);
      else
      var substr1 = jueves[i].substring(0,1);

      substr1+=":";

      if(jueves[i].length==4)
      substr2 = jueves[i].substring(2);
      else
      substr2 = jueves[i].substring(1);

      substr1+=substr2;
      strJ[i]=substr1;
    }


    var temp=[];
    var j=0;
    for (var i=0; i < strJ.length; i+=2)
    {
     var str1 = strJ[i].toString();
     var str2 = strJ[i+1].toString();
     var str3 = str1+" - "+str2;
     temp[j]=str3;
     j++;
    }
    strJ=temp;



    for (var i=0; i < viernes.length; i++)
    {
      viernes[i]=viernes[i].toString();
      if(viernes[i].length==4)
      var numcamb = viernes[i].substring(2);
      else
      var numcamb = viernes[i].substring(1);


     if(numcamb=="59")
     {
     var strnum = viernes[i];
     var numero=Number(strnum);
     var numero =  numero+41;
     viernes[i]=numero.toString();
     }
     if(numcamb=="29")
     {
     var strnum = viernes[i];
     var numero=Number(strnum);
     var numero =  numero+1;
     viernes[i]=numero.toString();
     }
     else
     {
      viernes[i]=viernes[i].toString();
     }
    }

    var temp=[];
    var j=0;
    if(viernes.length>2)
    {
    for (var i=0; i < viernes.length; i+=2)
    {
    if(viernes[i]==viernes[i+1] || (viernes[i-1]==viernes[i] && viernes[i+1]==viernes[i+2]))
    {
    }
    else
    {
    temp[j]=viernes[i];
    j++;
    temp[j]=viernes[i+1];
    j++;
    }
    }
    }

    viernes=temp;
    horarioV=temp;
    var strV=[];
    for (var i=0; i < viernes.length; i++)
    {
      viernes[i]=viernes[i].toString();
      if(viernes[i].length==4)
      var substr1 = viernes[i].substring(0,2);
      else
      var substr1 = viernes[i].substring(0,1);

      substr1+=":";

      if(viernes[i].length==4)
      substr2 = viernes[i].substring(2);
      else
      substr2 = viernes[i].substring(1);

      substr1+=substr2;
      strV[i]=substr1;
    }

    var temp=[];
    var j=0;
    for (var i=0; i < strV.length; i+=2)
    {
     var str1 = strV[i].toString();
     var str2 = strV[i+1].toString();
     var str3 = str1+" - "+str2;
     temp[j]=str3;
     j++;
    }
    strV=temp;



    for (var i=0; i < sabado.length; i++)
    {
      sabado[i]=sabado[i].toString();
      if(sabado[i].length==4)
      var numcamb = sabado[i].substring(2);
      else
      var numcamb = sabado[i].substring(1);


     if(numcamb=="59")
     {
     var strnum = sabado[i];
     var numero=Number(strnum);
     var numero =  numero+41;
     sabado[i]=numero.toString();
     }
     if(numcamb=="29")
     {
     var strnum = sabado[i];
     var numero=Number(strnum);
     var numero =  numero+1;
     sabado[i]=numero.toString();
     }
     else
     {
      sabado[i]=sabado[i].toString();
     }
    }

    var temp=[];
    var j=0;
    if(sabado.length>2)
    {
    for (var i=0; i < sabado.length; i+=2)
    {
    if(sabado[i]==sabado[i+1] || (sabado[i-1]==sabado[i] && sabado[i+1]==sabado[i+2]))
    {
    }
    else
    {
    temp[j]=sabado[i];
    j++;;
    temp[j]=sabado[i+1];
    j++;
    }
    }
    }

    sabado=temp;
    horarioS=temp;
    var strS=[];
    for (var i=0; i < sabado.length; i++)
    {
      sabado[i]=sabado[i].toString();
      if(sabado[i].length==4)
      var substr1 = sabado[i].substring(0,2);
      else
      var substr1 = sabado[i].substring(0,1);

      substr1+=":";

      if(sabado[i].length==4)
      substr2 = sabado[i].substring(2);
      else
      substr2 = sabado[i].substring(1);

      substr1+=substr2;
      strS[i]=substr1;
    }

    var temp=[];
    var j=0;
    for (var i=0; i < strS.length; i+=2)
    {
     var str1 = strS[i].toString();
     var str2 = strS[i+1].toString();
     var str3 = str1+" - "+str2;
     temp[j]=str3;
     j++;
    }
    strS=temp;


    var val;
    var check=0;
    var fuerarangoval=false;
    if(dia=="lunes")
    {
      var strTope = horarioL[horarioL.length-1];
      var tope=Number(strTope);
      var strInicio = horarioL[0];
      var inicio=Number(strInicio);
      var strHora = hora;
      var horacAct=Number(strHora);
      for (var i=0; i < horarioL.length; i+=2)
      {
        if(moment(hora).isBetween(horarioL[i],horarioL[i+1])){
        val=true;
        }
        check++;
        if((horacAct>tope && tope>10) || (horacAct<inicio && inicio>10))
        {
          fuerarangoval=true;
        }
      }
    }
    if(dia=="martes")
    {
      var strTope = horarioM[horarioM.length-1];
      var tope=Number(strTope);
      var strInicio = horarioM[0];
      var inicio=Number(strInicio);
      var strHora = hora;
      var horacAct=Number(strHora);
      for (var i=0; i < horarioM.length; i+=2)
      {
        if(moment(hora).isBetween(horarioM[i],horarioM[i+1])){
        val=true;
        }
        check++;
        if((horacAct>tope && tope>10) || (horacAct<inicio && inicio>10))
        {
          fuerarangoval=true;
        }
      }
    }
    if(dia=="miercoles")
    {
      var strTope = horarioX[horarioX.length-1];
      var tope=Number(strTope);
      var strInicio = horarioX[0];
      var inicio=Number(strInicio);
      var strHora = hora;
      var horacAct=Number(strHora);
      for (var i=0; i < horarioX.length; i+=2)
      {
        if(moment(hora).isBetween(horarioX[i],horarioX[i+1])){
        val=true;
        }
        check++;
        if((horacAct>tope && tope>10) || (horacAct<inicio && inicio>10))
        {
          fuerarangoval=true;
        }
      }
    }
    if(dia=="jueves")
    {
      var strTope = horarioJ[horarioJ.length-1];
      var tope=Number(strTope);
      var strInicio = horarioJ[0];
      var inicio=Number(strInicio);
      var strHora = hora;
      var horacAct=Number(strHora);
      for (var i=0; i < horarioJ.length; i+=2)
      {
        if(moment(hora).isBetween(horarioJ[i],horarioJ[i+1])){
        val=true;
        }
        check++;
        if((horacAct>tope && tope>10) || (horacAct<inicio && inicio>10))
        {
          fuerarangoval=true;
        }
      }
    }
    if(dia=="viernes")
    {
      var strTope = horarioV[horarioV.length-1];
      var tope=Number(strTope);
      var strInicio = horarioV[0];
      var inicio=Number(strInicio);
      var strHora = hora;
      var horacAct=Number(strHora);
      for (var i=0; i < horarioV.length; i+=2)
      {
        if(moment(hora).isBetween(horarioV[i],horarioV[i+1])){
        val=true;
        }
        check++;
        if((horacAct>tope && tope>10) || (horacAct<inicio && inicio>10))
        {
          fuerarangoval=true;
        }
      }
    }
    if(dia=="sabado")
    {
      var strTope = horarioS[horarioS.length-1];
      var tope=Number(strTope);
      var strInicio = horarioS[0];
      var inicio=Number(strInicio);
      var strHora = hora;
      var horacAct=Number(strHora);
      for (var i=0; i < horarioS.length; i+=2)
      {
        if(moment(hora).isBetween(horarioS[i],horarioS[i+1])){
        val=true;
        }
        check++;
        if((horacAct>tope && tope>10) || (horacAct<inicio && inicio>10))
        {
          fuerarangoval=true;
        }
      }
    }


    if(val)
      estado=disp;
    if(!val && check>=1)
      estado=nodisp;
    if(fuerarangoval)
      estado=fuerarango;

      var d="";
     var l="";
     var m="";
     var x="";
     var j="";
     var v="";
     var s="";


     if(lunes.length>=1)
     {
       for (var i=0; i < (strL.length-1); i++)
        {
         l+=strL[i]+" / ";
        }
        l+=strL[i];
     }
     else
     {
      l="N/A";
     }

     if(martes.length>=1)
     {
       for (var i=0; i < (strM.length-1); i++)
        {
         m+=strM[i]+" / ";
        }
        m+=strM[i];
     }
     else
     {
      m="N/A";
     }

     if(miercoles.length>=1)
     {
       for (var i=0; i < (strX.length-1); i++)
        {
         x+=strX[i]+" / ";
        }
        x+=strX[i];
     }
     else
     {
      x="N/A";
     }

     if(jueves.length>=1)
     {
       for (var i=0; i < (strJ.length-1); i++)
        {
         j+=strJ[i]+" / ";
        }
        j+=strJ[i];
     }
     else
     {
      j="N/A";
     }

     if(viernes.length>=1)
     {
       for (var i=0; i < (strV.length-1); i++)
        {
         v+=strV[i]+" / ";
        }
        v+=strV[i];
     }
     else
     {
      v="N/A";
     }

     if(sabado.length>=1)
     {
       for (var i=0; i < (strS.length-1); i++)
        {
         s+=strS[i]+" / ";
        }
        s+=strS[i];
     }
     else
     {
      s="N/A";
     }
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

        <View style={{height: height/4}}>
        <View style={{flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center'}}>
          {nombre.map((item, key)=>(
            <Text key={key} style={styles.textCardName}>{item} </Text>)
          )}
        </View>
          <View style={{flex: 1, flexDirection: 'row'}}>
            <View style={{flex: 4, flexDirection: 'row', justifyContent: 'flex-start' , paddingLeft: 5}}>
                <Image source={{uri: this.searchPicture(this.rutaPics)}}
                  style={{
                    flex: 1,
                    alignSelf: 'stretch',
                    resizeMode: "contain",
                    height: height/5
                  }}
                />
            </View>
            <View style={{flex: 8, flexDirection: 'column', justifyContent: 'space-around', alignItems: 'center', paddingRight: 5}}>

              <Text style={styles.textCardAvailable}>{estado}</Text>
              <ButtonWithBackground
                color="#fff500"
                onPress={() => this.horarioBoton(l,m,x,j,v,s)}
              >
              <Text style={{fontFamily: 'SourceSansPro-SemiBold', fontSize: 14, color: '#535050'}}>Mostrar horario</Text>
              </ButtonWithBackground>
              <ButtonWithBackground
                color="#fff500"
                onPress={() => this.sendEmail()}
              >
              <Text style={{fontFamily: 'SourceSansPro-SemiBold', fontSize: 14, color: '#535050'}}>Mandar correo</Text>
              </ButtonWithBackground>
            </View>
          </View>

        </View>

        <ConditionalView style={{flex: 0, alignItems:'center'}} hide={!this.state.cubiCopy.length<1}>
          <ActivityIndicator size="large" color="#fff500" />
          <Text style={{fontFamily: 'SourceSansPro-SemiBold', fontSize: 16, color: '#535050'}}>Cargando información</Text>
        </ConditionalView>

        <ListView
          enableEmptySections={true}
          style={styles.listContainer}
          renderRow={this.renderRow.bind(this)}
          dataSource={this.state.dataSource}
        />

        <SearchButton
          color='red'
          onPress={() => this.props.navigation.navigate('Home')}
        >
        <Text style={{fontFamily: 'SourceSansPro-SemiBold', fontSize: 16, color: "white"}}>Terminar recorrido</Text>
        </SearchButton>

        <View style={{flex: 0, flexDirection: 'row'}}>
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
    backgroundColor: '#ffffff',
    justifyContent:'center',
    alignItems:'center'
  },
  content: {
      zIndex: 1
  },
  footerContainer: {
     alignItems:'center',
     justifyContent:'center',
     paddingHorizontal: 10,
     paddingVertical: 10,
     marginBottom: 10,
     borderRadius: 10,
     backgroundColor: '#F5F5F5'
  },
  drawerContainer: {
     flexDirection: 'row',
     alignItems:'center'
  },
  imageAvatar: {
      width: 50,
      height: 50,
      borderRadius: 25,
      marginRight: 5
  },
  listContainer: {
      marginHorizontal: 10
  },
  textCard: {
    color: '#535050',
    fontSize: 18,
    fontFamily: 'SourceSansPro-Regular'
  },
  textCardName: {
      color: '#535050',
      fontSize: 18,
      fontFamily: 'SourceSansPro-SemiBold'
  },
  textCardAvailable: {
    fontSize: 18,
    fontFamily: 'SourceSansPro-SemiBold'
  },
})
