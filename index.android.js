/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 */
'use strict';

var React = require('react-native');
var {
  AppRegistry,
  BackAndroid,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableHighlight,
  View,
  AsyncStorage,
  Navigator,
  ToolbarAndroid
} = React;

//var MD5 = require("crypto-js/md5");
var SplashScreen = require("./views/splashscreen");
var LoginScreen = require("./views/login");
var DrawerScreen = require('react-native-drawer');
var DrawerMenuScreen = require('./views/DrawerMenu');
var ListScreen = require('./views/ListScreen');
var DrawerModuleScreen = require('./views/DrawerScreen');

var LocalStorage = require("./utils/local_storage");
var localStorage = new LocalStorage();

var TimerMixin = require('react-timer-mixin');

var EventEmitter = require('RCTDeviceEventEmitter');

var Subscribable = require('Subscribable');
var RCTDeviceEventEmitter = require('RCTDeviceEventEmitter');

var confModule = require('./config/Config');
var Config = new confModule();

var module = require('RCTRealtimeMessagingAndroid');
var RCTRealtimeMessaging = new module();

var moduleStorage = require('./controllers/StorageController'); 

var WebViewScreen = require('./views/WebView');
var _navigator;

BackAndroid.addEventListener('hardwareBackPress', () => {
  if (_navigator && _navigator.getCurrentRoutes().length > 1) {
    _navigator.pop();
    return true;
  }
  return false;
});

var RouteMapper = function(route, navigationOperations, onComponentRef) {
  _navigator = navigationOperations;
  if (route.title === 'Realtime News') {
    return (
      <View style={{flex: 1}}>
        <DrawerModuleScreen navigator={_navigator}/>
      </View>
    );
  } 
  else if(route.title === 'webview'){
    return(
      <WebViewScreen url={route.url} body={route.body}/>
    );
  }
};

var RealtimeNews = React.createClass({

  mixins: [TimerMixin, Subscribable.Mixin],

  componentDidMount: function() {
    this.setTimeout(
      () => {
        localStorage._getToken(this.updateState);
      },
      2000
    );
    this.addListenerOn(RCTDeviceEventEmitter, Config.STORAGE_NOTIFICATIONS, this.subscribeNotification);
    RCTRealtimeMessaging.RTPushNotificationListener(this.onNotification);
    this.addListenerOn(RCTDeviceEventEmitter, Config.LOGOUT, this.logout);
  },

  getInitialState() {
    return {
      isLogged: null,
      username: "",
      password: "",
      selectedTab: 'recents'
    };
  },

  onNotification: function(data)
  { 
    var jsonData = JSON.stringify(data);
    console.log("Received notification: " + jsonData);  
    var response = JSON.parse(jsonData).payload;
    console.log("Response", response);
    var url = response["URL"];
    console.log("URL: " + url);
    var body = response["Body"];
    console.log("Body: " + body);
    if(this.refs.nav){
      EventEmitter.emit(Config.STORAGE_REFRESH, { itemUpdated: response });
      this.refs.nav.push({ title: 'webview', url: url, body: body });
    }
  },
  
  updateState: function(result){
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
    this.setState({isLogged: false});
  },

  createDrawerMenu: function () {
    return (<DrawerMenuScreen closeDrawer={() => {this.refs.drawer.close()}} logout={() => {localStorage._deleteToken(this.logout)}}/>);
  },

  subscribeNotification: function(){
    console.log("susbcribeNotifications");
    

    RCTRealtimeMessaging.RTConnect(
    {
      appKey:Config.APPKEY,
      token:Config.TOKEN,
      connectionMetadata:Config.CONNECTION_METADATA,
      clusterUrl:Config.CLUSTER_URL,
      projectId: Config.PROJECT_ID
    });

    RCTRealtimeMessaging.RTEventListener("onConnected",function(){
      console.log('Connected to Realtime Messaging');
      RCTRealtimeMessaging.RTSubscribeWithNotifications(Config.NOTIFICATIONS_CHANNEL, true);
    });

    RCTRealtimeMessaging.RTEventListener("onSubscribed", function(subscribedEvent){
      console.log('Subscribed channel: ' + subscribedEvent.channel);
      RCTRealtimeMessaging.RTDisconnect();
    }),

    RCTRealtimeMessaging.RTEventListener("onDisconnect", function(){
      console.log('Disconnected from Realtime Messaging');
    });

    RCTRealtimeMessaging.RTEventListener("onException",function(exceptionEvent){
      console.log("Exception:" + exceptionEvent.error);
    });
  },


  render: function() {
    if(this.state.isLogged === false){
      return (
        <LoginScreen login={() => {this.updateState(true)}}/>      
      );
    }
    else if(this.state.isLogged){
      return(
        <View style={styles.navigator}>
          <ToolbarAndroid
              onIconClicked={() => EventEmitter.emit('DrawerMenu_TogglePanel')}
              navIcon={require('./ic_menu_black_24dp.png')}
              title="RealtimeNews"
              style={{backgroundColor: '#e9eaed',height: 56}} />
          <Navigator
            ref="nav"
            initialRoute={{title: 'Realtime News'}}
            renderScene={RouteMapper}
          />
        </View>
      );
    }
    
    return (
      <SplashScreen />
    );
  }
});

var styles = StyleSheet.create({
  navigator:{
    flex:1
  }
});

AppRegistry.registerComponent('RealtimeNews', () => RealtimeNews);
