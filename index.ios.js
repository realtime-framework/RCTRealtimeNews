/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 */
'use strict';

var React = require('react-native');
var {
  AppRegistry,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableHighlight,
  View,
  AsyncStorage,
  NavigatorIOS,
  ActivityIndicatorIOS,
  LinkingIOS,
  TabBarIOS
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

var module = require('RCTRealtimeMessagingIOS');
var RCTRealtimeMessaging = new module();

var moduleStorage = require('./controllers/StorageController'); 

var WebViewScreen = require('./views/WebView');

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
    var response = JSON.parse(jsonData);
    console.log("Response", response);
    var url = response["URL"];
    console.log("URL: " + url);
    var body = response["Body"];
    console.log("Body: " + body);
    if(this.refs.nav){
      EventEmitter.emit(Config.STORAGE_REFRESH, { itemUpdated: response });
      this.refs.nav.push({
        component: WebViewScreen,
        passProps: { url: url, body: body }
      });
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
      clusterUrl:Config.CLUSTER_URL
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
          <NavigatorIOS
            ref="nav"
            style={styles.navigator}
            initialRoute={{
              title: 'Realtime News',
              backButtonTitle: 'Back',
              component: DrawerModuleScreen,
              onLeftButtonPress: () => 
              {
                EventEmitter.emit('DrawerMenu_TogglePanel');
              },
              leftButtonIcon: require('./menu.png')
        }}/>
        // <DrawerScreen
        //   ref="drawer"
        //   openDrawerOffset={50}
        //   content={this.createDrawerMenu()}>
        //   <NavigatorIOS
        //     ref="nav"
        //     style={styles.navigator}
        //     initialRoute={{
        //       title: 'Realtime News',
        //       backButtonTitle: 'Back',
        //       component: ListScreen,
        //       onLeftButtonPress: () => 
        //       {
        //         this.togglePanel();
        //       },
        //       leftButtonIcon: require('image!menu')
        // }}/>
        // </DrawerScreen>
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
