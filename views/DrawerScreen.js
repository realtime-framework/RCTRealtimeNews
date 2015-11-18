'use strict';

var React = require('react-native');
var {
  Image,
  Text,
  TextInput,
  TouchableHighlight,
  View,
  Platform
} = React;


var DrawerScreen = require('react-native-drawer');
var DrawerMenuScreen = require('./DrawerMenu');
var ListScreen = require('./ListScreen');

var LocalStorage = require("../utils/local_storage");
var localStorage = new LocalStorage();

var TimerMixin = require('react-timer-mixin');

var moduleStorage = require('../controllers/StorageController'); 

var WebViewScreen = require('./WebView');

var Subscribable = require('Subscribable');
var RCTDeviceEventEmitter = require('RCTDeviceEventEmitter');

var confModule = require('../config/Config');
var Config = new confModule();

var DrawerModuleScreen = React.createClass({

  mixins: [TimerMixin,Subscribable.Mixin],

  componentDidMount: function() {
    this.setTimeout(
      () => {
        localStorage._getToken(this.updateState);
      },
      2000
    );
    var instance1 = moduleStorage.getInstance();
    var instance2 = moduleStorage.getInstance();
 
    console.log("Same instance? " + (instance1 === instance2));

    this.addListenerOn(RCTDeviceEventEmitter, 'DrawerMenu_TogglePanel', this.togglePanel);
    
  },

  getInitialState() {
    return {
      isLogged: null,
      username: "",
      password: "",
      selectedTab: 'recents'
    };
  },

  
  updateState : function(result){
     if(result){
        this.setState({isLogged: true});
     }
     else{
        this.setState({isLogged: false});
     }
  },

  togglePanel: function(){
    if(this.refs.drawer._open){
      this.refs.drawer.close();
    }
    else{
      this.refs.drawer.open();
    }
  },

  logout: function(){
    var instance = moduleStorage.getInstance();
    instance.resetStorage();
    RCTDeviceEventEmitter.emit(Config.LOGOUT);
  },

  createDrawerMenu: function () {
    return (<DrawerMenuScreen closeDrawer={() => {this.refs.drawer.close()}} logout={() => {localStorage._deleteToken(this.logout)}}/>);
  },

  navigate: function(url,body){
    if(Platform.OS === 'ios'){
        this.props.navigator.push({
        component: WebViewScreen,
        passProps: { url: url, body: body }
      });
    }
    else{
      this.props.navigator.push({ title: 'webview', url: url, body: body });
    }
    
  },

  render: function() {
    return(
      <DrawerScreen
        ref="drawer"
        type="overlay"
        openDrawerOffset={0.6}
        panCloseMask={1}
        styles={{
        drawer: {
            shadowColor: "#000000",
            shadowOpacity: 0.8,
            shadowRadius: 0,
          }
        }}
        tweenHandler={(ratio) => {
          return {
            drawer: { shadowRadius: Math.min(ratio*5*5, 5) },
            main: { opacity:(2-ratio)/2 },
          }
        }}
        content={this.createDrawerMenu()}>
        <ListScreen navigate={(url,body) => {this.navigate(url,body)}}/>
      </DrawerScreen>
    );
  }
});

module.exports = DrawerModuleScreen;
