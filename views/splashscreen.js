'use strict';

var React = require('react-native');
var {
  Image,  
  View,
  StyleSheet
} = React;

var LocalStorage = require("../utils/local_storage");
var localStorage = new LocalStorage();

var sprintf = require("sprintf-js").sprintf;

var confModule = require('../config/Config');
var Config = new confModule();

var SplashScreen = React.createClass({

  componentDidMount: function(){
    fetch(sprintf(Config.CODEHOSTING_FIRST_CONTENT_DATE, Config.APPKEY))
      .then((response) => response.text())
      .then((responseText) => {
        console.log(responseText);
        var firstMonthYear = JSON.parse(responseText)["firstMonthYear"];
        localStorage._setFirstContentMonthYear(firstMonthYear);
      })
      .catch((error) => {
        console.log(error);
      })
        .finally(() => {
          
      });
  },

  render: function() {
    return (
      <View style={styles.splashScreen}>
          <Image 
            source={require('../azure.png')}/>
      </View>
    );
  }
});

var styles = StyleSheet.create({
  splashScreen:{
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center'
  }
});

module.exports = SplashScreen;
