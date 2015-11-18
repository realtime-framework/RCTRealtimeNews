'use strict';

var React = require('react-native');
var {
  Image,
  Text,
  TextInput,
  TouchableHighlight,
  View,
  StyleSheet
} = React;

var LoadingIndicator = require('../utils/loading');
var Alert = require('../utils/alert');
var AlertDialog = new Alert();

var LocalStorage = require("../utils/local_storage");
var localStorage = new LocalStorage();

var conf = require('../config/Config');
var Config = new conf();

var sprintf = require("sprintf-js").sprintf;

var linkModule = require('../utils/Linking');
var Linking = new linkModule();

var Login = React.createClass({

  getInitialState() {
    return {
      isLogged: null,
      logout: false,
      username: "",
      password: ""
    };
  },

  updateUsername : function(user){
    this.setState({username: user});
  },

  updatePassword : function(pass){
     this.setState({password: pass});
  },

   _login: function()
  {
    if (!this.state.username) {
      AlertDialog.show('Username empty');
    }
    else if(!this.state.password){
      AlertDialog.show('Password empty');
    }
    else{
      this.refs.loadingControl.startLoading();   
      fetch(sprintf(Config.CODEHOSTING_STORAGE_URL, Config.APPKEY, this.state.username,this.state.password, Config.ROLE), {method: 'post', 
        headers: {'Accept': 'application/json','Content-Type': 'application/json'}, body:''})
      .then((response) => response.text())
      .then((responseText) => {
        var response = JSON.parse(responseText);
        if(response.Error){
          AlertDialog.show('An error has occured: '+response.Error);
        }
        else{
          console.log(responseText);
          var token = JSON.parse(responseText)["token"];
          localStorage._onValueChange(token);
          this.props.login();          
        }
      })
      .catch((error) => {
        AlertDialog.show('An error has occured: '+ error.message);
      })
      .finally(() => {
        this.refs.loadingControl.stopLoading();
      });
    }    
  },

  _loginGuest: function(){
    this.refs.loadingControl.startLoading();   
      fetch(sprintf(Config.CODEHOSTING_STORAGE_URL, Config.APPKEY, 'demo','demo', Config.ROLE), {method: 'post', 
        headers: {'Accept': 'application/json','Content-Type': 'application/json'} ,body:''})
      .then((response) => response.text())
      .then((responseText) => {
        var response = JSON.parse(responseText);
        if(response.Error){
          AlertDialog.show('An error has occured: '+response.Error);
        }
        else{
          console.log(responseText);
          var token = JSON.parse(responseText)["token"];
          localStorage._onValueChange(token);
          this.props.login();          
        }
      })
      .catch((error) => {
        AlertDialog.show('An error has occured: '+ error.message);
      })
      .finally(() => {
        this.refs.loadingControl.stopLoading();
      });
  },

  _guest: function()
  {
    this._loginGuest();
  },

  _register: function()
  {
    Linking.openURL("https://accounts.realtime.co/signup/");
  },

  render: function(){
    return(
      <View style={styles.container}>
          <Image
            source={require('../realtimelogo.png')}
          />
          <TextInput
            style={styles.textField}
            onChangeText={(text) => this.updateUsername(text)}
            placeholder="email"
          />
          <TextInput
            style={styles.textField}
            onChangeText={(text) => this.updatePassword(text)}
            placeholder="password"
            secureTextEntry = {true}
          />

          <TouchableHighlight 
            style={styles.button}
            onPress={this._login}>
            <Text style={styles.loginText}>Login</Text>
          </TouchableHighlight>                                 

          <View style={styles.container}/>

          <LoadingIndicator ref="loadingControl" />

          <View style={styles.container}/>

          <TouchableHighlight 
            onPress={this._guest}>
            <Text style={styles.clearButton}>Enter as guest</Text>
          </TouchableHighlight>


          <TouchableHighlight       
            onPress={this._register}>
            <Text style={styles.clearButton}>Register for Realtime account</Text>
          </TouchableHighlight>

      </View>
    );
  }
});

var styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#E6E6E6'
  },
  textField: {
    justifyContent: 'space-around',
    marginLeft: 30,
    marginRight: 30,
    marginBottom: 5,
    borderRadius: 7,
    paddingLeft: 5,
    height: 30, 
    borderColor: 'lightgray', 
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    fontSize: 14,
  },
  loginText:{
    color:'#FFFFFF',
  },
  button:{
    position: 'absolute',
    left: 30,
    right: 30,
    justifyContent:'space-around',
    borderRadius: 7,
    height: 40,
    alignItems: 'center',
    backgroundColor: '#3399FF',
  },
  clearButton:{
    color:'#3399FF',
    marginBottom:20,
  },
});

module.exports = Login;